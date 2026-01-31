import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Props extends PageProps {
    delivery_fee: number;
}

export default function SettingsIndex({ auth, delivery_fee }: Props) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        delivery_fee: delivery_fee,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.update'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Site Settings</h2>}
        >
            <Head title="Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">General Configuration</h3>

                        <form onSubmit={submit} className="max-w-xl">
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Fee (Rs.)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={data.delivery_fee}
                                    onChange={(e) => setData('delivery_fee', Number(e.target.value))}
                                />
                                {errors.delivery_fee && <p className="text-red-500 text-xs mt-1">{errors.delivery_fee}</p>}
                                <p className="text-xs text-gray-500 mt-1">This fee will be added to the total of every order at checkout.</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Settings'}
                                </button>

                                {recentlySuccessful && (
                                    <p className="text-sm text-green-600">Saved.</p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
