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

            // 1. Cards Data
            $totalSales = Order::sum('total_price');
            $totalOrders = Order::count();
            // Fix: Count all users who are NOT admins/managers (Includes users with no role)
            $totalCustomers = \App\Models\User::whereDoesntHave('roles', function ($q) {
                $q->whereIn('name', ['super_admin', 'store_manager']);
            })->count();

            // 2. Charts Data (Current Month)
            // Postgres uses ::date or CAST for date conversion
            $salesData = Order::selectRaw('created_at::date as date, SUM(total_price) as total')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            $ordersData = Order::selectRaw('created_at::date as date, COUNT(*) as count')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            // Format for Chart.js (Labels & Data)
            // Note: Ideally fill missing dates with 0, but for simplicity sending raw data

            // 3. Best Selling Products
            $topProducts = \App\Models\Product::select('products.name')
                ->join('order_items', 'products.id', '=', 'order_items.product_id')
                ->selectRaw('products.name, SUM(order_items.quantity) as total_sold')
                ->groupBy('products.id', 'products.name')
                ->orderByDesc('total_sold')
                ->take(5)
                ->get();

            return Inertia::render('Admin/Dashboard', [
                'totalSales' => $totalSales,
                'totalOrders' => $totalOrders,
                'totalCustomers' => $totalCustomers,
                'salesChart' => $salesData,
                'ordersChart' => $ordersData,
                'topProducts' => $topProducts
            ]);

        } else {
            $orders = Order::with('items.product')
                ->where('user_id', $user->id)
                ->latest()
                ->get();

            return Inertia::render('Dashboard', [
                'orders' => $orders
            ]);
        }
    }
}
