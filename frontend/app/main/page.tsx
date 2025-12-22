'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { InfiniteMovingCards } from '@/components/ui/aceternity/infinite-moving-cards';
import { FocusCards } from '@/components/ui/aceternity/focus-cards';
import { Card3D, CardBody, CardItem } from '@/components/ui/aceternity/3d-card';
import { initializeNewPlayer } from '@/lib/game-init';
import { getGameState, checkDailyReset } from '@/lib/game-state';

export default function MainPage() {
    const router = useRouter();
    const [stats, setStats] = useState({
        tokens: 0,
        cards: 0,
        level: 1,
        coins: 0,
    });

    useEffect(() => {
        initializeNewPlayer();
        checkDailyReset();

        const state = getGameState();
        setStats({
            tokens: state.tokens || 0,
            cards: state.inventory?.length || 0,
            level: state.level || 1,
            coins: state.coins || 0,
        });
    }, []);

    // Announcements for Infinite Moving Cards
    const announcements = [
        {
            content: (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">📢</span>
                        <h3 className="text-lg font-bold text-white">New Update v1.2</h3>
                    </div>
                    <p className="text-sm text-slate-300">
                        - 새로운 카드 추가<br />
                        - 전투 시스템 개선<br />
                        - UI/UX 업데이트
                    </p>
                </div>
            ),
        },
        {
            content: (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🎉</span>
                        <h3 className="text-lg font-bold text-white">이벤트: 2배 보상</h3>
                    </div>
                    <p className="text-sm text-slate-300">
                        12월 25일까지 모든 전투에서<br />
                        보상 2배 지급!
                    </p>
                </div>
            ),
        },
        {
            content: (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">⚔️</span>
                        <h3 className="text-lg font-bold text-white">PvP 시즌 시작</h3>
                    </div>
                    <p className="text-sm text-slate-300">
                        새로운 시즌이 시작되었습니다!<br />
                        랭킹 1위에 도전하세요!
                    </p>
                </div>
            ),
        },
    ];

    // Stats for Focus Cards
    const statsCards = [
        {
            title: `Level ${stats.level}`,
            src: '/images/stats/level.png',
            content: <p className="text-sm">현재 레벨</p>,
        },
        {
            title: `${stats.coins.toLocaleString()} Coins`,
            src: '/images/stats/coins.png',
            content: <p className="text-sm">보유 코인</p>,
        },
        {
            title: `${stats.tokens} Tokens`,
            src: '/images/stats/tokens.png',
            content: <p className="text-sm">보유 토큰</p>,
        },
        {
            title: `${stats.cards} Cards`,
            src: '/images/stats/cards.png',
            content: <p className="text-sm">보유 카드</p>,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 pt-8 pb-20 px-8">
            {/* Page Title */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <h1 className="text-5xl font-black text-white mb-2">Dashboard</h1>
                <p className="text-slate-400">Welcome back, Commander</p>
            </motion.div>

            {/* Announcements Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-16"
            >
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">공지사항 & 업데이트</h2>
                    <p className="text-slate-400 text-sm">최신 소식을 확인하세요</p>
                </div>

                <InfiniteMovingCards
                    items={announcements}
                    direction="left"
                    speed="slow"
                    pauseOnHover={true}
                />
            </motion.div>

            {/* Stats Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-16"
            >
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">통계</h2>
                    <p className="text-slate-400 text-sm">현재 상태를 확인하세요</p>
                </div>

                <div className="grid grid-cols-4 gap-6">
                    {[
                        { label: 'Level', value: stats.level, icon: '⬡', color: 'purple' },
                        { label: 'Coins', value: stats.coins.toLocaleString(), icon: '◆', color: 'amber' },
                        { label: 'Tokens', value: stats.tokens, icon: '◈', color: 'blue' },
                        { label: 'Cards', value: stats.cards, icon: '◉', color: 'violet' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="bg-slate-800/40 backdrop-blur-sm border border-purple-500/10 rounded-2xl p-6 hover:border-purple-400/30 transition-all cursor-pointer"
                        >
                            <div className="text-center space-y-3">
                                <div className="text-2xl text-purple-400/40">{stat.icon}</div>
                                <div className="text-sm text-slate-400 uppercase tracking-wider font-medium">
                                    {stat.label}
                                </div>
                                <div className="text-3xl font-bold text-white">
                                    {stat.value}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Main Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-16"
            >
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">메인 액션</h2>
                    <p className="text-slate-400 text-sm">게임을 시작하세요</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {[
                        {
                            title: 'Story Mode',
                            subtitle: 'Experience the chronicle',
                            href: '/story',
                            icon: '📖',
                            gradient: 'from-purple-600/20 to-blue-600/20',
                        },
                        {
                            title: 'Battle Arena',
                            subtitle: 'Test your skills',
                            href: '/battle',
                            icon: '⚔️',
                            gradient: 'from-blue-600/20 to-indigo-600/20',
                        },
                    ].map((action, i) => (
                        <motion.div
                            key={action.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                        >
                            <Link href={action.href}>
                                <Card3D className="w-full">
                                    <CardBody className={`bg-gradient-to-br ${action.gradient} backdrop-blur-xl border border-white/5 rounded-3xl p-10 hover:border-white/10 transition-all`}>
                                        <CardItem translateZ="50" className="text-5xl mb-4">
                                            {action.icon}
                                        </CardItem>
                                        <CardItem translateZ="60" className="text-sm text-slate-400 uppercase tracking-widest mb-2">
                                            {action.subtitle}
                                        </CardItem>
                                        <CardItem translateZ="80" className="text-4xl font-black text-white mb-4">
                                            {action.title}
                                        </CardItem>
                                        <CardItem translateZ="100" className="inline-flex items-center text-purple-300 group-hover:text-purple-200">
                                            <span className="text-sm font-medium">Enter</span>
                                            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </CardItem>
                                    </CardBody>
                                </Card3D>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
