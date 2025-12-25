'use client';

import { useState } from 'react';
import { CARD_DATABASE } from '@/data/card-database';
import { CardTemplate } from '@/lib/types';
import CyberPageLayout from '@/components/CyberPageLayout';
import { motion } from 'framer-motion';

export default function ShowcasePage() {
    const rarities = ['commander', 'unique', 'legendary', 'epic', 'rare', 'common'];

    return (
        <CyberPageLayout
            title="REALIT CARD SHOWCASE"
            englishTitle="ARCHIVE"
            subtitle="Generated Assets"
            color="red"
        >
            <div className="pb-20 space-y-16">
                {rarities.map(rarity => {
                    const cards = CARD_DATABASE.filter(c => c.rarity === rarity);
                    if (cards.length === 0) return null;

                    return (
                        <div key={rarity}>
                            <h2 className="text-2xl font-bold uppercase mb-6 flex items-center gap-3 border-b border-white/10 pb-2">
                                <span className={`w-3 h-3 rounded-full 
                                    ${rarity === 'commander' ? 'bg-yellow-400' :
                                        rarity === 'unique' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' :
                                            rarity === 'legendary' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' :
                                                rarity === 'epic' ? 'bg-purple-500' :
                                                    rarity === 'rare' ? 'bg-blue-500' : 'bg-gray-500'
                                    }`} />
                                <span className="text-white tracking-widest">{rarity} CLASS</span>
                            </h2>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {cards.map((card) => (
                                    <div key={card.id} className="relative group perspective-1000">
                                        <div className={`
                                            relative bg-black rounded-xl overflow-hidden border transition-all duration-300 transform group-hover:-translate-y-2 group-hover:rotate-x-2
                                            ${rarity === 'legendary' ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' :
                                                rarity === 'unique' ? 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]' :
                                                    rarity === 'epic' ? 'border-purple-500/50' : 'border-white/10'}
                                        `}>
                                            {/* Card Image */}
                                            <div className="aspect-[3/4] overflow-hidden relative">
                                                <img
                                                    src={card.imageUrl}
                                                    alt={card.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                                                {/* Text Overlay */}
                                                <div className="absolute bottom-0 inset-x-0 p-6">
                                                    <div className="text-[10px] font-mono mb-1 opacity-70 uppercase tracking-widest">{card.aiFactionId}</div>
                                                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">{card.name}</h3>
                                                    <p className="text-xs text-gray-300 line-clamp-2">{card.description}</p>
                                                </div>

                                                {/* Rarity Badge */}
                                                <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur rounded border border-white/20 text-[10px] uppercase font-bold tracking-wider">
                                                    {card.rarity}
                                                </div>
                                            </div>

                                            {/* Stats Panel (Hover) */}
                                            <div className="bg-zinc-900/90 p-4 border-t border-white/10 grid grid-cols-2 gap-2 text-xs font-mono">
                                                <div className="flex justify-between"><span>ACC</span> <span className="text-cyan-400">{card.baseStats?.accuracy?.max}</span></div>
                                                <div className="flex justify-between"><span>SPD</span> <span className="text-yellow-400">{card.baseStats?.speed?.max}</span></div>
                                                <div className="flex justify-between"><span>CRE</span> <span className="text-purple-400">{card.baseStats?.creativity?.max}</span></div>
                                                <div className="flex justify-between"><span>STB</span> <span className="text-green-400">{card.baseStats?.stability?.max}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </CyberPageLayout>
    );
}
