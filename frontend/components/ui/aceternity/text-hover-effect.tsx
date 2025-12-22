"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export const TextHoverEffect = ({
    text,
    className,
}: {
    text: string;
    className?: string;
}) => {
    const [isHovering, setIsHovering] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 700 };
    const rotateX = useSpring(useMotionValue(0), springConfig);
    const rotateY = useSpring(useMotionValue(0), springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const mouseXPos = e.clientX - rect.left;
            const mouseYPos = e.clientY - rect.top;
            const xPct = mouseXPos / width - 0.5;
            const yPct = mouseYPos / height - 0.5;
            rotateX.set(yPct * 20);
            rotateY.set(xPct * 20);
            mouseX.set(mouseXPos);
            mouseY.set(mouseYPos);
        };

        const handleMouseLeave = () => {
            rotateX.set(0);
            rotateY.set(0);
            setIsHovering(false);
        };

        const element = ref.current;
        if (element) {
            element.addEventListener("mousemove", handleMouseMove);
            element.addEventListener("mouseleave", handleMouseLeave);
            element.addEventListener("mouseenter", () => setIsHovering(true));
        }

        return () => {
            if (element) {
                element.removeEventListener("mousemove", handleMouseMove);
                element.removeEventListener("mouseleave", handleMouseLeave);
                element.removeEventListener("mouseenter", () => setIsHovering(true));
            }
        };
    }, [mouseX, mouseY, rotateX, rotateY]);

    return (
        <div ref={ref} className={`relative ${className}`}>
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className="relative"
            >
                <div
                    className="text-[8rem] md:text-[12rem] lg:text-[16rem] font-black tracking-tighter"
                    style={{
                        fontFamily: "Orbitron, sans-serif",
                        textShadow: isHovering
                            ? "0 0 80px rgba(139, 92, 246, 0.8), 0 0 120px rgba(139, 92, 246, 0.6)"
                            : "0 0 40px rgba(139, 92, 246, 0.4)",
                        transition: "text-shadow 0.3s ease",
                    }}
                >
                    <span className="bg-gradient-to-br from-purple-400 via-violet-500 to-purple-600 bg-clip-text text-transparent">
                        {text}
                    </span>
                </div>

                {/* Holographic overlay */}
                {isHovering && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                        style={{
                            transform: `translateX(${mouseX.get() - 100}px)`,
                        }}
                    />
                )}

                {/* Glow effect */}
                <div
                    className="absolute inset-0 blur-3xl opacity-50 pointer-events-none"
                    style={{
                        background: isHovering
                            ? "radial-gradient(circle at center, rgba(139, 92, 246, 0.6), transparent 70%)"
                            : "radial-gradient(circle at center, rgba(139, 92, 246, 0.3), transparent 70%)",
                        transition: "background 0.3s ease",
                    }}
                />
            </motion.div>
        </div>
    );
};
