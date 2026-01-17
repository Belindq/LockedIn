"use client";

import React, { useEffect, useRef } from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
}: ConfirmModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            // Focus trap
            modalRef.current?.focus();
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
                role="dialog"
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <h2 id="modal-title" className="text-xl font-semibold text-gray-900 mb-2">
                    {title}
                </h2>
                <p id="modal-description" className="text-gray-600 mb-6">
                    {message}
                </p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
