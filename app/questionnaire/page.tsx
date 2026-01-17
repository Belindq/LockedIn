"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { Button } from "@/components/Button";
import { Stepper } from "@/components/Stepper";
import { Card } from "@/components/Card";

const STEPS = [
    { label: "Basics", number: 1 },
    { label: "Location", number: 2 },
    { label: "Identity", number: 3 },
    { label: "Preferences", number: 4 },
];

export default function QuestionnairePage() {
    const router = useRouter();
    const { updateUser, setUserStatus } = useUser();
    const [currentStep, setCurrentStep] = useState(1);

    // Form state
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        age: "",
        gender: "",
        sexuality: "",
        homeAddress: "",
        interests: "",
        values: "",
        mustHaves: "",
        niceToHaves: "",
        dealBreakers: "",
    });

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(
                    formData.firstName &&
                    formData.lastName &&
                    formData.age &&
                    formData.gender &&
                    formData.sexuality
                );
            case 2:
                return !!(formData.homeAddress);
            case 3:
                return !!(formData.interests && formData.values);
            case 4:
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
            if (currentStep < 4) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = () => {
        if (validateStep(4)) {
            updateUser({
                firstName: formData.firstName,
                lastName: formData.lastName,
                age: parseInt(formData.age),
                gender: formData.gender,
                sexuality: formData.sexuality,
                homeAddress: formData.homeAddress,
                locationCoordinates: {
                    lat: 0,
                    lng: 0,
                },
                interests: formData.interests,
                values: formData.values,
                mustHaves: formData.mustHaves,
                niceToHaves: formData.niceToHaves,
                dealBreakers: formData.dealBreakers,
                hasCompletedQuestionnaire: true,
            });
            setUserStatus("waiting_for_match");
            router.push("/quests");
        }
    };

    return (
        <div className="h-full bg-background flex flex-col">
            <div className="flex-1 overflow-y-auto py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-[20px] font-pixel text-foreground mb-4">
                            Tell Us About You
                        </h1>
                        <p className="text-[10px] font-pixel text-gray-500">
                            Help us find your perfect match
                        </p>
                    </div>

                    {/* Stepper */}
                    <Stepper steps={STEPS} currentStep={currentStep} />

                    {/* Form Content */}
                    <Card className="mt-8 bg-card border-2 border-border mb-8">
                        {/* Step 1: Basics */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <h2 className="text-[14px] font-pixel text-card-text mb-4">
                                    Basic Information
                                </h2>
                                <div>
                                    <label className="block text-[8px] font-pixel text-gray-500 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => updateField("firstName", e.target.value)}
                                        className="w-full bg-input-bg border-2 border-border text-input-text rounded-none p-3 focus:outline-none focus:border-primary font-pixel text-[10px]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-pixel text-gray-500 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => updateField("lastName", e.target.value)}
                                        className="w-full bg-input-bg border-2 border-border text-input-text rounded-none p-3 focus:outline-none focus:border-primary font-pixel text-[10px]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-pixel text-gray-500 mb-2">
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.age}
                                        onChange={(e) => updateField("age", e.target.value)}
                                        className="w-full bg-input-bg border-2 border-border text-input-text rounded-none p-3 focus:outline-none focus:border-primary font-pixel text-[10px]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-pixel text-gray-500 mb-2">
                                        Gender
                                    </label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => updateField("gender", e.target.value)}
                                        className="w-full bg-input-bg border-2 border-border text-input-text rounded-none p-3 focus:outline-none focus:border-primary font-pixel text-[10px]"
                                    >
                                        <option value="">Select...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Non-binary">Non-binary</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[8px] font-pixel text-gray-500 mb-2">
                                        Sexuality
                                    </label>
                                    <select
                                        value={formData.sexuality}
                                        onChange={(e) => updateField("sexuality", e.target.value)}
                                        className="w-full bg-input-bg border-2 border-border text-input-text rounded-none p-3 focus:outline-none focus:border-primary font-pixel text-[10px]"
                                    >
                                        <option value="">Select...</option>
                                        <option value="Straight">Straight</option>
                                        <option value="Gay">Gay</option>
                                        <option value="Lesbian">Lesbian</option>
                                        <option value="Bisexual">Bisexual</option>
                                        <option value="Pansexual">Pansexual</option>
                                        <option value="Asexual">Asexual</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Location */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <h2 className="text-[14px] font-pixel text-card-text mb-4">
                                    Location
                                </h2>
                                <div>
                                    <label className="block text-[8px] font-pixel text-gray-500 mb-2">
                                        Home Address
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.homeAddress}
                                        onChange={(e) => updateField("homeAddress", e.target.value)}
                                        placeholder="123 Main St, City, State ZIP"
                                        className="w-full bg-input-bg border-2 border-border text-input-text rounded-none p-3 focus:outline-none focus:border-primary font-pixel text-[10px]"
                                    />
                                </div>

                            </div>
                        )}

                        {/* Step 3: Identity */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <h2 className="text-[14px] font-pixel text-card-text mb-4">
                                    Identity
                                </h2>
                                <div>
                                    <label className="block text-[8px] font-pixel text-gray-500 mb-2">
                                        Interests
                                    </label>
                                    <textarea
                                        value={formData.interests}
                                        onChange={(e) => updateField("interests", e.target.value)}
                                        placeholder="Photography, hiking, indie music..."
                                        rows={3}
                                        className="w-full bg-input-bg border-2 border-border text-input-text rounded-none p-3 focus:outline-none focus:border-primary font-pixel text-[10px] resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-pixel text-gray-500 mb-2">
                                        Values
                                    </label>
                                    <textarea
                                        value={formData.values}
                                        onChange={(e) => updateField("values", e.target.value)}
                                        placeholder="Authenticity, curiosity, kindness..."
                                        rows={3}
                                        className="w-full bg-input-bg border-2 border-border text-input-text rounded-none p-3 focus:outline-none focus:border-primary font-pixel text-[10px] resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Preferences */}
                        {currentStep === 4 && (
                            <div className="space-y-4">
                                <h2 className="text-[14px] font-pixel text-card-text mb-4">
                                    Preferences
                                </h2>
                                <div>
                                    <label className="block text-[8px] font-pixel text-gray-500 mb-2">
                                        Must-Haves
                                    </label>
                                    <textarea
                                        value={formData.mustHaves}
                                        onChange={(e) => updateField("mustHaves", e.target.value)}
                                        placeholder="Good communication, shared sense of humor..."
                                        rows={3}
                                        className="w-full bg-input-bg border-2 border-border text-input-text rounded-none p-3 focus:outline-none focus:border-primary font-pixel text-[10px] resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-pixel text-gray-500 mb-2">
                                        Nice-to-Haves
                                    </label>
                                    <textarea
                                        value={formData.niceToHaves}
                                        onChange={(e) => updateField("niceToHaves", e.target.value)}
                                        placeholder="Enjoys outdoor activities, appreciates art..."
                                        rows={3}
                                        className="w-full bg-input-bg border-2 border-border text-input-text rounded-none p-3 focus:outline-none focus:border-primary font-pixel text-[10px] resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-pixel text-gray-500 mb-2">
                                        Deal-Breakers
                                    </label>
                                    <textarea
                                        value={formData.dealBreakers}
                                        onChange={(e) => updateField("dealBreakers", e.target.value)}
                                        placeholder="Dishonesty, close-mindedness..."
                                        rows={3}
                                        className="w-full bg-input-bg border-2 border-border text-input-text rounded-none p-3 focus:outline-none focus:border-primary font-pixel text-[10px] resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                disabled={currentStep === 1}
                            >
                                Back
                            </Button>
                            {currentStep < 4 ? (
                                <Button
                                    variant="primary"
                                    onClick={handleNext}
                                    disabled={!validateStep(currentStep)}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={!validateStep(currentStep)}
                                >
                                    Complete
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
