<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{

    public function index(): Response
    {
        $categories = Category::latest()->paginate(10);
        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories
        ]);
    }


    public function store(SaveCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();


        $data['slug'] = Str::slug($data['name']);


        if ($request->hasFile('image')) {

            $path = $request->file('image')->store('categories', 'public');
            $data['image'] = $path;
        }

        Category::create($data);

        return redirect()->back()->with('success', 'Category created successfully.');
    }


    public function update(SaveCategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();


        if (!$request->hasFile('image')) {
            unset($data['image']);
        }


        if ($category->name !== $data['name']) {
            $data['slug'] = Str::slug($data['name']);
        }


        if ($request->hasFile('image')) {

            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
           
            $path = $request->file('image')->store('categories', 'public');
            $data['image'] = $path;
        }

        $category->update($data);

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return redirect()->back()->with('success', 'Category deleted successfully.');
    }
}
