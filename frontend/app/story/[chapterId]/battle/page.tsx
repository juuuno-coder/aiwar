'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import GameCard from '@/components/GameCard';
import { Card, Rarity } from '@/lib/types';
import { storage, generateId } from '@/lib/utils';

interface StoryChapter {
    id: string;
    title: string;
    year: string;
    description: string;
    difficulty: string;
    reward: number;
    completed: boolean;
    enemyLevel: number;
}

export default function StoryBattlePage() {
    const params = useParams();
    const router = useRouter();
    const chapterId = params.chapterId as string;

    const [chapter, setChapter] = useState<StoryChapter | null>(null);
    const [playerCards, setPlayerCards] = useState<Card[]>([]);
    const [enemyCards, setEnemyCards] = useState<Card[]>([]);
    const [currentRound, setCurrentRound] = useState(0);
    const [playerWins, setPlayerWins] = useState(0);
    const [enemyWins, setEnemyWins] = useState(0);
    const [roundResult, setRoundResult] = useState<'win' | 'lose' | 'draw' | null>(null);
    const [battleEnded, setBattleEnded] = useState(false);

    // 적 카드 생성 함수
    const generateEnemyCard = (level: number): Card => {
        const rarities: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
        const rarity = rarities[Math.floor(Math.random() * rarities.length)];

        const baseStats = 15 + (level * 10);
        const variance = 10;

        const card: Card = {
            id: generateId(),
            templateId: `enemy-template-${level}`,
            ownerId: 'ai',
            level: level,
            experience: 0,
            stats: {
                creativity: baseStats + Math.floor(Math.random() * variance),
                accuracy: baseStats + Math.floor(Math.random() * variance),
                speed: baseStats + Math.floor(Math.random() * variance),
                stability: baseStats + Math.floor(Math.random() * variance),
                ethics: baseStats + Math.floor(Math.random() * variance),
                totalPower: 0,
            },
            acquiredAt: new Date(),
            isLocked: false,
        };

        card.stats.totalPower = card.stats.creativity + card.stats.accuracy +
            card.stats.speed + card.stats.stability + card.stats.ethics;

        return card;
    };

    useEffect(() => {
        // 챕터 정보 로드
        const chapters: StoryChapter[] = [
            { id: 'chapter-1', title: '2025: AI의 시작', year: '2025', description: 'ChatGPT가 세상을 바꾸기 시작했다', difficulty: '쉬움', reward: 500, completed: false, enemyLevel: 1 },
            { id: 'chapter-2', title: '2026: 멀티모달의 시대', year: '2026', description: '이미지와 텍스트를 넘나드는 AI', difficulty: '보통', reward: 800, completed: false, enemyLevel: 2 },
            { id: 'chapter-3', title: '2027: 창작의 혁명', year: '2027', description: 'AI가 예술가가 되다', difficulty: '어려움', reward: 1200, completed: false, enemyLevel: 3 },
            { id: 'chapter-4', title: '2028: 자동화의 가속', year: '2028', description: '모든 것이 자동화되는 세상', difficulty: '매우 어려움', reward: 1500, completed: false, enemyLevel: 4 },
            { id: 'chapter-5', title: '2029: AGI의 등장', year: '2029', description: '범용 인공지능의 탄생', difficulty: '극악', reward: 2000, completed: false, enemyLevel: 5 },
        ];

        const foundChapter = chapters.find(c => c.id === chapterId);
        if (!foundChapter) {
            router.push('/story');
            return;
        }
        setChapter(foundChapter);

        // 플레이어 카드 로드
        const userCards = storage.get<Card[]>('userCards', []);
        if (userCards.length < 5) {
            alert('카드가 부족합니다. 최소 5장이 필요합니다.');
            router.push('/story');
            return;
        }

        // 상위 5장 선택
        const topCards = userCards
            .sort((a, b) => b.stats.totalPower - a.stats.totalPower)
            .slice(0, 5);
        setPlayerCards(topCards);

        // 적 카드 생성
        const enemies: Card[] = [];
        for (let i = 0; i < 5; i++) {
            enemies.push(generateEnemyCard(foundChapter.enemyLevel));
        }
        setEnemyCards(enemies);
    }, [chapterId, router]);

    const playRound = () => {
        if (currentRound >= 5 || battleEnded) return;

        const playerCard = playerCards[currentRound];
        const enemyCard = enemyCards[currentRound];

        const playerPower = playerCard.stats.totalPower;
        const enemyPower = enemyCard.stats.totalPower;

        if (playerPower > enemyPower) {
            setPlayerWins(prev => prev + 1);
            setRoundResult('win');
        } else if (playerPower < enemyPower) {
            setEnemyWins(prev => prev + 1);
            setRoundResult('lose');
        } else {
            setRoundResult('draw');
        }

        setTimeout(() => {
            if (currentRound === 4) {
                setBattleEnded(true);
            } else {
                setCurrentRound(prev => prev + 1);
                setRoundResult(null);
            }
        }, 2000);
    };

    const completeBattle = () => {
        if (!chapter) return;

        if (playerWins > enemyWins) {
            // 승리 처리
            const currentCoins = storage.get<number>('userCoins', 1000);
            storage.set('userCoins', currentCoins + chapter.reward);

            // 챕터 완료 표시
            const completedChapters = storage.get<string[]>('completedChapters', []);
            if (!completedChapters.includes(chapterId)) {
                completedChapters.push(chapterId);
                storage.set('completedChapters', completedChapters);
            }

            alert(`승리! ${chapter.reward} 코인을 획득했습니다!`);
        } else {
            alert('패배했습니다. 다시 도전하세요!');
        }

        router.push('/story');
    };

    if (!chapter) {
        return <div className="min-h-screen flex items-center justify-center">
            <p className="text-xl">로딩 중...</p>
        </div>;
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                {/* 헤더 */}
                <div className="mb-8">
                    <Link href="/story" className="text-[var(--text-secondary)] hover:text-[var(--primary-blue)] mb-2 inline-block">
                        ← 스토리 모드로
                    </Link>
                    <h1 className="text-4xl font-bold text-gradient mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        {chapter.title}
                    </h1>
                    <p className="text-[var(--text-secondary)]">{chapter.description}</p>
                </div>

                {/* 점수판 */}
                <div className="card p-6 mb-8 glow-purple">
                    <div className="flex items-center justify-between">
                        <div className="text-center">
                            <p className="text-sm text-[var(--text-secondary)] mb-1">플레이어</p>
                            <p className="text-4xl font-bold text-[var(--primary-blue)]">{playerWins}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-[var(--text-secondary)]">
                                라운드 {currentRound + 1}/5
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-[var(--text-secondary)] mb-1">적</p>
                            <p className="text-4xl font-bold text-[var(--accent-red)]">{enemyWins}</p>
                        </div>
                    </div>
                </div>

                {/* 대전 화면 */}
                {!battleEnded ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            {/* 플레이어 카드 */}
                            <div>
                                <h3 className="text-xl font-bold mb-4 text-center">내 카드</h3>
                                <div className="flex flex-col items-center gap-4">
                                    <GameCard card={playerCards[currentRound]} />
                                    {roundResult && (
                                        <p className="text-lg font-bold">
                                            전투력: {playerCards[currentRound].stats.totalPower}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* 적 카드 */}
                            {roundResult && (
                                <div>
                                    <h3 className="text-xl font-bold mb-4 text-center">적 카드</h3>
                                    <div className="flex flex-col items-center gap-4">
                                        <GameCard card={enemyCards[currentRound]} />
                                        <p className="text-lg font-bold">
                                            전투력: {enemyCards[currentRound].stats.totalPower}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 라운드 결과 */}
                        {roundResult && (
                            <div className="card p-8 text-center animate-fade-in">
                                <p className="text-4xl font-bold mb-4">
                                    {roundResult === 'win' ? (
                                        <span className="text-[var(--accent-green)]">승리!</span>
                                    ) : roundResult === 'lose' ? (
                                        <span className="text-[var(--accent-red)]">패배</span>
                                    ) : (
                                        <span className="text-[var(--primary-blue)]">무승부</span>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* 액션 버튼 */}
                        {!roundResult && (
                            <div className="text-center">
                                <button onClick={playRound} className="btn btn-primary text-xl px-12 py-4 animate-bounce">
                                    카드 공개 🎴
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* 최종 결과 */
                    <div className="card p-12 text-center animate-fade-in">
                        <h2 className="text-5xl font-bold mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                            {playerWins > enemyWins ? (
                                <span className="text-[var(--accent-green)] animate-bounce">🎉 승리! 🎉</span>
                            ) : playerWins < enemyWins ? (
                                <span className="text-[var(--accent-red)]">패배...</span>
                            ) : (
                                <span className="text-[var(--primary-blue)]">무승부</span>
                            )}
                        </h2>
                        <p className="text-2xl mb-8">
                            최종 점수: {playerWins} - {enemyWins}
                        </p>
                        {playerWins > enemyWins && (
                            <p className="text-xl mb-8 text-[var(--accent-green)]">
                                💰 {chapter.reward} 코인 획득!
                            </p>
                        )}
                        <button onClick={completeBattle} className="btn btn-primary text-xl px-12 py-4">
                            완료
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
