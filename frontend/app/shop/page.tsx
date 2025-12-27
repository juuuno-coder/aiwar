'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CyberPageLayout from '@/components/CyberPageLayout';
// import { getGameState, updateGameState } from '@/lib/game-state';
import { useAlert } from '@/context/AlertContext';
import { ShoppingCart, Coins, Package, Sparkles, X, ShoppingBag, Loader2 } from 'lucide-react';
import { CARD_PACKS, openCardPack, CardPack } from '@/lib/card-pack-system';
import { Card } from '@/lib/types';
import { addCardsToInventory } from '@/lib/inventory-system';
import { motion, AnimatePresence } from 'framer-motion';
import GachaRevealModal from '@/components/GachaRevealModal';
import { useUser } from '@/context/UserContext';
// import { useUserProfile } from '@/hooks/useUserProfile';

export default function ShopPage() {
    const router = useRouter();
    const { showAlert, showConfirm } = useAlert();
    const { coins, level, addCoins } = useUser(); // Using UserContext

    // Local state for UI only (pack opening animation)
    const [openedCards, setOpenedCards] = useState<Card[]>([]);
    const [showPackOpening, setShowPackOpening] = useState(false);
    const [currentPack, setCurrentPack] = useState<CardPack | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);

    const handlePurchase = async (pack: CardPack) => {
        // 코인 확인 (UserContext state)
        if (coins < pack.price) {
            showAlert({
                title: '코인 부족',
                message: `코인이 부족합니다!\n필요: ${pack.price} 코인\n보유: ${coins} 코인`,
                type: 'error',
            });
            return;
        }

        showConfirm({
            title: '카드팩 구매',
            message: `${pack.name}을(를) 구매하시겠습니까?\n\n가격: ${pack.price} 코인\n카드 개수: ${pack.cardCount}장`,
            onConfirm: async () => {
                setIsPurchasing(true);
                try {
                    // 1. 카드 생성 (Generate Cards first)
                    const generatedCards = openCardPack(pack, `commander-${level}`);

                    // 2. 인벤토리에 추가 (Atomic Batch)
                    await addCardsToInventory(generatedCards);

                    // 3. 코인 차감 (Only after cards are safely registered)
                    await addCoins(-pack.price);

                    // 4. 개봉 애니메이션 표시
                    setCurrentPack(pack);
                    setOpenedCards(generatedCards);
                    setShowPackOpening(true);

                } catch (error) {
                    console.error('카드팩 구매 실패:', error);
                    showAlert({
                        title: '구매 실패',
                        message: '카드팩 구매 중 오류가 발생했습니다. 코인은 차감되지 않았습니다.',
                        type: 'error',
                    });
                } finally {
                    setIsPurchasing(false);
                }
            },
        });
    };

    const closePackOpening = () => {
        setShowPackOpening(false);
        setOpenedCards([]);
        setCurrentPack(null);
        // No need to manually reload state, UserContext stays in sync or updates via addCoins
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'common': return 'text-gray-400 border-gray-500';
            case 'rare': return 'text-blue-400 border-blue-500';
            case 'epic': return 'text-purple-400 border-purple-500';
            case 'legendary': return 'text-yellow-400 border-yellow-500';
            case 'unique': return 'text-pink-400 border-pink-500';
            case 'commander': return 'text-red-400 border-red-500';
            default: return 'text-gray-400 border-gray-500';
        }
    };

    return (
        <CyberPageLayout
            title="상점"
            englishTitle="SHOP"
            description="코인으로 카드팩을 구매하세요"
            color="yellow"
        >
            <div className="max-w-6xl mx-auto">
                {/* 보유 코인 */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm text-white/60 mb-1">보유 코인</h3>
                            <p className="text-4xl font-black text-yellow-400 flex items-center gap-2">
                                <Coins size={32} />
                                {coins.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-white/60">레벨</p>
                            <p className="text-2xl font-bold text-cyan-400">Lv.{level}</p>
                        </div>
                    </div>
                </div>

                {/* 카드팩 목록 */}
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <ShoppingCart className="text-yellow-400" size={24} />
                    카드팩
                </h2>

                <div className="grid grid-cols-2 gap-6 mb-8">
                    {CARD_PACKS.map((pack) => (
                        <div
                            key={pack.id}
                            className="bg-black/40 border border-white/10 rounded-xl p-6 hover:border-yellow-500/50 transition-all group"
                        >
                            <div className="text-center mb-4">
                                <div className="text-6xl mb-3">{pack.icon}</div>
                                <h3 className="text-xl font-bold text-white mb-2">{pack.name}</h3>
                                <p className="text-sm text-white/60 mb-2">{pack.description}</p>
                                <div className="flex items-center justify-center gap-2 text-xs text-white/40">
                                    <Package size={14} />
                                    <span>{pack.cardCount}장</span>
                                </div>
                            </div>

                            {/* 확률 정보 */}
                            <div className="bg-white/5 rounded-lg p-3 mb-4">
                                <p className="text-xs text-white/40 mb-2">등급 확률</p>
                                <div className="space-y-1">
                                    {Object.entries(pack.rarityWeights).map(([rarity, weight]) => {
                                        if (weight === 0) return null;
                                        return (
                                            <div key={rarity} className="flex justify-between text-xs">
                                                <span className={getRarityColor(rarity).split(' ')[0]}>
                                                    {rarity.toUpperCase()}
                                                </span>
                                                <span className="text-white/60">{weight}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="text-center mb-4">
                                <div className="text-3xl font-black text-yellow-400 flex items-center justify-center gap-2">
                                    <Coins size={24} />
                                    {pack.price.toLocaleString()}
                                </div>
                            </div>

                            <button
                                onClick={() => handlePurchase(pack)}
                                disabled={coins < pack.price}
                                className={`w-full py-3 font-bold rounded-xl transition-all shadow-lg ${coins < pack.price
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white hover:scale-105'
                                    }`}
                            >
                                {coins < pack.price ? '코인 부족' : '구매하기'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* 안내 */}
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
                        <Sparkles size={20} />
                        안내사항
                    </h3>
                    <ul className="space-y-2 text-sm text-white/60">
                        <li>• 카드팩을 구매하면 즉시 개봉되어 카드를 획득합니다</li>
                        <li>• 획득한 카드는 자동으로 인벤토리에 추가됩니다</li>
                        <li>• 비싼 팩일수록 고등급 카드 확률이 높습니다</li>
                        <li>• 코인은 전투 승리, 미션 완료 등으로 획득할 수 있습니다</li>
                    </ul>
                </div>
            </div>

            {/* 구매 중 로딩 레이어 */}
            <AnimatePresence>
                {isPurchasing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex flex-col items-center justify-center text-center"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center border-2 border-yellow-500/50 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                        >
                            <ShoppingBag className="text-yellow-400" size={48} />
                        </motion.div>
                        <h2 className="text-2xl font-black text-white mb-2 tracking-tighter">구매 처리 중...</h2>
                        <p className="text-gray-400 flex items-center gap-2">
                            <Loader2 className="animate-spin" size={16} />
                            네트워크를 통해 카드를 획득하고 있습니다. 잠시만 기다려주세요.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 카드팩 개봉 모달 (GachaRevealModal 사용) */}
            <GachaRevealModal
                isOpen={showPackOpening}
                onClose={closePackOpening}
                cards={openedCards}
                packType={currentPack?.price! >= 1000 ? 'legendary' : currentPack?.price! >= 500 ? 'premium' : 'basic'}
            />
        </CyberPageLayout>
    );
}
