<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProductReviewController extends Controller
{
    public function store(Request $request, $productId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $user = auth()->user();

        // 1. Check if user actually purchased this product AND order is completed
        $hasPurchased = \App\Models\Order::where('user_id', $user->id)
            ->where('status', 'completed')
            ->whereHas('items', function ($query) use ($productId) {
                $query->where('product_id', $productId);
            })
            ->exists();

        if (!$hasPurchased) {
            return back()->withErrors(['message' => 'You can only review products from completed orders.']);
        }

        // 2. Check if already reviewed? (Optional, skipping for now to allow re-reviews or multiple)

        // 3. Create Review
        \App\Models\Review::create([
            'user_id' => $user->id,
            'product_id' => $productId,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return back()->with('success', 'Thank you for your review!');
    }
}
