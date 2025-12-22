"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export const DraggableCard = ({
    children,
    className,
    dragConstraints,
    onDragEnd,
}: {
    children: React.ReactNode;
    className?: string;
    dragConstraints?: any;
    onDragEnd?: (event: any, info: any) => void;
}) => {
    const [isDragging, setIsDragging] = useState(false);

    return (
        <motion.div
            drag
            dragConstraints={dragConstraints}
            dragElastic={0.1}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            whileDrag={{ scale: 1.05, cursor: "grabbing" }}
            whileHover={{ scale: 1.02 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(event, info) => {
                setIsDragging(false);
                onDragEnd?.(event, info);
            }}
            className={`cursor-grab active:cursor-grabbing ${className} ${isDragging ? "z-50" : ""
                }`}
            style={{
                touchAction: "none",
            }}
        >
            {children}
        </motion.div>
    );
};

export const DraggableCardContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, {
                        dragConstraints: containerRef,
                    });
                }
                return child;
            })}
        </div>
    );
};
