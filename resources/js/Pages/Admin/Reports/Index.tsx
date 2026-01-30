import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

interface Props {
    auth: any;
    lowStockItems: any[];
    salesReport?: any[];
    filters?: {
        start_date: string;
        end_date: string;
        status?: string;
        payment_status?: string;
    };
    errors: any;
}

export default function ReportsIndex({ auth, lowStockItems, salesReport, filters, errors }: Props) {
    const { data, setData, get, processing } = useForm({
        start_date: filters?.start_date || '',
        end_date: filters?.end_date || '',
        status: filters?.status || 'all',
        payment_status: filters?.payment_status || 'all',
    });

    const submitSalesFilter = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('admin.reports.sales'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const exportSales = () => {
        if (!data.start_date || !data.end_date) {
            alert('Please select a date range first.');
            return;
        }
        // Direct download link with all filters
        const params = new URLSearchParams({
            start_date: data.start_date,
            end_date: data.end_date,
            status: data.status,
            payment_status: data.payment_status
        });
        window.location.href = `${route('admin.reports.export.sales')}?${params.toString()}`;
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Reports & Exports</h2>}
        >
            <Head title="Reports" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* --- Export Orders Section --- */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Total Orders Export</h3>
                                <p className="text-gray-500 text-sm">Download a complete list of all orders in the system.</p>
                            </div>
                            <a
                                href={route('admin.reports.export.orders')}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                            >
                                <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" /></svg>
                                Export Orders (CSV)
                            </a>
                        </div>
                    </div>

                    {/* --- Sales Report Section --- */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Sales Report</h3>

                        {/* Filter Form */}
                        <form onSubmit={submitSalesFilter} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={data.start_date}
                                    onChange={e => setData('start_date', e.target.value)}
                                    required
                                />
                                {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Date</label>
                                <input
                                    type="date"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={data.end_date}
                                    onChange={e => setData('end_date', e.target.value)}
                                    required
                                />
                                {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Order Status</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Payment</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={data.payment_status}
                                    onChange={e => setData('payment_status', e.target.value)}
                                >
                                    <option value="all">All</option>
                                    <option value="paid">Paid Only</option>
                                    <option value="unpaid">Unpaid Only</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Filter
                                </button>
                                {salesReport && (
                                    <button
                                        type="button"
                                        onClick={exportSales}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
                                    >
                                        CSV
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Sales Table */}
                        {salesReport && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {salesReport.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No records found for this selection.</td>
                                            </tr>
                                        ) : (
                                            salesReport.map((sale: any) => (
                                                <tr key={sale.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{sale.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.user?.name || 'Guest'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sale.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rs. {sale.total_price}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                sale.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                    'bg-yellow-100 text-yellow-800'}`}>
                                                            {sale.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${sale.is_paid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {sale.is_paid ? 'Paid' : 'Unpaid'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* --- Low Stock Report Section --- */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-red-500">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 text-red-600">Low Stock Alert (Less than 5)</h3>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {lowStockItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Good news! No low stock items.</td>
                                        </tr>
                                    ) : (
                                        lowStockItems.map((item: any) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product?.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.size?.name}</td>
                                                {/* @ts-ignore */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="inline-block w-4 h-4 rounded-full border mr-2 align-middle" style={{ backgroundColor: item.color?.code }}></span>
                                                    {item.color?.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">{item.quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {/* Link to Edit Product / Add Stock */}
                                                    <a href={route('admin.products.index')} className="text-indigo-600 hover:text-indigo-900 cursor-pointer">
                                                        Update Stock
                                                    </a>
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
        </AuthenticatedLayout>
    );
}
