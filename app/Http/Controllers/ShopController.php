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

        // 2. Category එකක් තෝරලා තියෙනවද බලනවා (URL එකෙන් ?category=mens වගේ ආවොත්)
        if ($request->has('category')) {
            $slug = $request->get('category');
            $category = Category::where('slug', $slug)->first();

            if ($category) {
                $query->where('category_id', $category->id);
            }
        }

        // 3. Sorting (අලුත් ඒවා උඩට)
        $products = $query->latest()->paginate(12)->withQueryString(); // withQueryString() දැම්මම page 2 එකට ගියත් category එක නැති වෙන්නේ නෑ

        // 4. Sidebar එකට Categories ටික යවනවා
        $categories = Category::where('is_active', true)->get();

        return Inertia::render('Shop/Index', [
            'products' => $products,
            'categories' => $categories,
            'currentCategory' => $request->get('category') // දැනට තෝරලා තියෙන එක Frontend එකට යවනවා
        ]);
    }

    public function show($slug)
    {
        // Product එක හොයාගන්නවා (Images සහ Stocks එක්ක)
        $product = Product::with(['category', 'images', 'stocks.color', 'stocks.size'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        // ඊට සමාන වෙනත් බඩු ටිකක් (Related Products) යටින් පෙන්වන්න
        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id) // මේ Product එක හැර
            ->where('is_active', true)
            ->take(4)
            ->get();

        return Inertia::render('Shop/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts
        ]);
    }
}
