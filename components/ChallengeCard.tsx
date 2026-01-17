"use client";

import React, { useState } from "react";
import { Challenge, SubmissionType } from "@/lib/mockData";
import { CountdownTimer } from "./CountdownTimer";
import { UploadCard } from "./UploadCard";

interface ChallengeCardProps {
    challenge: Challenge;
    isReadOnly?: boolean;
    onSubmit?: (data: { caption?: string; image?: File; location?: { lat: number; lng: number } }) => void;
}

export function ChallengeCard({ challenge, isReadOnly = false, onSubmit }: ChallengeCardProps) {
    const [isExpanded, setIsExpanded] = useState(challenge.status === "active");
    const [textSubmission, setTextSubmission] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    const statusColors = {
        locked: "bg-gray-200 text-gray-600",
        active: "bg-blue-100 text-blue-700",
        completed: "bg-green-100 text-green-700",
        expired: "bg-red-100 text-red-700",
    };

    const handleTextSubmit = () => {
        if (onSubmit && textSubmission.trim()) {
            onSubmit({ caption: textSubmission });
            setTextSubmission("");
        }
    };

    const handleLocationSubmit = () => {
        if (onSubmit && latitude && longitude) {
            onSubmit({
                location: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
            });
            setLatitude("");
            setLongitude("");
        }
    };

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Header - Always Visible */}
            <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[challenge.status]}`}>
                                {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                            </span>
                            <span className="text-xs text-gray-500">{challenge.identityRevealLabel}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                        <CountdownTimer deadline={challenge.deadline} />
                        <button
                            className="mt-2 text-gray-400 hover:text-gray-600"
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                            {isExpanded ? "▲" : "▼"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    {/* Read-only view: Show submissions */}
                    {isReadOnly && (
                        <div className="space-y-4">
                            {challenge.userSubmission && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Your submission:</p>
                                    <p className="text-sm text-gray-600">{challenge.userSubmission.caption}</p>
                                </div>
                            )}
                            {challenge.partnerSubmission && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Partner's submission:</p>
                                    <p className="text-sm text-gray-600">{challenge.partnerSubmission.caption}</p>
                                </div>
                            )}
                            {challenge.aiInsightCaption && (
                                <div className="bg-pink-50 border border-pink-200 rounded p-3">
                                    <p className="text-sm font-medium text-pink-900 mb-1">AI Insight</p>
                                    <p className="text-sm text-pink-700">{challenge.aiInsightCaption}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Editable view: Show submission UI */}
                    {!isReadOnly && challenge.status === "active" && (
                        <div>
                            {challenge.type === "photo" && (
                                <UploadCard
                                    onSubmit={(image, caption) => {
                                        if (onSubmit) {
                                            onSubmit({ image, caption });
                                        }
                                    }}
                                />
                            )}

                            {challenge.type === "text" && (
                                <div>
                                    <textarea
                                        value={textSubmission}
                                        onChange={(e) => setTextSubmission(e.target.value)}
                                        placeholder="Write your response..."
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                        rows={4}
                                    />
                                    <button
                                        onClick={handleTextSubmit}
                                        disabled={!textSubmission.trim()}
                                        className="mt-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                    >
                                        Submit
                                    </button>
                                </div>
                            )}

                            {challenge.type === "location" && (
                                <div>
                                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center mb-4">
                                        <p className="text-gray-500 text-sm">📍 Mapbox map placeholder</p>
                                        <p className="text-xs text-gray-400 mt-1">Map integration will be added later</p>
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="number"
                                            step="any"
                                            value={latitude}
                                            onChange={(e) => setLatitude(e.target.value)}
                                            placeholder="Latitude"
                                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        />
                                        <input
                                            type="number"
                                            step="any"
                                            value={longitude}
                                            onChange={(e) => setLongitude(e.target.value)}
                                            placeholder="Longitude"
                                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        />
                                        <button
                                            onClick={handleLocationSubmit}
                                            disabled={!latitude || !longitude}
                                            className="mt-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                        >
                                            Submit Location
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Show existing submission if completed */}
                    {!isReadOnly && challenge.status === "completed" && challenge.userSubmission && (
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                            <p className="text-sm font-medium text-green-900 mb-1">✓ Submitted</p>
                            <p className="text-sm text-green-700">{challenge.userSubmission.caption}</p>
                        </div>
                    )}

                    {/* Locked state */}
                    {!isReadOnly && challenge.status === "locked" && (
                        <p className="text-sm text-gray-500 italic">🔒 Complete previous challenges to unlock</p>
                    )}
                </div>
            )}
        </div>
    );
}
