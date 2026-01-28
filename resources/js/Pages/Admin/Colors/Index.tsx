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

interface Color {
    id: number;
    name: string;
    code: string;
}

interface Props extends PageProps {
    colors: Color[];
    flash: { success?: string };
}

export default function ColorIndex({ colors, flash }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editColor, setEditColor] = useState<Color | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFlash, setShowFlash] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '#000000', // Default Black
    });

    const openModal = (color?: Color) => {
        clearErrors();
        if (color) {
            setIsEditing(true);
            setEditColor(color);
            setData({ name: color.name, code: color.code });
        } else {
            setIsEditing(false);
            setEditColor(null);
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
        if (isEditing && editColor) {
            put(route('admin.colors.update', editColor.id), { onSuccess: closeModal });
        } else {
            post(route('admin.colors.store'), { onSuccess: closeModal });
        }
    };

    const handleDelete = () => {
        if (editColor) {
            router.delete(route('admin.colors.destroy', editColor.id), {
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Color Management</h2>}
        >
            <Head title="Colors" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Success Message */}
                        {showFlash && flash?.success && (  // 👈 මෙතන showFlash එකතු කරන්න
                            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                                {flash.success}
                            </div>
                        )}

                    <div className="flex justify-end mb-4">
                        <PrimaryButton onClick={() => openModal()}>+ Add New Color</PrimaryButton>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code / Preview</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {colors.map((color) => (
                                    <tr key={color.id}>
                                        <td className="px-6 py-4">{color.name}</td>
                                        <td className="px-6 py-4 flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded-full border border-gray-300 shadow-sm"
                                                style={{ backgroundColor: color.code }}
                                            ></div>
                                            <span className="text-gray-500 text-sm">{color.code}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openModal(color)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                            <button onClick={() => { setEditColor(color); setShowDeleteModal(true); }} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Color Modal */}
            <Modal show={showModal} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">{isEditing ? 'Edit Color' : 'Add New Color'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <InputLabel htmlFor="name" value="Color Name" />
                            <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 block w-full" isFocused />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div className="mb-4">
                            <InputLabel htmlFor="code" value="Color Picker" />
                            <div className="flex items-center gap-4 mt-1">
                                <input
                                    type="color"
                                    id="code"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    className="h-10 w-20 p-1 rounded border border-gray-300 cursor-pointer"
                                />
                                <span className="text-gray-600">{data.code}</span>
                            </div>
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
                    <h2 className="text-lg font-medium text-gray-900">Delete Color?</h2>
                    <p className="mt-1 text-sm text-gray-600">Are you sure you want to delete this color?</p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>Cancel</SecondaryButton>
                        <DangerButton className="ml-3" onClick={handleDelete}>Delete</DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
