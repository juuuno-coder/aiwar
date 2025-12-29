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
        {menuItems.map((item, idx) => {
          // Tailwind Dynamic Class Fix: Explicit mapping
          const colorVariants: Record<string, any> = {
            green: { border: 'border-green-500/30', hover: 'hover:border-green-500', text: 'group-hover/card:text-green-400', shadow: 'dark:hover:shadow-green-500/[0.1]', bg: 'from-green-500/5' },
            red: { border: 'border-red-500/30', hover: 'hover:border-red-500', text: 'group-hover/card:text-red-400', shadow: 'dark:hover:shadow-red-500/[0.1]', bg: 'from-red-500/5' },
            purple: { border: 'border-purple-500/30', hover: 'hover:border-purple-500', text: 'group-hover/card:text-purple-400', shadow: 'dark:hover:shadow-purple-500/[0.1]', bg: 'from-purple-500/5' },
            amber: { border: 'border-amber-500/30', hover: 'hover:border-amber-500', text: 'group-hover/card:text-amber-400', shadow: 'dark:hover:shadow-amber-500/[0.1]', bg: 'from-amber-500/5' },
            yellow: { border: 'border-yellow-500/30', hover: 'hover:border-yellow-500', text: 'group-hover/card:text-yellow-400', shadow: 'dark:hover:shadow-yellow-500/[0.1]', bg: 'from-yellow-500/5' },
            pink: { border: 'border-pink-500/30', hover: 'hover:border-pink-500', text: 'group-hover/card:text-pink-400', shadow: 'dark:hover:shadow-pink-500/[0.1]', bg: 'from-pink-500/5' },
            blue: { border: 'border-blue-500/30', hover: 'hover:border-blue-500', text: 'group-hover/card:text-blue-400', shadow: 'dark:hover:shadow-blue-500/[0.1]', bg: 'from-blue-500/5' },
            rose: { border: 'border-rose-500/30', hover: 'hover:border-rose-500', text: 'group-hover/card:text-rose-400', shadow: 'dark:hover:shadow-rose-500/[0.1]', bg: 'from-rose-500/5' },
          };

          const variant = colorVariants[item.color] || colorVariants['green'];

          return (
            <Link key={idx} href={item.path}>
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

      <AnimatePresence>
        {showTutorial && <WelcomeTutorialModal onClose={handleTutorialClose} />}
      </AnimatePresence>
    </CyberPageLayout>
  );
}
