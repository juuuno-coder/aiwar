'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GameCard from '@/components/GameCard';
import CardDetailModal from '@/components/CardDetailModal';
import { Card, Stats } from '@/lib/types';
import { storage } from '@/lib/utils';

export default function InventoryPage() {
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [detailCard, setDetailCard] = useState<Card | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 로컬 스토리지에서 카드 로드
    useEffect(() => {
        const savedCards = storage.get<Card[]>('userCards', []);

        // 카드가 없으면 테스트용 더미 데이터 생성
        if (savedCards.length === 0) {
            const dummyCards: Card[] = [
                {
                    id: 'card-001',
                    templateId: 'gemini-text-001',
                    ownerId: 'user-001',
                    level: 3,
                    experience: 450,
                    stats: {
                        creativity: 32,
                        accuracy: 38,
                        speed: 28,
                        stability: 35,
                        ethics: 30,
                        totalPower: 163,
                    },
                    acquiredAt: new Date(),
                    isLocked: false,
                },
                {
                    id: 'card-002',
                    templateId: 'chatgpt-code-001',
                    ownerId: 'user-001',
                    level: 5,
                    experience: 800,
                    stats: {
                        creativity: 25,
                        accuracy: 42,
                        speed: 35,
                        stability: 38,
                        ethics: 28,
                        totalPower: 168,
                    },
                    acquiredAt: new Date(),
                    isLocked: false,
                },
                {
                    id: 'card-003',
                    templateId: 'midjourney-image-001',
                    ownerId: 'user-001',
                    level: 2,
                    experience: 200,
                    stats: {
                        creativity: 45,
                        accuracy: 30,
                        speed: 22,
                        stability: 28,
                        ethics: 25,
                        totalPower: 150,
                    },
                    acquiredAt: new Date(),
                    isLocked: false,
                },
            ];
            setCards(dummyCards);
            storage.set('userCards', dummyCards);
        } else {
            setCards(savedCards);
        }
    }, []);

    return (
        <div className="h-full bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 overflow-auto p-8">
            {/* 헤더 */}
            <div className="max-w-7xl mx-auto mb-8">
                <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--primary-blue)] mb-2 inline-block">
                    ← 메인으로
                </Link>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gradient mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                            인벤토리
                        </h1>
                        <p className="text-[var(--text-secondary)]">
                            보유 카드: {cards.length}/100
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button className="btn btn-secondary">
                            필터
                        </button>
                        <button className="btn btn-secondary">
                            정렬
                        </button>
                    </div>
                </div>

                {/* 필터 옵션 */}
                <div className="flex gap-3 mb-6">
                    <button className="px-4 py-2 rounded-lg bg-[var(--dark-card)] border border-[var(--primary-purple)] text-sm hover:bg-[var(--primary-purple)] transition-colors">
                        전체
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-[var(--dark-card)] text-sm hover:bg-[var(--primary-purple)] transition-colors">
                        ⭐ 커먼
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-[var(--dark-card)] text-sm hover:bg-[var(--primary-purple)] transition-colors">
                        ⭐⭐ 레어
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-[var(--dark-card)] text-sm hover:bg-[var(--primary-purple)] transition-colors">
                        ⭐⭐⭐ 에픽
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-[var(--dark-card)] text-sm hover:bg-[var(--primary-purple)] transition-colors">
                        ⭐⭐⭐⭐ 레전더리
                    </button>
                </div>
            </div>

            {/* 카드 그리드 */}
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
                    {cards.map((card) => (
                        <GameCard
                            key={card.id}
                            card={card}
                            isSelected={selectedCard === card.id}
                            onClick={() => setSelectedCard(card.id === selectedCard ? null : card.id)}
                        />
                    ))}
                </div>
            </div>

            {/* 하단 액션 버튼 */}
            {selectedCard && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 animate-float">
                    <Link href="/enhance" className="btn btn-primary">
                        강화하기
                    </Link>
                    <Link href="/fusion" className="btn btn-secondary">
                        합성하기
                    </Link>
                    <button
                        onClick={() => {
                            const card = cards.find(c => c.id === selectedCard);
                            if (card) {
                                setDetailCard(card);
                                setIsModalOpen(true);
                            }
                        }}
                        className="btn btn-secondary"
                    >
                        상세 정보
                    </button>
                </div>
            )}

            {/* 카드 상세 정보 모달 */}
            <CardDetailModal
                card={detailCard}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
