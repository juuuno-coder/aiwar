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
import { useUser } from '@/context/UserContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const {
        isMuted,
        toggleMute
    } = useSound();
    const { user } = useFirebase();
    // const { applyAdminCheat } = useUser();

    const isAdmin = user?.email === 'nerounni@gmail.com';

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
                        {/* Audio Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Sliders size={14} className="text-purple-500" />
                                <span className="text-[11px] font-black orbitron text-gray-400 tracking-widest uppercase">Audio Matrix</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* BGM Toggle */}
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

                                {/* SFX Toggle */}
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

                            {/* Volume Slider - Disabled as it's not implemented in context yet */}
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4 opacity-50">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        {!isMuted ? <Volume2 size={16} className="text-purple-400" /> : <VolumeX size={16} className="text-red-400" />}
                                        <span className="text-xs font-black orbitron text-white">MASTER VOLUME</span>
                                    </div>
                                    <span className="text-xs font-mono text-purple-400 font-bold">{!isMuted ? '100%' : '0%'}</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full w-full overflow-hidden">
                                    <div className="h-full bg-purple-500 transition-all" style={{ width: !isMuted ? '100%' : '0%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* System Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck size={14} className="text-cyan-500" />
                                <span className="text-[11px] font-black orbitron text-gray-400 tracking-widest uppercase">System Protocol</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-cyan-400 font-bold">Neural Stabilizer</span>
                                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-[8px] text-cyan-300 font-black orbitron uppercase">Active</span>
                                </div>
                                <span className="text-[10px] text-gray-600 font-mono tracking-tighter">PROTO_v2.5.4</span>
                            </div>
                        </div>

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
            </ModalContent>
        </Modal>
    );
}
