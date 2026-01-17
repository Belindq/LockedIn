'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MatchStatus {
    hasMatch: boolean;
    partnerName?: string;
    matchId?: string;
}

export default function MatchesPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'idle' | 'matched'>('loading');
    const [partnerName, setPartnerName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        checkMatchStatus();
    }, []);

    const checkMatchStatus = async () => {
        try {
            const res = await fetch('/api/match/active');
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            
            const data: MatchStatus = await res.json();
            
            if (data.hasMatch) {
                setStatus('matched');
                setPartnerName(data.partnerName || 'Unknown');
            } else {
                setStatus('idle');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load match status');
            setStatus('idle');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
             <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden text-center p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Match Status</h1>
                
                {status === 'loading' && (
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                )}

                {status === 'matched' && (
                    <div className="bg-green-50 text-green-800 p-6 rounded-lg animate-fade-in-up">
                        <div className="text-4xl mb-2">🎉</div>
                        <h2 className="text-xl font-bold mb-2">You have a match!</h2>
                        <p className="text-lg">You are locked in with <span className="font-bold text-indigo-600">{partnerName}</span>.</p>
                        <button className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition">
                            Start Chatting
                        </button>
                    </div>
                )}

                {status === 'idle' && (
                     <div className="text-gray-600">
                        <div className="text-4xl mb-4">⏳</div>
                        <p className="mb-4">You are currently on the waitlist.</p>
                        <p className="text-sm">We ran our matching algorithm every night at 8 PM.</p>
                        <p className="text-sm mt-2">Make sure your profile is complete!</p>
                        
                        <button 
                            onClick={() => router.push('/onboarding')}
                            className="mt-6 text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Update Profile
                        </button>
                    </div>
                )}

                {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
             </div>
        </div>
    );
}
