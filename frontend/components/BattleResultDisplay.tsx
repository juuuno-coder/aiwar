// 전투 결과 표시 컴포넌트

'use client';

import { Card } from '@/lib/types';
import TypeBadge, { TypeAdvantageIndicator } from './TypeBadge';
import { BattleResult, SingleBattleResult, isHiddenRound } from '@/lib/dual-battle-system';

interface BattleResultDisplayProps {
    result: BattleResult;
}

export default function BattleResultDisplay({ result }: BattleResultDisplayProps) {
    const isHidden = isHiddenRound(result.roundNumber);
    const mainBattle = 'battle' in result ? result.battle : (result as any).mainBattle; // Normal vs Hidden interface difference
    const hiddenBattle = (result as any).hiddenBattle;
    const roundWinner = result.roundWinner;

    const BattleCard = ({
        title,
        battle,
        isWinner
    }: {
        title: string;
        battle: SingleBattleResult;
        isWinner: boolean;
    }) => (
        <div className={`p-6 rounded-xl border-2 ${isWinner
            ? 'bg-green-500/10 border-green-500'
            : 'bg-red-500/10 border-red-500'
            }`}>
            <h3 className="text-xl font-bold mb-4 text-center">{title}</h3>

            {/* 타입 상성 표시 */}
            {battle.hasAdvantage && (
                <div className="mb-4">
                    <TypeAdvantageIndicator
                        attackerType={battle.advantageType === 'player' ? battle.playerCard.type : battle.enemyCard.type}
                        defenderType={battle.advantageType === 'player' ? battle.enemyCard.type : battle.playerCard.type}
                    />
                </div>
            )}

            {/* 특수능력 발동 효과 */}
            {(isWinner ? battle.playerEffects : battle.enemyEffects)?.map((effect, i) => (
                <div key={i} className="mb-2 p-2 bg-yellow-500/20 border border-yellow-500 rounded text-yellow-200 text-sm font-bold animate-pulse">
                    ⚡ {effect}
                </div>
            ))}

            {/* 카드 비교 */}
            <div className="grid grid-cols-3 gap-4 items-center mb-4">
                {/* 플레이어 */}
                <div className="text-center">
                    <TypeBadge type={battle.playerCard.type} size="sm" />
                    <div className={`text-3xl font-bold mt-2 ${battle.winner === 'player' ? 'text-green-400' : 'text-gray-400'
                        }`}>
                        {battle.playerPower}
                    </div>
                    {battle.playerEffects && battle.playerEffects.length > 0 && battle.winner !== 'player' && (
                        <div className="text-[10px] text-yellow-400 mt-1">
                            {battle.playerEffects[0]}
                        </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">플레이어</div>
                </div>

                {/* VS */}
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">VS</div>
                </div>

                {/* 적 */}
                <div className="text-center">
                    <TypeBadge type={battle.enemyCard.type} size="sm" />
                    <div className={`text-3xl font-bold mt-2 ${battle.winner === 'enemy' ? 'text-red-400' : 'text-gray-400'
                        }`}>
                        {battle.enemyPower}
                    </div>
                    {battle.enemyEffects && battle.enemyEffects.length > 0 && battle.winner !== 'enemy' && (
                        <div className="text-[10px] text-red-300 mt-1">
                            {battle.enemyEffects[0]}
                        </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">적</div>
                </div>
            </div>

            {/* 결과 */}
            <div className={`text-center text-lg font-bold ${battle.winner === 'player' ? 'text-green-400' : 'text-red-400'
                }`}>
                {battle.winner === 'player' ? '✓ 승리!' : '✗ 패배'}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-[var(--dark-card)] rounded-2xl p-8 max-w-4xl w-full mx-4 border-2 border-[var(--primary-purple)] animate-slide-up">
                {/* 헤더 */}
                <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold text-gradient mb-2">
                        라운드 결과
                    </h2>
                </div>

                {/* 메인 대결 */}
                <BattleCard
                    title="메인 대결"
                    battle={mainBattle}
                    isWinner={mainBattle.winner === 'player'}
                />

                {/* 히든 대결 (있는 경우) */}
                {isHidden && hiddenBattle && (
                    <>
                        <div className="my-6 text-center">
                            <div className="inline-block px-4 py-2 bg-[var(--primary-purple)] rounded-full text-sm font-bold">
                                ⚡ 히든 카드 대결 ⚡
                            </div>
                        </div>

                        <BattleCard
                            title="히든 대결"
                            battle={hiddenBattle}
                            isWinner={hiddenBattle.winner === 'player'}
                        />
                    </>
                )}

                {/* 최종 결과 */}
                <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-[var(--primary-blue)] to-[var(--primary-purple)]">
                    <div className="text-center">
                        <div className="text-2xl font-bold mb-2">
                            {roundWinner === 'player' ? '🎉 라운드 승리!' : '😢 라운드 패배'}
                        </div>
                        {isHidden && (
                            <div className="text-sm text-gray-200">
                                {roundWinner === 'player'
                                    ? '메인 또는 히든 대결에서 승리했습니다!'
                                    : '메인과 히든 대결 모두 패배했습니다.'
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
