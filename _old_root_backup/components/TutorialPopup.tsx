'use client';

import { useState, useEffect } from 'react';

interface TutorialPopupProps {
    onClose: () => void;
}

export default function TutorialPopup({ onClose }: TutorialPopupProps) {
    const [step, setStep] = useState(0);

    const tutorials = [
        {
            title: "🎮 AI 대전에 오신 것을 환영합니다!",
            content: "2030년, AI들이 카드 전투로 세상을 지배하는 시대입니다. 당신은 최강의 AI 군단을 모아 챔피언이 되어야 합니다!",
            emoji: "🌟"
        },
        {
            title: "💰 토큰 시스템",
            content: "토큰으로 AI 군단을 해금하고, 카드를 강화하고, 슬롯에 배치할 수 있습니다. 대전에서 승리하면 토큰을 획득합니다!",
            emoji: "💎"
        },
        {
            title: "🎰 슬롯 시너지",
            content: "5개의 슬롯에 AI를 배치하세요. 같은 카테고리의 AI를 모으면 강력한 시너지 보너스를 받습니다! (최대 +120%)",
            emoji: "⚡"
        },
        {
            title: "⚔️ 5전 3선승제",
            content: "대전은 5라운드로 진행됩니다. 먼저 3라운드를 이기는 쪽이 승리! 카드 전투력의 끝자리 숫자로 승부를 겨룹니다.",
            emoji: "🎯"
        },
        {
            title: "🌟 유니크 유닛",
            content: "24시간마다 특별한 유니크 유닛이 생성됩니다. 슬롯 시너지가 높을수록 생성 시간이 단축됩니다!",
            emoji: "✨"
        },
        {
            title: "📖 스토리 모드",
            content: "스토리 모드를 진행하며 게임을 배우세요! 튜토리얼 챕터부터 시작하여 풍부한 보상을 받을 수 있습니다.",
            emoji: "🎁"
        }
    ];

    const currentTutorial = tutorials[step];

    const handleNext = () => {
        if (step < tutorials.length - 1) {
            setStep(step + 1);
        } else {
            onClose();
        }
    };

    const handleSkip = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 max-w-2xl w-full shadow-2xl border-2 border-purple-500/50">
                {/* 진행도 */}
                <div className="flex gap-2 mb-6">
                    {tutorials.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 flex-1 rounded-full transition-all ${index <= step ? 'bg-purple-500' : 'bg-gray-600'
                                }`}
                        />
                    ))}
                </div>

                {/* 이모지 */}
                <div className="text-8xl text-center mb-6 animate-bounce">
                    {currentTutorial.emoji}
                </div>

                {/* 제목 */}
                <h2 className="text-3xl font-bold text-white text-center mb-4">
                    {currentTutorial.title}
                </h2>

                {/* 내용 */}
                <p className="text-lg text-gray-200 text-center mb-8 leading-relaxed">
                    {currentTutorial.content}
                </p>

                {/* 버튼 */}
                <div className="flex gap-4">
                    <button
                        onClick={handleSkip}
                        className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
                    >
                        건너뛰기
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-bold transition-all"
                    >
                        {step < tutorials.length - 1 ? '다음' : '시작하기'} →
                    </button>
                </div>

                {/* 단계 표시 */}
                <div className="text-center mt-4 text-gray-400 text-sm">
                    {step + 1} / {tutorials.length}
                </div>
            </div>
        </div>
    );
}
