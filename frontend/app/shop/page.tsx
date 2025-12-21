'use client';

import { useState, useEffect } from 'react';
import { storage, getRandomRarity, generateRandomStats, generateId } from '@/lib/utils';
import { Card, Rarity } from '@/lib/types';
import UiCard from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface ShopItem {
    id: string;
    name: string;
    description: string;
    icon: string;
    price: number;
    type: 'card-pack' | 'boost' | 'special';
}

const shopItems: ShopItem[] = [
    {
        id: 'basic-pack',
        name: '기본 카드 팩',
        description: '랜덤 카드 3장',
        icon: '🎴',
        price: 300,
        type: 'card-pack',
    },
    {
        id: 'premium-pack',
        name: '프리미엄 카드 팩',
        description: '레어 이상 보장 카드 5장',
        icon: '✨',
        price: 800,
        type: 'card-pack',
    },
    {
        id: 'legendary-pack',
        name: '레전더리 카드 팩',
        description: '에픽 이상 보장 카드 3장',
        icon: '💎',
        price: 1500,
        type: 'card-pack',
    },
    {
        id: 'exp-boost',
        name: '경험치 부스터',
        description: '1시간 동안 경험치 2배',
        icon: '⚡',
        price: 500,
        type: 'boost',
    },
    {
        id: 'coin-boost',
        name: '코인 부스터',
        description: '1시간 동안 코인 획득 2배',
        icon: '💰',
        price: 500,
        type: 'boost',
    },
];

export default function ShopPage() {
    const [userCoins, setUserCoins] = useState(1000);
    const [purchaseAnimation, setPurchaseAnimation] = useState(false);

    useEffect(() => {
        const savedCoins = storage.get<number>('userCoins', 1000);
        setUserCoins(savedCoins);
    }, []);

    const purchaseItem = (item: ShopItem) => {
        if (userCoins < item.price) {
            alert('코인이 부족합니다!');
            return;
        }

        const newCoins = userCoins - item.price;
        setUserCoins(newCoins);
        storage.set('userCoins', newCoins);

        setPurchaseAnimation(true);
        setTimeout(() => setPurchaseAnimation(false), 1000);

        if (item.type === 'card-pack') {
            giveCardPack(item);
        } else {
            alert(`${item.name}을(를) 구매했습니다!`);
        }
    };

    const giveCardPack = (item: ShopItem) => {
        let cardCount = 3;
        let guaranteedRarity: 'rare' | 'epic' | null = null;

        if (item.id === 'premium-pack') {
            cardCount = 5;
            guaranteedRarity = 'rare';
        } else if (item.id === 'legendary-pack') {
            cardCount = 3;
            guaranteedRarity = 'epic';
        }

        const newCards: Card[] = [];

        for (let i = 0; i < cardCount; i++) {
            let rarity: Rarity;
            if (i === 0 && guaranteedRarity) {
                if (guaranteedRarity === 'rare') {
                    rarity = (Math.random() > 0.5 ? 'rare' : 'epic') as Rarity;
                } else {
                    rarity = (Math.random() > 0.7 ? 'epic' : 'legendary') as Rarity;
                }
            } else {
                rarity = getRandomRarity({
                    common: 60,
                    rare: 30,
                    epic: 8,
                    legendary: 2,
                });
            }

            const stats = generateRandomStats(rarity);
            const newCard: Card = {
                id: generateId(),
                templateId: `shop-${item.id}-${Date.now()}-${i}`,
                ownerId: 'user-001',
                level: 1,
                experience: 0,
                stats,
                acquiredAt: new Date(),
                isLocked: false,
            };
            newCards.push(newCard);
        }

        const existingCards = storage.get<Card[]>('userCards', []);
        storage.set('userCards', [...existingCards, ...newCards]);

        const rarityText = newCards.map(c => {
            if (c.stats.totalPower > 250) return 'LEGENDARY';
            if (c.stats.totalPower > 200) return 'EPIC';
            if (c.stats.totalPower > 150) return 'RARE';
            return 'COMMON';
        }).join(', ');

        const hasLegendary = newCards.some(c => c.stats.totalPower > 250);
        if (hasLegendary) {
            import('@/lib/achievement-utils').then(({ updateAchievementStats }) => {
                updateAchievementStats('legendary', 1);
            });
        }

        alert(`${item.name}에서 ${cardCount}장의 카드를 획득했습니다!\n등급: ${rarityText}`);
    };

    return (
        <div className="h-full">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-8 animate-slide-down">
                <div>
                    <h1 className="text-4xl font-bold text-gradient mb-2">
                        🛒 상점
                    </h1>
                    <p className="text-lg text-gray-400">
                        카드 팩과 부스터를 구매하세요
                    </p>
                </div>
                <UiCard variant="gradient" className="text-right">
                    <p className="text-sm text-gray-400 mb-1">보유 코인</p>
                    <p className={`text-4xl font-bold text-yellow-300 ${purchaseAnimation ? 'animate-pulse' : ''}`}>
                        💰 {userCoins.toLocaleString()}
                    </p>
                </UiCard>
            </div>

            {/* 카드 팩 섹션 */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-white">
                    카드 팩
                </h2>
                <div className="grid grid-cols-3 gap-6">
                    {shopItems.filter(item => item.type === 'card-pack').map((item, index) => (
                        <UiCard
                            key={item.id}
                            variant="glow"
                            className={`text-center animate-slide-up delay-${(index + 1) * 100}`}
                        >
                            <div className="text-6xl mb-4">{item.icon}</div>
                            <h3 className="text-xl font-bold mb-2 text-white">
                                {item.name}
                            </h3>
                            <p className="text-sm text-gray-400 mb-4">
                                {item.description}
                            </p>
                            <div className="text-2xl font-bold mb-4 text-yellow-300">
                                💰 {item.price.toLocaleString()}
                            </div>
                            <Button
                                variant="primary"
                                onClick={() => purchaseItem(item)}
                                disabled={userCoins < item.price}
                                className="w-full"
                            >
                                {userCoins >= item.price ? '구매하기' : '코인 부족'}
                            </Button>
                        </UiCard>
                    ))}
                </div>
            </div>

            {/* 부스터 섹션 */}
            <div>
                <h2 className="text-2xl font-bold mb-6 text-white">
                    부스터
                </h2>
                <div className="grid grid-cols-2 gap-6">
                    {shopItems.filter(item => item.type === 'boost').map((item, index) => (
                        <UiCard
                            key={item.id}
                            className={`flex items-center gap-6 animate-slide-up delay-${(index + 4) * 100}`}
                        >
                            <div className="text-5xl">{item.icon}</div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-1 text-white">
                                    {item.name}
                                </h3>
                                <p className="text-sm text-gray-400 mb-2">
                                    {item.description}
                                </p>
                                <div className="text-lg font-bold text-yellow-300">
                                    💰 {item.price.toLocaleString()}
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                onClick={() => purchaseItem(item)}
                                disabled={userCoins < item.price}
                            >
                                구매
                            </Button>
                        </UiCard>
                    ))}
                </div>
            </div>

            {/* 안내 메시지 */}
            <UiCard className="mt-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-slide-up delay-600">
                <h3 className="text-lg font-bold mb-2 text-white">💡 팁</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                    <li>• 대전에서 승리하면 코인을 획득할 수 있습니다</li>
                    <li>• 프리미엄 팩은 레어 이상 카드가 보장됩니다</li>
                    <li>• 부스터는 중복 사용이 가능합니다</li>
                </ul>
            </UiCard>
        </div>
    );
}
