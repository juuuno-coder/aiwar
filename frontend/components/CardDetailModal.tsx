import { Card, AIType, Rarity } from '@/lib/types';
import { InventoryCard } from '@/lib/inventory-system';
import GameCard from '@/components/GameCard';
import { motion } from 'framer-motion';

interface CardDetailModalProps {
    card: Card | InventoryCard | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function CardDetailModal({ card, isOpen, onClose }: CardDetailModalProps) {
    if (!isOpen || !card) return null;

    const getCardRarity = (card: Card | InventoryCard): string => {
        if (card.rarity) return card.rarity.toUpperCase();
        return 'COMMON';
    };

    const getRarityColor = (rarity: string): string => {
        switch (rarity) {
            case 'LEGENDARY': return '#fbbf24'; // amber-400
            case 'EPIC': return '#a855f7'; // purple-500
            case 'RARE': return '#3b82f6'; // blue-500
            case 'UNIQUE': return '#ef4444'; // red-500
            case 'COMMANDER': return '#10b981'; // emerald-500
            default: return '#9ca3af'; // gray-400
        }
    };

    const rarity = getCardRarity(card);
    const rarityColor = getRarityColor(rarity);

    return (
        <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 relative pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 md:-right-12 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
                >
                    ✕
                </button>

                {/* Left: Enhanced Game Card (Visual) - Maximized Scale */}
                {/* 
                    GameCard Base Size: 160px x 240px
                    Mobile Scale: 1.8x -> 288px x 432px
                    Desktop Scale: 2.2x -> 352px x 528px
                */}
                <div className="relative flex-shrink-0 flex items-center justify-center w-[300px] h-[450px] md:w-[360px] md:h-[540px]">
                    {/* Glow Effect behind the card */}
                    <div
                        className="absolute inset-0 blur-3xl opacity-40 scale-110 pointer-events-none"
                        style={{ backgroundColor: rarityColor }}
                    />

                    {/* Scaled GameCard */}
                    <div className="transform scale-[1.8] md:scale-[2.2] origin-center z-10 drop-shadow-2xl">
                        <GameCard
                            card={card}
                            onClick={undefined} // No click action inside modal
                            isDisabled={false}
                            isSelected={false}
                        // We use the GameCard to render the exact visual
                        />
                    </div>
                </div>

                {/* Right: Details & Actions */}
                <div className="flex-1 w-full max-w-sm bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                    {/* Decorative Top Border */}
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: rarityColor }} />

                    <div className="mb-6">
                        <h2 className="text-3xl font-black text-white mb-2 font-orbitron tracking-tighter">
                            {card.name}
                        </h2>
                        <div className="flex items-center gap-2 mb-4">
                            <span
                                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-black"
                                style={{ backgroundColor: rarityColor }}
                            >
                                {rarity}
                            </span>
                            <span className="text-sm text-white/50 font-mono">
                                Level {card.level}
                            </span>
                        </div>
                        <p className="text-sm text-gray-300 font-light leading-relaxed">
                            {card.description || "No description available for this unit."}
                        </p>
                    </div>

                    {/* Stats numeric details (complementing visual bars on card) */}
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                            <span className="text-xs text-gray-400 uppercase tracking-widest">Total Power</span>
                            <span className="text-xl font-bold font-orbitron text-white">{card.stats.totalPower}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <StatDetail label="CRE" value={card.stats.creativity} />
                            <StatDetail label="ACC" value={card.stats.accuracy} />
                            <StatDetail label="SPD" value={card.stats.speed} />
                            <StatDetail label="STB" value={card.stats.stability} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-auto">
                        <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-bold text-white transition-all uppercase tracking-wider hover:border-white/30">
                            Enhance
                        </button>
                        <button className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-sm font-bold text-white shadow-lg transition-all uppercase tracking-wider">
                            Fusion
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatDetail({ label, value }: { label: string, value?: number }) {
    return (
        <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded">
            <span className="text-[10px] text-gray-500">{label}</span>
            <span className="text-sm font-bold text-white font-mono">{value || 0}</span>
        </div>
    )
}
