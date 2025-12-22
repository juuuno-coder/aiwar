'use client';

import { useState, useEffect } from 'react';
import {
    getAllChapters,
    isChapterUnlocked,
    isChapterCompleted,
    checkChapterMissions,
    claimChapterRewards,
    getStoryProgress,
    Chapter
} from '@/lib/story-utils';
import { getGameState } from '@/lib/game-state';
import { Card } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/custom/Button';
import { Modal } from '@/components/ui/custom/Modal';

export default function StoryPage() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [progress, setProgress] = useState(0);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadStoryData();
    }, []);

    const loadStoryData = () => {
        const allChapters = getAllChapters();
        setChapters(allChapters);
        setProgress(getStoryProgress());

        allChapters.forEach(chapter => {
            checkChapterMissions(chapter.id);
        });
    };

    const handleChapterClick = (chapter: Chapter) => {
        if (!isChapterUnlocked(chapter.id)) {
            alert('이전 챕터를 완료해야 합니다!');
            return;
        }

        setSelectedChapter(chapter);
        setShowModal(true);
    };

    const handleClaimRewards = (chapterId: string) => {
        const result = claimChapterRewards(chapterId);

        if (result.success) {
            let message = result.message;
            if (result.rewards) {
                message += `\n\n💰 ${result.rewards.tokens} 토큰`;
                if (result.rewards.cards && result.rewards.cards.length > 0) {
                    message += `\n🎴 카드 ${result.rewards.cards.length}장`;
                }
                if (result.rewards.title) {
                    message += `\n🏆 칭호: ${result.rewards.title}`;
                }
            }
            alert(message);
            loadStoryData();
            setShowModal(false);
        } else {
            alert(result.message);
        }
    };

    const getDifficultyColor = (number: number): string => {
        if (number === 1) return 'text-green-400';
        if (number === 2) return 'text-blue-400';
        return 'text-red-400';
    };

    return (
        <div className="h-full">
            {/* 헤더 */}
            <div className="mb-8 animate-slide-down">
                <h1 className="text-4xl font-bold text-gradient mb-2">
                    📖 스토리 모드
                </h1>
                <p className="text-lg text-gray-400">
                    AI의 역사를 경험하고 특별한 보상을 획득하세요
                </p>
            </div>

            {/* 전체 진행도 */}
            <Card variant="glow" className="mb-8 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">
                        전체 진행도
                    </h2>
                    <div className="text-3xl font-bold text-gradient">
                        {progress}%
                    </div>
                </div>
                <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </Card>

            {/* 챕터 목록 */}
            <div className="grid grid-cols-2 gap-6">
                {chapters.map((chapter, index) => {
                    const unlocked = isChapterUnlocked(chapter.id);
                    const completed = isChapterCompleted(chapter.id);
                    const state = getGameState();
                    const completedMissions = chapter.missions.filter(m =>
                        state.storyProgress.completedMissions.includes(m.id)
                    ).length;

                    return (
                        <Card
                            key={chapter.id}
                            variant={completed ? 'glow' : 'gradient'}
                            onClick={() => handleChapterClick(chapter)}
                            className={`animate-slide-up delay-${(index + 1) * 100} ${!unlocked ? 'opacity-50' : ''}`}
                        >
                            {/* 챕터 번호 및 상태 */}
                            <div className="flex items-start justify-between mb-4">
                                <div className={`text-5xl font-bold ${getDifficultyColor(chapter.number)}`}>
                                    CH.{chapter.number}
                                </div>
                                <div className="text-3xl">
                                    {!unlocked && '🔒'}
                                    {unlocked && !completed && '⭕'}
                                    {completed && '✅'}
                                </div>
                            </div>

                            {/* 챕터 정보 */}
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {chapter.title}
                            </h3>
                            <p className="text-gray-400 mb-4 line-clamp-2">
                                {chapter.subtitle}
                            </p>

                            {/* 미션 진행도 */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-gray-400">미션 진행도</span>
                                    <span className="font-bold text-white">
                                        {completedMissions} / {chapter.missions.length}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                                        style={{ width: `${(completedMissions / chapter.missions.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* 보상 */}
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <span>💰</span>
                                    <span className="text-yellow-300">{chapter.rewards.tokens}</span>
                                </div>
                                {chapter.rewards.cards && (
                                    <div className="flex items-center gap-1">
                                        <span>🎴</span>
                                        <span className="text-blue-300">{chapter.rewards.cards.reduce((sum, c) => sum + c.count, 0)}</span>
                                    </div>
                                )}
                                {chapter.rewards.title && (
                                    <div className="flex items-center gap-1">
                                        <span>🏆</span>
                                    </div>
                                )}
                            </div>

                            {/* 상태 메시지 */}
                            <div className="mt-4 text-sm">
                                {!unlocked && (
                                    <span className="text-gray-500">
                                        🔒 이전 챕터를 완료하세요
                                    </span>
                                )}
                                {unlocked && !completed && (
                                    <span className="text-blue-400">
                                        클릭하여 시작하기
                                    </span>
                                )}
                                {completed && (
                                    <span className="text-green-400">
                                        ✅ 완료! 클릭하여 다시 보기
                                    </span>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* 챕터 상세 모달 */}
            {selectedChapter && (
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={`Chapter ${selectedChapter.number}: ${selectedChapter.title}`}
                    size="lg"
                >
                    <div className="space-y-6">
                        {/* 스토리 내용 */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">📖 스토리</h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                {selectedChapter.story}
                            </p>
                        </div>

                        {/* 미션 목록 */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">🎯 미션</h3>
                            <div className="space-y-3">
                                {selectedChapter.missions.map((mission, index) => {
                                    const state = getGameState();
                                    const completed = state.storyProgress.completedMissions.includes(mission.id);

                                    return (
                                        <div
                                            key={mission.id}
                                            className={`p-4 rounded-lg ${completed
                                                ? 'bg-green-900/30 border-2 border-green-500'
                                                : 'bg-gray-800 border-2 border-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl">
                                                    {completed ? '✅' : '⭕'}
                                                </span>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-white mb-1">
                                                        {index + 1}. {mission.title}
                                                    </h4>
                                                    <p className="text-gray-400 text-sm">
                                                        {mission.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 보상 */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">🎁 보상</h3>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl">💰</span>
                                    <span className="text-xl font-bold text-yellow-300">
                                        {selectedChapter.rewards.tokens} 토큰
                                    </span>
                                </div>
                                {selectedChapter.rewards.cards && selectedChapter.rewards.cards.map((cardReward, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="text-3xl">🎴</span>
                                        <span className="text-xl font-bold text-blue-300">
                                            {cardReward.rarity} 카드 {cardReward.count}장
                                        </span>
                                    </div>
                                ))}
                                {selectedChapter.rewards.title && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl">🏆</span>
                                        <span className="text-xl font-bold text-purple-300">
                                            {selectedChapter.rewards.title}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex gap-4">
                            {isChapterCompleted(selectedChapter.id) ? (
                                <>
                                    <Button
                                        variant="success"
                                        onClick={() => handleClaimRewards(selectedChapter.id)}
                                        className="flex-1"
                                    >
                                        보상 받기 🎁
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        닫기
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        loadStoryData();
                                        alert('미션을 완료하면 자동으로 체크됩니다!');
                                    }}
                                    className="flex-1"
                                >
                                    미션 진행하기
                                </Button>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
