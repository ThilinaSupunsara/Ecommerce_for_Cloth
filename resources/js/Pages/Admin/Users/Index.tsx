import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

// Types Definition
interface Role {
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

interface Props extends PageProps {
    users: {
        data: User[];
    };
    // Flash message type එක හරියටම define කිරීම
    flash: {
        success?: string;
        error?: string;
        message?: string;
    };
}

export default function UserIndex({ users, flash }: Props) {
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [editUserId, setEditUserId] = useState<number | null>(null);

    const [showFlash, setShowFlash] = useState(false);


    useEffect(() => {
        if (flash?.success) {
            setShowFlash(true);


            const timer = setTimeout(() => {
                setShowFlash(false);
            }, 3000);


            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Form Handling using Inertia
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'store_manager',
    });

    // Modal එක Open කරන Function එක (Add & Edit දෙකටම)
    const openModal = (user?: User) => {
        clearErrors();
        if (user) {
            // Edit Mode
            setIsEditing(true);
            setEditUserId(user.id);
            setData({
                name: user.name,
                email: user.email,
                password: '', // Edit කරනකොට Password හිස්ව තියමු
                password_confirmation: '',
                role: user.roles[0]?.name || 'customer',
            });
        } else {
            // Add Mode
            setIsEditing(false);
            setEditUserId(null);
            reset();
            setData('role', 'store_manager');
        }
        setShowUserModal(true);
    };

    const closeModal = () => {
        setShowUserModal(false);
        reset();
    };

    // Submit Function (Add & Update දෙකම මෙතනින්)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && editUserId) {
            put(route('admin.users.update', editUserId), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.users.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    // Delete Confirmation පටන් ගන්න තැන
    const confirmDelete = (id: number) => {
        setUserToDelete(id);
        setShowDeleteModal(true);
    };

    // ඇත්තටම Delete කරන තැන
    const handleDelete = () => {
        if (userToDelete) {
            router.delete(route('admin.users.destroy', userToDelete), {
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">User Management</h2>}
        >
            <Head title="Users" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {showFlash && flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Success! </strong>
                            <span className="block sm:inline">{flash.success}</span>
                        </div>
                    )}

                    {/* Top Action Bar */}
                    <div className="flex justify-end mb-4">
                        <PrimaryButton onClick={() => openModal()}>
                            + Add New User
                        </PrimaryButton>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.data.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                ${user.roles[0]?.name === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                                                  user.roles[0]?.name === 'store_manager' ? 'bg-blue-100 text-blue-800' :
                                                  'bg-green-100 text-green-800'}`}>
                                                {user.roles[0]?.name === 'super_admin' ? 'Super Admin' :
                                                 user.roles[0]?.name === 'store_manager' ? 'Manager' : 'Customer'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openModal(user)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Edit
                                            </button>

                                            {/* Admin ව Delete කරන්න බැරි වෙන්න පොඩි check එකක් */}
                                            {user.roles[0]?.name !== 'super_admin' && (
                                                <button
                                                    onClick={() => confirmDelete(user.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* User Form Modal (Add & Edit) */}
            <Modal show={showUserModal} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {isEditing ? 'Edit User' : 'Add New User'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        {/* Name Input */}
                        <div className="mb-4">
                            <InputLabel htmlFor="name" value="Name" />
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                isFocused
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        {/* Email Input */}
                        <div className="mb-4">
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        {/* Role Select */}
                        <div className="mb-4">
                            <InputLabel htmlFor="role" value="Role" />
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"
                            >
                                <option value="store_manager">Store Manager</option>
                                <option value="customer">Customer</option>
                            </select>
                            <InputError message={errors.role} className="mt-2" />
                        </div>

                        {/* Password Input */}
                        <div className="mb-4">
                            <InputLabel htmlFor="password" value={isEditing ? "Password (Leave blank to keep current)" : "Password"} />
                            <TextInput
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Password Confirmation (Only for New Users or if changing PW) */}
                         <div className="mb-6">
                            <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="mt-1 block w-full"
                            />
                        </div>

                        {/* Form Buttons */}
                        <div className="flex justify-end mt-6">
                            <SecondaryButton onClick={closeModal} className="mr-3"> Cancel </SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                {isEditing ? 'Update User' : 'Save User'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Are you sure you want to delete this user?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Once this account is deleted, all of its resources and data will be permanently deleted.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}> Cancel </SecondaryButton>
                        <DangerButton className="ml-3" onClick={handleDelete}> Delete User </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
