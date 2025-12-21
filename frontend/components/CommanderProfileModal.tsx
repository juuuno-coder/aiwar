'use client';

import { useState, useEffect } from 'react';
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
    Sparkles
} from "lucide-react";
import { useUser } from '@/context/UserContext';
import { gameStorage } from '@/lib/game-storage';
import { RESEARCH_STATS, CommanderResearch, getResearchBonus } from '@/lib/research-system';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { cn } from '@/lib/utils';

interface CommanderProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CommanderProfileModal({ isOpen, onClose }: CommanderProfileModalProps) {
    const { level, experience, coins, tokens } = useUser();
    const [research, setResearch] = useState<CommanderResearch | null>(null);
    const [loading, setLoading] = useState(true);
    const [hoveredStat, setHoveredStat] = useState<string | null>(null);
    const [commanderAvatar, setCommanderAvatar] = useState<string>('/assets/commander/default.png');
    const [showAvatarSelect, setShowAvatarSelect] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                const state = await gameStorage.loadGameState();
                if (state.research) {
                    setResearch(state.research);
                }
                setLoading(false);
            };
            loadData();
        }
    }, [isOpen]);

    // 아바타 선택 옵션
    const avatarOptions = [
        { id: 'default', src: '/assets/commander/default.png', name: '기본' },
        { id: 'gemini', src: '/assets/factions/gemini.png', name: 'Gemini' },
        { id: 'gpt', src: '/assets/factions/gpt.png', name: 'GPT' },
        { id: 'claude', src: '/assets/factions/claude.png', name: 'Claude' },
        { id: 'llama', src: '/assets/factions/llama.png', name: 'Llama' },
        { id: 'deepseek', src: '/assets/factions/deepseek.png', name: 'DeepSeek' },
    ];

    const handleAvatarChange = (src: string) => {
        setCommanderAvatar(src);
        localStorage.setItem('commanderAvatar', src);
        setShowAvatarSelect(false);
    };

    // 저장된 아바타 로드
    useEffect(() => {
        const saved = localStorage.getItem('commanderAvatar');
        if (saved) setCommanderAvatar(saved);
    }, []);

    if (!isOpen) return null;

    // 방사형 그래프 데이터 준비
    const radarData = RESEARCH_STATS.map(stat => {
        const currentLevel = research?.stats[stat.id]?.currentLevel || 0;
        return {
            id: stat.id,
            label: stat.name,
            value: (currentLevel / stat.maxLevel) * 100,
            level: currentLevel,
            description: currentLevel > 0 ? stat.effects[currentLevel - 1].description : '연구 미완료',
            gradient: stat.gradient
        };
    });

    // 현재 호버된 스탯 데이터
    const hoveredStatData = hoveredStat ? radarData.find(d => d.id === hoveredStat) : null;

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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            backdrop="blur"
            classNames={{
                base: "bg-black/90 backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden !max-w-5xl",
                header: "border-b border-white/5",
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
                                    COMMANDER_7429
                                </h2>
                                <Button size="sm" variant="flat" color="secondary" className="orbitron text-[10px]">
                                    <Edit3 size={14} className="mr-1" /> EDIT ID
                                </Button>
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

                                {/* 방사형 그래프 컴포넌트 */}
                                <div className="relative flex items-center justify-center py-6 bg-white/2 rounded-3xl border border-white/5">
                                    <RadarChart data={radarData} onHover={setHoveredStat} hoveredId={hoveredStat} />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                        <Shield size={80} className="text-white" />
                                    </div>
                                </div>

                                {/* 호버 시 스탯 설명 */}
                                <AnimatePresence>
                                    {hoveredStatData && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <Sparkles size={16} className="text-cyan-400 animate-pulse" />
                                                <span className="font-black text-cyan-400 orbitron">{hoveredStatData.label}</span>
                                                <span className="text-xs text-yellow-400 font-bold">Lv.{hoveredStatData.level}</span>
                                            </div>
                                            <p className="text-sm text-white/70">{hoveredStatData.description}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>


                            {/* 우측: 연구 성과 리스트 */}
                            <div className="space-y-4 md:col-span-8">
                                <h3 className="text-xs font-black text-gray-500 orbitron tracking-[0.3em] uppercase flex items-center gap-2">
                                    <FlaskConical size={14} className="text-cyan-400" />
                                    Research Accumulation
                                </h3>

                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                    {RESEARCH_STATS.map((stat, idx) => {
                                        const currentLevel = research?.stats[stat.id]?.currentLevel || 0;
                                        const bonus = getResearchBonus(stat.id, currentLevel);

                                        return (
                                            <div
                                                key={stat.id}
                                                className={cn(
                                                    "p-3 rounded-xl border border-white/5 transition-all flex items-center gap-4",
                                                    currentLevel > 0 ? "bg-white/5" : "bg-black/40 opacity-40"
                                                )}
                                            >
                                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-gradient-to-br", stat.gradient)}>
                                                    {stat.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-0.5">
                                                        <p className="text-xs font-bold text-white">{stat.name}</p>
                                                        <span className="text-[9px] font-bold text-cyan-400 orbitron">L.{currentLevel}</span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500">
                                                        {currentLevel > 0 ? stat.effects[currentLevel - 1].description : '연구 미완료'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <Divider className="bg-white/5" />

                                {/* 전적 및 랭킹 */}
                                <div className="space-y-3 pt-2">
                                    <h3 className="text-xs font-black text-gray-500 orbitron tracking-[0.3em] uppercase flex items-center gap-2">
                                        <Award size={14} className="text-yellow-400" />
                                        Battle Records
                                    </h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                                            <p className="text-[9px] text-green-400/60 font-bold mb-1">WINS</p>
                                            <p className="text-xl font-black text-green-400 orbitron">{commanderStats.wins}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                                            <p className="text-[9px] text-red-400/60 font-bold mb-1">LOSSES</p>
                                            <p className="text-xl font-black text-red-400 orbitron">{commanderStats.losses}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                                            <p className="text-[9px] text-cyan-400/60 font-bold mb-1">WIN RATE</p>
                                            <p className="text-xl font-black text-cyan-400 orbitron">{commanderStats.winRate}%</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                                            <p className="text-[9px] text-purple-400/60 font-bold mb-1">CARDS</p>
                                            <p className="text-xl font-black text-purple-400 orbitron">{commanderStats.cardCount}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ModalBody>

                        <ModalFooter className="p-8 relative z-10 w-full flex justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-[8px] text-gray-500 orbitron uppercase font-bold tracking-widest mb-1">Total Research</p>
                                    <Chip variant="flat" size="sm" className="bg-cyan-500/10 text-cyan-400 orbitron font-black text-xs">
                                        PTS: {research?.totalResearchPoints || 0}
                                    </Chip>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center">
                                    <p className="text-[8px] text-gray-500 orbitron uppercase font-bold tracking-widest mb-1">Neural Core</p>
                                    <Chip variant="flat" size="sm" className="bg-purple-500/10 text-purple-400 orbitron font-black text-xs">
                                        STABLE
                                    </Chip>
                                </div>
                            </div>
                            <Button
                                color="primary"
                                className="px-8 font-black orbitron tracking-[0.2em] text-[10px] bg-gradient-to-r from-cyan-600 to-blue-600"
                                onPress={onClose}
                            >
                                SYSTEM SYNC
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
    const size = 240;
    const center = size / 2;
    const radius = center - 25;
    const numPoints = data.length;
    const angleStep = (Math.PI * 2) / numPoints;

    // 배경 다각형 선 생성 (그리드)
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
        const normalizedValue = Math.max(5, d.value); // 최소값 5%로 시각적 조절
        const x = center + radius * (normalizedValue / 100) * Math.cos(angle);
        const y = center + radius * (normalizedValue / 100) * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={size} height={size} className="overflow-visible">
            {/* 그리드 선 */}
            {backgroundPolygons.map((points, i) => (
                <polygon
                    key={i}
                    points={points}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
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
                const x = center + (radius + 15) * Math.cos(angle);
                const y = center + (radius + 15) * Math.sin(angle);
                let anchor = "middle";
                if (Math.abs(Math.cos(angle)) > 0.1) {
                    anchor = Math.cos(angle) > 0 ? "start" : "end";
                }

                return (
                    <text
                        key={i}
                        x={x}
                        y={y}
                        fill="rgba(255,255,255,0.4)"
                        fontSize="8"
                        fontWeight="bold"
                        textAnchor={anchor as any}
                        alignmentBaseline="middle"
                        className="orbitron"
                    >
                        {d.label}
                    </text>
                );
            })}

            {/* 데이터 영역 */}
            <motion.polygon
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.6, scale: 1 }}
                points={dataPoints}
                fill="rgba(6, 182, 212, 0.4)"
                stroke="rgba(6, 182, 212, 0.8)"
                strokeWidth="2"
            />

            {/* 데이터 거점 (Point) */}
            {data.map((d, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const normalizedValue = Math.max(5, d.value);
                const x = center + radius * (normalizedValue / 100) * Math.cos(angle);
                const y = center + radius * (normalizedValue / 100) * Math.sin(angle);

                return (
                    <g key={i}>
                        <circle
                            cx={x}
                            cy={y}
                            r={hoveredId === d.id ? 6 : 4}
                            fill="#06b6d4"
                            className={cn(
                                "filter drop-shadow-[0_0_5px_rgba(6,182,212,1)] transition-all cursor-pointer",
                                hoveredId === d.id && "drop-shadow-[0_0_15px_rgba(6,182,212,1)]"
                            )}
                            onMouseEnter={() => onHover(d.id)}
                            onMouseLeave={() => onHover(null)}
                        />
                        {hoveredId === d.id && (
                            <>
                                <circle cx={x} cy={y} r="12" fill="none" stroke="#06b6d4" strokeWidth="1" className="animate-ping opacity-50" />
                            </>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}
