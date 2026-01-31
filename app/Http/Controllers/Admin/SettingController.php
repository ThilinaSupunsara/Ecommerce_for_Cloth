<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Settings/Index', [
            'delivery_fee' => Setting::get('delivery_fee', 0),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'delivery_fee' => 'required|numeric|min:0',
        ]);

        Setting::set('delivery_fee', $request->delivery_fee);

        return back()->with('success', 'Settings updated successfully.');
    }
}
