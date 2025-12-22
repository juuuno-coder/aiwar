'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { initializeNewPlayer } from '@/lib/game-init';
import TutorialPopup from '@/components/TutorialPopup';
import { getGameState, checkDailyReset } from '@/lib/game-state';
import { Card } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/custom/Button';

export default function Home() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [stats, setStats] = useState({
    tokens: 0,
    cards: 0,
    level: 1,
    wins: 0,
  });

  useEffect(() => {
    initializeNewPlayer();
    checkDailyReset();

    const state = getGameState();
    setStats({
      tokens: state.tokens,
      cards: state.inventory.length,
      level: state.level,
      wins: 0,
    });

    const tutorialCompleted = localStorage.getItem('tutorialCompleted');
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('tutorialCompleted', 'true');
  };

  const mainActions = [
    {
      title: '스토리 모드',
      desc: 'AI의 역사를 경험하고 보상을 획득하세요',
      icon: '📖',
      href: '/story',
      gradient: 'from-purple-600 to-blue-600',
    },
    {
      title: '대전 시작',
      desc: '5전 3선승제 카드 배틀에 도전하세요',
      icon: '⚔️',
      href: '/battle',
      gradient: 'from-red-600 to-orange-600',
    },
  ];

  const quickActions = [
    { title: 'AI 군단', desc: '20개 AI 수집', icon: '🤖', href: '/factions', color: 'green' },
    { title: '슬롯 시너지', desc: '최대 +120%', icon: '🎰', href: '/slots', color: 'yellow' },
    { title: '유니크 유닛', desc: '24시간 생성', icon: '🌟', href: '/unique-unit', color: 'purple' },
    { title: '상점', desc: '카드 구매', icon: '🛒', href: '/shop', color: 'blue' },
  ];

  return (
    <div className="h-full">
      {showTutorial && <TutorialPopup onClose={handleCloseTutorial} />}

      {/* 환영 배너 */}
      <div className="bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-purple-900/50 rounded-2xl p-8 mb-6 border-2 border-purple-500/30 backdrop-blur-sm relative overflow-hidden animate-slide-down">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">환영합니다, 플레이어!</h1>
          <p className="text-xl text-gray-300">AI들의 전쟁에서 승리하세요</p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card variant="gradient" className="animate-slide-up delay-100">
          <div className="text-sm text-gray-400 mb-1">보유 카드</div>
          <div className="text-3xl font-bold text-blue-300">{stats.cards}장</div>
        </Card>
        <Card variant="gradient" className="animate-slide-up delay-200">
          <div className="text-sm text-gray-400 mb-1">승리 횟수</div>
          <div className="text-3xl font-bold text-green-300">{stats.wins}회</div>
        </Card>
        <Card variant="gradient" className="animate-slide-up delay-300">
          <div className="text-sm text-gray-400 mb-1">플레이어 레벨</div>
          <div className="text-3xl font-bold text-purple-300">Lv.{stats.level}</div>
        </Card>
        <Card variant="gradient" className="animate-slide-up delay-400">
          <div className="text-sm text-gray-400 mb-1">보유 토큰</div>
          <div className="text-3xl font-bold text-yellow-300">{stats.tokens.toLocaleString()}</div>
        </Card>
      </div>

      {/* 메인 액션 그리드 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {mainActions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Card variant="glow" className={`p-8 animate-slide-up delay-${(index + 5) * 100}`}>
              <div className="text-6xl mb-4 animate-float">{action.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{action.title}</h3>
              <p className="text-gray-400 mb-4">{action.desc}</p>
              <Button color="primary" className="w-full">
                시작하기 →
              </Button>
            </Card>
          </Link>
        ))}
      </div>

      {/* 빠른 액세스 */}
      <div className="grid grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Card className={`text-center animate-slide-up delay-${(index + 7) * 100}`}>
              <div className="text-4xl mb-3 animate-bounce">{action.icon}</div>
              <h4 className="text-lg font-bold text-white mb-1">{action.title}</h4>
              <p className="text-sm text-gray-400">{action.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
