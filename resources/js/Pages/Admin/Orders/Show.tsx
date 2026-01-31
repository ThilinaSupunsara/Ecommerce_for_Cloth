import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: string;
    total: string;
    color_name: string;
    size_name: string;
    product: { image: string | null };
}

interface Order {
    id: number;
    created_at: string;
    status: string;
    total_price: string;
    payment_method: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
    items: OrderItem[];
}

interface Props extends PageProps {
    order: Order;
}

export default function AdminOrderShow({ auth, order }: Props) {

    const [statusModalState, setStatusModalState] = useState<string | null>(null);

    const initiateStatusChange = (newStatus: string) => {
        setStatusModalState(newStatus);
    };

    const confirmStatusChange = () => {
        if (statusModalState) {
            router.patch(route('admin.orders.update', order.id), { status: statusModalState }, {
                onSuccess: () => setStatusModalState(null)
            });
        }
    };

    return (
        <AuthenticatedLayout

            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Order Details #{order.id}</h2>}
        >
            <Head title={`Order #${order.id}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Back Button */}
                    <div className="mb-6">
                        <Link href={route('admin.orders.index')} className="text-indigo-600 hover:text-indigo-900 font-medium">
                            &larr; Back to Orders
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-8 border-b border-gray-200">

                            {/* Header: ID & Status */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Placed on {new Date(order.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                                    <select
                                        value={order.status}
                                        onChange={(e) => initiateStatusChange(e.target.value)}
                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            {/* Customer & Shipping Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-gray-50 p-6 rounded-lg">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">Customer Details</h3>
                                    <p className="text-gray-700"><strong>Name:</strong> {order.first_name} {order.last_name}</p>
                                    <p className="text-gray-700"><strong>Email:</strong> {order.email}</p>
                                    <p className="text-gray-700"><strong>Phone:</strong> {order.phone}</p>
                                    <p className="text-gray-700"><strong>Payment:</strong> <span className="uppercase">{order.payment_method}</span></p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">Shipping Address</h3>
                                    <p className="text-gray-700">{order.address}</p>
                                    <p className="text-gray-700">{order.city}</p>
                                    <p className="text-gray-700">{order.postal_code}</p>
                                </div>
                            </div>

                            {/* Order Items Table */}
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Ordered Items</h3>
                            <div className="overflow-x-auto border rounded-lg mb-6">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variation</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {order.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            {item.product?.image ? (
                                                                <img className="h-10 w-10 rounded-full object-cover" src={`/storage/${item.product.image}`} alt="" />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs">No Img</div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    Color: {item.color_name} <br /> Size: {item.size_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    Rs. {item.price}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-right">
                                                    Rs. {item.total}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Total Summary */}
                            <div className="flex justify-end">
                                <div className="w-full sm:w-1/3 bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="text-gray-900 font-medium">Rs. {order.total_price}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="text-gray-900 font-medium">Free</span>
                                    </div>
                                    <div className="flex justify-between py-2 mt-2">
                                        <span className="text-lg font-bold text-gray-900">Total</span>
                                        <span className="text-lg font-bold text-indigo-600">Rs. {order.total_price}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Status Confirmation Modal */}
            <Modal show={statusModalState !== null} onClose={() => setStatusModalState(null)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Change Status?</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Are you sure you want to change this order's status to <span className="font-bold">{statusModalState}</span>?
                        {statusModalState === 'cancelled' && (
                            <span className="block mt-2 text-red-600 font-bold">Warning: Stock will be restored!</span>
                        )}
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setStatusModalState(null)}>Cancel</SecondaryButton>
                        <PrimaryButton className="ml-3" onClick={confirmStatusChange}>Confirm</PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
