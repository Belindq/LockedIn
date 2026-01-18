import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/UserContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import { LayoutContent } from "./LayoutContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LockedIn — Skip the swipe, unlock connection",
  description: "AI-matched dating through shared quests",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#1a1a1a] flex items-center justify-center min-h-screen md:py-8`}
      >
        {/* Module Container - Responsive: Full screen on mobile, limited on desktop */}
        <div className="w-full h-full md:max-w-2xl md:h-[85vh] bg-background relative md:rounded-lg md:border-4 border-border shadow-2xl overflow-hidden flex flex-col">
          <div className="flex-1 w-full h-full overflow-hidden flex flex-col relative">
            <UserProvider>
              <ThemeProvider>
                <LayoutContent>{children}</LayoutContent>
              </ThemeProvider>
            </UserProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
