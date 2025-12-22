'use client';

import Link from 'next/link';

export default function GameFooter() {
    return (
        <footer className="fixed bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-md border-t border-gray-700/50 z-50">
            <div className="h-full px-6 flex items-center justify-between text-sm">
                {/* 왼쪽 - 빠른 액세스 */}
                <div className="flex items-center gap-4">
                    <Link href="/inventory" className="text-gray-400 hover:text-white transition-colors">
                        📦 인벤토리
                    </Link>
                    <Link href="/missions" className="text-gray-400 hover:text-white transition-colors">
                        🎯 미션
                    </Link>
                    <Link href="/achievements" className="text-gray-400 hover:text-white transition-colors">
                        🏅 업적
                    </Link>
                    <Link href="/settings" className="text-gray-400 hover:text-white transition-colors">
                        ⚙️ 설정
                    </Link>
                </div>

                {/* 중앙 - 버전 정보 */}
                <div className="text-gray-500 text-xs">
                    AI War v1.0.0 | Made with Next.js 16
                </div>

                {/* 오른쪽 - 소셜 */}
                <div className="flex items-center gap-4 text-gray-400">
                    <button className="hover:text-white transition-colors">
                        💬 커뮤니티
                    </button>
                    <button className="hover:text-white transition-colors">
                        📢 공지사항
                    </button>
                </div>
            </div>
        </footer>
    );
}
