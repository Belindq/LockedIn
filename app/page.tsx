"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { Button } from "@/components/Button";

export default function Home() {
  const router = useRouter();
  const { user } = useUser();

  // Redirect if already logged in/active
  useEffect(() => {
    if (user.status !== "onboarding" && user.status !== "idle") {
      router.push("/quests");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background p-4">
      <div className="max-w-md w-full text-center space-y-0 -mt-20">
        {/* Logo */}
        <div className="flex justify-center mb-0">
          <img src="/logo.png" alt="LockedIn Logo" className="h-[32rem] object-contain image-pixelated" />
        </div>

        {/* Begin Button */}
        <div className="space-y-4">
          <h1 className="text-2xl font-pixel text-primary mb-2">Ready to Lock In?</h1>
          <Button
            variant="primary"
            className="w-full text-xl py-6 font-pixel border-4"
            onClick={() => router.push("/login")}
          >
            BEGIN
          </Button>
          <p className="text-sm font-pixel text-gray-500 mt-4">
            Skip the swipe. Unlock connection.
          </p>
        </div>
      </div>
    </div>
  );
}
