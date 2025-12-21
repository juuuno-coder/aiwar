// 바이미어커피 배너 컴포넌트
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function BuyMeACoffeeBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);

    if (!isVisible) return null;

    return (
        <>
            {/* 최소화된 버튼 */}
            {isMinimized ? (
                <div className="fixed bottom-4 right-4 z-50">
                    <button
                        onClick={() => setIsMinimized(false)}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105"
                    >
                        ☕ 후원하기
                    </button>
                </div>
            ) : (
                /* 전체 배너 */
                <div className="fixed bottom-4 right-4 z-50 max-w-sm">
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-2xl shadow-2xl p-6 relative">
                        {/* 닫기 버튼 */}
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label="닫기"
                        >
                            <X size={20} />
                        </button>

                        {/* 최소화 버튼 */}
                        <button
                            onClick={() => setIsMinimized(true)}
                            className="absolute top-2 right-10 text-gray-500 hover:text-gray-700 transition-colors text-xl font-bold"
                            aria-label="최소화"
                        >
                            −
                        </button>

                        {/* 내용 */}
                        <div className="flex items-start gap-4">
                            <div className="text-5xl">☕</div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    게임이 마음에 드셨나요?
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    개발자에게 커피 한 잔 사주시면 더 좋은 게임을 만드는 데 큰 힘이 됩니다! 💪
                                </p>
                                <a
                                    href="https://www.buymeacoffee.com/yourname"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-6 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg"
                                >
                                    ☕ Buy me a coffee
                                </a>
                            </div>
                        </div>

                        {/* 장식 */}
                        <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-400 rounded-full opacity-50"></div>
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-orange-400 rounded-full opacity-50"></div>
                    </div>
                </div>
            )}
        </>
    );
}
