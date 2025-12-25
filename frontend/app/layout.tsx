import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./animations.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FirebaseProvider } from "@/components/FirebaseProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { AlertProvider } from "@/context/AlertContext";
import { FooterProvider } from "@/context/FooterContext";
import { UserProvider } from "@/context/UserContext";
import { SoundProvider } from "@/context/SoundContext";
import MainLayout from "@/components/MainLayout";

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
          <UserProvider>
            <LanguageProvider>
              <SoundProvider>
                <AlertProvider>
                  <FooterProvider>
                    <ThemeProvider>
                      <MainLayout>
                        {children}
                      </MainLayout>
                    </ThemeProvider>
                  </FooterProvider>
                </AlertProvider>
              </SoundProvider>
            </LanguageProvider>
          </UserProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
