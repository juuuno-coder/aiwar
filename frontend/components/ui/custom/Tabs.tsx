import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TabProps {
    key: string | number;
    title: React.ReactNode;
    children?: React.ReactNode;
}

interface TabsProps {
    ariaLabel?: string;
    children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[];
    selectedKey?: string | number;
    onSelectionChange?: (key: string | number) => void;
    variant?: 'underlined' | 'solid' | 'light' | 'bordered';
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    classNames?: {
        base?: string;
        tabList?: string;
        tab?: string;
        tabContent?: string;
        cursor?: string;
        panel?: string;
    };
}

export const Tabs = ({
    ariaLabel,
    children,
    selectedKey,
    onSelectionChange,
    variant = 'solid',
    color = 'default',
    classNames,
}: TabsProps) => {
    // Convert children to array to handle single child
    const tabs = React.Children.toArray(children) as React.ReactElement<TabProps>[];

    // Internal state for uncontrolled usage
    const [internalSelectedKey, setInternalSelectedKey] = useState<string | number>(
        selectedKey || (tabs[0]?.key as string | number)
    );

    const activeKey = selectedKey !== undefined ? selectedKey : internalSelectedKey;

    const handleSelectionChange = (key: string | number) => {
        if (onSelectionChange) {
            onSelectionChange(key);
        } else {
            setInternalSelectedKey(key);
        }
    };

    return (
        <div className={cn("flex flex-col", classNames?.base)}>
            <div
                className={cn(
                    "flex relative overflow-x-auto no-scrollbar",
                    variant === 'underlined' ? "border-b border-white/10" : "p-1 bg-zinc-800/50 rounded-xl",
                    classNames?.tabList
                )}
                role="tablist"
                aria-label={ariaLabel}
            >
                {tabs.map((tab) => {
                    const isSelected = tab.key === activeKey;
                    return (
                        <button
                            key={tab.key}
                            role="tab"
                            aria-selected={isSelected}
                            onClick={() => handleSelectionChange(tab.key as string | number)}
                            className={cn(
                                "relative flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors outline-none",
                                variant === 'underlined' ? "bg-transparent" : "rounded-lg",
                                isSelected ? "text-white" : "text-zinc-400 hover:text-zinc-200",
                                classNames?.tab
                            )}
                        >
                            {isSelected && (
                                <motion.div
                                    layoutId="tab-cursor"
                                    className={cn(
                                        "absolute inset-0 z-0",
                                        variant === 'underlined' ? "bottom-[-1px] rounded-none border-b-2" : "bg-zinc-700 shadow-sm rounded-lg",
                                        variant === 'underlined' && color === 'secondary' && "border-purple-500",
                                        variant === 'underlined' && color === 'primary' && "border-cyan-500",
                                        classNames?.cursor
                                    )}
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <span className={cn("relative z-10", classNames?.tabContent)} data-selected={isSelected}>
                                {tab.props.title}
                            </span>
                        </button>
                    );
                })}
            </div>
            <div className={cn("mt-4", classNames?.panel)}>
                {tabs.find(tab => tab.key === activeKey)?.props.children}
            </div>
        </div>
    );
};

export const Tab = ({ children }: { key: string | number, title: React.ReactNode, children?: React.ReactNode }) => {
    return <>{children}</>;
};
