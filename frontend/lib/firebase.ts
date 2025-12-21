// Firebase 설정
// Firebase Console에서 프로젝트를 생성하고 아래 값들을 채워주세요
// https://console.firebase.google.com/

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

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

if (isFirebaseConfigured) {
    // 이미 초기화되지 않은 경우에만 초기화
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        console.log('✅ Firebase 초기화 완료');
    } else {
        app = getApps()[0];
        console.log('✅ Firebase 이미 초기화됨');
    }

    db = getFirestore(app);
    auth = getAuth(app);
} else {
    console.warn('⚠️ Firebase 설정이 없습니다. 환경 변수를 확인하세요.');
}

export { db, auth, isFirebaseConfigured };
export default app;
