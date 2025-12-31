import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    loadUserProfile,
    saveUserProfile,
    UserProfile
} from '@/lib/firebase-db';
import { useFirebase } from '@/components/FirebaseProvider';

/**
 * 사용자 프로필 Hook
 * Firebase Realtime Listener (onSnapshot)을 사용하여 실시간 동기화 지원
 */
export function useUserProfile() {
    const { user, loading: authLoading } = useFirebase();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        setLoading(true);

        if (!db) {
            console.error("Firestore is not initialized");
            setLoading(false);
            return;
        }

        // Firestore Realtime Listener 설정
        const userRef = doc(db, 'users', user.uid, 'profile', 'data');

        const unsubscribe = onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
                setProfile(docSnap.data() as UserProfile);
                setLoading(false);
            } else {
                // 프로필이 존재하지 않는 경우 초기화 (기본값 생성)
                try {
                    console.log('User profile not found, creating default...');
                    await loadUserProfile(user.uid);
                    // 생성 후에는 스냅샷이 다시 트리거되어 데이터가 로드됩니다.
                } catch (err) {
                    console.error("Failed to create initial profile:", err);
                    setError(err as Error);
                    setLoading(false);
                }
            }
        }, (err) => {
            console.error("Profile snapshot error:", err);
            setError(err);
            setLoading(false);
        });

        // Cleanup subscription on unmount or user change
        return () => unsubscribe();
    }, [user, authLoading]);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        try {
            await saveUserProfile(updates);
            // Snapshot will automatically update the state
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    };

    const reload = useCallback(async () => {
        // Snapshot handles updates, but this allows manual triggers if absolutely needed
        if (user?.uid) {
            const p = await loadUserProfile(user.uid);
            setProfile(p);
        }
    }, [user]);

    return {
        profile,
        loading,
        error,
        updateProfile,
        reload
    };
}
