// 심플한 후원 배너 컴포넌트
'use client';

interface SimpleSupportBannerProps {
    link?: string;
}

export default function SimpleSupportBanner({ link = '#' }: SimpleSupportBannerProps) {
    return (
        <div className="mt-8 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">☕</span>
                        <h3 className="text-lg font-bold text-white">게임이 마음에 드셨나요?</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                        개발자에게 커피 한 잔 후원하고 더 나은 게임을 함께 만들어요!
                    </p>
                </div>
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg whitespace-nowrap"
                >
                    ☕ 후원하기
                </a>
            </div>
        </div>
    );
}
