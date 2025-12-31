import { InventoryCard } from '@/lib/inventory-system';
import { Card } from '@/lib/types';
import { cn } from '@/lib/utils';
import FooterSlot from './FooterSlot';
import { Sparkles } from 'lucide-react';

interface UniqueFooterProps {
    materialSlots: (Card | InventoryCard | null)[];
    onMaterialDrop: (card: Card | InventoryCard, index: number) => void;
    onMaterialRemove: (index: number) => void;
    onClear: () => void;
    onAutoSelect: () => void;
    onSubmit: () => void;
    canSubmit: boolean;
}

export default function UniqueFooter({
    materialSlots,
    onMaterialDrop,
    onMaterialRemove,
    onClear,
    onAutoSelect,
    onSubmit,
    canSubmit,
}: UniqueFooterProps) {
    const filledCount = materialSlots.filter(c => c !== null).length;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[130px] z-50">
            {/* 상단 그라데이션 블러 */}
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent to-black/50 backdrop-blur-sm" />

            {/* 메인 푸터 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-red-900/10 to-transparent backdrop-blur-md">
                {/* 중앙 정렬 컨테이너 (80% 너비) */}
                <div className="h-full px-6 py-3 flex items-center gap-6 mx-auto w-[80%] max-w-[80%]">
                    {/* 재료 슬롯 */}
                    <div className="flex items-center gap-4">
                        <p className="text-[10px] font-mono text-red-500 uppercase whitespace-nowrap">
                            Legendary Materials ({filledCount}/5)
                        </p>
                        <div className="flex gap-2">
                            {materialSlots.map((card, index) => (
                                <div key={index} className={card ? "transform -translate-y-2 transition-transform" : ""}>
                                    <FooterSlot
                                        card={card}
                                        index={index}
                                        size="medium"
                                        onDrop={(droppedCard) => onMaterialDrop(droppedCard, index)}
                                        onRemove={card ? () => onMaterialRemove(index) : undefined}
                                    />
                                </div>
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

                        {/* 제출 버튼 */}
                        <button
                            onClick={onSubmit}
                            disabled={!canSubmit}
                            className={cn(
                                "px-8 py-3 font-bold rounded-xl transition-all text-base flex items-center gap-2 shadow-lg",
                                canSubmit
                                    ? "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white shadow-red-600/50 hover:scale-105"
                                    : "bg-gray-700 text-gray-400 cursor-not-allowed shadow-none"
                            )}
                        >
                            <Sparkles size={18} />
                            유니크 생성
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
