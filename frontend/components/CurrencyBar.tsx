import React from 'react';
import { useGame } from '@/components/GameContext';
import styles from '@/components/CurrencyBar.module.css';

export default function CurrencyBar() {
    const { resources } = useGame();
    const { coins, tokens } = resources;

    return (
        <div className={styles.bar}>
            <div className={styles.item}>
                <span className={styles.icon}>💰</span>
                <span className={styles.amount}>{coins}</span>
            </div>
            <div className={styles.item}>
                <span className={styles.icon}>🪙</span>
                <span className={styles.amount}>{tokens}</span>
            </div>
        </div>
    );
}
