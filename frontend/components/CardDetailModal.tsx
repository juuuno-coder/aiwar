import { Card } from '@/lib/types';

interface CardDetailModalProps {
    card: Card | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function CardDetailModal({ card, isOpen, onClose }: CardDetailModalProps) {
    if (!isOpen || !card) return null;

    const getCardRarity = (card: Card): string => {
        if (card.stats.totalPower > 250) return 'LEGENDARY';
        if (card.stats.totalPower > 200) return 'EPIC';
        if (card.stats.totalPower > 150) return 'RARE';
        return 'COMMON';
    };

    const getRarityColor = (rarity: string): string => {
        switch (rarity) {
            case 'LEGENDARY':
                return 'var(--rarity-legendary)';
            case 'EPIC':
                return 'var(--rarity-epic)';
            case 'RARE':
                return 'var(--rarity-rare)';
            default:
                return 'var(--rarity-common)';
        }
    };

    const rarity = getCardRarity(card);
    const rarityColor = getRarityColor(rarity);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="card p-8 max-w-2xl w-full relative"
                onClick={(e) => e.stopPropagation()}
                style={{ borderColor: rarityColor, borderWidth: '2px' }}
            >
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-2xl hover:text-[var(--primary-blue)] transition-colors"
                >
                    ✕
                </button>

                {/* 헤더 */}
                <div className="text-center mb-6">
                    <div className="text-7xl mb-4">🤖</div>
                    <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        AI 유닛 #{card.id.slice(0, 8)}
                    </h2>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-lg font-bold" style={{ color: rarityColor }}>
                            {rarity}
                        </span>
                        <span className="text-[var(--text-secondary)]">•</span>
                        <span className="text-lg">Lv.{card.level}</span>
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                        획득일: {new Date(card.acquiredAt).toLocaleDateString('ko-KR')}
                    </div>
                </div>

                {/* 총 전투력 */}
                <div className="card p-6 mb-6 text-center glow-purple">
                    <p className="text-sm text-[var(--text-secondary)] mb-2">총 전투력</p>
                    <p className="text-5xl font-bold text-gradient" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        {card.stats.totalPower}
                    </p>
                </div>

                {/* 능력치 상세 */}
                <div className="mb-6">
                    <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        능력치
                    </h3>
                    <div className="space-y-3">
                        <StatRow label="창의성" value={card.stats.creativity} max={70} icon="💡" />
                        <StatRow label="정확성" value={card.stats.accuracy} max={70} icon="🎯" />
                        <StatRow label="속도" value={card.stats.speed} max={70} icon="⚡" />
                        <StatRow label="안정성" value={card.stats.stability} max={70} icon="🛡️" />
                        <StatRow label="윤리성" value={card.stats.ethics} max={70} icon="⚖️" />
                    </div>
                </div>

                {/* 경험치 */}
                <div className="mb-6">
                    <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        경험치
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[var(--text-secondary)]">현재 경험치</span>
                        <span className="font-bold">{card.experience} / {card.level * 100}</span>
                    </div>
                    <div className="w-full h-3 bg-[var(--dark-bg)] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[var(--primary-blue)] to-[var(--primary-purple)]"
                            style={{ width: `${(card.experience / (card.level * 100)) * 100}%` }}
                        />
                    </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-4">
                    <button className="btn btn-primary flex-1">
                        강화하기
                    </button>
                    <button className="btn btn-secondary flex-1">
                        합성하기
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatRow({ label, value, max, icon }: { label: string; value: number; max: number; icon: string }) {
    const percentage = (value / max) * 100;

    return (
        <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold">{label}</span>
                    <span className="text-sm font-bold">{value}</span>
                </div>
                <div className="w-full h-3 bg-[var(--dark-bg)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[var(--primary-blue)] to-[var(--primary-purple)]"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
