'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function RootPage() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Auth Check using 'auth-session' key from auth-utils
        try {
            const sessionData = localStorage.getItem('auth-session');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                if (session && session.expiresAt > Date.now()) {
                    // Valid Session -> Go to Main
                    router.replace('/main');
                    return;
                }
            }
        } catch (e) {
            console.error('Auth check failed', e);
        }

        // No valid session -> Go to Intro
        router.replace('/intro');

        const timer = setTimeout(() => setIsChecking(false), 1000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
            {/* Minimal Loading State */}
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-cyan-500 font-mono text-xs tracking-widest animate-pulse"
                >
                    VERIFYING_ACCESS...
                </motion.div>
            </div>
        </div>
    );
}
