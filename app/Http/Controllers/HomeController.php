<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {

        $categories = Category::where('is_active', true)
            ->take(6)
            ->get();


        $featuredProducts = Product::with('category')
            ->where('is_active', true)
            ->where('is_featured', true)
            ->latest()
            ->take(8)
            ->get();

        // Eager load products for the active flash sale
        $flashSale = \App\Models\FlashSale::active()->with('products.category')->first();

        $flashSaleProducts = [];
        if ($flashSale) {
            if ($flashSale->products->count() > 0) {
                $flashSaleProducts = $flashSale->products;
            } else {
                // Site-wide sale! Show some random/latest products as examples
                $flashSaleProducts = Product::with('category')
                    ->where('is_active', true)
                    ->inRandomOrder()
                    ->take(8)
                    ->get();
            }
        }

        return Inertia::render('Home/Index', [
            'categories' => $categories,
            'featuredProducts' => $featuredProducts,
            'flashSale' => $flashSale,
            'flashSaleProducts' => $flashSaleProducts
        ]);
    }
}
