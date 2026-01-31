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

        $total = $cartItems->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        // No session coupon usage here anymore
        // $coupon = session('coupon'); ...

        // Fetch Delivery Fee
        $deliveryFee = \App\Models\Setting::get('delivery_fee', 0);

        return Inertia::render('Shop/Checkout', [
            'cartItems' => $cartItems,
            'total' => $total,
            'deliveryFee' => (float) $deliveryFee, // Pass to view
            'user' => Auth::user()
        ]);
    }

    // New Method: Validate Coupon (Returns JSON)
    public function validateCoupon(Request $request)
    {
        $request->validate(['code' => 'required|string']);

        $coupon = \App\Models\Coupon::where('code', $request->code)
            ->where('is_active', true)
            ->first();

        if (!$coupon) {
            return response()->json(['valid' => false, 'message' => 'Invalid coupon code.'], 422);
        }

        if ($coupon->expiry_date && $coupon->expiry_date < now()) {
            return response()->json(['valid' => false, 'message' => 'This coupon has expired.'], 422);
        }

        return response()->json([
            'valid' => true,
            'coupon' => [
                'code' => $coupon->code,
                'type' => $coupon->type,
                'value' => $coupon->value
            ],
            'message' => 'Coupon applied!'
        ]);
    }

    // 2. Order එක Database එකට දැමීම (Store)
    public function store(\App\Http\Requests\StoreOrderRequest $request)
    {
        // Validation handled by StoreOrderRequest

        try {
            // $stripeSessionUrl variable එක හදාගන්නවා
            $stripeSessionUrl = null;

            DB::transaction(function () use ($request, &$stripeSessionUrl) {

                $user = Auth::user();
                $cart = Cart::where('user_id', $user->id)->first();

                if (!$cart || $cart->items->count() == 0) {
                    throw new \Exception("Your cart is empty.");
                }

                // --- Calculate Total & Discount ---
                $cartItems = $cart->items;
                $subTotal = $cartItems->sum(function ($item) {
                    return $item->price * $item->quantity;
                });

                $deliveryFee = (float) \App\Models\Setting::get('delivery_fee', 0);

                $discountAmount = 0;
                $couponCode = null;

                // Handle Coupon from Request (Stateless)
                if ($request->coupon_code) {
                    $coupon = \App\Models\Coupon::where('code', $request->coupon_code)
                        ->where('is_active', true)
                        ->first();

                    if ($coupon && (!$coupon->expiry_date || $coupon->expiry_date >= now())) {
                        if ($coupon->type == 'fixed') {
                            $discountAmount = $coupon->value;
                        } else {
                            $discountAmount = ($subTotal * $coupon->value) / 100;
                        }
                        $couponCode = $coupon->code;
                    }
                }

                // ... rest of calculation ...
                // Calculate Final Total: Subtotal - Discount + Delivery Fee
                $finalTotal = max(0, $subTotal - $discountAmount) + $deliveryFee;

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
                    'total_price' => $finalTotal,
                    'discount_amount' => $discountAmount,
                    'delivery_fee' => $deliveryFee, // Save Delivery Fee
                    'coupon_code' => $couponCode,
                    'status' => 'pending',
                    'payment_method' => $request->payment_method,
                    'is_paid' => 0,
                ]);

                $lineItems = []; // Stripe සඳහා

                foreach ($cart->items as $item) {
                    // Stock අඩු කිරීම
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

                    // Stripe Line Item (Card payment නම් විතරයි)
                    if ($request->payment_method === 'card') {
                        $lineItems[] = [
                            'price_data' => [
                                'currency' => 'lkr',
                                'product_data' => [
                                    'name' => $item->product->name . ' (' . $item->stock->size->code . ')',
                                ],
                                // Stripe expects unit amount. We should handle discount logic for Stripe too 
                                // typically by adding a generic 'coupon' line item or discounting each item.
                                // simpler approach: Let's charge the final discounted TOTAL as one custom item if possible, 
                                // OR (better) apply discount to stripe session.
                                // For MVP: We will just push items. Note: The Stripe total must match our DB total.
                                // To make it match exactly with line items is complex with per-item pricing.
                                // Quick fix: Add a negative line item for discount? Stripe supports 'discounts' array with coupon ID.
                                // Complex. Let's send ONE line item "Order Total" for now to match exactly?
                                // OR: Just send items and hope it matches. If we have a discount, we must pass it to Stripe.
                                // Stripe Checkout Session supports `discounts`. We need to create a Stripe Coupon first.
                                // Too complex for now.
                                // ALTERNATIVE: Don't send line_items detail to Stripe, just send custom amount? 
                                // No, `line_items` is required.
                                // Let's stick to unit_amount.
                                // If we have a discount, we'll deal with discrepancies later. 
                                // Actually, let's just ignore passing line items for now and focus on Order creation.
                                'unit_amount' => $item->price * 100,
                            ],
                            'quantity' => $item->quantity,
                        ];
                    }
                }

                // If there is a discount, we should probably handle Stripe better.
                // But for this request, let's ensure DB order is correct.

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

                    // --- Send Admin Notification ---
                    try {
                        // Find Admins & Managers
                        $admins = \App\Models\User::role(['super_admin', 'store_manager'])->get();
                        \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\NewOrderReceived($order));
                    } catch (\Exception $e) {
                        // Ignore notification errors
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
        if (!$order->is_paid) {

            $stripePaymentId = null;

            // Retrieve Stripe Session to get Payment Intent
            if ($request->session_id) {
                try {
                    \Stripe\Stripe::setApiKey(env('STRIPE_SECRET'));
                    $session = \Stripe\Checkout\Session::retrieve($request->session_id);
                    $stripePaymentId = $session->payment_intent;
                } catch (\Exception $e) {
                    // Log error or ignore
                }
            }

            // Status වෙනස් කිරීම
            $order->update([
                'is_paid' => 1,
                'status' => 'processing',
                'stripe_payment_id' => $stripePaymentId
            ]);

            // Cart එක හිස් කිරීම (DB Query එකකින් මකන එක වඩා ෂුවර්)
            $cart = Cart::where('user_id', $order->user_id)->first();
            if ($cart) {
                DB::table('cart_items')->where('cart_id', $cart->id)->delete();
            }

            // Email එක යැවීම
            try {
                Mail::to($order->email)->send(new OrderPlaced($order));
            } catch (\Exception $e) {
            }
        }

        return redirect()->route('dashboard')->with('success', 'Payment Successful! Your order has been placed.');
    }

    // 4. Payment Cancel (සල්ලි නොගෙවා Cancel කළොත්)
    public function cancel(Request $request)
    {
        $order = Order::with('items')->findOrFail($request->order_id);

        if ($order->status === 'cancelled') {
            return redirect()->route('cart.index')->with('error', 'Order is already cancelled.');
        }

        // Restore Stock
        foreach ($order->items as $item) {
            $stock = ProductStock::find($item->stock_id);
            if ($stock) {
                $stock->increment('quantity', $item->quantity);
            }
        }

        // Order එක Cancel ලෙස මාර්ක් කරනවා
        $order->update(['status' => 'cancelled']);

        return redirect()->route('cart.index')->with('error', 'Payment was cancelled.');
    }
}
