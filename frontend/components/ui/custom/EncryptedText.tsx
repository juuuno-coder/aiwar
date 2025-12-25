'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EncryptedTextProps {
    text: string;
    interval?: number;
    className?: string;
    trigger?: boolean; // Optional trigger to restart animation
}

const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/AXZ0123456789';

export function EncryptedText({
    text,
    interval = 50,
    className,
    trigger = true
}: EncryptedTextProps) {
    const [displayText, setDisplayText] = useState(text);

    useEffect(() => {
        if (!trigger) return;

        let iteration = 0;
        const timer = setInterval(() => {
            setDisplayText(prev =>
                text
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return CHARS[Math.floor(Math.random() * CHARS.length)];
                    })
                    .join("")
            );

            if (iteration >= text.length) {
                clearInterval(timer);
            }

            iteration += 1 / 3; // Controls the speed of decoding
        }, interval);

        return () => clearInterval(timer);
    }, [text, interval, trigger]);

    return (
        <span className={cn("font-mono", className)}>
            {displayText}
        </span>
    );
}
