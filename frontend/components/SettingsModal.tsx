'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/context/SoundContext';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/custom/Modal';
import { Button } from '@/components/ui/custom/Button';
import { Switch } from '@/components/ui/custom/Switch';
import { Slider } from '@/components/ui/custom/Slider';
import { Volume2, VolumeX, Music, Bell, Settings2, Sliders, ShieldCheck, Zap } from 'lucide-react';
import { useFirebase } from '@/components/FirebaseProvider';
import { saveUserProfile } from '@/lib/firebase-db';
import { useUser } from '@/context/UserContext';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useTranslation } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    useEscapeKey(isOpen, onClose);
    const { language, setLanguage, t } = useTranslation();

    const {
        isMuted,
        toggleMute
    } = useSound();
    const { user } = useFirebase();
    // const { applyAdminCheat } = useUser();

    // const { applyAdminCheat } = useUser();

    const allowedUsers = ['nerounni@gmail.com', 'juuuno1116@gmail.com', 'juuuno1116@gamil.com'];
    const isAdmin = user?.email && allowedUsers.includes(user.email);


    const handleResetGameData = async () => {
        if (!user) return;
        if (confirm(language === 'ko' ? '⚠️ 경고: 모든 게임 데이터가 초기화됩니다.\n\n보유한 카드, 스토리 진행도, 재화가 모두 영구적으로 삭제됩니다. 계속하시겠습니까?' : '⚠️ Warning: All game data will be reset.\n\nCards, story progress, and currency will be permanently deleted. Continue?')) {
            if (confirm(language === 'ko' ? '정말로 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.' : 'Are you sure? This cannot be undone.')) {
                try {
                    // Full Account Reset (Inventory, Profile, Progress, etc.)
                    const { resetAccountData } = await import('@/lib/firebase-db');
                    await resetAccountData(user.uid);

                    // [Critical] Also nuke local storage to prevent ghost data persisting
                    const { gameStorage } = await import('@/lib/game-storage');
                    gameStorage.clearAllSessionData();
                    localStorage.clear(); // Nuclear option just in case

                    alert(language === 'ko' ? '초기화되었습니다. 게임을 다시 시작합니다.' : 'Reset complete. Restarting game.');
                    window.location.reload();
                } catch (error) {
                    console.error('Reset failed:', error);
                    alert(language === 'ko' ? '초기화 실패. 잠시 후 다시 시도해주세요.' : 'Reset failed. Please try again.');
                }
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalContent>
                <div className="bg-black/90 border border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden">
                    <ModalHeader className="border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                                <Settings2 className="text-purple-400" size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black orbitron tracking-tight text-white italic">SYSTEM SETTINGS</h2>
                                <p className="text-[10px] text-gray-500 font-bold orbitron uppercase tracking-[0.2em]">Neural Link Configuration</p>
                            </div>
                        </div>
                    </ModalHeader>

                    <ModalBody className="py-8 space-y-8">
                        {/* ... existing sections ... */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Globe size={14} className="text-blue-500" />
                                <span className="text-[11px] font-black orbitron text-gray-400 tracking-widest uppercase">{t('settings.language')}</span>
                            </div>
                            {/* ... Language options ... */}
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl transition-colors ${language === 'ko' ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-gray-500/10 text-gray-500'}`}>
                                        <div className="font-bold text-xs">{language === 'ko' ? 'KR' : 'EN'}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white orbitron">{language === 'ko' ? t('settings.korean') : t('settings.english')}</p>
                                        <p className="text-[10px] text-gray-500 font-bold">Select Interface Language</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
                                    <button
                                        onClick={() => setLanguage('ko')}
                                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${language === 'ko' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        KR
                                    </button>
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${language === 'en' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        EN
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Audio Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Sliders size={14} className="text-purple-500" />
                                <span className="text-[11px] font-black orbitron text-gray-400 tracking-widest uppercase">Audio Matrix</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-purple-500/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl transition-colors ${!isMuted ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-gray-500/10 text-gray-500'}`}>
                                            <Music size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white orbitron">BGM</p>
                                            <p className="text-[10px] text-gray-500 font-bold">Background Music</p>
                                        </div>
                                    </div>
                                    <Switch isChecked={!isMuted} onCheckedChange={toggleMute} color="secondary" />
                                </div>

                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl transition-colors ${!isMuted ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-gray-500/10 text-gray-500'}`}>
                                            <Bell size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white orbitron">SFX</p>
                                            <p className="text-[10px] text-gray-500 font-bold">Effect Sounds</p>
                                        </div>
                                    </div>
                                    <Switch isChecked={!isMuted} onCheckedChange={toggleMute} color="primary" />
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap size={14} className="text-red-500" />
                                <span className="text-[11px] font-black orbitron text-red-500 tracking-widest uppercase">DANGER ZONE</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-red-400 font-bold mb-1">게임 데이터 초기화</p>
                                    <p className="text-[10px] text-zinc-500">모든 진행 상황을 삭제하고 처음부터 시작합니다.</p>
                                </div>
                                <Button
                                    onClick={handleResetGameData}
                                    className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 text-xs px-3 py-1 h-8"
                                >
                                    RESET DATA
                                </Button>
                            </div>
                        </div>

                        {/* Admin Section */}
                        {isAdmin && (
                            <div className="space-y-6 pt-6 border-t border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck size={14} className="text-red-500" />
                                    <span className="text-[11px] font-black orbitron text-red-500 tracking-widest uppercase">Admin Override</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-red-400 font-bold mb-1">관리자 대시보드</p>
                                            <p className="text-[10px] text-zinc-500">제보 및 유니크 신청 관리</p>
                                        </div>
                                        <Button
                                            onClick={() => window.location.href = '/admin'}
                                            className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 text-xs px-3 py-1 h-8"
                                        >
                                            GO TO ADMIN
                                        </Button>
                                    </div>
                                    {/* Admin reset is redundant now but kept for legacy/specific starter pack reset if needed */}
                                </div>
                            </div>
                        )}

                        {/* Admin Section (Removed) */}
                    </ModalBody>

                    <ModalFooter className="border-t border-white/5 pt-4">
                        <Button
                            variant="flat"
                            onPress={onClose}
                            className="font-black orbitron text-[10px] tracking-widest px-8 h-12 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                        >
                            DISCONNECT
                        </Button>
                        <Button
                            color="secondary"
                            onPress={onClose}
                            className="font-black orbitron text-[10px] tracking-widest px-10 h-12 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                        >
                            APPLY CHANGES
                        </Button>
                    </ModalFooter>
                </div>
            </ModalContent >
        </Modal >
    );
}
