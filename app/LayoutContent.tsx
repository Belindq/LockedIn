"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { TopNav } from "@/components/TopNav";
import { ReactNode } from "react";

export function LayoutContent({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { user } = useUser();

    // Don't show TopNav on welcome, login, signup, avatar, questionnaire, or loading pages
    const hideNavRoutes = ["/", "/login", "/signup", "/avatar", "/questionnaire", "/loading", "/onboarding"];

    // Always show nav on quests, matches, dashboard, insights, gallery
    const alwaysShowNavRoutes = ["/quests", "/matches", "/dashboard", "/insights", "/gallery"];
    const isAlwaysShowRoute = alwaysShowNavRoutes.some(route => pathname?.startsWith(route));

    const shouldShowNav = isAlwaysShowRoute || (!hideNavRoutes.includes(pathname || "") && user.status !== "onboarding");

    return (
        <>
            {shouldShowNav && <TopNav />}
            <main className="flex-1 w-full overflow-hidden flex flex-col relative">{children}</main>
        </>
    );
}
