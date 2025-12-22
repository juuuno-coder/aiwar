'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { initializeNewPlayer } from '@/lib/game-init';
import { getGameState, checkDailyReset } from '@/lib/game-state';
import { motion } from 'framer-motion';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { TextHoverEffect } from '@/components/ui/aceternity/text-hover-effect';
import { Card3D, CardBody, CardItem } from '@/components/ui/aceternity/3d-card';
import { HoverBorderGradient } from '@/components/ui/aceternity/hover-border-gradient';

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
      coins: 0,
    });
  }, []);

  const mainActions = [
    {
      title: 'STORY_MODE',
      subtitle: 'Chronicle Access',
      href: '/story',
      icon: '📖',
      color: 'cyan',
      description: 'Access the neural history of 20 AI factions.',
    },
    {
      title: 'BATTLE_ARENA',
      subtitle: 'Combat Protocol',
      href: '/battle',
      icon: '⚔️',
      color: 'purple',
      description: 'Deploy your units and dominate the network.',
    },
  ];

  const quickLinks = [
    { title: 'FACTIONS', icon: '🤖', href: '/factions', color: 'from-green-500/20 to-teal-500/20' },
    { title: 'GACHA', icon: '🎰', href: '/slots', color: 'from-yellow-500/20 to-orange-500/20' },
    { title: 'UNIQUE', icon: '✨', href: '/unique-create', color: 'from-fuchsia-500/20 to-purple-500/20' },
    { title: 'ENHANCE', icon: '⚡', href: '/enhance', color: 'from-amber-500/20 to-yellow-500/20' },
    { title: 'FUSION', icon: '🔮', href: '/fusion', color: 'from-blue-500/20 to-indigo-500/20' },
    { title: 'SHOP', icon: '🛒', href: '/shop', color: 'from-pink-500/20 to-rose-500/20' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden selection:bg-cyan-500/30">
      {/* Dark Background */}
      <div className="absolute inset-0 bg-[var(--dark-bg)]" />

      {/* Cyberpunk Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Radial Glow Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Scanline Overlay */}
      <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* Background Beams */}
      <BackgroundBeams className="opacity-30" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-8 pt-32 pb-24">

        {/* Hero Title - TextHoverEffect */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <TextHoverEffect text="AI WAR" className="text-8xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4"
          >
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-cyan-500/50" />
            <p className="text-xs font-mono tracking-[0.5em] uppercase text-cyan-400/70">
              Neural Network Conflict Simulation // 2030
            </p>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-cyan-500/50" />
          </motion.div>
        </div>

        {/* Stats Cards with Neon Glow */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-20">
          {[
            { label: 'SYNC_LEVEL', value: stats.level, icon: '📊', glow: 'glow-cyan' },
            { label: 'COIN_RESERVE', value: (stats.coins || 0).toLocaleString(), icon: '💎', glow: 'glow-purple' },
            { label: 'TOKEN_NEXUS', value: stats.tokens, icon: '🪙', glow: 'glow-gold' },
            { label: 'CARD_ARCHIVE', value: stats.cards, icon: '🃏', glow: 'glow-blue' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="group"
            >
              <div className={`relative bg-[var(--dark-card)] border border-[var(--primary-purple)]/20 rounded-xl p-6 transition-all duration-300 hover:border-[var(--primary-blue)]/50 hover:${stat.glow}`}>
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500/30" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500/30" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500/30" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500/30" />

                <div className="text-center space-y-2">
                  <div className="text-2xl grayscale group-hover:grayscale-0 transition-all">{stat.icon}</div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                    {stat.label}
                  </div>
                  <div className="text-3xl font-black orbitron text-gradient">
                    {stat.value}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Actions - 3D Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto mb-20">
          {mainActions.map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.15 }}
            >
              <Card3D className="w-full">
                <CardBody className="relative h-[350px] bg-[var(--dark-card)] border border-white/5 rounded-2xl overflow-hidden group">
                  {/* Background Pattern */}
                  <div className={`absolute inset-0 opacity-10 ${action.color === 'cyan' ? 'bg-[radial-gradient(#2dd4bf_1px,transparent_1px)]' : 'bg-[radial-gradient(#a855f7_1px,transparent_1px)]'} bg-[size:30px_30px]`} />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-8">
                    <CardItem translateZ="30" className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 ${action.color === 'cyan' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-purple-500/20 border-purple-500/50 text-purple-400'} border text-[10px] font-black orbitron rounded`}>
                        {action.subtitle.toUpperCase().replace(' ', '_')}
                      </span>
                      <div className="h-px flex-1 bg-white/10" />
                    </CardItem>

                    <CardItem translateZ="50" className="mb-4">
                      <h2 className={`text-4xl font-black orbitron tracking-tighter ${action.color === 'cyan' ? 'text-cyan-400' : 'text-purple-400'} group-hover:text-white transition-colors italic`}>
                        {action.title}
                      </h2>
                    </CardItem>

                    <CardItem translateZ="40" className="mb-6">
                      <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed max-w-md">
                        {action.description}
                      </p>
                    </CardItem>

                    <CardItem translateZ="60">
                      <Link href={action.href}>
                        <HoverBorderGradient
                          containerClassName="rounded-lg"
                          className="bg-black/50 text-white px-6 py-3 text-sm font-mono uppercase tracking-widest"
                        >
                          ESTABLISH_LINK →
                        </HoverBorderGradient>
                      </Link>
                    </CardItem>
                  </div>

                  {/* Decorative Corner */}
                  <div className={`absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 ${action.color === 'cyan' ? 'border-cyan-500/30 group-hover:border-cyan-500' : 'border-purple-500/30 group-hover:border-purple-500'} transition-colors`} />

                  {/* Icon */}
                  <CardItem translateZ="80" className="absolute top-8 left-8 text-5xl opacity-20 group-hover:opacity-40 transition-opacity">
                    {action.icon}
                  </CardItem>
                </CardBody>
              </Card3D>
            </motion.div>
          ))}
        </div>

        {/* Quick Access Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-6 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
            <h3 className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-[0.3em]">Quick_Access_Protocols</h3>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {quickLinks.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.05 }}
              >
                <Link href={item.href}>
                  <div className={`group relative bg-gradient-to-br ${item.color} backdrop-blur-lg border border-white/5 rounded-xl p-5 hover:border-[var(--primary-blue)]/30 transition-all duration-300 cursor-pointer overflow-hidden`}>
                    {/* Hover Glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-[var(--primary-blue)]/10 to-transparent" />

                    <div className="relative text-center space-y-2">
                      <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                      <div className="text-[9px] font-mono text-[var(--text-secondary)] group-hover:text-cyan-400 transition-colors uppercase tracking-widest">
                        {item.title}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer System Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-3 text-[10px] font-mono text-[var(--text-muted)]">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span>SYSTEM_STATUS: ONLINE</span>
            <span className="text-[var(--primary-purple)]">|</span>
            <span>NODE_VERSION: 1.2.0_PREMIUM</span>
            <span className="text-[var(--primary-purple)]">|</span>
            <span>NETWORK: STABLE</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
