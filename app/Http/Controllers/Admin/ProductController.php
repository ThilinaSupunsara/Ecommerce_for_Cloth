<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveProductRequest;
use App\Models\Category;
use App\Models\Color;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Size;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{

    public function index(): Response
{

    $products = Product::with(['category', 'stocks.color', 'stocks.size'])
        ->latest()
        ->paginate(10);

    $categories = Category::where('is_active', true)->get();


    $colors = Color::all();
    $sizes = Size::all();

    return Inertia::render('Admin/Products/Index', [
        'products' => $products,
        'categories' => $categories,
        'colors' => $colors,
        'sizes' => $sizes,
    ]);
}


    public function store(SaveProductRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['name']);


        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }


        $product = Product::create($data);


        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $imageFile) {

                $path = $imageFile->store('product_gallery', 'public');


                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path
                ]);
            }
        }

        return redirect()->back()->with('success', 'Product created successfully.');
    }


    public function update(SaveProductRequest $request, Product $product): RedirectResponse
    {
        $data = $request->validated();

        if ($product->name !== $data['name']) {
            $data['slug'] = Str::slug($data['name']);
        }


        if ($request->hasFile('image')) {

            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        } else {
             unset($data['image']);
        }

        $product->update($data);


        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $imageFile) {
                $path = $imageFile->store('product_gallery', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path
                ]);
            }
        }

        return redirect()->back()->with('success', 'Product updated successfully.');
    }


    public function destroy(Product $product): RedirectResponse
    {

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }


        foreach ($product->images as $galleryImage) {
            Storage::disk('public')->delete($galleryImage->image_path);
        }


        $product->delete();

        return redirect()->back()->with('success', 'Product deleted successfully.');
    }
}
