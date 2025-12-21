'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Users, Sparkles, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LevelReward, LEVEL_REWARDS, getNextFactionUnlock, getNextSlotUnlock } from '@/lib/faction-subscription';
import Image from 'next/image';
import { getCardCharacterImage, getFactionIcon } from '@/lib/card-images';

interface LevelUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    newLevel: number;
    reward: LevelReward | null;
}

// 군단 ID에서 한글 이름 가져오기
const factionKoreanNames: Record<string, string> = {
    gemini: '제미나이',
    chatgpt: 'ChatGPT',
    claude: '클로드',
    grok: '그록',
    midjourney: '미드저니',
    dalle: '달리',
    'stable-diffusion': 'SD',
    flux: '플럭스',
    kling: '클링',
    runway: '런웨이',
    pika: '피카',
    sora: '소라',
    suno: '수노',
    udio: '유디오',
    elevenlabs: '일레븐랩스',
    musicgen: '뮤직젠',
    cursor: '커서',
    copilot: '코파일럿',
    replit: '레플릿',
    codeium: '코디움'
};

export default function LevelUpModal({ isOpen, onClose, newLevel, reward }: LevelUpModalProps) {
    const nextFaction = getNextFactionUnlock(newLevel);
    const nextSlot = getNextSlotUnlock(newLevel);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 배경 오버레이 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]"
                        onClick={onClose}
                    />

                    {/* 모달 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        className="fixed inset-0 flex items-center justify-center z-[101] p-4"
                        onClick={onClose}
                    >
                        <div
                            className="relative max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* 파티클 효과 */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                {[...Array(30)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-2 h-2 rounded-full"
                                        style={{
                                            background: `hsl(${Math.random() * 60 + 40}, 100%, 60%)`,
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`
                                        }}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{
                                            opacity: [0, 1, 0],
                                            scale: [0, 1.5, 0],
                                            y: [0, -100 - Math.random() * 100],
                                            x: [0, (Math.random() - 0.5) * 100]
                                        }}
                                        transition={{
                                            duration: 2,
                                            delay: i * 0.05,
                                            repeat: Infinity,
                                            repeatDelay: 1
                                        }}
                                    />
                                ))}
                            </div>

                            {/* 카드 */}
                            <div className="relative bg-gradient-to-br from-yellow-900/80 via-amber-900/60 to-orange-900/80 rounded-3xl border border-yellow-500/50 p-8 shadow-[0_0_60px_rgba(234,179,8,0.4)] overflow-hidden">
                                {/* 배경 광채 */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.2)_0%,transparent_70%)]" />

                                {/* 레벨 배지 */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.2, type: 'spring' }}
                                    className="relative z-10 flex justify-center mb-6"
                                >
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-yellow-500/30 rounded-full blur-xl animate-pulse" />
                                        <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center border-4 border-yellow-300 shadow-lg">
                                            <span className="text-4xl font-black text-white orbitron">{newLevel}</span>
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                            <Star size={16} className="text-white fill-white" />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* 축하 메시지 */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="relative z-10 text-center mb-6"
                                >
                                    <h2 className="text-3xl font-black text-yellow-400 orbitron mb-2">
                                        LEVEL UP!
                                    </h2>
                                    <p className="text-white/80">
                                        축하합니다! 지휘관 레벨이 <span className="text-yellow-400 font-bold">{newLevel}</span>이 되었습니다!
                                    </p>
                                </motion.div>

                                {/* 보상 정보 */}
                                {reward && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="relative z-10 bg-black/40 rounded-2xl p-4 mb-6 border border-yellow-500/30"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                                reward.type === 'slot'
                                                    ? "bg-gradient-to-br from-cyan-500 to-blue-600"
                                                    : "bg-gradient-to-br from-purple-500 to-pink-600"
                                            )}>
                                                {reward.type === 'slot' ? (
                                                    <Zap size={24} className="text-white" />
                                                ) : (
                                                    reward.factionId && getCardCharacterImage(reward.factionId, '') ? (
                                                        <Image
                                                            src={getCardCharacterImage(reward.factionId, '')!}
                                                            alt=""
                                                            width={48}
                                                            height={48}
                                                            className="rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <Users size={24} className="text-white" />
                                                    )
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-white/60">새로운 권한</p>
                                                <p className="text-lg font-bold text-white">
                                                    {reward.type === 'faction' && reward.factionId
                                                        ? `${factionKoreanNames[reward.factionId] || reward.factionId} 군단 승인!`
                                                        : reward.description
                                                    }
                                                </p>
                                            </div>
                                            <Sparkles className="text-yellow-400" />
                                        </div>
                                    </motion.div>
                                )}

                                {/* 다음 목표 미리보기 */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="relative z-10 text-sm text-white/50 text-center space-y-1"
                                >
                                    {nextSlot && (
                                        <p>🔓 Lv.{nextSlot}에서 새 슬롯 오픈</p>
                                    )}
                                    {nextFaction && (
                                        <p>🤖 Lv.{nextFaction.level}에서 {factionKoreanNames[nextFaction.factionId] || nextFaction.factionId} 군단 승인</p>
                                    )}
                                </motion.div>

                                {/* 확인 버튼 */}
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    onClick={onClose}
                                    className="relative z-10 w-full mt-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <span>확인</span>
                                    <ChevronRight size={18} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
