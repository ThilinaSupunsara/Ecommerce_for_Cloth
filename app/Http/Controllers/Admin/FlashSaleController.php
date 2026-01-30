<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FlashSaleController extends Controller
{
    public function index()
    {
        $flashSales = FlashSale::with('products')->latest()->get(); // Eager load products
        $products = \App\Models\Product::select('id', 'name')->get(); // Get product list for selector

        return Inertia::render('Admin/FlashSales/Index', [
            'flashSales' => $flashSales,
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'discount_percentage' => 'required|integer|min:1|max:100',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'products' => 'nullable|array', // Optional: if empty, maybe applies to none or logic needs define? Let's say none.
            'products.*' => 'exists:products,id'
        ]);

        $flashSale = FlashSale::create($request->except('products'));

        if ($request->has('products')) {
            $flashSale->products()->sync($request->products);
        }

        return back()->with('success', 'Flash Sale created successfully.');
    }

    public function update(Request $request, FlashSale $flashSale)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'discount_percentage' => 'required|integer|min:1|max:100',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
        ]);

        $flashSale->update($request->except('products'));
        // If we want to support updating products, we need to pass them in request.
        // For now, assuming basic update doesn't change products unless requested.
        // Let's add support just in case frontend sends it.
        if ($request->has('products')) {
            $flashSale->products()->sync($request->products);
        }

        return back()->with('success', 'Flash Sale updated successfully.');
    }

    public function destroy(FlashSale $flashSale)
    {
        $flashSale->delete();
        return back()->with('success', 'Flash Sale deleted successfully.');
    }

    public function toggle(FlashSale $flashSale)
    {
        $flashSale->update(['is_active' => !$flashSale->is_active]);
        return back()->with('success', 'Flash Sale status updated.');
    }
}
