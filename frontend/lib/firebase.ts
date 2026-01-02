// Firebase 설정
// Firebase Console에서 프로젝트를 생성하고 아래 값들을 채워주세요
// https://console.firebase.google.com/

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { getPerformance, FirebasePerformance } from 'firebase/performance';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Firebase가 설정되었는지 확인
const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

// Firebase 초기화
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;
let perf: FirebasePerformance | null = null;

if (isFirebaseConfigured) {
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        console.log('✅ Firebase 초기화 완료');
    } else {
        app = getApps()[0];
    }

    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);

    // Browser-only services
    if (typeof window !== 'undefined') {
        isSupported().then(supported => {
            if (supported) analytics = getAnalytics(app!);
        });
        perf = getPerformance(app);
    }
} else {
    console.warn('⚠️ Firebase 설정이 없습니다. 환경 변수를 확인하세요.');
}

export { db, auth, storage, analytics, perf, isFirebaseConfigured };
export default app;
