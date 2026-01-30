<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'base_price',
        'image',
        'is_active',
        'is_featured'
    ];


    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(ProductStock::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function flashSales()
    {
        return $this->belongsToMany(FlashSale::class, 'flash_sale_product');
    }

    protected $appends = ['selling_price', 'has_active_sale', 'sale_price', 'sale_percentage']; // sale_price/percentage for backward compatibility if needed, but sticking to plan

    public function getSellingPriceAttribute()
    {
        // 1. Check for specific sale (Priority)
        $flashSale = $this->flashSales()
            ->where('is_active', true)
            ->where('start_time', '<=', now())
            ->where('end_time', '>=', now())
            ->first();

        // 2. If no specific sale, check for Site-Wide sale (Sale with NO products attached)
        if (!$flashSale) {
            $flashSale = \App\Models\FlashSale::active()
                ->doesntHave('products')
                ->first();
        }

        if ($flashSale) {
            $discount = ($this->base_price * $flashSale->discount_percentage) / 100;
            return round($this->base_price - $discount, 2);
        }

        return $this->base_price;
    }

    public function getHasActiveSaleAttribute()
    {
        // Check specific
        if ($this->flashSales()->where('is_active', true)->where('start_time', '<=', now())->where('end_time', '>=', now())->exists()) {
            return true;
        }

        // Check global
        return \App\Models\FlashSale::active()->doesntHave('products')->exists();
    }

    public function getSalePercentageAttribute()
    {
        $flashSale = $this->flashSales()
            ->where('is_active', true)
            ->where('start_time', '<=', now())
            ->where('end_time', '>=', now())
            ->first();

        if (!$flashSale) {
            $flashSale = \App\Models\FlashSale::active()
                ->doesntHave('products')
                ->first();
        }

        return $flashSale ? $flashSale->discount_percentage : 0;
    }

    public function getSalePriceAttribute()
    {
        return $this->selling_price;
    }
}
