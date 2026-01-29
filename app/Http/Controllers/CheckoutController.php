<?php

namespace App\Http\Controllers;

use App\Mail\OrderPlaced;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class CheckoutController extends Controller
{
    // 1. Checkout Page එක පෙන්වීම
    public function create()
    {
        $cart = Cart::where('user_id', Auth::id())->first();

        if (!$cart || $cart->items->count() == 0) {
            return redirect()->route('shop.index')->with('error', 'Your cart is empty.');
        }

        // Cart Items සමග Product සහ Stock විස්තර ගන්නවා
        $cartItems = $cart->items()->with(['product', 'stock.color', 'stock.size'])->get();

        $total = $cartItems->sum(function($item) {
            return $item->price * $item->quantity;
        });

        return Inertia::render('Shop/Checkout', [
            'cartItems' => $cartItems,
            'total' => $total,
            'user' => Auth::user()
        ]);
    }

    // 2. Order එක Database එකට දැමීම (Store)
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'city' => 'required|string',
            'postal_code' => 'nullable|string',
            'payment_method' => 'required|in:cod,card',
        ]);

        try {
            // $stripeSessionUrl variable එක හදාගන්නවා (Card payment එකක් නම් පසුව පාවිච්චි කරන්න)
            $stripeSessionUrl = null;

            DB::transaction(function () use ($request, &$stripeSessionUrl) {

                $user = Auth::user();
                $cart = Cart::where('user_id', $user->id)->first();

                if (!$cart || $cart->items->count() == 0) {
                    throw new \Exception("Your cart is empty.");
                }

                // --- Order එක හදනවා (Pending විදියට) ---
                $order = Order::create([
                    'user_id' => $user->id,
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'address' => $request->address,
                    'city' => $request->city,
                    'postal_code' => $request->postal_code,
                    'total_price' => 0, // පසුව Update වෙනවා
                    'status' => 'pending',
                    'payment_method' => $request->payment_method,
                    'is_paid' => 0,
                ]);

                $totalPrice = 0;
                $lineItems = []; // Stripe සඳහා

                foreach ($cart->items as $item) {
                    // Stock අඩු කිරීම (Lock for update මගින් එකවර දෙන්නෙක්ට ඕඩර් දාන්න බැරි කරයි)
                    // Note: ඔයාගේ DB Column එක 'stock_id' ද 'product_stock_id' ද කියා බලන්න. සාමාන්‍යයෙන් 'stock_id'.
                    // මම මෙතන $item->stock_id පාවිච්චි කරනවා.
                    // 👇 stock_id වෙනුවට product_stock_id පාවිච්චි කරන්න
                    $stock = ProductStock::lockForUpdate()->find($item->product_stock_id);

                    if (!$stock || $stock->quantity < $item->quantity) {
                        throw new \Exception("Sorry, " . $item->product->name . " is out of stock.");
                    }

                    $stock->decrement('quantity', $item->quantity);

                    // Order Item එක සේව් කිරීම
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item->product_id,
                        'stock_id' => $item->product_stock_id,
                        'product_name' => $item->product->name,
                        'color_name' => $item->stock->color->name,
                        'size_name' => $item->stock->size->code,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'total' => $item->price * $item->quantity,
                    ]);

                    $totalPrice += ($item->price * $item->quantity);

                    // Stripe Line Item (Card payment නම් විතරයි)
                    if ($request->payment_method === 'card') {
                        $lineItems[] = [
                            'price_data' => [
                                'currency' => 'lkr',
                                'product_data' => [
                                    'name' => $item->product->name . ' (' . $item->stock->size->code . ')',
                                ],
                                'unit_amount' => $item->price * 100, // ශත බවට පත් කිරීම
                            ],
                            'quantity' => $item->quantity,
                        ];
                    }
                }

                // Order Total එක Update කිරීම
                $order->update(['total_price' => $totalPrice]);

                // --- Payment Method එක අනුව තීරණය කිරීම ---

                // CASE 1: COD (Cash On Delivery)
                if ($request->payment_method === 'cod') {
                    $cart->items()->delete(); // Cart එක හිස් කරනවා
                    // Email එක යවනවා
                    try {
                        Mail::to($request->email)->send(new OrderPlaced($order));
                    } catch (\Exception $e) {
                        // Email අවුල් ගියත් Order එක නවත්තන්න එපා
                    }
                }

                // CASE 2: Card Payment (Stripe)
                else if ($request->payment_method === 'card') {
                    Stripe::setApiKey(env('STRIPE_SECRET'));

                    $session = Session::create([
                        'payment_method_types' => ['card'],
                        'line_items' => $lineItems,
                        'mode' => 'payment',
                        'success_url' => route('checkout.success') . '?session_id={CHECKOUT_SESSION_ID}&order_id=' . $order->id,
                        'cancel_url' => route('checkout.cancel', ['order_id' => $order->id]),
                    ]);

                    $stripeSessionUrl = $session->url;
                    // Note: Card Payment වලදී මෙතන Cart එක Delete කරන්නේ නෑ.
                    // Success වුනාම තමයි Delete කරන්නේ.
                }

            });

            // Transaction ඉවරයි. දැන් Redirect කරනවා.

            if ($request->payment_method === 'card' && $stripeSessionUrl) {
                return Inertia::location($stripeSessionUrl); // Stripe එකට යවනවා
            }

            return redirect()->route('dashboard')->with('success', 'Order placed successfully!');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    // 3. Payment Success (Stripe වලින් සල්ලි කැපුනම එන තැන)
    public function success(Request $request)
{
    $order = Order::findOrFail($request->order_id);

    // payment_status වෙනුවට is_paid (Boolean) පරීක්ෂා කිරීම
    // (! $order->is_paid කියන්නේ is_paid == false ද කියල බලන එක)
    if (! $order->is_paid) {

        // Status වෙනස් කිරීම
        $order->update([
            'is_paid' => 1,
            'status' => 'processing'
        ]);

        // Cart එක හිස් කිරීම (DB Query එකකින් මකන එක වඩා ෂුවර්)
        $cart = Cart::where('user_id', $order->user_id)->first();
        if ($cart) {
            DB::table('cart_items')->where('cart_id', $cart->id)->delete();
        }

        // Email එක යැවීම
        try {
            Mail::to($order->email)->send(new OrderPlaced($order));
        } catch (\Exception $e) {}
    }

    return redirect()->route('dashboard')->with('success', 'Payment Successful! Your order has been placed.');
}

    // 4. Payment Cancel (සල්ලි නොගෙවා Cancel කළොත්)
    public function cancel(Request $request)
    {
        $order = Order::findOrFail($request->order_id);

        // Order එක Cancel ලෙස මාර්ක් කරනවා
        // (අවශ්‍ය නම් Stock එක ආපහු වැඩි කරන Logic එකක් මෙතන ලියන්න පුළුවන්)
        $order->update(['status' => 'cancelled']);

        return redirect()->route('cart.index')->with('error', 'Payment was cancelled.');
    }
}
