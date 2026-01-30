import React, { PropsWithChildren, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown'; // 👈 Dropdown එක Import කරන්න

interface Props {
    user: any;
}

export default function PublicLayout({ user, children }: PropsWithChildren<Props>) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">

            {/* --- Navbar --- */}
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

                            {/* Desktop Navigation Links */}
                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <Link href={route('home')} className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out ${route().current('home') ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    Home
                                </Link>
                                <Link href={route('shop.index')} className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out ${route().current('shop.index') ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    Shop
                                </Link>
                            </div>
                        </div>

                        {/* Search Bar (Desktop) */}
                        <div className="hidden sm:flex items-center flex-1 max-w-md mx-8">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                // @ts-ignore
                                const query = e.target.search.value;
                                router.get(route('shop.index'), { search: query }, { preserveState: true });
                            }} className="w-full relative">
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search products..."
                                    className="w-full rounded-full border-gray-300 pl-10 pr-4 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                // defaultValue={route().params.search} // Valid if params exist
                                />
                                <div className="absolute left-3 top-2.5 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </form>
                        </div>

                        {/* Right Side (Cart / Login) - Desktop */}
                        <div className="hidden sm:flex items-center space-x-6">
                            {/* Wishlist Icon */}
                            <Link href={route('wishlist.index')} className="text-gray-500 hover:text-red-600 relative">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </Link>

                            {/* Cart Icon */}
                            <Link href={route('cart.index')} className="text-gray-500 hover:text-indigo-600 relative">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </Link>

                            {/* 👇 Auth Links (Dropdown for Desktop) */}
                            {user ? (
                                <div className="relative ms-3">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                                >
                                                    {user.name}
                                                    <svg
                                                        className="ms-2 -me-0.5 h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content>
                                            <Dropdown.Link href={route('dashboard')}>
                                                My Account (Orders)
                                            </Dropdown.Link>
                                            <Dropdown.Link href={route('profile.edit')}>
                                                Profile Settings
                                            </Dropdown.Link>
                                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                                Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            ) : (
                                <div className="space-x-4">
                                    <Link href={route('login')} className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                                        Log in
                                    </Link>
                                    <Link href={route('register')} className="text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-700">
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button (Hamburger) */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <Link href={route('cart.index')} className="text-gray-500 mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </Link>
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Mobile Menu (Shown when toggled) --- */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="space-y-1 pb-3 pt-2">
                        {/* Mobile Search */}
                        <div className="px-4 pb-2">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                // @ts-ignore
                                const query = e.target.mobile_search.value;
                                router.get(route('shop.index'), { search: query }, { preserveState: true });
                            }} className="w-full relative">
                                <input
                                    type="text"
                                    name="mobile_search"
                                    placeholder="Search products..."
                                    className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <div className="absolute left-3 top-2.5 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </form>
                        </div>

                        <Link href={route('home')} className="block py-2 px-4 text-base font-medium text-gray-700 hover:bg-gray-50">
                            Home
                        </Link>
                        <Link href={route('shop.index')} className="block py-2 px-4 text-base font-medium text-gray-700 hover:bg-gray-50">
                            Shop
                        </Link>
                    </div>

                    {/* Mobile Auth Links */}
                    <div className="border-t border-gray-200 pt-4 pb-1">
                        {user ? (
                            <div className="px-4">
                                <div className="text-base font-medium text-gray-800">{user.name}</div>
                                <div className="text-sm font-medium text-gray-500">{user.email}</div>
                                <div className="mt-3 space-y-1">
                                    <Link href={route('dashboard')} className="block py-2 text-base font-medium text-gray-500 hover:text-gray-800">
                                        My Account
                                    </Link>
                                    <Link href={route('logout')} method="post" as="button" className="block w-full text-left py-2 text-base font-medium text-gray-500 hover:text-gray-800">
                                        Log Out
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-3 space-y-1 px-4">
                                <Link href={route('login')} className="block py-2 text-base font-medium text-gray-500 hover:text-gray-800">
                                    Log in
                                </Link>
                                <Link href={route('register')} className="block py-2 text-base font-medium text-indigo-600 hover:text-indigo-800">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* --- Main Content --- */}
            <main className="flex-grow">
                {children}
            </main>

            {/* --- Footer --- */}
            <footer className="bg-gray-800 text-white py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <span className="font-bold text-xl">CLOTHIFY</span>
                        <p className="text-sm text-gray-400 mt-1">Your favorite fashion destination.</p>
                    </div>
                    <div className="text-sm text-gray-400">
                        &copy; 2026 CLOTHIFY. All rights reserved.
                    </div>
                </div>
            </footer>

        </div>
    );
}
