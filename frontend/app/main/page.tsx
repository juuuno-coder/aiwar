'use client';

import { useState, useEffect } from 'react';
import CyberPageLayout from '@/components/CyberPageLayout';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import TutorialOverlay from '@/components/tutorial/TutorialOverlay'; // [NEW]
import { useGameSound } from '@/hooks/useGameSound'; // [NEW]
import { BackgroundBeams } from "@/components/ui/aceternity/background-beams";
import { CardBody, Card3D as CardContainer, CardItem } from "@/components/ui/aceternity/3d-card";
import { useUser } from '@/context/UserContext';
import CardRevealModal from '@/components/CardRevealModal';

export default function MainPage() {
  const [showTutorial, setShowTutorial] = useState(false);

  const { playSound } = useGameSound();
  const { user, profile, starterPackAvailable, claimStarterPack, hideStarterPack, completeTutorial } = useUser();
  const [showStarterPackModal, setShowStarterPackModal] = useState(false);
  const [starterCards, setStarterCards] = useState<any[]>([]);

  useEffect(() => {
    // Play Main BGM
    playSound('bgm_main', 'bgm');

    // Check if tutorial has been seen (User Specific)
    if (user?.uid) {
      const tutorialKey = `tutorial_completed_${user.uid}`;
      const hasSeenTutorial = localStorage.getItem(tutorialKey);

      if (!hasSeenTutorial) {
        // [Fix] Tutorial modal race condition
        // 1초 뒤에 켜지도록 하여 초기 로딩 안정화
        const timer = setTimeout(() => setShowTutorial(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [playSound, user?.uid]);

  // Starter Pack Check
  useEffect(() => {
    if (starterPackAvailable && !showTutorial) {
      // 튜토리얼이 닫혀있고, 스타터팩을 아직 안 받았다면
      setShowStarterPackModal(true);
    }
  }, [starterPackAvailable, showTutorial]);

  const handleClaimStarterPack = async () => {
    if (!profile?.nickname) return;
    const cards = await claimStarterPack(profile.nickname);
    setStarterCards(cards);
    // 모달은 CardRevealModal 내부에서 보여줌
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
    // [Fix] Context 상태 동기화를 위해 함수 사용
    completeTutorial();
  };

  const menuItems = [
    { title: '군단 본부', subtitle: 'LEGION HQ', path: '/factions', color: 'green', icon: '🏛️' },
    { title: '작전 지역', subtitle: 'BATTLE FIELD', path: '/battle', color: 'red', icon: '⚔️', id: 'menu-battle' }, // [NEW] ID
    { title: '카드 보관소', subtitle: 'INVENTORY', path: '/my-cards', color: 'purple', icon: '📦', id: 'menu-inventory' }, // [NEW] ID
    { title: '연구소', subtitle: 'LAB', path: '/lab', color: 'orange', icon: '🧪' },
    { title: '생성', subtitle: 'GENERATION', path: '/generation', color: 'yellow', icon: '⚡' },
    { title: '강화', subtitle: 'ENHANCE', path: '/enhance', color: 'pink', icon: '✨' },
    { title: '합성', subtitle: 'FUSION', path: '/fusion', color: 'blue', icon: '🔮' },
    { title: '유니크', subtitle: 'UNIQUE UNIT', path: '/unique-unit', color: 'rose', icon: '🧬' },
  ];

  return (
    <CyberPageLayout
      title="MAIN DASHBOARD"
      englishTitle="COMMAND CENTER"
      subtitle="Select Operation"
      color="cyan"
    >
      {/* Background Beams Effect - Restored from Log 2025-12-22 */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <BackgroundBeams />
      </div>

      {/* Season 1 Banner - Added above grid */}
      <div id="season-banner" className="relative z-10 w-full max-w-7xl mx-auto mt-6 mb-8 overflow-hidden rounded-2xl border border-cyan-500/30 bg-black/60 backdrop-blur-md group cursor-pointer hover:border-cyan-500/80 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/10 via-blue-900/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="relative p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              🌍
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] font-bold tracking-wider rounded border border-cyan-500/30 animate-pulse">ACTIVE SEASON</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white italic orbitron">
                SEASON 1: GENESIS
              </h3>
              <p className="text-cyan-400/70 text-sm font-mono mt-1">
                전쟁의 서막이 올랐습니다. 최초의 지휘관이 되어 역사를 기록하십시오.
              </p>
            </div>
          </div>
          <Link href="/story">
            <button className="px-6 py-2 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition-colors tracking-widest text-xs">
              CAMPAIGN START
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {menuItems.map((item, idx) => {
          // Tailwind Dynamic Class Fix: Explicit mapping
          const colorVariants: Record<string, any> = {
            green: { border: 'border-green-500/30', hover: 'hover:border-green-500', text: 'group-hover/card:text-green-400', shadow: 'dark:hover:shadow-green-500/[0.1]', bg: 'from-green-500/5' },
            red: { border: 'border-red-500/30', hover: 'hover:border-red-500', text: 'group-hover/card:text-red-400', shadow: 'dark:hover:shadow-red-500/[0.1]', bg: 'from-red-500/5' },
            purple: { border: 'border-purple-500/30', hover: 'hover:border-purple-500', text: 'group-hover/card:text-purple-400', shadow: 'dark:hover:shadow-purple-500/[0.1]', bg: 'from-purple-500/5' },
            amber: { border: 'border-amber-500/30', hover: 'hover:border-amber-500', text: 'group-hover/card:text-amber-400', shadow: 'dark:hover:shadow-amber-500/[0.1]', bg: 'from-amber-500/5' },
            orange: { border: 'border-orange-500/30', hover: 'hover:border-orange-500', text: 'group-hover/card:text-orange-400', shadow: 'dark:hover:shadow-orange-500/[0.1]', bg: 'from-orange-500/5' },
            yellow: { border: 'border-yellow-500/30', hover: 'hover:border-yellow-500', text: 'group-hover/card:text-yellow-400', shadow: 'dark:hover:shadow-yellow-500/[0.1]', bg: 'from-yellow-500/5' },
            pink: { border: 'border-pink-500/30', hover: 'hover:border-pink-500', text: 'group-hover/card:text-pink-400', shadow: 'dark:hover:shadow-pink-500/[0.1]', bg: 'from-pink-500/5' },
            blue: { border: 'border-blue-500/30', hover: 'hover:border-blue-500', text: 'group-hover/card:text-blue-400', shadow: 'dark:hover:shadow-blue-500/[0.1]', bg: 'from-blue-500/5' },
            rose: { border: 'border-rose-500/30', hover: 'hover:border-rose-500', text: 'group-hover/card:text-rose-400', shadow: 'dark:hover:shadow-rose-500/[0.1]', bg: 'from-rose-500/5' },
          };

          const variant = colorVariants[item.color] || colorVariants['green'];

          return (
            <Link key={idx} href={item.path} id={(item as any).id}>
              <CardContainer className="inter-var w-full h-full">
                <CardBody className={`
                        bg-black/40 relative group/card dark:hover:shadow-2xl ${variant.shadow}
                        dark:bg-black dark:border-white/[0.2] border-black/[0.1]
                        w-full h-64 rounded-xl p-6 border ${variant.border}
                        flex flex-col items-center justify-center gap-4 overflow-hidden
                        ${variant.hover} transition-colors duration-300
                    `}>

                  <div className={`absolute inset-0 bg-gradient-to-b ${variant.bg} to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity`} />

                  <CardItem translateZ="50" className="w-full flex justify-center items-center">
                    <span className="text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                      {item.icon}
                    </span>
                  </CardItem>

                  <CardItem translateZ="60" className="text-center z-10 mt-4">
                    <h3 className={`text-2xl font-bold text-white mb-1 ${variant.text} transition-colors`}>
                      {item.title}
                    </h3>
                    <p className="text-xs font-mono text-white/50 tracking-widest uppercase">
                      {item.subtitle}
                    </p>
                  </CardItem>
                </CardBody>
              </CardContainer>
            </Link>
          );
        })}
      </div>

      {/* Next Season Banner - HIDDEN FOR NOW as per request */}
      {/* 
      <div className="mt-12 relative z-10 w-full max-w-7xl mx-auto overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md group cursor-pointer hover:border-cyan-500/50 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-purple-900/20 to-pink-900/20 opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="relative p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-black border border-white/20 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(0,255,255,0.2)]">
              🚀
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] font-bold tracking-wider rounded border border-cyan-500/30">COMING SOON</span>
                <span className="text-white/40 text-xs font-mono">SEASON 2 UPDATE</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white italic orbitron bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                THE NEXT EVOLUTION
              </h3>
              <p className="text-gray-400 text-sm max-w-xl mt-1">
                새로운 AI 팩션, 확장된 스토리 챕터, 그리고 완전히 새로운 길드 경쟁 시스템이 찾아옵니다. 사전 예약을 통해 한정판 보상을 놓치지 마세요.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <button className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-cyan-400 transition-colors tracking-widest text-sm skew-x-[-10deg]">
              <span className="block skew-x-[10deg]">자세히 보기</span>
            </button>
          </div>
        </div>
      </div>
      */}

      <TutorialOverlay isOpen={showTutorial} onClose={handleTutorialClose} />

      {/* Starter Pack Modal - using CardRevealModal for the reveal effect */}
      {/* First, show a prompt, then on click, trigger claim and show reveal */}
      {showStarterPackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-cyan-500/50 p-8 rounded-2xl max-w-md text-center shadow-[0_0_50px_rgba(6,182,212,0.2)]">
            <div className="text-6xl mb-4">🎁</div>
            <h2 className="text-2xl font-black text-white orbitron mb-2">WELCOME COMMANDER</h2>
            <p className="text-gray-400 mb-6">
              신규 지휘관을 위한 특별 보급품이 도착했습니다.<br />
              지금 바로 수령하여 군단을 지휘하세요.
            </p>
            <button
              onClick={handleClaimStarterPack}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25"
            >
              보급품 수령하기
            </button>
          </div>
        </div>
      )}

      {/* Actual Reveal Modal */}
      <CardRevealModal
        isOpen={starterCards.length > 0}
        card={starterCards[4]} // Show the Unique Commander Card as the highlight
        onClose={() => {
          setStarterCards([]);
          setShowStarterPackModal(false);
          hideStarterPack(); // Update context state
        }}
        onAddToInventory={() => {
          // Already added by claimStarterPack logic, just close UI
        }}
      />
    </CyberPageLayout>
  );
}
