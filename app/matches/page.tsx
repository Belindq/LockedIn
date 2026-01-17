'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';

interface MatchStatus {
    hasMatch: boolean;
    partnerName?: string;
    matchId?: string;
}

export default function MatchesPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'waitlist' | 'matched'>('loading');
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
                setStatus('waitlist');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load match status');
            setStatus('waitlist');
        }
    };

    return (
        <div className="h-full bg-background flex flex-col items-center justify-center p-4">
            <Card className="max-w-md w-full text-center p-8 bg-card border-4 border-border shadow-xl">
                <h1 className="text-2xl font-bold mb-6 font-pixel text-primary uppercase tracking-widest">
                    Match Status
                </h1>

                {status === 'loading' && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-full h-4 bg-gray-200 animate-pulse rounded"></div>
                        <div className="w-2/3 h-4 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                )}

                {status === 'matched' && (
                    <div className="bg-primary/5 border-2 border-primary/20 p-6 animate-fade-in-up">
                        <h2 className="text-xl font-bold mb-2 font-pixel text-secondary uppercase">
                            You're Locked In!
                        </h2>
                        <p className="text-sm font-pixel text-card-text mb-6">
                            Matched with <span className="font-bold text-primary text-lg">{partnerName}</span>
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => router.push('/quests')}
                            className="w-full text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                        >
                            START QUEST
                        </Button>
                    </div>
                )}

                {status === 'waitlist' && (
                    <div className="space-y-6">
                        <div className="text-4xl animate-bounce">⏳</div>
                        <div className="space-y-2">
                            <p className="font-pixel text-lg text-card-text">
                                You are on the waitlist.
                            </p>

                            <p className="text-xs font-pixel text-primary">
                                Ensure your profile is 100% complete!
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <p className="text-red-500 mt-4 text-xs font-pixel border border-red-200 bg-red-50 p-2">
                        {error}
                    </p>
                )}


            </Card>
        </div>
    );
}

