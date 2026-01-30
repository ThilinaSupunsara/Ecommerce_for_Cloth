<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        // 1. Query එක පටන් ගන්නවා (Active බඩු විතරයි)
        $query = Product::with('category')->where('is_active', true);

        // --- Filters ---

        // Search (Product Name)
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('name', 'like', '%' . $search . '%');
        }

        // Category
        if ($request->has('category')) {
            $slug = $request->get('category');
            $category = Category::where('slug', $slug)->first();
            if ($category) {
                $query->where('category_id', $category->id);
            }
        }

        // Price Range
        if ($request->has('min_price') && $request->get('min_price') != null) {
            $query->where('base_price', '>=', $request->get('min_price'));
        }
        if ($request->has('max_price') && $request->get('max_price') != null) {
            $query->where('base_price', '<=', $request->get('max_price'));
        }

        // Size Filter (Check if product has stock with this size)
        if ($request->has('size')) {
            $sizes = (array) $request->get('size'); // Can be multiple
            $query->whereHas('stocks', function ($q) use ($sizes) {
                $q->whereIn('size_id', $sizes);
            });
        }

        // Color Filter (Check if product has stock with this color)
        if ($request->has('color')) {
            $colors = (array) $request->get('color'); // Can be multiple
            $query->whereHas('stocks', function ($q) use ($colors) {
                $q->whereIn('color_id', $colors);
            });
        }

        // 3. Sorting (අලුත් ඒවා උඩට)
        $products = $query->latest()->paginate(12)->withQueryString();

        // 4. Sidebar එකට Categories, Sizes, Colors ටික යවනවා
        $categories = Category::where('is_active', true)->get();
        $sizes = \App\Models\Size::all(); // Assuming all sizes are relevant
        $colors = \App\Models\Color::all(); // Assuming all colors are relevant

        return Inertia::render('Shop/Index', [
            'products' => $products,
            'categories' => $categories,
            'sizes' => $sizes,
            'colors' => $colors,
            'filters' => $request->only(['search', 'category', 'min_price', 'max_price', 'size', 'color']),
            'currentCategory' => $request->get('category')
        ]);
    }

    public function show($slug)
    {
        // Product එක හොයාගන්නවා (Images, Stocks, Reviews එක්ක)
        $product = Product::with([
            'category',
            'images',
            'stocks.color',
            'stocks.size',
            'reviews.user' => function ($q) {
                $q->latest();
            }
        ])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        // ඊට සමාන වෙනත් බඩු ටිකක් (Related Products) යටින් පෙන්වන්න
        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id) // මේ Product එක හැර
            ->where('is_active', true)
            ->take(4)
            ->get();

        // Check if user has purchased this product and order is completed
        $hasPurchased = false;
        if (auth()->check()) {
            $hasPurchased = \App\Models\Order::where('user_id', auth()->id())
                ->where('status', 'completed') // Only completed orders
                ->whereHas('items', function ($query) use ($product) {
                    $query->where('product_id', $product->id);
                })
                ->exists();
        }

        return Inertia::render('Shop/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'hasPurchased' => $hasPurchased
        ]);
    }
}
