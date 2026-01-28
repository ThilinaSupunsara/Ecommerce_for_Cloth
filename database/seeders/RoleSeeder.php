<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permission1 = Permission::firstOrCreate(['name' => 'edit_products']);
        $permission2 = Permission::firstOrCreate(['name' => 'view_orders']);
        $permission3 = Permission::firstOrCreate(['name' => 'manage_users']);

        $adminRole = Role::firstOrCreate(['name' => 'super_admin']);
        $managerRole = Role::firstOrCreate(['name' => 'store_manager']);
        $customerRole = Role::firstOrCreate(['name' => 'customer']);


        $managerRole->givePermissionTo($permission1);
        $managerRole->givePermissionTo($permission2);

        $adminRole->givePermissionTo(Permission::all());
    }
}
