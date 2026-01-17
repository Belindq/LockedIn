import { Skeleton } from "@/components/Skeleton";

export default function LoadingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="text-center">
                {/* Logo */}
                <div className="mb-8">
                    <img src="/logo.png" alt="LockedIn Logo" className="h-16 object-contain animate-pulse mx-auto" />
                </div>

                {/* Spinner */}
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />

                {/* Loading text */}
                <h2 className="text-xl font-pixel text-foreground">Loading LockedIn...</h2>

                {/* Skeleton placeholders */}
                <div className="mt-8 space-y-2">
                    <Skeleton width="200px" height="20px" className="mx-auto" />
                    <Skeleton width="150px" height="20px" className="mx-auto" />
                </div>
            </div>
        </div>
    );
}
