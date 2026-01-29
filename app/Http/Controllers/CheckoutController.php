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

class CheckoutController extends Controller
{

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

        DB::transaction(function () use ($request) {

            $user = Auth::user();
            $cart = Cart::where('user_id', $user->id)->first();

            if (!$cart || $cart->items->count() == 0) {

                throw new \Exception("Your cart is empty.");
            }


            $order = Order::create([
                'user_id' => $user->id,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'city' => $request->city,
                'postal_code' => $request->postal_code,
                'total_price' => 0,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
            ]);

            $totalPrice = 0;

            foreach ($cart->items as $item) {

                $stock = ProductStock::lockForUpdate()->find($item->product_stock_id);


                if (!$stock || $stock->quantity < $item->quantity) {
                    throw new \Exception("Sorry, " . $item->product->name . " is out of stock (Requested: " . $item->quantity . ", Available: " . ($stock ? $stock->quantity : 0) . ")");
                }

                $stock->decrement('quantity', $item->quantity);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'color_name' => $item->stock->color->name,
                    'size_name' => $item->stock->size->code,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'total' => $item->price * $item->quantity,
                ]);

                $totalPrice += ($item->price * $item->quantity);
            }

            $order->update(['total_price' => $totalPrice]);
            $cart->items()->delete();

            Mail::to($request->email)->send(mailable: new OrderPlaced($order));

        });


        return redirect()->route('dashboard')->with('success', 'Order placed successfully!');

    } catch (\Exception $e) {

        return redirect()->back()->with('error', $e->getMessage());
    }
}
}
