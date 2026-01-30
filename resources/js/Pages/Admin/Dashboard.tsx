import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS modules
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface DashboardProps {
    auth: any;
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    salesChart: { date: string; total: string }[];
    ordersChart: { date: string; count: number }[];
    topProducts: { name: string; total_sold: string }[];
}

export default function AdminDashboard({ auth, totalSales, totalOrders, totalCustomers, salesChart, ordersChart, topProducts }: DashboardProps) {

    // --- Chart Configurations ---

    // 1. Sales Line Chart
    const salesChartData = {
        labels: salesChart.map(data => data.date),
        datasets: [
            {
                label: 'Daily Sales (Rs.)',
                data: salesChart.map(data => parseFloat(data.total)),
                borderColor: 'rgb(79, 70, 229)', // Indigo 600
                backgroundColor: 'rgba(79, 70, 229, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const salesChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Monthly Sales Performance',
            },
        },
    };

    // 2. Orders Bar Chart
    const ordersChartData = {
        labels: ordersChart.map(data => data.date),
        datasets: [
            {
                label: 'Daily Orders',
                data: ordersChart.map(data => data.count),
                backgroundColor: 'rgba(236, 72, 153, 0.8)', // Pink 500
            },
        ],
    };

    const ordersChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Daily Orders Count',
            },
        },
    };

    // 3. Best Selling Products Pie Chart
    const pieChartData = {
        labels: topProducts.map(p => p.name),
        datasets: [
            {
                label: '# of Votes',
                data: topProducts.map(p => parseInt(p.total_sold)),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Admin Dashboard</h2>}
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* --- Stats Cards --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Total Sales */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-indigo-500">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Sales</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">Rs. {Number(totalSales).toLocaleString()}</p>
                        </div>
                        {/* Total Orders */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-pink-500">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Orders</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{totalOrders}</p>
                        </div>
                        {/* Total Customers */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-green-500">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Customers</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{totalCustomers}</p>
                        </div>
                    </div>

                    {/* --- Charts Section --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Sales Chart (Line) */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <Line options={salesChartOptions} data={salesChartData} />
                        </div>
                        {/* Orders Chart (Bar) */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <Bar options={ordersChartOptions} data={ordersChartData} />
                        </div>
                    </div>

                    {/* --- Bottom Section --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Best Selling Products (Pie) */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="font-bold text-lg mb-4 text-gray-800 text-center">Best Selling Products</h3>
                            <div className="max-w-xs mx-auto">
                                <Pie data={pieChartData} />
                            </div>
                        </div>

                        {/* Welcome / Quick Actions */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 flex flex-col justify-center items-center text-center">
                            <h3 className="text-lg font-bold text-indigo-600 mb-2">Welcome Back, {auth.user.name}!</h3>
                            <p className="text-gray-600">
                                You have full control over the platform. Use the sidebar to manage products, categories, and view detailed reports.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
