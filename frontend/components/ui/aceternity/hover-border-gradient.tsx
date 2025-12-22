"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export const HoverBorderGradient = ({
    children,
    className,
    containerClassName,
    as: Component = "button",
    duration = 1,
    clockwise = true,
    ...props
}: {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
    as?: React.ElementType;
    duration?: number;
    clockwise?: boolean;
    [key: string]: any;
}) => {
    const [hovered, setHovered] = useState(false);

    return (
        <Component
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`relative p-[2px] overflow-hidden ${containerClassName}`}
            {...props}
        >
            <motion.div
                className="absolute inset-0 z-0"
                style={{
                    background: hovered
                        ? "conic-gradient(from 0deg, #8B5CF6, #EC4899, #8B5CF6)"
                        : "linear-gradient(90deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))",
                }}
                animate={{
                    rotate: hovered ? (clockwise ? 360 : -360) : 0,
                }}
                transition={{
                    duration: duration,
                    repeat: hovered ? Infinity : 0,
                    ease: "linear",
                }}
            />

            <div
                className={`relative z-10 bg-slate-950 rounded-lg h-full w-full flex items-center justify-center ${className}`}
            >
                {children}
            </div>

            {/* Inner glow */}
            {hovered && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-[2px] rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 z-0 pointer-events-none"
                />
            )}
        </Component>
    );
};
