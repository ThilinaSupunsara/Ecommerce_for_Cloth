import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 flex">

            {/* --------------------------------------------------------- */}
            {/* 1. LEFT SIDEBAR (Desktop Only) */}
            {/* --------------------------------------------------------- */}
            <aside className="w-64 bg-gray-900 text-white min-h-screen hidden md:flex flex-col flex-shrink-0">
                <div className="h-16 flex items-center justify-center border-b border-gray-800">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-wider text-white">
                        <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                        ADMIN PANEL
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {/* Dashboard Link */}
                    <Link
                        href={route('admin.dashboard')}
                        className={`block px-4 py-2 rounded transition ${
                            route().current('admin.dashboard') ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                    >
                        Dashboard
                    </Link>

                    {/* Orders Link */}
                    <Link
                        href={route('admin.orders.index')}
                        className={`block px-4 py-2 rounded transition ${
                            route().current('admin.orders.*') ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                    >
                        Orders Management
                    </Link>

                    {/* Products Link */}
                    <Link
                        href={route('admin.products.index')}
                        className={`block px-4 py-2 rounded transition ${
                            route().current('admin.products.*') ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                    >
                        Products
                    </Link>

                    {/* Divider & Shop Link */}
                    <div className="pt-4 mt-4 border-t border-gray-700">
                        <Link href="/" className="block px-4 py-2 rounded text-gray-400 hover:bg-gray-800 hover:text-white transition">
                            &larr; Go to Shop
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <div className="text-sm text-gray-500">Logged in as:</div>
                    <div className="font-medium text-gray-300">{user.name}</div>
                </div>
            </aside>


            {/* --------------------------------------------------------- */}
            {/* 2. MAIN CONTENT AREA */}
            {/* --------------------------------------------------------- */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* --- Top Navbar --- */}
                <nav className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">

                    {/* Mobile Hamburger Button */}
                    <div className="-me-2 flex items-center md:hidden">
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

                    <div className="flex-1"></div> {/* Spacer to push User Menu to right */}

                    {/* User Dropdown (Profile/Logout) */}
                    <div className="relative ms-3">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <span className="inline-flex rounded-md">
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                    >
                                        {user.name}
                                        <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </span>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </nav>

                {/* --- Mobile Navigation Menu (Shown when Hamburger clicked) --- */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' md:hidden bg-white border-b border-gray-200'}>
                    <div className="space-y-1 pb-3 pt-2 px-4">
                        <Link href={route('admin.dashboard')} className="block py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded">
                            Dashboard
                        </Link>
                        <Link href={route('admin.orders.index')} className="block py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded">
                            Orders
                        </Link>
                        <Link href={route('admin.products.index')} className="block py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded">
                            Products
                        </Link>
                    </div>
                    {/* Mobile User Info */}
                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">{user.name}</div>
                            <div className="text-sm font-medium text-gray-500">{user.email}</div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <Link href={route('profile.edit')} className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                                Profile
                            </Link>
                            <Link href={route('logout')} method="post" as="button" className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                                Log Out
                            </Link>
                        </div>
                    </div>
                </div>

                {/* --- Content Body --- */}
                <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
                    {header && (
                        <header className="mb-6">
                            <div className="text-2xl font-bold text-gray-800">{header}</div>
                        </header>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
