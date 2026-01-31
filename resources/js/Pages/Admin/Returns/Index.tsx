import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react'; // Add router import
import { PageProps } from '@/types';
import Modal from '@/Components/Modal';
import { useState } from 'react';

interface ReturnRequest {
    id: number;
    user: { name: string; email: string };
    order_id: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'refunded';
    admin_response: string | null;
    created_at: string;
    order_stripe_payment_id?: string;
    order?: { stripe_payment_id: string | null }; // Add nested order object
}

interface IndexProps extends PageProps {
    returns: {
        data: ReturnRequest[];
        links: any[];
    };
}

export default function Index({ auth, returns }: IndexProps) {
    return (
        <AuthenticatedLayout

            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Return Requests</h2>}
        >
            <Head title="Manage Returns" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {returns.data.map((request) => (
                                        <tr key={request.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{request.order_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>{request.user.name}</div>
                                                <div className="text-xs text-gray-400">{request.user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={request.reason}>
                                                {request.reason}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={request.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <ActionButtons request={request} />
                                            </td>
                                        </tr>
                                    ))}
                                    {returns.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                                No return requests found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-blue-100 text-blue-800',
        rejected: 'bg-red-100 text-red-800',
        refunded: 'bg-green-100 text-green-800',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

const ActionButtons = ({ request }: { request: ReturnRequest }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, setData, put, processing, reset } = useForm({
        status: request.status,
        admin_response: request.admin_response || '',
    });

    const updateStatus = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.status !== request.status) {
            if (!confirm(`Are you sure you want to change status to "${data.status}"?`)) {
                return;
            }
        }

        put(route('admin.returns.update', request.id), {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    return (
        <>
            <div className="flex space-x-2">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-indigo-600 hover:text-indigo-900"
                >
                    Manage
                </button>

                {request.status === 'approved' && request.order?.stripe_payment_id && (
                    <button
                        onClick={() => {
                            if (confirm('Process Stripe Refund? This cannot be undone.')) {
                                router.post(route('admin.returns.refund', request.id));
                            }
                        }}
                        className="text-red-600 hover:text-red-900 text-xs border border-red-200 px-2 py-1 rounded"
                    >
                        Refund (Stripe)
                    </button>
                )}
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">Manage Return Request #{request.id}</h3>

                    <div className="mb-4 bg-gray-50 p-4 rounded text-sm text-gray-700">
                        <strong>Reason provided by customer:</strong>
                        <p className="mt-1">{request.reason}</p>
                    </div>

                    <form onSubmit={updateStatus}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Action Status</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as any)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approve (Accept Return)</option>
                                <option value="refunded">Refunded (Completed)</option>
                                <option value="rejected">Reject</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Admin Response / Note</label>
                            <textarea
                                value={data.admin_response}
                                onChange={(e) => setData('admin_response', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                rows={3}
                                placeholder="Optional note to customer..."
                            ></textarea>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm"
                            >
                                {processing ? 'Updating...' : 'Update Status'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
};
