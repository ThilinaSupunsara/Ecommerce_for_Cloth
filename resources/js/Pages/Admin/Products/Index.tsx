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
import Checkbox from '@/Components/Checkbox';

// --- Interfaces ---

interface Category {
    id: number;
    name: string;
}

interface Color {
    id: number;
    name: string;
    code: string;
}

interface Size {
    id: number;
    name: string;
    code: string;
}

interface Stock {
    id: number;
    color: Color;
    size: Size;
    quantity: number;
    price: string | null;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    category_id: number;
    category?: Category;
    base_price: string;
    image: string | null;
    description: string | null;
    is_active: boolean;
    is_featured: boolean;
    stocks: Stock[]; // Stock Relationship
}

interface Props extends PageProps {
    products: {
        data: Product[];
        links: any[];
    };
    categories: Category[];
    colors: Color[];
    sizes: Size[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function ProductIndex({ products, categories, colors, sizes, flash }: Props) {
    // --- States ---

    // Product Modal States
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);

    // Stock Modal States
    const [showStockModal, setShowStockModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

    // Stock Delete States
    const [showDeleteStockModal, setShowDeleteStockModal] = useState(false);
    const [stockToDelete, setStockToDelete] = useState<number | null>(null); // For Single Delete
    const [selectedStockIds, setSelectedStockIds] = useState<number[]>([]);   // For Bulk Delete

    // Flash Message State
    const [showFlash, setShowFlash] = useState(false);

    // Derived State for Stock Modal (Real-time Updates)
    const selectedProductForStock = products.data.find(p => p.id === selectedProductId) || null;

    // --- Forms ---

    // 1. Product Form
    const productForm = useForm({
        category_id: '',
        name: '',
        description: '',
        base_price: '',
        image: null as File | null,
        gallery_images: [] as File[],
        is_active: true,
        is_featured: false,
        _method: 'POST',
    });

    // 2. Stock Add Form
    const stockForm = useForm({
        color_id: '',
        size_id: '',
        quantity: '1',
        price: '',
    });

    // --- Effects ---

    useEffect(() => {
        if (flash?.success) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // --- Product Functions ---

    const openModal = (product?: Product) => {
        productForm.clearErrors();
        if (product) {
            setIsEditing(true);
            setEditProduct(product);
            productForm.setData({
                category_id: product.category_id.toString(),
                name: product.name,
                description: product.description || '',
                base_price: product.base_price,
                image: null,
                gallery_images: [],
                is_active: Boolean(product.is_active),
                is_featured: Boolean(product.is_featured),
                _method: 'PUT',
            });
        } else {
            setIsEditing(false);
            setEditProduct(null);
            productForm.reset();
            productForm.setData({
                category_id: categories.length > 0 ? categories[0].id.toString() : '',
                name: '',
                description: '',
                base_price: '',
                image: null,
                gallery_images: [],
                is_active: true,
                is_featured: false,
                _method: 'POST',
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        productForm.reset();
    };

    const handleProductSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && editProduct) {
            productForm.post(route('admin.products.update', editProduct.id), {
                onSuccess: () => closeModal(),
                forceFormData: true,
            });
        } else {
            productForm.post(route('admin.products.store'), {
                onSuccess: () => closeModal(),
                forceFormData: true,
            });
        }
    };

    const confirmDelete = (product: Product) => {
        setEditProduct(product);
        setShowDeleteModal(true);
    };

    const handleDeleteProduct = () => {
        if (editProduct) {
            router.delete(route('admin.products.destroy', editProduct.id), {
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    // --- Stock Functions ---

    const openStockModal = (product: Product) => {
        setSelectedProductId(product.id);
        setSelectedStockIds([]); // Clear selection
        stockForm.reset();
        setShowStockModal(true);
    };

    const handleStockSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProductForStock) {
            stockForm.post(route('admin.products.stocks.store', selectedProductForStock.id), {
                preserveScroll: true,
                onSuccess: () => stockForm.reset(),
            });
        }
    };

    // Checkbox Logic
    const handleSelectStock = (id: number) => {
        setSelectedStockIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked && selectedProductForStock) {
            setSelectedStockIds(selectedProductForStock.stocks.map(s => s.id));
        } else {
            setSelectedStockIds([]);
        }
    };

    // Delete Logic
    const confirmDeleteStock = (stockId: number) => {
        setStockToDelete(stockId);
        setShowDeleteStockModal(true);
    };

    const confirmBulkDelete = () => {
        if (selectedStockIds.length === 0) return;
        setStockToDelete(null); // Ensure single delete mode is off
        setShowDeleteStockModal(true);
    };

    const handleDeleteStock = () => {
        if (stockToDelete) {
            // Single Delete
            router.delete(route('admin.products.stocks.destroy', stockToDelete), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteStockModal(false);
                    setStockToDelete(null);
                },
            });
        } else if (selectedStockIds.length > 0) {
            // Bulk Delete
            router.delete(route('admin.products.stocks.bulk_destroy'), {
                data: { ids: selectedStockIds },
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteStockModal(false);
                    setSelectedStockIds([]);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Product Management</h2>}
        >
            <Head title="Products" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Flash Message */}
                    {showFlash && flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            {flash.success}
                        </div>
                    )}

                    {/* Add Product Button */}
                    <div className="flex justify-end mb-4">
                        <PrimaryButton onClick={() => openModal()}>
                            + Add New Product
                        </PrimaryButton>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.data.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.image ? (
                                                <img src={`/storage/${product.image}`} alt={product.name} className="h-12 w-12 rounded object-cover border" />
                                            ) : (
                                                <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">No Img</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {product.name}
                                            {product.is_featured && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Featured</span>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{product.category?.name || 'Uncategorized'}</td>
                                        <td className="px-6 py-4 text-gray-900 font-bold">Rs. {product.base_price}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            {/* Manage Stock Button */}
                                            <button onClick={() => openStockModal(product)} className="text-green-600 hover:text-green-900 mr-4 font-bold">
                                                Manage Stock
                                            </button>
                                            <button onClick={() => openModal(product)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                            <button onClick={() => confirmDelete(product)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- Product Modal (Add/Edit) --- */}
            <Modal show={showModal} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                    <form onSubmit={handleProductSubmit} encType="multipart/form-data">

                        <div className="mb-4">
                            <InputLabel htmlFor="category_id" value="Category" />
                            <select
                                id="category_id"
                                value={productForm.data.category_id}
                                onChange={(e) => productForm.setData('category_id', e.target.value)}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <InputError message={productForm.errors.category_id} className="mt-2" />
                        </div>

                        <div className="mb-4">
                            <InputLabel htmlFor="name" value="Product Name" />
                            <TextInput id="name" value={productForm.data.name} onChange={(e) => productForm.setData('name', e.target.value)} className="mt-1 block w-full" isFocused />
                            <InputError message={productForm.errors.name} className="mt-2" />
                        </div>

                        <div className="mb-4">
                            <InputLabel htmlFor="description" value="Description" />
                            <textarea
                                id="description"
                                value={productForm.data.description}
                                onChange={(e) => productForm.setData('description', e.target.value)}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"
                                rows={3}
                            />
                            <InputError message={productForm.errors.description} className="mt-2" />
                        </div>

                        <div className="mb-4">
                            <InputLabel htmlFor="base_price" value="Price (LKR)" />
                            <TextInput id="base_price" type="number" value={productForm.data.base_price} onChange={(e) => productForm.setData('base_price', e.target.value)} className="mt-1 block w-full" />
                            <InputError message={productForm.errors.base_price} className="mt-2" />
                        </div>

                        <div className="mb-4">
                            <InputLabel htmlFor="image" value="Main Image (Cover)" />
                            <input
                                type="file"
                                onChange={(e) => productForm.setData('image', e.target.files ? e.target.files[0] : null)}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <InputError message={productForm.errors.image} className="mt-2" />
                        </div>

                        <div className="mb-4">
                            <InputLabel htmlFor="gallery_images" value="Gallery Images (Select Multiple)" />
                            <input
                                type="file"
                                multiple
                                onChange={(e) => {
                                    if (e.target.files) {
                                        productForm.setData('gallery_images', Array.from(e.target.files));
                                    }
                                }}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                            <InputError message={productForm.errors.gallery_images} className="mt-2" />
                        </div>

                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center">
                                <Checkbox name="is_active" checked={productForm.data.is_active} onChange={(e) => productForm.setData('is_active', e.target.checked)} />
                                <span className="ml-2 text-sm text-gray-600">Active</span>
                            </label>
                            <label className="flex items-center">
                                <Checkbox name="is_featured" checked={productForm.data.is_featured} onChange={(e) => productForm.setData('is_featured', e.target.checked)} />
                                <span className="ml-2 text-sm text-gray-600">Featured</span>
                            </label>
                        </div>

                        <div className="flex justify-end mt-6">
                            <SecondaryButton onClick={closeModal} className="mr-3">Cancel</SecondaryButton>
                            <PrimaryButton disabled={productForm.processing}>{isEditing ? 'Update Product' : 'Save Product'}</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* --- Product Delete Modal --- */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Delete Product?</h2>
                    <p className="mt-1 text-sm text-gray-600">Are you sure? This will delete all images and stock associated with this product.</p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>Cancel</SecondaryButton>
                        <DangerButton className="ml-3" onClick={handleDeleteProduct}>Delete</DangerButton>
                    </div>
                </div>
            </Modal>

            {/* --- Manage Stock Modal --- */}
            <Modal show={showStockModal} onClose={() => { setShowStockModal(false); setSelectedProductId(null); }}>
                <div className="p-6 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Manage Stock: {selectedProductForStock?.name}
                    </h2>

                    {/* Stock Add Form */}
                    <form onSubmit={handleStockSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg border">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">Add New Stock</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <InputLabel value="Color" />
                                <select
                                    value={stockForm.data.color_id}
                                    onChange={(e) => stockForm.setData('color_id', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                    required
                                >
                                    <option value="">Select Color</option>
                                    {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Size" />
                                <select
                                    value={stockForm.data.size_id}
                                    onChange={(e) => stockForm.setData('size_id', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                    required
                                >
                                    <option value="">Select Size</option>
                                    {sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Quantity" />
                                <TextInput
                                    type="number"
                                    value={stockForm.data.quantity}
                                    onChange={(e) => stockForm.setData('quantity', e.target.value)}
                                    className="w-full"
                                    required
                                    min="1"
                                />
                            </div>
                            <div>
                                <InputLabel value="Price (Optional)" />
                                <TextInput
                                    type="number"
                                    value={stockForm.data.price}
                                    onChange={(e) => stockForm.setData('price', e.target.value)}
                                    className="w-full"
                                    placeholder="Base Price"
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <PrimaryButton disabled={stockForm.processing}>+ Add to Stock</PrimaryButton>
                        </div>
                    </form>

                    {/* Stock Inventory Table */}
                    <h3 className="text-sm font-bold text-gray-700 mb-2">Current Stock Inventory</h3>

                    {/* Bulk Delete Bar */}
                    {selectedStockIds.length > 0 && (
                        <div className="mb-3 flex justify-between items-center bg-red-50 p-2 rounded border border-red-200 animate-fade-in">
                            <span className="text-sm text-red-700 font-medium ml-2">
                                {selectedStockIds.length} items selected
                            </span>
                            <DangerButton
                                onClick={confirmBulkDelete}
                                className="px-2 py-1 text-xs" 
                            >
                                Delete Selected ({selectedStockIds.length})
                            </DangerButton>
                        </div>
                    )}

                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full text-sm divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 w-8">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 cursor-pointer"
                                            onChange={handleSelectAll}
                                            checked={
                                                selectedProductForStock?.stocks.length! > 0 &&
                                                selectedStockIds.length === selectedProductForStock?.stocks.length
                                            }
                                        />
                                    </th>
                                    <th className="px-4 py-2 text-left">Color</th>
                                    <th className="px-4 py-2 text-left">Size</th>
                                    <th className="px-4 py-2 text-left">Qty</th>
                                    <th className="px-4 py-2 text-left">Price</th>
                                    <th className="px-4 py-2 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {selectedProductForStock?.stocks.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500 italic">
                                            No stock added yet.
                                        </td>
                                    </tr>
                                ) : (
                                    selectedProductForStock?.stocks.map((stock) => (
                                        <tr key={stock.id} className={selectedStockIds.includes(stock.id) ? "bg-indigo-50" : "hover:bg-gray-50 transition-colors"}>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 cursor-pointer"
                                                    checked={selectedStockIds.includes(stock.id)}
                                                    onChange={() => handleSelectStock(stock.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: stock.color.code }}></div>
                                                    <span className="font-medium text-gray-700">{stock.color.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold">{stock.size.code}</span></td>
                                            <td className="px-4 py-3 font-semibold">{stock.quantity}</td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {stock.price ? <span className="text-green-600 font-medium">Rs. {stock.price}</span> : <span className="text-gray-400 text-xs">- Base -</span>}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => confirmDeleteStock(stock.id)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200"
                                                    title="Remove Stock"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => { setShowStockModal(false); setSelectedProductId(null); }}>Close</SecondaryButton>
                    </div>
                </div>
            </Modal>

            {/* --- Stock Delete Confirmation Modal --- */}
            <Modal show={showDeleteStockModal} onClose={() => setShowDeleteStockModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        {stockToDelete ? "Remove Stock Item?" : "Remove Selected Items?"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        {stockToDelete
                            ? "Are you sure you want to remove this stock variation?"
                            : `Are you sure you want to remove these ${selectedStockIds.length} items?`
                        }
                        This action cannot be undone.
                    </p>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteStockModal(false)}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton className="ml-3" onClick={handleDeleteStock}>
                            {stockToDelete ? "Delete Stock" : "Delete Selected"}
                        </DangerButton>
                    </div>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}
