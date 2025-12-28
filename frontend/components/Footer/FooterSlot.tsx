import { Card } from '@/lib/types';
import { InventoryCard } from '@/lib/inventory-system';
import { cn } from '@/lib/utils';
import GameCard from '@/components/GameCard';
import { X } from 'lucide-react';

interface FooterSlotProps {
    card: Card | InventoryCard | null;
    index: number;
    onRemove?: () => void;
    onDrop?: (card: Card | InventoryCard) => void;
    size?: 'small' | 'medium' | 'large';
    label?: string;
    type?: 'target' | 'material';
}

export default function FooterSlot({
    card,
    index,
    onRemove,
    onDrop,
    size = 'medium',
    label,
    type = 'material',
}: FooterSlotProps) {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        try {
            const cardData = JSON.parse(e.dataTransfer.getData('application/json'));
            onDrop?.(cardData);
        } catch (error) {
            console.error('Failed to parse card data:', error);
        }
    };

    // 슬롯 크기 - GameCard 크기(160x240)의 비율 유지 (2:3)
    const sizeConfig = {
        small: { width: 53, height: 80, scale: 0.33 },
        medium: { width: 64, height: 96, scale: 0.4 },
        large: { width: 80, height: 120, scale: 0.5 },
    };

    const config = sizeConfig[size];
    const isTarget = type === 'target';

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
                "relative rounded-lg border-2 transition-all flex items-center justify-center overflow-hidden",
                card
                    ? isTarget
                        ? "border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/50"
                        : "border-amber-500/50 bg-amber-500/10"
                    : "border-dashed border-white/20 bg-black/40 hover:border-cyan-500/50 hover:bg-cyan-500/5"
            )}
            style={{ width: config.width, height: config.height }}
        >
            {card ? (
                <>
                    {/* 카드를 정확한 비율로 축소 */}
                    <div
                        style={{
                            transform: `scale(${config.scale})`,
                            transformOrigin: 'center center'
                        }}
                    >
                        <GameCard card={card} showDetails={false} />
                    </div>
                    {onRemove && (
                        <button
                            onClick={onRemove}
                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full hover:bg-red-400 transition-colors z-10 shadow-lg"
                        >
                            <X size={10} className="text-white" />
                        </button>
                    )}
                </>
            ) : (
                <div className="text-center">
                    <div className={cn(
                        "font-mono font-bold",
                        isTarget ? "text-cyan-400/60 text-xs" : "text-white/20 text-[10px]"
                    )}>
                        {label || (isTarget ? '🎯' : `${index + 1}`)}
                    </div>
                </div>
            )}
        </div>
    );
}
