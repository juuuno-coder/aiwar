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
        const chapters = loadStoryProgress(t);
        const current = chapters.find(c => c.unlocked && !c.completed);
        if (current) {
            setCurrentChapter(current.number);
        }
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
