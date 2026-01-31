import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

interface Coupon {
    id: number;
    code: string;
    type: 'fixed' | 'percent';
    value: string;
    expiry_date: string;
    is_active: boolean;
}

interface Props {
    auth: any;
    coupons: Coupon[];
    errors: any;
}

export default function CouponIndex({ auth, coupons, errors }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        code: '',
        type: 'fixed',
        value: '',
        expiry_date: '',
        is_active: true
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState<number | null>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.coupons.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
                // success message handled by flash
            }
        });
    };

    const confirmDelete = (id: number) => {
        setCouponToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (couponToDelete) {
            router.delete(route('admin.coupons.destroy', couponToDelete), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setCouponToDelete(null);
                }
            });
        }
    };

    const handleToggle = (id: number) => {
        router.post(route('admin.coupons.toggle', id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manage Coupons</h2>}
        >
            <Head title="Coupons" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">All Coupons</h3>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                            >
                                + Create New Coupon
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {coupons.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No coupons found.</td>
                                        </tr>
                                    ) : (
                                        coupons.map((coupon) => (
                                            <tr key={coupon.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{coupon.code}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{coupon.type}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {coupon.type === 'fixed' ? 'Rs. ' + coupon.value : coupon.value + '%'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'No Expiry'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleToggle(coupon.id)}
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer
                                                        ${coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                                    >
                                                        {coupon.is_active ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => confirmDelete(coupon.id)}
                                                        className="text-red-600 hover:text-red-900 ml-4"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900" id="modal-title">Create New Coupon</h3>
                    <form onSubmit={submit} className="mt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Code</label>
                            <input
                                type="text"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.code}
                                onChange={e => setData('code', e.target.value.toUpperCase())}
                                required
                            />
                            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.type}
                                // @ts-ignore
                                onChange={e => setData('type', e.target.value)}
                            >
                                <option value="fixed">Fixed Amount (Rs.)</option>
                                <option value="percent">Percentage (%)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Value</label>
                            <input
                                type="number"
                                step="0.01"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.value}
                                onChange={e => setData('value', e.target.value)}
                                required
                            />
                            {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Expiry Date (Optional)</label>
                            <input
                                type="date"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.expiry_date}
                                onChange={e => setData('expiry_date', e.target.value)}
                            />
                            {errors.expiry_date && <p className="text-red-500 text-xs mt-1">{errors.expiry_date}</p>}
                        </div>

                        <div className="flex justify-end mt-6">
                            <SecondaryButton onClick={() => setShowCreateModal(false)} className="mr-3">Cancel</SecondaryButton>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:text-sm"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Delete Coupon?</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Are you sure you want to delete this coupon? This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>Cancel</SecondaryButton>
                        <DangerButton className="ml-3" onClick={handleDelete}>Delete</DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
