import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout'; // 👈 AuthenticatedLayout වෙනුවට මේක දැම්මා
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

interface DashboardProps extends PageProps {
    orders: Order[];
}

export default function Dashboard({ auth, orders }: DashboardProps) {
    return (
        // 👇 Customer නිසා PublicLayout එක පාවිච්චි කරනවා
        <PublicLayout user={auth.user}>
            <Head title="My Account" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
                    <p className="text-gray-500 mt-1">Welcome back, <strong>{auth.user.name}</strong>! 👋</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Order History Section */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Order History</h3>
                        </div>

                        <div className="p-6">
                            {orders.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {orders.map((order) => (
                                                <tr key={order.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        #{order.id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase
                                                            ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                              'bg-yellow-100 text-yellow-800'}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                        Rs. {order.total_price}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        <ul className="list-disc list-inside">
                                                            {order.items.map((item) => (
                                                                <li key={item.id}>
                                                                    {item.product_name} ({item.color_name}, {item.size_name}) x {item.quantity}
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
            </div>
        </PublicLayout>
    );
}
