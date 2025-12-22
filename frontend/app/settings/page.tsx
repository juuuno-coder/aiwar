'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/utils';
import {
    initializeTimers,
    toggleAutoGeneration,
    getAllTimerStatus,
    formatTime
} from '@/lib/automation-utils';
import { getGameState } from '@/lib/game-state';
import CyberPageLayout from '@/components/CyberPageLayout';

export default function SettingsPage() {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [musicEnabled, setMusicEnabled] = useState(true);
    const [autoGenerationEnabled, setAutoGenerationEnabled] = useState(false);
    const [timerStatus, setTimerStatus] = useState<any[]>([]);

    useEffect(() => {
        const settings = storage.get('gameSettings', {
            sound: true,
            music: true,
            autoGeneration: false,
        });
        setSoundEnabled(settings.sound);
        setMusicEnabled(settings.music);
        setAutoGenerationEnabled(settings.autoGeneration || false);

        // 타이머 초기화 및 상태 로드
        initializeTimers();
        loadTimerStatus();
    }, []);

    const loadTimerStatus = () => {
        const status = getAllTimerStatus();
        setTimerStatus(status);
    };

    const saveSettings = () => {
        storage.set('gameSettings', {
            sound: soundEnabled,
            music: musicEnabled,
            autoGeneration: autoGenerationEnabled,
        });
        alert('설정이 저장되었습니다!');
    };

    const handleAutoGenerationToggle = (enabled: boolean) => {
        setAutoGenerationEnabled(enabled);

        // 모든 군단의 자동 생성 활성화/비활성화
        const state = getGameState();
        for (const factionId of state.unlockedFactions) {
            toggleAutoGeneration(factionId, enabled);
        }

        loadTimerStatus();
    };

    const resetData = () => {
        if (confirm('정말로 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            localStorage.clear();
            alert('데이터가 초기화되었습니다. 페이지를 새로고침합니다.');
            window.location.reload();
        }
    };

    return (
        <CyberPageLayout
            title="SETTINGS"
            subtitle="System Configuration"
            description="게임 설정을 관리하세요"
            color="blue"
        >

            {/* 자동화 설정 */}
            <div className="card p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    🤖 자동화 설정
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[var(--dark-overlay)] rounded-lg">
                        <div>
                            <h3 className="font-bold mb-1">AI 군단 자동 생성</h3>
                            <p className="text-sm text-[var(--text-secondary)]">
                                해금된 AI 군단에서 자동으로 유닛을 생성합니다
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={autoGenerationEnabled}
                                onChange={(e) => handleAutoGenerationToggle(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-blue)]"></div>
                        </label>
                    </div>

                    {autoGenerationEnabled && timerStatus.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <h4 className="font-bold text-sm mb-2">활성화된 타이머</h4>
                            {timerStatus.map((timer) => (
                                <div
                                    key={timer.factionId}
                                    className="p-3 bg-[var(--dark-overlay)] rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold">{timer.factionId}</span>
                                        <span className="text-xs text-[var(--text-secondary)]">
                                            {timer.enabled ? `다음 생성: ${formatTime(timer.timeUntilNext)}` : '비활성화'}
                                        </span>
                                    </div>
                                    {timer.enabled && (
                                        <div className="w-full h-2 bg-[var(--dark-bg)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[var(--primary-blue)] to-[var(--primary-purple)]"
                                                style={{ width: `${timer.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 게임 정보 */}
            <div className="card p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    ℹ️ 게임 정보
                </h2>
                <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                    <div className="flex justify-between">
                        <span>버전</span>
                        <span className="font-bold">v1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                        <span>개발자</span>
                        <span className="font-bold">AI Daejeon Team</span>
                    </div>
                    <div className="flex justify-between">
                        <span>마지막 업데이트</span>
                        <span className="font-bold">2025-12-14</span>
                    </div>
                </div>
            </div>

            {/* 데이터 관리 */}
            <div className="card p-6 mb-6 border-2 border-[var(--accent-red)]">
                <h2 className="text-2xl font-bold mb-6 text-[var(--accent-red)]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    ⚠️ 데이터 관리
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                    모든 게임 데이터를 초기화합니다. 이 작업은 되돌릴 수 없습니다.
                </p>
                <button
                    onClick={resetData}
                    className="btn bg-[var(--accent-red)] hover:bg-red-700 text-white w-full"
                >
                    데이터 초기화
                </button>
            </div>

            {/* 도움말 */}
            <div className="card p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    💡 도움말
                </h2>
                <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                    <div>
                        <h3 className="font-bold text-white mb-1">게임 시작하기</h3>
                        <p>AI 군단에서 유닛을 수령하거나 상점에서 카드 팩을 구매하세요.</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-1">대전하기</h3>
                        <p>카드 5장을 선택하여 대전을 시작하세요. 시너지 보너스를 활용하면 유리합니다.</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-1">카드 강화</h3>
                        <p>경험치와 코인을 사용하여 카드를 레벨업할 수 있습니다.</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-1">합성</h3>
                        <p>같은 등급의 카드 3장을 합성하여 상위 등급 카드를 획득하세요.</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-1">자동화</h3>
                        <p>자동 생성을 활성화하면 해금된 AI 군단에서 자동으로 유닛이 생성됩니다.</p>
                    </div>
                </div>
            </div>
        </CyberPageLayout>
    );
}
