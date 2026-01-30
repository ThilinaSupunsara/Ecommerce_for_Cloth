<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ProductStock;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        // 1. Low Stock Products (< 5 quantity)
        // Adjust threshold as needed. Showing product, size, color and remaining qty.
        $lowStockItems = ProductStock::with(['product', 'size', 'color'])
            ->where('quantity', '<', 5)
            ->get();

        return Inertia::render('Admin/Reports/Index', [
            'lowStockItems' => $lowStockItems
        ]);
    }

    public function sales(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'nullable|string',
            'payment_status' => 'nullable|string',
        ]);

        $query = Order::whereBetween('created_at', [
            $request->start_date . ' 00:00:00',
            $request->end_date . ' 23:59:59'
        ]);

        // Apply Status Filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Apply Payment Status Filter
        if ($request->filled('payment_status') && $request->payment_status !== 'all') {
            if ($request->payment_status === 'paid') {
                $query->where('is_paid', true);
            } elseif ($request->payment_status === 'unpaid') {
                $query->where('is_paid', false);
            }
        }

        $sales = $query->with('user')->latest()->get();

        // Re-fetch low stock items as we are strictly rendering the page
        $lowStockItems = ProductStock::with(['product', 'size', 'color'])
            ->where('quantity', '<', 5)
            ->get();

        return Inertia::render('Admin/Reports/Index', [
            'salesReport' => $sales,
            'filters' => $request->only(['start_date', 'end_date', 'status', 'payment_status']),
            'lowStockItems' => $lowStockItems
        ]);
    }

    public function exportSales(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'nullable|string',
            'payment_status' => 'nullable|string',
        ]);

        $query = Order::whereBetween('created_at', [
            $request->start_date . ' 00:00:00',
            $request->end_date . ' 23:59:59'
        ]);

        // Apply Status Filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Apply Payment Status Filter
        if ($request->filled('payment_status') && $request->payment_status !== 'all') {
            if ($request->payment_status === 'paid') {
                $query->where('is_paid', true);
            } elseif ($request->payment_status === 'unpaid') {
                $query->where('is_paid', false);
            }
        }

        $sales = $query->with('user')->get();

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=sales_report.csv",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($sales) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Order ID', 'Customer Name', 'Date', 'Total Amount (Rs.)', 'Status', 'Payment Status']);

            foreach ($sales as $order) {
                fputcsv($file, [
                    $order->id,
                    $order->user->name ?? 'Guest',
                    $order->created_at->format('Y-m-d H:i'),
                    $order->total_price,
                    $order->status,
                    $order->is_paid ? 'Paid' : 'Unpaid',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportOrders()
    {
        $orders = Order::with(['user', 'items.product'])->latest()->get();

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=all_orders.csv",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate",
            "Expires" => "0"
        ];

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Order ID', 'Customer Name', 'Email', 'Date', 'Total Amount (Rs.)', 'Items Count', 'Status', 'Payment Status']);

            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->id,
                    $order->user->name ?? 'Guest',
                    $order->user->email ?? 'N/A',
                    $order->created_at->format('Y-m-d H:i'),
                    $order->total_price,
                    $order->items->count(),
                    $order->status,
                    $order->is_paid ? 'Paid' : 'Unpaid',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
