'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CyberPageLayout from '@/components/CyberPageLayout';
import { storage, getRandomRarity, generateRandomStats, generateId } from '@/lib/utils';
import { Card as CardType, Rarity } from '@/lib/types';
import { HoverBorderGradient } from '@/components/ui/aceternity/hover-border-gradient';
import { cn } from '@/lib/utils';

interface ShopItem {
    id: string;
    name: string;
    description: string;
    icon: string;
    price: number;
    type: 'card-pack' | 'boost' | 'special';
}

const shopItems: ShopItem[] = [
    { id: 'basic-pack', name: 'BASIC_PACK', description: '랜덤 카드 3장', icon: '🎴', price: 300, type: 'card-pack' },
    { id: 'premium-pack', name: 'PREMIUM_PACK', description: '레어 이상 보장 카드 5장', icon: '✨', price: 800, type: 'card-pack' },
    { id: 'legendary-pack', name: 'LEGENDARY_PACK', description: '에픽 이상 보장 카드 3장', icon: '💎', price: 1500, type: 'card-pack' },
    { id: 'exp-boost', name: 'EXP_BOOST', description: '1시간 동안 경험치 2배', icon: '⚡', price: 500, type: 'boost' },
    { id: 'coin-boost', name: 'COIN_BOOST', description: '1시간 동안 코인 획득 2배', icon: '💰', price: 500, type: 'boost' },
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
        if (item.id === 'premium-pack') { cardCount = 5; guaranteedRarity = 'rare'; }
        else if (item.id === 'legendary-pack') { cardCount = 3; guaranteedRarity = 'epic'; }

        const newCards: any[] = [];
        for (let i = 0; i < cardCount; i++) {
            let rarity: Rarity;
            if (i === 0 && guaranteedRarity) {
                rarity = (guaranteedRarity === 'rare' ? (Math.random() > 0.5 ? 'rare' : 'epic') : (Math.random() > 0.7 ? 'epic' : 'legendary')) as Rarity;
            } else {
                rarity = getRandomRarity({ common: 60, rare: 30, epic: 8, legendary: 2 });
            }
            const stats = generateRandomStats(rarity);
            newCards.push({
                id: generateId(),
                templateId: `shop-${item.id}-${Date.now()}-${i}`,
                ownerId: 'user-001',
                level: 1,
                experience: 0,
                stats,
                acquiredAt: new Date(),
                isLocked: false,
            });
        }
        const existingCards = storage.get<CardType[]>('userCards', []);
        storage.set('userCards', [...existingCards, ...newCards]);
        alert(`${item.name}에서 ${cardCount}장의 카드를 획득했습니다!`);
    };

    return (
        <CyberPageLayout
            title="SUPPLY_MARKET"
            subtitle="Resource Exchange"
            description="카드 팩과 부스터를 구매하여 전력을 강화하세요. 코인은 전투 승리로 획득할 수 있습니다."
            color="pink"
            action={
                <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2">
                    <span className="text-2xl">💰</span>
                    <div>
                        <p className="text-[9px] font-mono text-white/40 uppercase">BALANCE</p>
                        <p className={cn("text-lg font-bold orbitron text-amber-400", purchaseAnimation && "animate-pulse")}>
                            {userCoins.toLocaleString()}
                        </p>
                    </div>
                </div>
            }
        >
            {/* Card Packs */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                    <h2 className="text-sm font-mono text-white/60 uppercase tracking-widest">CARD_PACKS</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {shopItems.filter(item => item.type === 'card-pack').map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:border-purple-500/30 transition-all group"
                        >
                            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                            <h3 className="text-lg font-bold orbitron text-white mb-2">{item.name}</h3>
                            <p className="text-sm text-white/40 mb-4">{item.description}</p>
                            <p className="text-2xl font-bold text-amber-400 mb-4">💰 {item.price.toLocaleString()}</p>
                            <HoverBorderGradient
                                onClick={() => purchaseItem(item)}
                                containerClassName="w-full"
                                className={cn(
                                    "w-full py-3",
                                    userCoins < item.price && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <span className="font-mono text-sm uppercase tracking-widest text-white">
                                    {userCoins >= item.price ? 'PURCHASE' : 'INSUFFICIENT'}
                                </span>
                            </HoverBorderGradient>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Boosters */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                    <h2 className="text-sm font-mono text-white/60 uppercase tracking-widest">BOOSTERS</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {shopItems.filter(item => item.type === 'boost').map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + 0.1 * i }}
                            className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center gap-6 hover:border-cyan-500/30 transition-all"
                        >
                            <div className="text-4xl">{item.icon}</div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold orbitron text-white">{item.name}</h3>
                                <p className="text-sm text-white/40">{item.description}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-amber-400 mb-2">💰 {item.price}</p>
                                <button
                                    onClick={() => purchaseItem(item)}
                                    disabled={userCoins < item.price}
                                    className={cn(
                                        "px-4 py-2 rounded text-[10px] font-mono uppercase tracking-widest transition-all",
                                        userCoins >= item.price
                                            ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30"
                                            : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                                    )}
                                >
                                    {userCoins >= item.price ? 'BUY' : 'N/A'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Tips */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-xl p-6"
            >
                <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-widest mb-3">SYSTEM_INFO</h3>
                <ul className="text-sm text-white/40 space-y-1 font-mono">
                    <li>• 대전에서 승리하면 코인을 획득할 수 있습니다</li>
                    <li>• 프리미엄 팩은 레어 이상 카드가 보장됩니다</li>
                    <li>• 부스터는 중복 사용이 가능합니다</li>
                </ul>
            </motion.div>
        </CyberPageLayout>
    );
}
