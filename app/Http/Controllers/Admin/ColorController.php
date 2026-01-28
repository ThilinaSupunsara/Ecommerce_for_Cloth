<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Color;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ColorController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Colors/Index', [
            'colors' => Color::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:colors',
            'code' => 'required|string|max:255', 
        ]);

        Color::create($request->all());

        return redirect()->back()->with('success', 'Color added successfully.');
    }

    public function update(Request $request, Color $color)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:colors,name,' . $color->id,
            'code' => 'required|string|max:255',
        ]);

        $color->update($request->all());

        return redirect()->back()->with('success', 'Color updated successfully.');
    }

    public function destroy(Color $color)
    {
        $color->delete();
        return redirect()->back()->with('success', 'Color deleted successfully.');
    }
}
