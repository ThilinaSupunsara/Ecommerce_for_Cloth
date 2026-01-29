import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    color_name: string;
    size_name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Order {
    id: number;
    created_at: string;
    status: string;
    total_price: string;
    user: User;
    items: OrderItem[];
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    phone: string;
}

interface Props extends PageProps {
    orders: {
        data: Order[];
        links: any[];
    };
}

export default function AdminOrderIndex({ auth, orders }: Props) {

    // Status වෙනස් කරන Function එක
    const handleStatusChange = (orderId: number, newStatus: string) => {
        if (confirm(`Are you sure you want to change status to ${newStatus}?`)) {
            router.patch(route('admin.orders.update', orderId), {
                status: newStatus
            }, {
                preserveScroll: true,
            });
        }
    };

    // Status Colors
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout

            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Admin Order Management</h2>}
        >
            <Head title="Admin Orders" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Orders</h3>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">Order ID</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">Items</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">Total</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                                            <th className="px-4 py-3 text-right font-medium text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orders.data.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 font-bold">#{order.id}</td>
                                                <td className="px-4 py-4">
                                                    <div className="font-medium text-gray-900">{order.first_name} {order.last_name}</div>
                                                    <div className="text-gray-500 text-xs">{order.phone}</div>
                                                    <div className="text-gray-500 text-xs">{order.city}</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <ul className="list-disc list-inside text-xs text-gray-600">
                                                        {order.items.map((item) => (
                                                            <li key={item.id}>
                                                                {item.product_name} ({item.quantity})
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </td>
                                                <td className="px-4 py-4 font-bold text-gray-900">
                                                    Rs. {order.total_price}
                                                </td>
                                                <td className="px-4 py-4 text-gray-500">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        className={`text-xs font-semibold rounded-full px-3 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-indigo-500 ${getStatusColor(order.status)}`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <Link
                                                        href={route('admin.orders.show', order.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 font-bold border border-indigo-200 bg-indigo-50 px-3 py-1 rounded"
                                                    >
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination (සරලව) */}
                            <div className="mt-4 flex justify-between">
                                {orders.links.map((link, i) => (
                                    link.url ? (
                                        <a
                                            key={i}
                                            href={link.url}
                                            className={`px-3 py-1 border rounded text-sm ${link.active ? 'bg-indigo-600 text-white' : 'bg-white'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : null
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
