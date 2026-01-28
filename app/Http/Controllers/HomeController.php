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

        return Inertia::render('Home/Index', [
            'categories' => $categories,
            'featuredProducts' => $featuredProducts
        ]);
    }
}
