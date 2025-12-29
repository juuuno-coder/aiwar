"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Card } from '@/lib/types';
import CardDetailModal from './CardDetailModal';

interface CardModalContextType {
    openCardModal: (card: Card) => void;
    closeCardModal: () => void;
}

const CardModalContext = createContext<CardModalContextType | undefined>(undefined);

export function CardModalProvider({ children }: { children: ReactNode }) {
    const [activeCard, setActiveCard] = useState<Card | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const openCardModal = (card: Card) => {
        setActiveCard(card);
        setIsOpen(true);
    };

    const closeCardModal = () => {
        setIsOpen(false);
        // Add a small delay before clearing card to allow close animation if needed
        setTimeout(() => setActiveCard(null), 200);
    };

    return (
        <CardModalContext.Provider value={{ openCardModal, closeCardModal }}>
            {children}
            <CardDetailModal
                card={activeCard}
                isOpen={isOpen}
                onClose={closeCardModal}
            />
        </CardModalContext.Provider>
    );
}

export function useCardModal() {
    const context = useContext(CardModalContext);
    if (context === undefined) {
        throw new Error('useCardModal must be used within a CardModalProvider');
    }
    return context;
}
