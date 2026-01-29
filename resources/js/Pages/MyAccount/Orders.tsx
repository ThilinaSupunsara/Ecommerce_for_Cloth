import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout'; // 👈 Customer ට Shop Layout එක
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';

// Types
interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: string;
    color_name: string;
    size_name: string;
}

interface Order {
    id: number;
    created_at: string;
    status: string;
    total_price: string;
    items: OrderItem[];
}

interface Props extends PageProps {
    orders: Order[];
}

export default function CustomerOrders({ auth, orders }: Props) {
    return (
        <PublicLayout user={auth.user}>
            <Head title="My Orders" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
                    <p className="text-gray-500 mt-1">Welcome back, <strong>{auth.user.name}</strong>! 👋</p>
                </div>

                {/* Order History Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-800">Order History</h2>
                    </div>

                    <div className="p-6">
                        {orders.length === 0 ? (
                            <div className="text-center py-10">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p className="mt-2 text-gray-500">You haven't placed any orders yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                                        <tr>
                                            <th className="px-4 py-3">Order ID</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Total</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Items</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-4 font-medium text-gray-900">#{order.id}</td>
                                                <td className="px-4 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-4 font-bold text-gray-900">Rs. {order.total_price}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                                                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-gray-500 text-xs">
                                                    <ul className="list-disc list-inside">
                                                        {order.items.map(item => (
                                                            <li key={item.id}>
                                                                {item.product_name} ({item.quantity})
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
