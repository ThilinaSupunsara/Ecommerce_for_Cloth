<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Exception;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
    public function handleGoogleCallback()
    {
        try {
            // Disable SSL verification for local dev (Quick fix for cURL 60 error)
            $googleUser = Socialite::driver('google')
                ->setHttpClient(new \GuzzleHttp\Client(['verify' => false]))
                ->user();

            $user = User::where('google_id', $googleUser->id)->first();

            if ($user) {
                // If user exists by google_id, login
                Auth::login($user);
                return redirect()->intended(route('dashboard'));
            } else {
                // Check if user exists by email
                $existingUser = User::where('email', $googleUser->email)->first();

                if ($existingUser) {
                    // Update existing user with google_id
                    $existingUser->update([
                        'google_id' => $googleUser->id,
                        'avatar' => $googleUser->avatar
                    ]);
                    Auth::login($existingUser);
                } else {
                    // Create new user
                    $newUser = User::create([
                        'name' => $googleUser->name,
                        'email' => $googleUser->email,
                        'google_id' => $googleUser->id,
                        'password' => null,
                        'avatar' => $googleUser->avatar
                    ]);

                    if (method_exists($newUser, 'assignRole')) {
                        $newUser->assignRole('customer');
                    }

                    Auth::login($newUser);
                }

                return redirect()->intended(route('dashboard'));
            }

        } catch (Exception $e) {
            // Log::error($e->getMessage());
            return redirect()->route('login')->with('error', 'Google Login Failed: ' . $e->getMessage());
        }
    }
}
