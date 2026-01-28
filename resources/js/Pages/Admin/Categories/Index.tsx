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
import Checkbox from '@/Components/Checkbox'; // Breeze Checkbox එක import කරන්න

// Types Definitions
interface Category {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    is_active: boolean; // 1 or 0 -> boolean
}

interface Props extends PageProps {
    categories: {
        data: Category[];
        links: any[];
    };
    flash: {
        success?: string;
        error?: string;
    };
}

export default function CategoryIndex({ categories, flash }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [showFlash, setShowFlash] = useState(false);

    // Form Handling
    // වැදගත්: Image එකක් යවන නිසා මෙතන අපි _method එක පාවිච්චි කරනවා Edit වලදී
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        image: null as File | null, // Image file object එක
        is_active: true,
        _method: 'POST', // Update කරනකොට මේක 'PUT' කරනවා
    });

    // Flash Message Logic
    useEffect(() => {
        if (flash?.success) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Modal Open Function
    const openModal = (category?: Category) => {
        clearErrors();
        if (category) {
            // Edit Mode
            setIsEditing(true);
            setEditCategory(category);
            setData({
                name: category.name,
                image: null, // Edit කරනකොට අලුත් පින්තූරයක් තෝරනකම් මේක null
                is_active: Boolean(category.is_active), // 1/0 to true/false
                _method: 'PUT', // Laravel වලට කියනවා මේක Update එකක් කියලා
            });
        } else {
            // Add Mode
            setIsEditing(false);
            setEditCategory(null);
            reset();
            setData({
                name: '',
                image: null,
                is_active: true,
                _method: 'POST',
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        reset();
    };

    // Form Submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && editCategory) {
            // Edit (Image එක්ක Update කරන නිසා post method එකම පාවිච්චි කරනවා)
            // route එක විතරක් වෙනස් වෙනවා
            post(route('admin.categories.update', editCategory.id), {
                onSuccess: () => closeModal(),
                forceFormData: true, // Image Upload සඳහා අත්‍යවශ්‍යයි
            });
        } else {
            // Create
            post(route('admin.categories.store'), {
                onSuccess: () => closeModal(),
                forceFormData: true,
            });
        }
    };

    // Delete Logic
    const confirmDelete = (category: Category) => {
        setEditCategory(category);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (editCategory) {
            router.delete(route('admin.categories.destroy', editCategory.id), {
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Category Management</h2>}
        >
            <Head title="Categories" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Flash Message */}
                    {showFlash && flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            {flash.success}
                        </div>
                    )}

                    {/* Add Button */}
                    <div className="flex justify-end mb-4">
                        <PrimaryButton onClick={() => openModal()}>
                            + Add New Category
                        </PrimaryButton>
                    </div>

                    {/* Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {categories.data.map((category) => (
                                    <tr key={category.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {category.image ? (
                                                <img
                                                    src={`/storage/${category.image}`}
                                                    alt={category.name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                                    No Img
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                                        <td className="px-6 py-4 text-gray-500">{category.slug}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {category.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <button
                                                onClick={() => openModal(category)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(category)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {isEditing ? 'Edit Category' : 'Add New Category'}
                    </h2>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">

                        {/* Name */}
                        <div className="mb-4">
                            <InputLabel htmlFor="name" value="Category Name" />
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                isFocused
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        {/* Image Input */}
                        <div className="mb-4">
                            <InputLabel htmlFor="image" value="Category Image" />
                            <input
                                type="file"
                                id="image"
                                onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                                className="mt-1 block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            <InputError message={errors.image} className="mt-2" />
                            {isEditing && editCategory?.image && (
                                <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image.</p>
                            )}
                        </div>

                        {/* Active Status Checkbox */}
                        <div className="block mb-4">
                            <label className="flex items-center">
                                <Checkbox
                                    name="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                />
                                <span className="ml-2 text-sm text-gray-600">Active</span>
                            </label>
                        </div>

                        <div className="flex justify-end mt-6">
                            <SecondaryButton onClick={closeModal} className="mr-3"> Cancel </SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                {isEditing ? 'Update Category' : 'Save Category'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Delete Category?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Are you sure? This will delete the category image as well.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}> Cancel </SecondaryButton>
                        <DangerButton className="ml-3" onClick={handleDelete}> Delete </DangerButton>
                    </div>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}
