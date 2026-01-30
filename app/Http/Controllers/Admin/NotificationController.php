<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function markAsRead($id)
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        // Redirect to the order if order_id exists
        if (isset($notification->data['order_id'])) {
            return redirect()->route('admin.orders.show', $notification->data['order_id']);
        }

        return back();
    }
}
