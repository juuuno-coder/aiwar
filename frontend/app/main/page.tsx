'use client';

import { useState, useEffect } from 'react';
import CyberPageLayout from '@/components/CyberPageLayout';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeTutorialModal from '@/components/WelcomeTutorialModal';
import { BackgroundBeams } from "@/components/ui/aceternity/background-beams";
import { CardBody, Card3D as CardContainer, CardItem } from "@/components/ui/aceternity/3d-card";

export default function MainPage() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Check if tutorial has been seen
    const hasSeenTutorial = localStorage.getItem('hasSeenCommandTutorial_v2');
    if (!hasSeenTutorial) {
      // Small delay for effect
      const timer = setTimeout(() => setShowTutorial(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTutorialClose = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenCommandTutorial_v2', 'true');
  };

  const menuItems = [
    { title: '군단 본부', subtitle: 'LEGION HQ', path: '/factions', color: 'green', icon: '🏛️' },
    { title: '작전 지역', subtitle: 'BATTLE FIELD', path: '/battle', color: 'red', icon: '⚔️' },
    { title: '카드 보관소', subtitle: 'INVENTORY', path: '/my-cards', color: 'purple', icon: '📦' },
    { title: '연구소', subtitle: 'LAB', path: '/lab', color: 'amber', icon: '🧪' },
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 relative z-10">
        {menuItems.map((item, idx) => (
          <Link key={idx} href={item.path}>
            <CardContainer className="inter-var w-full h-full">
              <CardBody className={`
                    bg-black/80 relative group/card dark:hover:shadow-2xl dark:hover:shadow-${item.color}-500/[0.1]
                    dark:bg-black dark:border-white/[0.2] border-black/[0.1]
                    w-full h-64 rounded-xl p-6 border border-white/10
                    flex flex-col items-center justify-center gap-6 overflow-hidden
                    hover:border-${item.color}-500/50 transition-colors duration-300
                `}>

                {/* Corner Brackets (The "Lines" requested) */}
                <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-${item.color}-500/30 rounded-tl-lg group-hover/card:border-${item.color}-500 group-hover/card:w-16 group-hover/card:h-16 transition-all duration-300`} />
                <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-${item.color}-500/30 rounded-tr-lg group-hover/card:border-${item.color}-500 group-hover/card:w-16 group-hover/card:h-16 transition-all duration-300`} />
                <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-${item.color}-500/30 rounded-bl-lg group-hover/card:border-${item.color}-500 group-hover/card:w-16 group-hover/card:h-16 transition-all duration-300`} />
                <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-${item.color}-500/30 rounded-br-lg group-hover/card:border-${item.color}-500 group-hover/card:w-16 group-hover/card:h-16 transition-all duration-300`} />

                {/* Animated Background Line */}
                <div className={`absolute inset-0 bg-gradient-to-b from-${item.color}-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500`} />

                {/* TECH NODE Icon Container */}
                <CardItem translateZ="50" className="w-full flex justify-center items-center relative">
                  <div className={`
                      relative w-24 h-24 rounded-2xl 
                      bg-gradient-to-br from-${item.color}-500/20 to-transparent 
                      border border-${item.color}-500/30 
                      flex items-center justify-center
                      group-hover/card:border-${item.color}-500 group-hover/card:shadow-[0_0_20px_rgba(0,0,0,0.5)]
                      transition-all duration-300
                   `}>
                    {/* Inner pulsing circle */}
                    <div className={`absolute inset-2 rounded-xl border border-${item.color}-500/10 group-hover/card:animate-pulse`} />

                    <span className="text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transform group-hover/card:scale-110 transition-transform duration-300">
                      {item.icon}
                    </span>
                  </div>
                </CardItem>

                <CardItem translateZ="60" className="text-center z-10 w-full">
                  <h3 className={`text-xl font-black text-white mb-2 tracking-wider group-hover/card:text-${item.color}-400 transition-colors uppercase`}>
                    {item.title}
                  </h3>
                  <div className={`h-[1px] w-12 bg-${item.color}-500/50 mx-auto mb-2`} />
                  <p className="text-[10px] font-mono text-cyan-500/70 tracking-[0.2em] uppercase">
                    {item.subtitle}
                  </p>
                </CardItem>
              </CardBody>
            </CardContainer>
          </Link>
        ))}
      </div>

      <AnimatePresence>
        {showTutorial && <WelcomeTutorialModal onClose={handleTutorialClose} />}
      </AnimatePresence>
    </CyberPageLayout>
  );
}
