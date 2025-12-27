'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@/components/ui/custom/Modal";
import { Button } from "@/components/ui/custom/Button";
import { Progress } from "@/components/ui/custom/Progress";
import { Divider } from "@/components/ui/custom/Divider";
import { Chip } from "@/components/ui/custom/Chip";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Shield,
    FlaskConical,
    Activity,
    Edit3,
    Award,
    Settings,
    Star,
    Sparkles,
    Clock
} from "lucide-react";
import { useUser } from '@/context/UserContext';
import { gameStorage } from '@/lib/game-storage';
import { RESEARCH_STATS, CommanderResearch, getResearchBonus, getResearchTimeBuff } from '@/lib/research-system';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { cn } from '@/lib/utils';
import { useFooter } from '@/context/FooterContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFirebase } from '@/components/FirebaseProvider';

interface CommanderProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CommanderProfileModal({ isOpen, onClose }: CommanderProfileModalProps) {
    const { level, experience, coins, tokens } = useUser();
    const { state: footerState } = useFooter();
    const { profile } = useUserProfile();
    const { user } = useFirebase();
    const [research, setResearch] = useState<CommanderResearch | null>(null);
    const [loading, setLoading] = useState(true);
    const [hoveredStat, setHoveredStat] = useState<string | null>(null);
    const [commanderAvatar, setCommanderAvatar] = useState<string>('/assets/commander/default.png');
    const [showAvatarSelect, setShowAvatarSelect] = useState(false);

    // ESC key handler
    const handleEscKey = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
            onClose();
        }
    }, [isOpen, onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [handleEscKey]);

    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                const state = await gameStorage.loadGameState(user?.uid);
                if (state.research) {
                    setResearch(state.research);
                }
                setLoading(false);
            };
            loadData();
        }
    }, [isOpen, user?.uid]);

    // 아바타 선택 옵션 (카드 이미지 포함)
    const avatarOptions = [
        { id: 'default', src: '/assets/commander/default.png', name: '기본' },
        { id: 'gemini', src: '/assets/factions/gemini.png', name: 'Gemini' },
        { id: 'gpt', src: '/assets/factions/gpt.png', name: 'GPT' },
        { id: 'claude', src: '/assets/factions/claude.png', name: 'Claude' },
        { id: 'llama', src: '/assets/factions/llama.png', name: 'Llama' },
        { id: 'deepseek', src: '/assets/factions/deepseek.png', name: 'DeepSeek' },
        // Card-based avatars
        { id: 'card-commander', src: '/images/cards/real/commander.png', name: 'Commander' },
        { id: 'card-code-warrior', src: '/images/cards/real/epic-code-warrior.png', name: 'Code Warrior' },
        { id: 'card-titan-walker', src: '/images/cards/real/epic-titan-walker.png', name: 'Titan Walker' },
        { id: 'card-cyber-medic', src: '/images/cards/real/rare-cyber-medic.png', name: 'Cyber Medic' },
        { id: 'card-ghost-sniper', src: '/images/cards/real/rare-ghost-sniper.png', name: 'Ghost Sniper' },
        { id: 'card-glitch-entity', src: '/images/cards/real/unique-glitch-entity.png', name: 'Glitch Entity' },
    ];

    const handleAvatarChange = (src: string) => {
        setCommanderAvatar(src);
        // Use same key as Sidebar for consistency
        localStorage.setItem('user_avatar', src);
        setShowAvatarSelect(false);
    };

    // 저장된 아바타 로드 (Sidebar와 동일한 키 사용)
    useEffect(() => {
        const saved = localStorage.getItem('user_avatar');
        if (saved) setCommanderAvatar(saved);
    }, []);

    // 랑킹/전적 데이터 (가상)
    const commanderStats = {
        rank: 'Gold III',
        rankIcon: '🌟',
        globalRank: 1247,
        winRate: 67.5,
        totalBattles: 156,
        wins: 105,
        losses: 51,
        cardCount: 48,
        uniqueCount: 2,
        joinDate: '2025.12.01'
    };

    // 연구 시간 단축 버프 계산
    const researchTimeBuff = getResearchTimeBuff(footerState.deck);

    if (!isOpen) return null;

    // 방사형 그래프 데이터 준비
    const radarData = RESEARCH_STATS.map(stat => {
        const currentLevel = research?.stats[stat.id]?.currentLevel || 1; // 기본값 1
        return {
            id: stat.id,
            label: stat.name,
            value: (currentLevel / 9) * 100, // 9레벨 기준 백분율 (Lv9 = 100%)
            level: currentLevel,
            description: currentLevel > 0
                ? stat.effects[Math.min(currentLevel - 1, stat.effects.length - 1)].description
                : '기본 능력치',
            gradient: stat.gradient
        };
    });

    // 현재 호버된 스탯 데이터
    const hoveredStatData = hoveredStat ? radarData.find(d => d.id === hoveredStat) : null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            backdrop="blur"
            classNames={{
                base: "bg-black/90 backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden !max-w-7xl !max-h-[92vh]",
                header: "border-b border-white/5",
                body: "overflow-y-auto max-h-[calc(92vh-180px)]",
                footer: "border-t border-white/5 bg-black/40",
                closeButton: "hover:bg-white/10 active:scale-95 transition-all text-white z-50",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <div className="absolute inset-0 pointer-events-none opacity-40">
                            <BackgroundBeams />
                        </div>

                        <ModalHeader className="flex flex-col gap-1 p-8 relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-1 bg-cyan-600 rounded-full" />
                                <span className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] orbitron">Commander Profile Terminal</span>
                            </div>
                            <div className="flex items-center justify-between w-full">
                                <h2 className="text-4xl font-black text-white orbitron tracking-tighter italic">
                                    {profile?.nickname || '지휘관'}
                                </h2>
                            </div>
                        </ModalHeader>

                        <ModalBody className="p-6 relative z-10 grid md:grid-cols-12 gap-6 overflow-hidden">
                            {/* 좌측: 아바타 및 기본 정보 */}
                            <div className="md:col-span-4 space-y-4">
                                {/* 아바타 섹션 - 크게 */}
                                <div className="relative">
                                    <div
                                        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 border-cyan-500/30 cursor-pointer group shadow-xl"
                                        onClick={() => setShowAvatarSelect(!showAvatarSelect)}
                                    >
                                        <img
                                            src={commanderAvatar}
                                            alt="Commander"
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/assets/factions/gemini.png';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                        {/* 랑킨 배지 */}
                                        <div className="absolute top-3 left-3">
                                            <div className="flex items-center gap-1.5 bg-yellow-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-yellow-500/30">
                                                <span className="text-lg">{commanderStats.rankIcon}</span>
                                                <span className="text-xs text-yellow-400 font-black orbitron">{commanderStats.rank}</span>
                                            </div>
                                        </div>

                                        {/* 하단 정보 */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-2xl text-white font-black orbitron">Lv.{level}</span>
                                                <div className="flex items-center gap-1 bg-cyan-500/20 px-2 py-1 rounded-full">
                                                    <Edit3 size={12} className="text-cyan-400" />
                                                    <span className="text-[10px] text-cyan-400 font-bold">EDIT</span>
                                                </div>
                                            </div>
                                            <Progress
                                                value={(experience / (level * 100)) * 100}
                                                color="primary"
                                                size="sm"
                                                className="h-1.5"
                                                classNames={{ track: "bg-white/10", indicator: "shadow-[0_0_10px_rgba(6,182,212,0.5)]" }}
                                            />
                                            <p className="text-[10px] text-cyan-400 text-right mt-1">{experience} / {level * 100} EXP</p>
                                        </div>
                                    </div>

                                    {/* 아바타 선택 드롭다운 */}
                                    <AnimatePresence>
                                        {showAvatarSelect && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-2 p-3 bg-gray-900 border border-white/10 rounded-xl z-50"
                                            >
                                                <p className="text-[10px] text-gray-400 mb-2 font-bold">아바타 선택</p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {avatarOptions.map(avatar => (
                                                        <div
                                                            key={avatar.id}
                                                            onClick={() => handleAvatarChange(avatar.src)}
                                                            className={cn(
                                                                "aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:scale-105",
                                                                commanderAvatar === avatar.src ? "border-cyan-500" : "border-transparent"
                                                            )}
                                                        >
                                                            <img
                                                                src={avatar.src}
                                                                alt={avatar.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = '/assets/factions/gemini.png';
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* 레벨 정보 */}
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest orbitron">Experience Level</p>
                                            <p className="text-2xl font-black text-white orbitron">LV.{level}</p>
                                        </div>
                                        <p className="text-[10px] text-cyan-400 font-mono">{experience} / {level * 100} PX</p>
                                    </div>
                                    <Progress
                                        value={(experience / (level * 100)) * 100}
                                        color="primary"
                                        size="sm"
                                        className="h-1.5"
                                        classNames={{ track: "bg-white/5", indicator: "shadow-[0_0_10px_rgba(6,182,212,0.5)]" }}
                                    />
                                </div>

                                {/* 연구 시간 버프 정보 */}
                                <div className="bg-cyan-900/10 p-4 rounded-2xl border border-cyan-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock size={14} className="text-cyan-400" />
                                        <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Research Efficiency</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Time Reduction Rate</span>
                                        <span className="text-xl font-black text-white orbitron">-{Math.round(researchTimeBuff * 100)}%</span>
                                    </div>
                                    <p className="text-[10px] text-white/40 mt-1">Based on Deck Composition</p>
                                </div>


                            </div>


                            {/* 우측: 연구 성과 차트 및 리스트 */}
                            <div className="space-y-4 md:col-span-8">
                                <h3 className="text-xs font-black text-gray-500 orbitron tracking-[0.3em] uppercase flex items-center gap-2">
                                    <FlaskConical size={14} className="text-cyan-400" />
                                    Research Accumulation
                                </h3>

                                {/* 방사형 그래프 컴포넌트 */}
                                <div className="relative flex items-center justify-center py-6 bg-white/2 rounded-3xl border border-white/5 min-h-[300px]">
                                    <RadarChart data={radarData} onHover={setHoveredStat} hoveredId={hoveredStat} />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                        <Shield size={80} className="text-white" />
                                    </div>

                                    {/* 호버 시 스탯 설명 */}
                                    <AnimatePresence>
                                        {hoveredStatData && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-cyan-500/30 z-20 pointer-events-none"
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                                                    <span className="font-black text-cyan-400 orbitron text-xs">{hoveredStatData.label}</span>
                                                    <span className="text-[10px] text-yellow-400 font-bold">Lv.{hoveredStatData.level}</span>
                                                </div>
                                                <p className="text-[10px] text-white/90">{hoveredStatData.description}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                    {RESEARCH_STATS.map((stat, idx) => {
                                        const currentLevel = research?.stats[stat.id]?.currentLevel || 1; // 1레벨 기본값
                                        const bonus = getResearchBonus(stat.id, currentLevel);

                                        return (
                                            <div
                                                key={stat.id}
                                                className={cn(
                                                    "p-3 rounded-xl border border-white/5 transition-all flex items-center gap-4",
                                                    currentLevel > 0 ? "bg-white/5" : "bg-black/40 opacity-40"
                                                )}
                                                onMouseEnter={() => setHoveredStat(stat.id)}
                                                onMouseLeave={() => setHoveredStat(null)}
                                            >
                                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-gradient-to-br", stat.gradient)}>
                                                    {stat.icon}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{stat.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-lg font-black orbitron",
                                                            hoveredStat === stat.id ? "text-cyan-400" : "text-white"
                                                        )}>
                                                            Lv.{currentLevel}
                                                        </span>
                                                        {currentLevel === 9 && (
                                                            <span className="text-[10px] text-yellow-500 font-bold px-1.5 py-0.5 bg-yellow-500/10 rounded border border-yellow-500/20">MAX</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </ModalBody>

                        <ModalFooter className="flex justify-between items-center p-6 bg-black/40 backdrop-blur-xl">
                            <div className="flex gap-4">
                                <div className="text-[10px] text-gray-500">
                                    <p className="uppercase tracking-widest font-bold mb-1">Total Battles</p>
                                    <p className="text-white orbitron font-bold">{commanderStats.totalBattles}</p>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-[10px] text-gray-500">
                                    <p className="uppercase tracking-widest font-bold mb-1">Win Rate</p>
                                    <p className="text-cyan-400 orbitron font-bold">{commanderStats.winRate}%</p>
                                </div>
                            </div>
                            <Button onClick={onClose} variant="flat" className="orbitron">
                                CLOSE TERMINAL
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

/**
 * Radar Chart Component (Custom SVG)
 */
function RadarChart({ data, onHover, hoveredId }: {
    data: { id: string, label: string, value: number, level: number }[],
    onHover: (id: string | null) => void,
    hoveredId: string | null
}) {
    const size = 260; // 사이즈
    const center = size / 2;
    const radius = center - 35; // 라벨 공간 확보
    const numPoints = data.length;
    const angleStep = (Math.PI * 2) / numPoints;

    // 배경 다각형 선 생성 (그리드 - 5단계)
    const backgroundPolygons = [0.2, 0.4, 0.6, 0.8, 1].map((scale) => {
        const points = data.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * scale * Math.cos(angle);
            const y = center + radius * scale * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
        return points;
    });

    // 데이터 다각형 생성
    const dataPoints = data.map((d, i) => {
        const angle = i * angleStep - Math.PI / 2;
        // 최소값 보여주기 위해 value가 작아도 기본 크기 보장 (10%)
        const displayValue = Math.max(10, d.value);
        const x = center + radius * (displayValue / 100) * Math.cos(angle);
        const y = center + radius * (displayValue / 100) * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={size} height={size} className="overflow-visible z-10">
            <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* 그리드 선 */}
            {backgroundPolygons.map((points, i) => (
                <polygon
                    key={i}
                    points={points}
                    fill="none"
                    stroke={i === 4 ? "rgba(6, 182, 212, 0.3)" : "rgba(255,255,255,0.05)"}
                    strokeWidth={i === 4 ? "1" : "0.5"}
                    strokeDasharray={i === 4 ? "none" : "4 2"}
                />
            ))}

            {/* 축 선 */}
            {data.map((_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                return (
                    <line
                        key={i}
                        x1={center}
                        y1={center}
                        x2={x}
                        y2={y}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                    />
                );
            })}

            {/* 라벨 - 텍스트 위치 계산 */}
            {data.map((d, i) => {
                const angle = i * angleStep - Math.PI / 2;
                // 라벨 위치를 원 밖으로 더 밀어냄
                const labelRadius = radius + 20;
                const x = center + labelRadius * Math.cos(angle);
                const y = center + labelRadius * Math.sin(angle);

                let anchor = "middle";
                if (Math.abs(Math.cos(angle)) > 0.1) {
                    anchor = Math.cos(angle) > 0 ? "start" : "end";
                }

                // 텍스트 미세 조정
                const isTop = Math.sin(angle) < -0.5;
                const isBottom = Math.sin(angle) > 0.5;
                const dy = isTop ? 0 : (isBottom ? "0.8em" : "0.4em");

                return (
                    <g key={i} className="cursor-pointer" onMouseEnter={() => onHover(d.id)} onMouseLeave={() => onHover(null)}>
                        <text
                            x={x}
                            y={y}
                            dy={dy}
                            fill={hoveredId === d.id ? "#22d3ee" : "rgba(255,255,255,0.6)"}
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor={anchor as any}
                            className={cn("orbitron transition-colors", hoveredId === d.id && "font-black")}
                        >
                            {d.label}
                        </text>
                    </g>
                );
            })}

            {/* 데이터 영역 (채우기) */}
            <motion.polygon
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.6, scale: 1 }}
                points={dataPoints}
                fill="rgba(6, 182, 212, 0.2)"
                stroke="none"
            />

            {/* 데이터 영역 (테두리 + 글로우) */}
            <motion.polygon
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                points={dataPoints}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                filter="url(#glow)"
            />

            {/* 데이터 거점 (Point) */}
            {data.map((d, i) => {
                const angle = i * angleStep - Math.PI / 2;
                // 최소값 보정 적용
                const displayValue = Math.max(10, d.value);
                const x = center + radius * (displayValue / 100) * Math.cos(angle);
                const y = center + radius * (displayValue / 100) * Math.sin(angle);
                const isHovered = hoveredId === d.id;

                return (
                    <g key={i}>
                        <circle
                            cx={x}
                            cy={y}
                            r={isHovered ? 6 : 3}
                            fill={isHovered ? "#fff" : "#06b6d4"}
                            className={cn(
                                "transition-all cursor-pointer",
                                isHovered && "filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                            )}
                            onMouseEnter={() => onHover(d.id)}
                            onMouseLeave={() => onHover(null)}
                        />
                        {isHovered && (
                            <circle cx={x} cy={y} r="10" fill="none" stroke="#fff" strokeWidth="1" className="animate-ping opacity-50" />
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

