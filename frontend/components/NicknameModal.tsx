'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Zap, ChevronRight, AlertCircle } from 'lucide-react';
import { HoverBorderGradient } from '@/components/ui/aceternity/hover-border-gradient';
import { validateNickname } from '@/lib/auth-utils';
import { checkNicknameUnique } from '@/lib/firebase-db';
import { useFirebase } from '@/components/FirebaseProvider';

interface NicknameModalProps {
    onComplete: (nickname: string) => void;
}

export default function NicknameModal({ onComplete }: NicknameModalProps) {
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const { user } = useFirebase();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validation = validateNickname(nickname);
        if (!validation.valid) {
            setError(validation.message);
            return;
        }

        setIsSubmitting(true);
        setIsChecking(true);

        try {
            // Check uniqueness
            const isUnique = await checkNicknameUnique(nickname, user?.uid);
            if (!isUnique) {
                setError('이미 사용 중인 닉네임입니다.');
                setIsSubmitting(false);
                setIsChecking(false);
                return;
            }

            // Artificial delay for futuristic feel
            await new Promise(resolve => setTimeout(resolve, 800));
            onComplete(nickname);
        } catch (err) {
            setError('닉네임 확인 중 오류가 발생했습니다.');
            setIsSubmitting(false);
            setIsChecking(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="relative w-full max-w-lg bg-black border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)]"
            >
                {/* Header Bar */}
                <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Terminal size={18} className="text-purple-400" />
                        <span className="font-mono text-xs text-purple-400 tracking-[0.2em] uppercase">
                            신원_등록 // V.1.0
                        </span>
                    </div>
                </div>

                <div className="p-8">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="mb-6 p-4 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400">
                            <Shield size={40} className="animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black orbitron mb-2 uppercase tracking-tight text-white">
                            호칭 설정
                        </h2>
                        <p className="font-mono text-[10px] text-purple-400/60 tracking-[0.3em] uppercase mb-4">
                            신경망 연결을 위한 식별 필요
                        </p>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            고유한 전술 식별자를 입력해 주세요. 이 이름은 모든 지휘관에게 표시됩니다.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    autoFocus
                                    className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-mono text-center text-xl tracking-wider"
                                    placeholder="호칭 입력"
                                    required
                                />
                                <div className="absolute inset-0 rounded-xl bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="flex items-center gap-2 text-red-400 text-[10px] font-mono text-center uppercase tracking-widest bg-red-500/10 p-2 rounded-lg border border-red-500/30"
                                >
                                    <AlertCircle size={12} />
                                    <span>[시스템_오류]: {error}</span>
                                </motion.div>
                            )}
                        </div>

                        <HoverBorderGradient
                            as="button"
                            type="submit"
                            disabled={isSubmitting}
                            containerClassName="w-full rounded-xl"
                            className="w-full bg-black text-white py-4 font-black orbitron tracking-widest uppercase flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <Zap size={18} className="animate-spin text-yellow-400" />
                                    {isChecking ? '중복 확인 중...' : '초기화 중...'}
                                </div>
                            ) : (
                                <>
                                    업링크 설정
                                    <ChevronRight size={18} />
                                </>
                            )}
                        </HoverBorderGradient>
                    </form>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500/50 rounded-tl-2xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-500/50 rounded-br-2xl pointer-events-none" />
            </motion.div>
        </div>
    );
}
