<!DOCTYPE html>
<html>
<head>
    <title>Order Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { color: #4f46e5; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border-bottom: 1px solid #ddd; padding: 10px; text-align: left; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Thank you for your order!</h1>
        <p>Hi {{ $order->first_name }},</p>
        <p>We have received your order. Here are the details:</p>

        <p><strong>Order ID:</strong> #{{ $order->id }}</p>
        <p><strong>Date:</strong> {{ $order->created_at->format('d M Y') }}</p>

        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($order->items as $item)
                <tr>
                    <td>
                        {{ $item->product_name }} <br>
                        <small style="color: #777;">{{ $item->color_name }} | {{ $item->size_name }}</small>
                    </td>
                    <td>{{ $item->quantity }}</td>
                    <td>Rs. {{ number_format($item->total, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="total">
            Total Amount: Rs. {{ number_format($order->total_price, 2) }}
        </div>

        <p style="margin-top: 30px; font-size: 12px; color: #888;">
            We will contact you shortly to confirm the delivery.<br>
            Thank you for shopping with CLOTHIFY!
        </p>
    </div>
</body>
</html>
