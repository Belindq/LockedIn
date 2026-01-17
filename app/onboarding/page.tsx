'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/UserContext';
import { Button } from '@/components/Button';
import { Stepper } from '@/components/Stepper';
import { Card } from '@/components/Card';
import Link from 'next/link';

const STEPS = [
    { label: "Avatar", number: 1 },
    { label: "Basics", number: 2 },
    { label: "Location", number: 3 },
    { label: "Identity", number: 4 },
    { label: "Preferences", number: 5 },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { updateUser, setUserStatus } = useUser();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Consolidated Form State
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

    // Enum Options
    // const genderOptions = ... (Removed, using hardcoded options for value mapping)
    // const sexualityOptions = ... (Removed)
    const avatars = [
        { id: 'avatar1', label: 'Avatar 1', icon: '👤' },
        { id: 'avatar2', label: 'Avatar 2', icon: '👩' },
        { id: 'avatar3', label: 'Avatar 3', icon: '🧑' },
        { id: 'avatar4', label: 'Avatar 4', icon: '🤖' },
        { id: 'avatar5', label: 'Avatar 5', icon: '🦊' },
        { id: 'avatar6', label: 'Avatar 6', icon: '👽' },
    ];

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAvatarSelect = (avatarId: string) => {
        updateField('avatar', avatarId);
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1: // Avatar
                return !!formData.avatar;
            case 2: // Basics
                return !!(
                    formData.firstName &&
                    formData.lastName &&
                    formData.age &&
                    formData.gender &&
                    formData.sexuality &&
                    parseInt(formData.age) >= 18
                );
            case 3: // Location
                return !!(formData.homeAddress);
            case 4: // Identity
                return !!(formData.interests && formData.values);
            case 5: // Preferences
                return !!(
                    formData.mustHaves &&
                    formData.niceToHaves &&
                    formData.dealBreakers
                );
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < 5) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(5)) return;

        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                age: parseInt(formData.age),
                hasCompletedAvatar: true,
                hasCompletedQuestionnaire: true,
            };

            // Call API
            const res = await fetch('/api/onboarding', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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

            // Update Context
            updateUser({
                ...payload,
                locationCoordinates: { lat: 0, lng: 0 }, // Mock coord for now
            });
            setUserStatus("waiting_for_match");
            router.push('/quests');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full bg-background flex flex-col">
            <div className="flex-1 overflow-y-auto py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-[20px] font-pixel text-primary mb-2 uppercase tracking-widest">
                            Setup Profile
                        </h1>
                        <p className="text-[12px] font-pixel text-gray-500">
                            Step {currentStep} of {STEPS.length}
                        </p>
                    </div>

                    {/* Stepper */}
                    <Stepper steps={STEPS} currentStep={currentStep} />

                    {/* Form Content */}
                    <Card className="mt-8 bg-card border-2 border-border mb-8 shadow-none">
                        {error && (
                            <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 mb-4 font-pixel text-sm">
                                {error}
                            </div>
                        )}

                        {/* Step 1: Avatar */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-[14px] font-pixel text-card-text text-center uppercase">
                                    Choose Your Avatar
                                </h2>
                                <div className="grid grid-cols-3 gap-4 place-items-center">
                                    {avatars.map((av) => (
                                        <button
                                            key={av.id}
                                            type="button"
                                            onClick={() => handleAvatarSelect(av.id)}
                                            className={`flex flex-col items-center justify-center p-4 rounded-lg w-24 h-24 border-2 transition-all font-pixel ${formData.avatar === av.id
                                                ? 'border-primary bg-indigo-50 shadow-[2px_2px_0px_0px_rgba(59,89,152,0.5)] translate-x-[1px] translate-y-[1px]'
                                                : 'border-border hover:border-primary hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="text-3xl mb-2">{av.icon}</span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-center text-[10px] text-gray-400 font-pixel">
                                    Select an icon that represents you
                                </p>
                            </div>
                        )}

                        {/* Step 2: Basics */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <h2 className="text-[14px] font-pixel text-card-text mb-4 uppercase border-b-2 border-border pb-2">
                                    Basic Info
                                </h2>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-pixel text-gray-500 mb-1 uppercase">First Name</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => updateField("firstName", e.target.value)}
                                            className="w-full bg-input-bg border-2 border-border text-input-text p-2 focus:outline-none focus:border-primary font-pixel text-[12px]"
                                            placeholder="Your First Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-pixel text-gray-500 mb-1 uppercase">Last Name</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => updateField("lastName", e.target.value)}
                                            className="w-full bg-input-bg border-2 border-border text-input-text p-2 focus:outline-none focus:border-primary font-pixel text-[12px]"
                                            placeholder="Your Last Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-pixel text-gray-500 mb-1 uppercase">Age</label>
                                        <input
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => updateField("age", e.target.value)}
                                            className="w-full bg-input-bg border-2 border-border text-input-text p-2 focus:outline-none focus:border-primary font-pixel text-[12px]"
                                            placeholder="18+"
                                        />
                                        {formData.age && parseInt(formData.age) < 18 && (
                                            <p className="text-red-500 text-[10px] mt-1 font-pixel">You must be 18+ to join.</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-pixel text-gray-500 mb-1 uppercase">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => updateField("gender", e.target.value)}
                                            className="w-full bg-input-bg border-2 border-border text-input-text p-2 focus:outline-none focus:border-primary font-pixel text-[12px]"
                                        >
                                            <option value="">Select...</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="non-binary">Non-binary</option>
                                            <option value="other">Other</option>
                                            <option value="prefer_not_to_say">Prefer not to say</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-pixel text-gray-500 mb-1 uppercase">Sexuality</label>
                                        <select
                                            value={formData.sexuality}
                                            onChange={(e) => updateField("sexuality", e.target.value)}
                                            className="w-full bg-input-bg border-2 border-border text-input-text p-2 focus:outline-none focus:border-primary font-pixel text-[12px]"
                                        >
                                            <option value="">Select...</option>
                                            <option value="heterosexual">Heterosexual</option>
                                            <option value="gay">Gay</option>
                                            <option value="lesbian">Lesbian</option>
                                            <option value="bisexual">Bisexual</option>
                                            <option value="pansexual">Pansexual</option>
                                            <option value="asexual">Asexual</option>
                                            <option value="other">Other</option>
                                            <option value="prefer_not_to_say">Prefer not to say</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Location */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <h2 className="text-[14px] font-pixel text-card-text mb-4 uppercase border-b-2 border-border pb-2">
                                    Location
                                </h2>
                                <div>
                                    <label className="block text-[10px] font-pixel text-gray-500 mb-1 uppercase">Home Address</label>
                                    <input
                                        type="text"
                                        value={formData.homeAddress}
                                        onChange={(e) => updateField("homeAddress", e.target.value)}
                                        placeholder="123 Main St, City, State"
                                        className="w-full bg-input-bg border-2 border-border text-input-text p-2 focus:outline-none focus:border-primary font-pixel text-[12px]"
                                    />
                                    <p className="mt-2 text-[10px] font-pixel text-gray-400">
                                        We use this to find quest locations near you.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Identity */}
                        {currentStep === 4 && (
                            <div className="space-y-4">
                                <h2 className="text-[14px] font-pixel text-card-text mb-4 uppercase border-b-2 border-border pb-2">
                                    Identity
                                </h2>
                                <div>
                                    <label className="block text-[10px] font-pixel text-gray-500 mb-1 uppercase">Interests</label>
                                    <textarea
                                        value={formData.interests}
                                        onChange={(e) => updateField("interests", e.target.value)}
                                        placeholder="Hiking, Coding, Sci-Fi..."
                                        rows={4}
                                        className="w-full bg-input-bg border-2 border-border text-input-text p-2 focus:outline-none focus:border-primary font-pixel text-[12px] resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-pixel text-gray-500 mb-1 uppercase">Values</label>
                                    <textarea
                                        value={formData.values}
                                        onChange={(e) => updateField("values", e.target.value)}
                                        placeholder="Authenticity, Curiosity, Kindness..."
                                        rows={4}
                                        className="w-full bg-input-bg border-2 border-border text-input-text p-2 focus:outline-none focus:border-primary font-pixel text-[12px] resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 5: Preferences */}
                        {currentStep === 5 && (
                            <div className="space-y-4">
                                <h2 className="text-[14px] font-pixel text-card-text mb-4 uppercase border-b-2 border-border pb-2">
                                    Preferences
                                </h2>
                                <div>
                                    <label className="block text-[10px] font-pixel text-gray-500 mb-1 uppercase">Must-Haves</label>
                                    <textarea
                                        value={formData.mustHaves}
                                        onChange={(e) => updateField("mustHaves", e.target.value)}
                                        placeholder="Good communication, shared humor..."
                                        rows={3}
                                        className="w-full bg-input-bg border-2 border-border text-input-text p-2 focus:outline-none focus:border-primary font-pixel text-[12px] resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-pixel text-gray-500 mb-1 uppercase">Nice-to-Haves</label>
                                    <textarea
                                        value={formData.niceToHaves}
                                        onChange={(e) => updateField("niceToHaves", e.target.value)}
                                        placeholder="Tall, likes sushi..."
                                        rows={3}
                                        className="w-full bg-input-bg border-2 border-border text-input-text p-2 focus:outline-none focus:border-primary font-pixel text-[12px] resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-pixel text-gray-500 mb-1 uppercase">Deal-Breakers</label>
                                    <textarea
                                        value={formData.dealBreakers}
                                        onChange={(e) => updateField("dealBreakers", e.target.value)}
                                        placeholder="Smoking, rudeness..."
                                        rows={3}
                                        className="w-full bg-input-bg border-2 border-border text-input-text p-2 focus:outline-none focus:border-primary font-pixel text-[12px] resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t-2 border-border">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                disabled={currentStep === 1 || loading}
                                className="font-pixel uppercase text-sm"
                            >
                                Back
                            </Button>

                            {currentStep < 5 ? (
                                <Button
                                    variant="primary"
                                    onClick={handleNext}
                                    disabled={!validateStep(currentStep)}
                                    className="font-pixel uppercase text-sm"
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={!validateStep(currentStep) || loading}
                                    className="font-pixel uppercase text-sm"
                                >
                                    {loading ? 'Completing...' : 'Finish'}
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
