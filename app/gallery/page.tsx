"use client";

import { useState } from "react";
import { useUser } from "@/lib/UserContext";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { ConfirmModal } from "@/components/ConfirmModal";
import Link from "next/link";

export default function GalleryPage() {
    const { user, galleryItems, partner, progress, setUserStatus } = useUser();
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [showUnmatchModal, setShowUnmatchModal] = useState(false);
    const [hoveredAvatar, setHoveredAvatar] = useState<"user" | "partner" | null>(null);

    const handleUnmatch = () => {
        setUserStatus("idle");
    };

    if (user.status !== "matched" || !galleryItems || galleryItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <EmptyState
                    icon="🖼️"
                    heading="No gallery items yet"
                    description="Complete photo challenges to build your shared gallery"
                    action={
                        <Link href="/quests">
                            <Button variant="primary">Go to Quests</Button>
                        </Link>
                    }
                />
            </div>
        );
    }

    const selectedGalleryItem = galleryItems.find((item) => item.id === selectedItem);

    return (
        <div className="h-full bg-background flex flex-col">
            <div className="flex-1 overflow-y-auto pb-32">
                <div className="w-full px-4 py-8">
                    {/* Gallery Grid - Polaroid Style */}
                    <div className="grid grid-cols-2 gap-4">
                        {galleryItems.map((item, index) => (
                            <div
                                key={item.id}
                                className={`transform transition-transform hover:scale-105 ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'
                                    }`}
                                onClick={() => setSelectedItem(item.id)}
                            >
                                <div className="bg-white p-2 pb-8 shadow-md border border-gray-200 cursor-pointer">
                                    {/* Image Placeholder */}
                                    <div className="w-full aspect-square bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden mb-2">
                                        <span className="text-[24px]">📷</span>
                                    </div>
                                    {/* Minimal Caption if any */}
                                    <div className="h-2 w-full bg-gray-100 rounded-full opacity-20"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Absolute bottom bar - contained in module */}
            <div className="absolute bottom-0 left-0 right-0 bg-background border-t-4 border-border p-4 shadow-lg z-40">
                <div className="w-full mx-auto">
                    {/* Avatar icons and progress */}
                    <div className="flex items-center gap-4 mb-4">
                        {/* User avatar */}
                        <div
                            className="relative"
                            onMouseEnter={() => setHoveredAvatar("user")}
                            onMouseLeave={() => setHoveredAvatar(null)}
                        >
                            <div className="w-12 h-12 bg-card border-2 border-border flex items-center justify-center text-[20px] cursor-pointer hover:border-primary transition-colors">
                                👤
                            </div>
                            {hoveredAvatar === "user" && (
                                <div className="absolute bottom-full left-0 mb-2 w-48">
                                    <ProgressBar
                                        value={progress.user}
                                        label="Your Progress"
                                        variant="user"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Combined progress bar */}
                        <div className="flex-1">
                            {hoveredAvatar === null && (
                                <ProgressBar
                                    value={progress.combined}
                                    label={`QUEST ${progress.combined}%`}
                                    variant="combined"
                                />
                            )}
                            {hoveredAvatar === "user" && (
                                <ProgressBar
                                    value={progress.user}
                                    label="Your Progress"
                                    variant="user"
                                />
                            )}
                            {hoveredAvatar === "partner" && (
                                <ProgressBar
                                    value={progress.partner}
                                    label={`${partner?.firstName}'s Progress`}
                                    variant="partner"
                                />
                            )}
                        </div>

                        {/* Partner avatar */}
                        <div
                            className="relative"
                            onMouseEnter={() => setHoveredAvatar("partner")}
                            onMouseLeave={() => setHoveredAvatar(null)}
                        >
                            <div className="w-12 h-12 bg-card border-2 border-border flex items-center justify-center text-[20px] cursor-pointer hover:border-secondary transition-colors">
                                👤
                            </div>
                            {hoveredAvatar === "partner" && (
                                <div className="absolute bottom-full right-0 mb-2 w-48">
                                    <ProgressBar
                                        value={progress.partner}
                                        label={`${partner?.firstName}'s Progress`}
                                        variant="partner"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Unmatch button */}
                    <div className="flex justify-center">
                        <Button
                            variant="destructive"
                            onClick={() => setShowUnmatchModal(true)}
                            className="text-[10px] bg-background border-2 border-border !text-black dark:!text-white font-bold hover:bg-red-500 hover:!text-white hover:border-red-500 text-xs px-8 py-2 font-pixel"
                        >
                            UNMATCH
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal for larger preview */}
            {selectedGalleryItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        className="bg-card border-4 border-border max-w-2xl w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="float-right text-gray-500 hover:text-foreground text-xl font-pixel"
                            aria-label="Close"
                        >
                            ×
                        </button>

                        {/* Image */}
                        <div className="w-full h-64 bg-background border-2 border-border mb-4 flex items-center justify-center text-gray-500">
                            <span className="text-4xl">📷</span>
                        </div>

                        {/* Caption */}
                        <p className="text-[12px] font-pixel text-card-text mb-3">{selectedGalleryItem.caption}</p>

                        {/* Metadata */}
                        <div className="mt-4 pt-4 border-t-2 border-border flex justify-between text-[8px] font-pixel text-gray-500">
                            <span>
                                {selectedGalleryItem.author === "user"
                                    ? "YOU"
                                    : partner?.firstName?.toUpperCase() || "PARTNER"}
                            </span>
                            <span>{new Date(selectedGalleryItem.timestamp).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Unmatch Confirmation Modal */}
            <ConfirmModal
                isOpen={showUnmatchModal}
                onClose={() => setShowUnmatchModal(false)}
                onConfirm={handleUnmatch}
                title="Unmatch?"
                message="Are you sure you want to unmatch? This quest will end and cannot be recovered."
                confirmText="Unmatch"
                cancelText="Cancel"
            />
        </div>
    );
}
