<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();


        if ($user->hasRole(['super_admin', 'store_manager'])) {


            return Inertia::render('Admin/Dashboard');

        } else {


            $orders = Order::with('items.product')
                ->where('user_id', $user->id)
                ->latest()
                ->get();

            return Inertia::render('MyAccount/Orders', [
                'orders' => $orders
            ]);
        }
    }
}
