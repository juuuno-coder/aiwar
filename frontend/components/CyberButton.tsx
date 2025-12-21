'use client';
import styles from './CyberButton.module.css';
import { ReactNode } from 'react';
import Link from 'next/link';

type Props = {
    onClick?: () => void;
    disabled?: boolean;
    children: ReactNode;
    className?: string;
    href?: string;
    variant?: 'primary' | 'outline' | 'ghost' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
};

export default function CyberButton({
    onClick,
    disabled,
    children,
    className,
    href,
    variant = 'primary',
    size = 'md'
}: Props) {
    const buttonClass = `${styles.button} ${styles[variant]} ${styles[size]} ${className ?? ''}`;

    if (href && !disabled) {
        return (
            <Link href={href} className={buttonClass}>
                <span className={styles.content}>{children}</span>
                <span className={styles.glitch}></span>
                <span className={styles.border}></span>
            </Link>
        );
    }

    return (
        <button
            className={buttonClass}
            onClick={onClick}
            disabled={disabled}
        >
            <span className={styles.content}>{children}</span>
            <span className={styles.glitch}></span>
            <span className={styles.border}></span>
        </button>
    );
}
