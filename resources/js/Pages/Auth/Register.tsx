import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div className="mb-4">
                    <a
                        href={route('auth.google')}
                        className="flex w-full justify-center items-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent transition"
                    >
                        <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                            <path
                                d="M12.0003 20.45c4.6653 0 8.0163-3.21 8.0163-7.98 0-.675-.06-1.125-.165-1.635h-7.8513v3.09h4.4853c-.195 1.05-.795 1.935-1.695 2.535l-.0148.0955 2.621 2.0298.1816.0362c2.6103-2.4 4.1203-5.94 4.1203-10.08 0-7.86-9.6153-12.165-15.1503-6.6-2.58 2.595-3.375 6.375-2.07 9.855l-.0895.1325-2.6738 2.0725-.0912.0465c-2.6103-5.19-2.6103-10.83.0003-16.02h.0015c2.2353-4.47 6.8103-7.185 11.6403-7.185 3.1953 0 6.2253 1.215 8.4903 3.42l2.5503-2.55c-2.9553-2.76-6.9453-4.32-11.0403-4.32-6.3753 0-11.9703 3.66-14.5053 9.09l3.3903 2.625c1.2303-3.69 4.7103-6.315 8.7753-6.315z"
                                fill="#EA4335"
                            />
                            <path
                                d="M12.0003 20.4501c-4.0653 0-7.5453-2.625-8.7753-6.315l-3.3903 2.625c2.535 5.43 8.13 9.09 14.5053 9.09.915 0 1.815-.075 2.6853-.225l-2.4595-1.9079c-.7326.4716-1.5835.7329-2.5654.7329z"
                                fill="#34A853"
                            />
                            <path
                                d="M3.225 14.135c-1.305-3.48-.51-7.26 2.07-9.855h-.0015l-3.39-2.625c-4.47 5.235-4.47 13.095 0 18.33l3.3915-2.625c-.7925-1.002-1.2825-2.126-1.425-3.285-.09-1.077-.075-2.169.045-3.24.045-.24.09-.48.15-.72.03-.12.06-.24.09-.36.03-.12.06-.24.09-.36z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12.0003 3.6c3.1953 0 6.2253 1.215 8.4903 3.42l2.5503-2.55c-2.9553-2.76-6.9453-4.32-11.0403-4.32-4.83 0-9.405 2.715-11.64 7.185l3.39 2.625c1.2303-3.69 4.7103-6.315 8.7753-6.315.9818 0 1.8328.2613 2.5653.7329l2.4597-1.9079c-.8703-.15-1.7703-.225-2.6853-.225z"
                                fill="#4285F4"
                            />
                        </svg>
                        <span className="text-sm font-semibold leading-6">Sign up with Google</span>
                    </a>
                </div>

                <div className="relative flex items-center mb-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase">Or sign up with email</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
