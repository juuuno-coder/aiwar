"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export const FocusCards = ({
    cards,
    className,
}: {
    cards: {
        title: string;
        src: string;
        content?: React.ReactNode;
    }[];
    className?: string;
}) => {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-10 ${className}`}>
            {cards.map((card, index) => (
                <motion.div
                    key={card.title}
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                    className="relative overflow-hidden rounded-3xl cursor-pointer"
                    animate={{
                        scale: hovered === index ? 1.05 : hovered !== null ? 0.95 : 1,
                        filter: hovered === index ? "blur(0px)" : hovered !== null ? "blur(4px)" : "blur(0px)",
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="relative h-80 w-full">
                        <img
                            src={card.src}
                            alt={card.title}
                            className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {card.title}
                            </h3>
                            {card.content && (
                                <div className="text-white/80">{card.content}</div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export const FocusCard = ({
    title,
    src,
    content,
    className,
    onHover,
}: {
    title: string;
    src: string;
    content?: React.ReactNode;
    className?: string;
    onHover?: (hovered: boolean) => void;
}) => {
    return (
        <motion.div
            onMouseEnter={() => onHover?.(true)}
            onMouseLeave={() => onHover?.(false)}
            whileHover={{ scale: 1.05 }}
            className={`relative overflow-hidden rounded-3xl cursor-pointer ${className}`}
        >
            <div className="relative h-80 w-full">
                <img
                    src={src}
                    alt={title}
                    className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                    {content && <div className="text-white/80">{content}</div>}
                </div>
            </div>
        </motion.div>
    );
};
