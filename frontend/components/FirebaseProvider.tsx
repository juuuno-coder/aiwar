'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, signInAnonymous } from '@/lib/firebase-auth';

interface FirebaseContextType {
    user: User | null;
    loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
    user: null,
    loading: true,
});

export function useFirebase() {
    return useContext(FirebaseContext);
}

interface FirebaseProviderProps {
    children: ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 인증 상태 변경 리스너
        const unsubscribe = onAuthChange(async (authUser) => {
            if (authUser) {
                setUser(authUser);
                setLoading(false);
            } else {
                // 사용자가 없으면 익명 로그인
                const anonymousUser = await signInAnonymous();
                setUser(anonymousUser);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <FirebaseContext.Provider value={{ user, loading }}>
            {children}
        </FirebaseContext.Provider>
    );
}
