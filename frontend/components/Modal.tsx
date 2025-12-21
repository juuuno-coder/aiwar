'use client';
import { ReactNode } from 'react';
import styles from './Modal.module.css';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    className?: string;
};

export default function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    if (!isOpen) return null;
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={`${styles.modal} ${className ?? ''}`} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>✕</button>
                {title && <h2 className={styles.title}>{title}</h2>}
                <div className={styles.body}>{children}</div>
            </div>
        </div>
    );
}
