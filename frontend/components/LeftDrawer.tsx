import React from 'react';
import styles from '@/components/SideDrawer.module.css';

type LeftDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export default function LeftDrawer({ isOpen, onClose, children }: LeftDrawerProps) {
    if (!isOpen) return null;
    return (
        <>
            {/* overlay */}
            <div className={styles.overlay} onClick={onClose} />
            {/* drawer */}
            <div className={styles.sideDrawer} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButtonDrawer} onClick={onClose}>✕</button>
                {children}
            </div>
        </>
    );
}
