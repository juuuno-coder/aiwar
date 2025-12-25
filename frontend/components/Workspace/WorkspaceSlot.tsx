import { Card } from '@/lib/types';
import { cn } from '@/lib/utils';
import GameCard from '@/components/GameCard';
import { X } from 'lucide-react';

interface WorkspaceSlotProps {
    card: Card | null;
    index: number;
    onRemove?: () => void;
    onDrop?: (card: Card) => void;
    size?: 'small' | 'medium';
    label?: string;
}

export default function WorkspaceSlot({
    card,
    index,
    onRemove,
    onDrop,
    size = 'medium',
    label,
}: WorkspaceSlotProps) {
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

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
                "relative rounded-lg border-2 border-dashed transition-all",
                card
                    ? "border-green-500/30 bg-green-500/10"
                    : "border-white/10 bg-black/40 hover:border-cyan-500/50",
                size === 'small' ? "h-32" : "h-40",
                "flex items-center justify-center"
            )}
        >
            {card ? (
                <>
                    <div className={cn(
                        "relative",
                        size === 'small' ? "w-20" : "w-28"
                    )}>
                        <GameCard card={card} />
                    </div>
                    {onRemove && (
                        <button
                            onClick={onRemove}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-400 transition-colors z-10"
                        >
                            <X size={14} className="text-white" />
                        </button>
                    )}
                </>
            ) : (
                <div className="text-center">
                    <div className="text-white/20 text-xs font-mono">
                        {label || `SLOT ${index + 1}`}
                    </div>
                    <div className="text-white/10 text-[10px] mt-1">
                        드래그 또는 클릭
                    </div>
                </div>
            )}
        </div>
    );
}
