'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import WelcomeTutorialModal from '@/components/WelcomeTutorialModal';
import NicknameModal from '@/components/NicknameModal';
import UnitReceiptModal from '@/components/UnitReceiptModal'; // Import Receipt Modal
import StarterPackOpeningModal from '@/components/StarterPackOpeningModal'; // Import Opening Modal
import FactionTutorialModal from '@/components/FactionTutorialModal'; // Import Faction Tutorial Modal
import { useFooter } from '@/context/FooterContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { updateNickname } from '@/lib/firebase-db';
import { useFirebase } from '@/components/FirebaseProvider';
import { distributeStarterPack, InventoryCard } from '@/lib/inventory-system'; // Import Starter Pack logic
import { Card as CardType } from '@/lib/types'; // Import Card Type
import { useUser } from '@/context/UserContext';

export default function TutorialManager() {
    const pathname = usePathname();
    const { user } = useFirebase();
    const { profile, reload: reloadProfile, loading } = useUserProfile();
    const { refreshData } = useUser();
    const [showNicknameModal, setShowNicknameModal] = useState(false);
    const [showTutorialModal, setShowTutorialModal] = useState(false);

    // New Flow States
    const [showOpeningModal, setShowOpeningModal] = useState(false); // The Crate UI
    const [showStarterPackModal, setShowStarterPackModal] = useState(false); // The Cards UI (UnitReceipt)
    const [showFactionTutorial, setShowFactionTutorial] = useState(false); // New Faction Tutorial

    const [starterCards, setStarterCards] = useState<CardType[]>([]); // Rewards
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
            console.log("[TutorialManager] Checking onboarding status...", {
                uid: user.uid,
                nickname: profile?.nickname,
                hasNickname: !!(profile?.nickname && profile.nickname !== ''),
                tutorialCompleted: localStorage.getItem(`tutorial_completed_${user.uid}`)
            });

            // 1. Check if nickname is missing
            const hasNickname = profile?.nickname && profile.nickname !== '';

            if (!hasNickname) {
                console.log("[TutorialManager] Nickname missing. Triggering NicknameModal.");
                setShowNicknameModal(true);
                hideFooter();
                return;
            }

            // 2. Check if tutorial is completed
            // Use Mock Session ID if available (for precise new user tracking), otherwise fall back to Firebase UID
            // This fixes the issue where persistent Anonymous Firebase UID prevents new Mock Users from seeing the tutorial.
            const sessionStr = localStorage.getItem('auth-session');
            let trackingId = user.uid;

            if (sessionStr) {
                try {
                    const session = JSON.parse(sessionStr);
                    if (session?.user?.id) {
                        trackingId = session.user.id;
                    }
                } catch (e) {
                    // Ignore parse error
                }
            }

            const isCompleted = localStorage.getItem(`tutorial_completed_${trackingId}`);

            console.log("[TutorialManager] Tutorial Check:", { trackingId, isCompleted });

            if (!isCompleted) {
                console.log("[TutorialManager] Tutorial not completed. Triggering WelcomeTutorialModal.");
                setShowTutorialModal(true);
                hideFooter();
            } else {
                console.log("[TutorialManager] Tutorial already completed.");
            }
        };

        checkOnboarding();
    }, [pathname, profile, user, loading, hideFooter]);

    const handleNicknameComplete = async (nickname: string) => {
        try {
            await updateNickname(nickname, user?.uid);
            // Wait a bit for Firebase to sync
            await new Promise(resolve => setTimeout(resolve, 500));
            await reloadProfile();
            setShowNicknameModal(false);

            // Immediately start tutorial after nickname
            setShowTutorialModal(true);
        } catch (error) {
            console.error("Failed to update nickname:", error);
        }
    };

    /**
     * Phase 1: Tutorial Close -> Distribute Pack & Show Crate
     */
    const handleTutorialClose = async () => {
        setShowTutorialModal(false);

        // Distribute Starter Pack Logic
        try {
            console.log("[TutorialManager] Distributing Starter Pack...");
            // Pass nickname for Custom Commander Card
            const rewards = await distributeStarterPack(user?.uid, profile?.nickname);
            if (rewards.length > 0) {
                setStarterCards(rewards as unknown as CardType[]);

                // [Fix] Immediately refresh inventory so user context is in sync
                await refreshData();

                // Instead of showing Receipt immediately, show the Opening Ceremony first
                setShowOpeningModal(true);
            } else {
                // Fallback if distribution fails (should rarely happen)
                finalizeTutorial();
            }
        } catch (e) {
            console.error(e);
            finalizeTutorial();
        }
    };

    /**
     * Phase 2: Crate Opened -> Show Cards
     */
    const handlePackOpened = () => {
        setShowOpeningModal(false);
        setShowStarterPackModal(true); // Now show the UnitReceiptModal
    };

    /**
     * Phase 3: Receipt Closed -> Start Faction Tutorial
     */
    const handleReceiptClose = () => {
        setShowStarterPackModal(false);
        // Start the Faction/Generation Tutorial
        setShowFactionTutorial(true);
    };

    /**
     * Phase 4: Faction Tutorial Closed -> Finalize All
     */
    const handleFactionTutorialClose = () => {
        setShowFactionTutorial(false);
        finalizeTutorial();
        window.location.reload(); // Refresh to ensure complete state sync
    };

    const finalizeTutorial = () => {
        let trackingId = user?.uid;
        // Logic duplicated for safety (or could be extracted)
        const sessionStr = localStorage.getItem('auth-session');
        if (sessionStr) {
            try {
                const session = JSON.parse(sessionStr);
                if (session?.user?.id) {
                    trackingId = session.user.id;
                }
            } catch (e) { }
        }

        if (trackingId) {
            localStorage.setItem(`tutorial_completed_${trackingId}`, 'true');
        }
    };

    if (showNicknameModal) {
        return <NicknameModal onComplete={handleNicknameComplete} />;
    }

    if (showTutorialModal) {
        return <WelcomeTutorialModal onClose={handleTutorialClose} />;
    }

    // New: Opening Ceremony Modal
    if (showOpeningModal) {
        return <StarterPackOpeningModal onOpen={handlePackOpened} />;
    }

    if (showStarterPackModal) {
        return <UnitReceiptModal isOpen={true} onClose={handleReceiptClose} units={starterCards} />;
    }

    if (showFactionTutorial) {
        return <FactionTutorialModal onClose={handleFactionTutorialClose} />;
    }

    return null;
}
