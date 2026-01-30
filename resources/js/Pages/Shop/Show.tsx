import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';

// --- Types ---
interface Color { id: number; name: string; code: string; }
interface Size { id: number; name: string; code: string; }
interface Stock {
    id: number; color: Color; size: Size; quantity: number; price: string | null;
}
interface ProductImage { id: number; image_path: string; }
interface Review { id: number; user: { name: string }; rating: number; comment: string; created_at: string; }
interface Product {
    id: number; name: string; slug: string;
    base_price: string; selling_price: number; sale_percentage: number; // Added new props
    description: string;
    image: string | null; category?: { name: string; slug: string };
    images: ProductImage[];
    stocks: Stock[];
    reviews: Review[];
}

interface Props extends PageProps {
    product: Product;
    relatedProducts: Product[];
    auth: { user: any };
    hasPurchased: boolean;
}

export default function ProductShow({ product, relatedProducts, auth, hasPurchased }: Props) {
    // States
    const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
    const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
    const [mainImage, setMainImage] = useState(product.image ? `/storage/${product.image}` : null);

    // Logic: පාටක් තෝරලා තියෙනකොට, ඒකට අදාළ Stock Items ටික ගන්න
    const availableStocksForColor = selectedColorId
        ? product.stocks.filter(s => s.color.id === selectedColorId)
        : [];

    // Logic: පාටක් තේරුවම, ඒ පාටට තියෙන Sizes ටික හොයාගන්න
    const availableSizeIds = availableStocksForColor.map(s => s.size.id);

    // Logic: අවසාන Price එක (සමහර විට පාට/සයිස් අනුව මිල වෙනස් වෙන්න පුළුවන්)
    const currentStock = product.stocks.find(s => s.color.id === selectedColorId && s.size.id === selectedSizeId);
    const baseFinalPrice = currentStock?.price ? Number(currentStock.price) : Number(product.base_price);

    // Apply Flash Sale Discount if active
    const isSaleActive = product.sale_percentage > 0;
    const finalPrice = isSaleActive
        ? (baseFinalPrice - (baseFinalPrice * product.sale_percentage / 100)).toFixed(2)
        : baseFinalPrice.toFixed(2);

    const maxQty = currentStock ? currentStock.quantity : 0;

    const { data, setData, post, processing } = useForm({
        product_id: product.id,
        color_id: '',
        size_id: '',
        quantity: 1,
    });


    useEffect(() => {
        if (selectedColorId) setData('color_id', selectedColorId.toString());
    }, [selectedColorId]);

    useEffect(() => {
        if (selectedSizeId) setData('size_id', selectedSizeId.toString());
    }, [selectedSizeId]);


    const addToCart = () => {
        post(route('cart.store'), {
            preserveScroll: true,
            onSuccess: () => alert('Added to cart successfully!'),
        });
    };

    // Reset size when color changes
    useEffect(() => {
        setSelectedSizeId(null);
    }, [selectedColorId]);


    const uniqueColors = Array.from(new Map(product.stocks.map(s => [s.color.id, s.color])).values());

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={product.name} />

            {/* Navbar (Simple Version) */}
            <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
                    <Link href="/" className="font-bold text-2xl text-indigo-600">CLOTHIFY</Link>
                    <div className="flex space-x-4">
                        <Link href={route('shop.index')} className="text-gray-600 hover:text-gray-900">Back to Shop</Link>
                        {auth.user ? (
                            <Link href={route('dashboard')} className="text-gray-600 underline">Dashboard</Link>
                        ) : (
                            <Link href={route('login')} className="text-gray-600">Log in</Link>
                        )}
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="md:flex">

                        {/* --- Left: Image Gallery --- */}
                        <div className="md:w-1/2 p-8">
                            {/* Main Image */}
                            <div className="h-96 rounded-lg bg-gray-100 overflow-hidden mb-4 border relative">
                                {mainImage ? (
                                    <img src={mainImage} alt={product.name} className="w-full h-full object-contain" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                )}
                            </div>
                            {/* Thumbnails */}
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {/* Cover Image Thumbnail */}
                                {product.image && (
                                    <button
                                        onClick={() => setMainImage(`/storage/${product.image}`)}
                                        className={`w-20 h-20 flex-shrink-0 rounded-md border-2 overflow-hidden ${mainImage === `/storage/${product.image}` ? 'border-indigo-500' : 'border-transparent'}`}
                                    >
                                        <img src={`/storage/${product.image}`} className="w-full h-full object-cover" />
                                    </button>
                                )}
                                {/* Gallery Images */}
                                {product.images.map((img) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setMainImage(`/storage/${img.image_path}`)}
                                        className={`w-20 h-20 flex-shrink-0 rounded-md border-2 overflow-hidden ${mainImage === `/storage/${img.image_path}` ? 'border-indigo-500' : 'border-transparent'}`}
                                    >
                                        <img src={`/storage/${img.image_path}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* --- Right: Product Details --- */}
                        <div className="md:w-1/2 p-8 bg-gray-50/50">
                            {/* Category & Name */}
                            <p className="text-sm text-indigo-600 font-semibold mb-1 uppercase tracking-wide">
                                {product.category?.name || 'General'}
                            </p>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{product.name}</h1>

                            {/* Price */}
                            <div className="mb-6">
                                {isSaleActive ? (
                                    <div className="flex items-center gap-3">
                                        <p className="text-3xl font-bold text-red-600">Rs. {finalPrice}</p>
                                        <p className="text-xl text-gray-400 line-through">Rs. {baseFinalPrice.toFixed(2)}</p>
                                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                            {product.sale_percentage}% OFF
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">
                                        Rs. {finalPrice}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="prose prose-sm text-gray-500 mb-8">
                                <p>{product.description}</p>
                            </div>

                            <hr className="border-gray-200 mb-8" />

                            {/* --- Color Selection --- */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
                                <div className="flex items-center space-x-3">
                                    {uniqueColors.length > 0 ? uniqueColors.map((color) => (
                                        <button
                                            key={color.id}
                                            onClick={() => setSelectedColorId(color.id)}
                                            className={`relative w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${selectedColorId === color.id ? 'ring-2 ring-offset-2 ring-indigo-500' : 'border border-gray-200'
                                                }`}
                                            style={{ backgroundColor: color.code }}
                                            title={color.name}
                                        />
                                    )) : (
                                        <span className="text-sm text-red-500">Out of Stock</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Selected: <span className="font-medium text-gray-900">{uniqueColors.find(c => c.id === selectedColorId)?.name || 'None'}</span>
                                </p>
                            </div>

                            {/* --- Size Selection --- */}
                            <div className="mb-8">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
                                <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 lg:grid-cols-4">
                                    {/* අපි හැම Stock එකේම තියෙන Unique Sizes ටික ගන්නවා */}
                                    {Array.from(new Map(product.stocks.map(s => [s.size.id, s.size])).values()).map((size) => {
                                        // මේ සයිස් එක, තෝරපු පාටට available ද?
                                        const isAvailable = selectedColorId ? availableSizeIds.includes(size.id) : false;

                                        return (
                                            <button
                                                key={size.id}
                                                onClick={() => isAvailable && setSelectedSizeId(size.id)}
                                                disabled={!isAvailable} // පාට තෝරලා නැත්නම් හෝ ඒ පාටට මේ සයිස් එක නැත්නම් Disable වෙනවා
                                                className={`group relative border rounded-md py-3 px-4 flex items-center justify-center text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1
                                                    ${isAvailable
                                                        ? (selectedSizeId === size.id ? 'bg-indigo-600 border-transparent text-white hover:bg-indigo-700' : 'bg-white border-gray-200 text-gray-900')
                                                        : 'bg-gray-50 text-gray-200 cursor-not-allowed decoration-2 line-through'
                                                    }`}
                                            >
                                                {size.code}
                                            </button>
                                        );
                                    })}
                                </div>
                                {!selectedColorId && <p className="text-xs text-red-500 mt-1">Please select a color first to see available sizes.</p>}
                            </div>

                            {/* --- Add to Cart Button --- */}
                            <div className="flex gap-4">
                                <button
                                    className={`w-full flex items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${selectedColorId && selectedSizeId
                                        ? 'bg-indigo-600 hover:bg-indigo-700'
                                        : 'bg-gray-400 cursor-not-allowed'
                                        }`}
                                    disabled={!selectedColorId || !selectedSizeId || processing} // processing වෙනකොට disable කරනවා
                                    onClick={addToCart}
                                >
                                    {processing ? 'Adding...' : 'Add to Cart'}
                                </button>
                            </div>
                            {selectedColorId && selectedSizeId && (
                                <p className="mt-2 text-sm text-green-600">
                                    {maxQty} items available in stock.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Reviews Section --- */}
                <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

                    {/* Review List */}
                    <div className="space-y-8">
                        {product.reviews && product.reviews.length > 0 ? (
                            product.reviews.map((review) => (
                                <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                                    <div className="flex items-center mb-2">
                                        <div className="font-semibold text-gray-900 mr-2">{review.user.name}</div>
                                        <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center mb-3">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`h-5 w-5 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600">{review.comment}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                        )}
                    </div>
                </div>

                {/* --- Related Products --- */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16 border-t pt-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((p) => (
                                <Link key={p.id} href={route('shop.show', p.slug)} className="group">
                                    <div className="w-full h-60 bg-gray-200 rounded-lg overflow-hidden mb-4">
                                        {p.image ? (
                                            <img src={`/storage/${p.image}`} className="w-full h-full object-cover group-hover:opacity-75" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900">{p.name}</h3>
                                    <p className="text-sm text-gray-500">Rs. {p.base_price}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


