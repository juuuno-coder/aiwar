import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
    isDisabled?: boolean;
}

export const Tooltip = ({
    content,
    children,
    placement = 'top',
    className,
    isDisabled = false,
}: TooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);

    if (isDisabled) return <>{children}</>;

    const placementStyles = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
    };

    return (
        <div
            className="relative flex items-center justify-center group"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={cn(
                            "absolute z-50 px-2 py-1 text-xs font-bold text-white bg-black/80 border border-white/10 rounded-lg shadow-xl backdrop-blur-md whitespace-nowrap pointer-events-none",
                            placementStyles[placement],
                            className
                        )}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
