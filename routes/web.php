<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ColorController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductStockController;
use App\Http\Controllers\Admin\SizeController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ShopController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});*/
Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/shop', [ShopController::class, 'index'])->name('shop.index');

Route::get('/products/{slug}', [ShopController::class, 'show'])->name('shop.show');

Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
Route::post('/cart/coupon', [CartController::class, 'applyCoupon'])->name('cart.coupon.apply');
Route::delete('/cart/coupon', [CartController::class, 'removeCoupon'])->name('cart.coupon.remove'); // Specific route first
Route::delete('/cart/{cartItem}', [CartController::class, 'destroy'])->name('cart.destroy'); // Wildcard route last

/*Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');


});*/

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/checkout', [CheckoutController::class, 'create'])->name('checkout.create');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

    Route::get('/checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');
    Route::get('/checkout/cancel', [CheckoutController::class, 'cancel'])->name('checkout.cancel');
    Route::get('/checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');
    Route::get('/checkout/cancel', [CheckoutController::class, 'cancel'])->name('checkout.cancel');
    Route::post('/checkout/validate-coupon', [CheckoutController::class, 'validateCoupon'])->name('checkout.validate_coupon');

    Route::post('/products/{product}/reviews', [\App\Http\Controllers\ProductReviewController::class, 'store'])->name('products.reviews.store');

    // Wishlist Routes
    Route::get('/wishlist', [\App\Http\Controllers\WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist', [\App\Http\Controllers\WishlistController::class, 'store'])->name('wishlist.store');
    Route::delete('/wishlist/{wishlist}', [\App\Http\Controllers\WishlistController::class, 'destroy'])->name('wishlist.destroy');
});



Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth'])
    ->group(function () {

        // 1. Super Admin Routes
        Route::middleware(['role:super_admin'])->group(function () {
            Route::get('/users', [UserController::class, 'index'])->name('users.index');
            Route::post('/users', [UserController::class, 'store'])->name('users.store');
            Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
            Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        });

        // 2. Admin & Manager Routes
        Route::middleware(['role:super_admin|store_manager'])->group(function () {

            // Categories
            Route::resource('categories', CategoryController::class)->except(['create', 'edit', 'show']);
            Route::resource('products', ProductController::class)->except(['create', 'edit', 'show']);
            Route::resource('colors', ColorController::class)->except(['create', 'edit', 'show']);
            Route::resource('sizes', SizeController::class)->except(['create', 'edit', 'show']);
            Route::post('/products/{product}/stocks', [ProductStockController::class, 'store'])->name('products.stocks.store');
            Route::delete('/stocks/{productStock}', [ProductStockController::class, 'destroy'])->name('products.stocks.destroy');
            Route::delete('/products/stocks/bulk', [ProductStockController::class, 'bulkDestroy'])->name('products.stocks.bulk_destroy');

            Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
            Route::patch('/orders/{order}', [OrderController::class, 'update'])->name('orders.update');
            Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');

            // Reports
            Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
            Route::get('/reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
            Route::get('/reports/export/sales', [ReportController::class, 'exportSales'])->name('reports.export.sales');
            Route::get('/reports/export/orders', [ReportController::class, 'exportOrders'])->name('reports.export.orders');

            // Coupons
            Route::get('/coupons', [AdminCouponController::class, 'index'])->name('coupons.index');
            Route::post('/coupons', [AdminCouponController::class, 'store'])->name('coupons.store');
            Route::delete('/coupons/{coupon}', [AdminCouponController::class, 'destroy'])->name('coupons.destroy');
            Route::post('/coupons/{coupon}/toggle', [AdminCouponController::class, 'toggleStatus'])->name('coupons.toggle');

            // Flash Sales
            Route::get('/flash-sales', [\App\Http\Controllers\Admin\FlashSaleController::class, 'index'])->name('flash_sales.index');
            Route::post('/flash-sales', [\App\Http\Controllers\Admin\FlashSaleController::class, 'store'])->name('flash_sales.store');
            Route::put('/flash-sales/{flashSale}', [\App\Http\Controllers\Admin\FlashSaleController::class, 'update'])->name('flash_sales.update');
            Route::delete('/flash-sales/{flashSale}', [\App\Http\Controllers\Admin\FlashSaleController::class, 'destroy'])->name('flash_sales.destroy');
            Route::post('/flash-sales/{flashSale}/toggle', [\App\Http\Controllers\Admin\FlashSaleController::class, 'toggle'])->name('flash_sales.toggle');

            // Notifications
            Route::get('/notifications/{id}/read', [\App\Http\Controllers\Admin\NotificationController::class, 'markAsRead'])->name('notifications.read');

            Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        });

    });

require __DIR__ . '/auth.php';
