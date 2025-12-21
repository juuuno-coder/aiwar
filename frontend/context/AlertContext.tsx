'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/custom/Modal';
import { Button } from '@/components/ui/custom/Button';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertOptions {
    title: string;
    message: string;
    type?: AlertType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
}

interface AlertContextType {
    showAlert: (options: AlertOptions) => void;
    showConfirm: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) throw new Error('useAlert must be used within an AlertProvider');
    return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<AlertOptions | null>(null);

    const showAlert = useCallback((opts: AlertOptions) => {
        setOptions({ ...opts, showCancel: false });
        setIsOpen(true);
    }, []);

    const showConfirm = useCallback((opts: AlertOptions) => {
        setOptions({ ...opts, showCancel: true });
        setIsOpen(true);
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        if (options?.onConfirm) options.onConfirm();
    };

    const handleCancel = () => {
        setIsOpen(false);
        if (options?.onCancel) options.onCancel();
    };

    const getIcon = (type: AlertType = 'info') => {
        switch (type) {
            case 'success': return <CheckCircle2 className="text-green-500" size={32} />;
            case 'error': return <AlertCircle className="text-red-500" size={32} />;
            case 'warning': return <TriangleAlert className="text-yellow-500" size={32} />;
            default: return <Info className="text-blue-500" size={32} />;
        }
    };

    const getColorClass = (type: AlertType = 'info') => {
        switch (type) {
            case 'success': return 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.15)]';
            case 'error': return 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]';
            case 'warning': return 'border-yellow-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]';
            default: return 'border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]';
        }
    };

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <Modal
                isOpen={isOpen}
                onClose={handleCancel}
                size="sm"
                className={cn(
                    "bg-[#0a0a0a]/90 backdrop-blur-3xl border-2 overflow-hidden",
                    options ? getColorClass(options.type) : ""
                )}
                hideCloseButton
            >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                <ModalBody className="pt-8 flex flex-col items-center text-center relative z-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-6"
                    >
                        {options && getIcon(options.type)}
                    </motion.div>

                    <h2 className="text-xl font-black text-white orbitron italic mb-2 tracking-tight">
                        {options?.title}
                    </h2>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                        {options?.message}
                    </p>
                </ModalBody>

                <ModalFooter className="border-none pb-8 pt-4 justify-center gap-3 relative z-10">
                    {options?.showCancel && (
                        <Button
                            onPress={handleCancel}
                            variant="flat"
                            className="font-bold orbitron text-xs h-10 px-8 hover:bg-white/5"
                        >
                            {options.cancelText || 'CANCEL'}
                        </Button>
                    )}
                    <Button
                        onPress={handleConfirm}
                        color={options?.type === 'error' ? 'danger' : options?.type === 'success' ? 'success' : 'primary'}
                        className={cn(
                            "font-black orbitron text-xs h-10 px-10 shadow-lg",
                            options?.type === 'success' ? "bg-green-600 hover:bg-green-500" :
                                options?.type === 'error' ? "bg-red-600 hover:bg-red-500" : ""
                        )}
                    >
                        {options?.confirmText || 'ACKNOWLEDGE'}
                    </Button>
                </ModalFooter>
            </Modal>
        </AlertContext.Provider>
    );
};
