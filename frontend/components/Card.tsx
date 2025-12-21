import React from 'react';
import Image from 'next/image';
import styles from '@/components/Card.module.css';
import { CardData } from '@/types/card';

interface CardProps {
    card: CardData;
    onClick?: (cardId: string) => void;
    selected?: boolean;
}

export default function Card({ card, onClick, selected }: CardProps) {
    const handleClick = () => {
        if (onClick) onClick(card.id);
    };

    return (
        <div
            className={`${styles.card} ${selected ? styles.selected : ''}`}
            onClick={handleClick}
        >
            <Image src={card.imageUrl} alt={card.name} width={120} height={168} className={styles.image} />
            <div className={styles.info}>
                <h4 className={styles.name}>{card.name}</h4>
                <p className={styles.stats}>⚔️ {card.attack} / 🛡️ {card.defense}</p>
            </div>
        </div>
    );
}
