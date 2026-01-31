import React, { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, useForm } from '@inertiajs/react';

import { PageProps } from '@/types';
import ReviewForm from '@/Components/ReviewForm';
import Modal from '@/Components/Modal';

// Types
interface OrderItem {
    id: number;
    product_id: number; // Added product_id
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
    return_request: {
        id: number;
        status: 'pending' | 'approved' | 'rejected' | 'refunded';
        reason: string;
        admin_response: string | null;
        created_at: string; // Added date
    } | null;
}

interface DashboardProps extends PageProps {
    orders: Order[];
}

// --- Return Progress Bar Component ---
const ReturnProgressBar = ({ status }: { status: string }) => {
    // Determine steps based on status path
    // Path 1: Pending -> Approved -> Refunded
    // Path 2: Pending -> Rejected
    const isRejected = status === 'rejected';

    const steps = isRejected
        ? ['pending', 'rejected']
        : ['pending', 'approved', 'refunded'];

    const currentStepIndex = steps.indexOf(status);

    return (
        <div className="w-full mt-2">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                <div
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-1 -z-10 transition-all duration-500 ${isRejected ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    let activeColor = isRejected ? 'bg-red-600' : 'bg-green-600';
                    let textColor = isRejected ? 'text-red-700' : 'text-green-700';

                    return (
                        <div key={step} className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${isCompleted ? activeColor : 'bg-gray-300'}`}>
                            </div>
                            <span className={`text-[10px] mt-1 capitalize ${isCurrent ? `font-bold ${textColor}` : 'text-gray-500'}`}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
            {isRejected && (
                <p className="text-xs text-red-600 text-center mt-1 font-medium">Return request was rejected.</p>
            )}
        </div>
    );
};

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
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Return / Exchange</th>
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
                                                                <li key={item.id} className="flex justify-between items-center mb-2">
                                                                    <span>{item.product_name} ({item.color_name}, {item.size_name}) x {item.quantity}</span>
                                                                    {order.status === 'completed' && (
                                                                        <div className="flex space-x-2">
                                                                            <ReviewButton productId={item.product_id} />
                                                                        </div>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {order.return_request ? (
                                                            <div className="w-full max-w-[180px] ml-auto">
                                                                <ReturnProgressBar status={order.return_request.status} />

                                                                <div className="bg-gray-50 rounded p-2 mt-2 text-left border border-gray-100">
                                                                    <p className="text-[10px] text-gray-500 font-semibold uppercase">Your Reason:</p>
                                                                    <p className="text-xs text-gray-700 truncate" title={order.return_request.reason}>"{order.return_request.reason}"</p>

                                                                    {order.return_request.admin_response && (
                                                                        <>
                                                                            <div className="h-px bg-gray-200 my-1"></div>
                                                                            <p className="text-[10px] text-indigo-600 font-semibold uppercase">Admin Response:</p>
                                                                            <p className="text-xs text-gray-800">{order.return_request.admin_response}</p>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : order.status === 'completed' && (
                                                            <ReturnButton orderId={order.id} />
                                                        )}
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

const ReviewButton = ({ productId }: { productId: number }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 ml-2"
            >
                Rate Product
            </button>

            <Modal show={isOpen} onClose={() => setIsOpen(false)}>
                <div className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">Write a Review</h3>
                    <ReviewForm productId={productId} onSuccess={() => setIsOpen(false)} />
                    <button
                        onClick={() => setIsOpen(false)}
                        className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Cancel
                    </button>
                </div>
            </Modal>
        </>
    );

};

const ReturnButton = ({ orderId }: { orderId: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        order_id: orderId,
        reason: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('return.store'), {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
        });
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs border border-red-200 text-red-700 px-3 py-1 rounded hover:bg-red-50 transition"
            >
                Request Return
            </button>

            <Modal show={isOpen} onClose={() => setIsOpen(false)}>
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"></path>
                            </svg>
                        </div>
                        <h3 className="text-lg leading-6 font-bold text-gray-900">Request Return / Exchange</h3>
                        <p className="text-sm text-gray-500 mt-2">
                            Unhappy with your purchase? You can request a return or exchange within 7 days of delivery.
                        </p>
                    </div>

                    <form onSubmit={submit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to return this?</label>
                            <textarea
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                rows={4}
                                required
                                placeholder="E.g., I received the wrong size, Item is damaged, Color doesn't match..."
                            ></textarea>
                            {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
                        </div>

                        <div className="bg-yellow-50 p-3 rounded-md mb-4 border border-yellow-200">
                            <p className="text-xs text-yellow-800">
                                <strong>Note:</strong> Refunds are processed to your original payment method. Exchanges depend on stock availability.
                            </p>
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium shadow-sm disabled:opacity-50"
                            >
                                {processing ? 'Submitting Request...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
};
