"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

export const BackgroundBeams = ({ className }: { className?: string }) => {
    const beamsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const beams = beamsRef.current;
        if (!beams) return;

        const handleMouseMove = (event: MouseEvent) => {
            const { clientX, clientY } = event;
            const { left, top, width, height } = beams.getBoundingClientRect();
            const x = clientX - left;
            const y = clientY - top;

            beams.style.setProperty("--x", `${x}px`);
            beams.style.setProperty("--y", `${y}px`);
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <div
            ref={beamsRef}
            className={cn(
                "absolute inset-0 z-0 h-full w-full overflow-hidden bg-black [--x:0px] [--y:0px]",
                className
            )}
        >
            <div
                className="pointer-events-none absolute inset-0 z-10 h-full w-full"
                style={{
                    background: `radial-gradient(600px circle at var(--x) var(--y), rgba(139, 92, 246, 0.15), transparent 80%)`,
                }}
            />
            <div className="absolute inset-0 z-0 h-full w-full opacity-30">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                    className="h-full w-full"
                >
                    <defs>
                        <pattern
                            id="beams-pattern"
                            width="50"
                            height="50"
                            patternUnits="userSpaceOnUse"
                        >
                            <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.05)" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#beams-pattern)" />
                </svg>
            </div>
        </div>
    );
};
