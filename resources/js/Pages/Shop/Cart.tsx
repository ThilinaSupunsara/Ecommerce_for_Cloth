import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react'; // Import useState
import { PageProps } from '@/types';
import PublicLayout from '@/Layouts/PublicLayout';
import Modal from '@/Components/Modal'; // Import UI Components
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

// --- Types ---
interface Color { name: string; code: string; }
interface Size { name: string; code: string; }
interface Stock { color: Color; size: Size; }
interface Product { name: string; slug: string; image: string | null; }

interface CartItem {
    id: number;
    quantity: number;
    price: string;
    product: Product;
    stock: Stock;
}

interface CartProps extends PageProps {
    cartItems: CartItem[];
    auth: { user: any };
}

export default function Cart({ cartItems, auth }: CartProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    // Subtotal Calculation
    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    // Remove Item Logic
    const confirmRemoveItem = (id: number) => {
        setItemToDelete(id);
        setShowDeleteModal(true);
    };

    const removeItem = () => {
        if (itemToDelete) {
            router.delete(route('cart.destroy', itemToDelete), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                }
            });
        }
    };

    return (
        <PublicLayout user={auth.user}>
            <Head title="Shopping Cart" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                {cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                        <p className="mt-1 text-sm text-gray-500">Start adding some trendy clothes!</p>
                        <div className="mt-6">
                            <Link href={route('shop.index')} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                Go to Shop
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                        <section className="lg:col-span-7">
                            <ul className="border-t border-b border-gray-200 divide-y divide-gray-200">
                                {cartItems.map((item) => (
                                    <li key={item.id} className="flex py-6 sm:py-10">
                                        <div className="flex-shrink-0">
                                            {item.product.image ? (
                                                <img src={`/storage/${item.product.image}`} alt={item.product.name} className="w-24 h-24 rounded-md object-center object-cover sm:w-32 sm:h-32" />
                                            ) : (
                                                <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">No Img</div>
                                            )}
                                        </div>

                                        <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                                            <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                                <div>
                                                    <div className="flex justify-between">
                                                        <h3 className="text-sm">
                                                            <Link href={route('shop.show', item.product.slug)} className="font-medium text-gray-700 hover:text-gray-800">
                                                                {item.product.name}
                                                            </Link>
                                                        </h3>
                                                    </div>
                                                    <div className="mt-1 flex text-sm">
                                                        <p className="text-gray-500 border-r border-gray-200 pr-2 mr-2">{item.stock.color.name}</p>
                                                        <p className="text-gray-500">{item.stock.size.code}</p>
                                                    </div>
                                                    <p className="mt-1 text-sm font-medium text-gray-900">Rs. {item.price}</p>
                                                </div>

                                                <div className="mt-4 sm:mt-0 sm:pr-9">
                                                    <label className="sr-only">Quantity</label>
                                                    <p className="text-sm text-gray-600">Qty: <span className="font-bold">{item.quantity}</span></p>

                                                    <div className="absolute top-0 right-0">
                                                        <button
                                                            onClick={() => confirmRemoveItem(item.id)}
                                                            type="button"
                                                            className="-m-2 p-2 inline-flex text-gray-400 hover:text-gray-500"
                                                        >
                                                            <span className="sr-only">Remove</span>
                                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="mt-16 bg-gray-100 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5">
                            <h2 id="summary-heading" className="text-lg font-medium text-gray-900">Order summary</h2>
                            <dl className="mt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600">Subtotal</dt>
                                    <dd className="text-sm font-medium text-gray-900">Rs. {subtotal.toFixed(2)}</dd>
                                </div>
                                <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                                    <dt className="text-base font-medium text-gray-900">Order Total</dt>
                                    <dd className="text-base font-medium text-gray-900">Rs. {subtotal.toFixed(2)}</dd>
                                </div>
                            </dl>
                            <div className="mt-6">
                                <Link href={route('checkout.create')} className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 block text-center">
                                    Checkout
                                </Link>
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-xs text-gray-500">Shipping and taxes calculated at checkout.</p>
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Remove Item?</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Are you sure you want to remove this item from your cart?
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>Cancel</SecondaryButton>
                        <DangerButton className="ml-3" onClick={removeItem}>Remove</DangerButton>
                    </div>
                </div>
            </Modal>
        </PublicLayout>
    );
}
