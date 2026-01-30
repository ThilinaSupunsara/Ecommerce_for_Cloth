import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout'; // 👈 AuthenticatedLayout වෙනුවට මේක දැම්මා
import { Head, Link } from '@inertiajs/react';
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

// --- Order Progress Bar Component ---
const OrderProgressBar = ({ status }: { status: string }) => {
    const steps = ['pending', 'processing', 'shipped', 'completed'];
    const currentStepIndex = steps.indexOf(status);

    if (status === 'cancelled') {
        return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 uppercase">
                Cancelled
            </span>
        );
    }

    return (
        <div className="w-full max-w-xs">
            <div className="relative flex items-center justify-between">
                {/* Background Line */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>

                {/* Active Line (Progress) */}
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-indigo-600 -z-10 transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step} className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${isCompleted ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                {isCompleted && (
                                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                )}
                            </div>
                            <span className={`text-[10px] mt-1 capitalize ${isCurrent ? 'font-bold text-indigo-700' : 'text-gray-500'}`}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default function Dashboard({ auth, orders }: DashboardProps) {
    return (
        // 👇 Customer නිසා PublicLayout එක පාවිච්චි කරනවා
        <PublicLayout user={auth.user}>
            <Head title="My Account" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Header Section */}
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
                        <p className="text-gray-500 mt-1">Welcome back, <strong>{auth.user.name}</strong>! 👋</p>
                    </div>
                    <Link
                        href={route('profile.edit')}
                        className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded shadow-sm hover:bg-gray-50 transition"
                    >
                        Edit Profile
                    </Link>
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
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Status</th>
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
                                                        <OrderProgressBar status={order.status} />
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
