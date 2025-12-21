import { ko } from './ko';
import { en } from './en';
import { Language, TranslationKey, Translations } from './types';

const translations: Record<Language, Translations> = { ko, en };

export const getTranslation = (lang: Language): Translations => {
    return translations[lang] || translations.en;
};

// 클라이언트 사이드에서 사용할 간단한 번역 헬퍼
export const t = (key: TranslationKey, lang: Language): string => {
    const translationSet = getTranslation(lang);
    return translationSet[key] || key;
};
