import { Card } from '@/lib/types';
import { InventoryCard } from '@/lib/inventory-system';
import { cn } from '@/lib/utils';
import FooterSlot from './FooterSlot';
import { FlaskConical } from 'lucide-react';

interface FusionFooterProps {
    materialSlots: (InventoryCard | null)[];
    onMaterialDrop: (card: InventoryCard, index: number) => void;
    onMaterialRemove: (index: number) => void;
    onClear: () => void;
    onAutoSelect: () => void;
    onFuse: () => void;
    canFuse: boolean;
}

export default function FusionFooter({
    materialSlots,
    onMaterialDrop,
    onMaterialRemove,
    onClear,
    onAutoSelect,
    onFuse,
    canFuse,
}: FusionFooterProps) {
    const filledCount = materialSlots.filter(c => c !== null).length;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[130px] z-50">
            {/* 상단 그라데이션 블러 */}
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent to-black/50 backdrop-blur-sm" />

            {/* 메인 푸터 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-900/10 to-transparent backdrop-blur-md">
                {/* 중앙 정렬 컨테이너 (70% 너비) - Space Between 복구 */}
                <div className="h-full px-6 py-3 flex items-center gap-6 mx-auto w-[70%] max-w-[70%]">
                    {/* 재료 슬롯 */}
                    <div className="flex items-center gap-4">
                        <p className="text-[10px] font-mono text-purple-400 uppercase whitespace-nowrap">
                            🔮 Materials ({filledCount}/3)
                        </p>
                        <div className="flex gap-3">
                            {materialSlots.map((card, index) => (
                                <FooterSlot
                                    key={index}
                                    card={card}
                                    index={index}
                                    size="medium"
                                    onDrop={(droppedCard) => onMaterialDrop(droppedCard as InventoryCard, index)}
                                    onRemove={card ? () => onMaterialRemove(index) : undefined}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 스페이서 */}
                    <div className="flex-1" />

                    {/* 버튼 영역 */}
                    <div className="flex items-center gap-3">
                        {/* 초기화 버튼 */}
                        <button
                            onClick={onClear}
                            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg transition-colors text-sm"
                        >
                            초기화
                        </button>

                        {/* 자동선택 버튼 */}
                        <button
                            onClick={onAutoSelect}
                            className="px-5 py-2.5 bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-300 rounded-lg transition-all text-sm font-medium border border-cyan-400/50"
                        >
                            자동선택
                        </button>

                        {/* 합성 버튼 */}
                        <button
                            onClick={onFuse}
                            disabled={!canFuse}
                            className={cn(
                                "px-8 py-3 font-bold rounded-xl transition-all text-base flex items-center gap-2 shadow-lg",
                                canFuse
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-purple-500/50 hover:scale-105"
                                    : "bg-gray-700 text-gray-400 cursor-not-allowed shadow-none"
                            )}
                        >
                            <FlaskConical size={18} />
                            합성
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
