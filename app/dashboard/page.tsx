'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'onboarding' | 'idle' | 'waiting_for_match' | 'matched'>('loading');
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                // We'll reuse the match/active endpoint or create a new user/status one. 
                // Using match/active for now as it likely returns user status.
                const res = await fetch('/api/match/active');
                if (res.status === 401) {
                    router.push('/login');
                    return;
                }
                const data = await res.json();

                // Assuming the API returns the user's status. If not, we might need to modify it.
                // Based on previous checks, we might need to ensure this text.
                setStatus(data.userStatus || 'idle');
                setUserData(data);

                if (data.userStatus === 'matched') {
                    // Fetch active quest to get ID
                    const questRes = await fetch(`/api/quest/active?userId=${data.userId}`);
                    if (questRes.ok) {
                        const questData = await questRes.json();
                        router.push(`/quest/${questData.quest.id}`);
                    }
                } else if (data.userStatus === 'onboarding') {
                    router.push('/onboarding');
                }

            } catch (error) {
                console.error('Dashboard error:', error);
                setStatus('idle'); // Fallback
            }
        };

        fetchStatus();

        // Poll every 5 seconds if waiting
        const interval = setInterval(() => {
            if (status === 'waiting_for_match') {
                fetchStatus();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [status, router]);

    const enterPool = async () => {
        try {
            await fetch('/api/match/join', { method: 'POST' });
            setStatus('waiting_for_match');
        } catch (e) {
            alert('Failed to join pool');
        }
    };

    if (status === 'loading') return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-black font-sans p-4">
            <div className="max-w-md w-full text-center">

                {status === 'waiting_for_match' && (
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-purple-100 dark:border-purple-900">
                        <div className="relative w-24 h-24 mx-auto mb-6">
                            <div className="absolute inset-0 bg-purple-500 rounded-full opacity-20 animate-ping"></div>
                            <div className="relative bg-purple-600 rounded-full w-24 h-24 flex items-center justify-center text-4xl">
                                📡
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                            Scanning for Connection
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            We're looking for your perfect match. Hang tight!
                        </p>
                        <div className="mt-6 text-xs text-gray-400">
                            Matches are generated periodically.
                        </div>
                    </div>
                )}

                {status === 'idle' && (
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl">
                        <div className="text-6xl mb-6">👋</div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Ready to Lock In?
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                            Join the pool to find a partner and start your quest.
                        </p>
                        <button
                            onClick={enterPool}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-105"
                        >
                            Enter Matching Pool
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
