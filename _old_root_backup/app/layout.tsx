import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./animations.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import GameSidebar from "@/components/GameSidebar";
import GameTopBar from "@/components/GameTopBar";
import { FirebaseProvider } from "@/components/FirebaseProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI War - AI 카드 전략 게임",
  description: "2030년의 미래를 바꿀 AI 카드 전략 게임. 20개 AI 군단을 모아 최강의 시너지를 만들어보세요!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950`}
        suppressHydrationWarning
      >
        <FirebaseProvider>
          <ThemeProvider>
            {/* 게임 레이아웃 */}
            <div className="flex h-screen overflow-hidden">
              {/* 사이드바 */}
              <GameSidebar />

              {/* 메인 영역 */}
              <div className="flex-1 flex flex-col ml-64">
                {/* 상단 바 */}
                <GameTopBar />

                {/* 컨텐츠 */}
                <main className="flex-1 overflow-auto mt-20 p-6 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
                  {children}
                </main>
              </div>
            </div>
          </ThemeProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
