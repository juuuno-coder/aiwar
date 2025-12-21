'use client';

import { useState, useEffect } from 'react';
import {
    getUniqueUnitProgress,
    startUniqueUnitGeneration,
    claimUniqueUnit,
    formatTime,
    getAllUniqueUnits
} from '@/lib/unique-unit-utils';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_NAMES } from '@/lib/faction-types';
import { calculateSynergy } from '@/lib/slot-utils';
import UiCard from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CircularProgress from '@/components/CircularProgress';

export default function UniqueUnitPage() {
    const [progress, setProgress] = useState<any>(null);
    const [synergy, setSynergy] = useState<any>(null);
    const [allUnits, setAllUnits] = useState<any[]>([]);

    useEffect(() => {
        loadData();

        const interval = setInterval(() => {
            loadData();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const loadData = () => {
        const currentProgress = getUniqueUnitProgress();
        const currentSynergy = calculateSynergy();
        const units = getAllUniqueUnits();

        setProgress(currentProgress);
        setSynergy(currentSynergy);
        setAllUnits(units);
    };

    const handleStart = () => {
        const result = startUniqueUnitGeneration();
        alert(result.message);
        loadData();
    };

    const handleClaim = () => {
        const result = claimUniqueUnit();
        alert(result.message);

        if (result.success) {
            setTimeout(() => {
                handleStart();
            }, 1000);
        }

        loadData();
    };

    const getCategoryColor = (category: string) => {
        return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#888';
    };

    const getCategoryIcon = (category: string) => {
        return CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || '❓';
    };

    const getCategoryName = (category: string) => {
        return CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES] || category;
    };

    return (
        <div className="h-full">
            {/* 헤더 */}
            <div className="mb-8 animate-slide-down">
                <h1 className="text-4xl font-bold text-gradient mb-2">
                    🌟 유니크 유닛
                </h1>
                <p className="text-lg text-gray-400">
                    24시간마다 생성되는 특별한 유닛을 획득하세요
                </p>
            </div>

            {/* 타이머 영역 */}
            <UiCard variant="glow" className="mb-8 animate-slide-up">
                {!progress?.isGenerating ? (
                    /* 생성 시작 전 */
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">⏰</div>
                        <h2 className="text-2xl font-bold mb-4 text-white">유니크 유닛 생성 대기 중</h2>
                        <p className="text-gray-400 mb-6">
                            버튼을 클릭하여 유니크 유닛 생성을 시작하세요
                        </p>
                        <Button variant="primary" size="lg" onClick={handleStart}>
                            생성 시작하기 🚀
                        </Button>
                    </div>
                ) : progress.isComplete ? (
                    /* 생성 완료 */
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4 animate-bounce">✨</div>
                        <h2 className="text-3xl font-bold mb-4 text-gradient">유닛 생성 완료!</h2>

                        {progress.unitData && (
                            <div className="mb-6">
                                <div
                                    className="text-5xl mb-2"
                                    style={{ color: getCategoryColor(progress.unitData.category) }}
                                >
                                    {progress.unitData.iconEmoji}
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-white">{progress.unitData.name}</h3>
                                <p className="text-gray-400 mb-4">{progress.unitData.description}</p>

                                <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
                                    <UiCard variant="gradient">
                                        <p className="text-sm text-gray-400">전투력</p>
                                        <p className="text-2xl font-bold text-white">{progress.unitData.basePower}</p>
                                    </UiCard>
                                    <UiCard variant="gradient">
                                        <p className="text-sm text-gray-400">등급</p>
                                        <p className="text-2xl font-bold capitalize text-white">{progress.unitData.rarity}</p>
                                    </UiCard>
                                    <UiCard variant="gradient">
                                        <p className="text-sm text-gray-400">배율</p>
                                        <p className="text-2xl font-bold text-white">×{progress.unitData.powerMultiplier}</p>
                                    </UiCard>
                                </div>

                                <UiCard className="max-w-2xl mx-auto mb-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                                    <p className="text-sm text-gray-400 mb-2">특수 스킬</p>
                                    <p className="text-xl font-bold mb-2 text-white">{progress.unitData.specialSkill.name}</p>
                                    <p className="text-gray-400">{progress.unitData.specialSkill.description}</p>
                                </UiCard>
                            </div>
                        )}

                        <Button variant="success" size="lg" onClick={handleClaim} className="animate-pulse">
                            수령하기 🎁
                        </Button>
                    </div>
                ) : (
                    /* 생성 중 */
                    <div className="py-8">
                        <div className="flex flex-col items-center mb-6">
                            {/* 원형 진행도 바 */}
                            <CircularProgress
                                percentage={progress.progress}
                                size={220}
                                strokeWidth={14}
                                color="#8B5CF6"
                            >
                                <div className="text-center mt-2">
                                    <div className="text-sm text-gray-400 mb-1">남은 시간</div>
                                    <div className="text-2xl font-bold text-gradient">
                                        {formatTime(progress.remainingTime)}
                                    </div>
                                </div>
                            </CircularProgress>

                            <div className="mt-6 text-center">
                                <h2 className="text-2xl font-bold mb-2 text-white">유니크 유닛 생성 중...</h2>
                                {progress.unitData && (
                                    <p className="text-gray-400">
                                        {getCategoryIcon(progress.unitData.category)} {progress.unitData.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 시너지 효과 */}
                        {synergy && synergy.timeReduction > 0 && (
                            <UiCard className="bg-gradient-to-r from-green-500/20 to-blue-500/20 animate-slide-up">
                                <p className="text-sm text-gray-400 mb-2">⚡ 시너지 효과</p>
                                <p className="text-xl font-bold text-green-400">
                                    생성 시간 {(synergy.timeReduction * 100).toFixed(0)}% 감소
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                    {synergy.description}
                                </p>
                            </UiCard>
                        )}
                    </div>
                )}
            </UiCard>

            {/* 유니크 유닛 목록 */}
            <UiCard className="animate-slide-up delay-200">
                <h2 className="text-2xl font-bold mb-6 text-white">유니크 유닛 도감</h2>

                <div className="grid grid-cols-3 gap-6">
                    {allUnits.map((unit, index) => (
                        <UiCard
                            key={unit.id}
                            variant={progress?.unitData?.id === unit.id ? 'glow' : 'default'}
                            className={`animate-slide-up delay-${(index + 1) * 50}`}
                        >
                            <div
                                className="text-4xl mb-3"
                                style={{ color: getCategoryColor(unit.category) }}
                            >
                                {unit.iconEmoji}
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">{unit.name}</h3>
                            <p className="text-xs text-gray-400 mb-3">
                                {getCategoryName(unit.category)}
                            </p>
                            <p className="text-sm text-gray-400 mb-4">
                                {unit.description}
                            </p>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div>
                                    <p className="text-xs text-gray-400">전투력</p>
                                    <p className="font-bold text-white">{unit.basePower}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">등급</p>
                                    <p className="font-bold capitalize text-white">{unit.rarity}</p>
                                </div>
                            </div>

                            <div className="bg-gray-900 p-3 rounded">
                                <p className="text-xs text-gray-400 mb-1">특수 스킬</p>
                                <p className="text-sm font-bold text-white">{unit.specialSkill.name}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {unit.specialSkill.description}
                                </p>
                            </div>
                        </UiCard>
                    ))}
                </div>
            </UiCard>

            {/* 도움말 */}
            <UiCard className="mt-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-slide-up delay-300">
                <h3 className="text-xl font-bold mb-4 text-white">💡 팁</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                    <li>• 슬롯에 같은 카테고리 AI를 배치하면 생성 시간이 단축됩니다</li>
                    <li>• 슈퍼 모델 5개 배치 시 최대 95% 감소 (1.2시간)</li>
                    <li>• 유니크 유닛은 일반 카드보다 70-100% 강력합니다</li>
                    <li>• 특수 스킬은 전투에서 강력한 효과를 발휘합니다</li>
                </ul>
            </UiCard>
        </div>
    );
}
