import React, { useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalContextType {
    onClose?: () => void;
}

const ModalContext = createContext<ModalContextType>({ onClose: undefined });

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    children: React.ReactNode;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    backdrop?: 'transparent' | 'opaque' | 'blur';
    hideCloseButton?: boolean;
    className?: string;
    placement?: 'auto' | 'top' | 'center' | 'bottom';
    wrapperClassName?: string;
    classNames?: {
        base?: string;
        header?: string;
        body?: string;
        footer?: string;
        closeButton?: string;
        backdrop?: string;
    };
}

export const Modal = ({
    isOpen,
    onClose,
    children,
    size = 'md',
    backdrop = 'opaque',
    hideCloseButton = false,
    className,
    placement = 'center',
    wrapperClassName,
    classNames,
}: ModalProps) => {
    const [mounted, setMounted] = React.useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted) return null;

    const sizeClasses = {
        xs: "max-w-xs",
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        full: "max-w-full m-4 h-[calc(100%-2rem)]",
    };

    const backdropClasses = {
        transparent: "bg-transparent",
        opaque: "bg-black/50",
        blur: "bg-black/30 backdrop-blur-md",
    };

    const placementClasses = {
        auto: "items-center",
        top: "items-start pt-20",
        center: "items-center",
        bottom: "items-end pb-10",
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <ModalContext.Provider value={{ onClose }}>
                    <div className={cn("fixed inset-0 z-50 flex justify-center p-4 contents", placementClasses[placement], wrapperClassName)}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={cn("fixed inset-0 z-[60]", backdropClasses[backdrop], classNames?.backdrop)}
                            onClick={onClose}
                        />
                        <div className={cn("fixed inset-0 z-[60] flex justify-center p-4 pointer-events-none", placementClasses[placement])}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                    "pointer-events-auto relative w-full bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]",
                                    sizeClasses[size],
                                    className,
                                    classNames?.base
                                )}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {!hideCloseButton && onClose && (
                                    <button
                                        onClick={onClose}
                                        className={cn("absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors z-50", classNames?.closeButton)}
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                                {children}
                            </motion.div>
                        </div>
                    </div>
                </ModalContext.Provider>
            )}
        </AnimatePresence>,
        document.body
    );
};

export const ModalHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("px-6 py-4 text-lg font-bold border-b border-white/5", className)} {...props}>
        {children}
    </div>
);

export const ModalBody = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("px-6 py-4 flex-1 overflow-y-auto min-h-[100px]", className)} {...props}>
        {children}
    </div>
);

export const ModalFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("px-6 py-4 flex justify-end gap-3 border-t border-white/5", className)} {...props}>
        {children}
    </div>
);

// Compatibility alias
export const ModalContent = ({ children }: { children: React.ReactNode | ((onClose?: () => void) => React.ReactNode) }) => {
    const { onClose } = useContext(ModalContext);
    return <>{children instanceof Function ? children(onClose) : children}</>;
};
