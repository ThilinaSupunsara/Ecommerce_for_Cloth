import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import PublicLayout from '@/Layouts/PublicLayout'; // 👈 Layout එක Import කළා

// Types
interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Size {
    id: number;
    name: string;
}

interface Color {
    id: number;
    name: string;
    code: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    base_price: string;
    image: string | null;
    category?: Category;
}

interface ShopProps extends PageProps {
    products: {
        data: Product[];
        links: any[]; // Laravel Pagination Links
    };
    categories: Category[];
    sizes: Size[];
    colors: Color[];
    filters: {
        search?: string;
        category?: string;
        min_price?: string;
        max_price?: string;
        size?: string[]; // Array of size IDs
        color?: string[]; // Array of color IDs
    };
    currentCategory: string | null;
    auth: { user: any };
}

export default function ShopIndex({ products, categories, sizes, colors, filters, currentCategory, auth }: ShopProps) {

    // Helper to update filters
    const updateFilters = (newFilters: any) => {
        router.get(route('shop.index'), { ...filters, ...newFilters }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle Checkbox Changes (Size/Color)
    const handleCheckboxChange = (type: 'size' | 'color', id: string, checked: boolean) => {
        const currentSelected = filters[type] ? (Array.isArray(filters[type]) ? filters[type] : [filters[type]]) : [];
        // @ts-ignore
        let newSelected = [...currentSelected];

        if (checked) {
            newSelected.push(id);
        } else {
            // @ts-ignore
            newSelected = newSelected.filter(item => item != id);
        }

        updateFilters({ [type]: newSelected });
    };

    const isChecked = (type: 'size' | 'color', id: number) => {
        const currentSelected = filters[type] ? (Array.isArray(filters[type]) ? filters[type] : [filters[type]]) : [];
        // @ts-ignore
        return currentSelected.includes(id.toString());
    };

    return (
        // 👇 Navbar සහ Footer එක Layout එකෙන් එනවා
        <PublicLayout user={auth.user}>
            <Head title="Shop" />

            {/* --- Main Content --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* --- Sidebar (Filters) --- */}
                    <div className="w-full md:w-1/4 space-y-6">
                        {/* Categories */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Categories</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href={route('shop.index')} // Reset all categories but keep other filters? Usually Reset Category
                                        className={`block px-3 py-2 rounded-md text-sm transition ${!currentCategory
                                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        All Products
                                    </Link>
                                </li>
                                {categories.map((cat) => (
                                    <li key={cat.id}>
                                        <Link
                                            href={route('shop.index', { category: cat.slug })} // This replaces filters usually, or we can merge
                                            className={`block px-3 py-2 rounded-md text-sm transition ${currentCategory === cat.slug
                                                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Price Filter */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Price Range</h3>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full rounded border-gray-300 text-sm"
                                    defaultValue={filters.min_price || ''}
                                    onBlur={(e) => updateFilters({ min_price: e.target.value })}
                                />
                                <span className="text-gray-500">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full rounded border-gray-300 text-sm"
                                    defaultValue={filters.max_price || ''}
                                    onBlur={(e) => updateFilters({ max_price: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Size Filter */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Size</h3>
                            <div className="space-y-2">
                                {sizes.map((size) => (
                                    <label key={size.id} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            checked={isChecked('size', size.id)}
                                            onChange={(e) => handleCheckboxChange('size', size.id.toString(), e.target.checked)}
                                        />
                                        <span className="text-sm text-gray-700">{size.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Color Filter */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Color</h3>
                            <div className="space-y-2">
                                {colors.map((color) => (
                                    <label key={color.id} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            checked={isChecked('color', color.id)}
                                            onChange={(e) => handleCheckboxChange('color', color.id.toString(), e.target.checked)}
                                        />
                                        <span className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: color.code }}></span>
                                        <span className="text-sm text-gray-700">{color.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- Product Grid --- */}
                    <div className="w-full md:w-3/4">
                        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {currentCategory
                                        ? `${categories.find(c => c.slug === currentCategory)?.name} Collection`
                                        : 'All Products'}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Showing {products.data.length} items
                                </p>
                            </div>

                            {/* Clear Filters Button */}
                            {(filters.min_price || filters.max_price || filters.size || filters.color || filters.search) && (
                                <Link
                                    href={route('shop.index')}
                                    className="text-sm text-red-600 hover:text-red-800 underline"
                                >
                                    Clear All Filters
                                </Link>
                            )}
                        </div>

                        {products.data.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                                <Link href={route('shop.index')} className="text-indigo-600 hover:underline mt-2 inline-block">
                                    Clear Filters
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.data.map((product) => (
                                    <div key={product.id} className="group relative bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                        <div className="w-full h-64 bg-gray-200 aspect-w-1 aspect-h-1 overflow-hidden group-hover:opacity-90">
                                            <Link href={route('shop.show', product.slug)}>
                                                {product.image ? (
                                                    <img
                                                        src={`/storage/${product.image}`}
                                                        alt={product.name}
                                                        className="w-full h-full object-center object-cover cursor-pointer"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 cursor-pointer">
                                                        No Image
                                                    </div>
                                                )}
                                            </Link>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                <Link href={route('shop.show', product.slug)}>
                                                    {product.name}
                                                </Link>
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">{product.category?.name}</p>
                                            <div className="mt-2 flex items-center justify-between">
                                                <p className="text-lg font-bold text-gray-900">Rs. {product.base_price}</p>
                                                <Link href={route('shop.show', product.slug)} className="text-sm text-indigo-600 font-medium">View Details &rarr;</Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* --- Pagination Links --- */}
                        {products.links.length > 3 && (
                            <div className="mt-8 flex justify-center">
                                <div className="flex gap-1">
                                    {products.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-4 py-2 text-sm rounded border ${link.active
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                            preserveScroll
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
