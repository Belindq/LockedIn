"use client";

import React, { useState, useRef } from "react";

interface UploadCardProps {
    onSubmit: (image: File, caption: string) => void;
}

export function UploadCard({ onSubmit }: UploadCardProps) {
    const [caption, setCaption] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (selectedFile) {
            onSubmit(selectedFile, caption);
            // Reset form
            setCaption("");
            setSelectedFile(null);
            setPreviewUrl(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="space-y-4">
            {/* File Input */}
            <div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                />
                <p className="mt-2 text-xs text-gray-500">
                    ⚠️ AI will verify no face is in the image (server-side)
                </p>
            </div>

            {/* Preview */}
            {previewUrl && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                    />
                </div>
            )}

            {/* Caption Input */}
            <div>
                <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
                    Caption
                </label>
                <textarea
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption to your photo..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                    rows={3}
                />
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={!selectedFile}
                className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
                Submit Photo
            </button>
        </div>
    );
}
