'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { initializeNewPlayer } from '@/lib/game-init';
import { getGameState, checkDailyReset } from '@/lib/game-state';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState({
    tokens: 0,
    cards: 0,
    level: 1,
    coins: 0,
  });

  useEffect(() => {
    initializeNewPlayer();
    checkDailyReset();

    const state = getGameState();
    setStats({
      tokens: state.tokens || 0,
      cards: state.inventory?.length || 0,
      level: state.level || 1,
      coins: 0, // GameState doesn't have coins property
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.05),transparent_50%)]" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-8 pt-40 pb-24">
        {/* Hero Title - Overwatch Style Typography */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <h1 className="text-7xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              AI WAR
            </span>
          </h1>
          <p className="text-xl text-purple-300/60 font-light tracking-wide">
            The Ultimate Card Battle Experience
          </p>
        </motion.div>

        {/* Stats Cards - Million Arthur Style */}
        <div className="grid grid-cols-4 gap-8 max-w-6xl mx-auto mb-24">
          {[
            { label: 'Level', value: stats.level, icon: '⬡' },
            { label: 'Coins', value: (stats.coins || 0).toLocaleString(), icon: '◆' },
            { label: 'Tokens', value: stats.tokens, icon: '◈' },
            { label: 'Cards', value: stats.cards, icon: '◉' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <div className="bg-slate-800/40 backdrop-blur-sm border border-purple-500/10 rounded-2xl p-8 hover:border-purple-400/30 transition-all duration-300 hover:bg-slate-800/60">
                <div className="text-center space-y-3">
                  <div className="text-2xl text-purple-400/40">{stat.icon}</div>
                  <div className="text-sm text-slate-400 uppercase tracking-wider font-medium">
                    {stat.label}
                  </div>
                  <div className="text-4xl font-bold text-white">
                    {stat.value}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Actions - Clean and Spacious */}
        <div className="grid grid-cols-2 gap-10 max-w-5xl mx-auto mb-20">
          {[
            {
              title: 'Story Mode',
              subtitle: 'Experience the chronicle',
              href: '/story',
              gradient: 'from-purple-600/20 to-blue-600/20',
              borderGradient: 'from-purple-500 to-blue-500',
            },
            {
              title: 'Battle Arena',
              subtitle: 'Test your skills',
              href: '/battle',
              gradient: 'from-blue-600/20 to-indigo-600/20',
              borderGradient: 'from-blue-500 to-indigo-500',
            },
          ].map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <Link href={action.href}>
                <div className="group relative">
                  {/* Gradient Border */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${action.borderGradient} rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500`} />

                  <div className={`relative bg-gradient-to-br ${action.gradient} backdrop-blur-xl border border-white/5 rounded-3xl p-12 transition-all duration-300 group-hover:border-white/10`}>
                    <div className="space-y-4">
                      <p className="text-sm text-slate-400 uppercase tracking-widest font-medium">
                        {action.subtitle}
                      </p>
                      <h2 className="text-5xl font-black text-white tracking-tight">
                        {action.title}
                      </h2>
                      <div className="pt-4">
                        <div className="inline-flex items-center text-purple-300 group-hover:text-purple-200 transition-colors">
                          <span className="text-sm font-medium tracking-wide">Enter</span>
                          <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Access - Minimal and Clean */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-6 gap-6">
            {[
              { title: 'Factions', icon: '🤖', href: '/factions' },
              { title: 'Slots', icon: '🎰', href: '/slots' },
              { title: 'Unique', icon: '✨', href: '/unique-create' },
              { title: 'Enhance', icon: '⚡', href: '/enhance' },
              { title: 'Fusion', icon: '🔮', href: '/fusion' },
              { title: 'Shop', icon: '🛒', href: '/shop' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
              >
                <Link href={item.href}>
                  <div className="group bg-slate-800/30 backdrop-blur-sm border border-purple-500/5 rounded-2xl p-6 hover:border-purple-400/20 transition-all duration-300 hover:bg-slate-800/50 cursor-pointer">
                    <div className="text-center space-y-3">
                      <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                      <div className="text-sm text-slate-400 group-hover:text-purple-300 transition-colors font-medium">
                        {item.title}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
