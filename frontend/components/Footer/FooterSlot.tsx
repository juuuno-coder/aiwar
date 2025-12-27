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

    const sizeClasses = {
        small: 'w-16 h-24',
        medium: 'w-20 h-28',
        large: 'w-28 h-40',
    };

    const isTarget = type === 'target';

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
                "relative rounded-lg border-2 transition-all flex items-center justify-center",
                sizeClasses[size],
                card
                    ? isTarget
                        ? "border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/50"
                        : "border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/30"
                    : "border-dashed border-white/20 bg-black/40 hover:border-cyan-500/50 hover:bg-cyan-500/5"
            )}
        >
            {card ? (
                <>
                    <div className="relative w-full h-full p-1">
                        <GameCard card={card} />
                    </div>
                    {onRemove && (
                        <button
                            onClick={onRemove}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-400 transition-colors z-10 shadow-lg"
                        >
                            <X size={12} className="text-white" />
                        </button>
                    )}
                </>
            ) : (
                <div className="text-center">
                    <div className={cn(
                        "font-mono font-bold",
                        isTarget ? "text-cyan-400/60 text-xs" : "text-white/20 text-[10px]"
                    )}>
                        {label || (isTarget ? '🎯 TARGET' : `${index + 1}`)}
                    </div>
                </div>
            )}
        </div>
    );
}
