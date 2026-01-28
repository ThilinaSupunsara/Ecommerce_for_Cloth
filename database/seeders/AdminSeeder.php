<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@tsdigital.com');
        $password = env('ADMIN_PASSWORD', 'password');
        $name = env('ADMIN_NAME', 'Super Admin');


        $admin = User::where('email', $email)->first();

        if (!$admin) {

            $admin = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]);


            $this->command->info('Super Admin created successfully.');
        }


        if (!$admin->hasRole('super_admin')) {
            $admin->assignRole('super_admin');
            $this->command->info('Role [super_admin] assigned to user.');
        }
    }
}
