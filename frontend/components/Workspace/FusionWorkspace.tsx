import { Card } from '@/lib/types';
import { cn } from '@/lib/utils';
import WorkspaceSlot from './WorkspaceSlot';
import { FlaskConical } from 'lucide-react';

interface FusionWorkspaceProps {
    materialCards: (Card | null)[];
    onMaterialAdd: (card: Card, index: number) => void;
    onMaterialRemove: (index: number) => void;
    onAutoSelect: () => void;
    onFuse: () => void;
    canFuse: boolean;
    preview?: {
        currentRarity: string;
        nextRarity: string;
        currentPower: number;
        nextPower: number;
        cost: number;
    };
}

export default function FusionWorkspace({
    materialCards,
    onMaterialAdd,
    onMaterialRemove,
    onAutoSelect,
    onFuse,
    canFuse,
    preview,
}: FusionWorkspaceProps) {
    const filledCount = materialCards.filter(c => c !== null).length;

    return (
        <div className="flex flex-col h-[calc(100vh-280px-80px)] p-6">
            {/* Material Cards Section */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-sm font-mono text-purple-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <FlaskConical size={16} /> Materials ({filledCount}/3)
                </h2>

                <div className="grid grid-cols-3 gap-6 mb-8">
                    {materialCards.map((card, index) => (
                        <WorkspaceSlot
                            key={index}
                            card={card}
                            index={index}
                            onRemove={card ? () => onMaterialRemove(index) : undefined}
                            onDrop={(droppedCard) => onMaterialAdd(droppedCard, index)}
                        />
                    ))}
                </div>

                {/* Preview */}
                {preview && filledCount === 3 && (
                    <div className="w-full max-w-md bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                        <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">Synthesis Preview</p>
                        <div className="space-y-1">
                            <p className="text-lg font-bold text-white">
                                {preview.currentRarity} → {preview.nextRarity}
                            </p>
                            <p className="text-sm text-white/80">
                                PWR: {preview.currentPower} → {preview.nextPower}
                            </p>
                            <p className="text-sm text-amber-400 mt-2">
                                COST: {preview.cost}T
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/10 p-4 flex gap-3 justify-end -mx-6 -mb-6">
                <button
                    onClick={() => materialCards.forEach((_, i) => onMaterialRemove(i))}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded transition-colors"
                >
                    초기화
                </button>
                <button
                    onClick={onAutoSelect}
                    className="px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded transition-colors"
                >
                    자동 선택
                </button>
                <button
                    onClick={onFuse}
                    disabled={!canFuse}
                    className={cn(
                        "px-8 py-2 font-bold rounded transition-colors",
                        canFuse
                            ? "bg-purple-500 hover:bg-purple-400 text-white"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    )}
                >
                    합성 🔮
                </button>
            </div>
        </div>
    );
}
