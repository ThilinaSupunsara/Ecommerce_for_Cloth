import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

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
    image: string | null;
    category?: Category;
}

interface HomeProps extends PageProps {
    categories: Category[];
    featuredProducts: Product[];
    auth: {
        user: any;
    };
    laravelVersion: string;
    phpVersion: string;
}

export default function HomeIndex({ categories, featuredProducts, auth }: HomeProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Home" />

            {/* --- Navigation Bar --- */}
            <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            {/* Logo */}
                            <div className="shrink-0 flex items-center">
                                <Link href="/" className="font-bold text-2xl text-indigo-600">
                                    CLOTHIFY
                                </Link>
                            </div>

                            {/* Navigation Links */}
                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <Link href={route('home')} className="inline-flex items-center px-1 pt-1 border-b-2 border-indigo-500 text-sm font-medium leading-5 text-gray-900 focus:outline-none transition duration-150 ease-in-out">
                                    Home
                                </Link>
                                <Link href={route('shop.index')} className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none transition duration-150 ease-in-out">
                                    Shop
                                </Link>
                            </div>
                        </div>

                        {/* Right Side (Dashboard / Login) */}
                        <div className="flex items-center">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="text-sm text-gray-700 underline">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="text-sm text-gray-700 hover:text-gray-900 mr-4">
                                        Log in
                                    </Link>
                                    <Link href={route('register')} className="ml-4 text-sm text-gray-700 hover:text-gray-900">
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- Hero Section --- */}
            <div className="bg-indigo-600">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 lg:flex lg:justify-between">
                    <div className="max-w-xl">
                        <h2 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                            New Arrivals are here
                        </h2>
                        <p className="mt-5 text-xl text-indigo-200">
                            Discover the latest trends in fashion. Upgrade your wardrobe with our premium collection of clothing.
                        </p>
                        <div className="mt-10 w-full sm:w-auto">
                            <Link href={route('shop.index')} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10">
                                Shop Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

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

            {/* --- Featured Products Section (Fixed Links) --- */}
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
                                    <p className="text-sm font-medium text-gray-900">Rs. {product.base_price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Footer --- */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p>&copy; 2026 CLOTHIFY. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
