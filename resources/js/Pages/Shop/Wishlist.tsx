import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

interface WishlistItem {
    id: number;
    product: {
        id: number;
        name: string;
        base_price: string;
        image: string;
        slug: string;
    };
}

export default function Wishlist({ wishlistItems, auth }: { wishlistItems: WishlistItem[], auth: any }) {

    const removeFromWishlist = (id: number) => {
        if (confirm('Remove this item from wishlist?')) {
            router.delete(route('wishlist.destroy', id));
        }
    };

    return (
        <PublicLayout user={auth.user}>
            <Head title="My Wishlist" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

                {wishlistItems.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">Your wishlist is empty.</p>
                        <Link href={route('shop.index')} className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 font-medium">
                            Browse Products &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="group relative bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200">
                                <div className="aspect-w-1 aspect-h-1 bg-gray-200 group-hover:opacity-75 h-64 overflow-hidden">
                                    {item.product.image ? (
                                        <img
                                            src={`/storage/${item.product.image}`}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover object-center"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">
                                            <Link href={route('shop.show', item.product.slug)}>
                                                <span aria-hidden="true" className="absolute inset-0" />
                                                {item.product.name}
                                            </Link>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">Rs. {item.product.base_price}</p>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center relative z-10">
                                        <Link
                                            href={route('shop.show', item.product.slug)}
                                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                        >
                                            View Product
                                        </Link>
                                        <button
                                            onClick={() => removeFromWishlist(item.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium z-10"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
