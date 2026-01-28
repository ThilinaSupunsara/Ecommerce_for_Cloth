<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductStock;
use Illuminate\Http\Request;

class ProductStockController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $request->validate([
            'color_id' => 'required|exists:colors,id',
            'size_id' => 'required|exists:sizes,id',
            'quantity' => 'required|integer|min:1',
            'price' => 'nullable|numeric|min:0',
        ]);


        $stock = ProductStock::where('product_id', $product->id)
            ->where('color_id', $request->color_id)
            ->where('size_id', $request->size_id)
            ->first();

        if ($stock) {

            $stock->quantity += $request->quantity;

            if ($request->price) $stock->price = $request->price;
            $stock->save();
        } else {

            ProductStock::create([
                'product_id' => $product->id,
                'color_id' => $request->color_id,
                'size_id' => $request->size_id,
                'quantity' => $request->quantity,
                'price' => $request->price,
            ]);
        }

        return redirect()->back()->with('success', 'Stock updated successfully.');
    }


    public function destroy(ProductStock $productStock)
    {
        $productStock->delete();
        return redirect()->back()->with('success', 'Stock item deleted.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:product_stocks,id',
        ]);


        ProductStock::whereIn('id', $request->ids)->delete();

        return redirect()->back()->with('success', 'Selected stock items deleted successfully.');
    }
}
