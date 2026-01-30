import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import PublicLayout from '@/Layouts/PublicLayout'; // 👈 Layout එක Import කළා

// --- Types ---
interface Category {
    id: number;
    name: string;
    slug: string;
    image: string | null;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    base_price: string;
    selling_price?: string; // Added
    image: string | null;
    category?: Category;
}

interface HomeProps extends PageProps {
    categories: Category[];
    featuredProducts: Product[];
    auth: {
        user: any;
    };
    flashSale?: {
        name: string;
        discount_percentage: number;
        end_time: string;
        products: Product[]; // Added
    } | null;
    laravelVersion: string;
    phpVersion: string;
}

import CountdownTimer from '@/Components/CountdownTimer';

export default function HomeIndex({ categories, featuredProducts, auth, flashSale }: HomeProps) {
    return (
        // 👇 Navbar සහ Footer එක Layout එකෙන් එනවා
        <PublicLayout user={auth.user}>
            <Head title="Home" />

            {/* --- Hero Section --- */}
            <div className="bg-indigo-600">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 lg:flex lg:justify-between lg:items-center">
                    <div className="max-w-xl">
                        <h2 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                            {flashSale ? (
                                <span>
                                    <span className="block text-yellow-300">{flashSale.name}</span>
                                    {flashSale.products && flashSale.products.length > 0 ? (
                                        <span className="block text-2xl mt-2">Up to {flashSale.discount_percentage}% OFF on Selected Items!</span>
                                    ) : (
                                        <span className="block text-2xl mt-2">{flashSale.discount_percentage}% OFF Everything!</span>
                                    )}
                                </span>
                            ) : "New Arrivals are here"}
                        </h2>
                        <p className="mt-5 text-xl text-indigo-200">
                            {flashSale ? "Hurry up! Offer ends soon." : "Discover the latest trends in fashion. Upgrade your wardrobe with our premium collection of clothing."}
                        </p>
                        <div className="mt-10 w-full sm:w-auto">
                            <Link href={route('shop.index')} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10">
                                Shop Now
                            </Link>
                        </div>
                    </div>

                    {/* Timer Section (Only if Flash Sale is Active) */}
                    {flashSale && (
                        <div className="mt-10 lg:mt-0 lg:ml-10 bg-indigo-700/50 p-6 rounded-xl border border-indigo-400 backdrop-blur-sm">
                            <p className="text-indigo-100 font-semibold mb-2 text-center uppercase tracking-widest text-sm">Offer Ends In</p>
                            <CountdownTimer targetDate={flashSale.end_time} />
                        </div>
                    )}
                </div>
            </div>

            {/* --- Flash Sale Items Section --- */}
            {/* @ts-ignore */}
            {flashSale && flashSale.products && flashSale.products.length > 0 && (
                <div className="bg-red-50 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-extrabold tracking-tight text-red-700 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                On Sale Now!
                            </h2>
                            <Link href={route('shop.index')} className="text-red-600 hover:text-red-800 font-medium text-sm">View All Sales &rarr;</Link>
                        </div>

                        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                            {/* @ts-ignore */}
                            {flashSale.products.map((product) => (
                                <div key={product.id} className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                                    <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-t-lg overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none relative">
                                        <Link href={route('shop.show', product.slug)}>
                                            {product.image ? (
                                                <img
                                                    src={`/storage/${product.image}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-center object-cover lg:w-full lg:h-full cursor-pointer"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 cursor-pointer">
                                                    No Image
                                                </div>
                                            )}
                                        </Link>
                                        <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                            {flashSale.discount_percentage}% OFF
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-sm text-gray-700 font-semibold mb-1">
                                            <Link href={route('shop.show', product.slug)}>
                                                {product.name}
                                            </Link>
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-2">{product.category?.name}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-red-600">
                                                Rs. {((Number(product.base_price) * (100 - flashSale.discount_percentage)) / 100).toFixed(2)}
                                            </span>
                                            <span className="text-sm text-gray-400 line-through">
                                                Rs. {product.base_price}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- Categories Section --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">Shop by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {categories.map((category) => (
                        <div key={category.id} className="group relative cursor-pointer">
                            {/* Category Image Link */}
                            <Link href={route('shop.index', { category: category.slug })}>
                                <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden group-hover:opacity-75 relative">
                                    {category.image ? (
                                        <img
                                            src={`/storage/${category.image}`}
                                            alt={category.name}
                                            className="w-full h-full object-center object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                            No Image
                                        </div>
                                    )}
                                    {/* Overlay Text */}
                                    <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center">
                                        <span className="text-white font-bold text-lg tracking-wide">{category.name}</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Featured Products Section --- */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Featured Products</h2>

                    <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                        {featuredProducts.map((product) => (
                            <div key={product.id} className="group relative">
                                {/* 1. Link on the Image */}
                                <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                                    <Link href={route('shop.show', product.slug)}>
                                        {product.image ? (
                                            <img
                                                src={`/storage/${product.image}`}
                                                alt={product.name}
                                                className="w-full h-full object-center object-cover lg:w-full lg:h-full cursor-pointer"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 cursor-pointer">
                                                No Image
                                            </div>
                                        )}
                                    </Link>
                                    {/* Sale Badge */}
                                    {product.selling_price && Number(product.selling_price) < Number(product.base_price) && (
                                        <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                            SALE
                                        </span>
                                    )}
                                </div>

                                {/* 2. Link on the Text */}
                                <div className="mt-4 flex justify-between">
                                    <div>
                                        <h3 className="text-sm text-gray-700 font-semibold">
                                            <Link href={route('shop.show', product.slug)}>
                                                {product.name}
                                            </Link>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">{product.category?.name}</p>
                                    </div>
                                    <div className="text-right">
                                        {product.selling_price && Number(product.selling_price) < Number(product.base_price) ? (
                                            <>
                                                <p className="text-sm font-medium text-red-600">Rs. {product.selling_price}</p>
                                                <p className="text-xs text-gray-400 line-through">Rs. {product.base_price}</p>
                                            </>
                                        ) : (
                                            <p className="text-sm font-medium text-gray-900">Rs. {product.base_price}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </PublicLayout>
    );
}
