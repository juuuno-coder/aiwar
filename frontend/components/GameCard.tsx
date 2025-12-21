import { Card as CardType, Rarity } from '@/lib/types';

interface GameCardProps {
    card: CardType;
    onClick?: () => void;
    isSelected?: boolean;
}

export default function GameCard({ card, onClick, isSelected = false }: GameCardProps) {
    const rarityColors: Record<Rarity, string> = {
        common: 'var(--rarity-common)',
        rare: 'var(--rarity-rare)',
        epic: 'var(--rarity-epic)',
        legendary: 'var(--rarity-legendary)',
    };

    const rarityGlow: Record<Rarity, string> = {
        common: 'card-common',
        rare: 'card-rare',
        epic: 'card-epic',
        legendary: 'card-legendary',
    };

    // 임시로 rarity를 'rare'로 설정 (실제로는 card template에서 가져와야 함)
    const rarity: Rarity = 'rare';

    return (
        <div
            className={`
        relative cursor-pointer transition-all duration-300
        ${rarityGlow[rarity]}
        ${isSelected ? 'scale-105 ring-4 ring-[var(--primary-blue)]' : 'hover:scale-105'}
      `}
            onClick={onClick}
            style={{
                width: '200px',
                height: '300px',
            }}
        >
            {/* 카드 배경 */}
            <div
                className="absolute inset-0 rounded-xl overflow-hidden"
                style={{
                    background: 'var(--dark-card)',
                    border: `2px solid ${rarityColors[rarity]}`,
                }}
            >
                {/* 카드 이미지 영역 */}
                <div className="relative h-[60%] bg-gradient-to-b from-[var(--dark-bg)] to-[var(--dark-card)] flex items-center justify-center">
                    <div className="text-6xl">🤖</div>
                    {/* 레벨 표시 */}
                    <div className="absolute top-2 right-2 bg-[var(--dark-overlay)] px-2 py-1 rounded text-xs font-bold">
                        Lv.{card.level}
                    </div>
                </div>

                {/* 카드 정보 영역 */}
                <div className="h-[40%] p-3 flex flex-col">
                    {/* 카드 이름 */}
                    <h3 className="text-sm font-bold mb-1 truncate" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        AI 유닛 #{card.id.slice(0, 6)}
                    </h3>

                    {/* 등급 표시 */}
                    <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: getRarityStars(rarity) }).map((_, i) => (
                            <span key={i} className="text-yellow-400">⭐</span>
                        ))}
                    </div>

                    {/* 능력치 */}
                    <div className="flex-1 space-y-1 text-xs">
                        <StatBar label="창의" value={card.stats.creativity} max={80} />
                        <StatBar label="정확" value={card.stats.accuracy} max={80} />
                        <StatBar label="속도" value={card.stats.speed} max={80} />
                    </div>

                    {/* 경험치 바 */}
                    {card.level < 10 && (
                        <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-[var(--text-secondary)]">EXP</span>
                                <span className="text-[var(--primary-blue)]">
                                    {card.experience}/{card.level * 100}
                                </span>
                            </div>
                            <div className="h-1 bg-[var(--dark-bg)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[var(--accent-green)] to-[var(--primary-blue)]"
                                    style={{ width: `${Math.min((card.experience / (card.level * 100)) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* 총 전투력 */}
                    <div className="mt-2 pt-2 border-t border-[var(--primary-purple)] flex justify-between items-center">
                        <span className="text-xs text-[var(--text-secondary)]">전투력</span>
                        <span className="text-lg font-bold text-gradient" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                            {card.stats.totalPower}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBar({ label, value, max }: { label: string; value: number; max: number }) {
    const percentage = (value / max) * 100;

    return (
        <div className="flex items-center gap-2">
            <span className="text-[var(--text-secondary)] w-8">{label}</span>
            <div className="flex-1 h-2 bg-[var(--dark-bg)] rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-[var(--primary-blue)] to-[var(--primary-purple)]"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-[var(--text-primary)] w-6 text-right">{value}</span>
        </div>
    );
}

function getRarityStars(rarity: Rarity): number {
    const stars: Record<Rarity, number> = {
        common: 1,
        rare: 2,
        epic: 3,
        legendary: 4,
    };
    return stars[rarity];
}
