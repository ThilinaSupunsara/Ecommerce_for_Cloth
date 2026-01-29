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
    // 1. Checkout Page
    public function create()
    {
        $cart = Cart::where('user_id', Auth::id())->first();

        if (!$cart || $cart->items->count() == 0) {
            return redirect()->route('shop.index')->with('error', 'Your cart is empty.');
        }

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

    // 2. Store Order
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
            $stripeSessionUrl = null;

            DB::transaction(function () use ($request, &$stripeSessionUrl) {

                $user = Auth::user();
                $cart = Cart::where('user_id', $user->id)->first();

                if (!$cart || $cart->items->count() == 0) {
                    throw new \Exception("Your cart is empty.");
                }

                // Create Order
                $order = Order::create([
                    'user_id' => $user->id,
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'address' => $request->address,
                    'city' => $request->city,
                    'postal_code' => $request->postal_code,
                    'total_price' => 0, // Updated later
                    'status' => 'pending',
                    'payment_method' => $request->payment_method,
                    'is_paid' => false, // Default false
                ]);

                $totalPrice = 0;
                $lineItems = []; // For Stripe

                foreach ($cart->items as $item) {
                    // Check Stock
                    $stock = ProductStock::lockForUpdate()->find($item->product_stock_id);

                    if (!$stock || $stock->quantity < $item->quantity) {
                        throw new \Exception("Sorry, " . $item->product->name . " is out of stock.");
                    }

                    // Decrement Stock
                    $stock->decrement('quantity', $item->quantity);

                    // Create Order Item
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item->product_id,
                        'stock_id' => $item->product_stock_id, // Saved for reference
                        'product_name' => $item->product->name,
                        'color_name' => $item->stock->color->name,
                        'size_name' => $item->stock->size->code,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'total' => $item->price * $item->quantity,
                    ]);

                    $totalPrice += ($item->price * $item->quantity);

                    // Prepare Stripe Items
                    if ($request->payment_method === 'card') {
                        $lineItems[] = [
                            'price_data' => [
                                'currency' => 'lkr',
                                'product_data' => [
                                    'name' => $item->product->name . ' (' . $item->stock->size->code . ')',
                                ],
                                'unit_amount' => $item->price * 100,
                            ],
                            'quantity' => $item->quantity,
                        ];
                    }
                }

                // Update Order Total
                $order->update(['total_price' => $totalPrice]);

                // Handle COD
                if ($request->payment_method === 'cod') {
                    DB::table('cart_items')->where('cart_id', $cart->id)->delete(); // Empty Cart
                    try {
                        Mail::to($request->email)->send(new OrderPlaced($order));
                    } catch (\Exception $e) {}
                }
                // Handle Card (Stripe)
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
                }
            });

            // Redirect to Stripe if applicable
            if ($request->payment_method === 'card' && $stripeSessionUrl) {
                return Inertia::location($stripeSessionUrl);
            }

            return redirect()->route('dashboard')->with('success', 'Order placed successfully!');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    // 3. Payment Success
    public function success(Request $request)
    {
        $order = Order::findOrFail($request->order_id);

        if (!$order->is_paid) {
            $order->update([
                'is_paid' => true,
                
            ]);

            // Empty Cart
            $cart = Cart::where('user_id', $order->user_id)->first();
            if ($cart) {
                DB::table('cart_items')->where('cart_id', $cart->id)->delete();
            }

            // Send Email
            try {
                Mail::to($order->email)->send(new OrderPlaced($order));
            } catch (\Exception $e) {}
        }

        return redirect()->route('dashboard')->with('success', 'Payment Successful! Your order has been placed.');
    }

    // 4. Payment Cancel
    public function cancel(Request $request)
    {
        $order = Order::findOrFail($request->order_id);
        $order->update(['status' => 'cancelled']);
        return redirect()->route('cart.index')->with('error', 'Payment was cancelled.');
    }
}
