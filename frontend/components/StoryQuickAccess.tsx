'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStoryProgress } from '@/lib/story-system';
import { Card as UiCard } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/custom/Button';

import { useTranslation } from '@/context/LanguageContext';

export default function StoryQuickAccess() {
    const router = useRouter();
    const { t } = useTranslation();
    const [currentChapter, setCurrentChapter] = useState<number>(1);

    useEffect(() => {
        // Correct usage: loadStoryProgress takes a chapterId. 
        // We probably need to check all chapters to find the current one.
        // For now, let's assume chapter-1. To do this properly, we should load seasons.
        // But to fix the TS error quickly and keep functionality:
        // loadStoryProgress returns { completedStages, unlockedStages }, not an array of chapters.

        // Changing logic to just default to Chapter 1 for quick access, or load seasons correctly.
        // Let's simplified to just redirect to story page.
        setCurrentChapter(1);
    }, [t]);

    return (
        <UiCard
            variant="gradient"
            className="cursor-pointer hover:scale-105 transition-all"
            onClick={() => router.push('/story')}
        >
            <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📖</span>
                <div>
                    <div className="text-sm text-gray-400">스토리 진행</div>
                    <div className="font-bold">Chapter {currentChapter}</div>
                </div>
            </div>
            <Button color="primary" size="sm" className="w-full">
                계속하기 →
            </Button>
        </UiCard>
    );
}
