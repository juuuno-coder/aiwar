'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import WelcomeTutorialModal from '@/components/WelcomeTutorialModal';
import NicknameModal from '@/components/NicknameModal';
import { useFooter } from '@/context/FooterContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { updateNickname } from '@/lib/firebase-db';
import { useFirebase } from '@/components/FirebaseProvider';

export default function TutorialManager() {
    const pathname = usePathname();
    const { user } = useFirebase();
    const { profile, reload: reloadProfile, loading } = useUserProfile();
    const [showNicknameModal, setShowNicknameModal] = useState(false);
    const [showTutorialModal, setShowTutorialModal] = useState(false);
    const { showFooter, hideFooter } = useFooter();

    useEffect(() => {
        // Only trigger on Main Lobby - other pages control their own footer
        if (pathname !== '/main') {
            return;
        }

        if (!user) return;

        // Wait for profile to load
        if (loading) return;

        const checkOnboarding = async () => {
            // 1. Check if nickname is missing
            const hasNickname = profile?.nickname && profile.nickname !== '';

            if (!hasNickname) {
                setShowNicknameModal(true);
                hideFooter();
                return;
            }

            // 2. Check if tutorial is completed
            const isCompleted = localStorage.getItem(`tutorial_completed_${user.uid}`);
            if (!isCompleted) {
                setShowTutorialModal(true);
                hideFooter();
            }
        };

        checkOnboarding();
    }, [pathname, profile, user, loading, hideFooter]);

    const handleNicknameComplete = async (nickname: string) => {
        try {
            await updateNickname(nickname, user?.uid);
            // Wait a bit for Firebase to sync
            await new Promise(resolve => setTimeout(resolve, 500));
            await reloadProfile(user?.uid);
            setShowNicknameModal(false);

            // Immediately start tutorial after nickname
            setShowTutorialModal(true);
        } catch (error) {
            console.error("Failed to update nickname:", error);
        }
    };

    const handleTutorialClose = () => {
        setShowTutorialModal(false);
        if (user) {
            localStorage.setItem(`tutorial_completed_${user.uid}`, 'true');
        }
        // showFooter() 제거 - 각 페이지가 필요할 때 직접 호출
    };

    if (showNicknameModal) {
        return <NicknameModal onComplete={handleNicknameComplete} />;
    }

    if (showTutorialModal) {
        return <WelcomeTutorialModal onClose={handleTutorialClose} />;
    }

    return null;
}
