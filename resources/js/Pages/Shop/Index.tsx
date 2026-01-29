import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import PublicLayout from '@/Layouts/PublicLayout'; // 👈 Layout එක Import කළා

// Types
interface Category {
    id: number;
    name: string;
    slug: string;
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
    currentCategory: string | null;
    auth: { user: any };
}

export default function ShopIndex({ products, categories, currentCategory, auth }: ShopProps) {
    return (
        // 👇 Navbar සහ Footer එක Layout එකෙන් එනවා
        <PublicLayout user={auth.user}>
            <Head title="Shop" />

            {/* --- Main Content --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* --- Sidebar (Categories) --- */}
                    <div className="w-full md:w-1/4">
                        <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Categories</h3>
                            <ul className="space-y-2">
                                {/* All Products Link */}
                                <li>
                                    <Link
                                        href={route('shop.index')}
                                        className={`block px-3 py-2 rounded-md text-sm transition ${
                                            !currentCategory
                                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        All Products
                                    </Link>
                                </li>
                                {/* Dynamic Categories */}
                                {categories.map((cat) => (
                                    <li key={cat.id}>
                                        <Link
                                            href={route('shop.index', { category: cat.slug })}
                                            className={`block px-3 py-2 rounded-md text-sm transition ${
                                                currentCategory === cat.slug
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
                    </div>

                    {/* --- Product Grid --- */}
                    <div className="w-full md:w-3/4">
                        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {currentCategory
                                    ? `${categories.find(c => c.slug === currentCategory)?.name} Collection`
                                    : 'All Products'}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Showing {products.data.length} items
                            </p>
                        </div>

                        {products.data.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500 text-lg">No products found in this category.</p>
                                <Link href={route('shop.index')} className="text-indigo-600 hover:underline mt-2 inline-block">
                                    Browse all products
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
                                            className={`px-4 py-2 text-sm rounded border ${
                                                link.active
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
