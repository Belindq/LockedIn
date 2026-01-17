'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        age: '',
        gender: '',
        sexuality: '',
        homeAddress: '',
        interests: '',
        values: '',
        mustHaves: '',
        niceToHaves: '',
        dealBreakers: '',
        avatar: 'avatar1'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Enum Options
    const genderOptions = ['male', 'female', 'non-binary', 'other', 'prefer_not_to_say'];
    const sexualityOptions = ['heterosexual', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other', 'prefer_not_to_say'];
    const avatars = [
        { id: 'avatar1', label: 'Avatar 1', icon: '👤' },
        { id: 'avatar2', label: 'Avatar 2', icon: '👩' },
        { id: 'avatar3', label: 'Avatar 3', icon: '🧑' },
        { id: 'avatar4', label: 'Avatar 4', icon: '🤖' },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAvatarSelect = (avatarId: string) => {
        setFormData({ ...formData, avatar: avatarId });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                age: parseInt(formData.age),
            };

            const res = await fetch('/api/onboarding', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push('/login');
                    return;
                }
                throw new Error(data.details || data.error || 'Failed to complete profile');
            }

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Complete Your Profile</h2>
                <p className="text-gray-600 mb-8">We just need a few more details to find your perfect match.</p>

                {error && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Avatar Selection */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Choose Your Avatar</h3>
                        <div className="flex gap-4 justify-center sm:justify-start">
                            {avatars.map((av) => (
                                <button
                                    key={av.id}
                                    type="button"
                                    onClick={() => handleAvatarSelect(av.id)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-full w-20 h-20 border-2 transition-all ${formData.avatar === av.id
                                            ? 'border-indigo-600 bg-indigo-50 scale-110 shadow-md'
                                            : 'border-gray-200 hover:border-indigo-300'
                                        }`}
                                >
                                    <span className="text-2xl">{av.icon}</span>
                                    <span className="text-xs mt-1 text-gray-600">{av.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Personal Details Section */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input name="lastName" type="text" required value={formData.lastName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Age</label>
                                <input name="age" type="number" min="18" required value={formData.age} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                <select name="gender" required value={formData.gender} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    <option value="">Select...</option>
                                    {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sexuality</label>
                                <select name="sexuality" required value={formData.sexuality} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    <option value="">Select...</option>
                                    {sexualityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Home Address</label>
                                <input name="homeAddress" type="text" required placeholder="Full address for validation" value={formData.homeAddress} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Preferences Section */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Your Preferences</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'interests', label: 'Interests', placeholder: 'Hiking, Coding, Sci-Fi...' },
                                { name: 'values', label: 'Values', placeholder: 'Honesty, Ambition, Kindness...' },
                                { name: 'mustHaves', label: 'Must Haves (in a partner)', placeholder: 'Good communicator, Loves dogs...' },
                                { name: 'niceToHaves', label: 'Nice to Haves', placeholder: 'Tall, Likes sushi...' },
                                { name: 'dealBreakers', label: 'Deal Breakers', placeholder: 'Smoking, Rudeness...' },
                            ].map((field) => (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {field.label}
                                    </label>
                                    <textarea
                                        name={field.name}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        rows={2}
                                        placeholder={field.placeholder}
                                        value={(formData as any)[field.name]}
                                        onChange={handleChange}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
                        >
                            {loading ? 'Completing Profile...' : 'Complete Profile & Find Matches'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
