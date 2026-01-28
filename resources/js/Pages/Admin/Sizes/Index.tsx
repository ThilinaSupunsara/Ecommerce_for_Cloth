import React, { useState, useEffect } from 'react';
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

interface Size {
    id: number;
    name: string;
    code: string;
}

interface Props extends PageProps {
    sizes: Size[];
    flash: { success?: string };
}

export default function SizeIndex({ sizes, flash }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editSize, setEditSize] = useState<Size | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Flash Message Timer State
    const [showFlash, setShowFlash] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '', // උදා: S, M, XL
    });

    // Flash Message Timer Logic
    useEffect(() => {
        if (flash?.success) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const openModal = (size?: Size) => {
        clearErrors();
        if (size) {
            setIsEditing(true);
            setEditSize(size);
            setData({ name: size.name, code: size.code });
        } else {
            setIsEditing(false);
            setEditSize(null);
            reset();
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && editSize) {
            put(route('admin.sizes.update', editSize.id), { onSuccess: closeModal });
        } else {
            post(route('admin.sizes.store'), { onSuccess: closeModal });
        }
    };

    const handleDelete = () => {
        if (editSize) {
            router.delete(route('admin.sizes.destroy', editSize.id), {
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Size Management</h2>}
        >
            <Head title="Sizes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Success Message (with Timer) */}
                    {showFlash && flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {flash.success}
                        </div>
                    )}

                    <div className="flex justify-end mb-4">
                        <PrimaryButton onClick={() => openModal()}>+ Add New Size</PrimaryButton>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sizes.map((size) => (
                                    <tr key={size.id}>
                                        <td className="px-6 py-4">{size.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                {size.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openModal(size)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                            <button onClick={() => { setEditSize(size); setShowDeleteModal(true); }} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Size Modal */}
            <Modal show={showModal} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">{isEditing ? 'Edit Size' : 'Add New Size'}</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Name Input */}
                        <div className="mb-4">
                            <InputLabel htmlFor="name" value="Size Name (e.g. Small)" />
                            <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 block w-full" isFocused />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        {/* Code Input */}
                        <div className="mb-4">
                            <InputLabel htmlFor="code" value="Size Code (e.g. S, XL)" />
                            <TextInput id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} className="mt-1 block w-full" />
                            <InputError message={errors.code} className="mt-2" />
                        </div>

                        <div className="flex justify-end mt-6">
                            <SecondaryButton onClick={closeModal} className="mr-3">Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing}>{isEditing ? 'Update' : 'Save'}</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Delete Size?</h2>
                    <p className="mt-1 text-sm text-gray-600">Are you sure you want to delete this size?</p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>Cancel</SecondaryButton>
                        <DangerButton className="ml-3" onClick={handleDelete}>Delete</DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
