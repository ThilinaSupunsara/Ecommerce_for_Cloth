<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReturnRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReturnController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $returns = ReturnRequest::with(['user', 'order'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/Returns/Index', [
            'returns' => $returns
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ReturnRequest $returnRequest)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,refunded',
            'admin_response' => 'nullable|string|max:500',
        ]);

        $returnRequest->update([
            'status' => $request->status,
            'admin_response' => $request->admin_response,
        ]);

        return redirect()->back()->with('success', 'Return request status updated.');
    }
    public function refund(ReturnRequest $returnRequest)
    {
        $order = $returnRequest->order;

        if (!$order->stripe_payment_id) {
            return back()->with('error', 'No Stripe payment found for this order.');
        }

        try {
            \Stripe\Stripe::setApiKey(env('STRIPE_SECRET'));

            \Stripe\Refund::create([
                'payment_intent' => $order->stripe_payment_id,
            ]);

            // Update statuses
            $returnRequest->update(['status' => 'refunded']);
            $order->update(['status' => 'cancelled', 'is_paid' => false]); // Or keep is_paid=true but status=refunded if you prefer

            return back()->with('success', 'Refund processed successfully via Stripe.');

        } catch (\Exception $e) {
            return back()->with('error', 'Stripe Refund Failed: ' . $e->getMessage());
        }
    }
}
