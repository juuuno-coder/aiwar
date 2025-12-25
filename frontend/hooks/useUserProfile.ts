import { useState, useEffect, useCallback } from 'react';
import {
    loadUserProfile,
    saveUserProfile,
    UserProfile
} from '@/lib/firebase-db';
import { useFirebase } from '@/components/FirebaseProvider';

/**
 * 사용자 프로필 Hook
 * Firebase에서 사용자 프로필을 로드하고 관리합니다
 */
export function useUserProfile() {
    const { user, loading: authLoading } = useFirebase();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            const data = await loadUserProfile();
            setProfile(data);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!user) return;

        loadProfile();
    }, [user, authLoading, loadProfile]);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        try {
            await saveUserProfile(updates);
            setProfile(prev => prev ? { ...prev, ...updates } : null);
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    };

    return {
        profile,
        loading,
        error,
        updateProfile,
        reload: loadProfile
    };
}
