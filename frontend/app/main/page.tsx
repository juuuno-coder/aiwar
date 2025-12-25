'use client';

import { useState, useEffect } from 'react';
import CyberPageLayout from '@/components/CyberPageLayout';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeTutorialModal from '@/components/WelcomeTutorialModal';

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        {menuItems.map((item, idx) => (
          <Link key={idx} href={item.path}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                                h-64 rounded-2xl border border-${item.color}-500/30 bg-black/40 backdrop-blur-md
                                flex flex-col items-center justify-center gap-4 relative overflow-hidden group
                                hover:border-${item.color}-500 hover:bg-${item.color}-500/10 transition-all
                            `}
            >
              <div className={`absolute inset-0 bg-gradient-to-b from-${item.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

              <span className="text-6xl group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {item.icon}
              </span>

              <div className="text-center z-10">
                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-${item.color}-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs font-mono text-white/50 tracking-widest uppercase">
                  {item.subtitle}
                </p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <AnimatePresence>
        {showTutorial && <WelcomeTutorialModal onClose={handleTutorialClose} />}
      </AnimatePresence>
    </CyberPageLayout>
  );
}
