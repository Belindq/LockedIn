"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { Button } from "@/components/Button";
import { avatarOptions } from "@/lib/mockData";

export default function AvatarPage() {
    const router = useRouter();
    const { user, updateUser } = useUser();
    const [selectedAvatar, setSelectedAvatar] = useState(user.avatarId || "");

    const handleContinue = () => {
        if (selectedAvatar) {
            updateUser({
                avatarId: selectedAvatar,
                hasCompletedAvatar: true,
            });
            router.push("/questionnaire");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Choose Your Avatar
                    </h1>
                    <p className="text-gray-600">
                        Select an icon that represents you. Your partner will see this.
                    </p>
                </div>

                {/* Avatar Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-8">
                    {avatarOptions.map((avatar) => (
                        <button
                            key={avatar.id}
                            onClick={() => setSelectedAvatar(avatar.id)}
                            className={`aspect-square rounded-lg border-4 transition-all ${selectedAvatar === avatar.id
                                    ? "border-pink-500 ring-4 ring-pink-200 scale-105"
                                    : "border-gray-200 hover:border-gray-300"
                                } bg-white p-2`}
                        >
                            <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center text-4xl">
                                {/* Placeholder until we generate actual avatars */}
                                {avatar.id.split("-")[1]}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Continue Button */}
                <div className="flex justify-center">
                    <Button
                        variant="primary"
                        onClick={handleContinue}
                        disabled={!selectedAvatar}
                        className="min-w-[200px]"
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
}
