'use client';

import { useState, useEffect } from 'react';
import { InventoryCard, loadInventory } from '@/lib/inventory-system';
import { canApplyForUnique, submitUniqueApplication, getApplicationCost, getMyApplications, UniqueApplication } from '@/lib/unique-application-utils';
import { Button } from '@/components/ui/custom/Button';
import GameCard from '@/components/GameCard';
import CyberPageLayout from '@/components/CyberPageLayout';
import { Input } from '@/components/ui/custom/Input';
import { Textarea } from '@/components/ui/custom/Textarea';
import ImageUpload from '@/components/ImageUpload';
import UniqueFooter from '@/components/Footer/UniqueFooter';
import { cn } from '@/lib/utils';

export default function UniqueCreatePage() {
    const [allCards, setAllCards] = useState<InventoryCard[]>([]);
    const [materialSlots, setMaterialSlots] = useState<(InventoryCard | null)[]>(Array(5).fill(null));
    const [userTokens, setUserTokens] = useState(0);
    const [legendaryCards, setLegendaryCards] = useState<InventoryCard[]>([]);

    // Application Form State
    const [appName, setAppName] = useState('');
    const [appDesc, setAppDesc] = useState('');
    const [appImage, setAppImage] = useState<string | null>(null);
    const [myApps, setMyApps] = useState<UniqueApplication[]>([]);
    const [viewMode, setViewMode] = useState<'create' | 'list'>('create');

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        const { getGameState } = await import('@/lib/game-state');
        const { getMyApplications } = await import('@/lib/unique-application-utils');

        const cards = await loadInventory();
        const state = getGameState();
        const apps = await getMyApplications();

        // 전설급 카드만 필터링
        const legendary = cards.filter(c => c.rarity === 'legendary');

        setAllCards(cards);
        setLegendaryCards(legendary);
        setUserTokens(state.tokens || 0);
        setMyApps(apps);
    };

    const handleCardClick = (card: InventoryCard) => {
        // 강화된 카드(레벨 2 이상)는 선택 불가 - 강화되지 않은 카드만 사용 가능
        if (card.level > 1) return;

        // 이미 선택된 카드면 제거
        const slotIndex = materialSlots.findIndex(s => s?.id === card.id);
        if (slotIndex !== -1) {
            const newSlots = [...materialSlots];
            newSlots[slotIndex] = null;
            setMaterialSlots(newSlots);
            return;
        }

        // 빈 슬롯에 추가
        const emptyIndex = materialSlots.findIndex(s => s === null);
        if (emptyIndex !== -1) {
            const newSlots = [...materialSlots];
            newSlots[emptyIndex] = card;
            setMaterialSlots(newSlots);
        }
    };

    const handleDragStart = (e: React.DragEvent, card: InventoryCard) => {
        if (card.level > 1) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('application/json', JSON.stringify(card));
    };

    const handleMaterialDrop = (card: InventoryCard, index: number) => {
        if (card.level > 1 || card.rarity !== 'legendary') return;

        const newSlots = [...materialSlots];
        newSlots[index] = card;
        setMaterialSlots(newSlots);
    };

    const handleMaterialRemove = (index: number) => {
        const newSlots = [...materialSlots];
        newSlots[index] = null;
        setMaterialSlots(newSlots);
    };

    const handleClear = () => {
        setMaterialSlots(Array(5).fill(null));
    };

    const handleAutoSelect = () => {
        // 강화되지 않은(레벨 1) 전설 카드 5개 선택
        const eligible = legendaryCards
            .filter(c => c.level <= 1)
            .slice(0, 5);

        if (eligible.length < 5) {
            alert('강화되지 않은(레벨 1) 전설급 카드가 5장 이상 필요합니다.');
            return;
        }

        setMaterialSlots([...eligible]);
    };

    const handleSubmit = async () => {
        const filledMaterials = materialSlots.filter((c): c is InventoryCard => c !== null);

        if (filledMaterials.length !== 5) {
            alert('전설급 카드 5장을 선택해주세요.');
            return;
        }

        if (!appName.trim() || !appDesc.trim()) {
            alert('카드 이름과 설명을 입력해주세요.');
            return;
        }

        if (confirm('신청서를 제출하시겠습니까? (10,000 코인 / 2,000 토큰 소모)')) {
            const result = await submitUniqueApplication(
                appName,
                appDesc,
                appImage || '/card_placeholder_1765931222851.png',
                filledMaterials
            );

            if (result.success) {
                alert(result.message);
                setMaterialSlots(Array(5).fill(null));
                setAppName('');
                setAppDesc('');
                setAppImage(null);
                await loadCards();
                setViewMode('list');
            } else {
                alert(result.message);
            }
        }
    };

    const filledCount = materialSlots.filter(c => c !== null).length;
    const canSubmit = filledCount === 5 && appName.trim() && appDesc.trim();

    return (
        <CyberPageLayout
            title="UNIQUE_CREATION"
            subtitle="Ultimate Card Synthesis"
            description="강화되지 않은 전설 카드 5장을 소모하여 유니크 카드 생성"
            color="red"
        >
            {/* 탭 버튼 - 백 버튼 아래 배치 */}
            <div className="flex gap-3 mb-6 -mt-4">
                <button
                    onClick={() => setViewMode('create')}
                    className={cn(
                        "px-5 py-2 text-sm font-medium rounded-lg transition-all",
                        viewMode === 'create'
                            ? "bg-red-500/20 text-red-400 border border-red-500/50"
                            : "bg-white/5 text-white/60 hover:bg-white/10 border border-transparent"
                    )}
                >
                    신청서 작성
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                        "px-5 py-2 text-sm font-medium rounded-lg transition-all",
                        viewMode === 'list'
                            ? "bg-red-500/20 text-red-400 border border-red-500/50"
                            : "bg-white/5 text-white/60 hover:bg-white/10 border border-transparent"
                    )}
                >
                    내 신청 현황 ({myApps.length})
                </button>
            </div>

            {viewMode === 'create' ? (
                <>
                    {/* 메인 영역: 폼 + 카드 목록 */}
                    <div className="pb-[160px]">
                        {/* 입력 폼 */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                            <h3 className="text-xl font-bold mb-4 text-white">카드 정보 입력</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">카드 이름</label>
                                        <Input
                                            value={appName}
                                            onChange={(e) => setAppName(e.target.value)}
                                            placeholder="나만의 유니크 카드 이름"
                                            className="bg-gray-800 border-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">카드 설명</label>
                                        <Textarea
                                            value={appDesc}
                                            onChange={(e) => setAppDesc(e.target.value)}
                                            placeholder="이 카드의 강력한 능력과 전설을 기록하세요."
                                            className="bg-gray-800 border-gray-700 h-32"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <ImageUpload
                                        onImageChange={setAppImage}
                                        currentImage={appImage || undefined}
                                    />
                                </div>
                            </div>

                            {filledCount === 5 && (
                                <div className="mt-4 p-4 bg-red-500/10 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400">신청 비용</span>
                                        <span className="font-bold text-yellow-400">10,000 코인 + 2,000 토큰</span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        * 관리자 승인까지 약 36시간이 소요됩니다.<br />
                                        * 승인 거절 시 재료는 반환되지 않을 수 있습니다.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 카드 목록 */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">
                                    보유 전설 카드 ({legendaryCards.length}장)
                                </h3>
                                <p className="text-sm text-gray-400">
                                    강화되지 않은(Lv.1) 전설 카드를 선택하세요
                                </p>
                            </div>

                            <div className="grid grid-cols-5 gap-4">
                                {legendaryCards.map(card => {
                                    const isSelected = materialSlots.some(s => s?.id === card.id);
                                    const isEligible = card.level <= 1; // 강화되지 않은 카드만

                                    return (
                                        <div
                                            key={card.id}
                                            draggable={isEligible}
                                            onDragStart={(e) => handleDragStart(e, card)}
                                            onClick={() => handleCardClick(card)}
                                            className={cn(
                                                "cursor-pointer transition-all relative",
                                                isSelected && "opacity-50 ring-2 ring-red-500",
                                                !isEligible && "opacity-50 grayscale cursor-not-allowed",
                                                isEligible && !isSelected && "hover:scale-105"
                                            )}
                                        >
                                            <GameCard card={card} />
                                            {!isEligible && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                                                    <p className="text-xs text-red-400 font-bold">강화됨</p>
                                                </div>
                                            )}
                                            {isSelected && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-green-400 font-bold text-2xl">✓</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {legendaryCards.length === 0 && (
                                <div className="text-center py-20 text-white/40">
                                    전설급 카드가 없습니다.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 푸터: 슬롯 + 버튼 */}
                    <UniqueFooter
                        materialSlots={materialSlots}
                        onMaterialDrop={handleMaterialDrop}
                        onMaterialRemove={handleMaterialRemove}
                        onClear={handleClear}
                        onAutoSelect={handleAutoSelect}
                        onSubmit={handleSubmit}
                        canSubmit={canSubmit}
                    />
                </>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* 신청 현황 목록 */}
                    {myApps.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-gray-500">
                            신청 내역이 없습니다.
                        </div>
                    ) : (
                        myApps.map(app => (
                            <div key={app.id} className="bg-white/5 border border-white/10 rounded-lg p-6 relative group overflow-hidden">
                                <div className="absolute top-4 right-4 z-10">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                        app.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                        {app.status === 'pending' ? '심사 중 (약 36시간)' :
                                            app.status === 'approved' ? '승인됨' : '거절됨'}
                                    </span>
                                </div>
                                <div className="flex gap-4 items-start mb-4">
                                    <div className="w-20 h-24 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                        {app.imageUrl ? (
                                            <img src={app.imageUrl} alt={app.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">?</div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-white mb-1">{app.name}</h4>
                                        <p className="text-xs text-gray-400 line-clamp-2">{app.description}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {new Date(app.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                {app.status === 'pending' && (
                                    <div className="bg-white/5 p-3 rounded text-xs text-gray-400 mt-2">
                                        관리자가 내용을 검토하고 있습니다. 선정적인 이미지나 부적절한 내용은 거절될 수 있습니다.
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </CyberPageLayout>
    );
}
