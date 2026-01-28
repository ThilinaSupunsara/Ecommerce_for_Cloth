<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ColorController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductStockController;
use App\Http\Controllers\Admin\SizeController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
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

    });

});

require __DIR__.'/auth.php';
