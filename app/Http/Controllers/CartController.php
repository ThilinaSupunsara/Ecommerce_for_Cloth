<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        $cart = $this->getCart();

        if (!$cart) {
            return Inertia::render('Shop/Cart', ['cartItems' => []]);
        }


        $cartItems = $cart->items()->with(['product', 'stock.color', 'stock.size'])->get();

        return Inertia::render('Shop/Cart', [
            'cartItems' => $cartItems
        ]);
    }


    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'color_id' => 'required',
            'size_id' => 'required',
            'quantity' => 'required|integer|min:1'
        ]);


        $stock = ProductStock::where('product_id', $request->product_id)
            ->where('color_id', $request->color_id)
            ->where('size_id', $request->size_id)
            ->first();

        if (!$stock) {
            return back()->withErrors(['message' => 'Selected variation is unavailable.']);
        }

        if ($stock->quantity < $request->quantity) {
            return back()->withErrors(['message' => 'Not enough stock available.']);
        }


        $cart = $this->getCart(true);


        $existingItem = $cart->items()->where('product_stock_id', $stock->id)->first();

        if ($existingItem) {

            $existingItem->quantity += $request->quantity;
            $existingItem->save();
        } else {

            $cart->items()->create([
                'product_id' => $request->product_id,
                'product_stock_id' => $stock->id,
                'quantity' => $request->quantity,
                'price' => $stock->price ?? Product::find($request->product_id)->base_price,
            ]);
        }

        return redirect()->route('cart.index')->with('success', 'Item added to cart!');
    }


    public function destroy(CartItem $cartItem)
    {
        $cartItem->delete();
        return back()->with('success', 'Item removed.');
    }


    private function getCart($createInfo = false)
    {
        $user = Auth::user();

        if ($user) {
            $cart = Cart::where('user_id', $user->id)->first();
            if (!$cart && $createInfo) {
                $cart = Cart::create(['user_id' => $user->id]);
            }
        } else {
            $sessionId = Session::getId();
            $cart = Cart::where('session_id', $sessionId)->first();
            if (!$cart && $createInfo) {
                $cart = Cart::create(['session_id' => $sessionId]);
            }
        }

        return $cart;
    }
}
