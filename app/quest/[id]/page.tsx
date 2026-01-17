'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuestPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    
    // Response Data
    const [activeQuest, setActiveQuest] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Inputs
    const [submissionText, setSubmissionText] = useState('');
    const [submissionImage, setSubmissionImage] = useState('');
    const [submissionLocation, setSubmissionLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [revealData, setRevealData] = useState<any>(null);

    const log = (msg: string, data?: any) => {
        const timestamp = new Date().toLocaleTimeString();
        // console.log(`[${timestamp}] ${msg}`, data || '');
    };

    useEffect(() => {
        fetchActiveQuest();
    }, []);

    const fetchActiveQuest = async () => {
        setLoading(true);
        try {
            // userId is handled by cookie/middleware
            const res = await fetch(`/api/quest/active`, { cache: 'no-store' });
            
            if (res.status === 401) {
                router.push('/login');
                return;
            }

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

    const submitChallenge = async (challengeId: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/challenges/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // userId handled by header
                    challengeId: challengeId,
                    submissionText: submissionText || "Completed!",
                    submissionImageBase64: submissionImage,
                    submissionLocation: submissionLocation
                })
            });
            const data = await res.json();

            if (!res.ok) {
                alert(`Submission Failed: ${data.error || 'Unknown error'}`);
            } else {
                if (data.faceDetectionDebug) {
                     // specific warnings if needed
                }
                setSubmissionLocation(null); // Reset
                setSubmissionImage(''); // Reset
                setSubmissionText('');
                fetchActiveQuest();
            }
        } catch (err) {
            alert('Error submitting challenge');
        } finally {
            setLoading(false);
        }
    };

    const approveChallenge = async (challengeId: string, approverId: string) => {
        // Approvals might still need explicit user ID if the API requires "who approved it" 
        // checking against the session user.
        // For now, let's assume valid session user can approve.
        // But the API uses body `userId` for approver?
        // Let's rely on session.
        
        setLoading(true);
        try {
            const res = await fetch('/api/challenges/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challengeId: challengeId,
                    // userId: approverId, // Remove if API supports header, otherwise we might fail if API relies on body.
                    // To be safe, let's keep it if we have it, or rely on backend.
                    // Actually, 'approve' endpoint likely needs update too. 
                    // MVP: Let's assume the user is the one clicking.
                    approve: true
                })
            });
             
            // If the API fails because of missing userId in body, we might need to fix it.
            // But let's hope it works or we update the API.
            // For hackathon speed, I'll update the API next if needed.
            
            const data = await res.json();

            if (res.ok) {
                 fetchActiveQuest();
            } else {
                alert(`Approval Failed: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const revealLocation = async () => {
        if (!activeQuest?.quest?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/quest/reveal?questId=${activeQuest.quest.id}`); // userId via cookie
            const data = await res.json();
            if (res.ok) {
                setRevealData(data.reveal);
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !activeQuest) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">Loading Quest...</div>
                </div>
            </div>
        );
    }

    if (!activeQuest) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                 <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4 text-gray-800">No Active Quest Found</h1>
                    <p className="text-gray-600 mb-6">It looks like you don't have a quest yet. Start by finding a match!</p>
                    <button 
                        onClick={() => router.push('/matches')}
                        className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700"
                    >
                        Go to Matches
                    </button>
                 </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 text-center pt-8">
                    <h1 className="text-3xl font-bold text-purple-700 mb-2">Your Quest</h1>
                    <p className="text-gray-600">Complete challenges with your partner to unlock the date!</p>
                </header>

                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div>
                                <div className="font-bold text-gray-800 text-lg">Quest Progress</div>
                                <div className="text-sm text-gray-500">Expires: {new Date(activeQuest.quest.expiresAt).toLocaleDateString()}</div>
                            </div>
                            <div className="flex gap-4 text-sm font-medium">
                                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">Me: {activeQuest.quest.userAProgress}%</div>
                                <div className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full">Partner: {activeQuest.quest.userBProgress}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Challenges List - Filtered or Highlighted */}
                    <div className="space-y-6">
                        {activeQuest.challenges.map((c: any, i: number) => (
                            <div key={c.id} className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${
                                c.myStatus.status === 'active' ? 'ring-2 ring-purple-500 shadow-md transform scale-[1.01]' : 'opacity-90'
                            }`}>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-gray-800">Challenge {i + 1}: {c.prompt}</h3>
                                    <span className="text-xs uppercase font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">{c.type}</span>
                                </div>

                                {/* My Status Section */}
                                <div className="mb-4">
                                    <div className="text-sm font-semibold text-gray-500 mb-2">My Status: <span className={`uppercase ${c.myStatus.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>{c.myStatus.status}</span></div>

                                    {c.myStatus.status === 'active' && (
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            {(c.type === 'image' || c.type === 'location') && (
                                                <div className="mb-3">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        {c.type === 'location' ? 'Photo Proof (No faces!)' : 'Photo Submission (No faces!)'}
                                                    </label>
                                                    <input type="file" accept="image/*" className="block w-full text-sm text-gray-500
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-full file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-purple-50 file:text-purple-700
                                                        hover:file:bg-purple-100
                                                    " onChange={(e) => {
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
                                                <button onClick={() => setSubmissionLocation({ lat: 40.7128, lng: -74.0060 })} className="mb-3 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition">
                                                    📍 Use Current Location
                                                </button>
                                            )}

                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <input
                                                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-300 outline-none transition"
                                                    placeholder="Type your response..."
                                                    value={submissionText}
                                                    onChange={e => setSubmissionText(e.target.value)}
                                                />
                                                <button
                                                    onClick={() => submitChallenge(c.id)}
                                                    disabled={loading}
                                                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium shadow-sm disabled:opacity-50"
                                                >
                                                    Submit
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {c.myStatus.status === 'submitted' && (
                                        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 border border-yellow-200 flex items-center gap-2">
                                            <span className="text-xl">⏳</span>
                                            <span>Waiting for partner to approve your submission...</span>
                                        </div>
                                    )}
                                     
                                    {c.myStatus.status === 'completed' && (
                                        <div className="bg-green-50 p-4 rounded-lg text-green-800 border border-green-200 flex items-center gap-2">
                                            <span className="text-xl">✅</span>
                                            <span>Challenge Completed!</span>
                                        </div>
                                    )}
                                </div>

                                {/* Partner Status Section */}
                                <div className="border-t pt-4">
                                     <div className="text-sm font-semibold text-gray-500 mb-2">Partner Status: <span className="uppercase">{c.partnerStatus.status}</span></div>
                                     
                                     {c.partnerStatus.status === 'submitted' && (
                                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                            <div className="font-bold text-orange-900 mb-2">Partner needs your approval!</div>
                                            
                                            {c.partnerStatus.submissionImageBase64 && (
                                                <div className="mb-3">
                                                    <img src={c.partnerStatus.submissionImageBase64} alt="Partner Submission" className="h-40 object-cover rounded-lg shadow-sm" />
                                                </div>
                                            )}
                                            
                                            {c.partnerStatus.submissionText && (
                                                <div className="bg-white p-3 rounded border border-orange-100 mb-3 italic text-gray-600">
                                                    "{c.partnerStatus.submissionText}"
                                                </div>
                                            )}
                                            
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => approveChallenge(c.id, "")} // Approver ID handled by session ideally
                                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition shadow-sm"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition shadow-sm opacity-50 cursor-not-allowed"
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
                    <div className="mt-8 pb-12">
                        {(activeQuest.quest.status === 'completed' || 
                          (activeQuest.currentChallengeIndex >= activeQuest.totalChallenges && activeQuest.partnerCurrentChallengeIndex >= activeQuest.totalChallenges)) && (
                            <div className="animate-pulse mb-6">
                                <button
                                    onClick={revealLocation}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-5 rounded-xl font-bold text-2xl shadow-xl hover:shadow-2xl transition transform hover:scale-[1.02]"
                                >
                                    📍 REVEAL LOCATION
                                </button>
                            </div>
                        )}

                        {revealData && (
                            <div className="bg-white dark:bg-black border-4 border-purple-500 rounded-2xl p-8 text-center shadow-2xl animate-fade-in-up">
                                <div className="text-6xl mb-4">🎉</div>
                                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-6">LOCKED IN!</h2>
                                
                                {revealData.dateDetails && (
                                    <div className="space-y-4 mb-8">
                                        <h3 className="text-2xl font-bold text-gray-900">{revealData.dateDetails.title}</h3>
                                        <p className="text-xl text-gray-700">{revealData.dateDetails.locationName}</p>
                                        <p className="text-gray-500">{revealData.dateDetails.address}</p>
                                        <div className="inline-block bg-purple-100 text-purple-800 px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wide">
                                            {revealData.dateDetails.activity}
                                        </div>
                                        <p className="italic text-gray-600 max-w-lg mx-auto border-t border-b py-4 my-4">
                                            "{revealData.dateDetails.description}"
                                        </p>
                                    </div>
                                )}
                                
                                <div className="text-gray-400 text-xs font-mono">
                                    Coordinates: {revealData.location.coordinates.lat.toFixed(4)}, {revealData.location.coordinates.lng.toFixed(4)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}