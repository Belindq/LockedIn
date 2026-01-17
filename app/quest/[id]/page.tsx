'use client';

import { useState } from 'react';

export default function QuestPage({ params }: { params: { id: string } }) {
    // ... existing logic ...
    const [userId, setUserId] = useState('');
    const [partnerId, setPartnerId] = useState('');
    const [matchId, setMatchId] = useState('');

    // Response Data
    const [activeQuest, setActiveQuest] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Inputs
    const [submissionText, setSubmissionText] = useState('');
    const [submissionImage, setSubmissionImage] = useState('');
    const [submissionLocation, setSubmissionLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [nudgeType, setNudgeType] = useState('hurry_up');
    const [revealData, setRevealData] = useState<any>(null);

    const log = (msg: string, data?: any) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMsg = data ? `${msg} ${JSON.stringify(data, null, 2)}` : msg;
        setLogs(prev => [`[${timestamp}] ${logMsg}`, ...prev]);
        console.log(`[${timestamp}] ${msg}`, data || '');
    };

    const fetchActiveQuest = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/quest/active?userId=${userId}`, { cache: 'no-store' });
            const data = await res.json();

            if (res.ok && data) {
                setActiveQuest(data);
                log('Fetched Active Quest:', data);
            } else {
                setActiveQuest(null);
                log('No active quest found or error:', data);
            }
        } catch (err) {
            log('Error fetching quest:', err);
            setActiveQuest(null);
        } finally {
            setLoading(false);
        }
    };

    const createQuest = async () => {
        if (!matchId || !userId || !partnerId) {
            alert('Please fill in User ID, Partner ID, and Match ID');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/quest/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matchId,
                    userId,
                    userAId: userId,
                    userBId: partnerId
                })
            });
            const data = await res.json();
            log('Create Quest Response:', data);
            fetchActiveQuest();
        } catch (err) {
            log('Error creating quest:', err);
        } finally {
            setLoading(false);
        }
    };

    const submitChallenge = async (challengeId: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/challenges/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    challengeId: challengeId,
                    submissionText: submissionText || "Automated test submission",
                    submissionImageBase64: submissionImage,
                    submissionLocation: submissionLocation
                })
            });
            const data = await res.json();

            if (!res.ok) {
                log('Submission Failed:', data);
                alert(`Submission Failed: ${data.error || 'Unknown error'}`);
                if (data.faceDetectionDebug) {
                    alert(`Debug Info: Confidence: ${data.faceDetectionDebug.confidence}, Blocked: ${data.faceDetectionDebug.blocked}`);
                }
            } else {
                log('Submit Challenge Response:', data);
                if (data.faceDetectionDebug) {
                    alert(`Debug Info: Confidence: ${data.faceDetectionDebug.confidence}, Blocked: ${data.faceDetectionDebug.blocked} ${data.faceDetectionWarning ? '(Warning)' : ''}`);
                }
                setSubmissionLocation(null); // Reset
                setSubmissionImage(''); // Reset
                fetchActiveQuest();
            }
        } catch (err) {
            log('Error submitting challenge:', err);
        } finally {
            setLoading(false);
        }
    };

    const nudgePartner = async () => {
        if (!activeQuest?.quest?.id) return;
        setLoading(true);
        try {
            const res = await fetch('/api/quest/nudge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, questId: activeQuest.quest.id, nudgeType })
            });
            const data = await res.json();
            log('Nudge Response:', data);
        } catch (err) {
            log('Error nudging:', err);
        } finally {
            setLoading(false);
        }
    };

    const cancelQuest = async () => {
        if (!activeQuest?.quest?.id) return;
        if (!confirm('Are you sure you want to cancel this quest?')) return;

        setLoading(true);
        try {
            const res = await fetch('/api/quest/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, questId: activeQuest.quest.id })
            });
            const data = await res.json();
            log('Cancel Response:', data);
            fetchActiveQuest();
        } catch (err) {
            log('Error cancelling:', err);
        } finally {
            setLoading(false);
        }
    };

    const approveChallenge = async (challengeId: string, approverId: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/challenges/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challengeId: challengeId,
                    userId: approverId,
                    approve: true
                })
            });
            const data = await res.json();
            log(`Approve Response (by ${approverId}):`, data);

            if (res.ok) {
                alert(`Approval Success! Status: ${data.newStatus}`);
            } else {
                alert(`Approval Failed: ${data.error}`);
            }

            fetchActiveQuest();
        } catch (err) {
            log('Error approving:', err);
            alert(`Error approving: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const forcePartnerSubmit = async (challengeId: string) => {
        if (!partnerId) {
            alert('Partner ID is missing');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/challenges/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: partnerId,
                    challengeId: challengeId,
                    submissionText: "Automated Partner Submission",
                    submissionImageBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                    submissionLocation: { lat: 40.7128, lng: -74.0060 }
                })

            });
            const data = await res.json();
            log('Force Partner Submit Response:', data);

            if (res.ok) {
                alert(`Force Submit Success! Status: ${data.status}`);
            } else {
                alert(`Force Submit Failed: ${data.error}`);
            }

            fetchActiveQuest();
        } catch (err) {
            log('Error forcing partner submit:', err);
            alert(`Error: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const simulatePartnerCompletion = async () => {
        // Find partner's current active challenge
        if (!activeQuest?.challenges) return;

        // Find first challenge where partner is 'locked' or 'active' or 'active' logic from backend
        // Use the API provided index
        const partnerIndex = activeQuest.partnerCurrentChallengeIndex;
        if (partnerIndex >= activeQuest.challenges.length) {
            alert('Partner has finished all challenges!');
            return;
        }

        const challenge = activeQuest.challenges[partnerIndex];
        // If partnerStatus is 'submitted', we need to APPROVE it (as ME)
        // If partnerStatus is 'active' or 'locked', we need to SUBMIT it (as PARTNER)

        const status = challenge.partnerStatus.status;

        if (status === 'active' || status === 'locked' || status === 'pending') {
            await forcePartnerSubmit(challenge.id);
        } else if (status === 'submitted') {
            alert('Partner has submitted. YOU need to approve it!');
        }
    };

    const revealLocation = async () => {
        if (!activeQuest?.quest?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/quest/reveal?questId=${activeQuest.quest.id}&userId=${userId}`);
            const data = await res.json();
            if (res.ok) {
                setRevealData(data.reveal);
                log('Reveal Location:', data);
            } else {
                log('Reveal Failed:', data);
                alert(data.error);
            }
        } catch (err) {
            log('Error revealing:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto font-sans">
            <h1 className="text-3xl font-bold mb-6 text-purple-600">LOCKEDIN: Quest Test Console</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Setup & Actions */}
                <div className="space-y-6">
                    <div className="p-4 border rounded bg-gray-50 dark:bg-gray-900">
                        <h2 className="font-bold mb-4">1. Setup</h2>
                        <div className="space-y-2">
                            <input className="w-full p-2 border rounded" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="My User ID" />
                            <input className="w-full p-2 border rounded" value={partnerId} onChange={(e) => setPartnerId(e.target.value)} placeholder="Partner ID" />
                            <input className="w-full p-2 border rounded" value={matchId} onChange={(e) => setMatchId(e.target.value)} placeholder="Match ID" />
                        </div>
                    </div>

                    <div className="p-4 border rounded bg-gray-50 dark:bg-gray-900">
                        <h2 className="font-bold mb-4">2. Actions</h2>
                        <div className="flex flex-col gap-2">
                            <button onClick={createQuest} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Create Quest</button>
                            <button onClick={fetchActiveQuest} className="bg-gray-600 text-white p-2 rounded hover:bg-gray-700">Fetch Status</button>
                            <button onClick={cancelQuest} className="bg-red-600 text-white p-2 rounded hover:bg-red-700">Cancel Quest</button>
                            <button onClick={() => { setActiveQuest(null); setRevealData(null); }} className="bg-gray-400 text-white p-2 rounded">Reset UI</button>
                        </div>
                    </div>

                    <div className="p-4 border rounded bg-black text-green-400 font-mono text-xs h-64 overflow-y-auto">
                        <h2 className="font-bold mb-2 text-white">Logs</h2>
                        {logs.map((L, i) => <div key={i} className="mb-1 border-b border-gray-800 pb-1">{L}</div>)}
                    </div>

                    {activeQuest && (
                        <div className="p-4 border rounded bg-yellow-50 dark:bg-yellow-900/10 text-xs font-mono overflow-auto max-h-96">
                            <h2 className="font-bold mb-2">Debug Data</h2>
                            <pre>{JSON.stringify({
                                questStatus: activeQuest.quest.status,
                                myIndex: activeQuest.currentChallengeIndex,
                                partnerIndex: activeQuest.partnerCurrentChallengeIndex,
                                userAProgress: activeQuest.quest.userAProgress,
                                userBProgress: activeQuest.quest.userBProgress
                            }, null, 2)}</pre>
                        </div>
                    )}
                </div>

                {/* Right Column: Quest UI */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="font-bold text-xl">3. Active Quest Flow</h2>

                    {!activeQuest ? (
                        <div className="p-8 text-center text-gray-500 bg-gray-100 rounded border-dashed border-2">
                            No active quest loaded. Create or Fetch one.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Quest Header */}
                            <div className="flex justify-between items-center p-4 bg-purple-100 rounded border border-purple-200">
                                <div>
                                    <div className="font-bold text-purple-800">Quest Status: {activeQuest.quest.status}</div>
                                    <div className="text-sm">Expires: {new Date(activeQuest.quest.expiresAt).toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div>Me: {activeQuest.quest.userAProgress}%</div>
                                    <div>Partner: {activeQuest.quest.userBProgress}%</div>
                                </div>
                            </div>

                            {/* Challenges List */}
                            <div className="space-y-4">
                                {activeQuest.challenges.map((c: any, i: number) => (
                                    <div key={c.id} className={`p-4 border rounded-lg ${c.myStatus.status === 'completed' ? 'bg-green-50 border-green-200' :
                                        c.myStatus.status === 'active' ? 'bg-white border-blue-400 ring-2 ring-blue-100' :
                                            'bg-gray-50 border-gray-200 opacity-75'
                                        }`}>
                                        <div className="flex justify-between mb-2">
                                            <h3 className="font-bold">Challenge {i + 1}: {c.prompt}</h3>
                                            <span className="text-xs uppercase bg-gray-200 px-2 py-1 rounded">{c.type}</span>
                                        </div>

                                        {/* My Status UI */}
                                        <div className="mb-4">
                                            <div className="text-sm font-semibold mb-1">My Status: {c.myStatus.status}</div>

                                            {c.myStatus.status === 'active' && (
                                                <div className="mt-2 p-3 bg-blue-50 rounded">
                                                    {(c.type === 'image' || c.type === 'location') && (
                                                        <div className="mb-2">
                                                            <input type="file" accept="image/*" className="text-sm" onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => setSubmissionImage(reader.result as string);
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }} />
                                                        </div>
                                                    )}
                                                    {c.type === 'location' && (
                                                        <button onClick={() => setSubmissionLocation({ lat: 40.7128, lng: -74.0060 })} className="mb-2 text-xs bg-blue-200 px-2 py-1 rounded">
                                                            📍 Mock Location (NYC)
                                                        </button>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <input
                                                            className="flex-1 p-2 border rounded text-sm"
                                                            placeholder="Response..."
                                                            value={submissionText}
                                                            onChange={e => setSubmissionText(e.target.value)}
                                                        />
                                                        <button
                                                            onClick={() => submitChallenge(c.id)}
                                                            disabled={loading}
                                                            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                                                        >
                                                            Submit
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {c.myStatus.status === 'submitted' && (
                                                <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                                                    <div>⏳ Waiting for partner approval...</div>
                                                    <button
                                                        onClick={() => approveChallenge(c.id, partnerId)}
                                                        className="mt-2 text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded hover:bg-orange-300 border border-orange-300"
                                                    >
                                                        🤖 Cheat: Approve as Partner
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Partner Status UI */}
                                        <div className="border-t pt-2 mt-2">
                                            <div className="text-sm text-gray-600 mb-1">
                                                Partner Status: <span className="font-mono bg-gray-200 px-1 rounded">{c.partnerStatus.status}</span>
                                            </div>

                                            {/* DEBUG: Always show this button to verify visibility */}
                                            <div className="my-2 p-2 border border-dashed border-pink-300 rounded bg-pink-50">
                                                <button
                                                    onClick={() => forcePartnerSubmit(c.id)}
                                                    className="bg-pink-500 text-white px-3 py-1 rounded text-xs hover:bg-pink-600 w-full mb-1"
                                                >
                                                    🤖 FORCE SUBMIT (Debug)
                                                </button>
                                                <button
                                                    onClick={() => approveChallenge(c.id, userId)}
                                                    className="bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600 w-full"
                                                >
                                                    🤖 FORCE APPROVE (Debug)
                                                </button>
                                                <div className="text-[10px] text-gray-500 font-mono mt-1 break-all">
                                                    MyID: {userId} <br />
                                                    Status: {JSON.stringify(c.partnerStatus)}
                                                </div>
                                            </div>

                                            {c.partnerStatus.status === 'submitted' && (
                                                <div className="p-3 bg-orange-50 rounded border border-orange-200">
                                                    <div className="font-bold text-sm text-orange-800 mb-2">Partner needs approval!</div>
                                                    {c.partnerStatus.submissionImageBase64 && (
                                                        <img src={c.partnerStatus.submissionImageBase64} alt="Partner Submission" className="h-32 rounded mb-2 border" />
                                                    )}
                                                    {c.partnerStatus.submissionText && (
                                                        <div className="text-sm italic mb-2">"{c.partnerStatus.submissionText}"</div>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => approveChallenge(c.id, userId)}
                                                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => alert('Reject logic TODO')}
                                                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reveal Section */}
                            <div className="mt-8 border-t pt-4">

                                {(activeQuest.quest.status === 'completed' ||
                                    (activeQuest.currentChallengeIndex >= activeQuest.totalChallenges && activeQuest.partnerCurrentChallengeIndex >= activeQuest.totalChallenges)) && (
                                        <div className="animate-pulse">
                                            <button
                                                onClick={revealLocation}
                                                className="w-full bg-purple-600 text-white p-4 rounded-lg font-bold text-xl shadow-lg hover:bg-purple-700"
                                            >
                                                📍 REVEAL LOCATION
                                            </button>
                                        </div>
                                    )}

                                {revealData && (
                                    <div className="mt-4 p-6 bg-white dark:bg-black border-2 border-purple-500 rounded-lg text-center">
                                        <div className="text-4xl mb-2">🎉 LOCKED IN!</div>

                                        {revealData.dateDetails ? (
                                            <div className="mb-6">
                                                <h2 className="text-2xl font-bold text-purple-600 mb-2">{revealData.dateDetails.title}</h2>
                                                <div className="text-lg font-medium text-gray-800 mb-1">{revealData.dateDetails.locationName}</div>
                                                {revealData.dateDetails.address && (
                                                    <div className="text-sm text-gray-500 mb-2 flex items-center justify-center">
                                                        <span>📍 {revealData.dateDetails.address}</span>
                                                    </div>
                                                )}
                                                <div className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">{revealData.dateDetails.activity}</div>
                                                <p className="text-gray-700 italic max-w-lg mx-auto">"{revealData.dateDetails.description}"</p>
                                            </div>
                                        ) : (
                                            <div className="mb-4">
                                                <div className="text-xl font-bold text-gray-400">Date Idea Loading...</div>
                                            </div>
                                        )}

                                        <div className="text-2xl font-bold text-purple-600 mb-2">{new Date(revealData.dateTime).toLocaleString()}</div>
                                        <div className="text-gray-600 mb-4 text-xs font-mono">
                                            Midpoint: {revealData.location.coordinates.lat.toFixed(4)}, {revealData.location.coordinates.lng.toFixed(4)}
                                        </div>
                                        <div className="p-4 bg-gray-100 rounded">Mapbox Integration Placeholder</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}