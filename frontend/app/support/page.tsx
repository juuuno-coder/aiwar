'use client';

import { motion } from 'framer-motion';
import { Heart, Coffee, MessageSquare } from 'lucide-react';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { Meteors } from '@/components/ui/aceternity/effects';
import PageHeader from '@/components/PageHeader';
import SimpleSupportBanner from '@/components/SimpleSupportBanner';

export default function SupportPage() {
    return (
        <div className="min-h-screen py-12 px-6 lg:px-12 bg-[#050505] relative overflow-hidden">
            <BackgroundBeams className="opacity-40" />
            <Meteors number={15} />

            <PageHeader
                title="응원하기"
                englishTitle="SUPPORT & FEEDBACK"
                description="개발자를 응원하고 게임 개선을 위한 의견을 보내주세요"
                color="pink"
            />

            <div className="max-w-4xl mx-auto space-y-8">
                {/* 응원 섹션 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                            <Heart className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white orbitron">개발자 응원하기</h2>
                            <p className="text-sm text-gray-400">게임이 마음에 드셨다면 커피 한 잔 후원해주세요!</p>
                        </div>
                    </div>

                    <SimpleSupportBanner link="https://buymeacoffee.com/bababapet" />

                    <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-sm text-gray-300 leading-relaxed">
                            💝 여러분의 후원은 더 나은 게임을 만드는 데 큰 힘이 됩니다!<br />
                            🎮 새로운 기능 추가, 버그 수정, 밸런스 조정 등에 사용됩니다.<br />
                            ⚡ 후원해주신 분들께는 특별한 감사 인사를 드립니다!
                        </p>
                    </div>
                </motion.div>

                {/* 제보/피드백 섹션 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                            <MessageSquare className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white orbitron">버그 제보 & 피드백</h2>
                            <p className="text-sm text-gray-400">게임 개선을 위한 의견을 보내주세요</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl">
                            <h3 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                                🐛 버그 제보
                            </h3>
                            <p className="text-sm text-gray-300">
                                게임 플레이 중 발견한 버그나 오류를 알려주세요. 상세한 설명과 스크린샷이 있으면 더욱 좋습니다!
                            </p>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
                            <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                                💡 기능 제안
                            </h3>
                            <p className="text-sm text-gray-300">
                                추가되었으면 하는 기능이나 개선 아이디어가 있다면 공유해주세요!
                            </p>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                            <h3 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2">
                                ⚖️ 밸런스 피드백
                            </h3>
                            <p className="text-sm text-gray-300">
                                게임 밸런스에 대한 의견을 들려주세요. 너무 어렵거나 쉬운 부분이 있나요?
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* 감사 메시지 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl"
                >
                    <p className="text-lg font-bold text-yellow-400 mb-2">🎉 함께 만들어가는 게임</p>
                    <p className="text-sm text-gray-300">
                        여러분의 관심과 피드백 덕분에 게임이 계속 발전하고 있습니다.<br />
                        진심으로 감사드립니다! 💖
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
