import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // 👈 Admin ට Sidebar Layout එක
import { Head } from '@inertiajs/react';

export default function AdminDashboard({ auth }: any) {
    return (
        <AuthenticatedLayout
            
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Admin Dashboard</h2>}
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-bold text-indigo-600">Welcome, Boss! 🛠️</h3>
                            <p className="mt-2 text-gray-600">
                                You are logged in as <strong>{auth.user.roles[0]?.name}</strong>.
                            </p>
                            <p className="mt-4">
                                Use the navigation menu to manage Orders and Products.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
