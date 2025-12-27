'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, TranslationKey } from '../lib/i18n/types';
import { t as translateFunc } from '../lib/i18n';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('ko');
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // 지역 감지 로직
        const detectLanguage = (): Language => {
            // 1. localStorage 확인
            const saved = localStorage.getItem('app_language');
            if (saved === 'ko' || saved === 'en') return saved as Language;

            // 2. 브라우저 언어 확인
            const browserLang = navigator.language;
            if (browserLang.startsWith('en')) return 'en';

            // 3. 기본값 한글 (한국 서비스 우선)
            return 'ko';
        };

        const initialLang = detectLanguage();
        setLanguageState(initialLang);
        setIsInitialized(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app_language', lang);
    };

    const t = (key: TranslationKey): string => {
        return translateFunc(key, language);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {/* 초기화 전에는 깜빡임을 방지하기 위해 렌더링을 늦추거나 기본값 사용 */}
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
