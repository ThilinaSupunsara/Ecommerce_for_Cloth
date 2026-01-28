<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Size;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SizeController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Sizes/Index', [
            'sizes' => Size::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:sizes',
            'code' => 'required|string|max:50|unique:sizes', // උදා: S, M, XL, XXL
        ]);

        Size::create($request->all());

        return redirect()->back()->with('success', 'Size added successfully.');
    }

    public function update(Request $request, Size $size)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:sizes,name,' . $size->id,
            'code' => 'required|string|max:50|unique:sizes,code,' . $size->id,
        ]);

        $size->update($request->all());

        return redirect()->back()->with('success', 'Size updated successfully.');
    }

    public function destroy(Size $size)
    {
        $size->delete();
        return redirect()->back()->with('success', 'Size deleted successfully.');
    }
}
