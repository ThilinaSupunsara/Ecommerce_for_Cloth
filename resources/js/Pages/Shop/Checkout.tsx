import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react'; // Import router for manual visits
import { PageProps } from '@/types';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import PublicLayout from '@/Layouts/PublicLayout';

interface CartItem {
    id: number;
    quantity: number;
    price: string;
    product: { name: string; image: string | null; };
    stock: { color: { name: string }; size: { code: string }; };
}

interface Coupon {
    code: string;
    type: 'fixed' | 'percent';
    value: string;
}

interface CheckoutProps extends PageProps {
    cartItems: CartItem[];
    total: number;
    discount?: number;
    coupon?: Coupon;
    user: { name: string; email: string; };
    flash: { success?: string; error?: string };
    auth: { user: any };
}

import axios from 'axios'; // Add axios

export default function Checkout({ cartItems, total, user, flash, auth }: CheckoutProps) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: user?.name?.split(' ')[0] || '',
        last_name: user?.name?.split(' ')[1] || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        payment_method: 'cod',
        coupon_code: '', // Add coupon_code to form data
    });

    // Local State for Coupon Visualization
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponError, setCouponError] = useState('');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('checkout.store'));
    };

    const applyCoupon = async () => {
        if (!couponCodeInput) return;
        setCouponError('');

        try {
            const response = await axios.post(route('checkout.validate_coupon'), { code: couponCodeInput });
            const { valid, coupon, message } = response.data;

            if (valid) {
                setAppliedCoupon(coupon);

                // Calculate Discount locally for display
                let discount = 0;
                if (coupon.type === 'fixed') {
                    discount = parseFloat(coupon.value);
                } else {
                    discount = (total * parseFloat(coupon.value)) / 100;
                }
                setDiscountAmount(discount);

                // Update Form Data
                setData('coupon_code', coupon.code);
            }
        } catch (error: any) {
            setCouponError(error.response?.data?.message || 'Invalid coupon.');
            setAppliedCoupon(null);
            setDiscountAmount(0);
            setData('coupon_code', '');
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setData('coupon_code', '');
        setCouponCodeInput('');
        setCouponError('');
    };

    const finalTotal = Math.max(0, total - discountAmount);

    // Fallback for user if undefined (though it should be protected by middleware)
    const currentUser = auth?.user || user;

    if (!currentUser) {
        return <div>Loading user details...</div>;
    }

    return (
        <PublicLayout user={currentUser}>
            <Head title="Checkout" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                {flash?.error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error! </strong>
                        <span className="block sm:inline">{flash.error}</span>
                    </div>
                )}

                {flash?.success && (
                    <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Success! </strong>
                        <span className="block sm:inline">{flash.success}</span>
                    </div>
                )}

                <form onSubmit={submit} className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">

                    {/* --- Left: Shipping Details Form --- */}
                    <section className="lg:col-span-7 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900 mb-6">Shipping Information</h2>

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="first_name" value="First Name" />
                                <TextInput id="first_name" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} className="mt-1 block w-full" required />
                                <InputError message={errors.first_name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="last_name" value="Last Name" />
                                <TextInput id="last_name" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} className="mt-1 block w-full" required />
                                <InputError message={errors.last_name} className="mt-2" />
                            </div>

                            <div className="sm:col-span-2">
                                <InputLabel htmlFor="email" value="Email Address" />
                                <TextInput id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-1 block w-full" required />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="sm:col-span-2">
                                <InputLabel htmlFor="phone" value="Phone Number" />
                                <TextInput id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="mt-1 block w-full" required />
                                <InputError message={errors.phone} className="mt-2" />
                            </div>

                            <div className="sm:col-span-2">
                                <InputLabel htmlFor="address" value="Street Address" />
                                <TextInput id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} className="mt-1 block w-full" required />
                                <InputError message={errors.address} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="city" value="City" />
                                <TextInput id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} className="mt-1 block w-full" required />
                                <InputError message={errors.city} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="postal_code" value="Postal Code (Optional)" />
                                <TextInput id="postal_code" value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={errors.postal_code} className="mt-2" />
                            </div>
                        </div>

                        <h2 className="text-lg font-medium text-gray-900 mt-10 mb-6">Payment Method</h2>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    id="cod"
                                    name="payment_method"
                                    type="radio"
                                    checked={data.payment_method === 'cod'}
                                    onChange={() => setData('payment_method', 'cod')}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                />
                                <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                                    Cash on Delivery (COD)
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="card"
                                    name="payment_method"
                                    type="radio"
                                    checked={data.payment_method === 'card'}
                                    onChange={() => setData('payment_method', 'card')}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                />
                                <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700">
                                    Credit / Debit Card (via Stripe)
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* --- Right: Order Summary --- */}
                    <section className="mt-10 lg:mt-0 lg:col-span-5 space-y-6">
                        {/* Coupon Code Section */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-sm font-medium text-gray-900 mb-4">Have a coupon?</h2>
                            {couponError && (
                                <p className="text-red-500 text-sm mb-2">{couponError}</p>
                            )}
                            {appliedCoupon ? (
                                <div className="flex justify-between items-center bg-green-50 p-3 rounded border border-green-200">
                                    <span className="text-green-700 font-medium">
                                        Code <strong>{appliedCoupon.code}</strong> applied!
                                    </span>
                                    <button
                                        type="button"
                                        onClick={removeCoupon}
                                        className="text-red-500 text-sm hover:text-red-700 underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="flex space-x-2">
                                    <TextInput
                                        value={couponCodeInput}
                                        onChange={(e) => setCouponCodeInput(e.target.value)}
                                        placeholder="Enter coupon code"
                                        className="flex-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={applyCoupon}
                                        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                                    >
                                        Apply
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Order Details */}
                        <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                            <ul className="divide-y divide-gray-200">
                                {(cartItems || []).map((item) => (
                                    <li key={item.id} className="py-4 flex">
                                        <div className="flex-shrink-0">
                                            {item.product?.image ? (
                                                <img src={`/storage/${item.product.image}`} className="w-16 h-16 rounded object-cover" />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs">No Img</div>
                                            )}
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h3 className="text-sm font-medium text-gray-900">{item.product?.name ?? 'Unknown Product'}</h3>
                                            <p className="text-xs text-gray-500">
                                                {item.stock?.color?.name ?? 'N/A'} | {item.stock?.size?.code ?? 'N/A'}
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 mt-1">
                                                {item.quantity} x Rs. {item.price}
                                            </p>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">
                                            Rs. {(parseFloat(item.price || '0') * (item.quantity || 0)).toFixed(2)}
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            <div className="border-t border-gray-200 pt-4 mt-4 text-sm">
                                <div className="flex justify-between py-1">
                                    <dt className="text-gray-600">Subtotal</dt>
                                    <dd className="font-medium text-gray-900">Rs. {(total || 0).toFixed(2)}</dd>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between py-1 text-green-600">
                                        <dt>Discount</dt>
                                        <dd className="font-medium">- Rs. {(discountAmount).toFixed(2)}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between py-1 border-t border-gray-200 mt-2 font-bold text-lg">
                                    <dt>Total</dt>
                                    <dd className="text-indigo-600">Rs. {(finalTotal || 0).toFixed(2)}</dd>
                                </div>
                            </div>

                            <div className="mt-6">
                                <PrimaryButton className="w-full justify-center py-3" disabled={processing}>
                                    {processing ? 'Processing...' : 'Place Order'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </section>
                </form>
            </div>
        </PublicLayout>
    );
}
