import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Card as CardType } from '@/lib/types';
import { CardData } from '@/types/card';
interface GameState {
    playerDeck: CardData[];
    playerHand: CardData[];
    opponentHand: CardData[];
    resources: {
        tokens: number;
        coins: number;
        level: number;
        wins: number;
    };
    currentTurn: 'player' | 'opponent';
    selectedCardId: string | null;
}

interface GameContextProps extends GameState {
    drawCard: () => void;
    playCard: (cardId: string) => void;
    endTurn: () => void;
    attack: (cardId: string) => void;
    equip: (cardId: string) => void;
    selectCard: (cardId: string) => void;
    previewCard: CardType | null;
    setPreviewCard: (card: CardType | null) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within GameProvider');
    }
    return context;
};

// Helper to generate placeholder cards
const generatePlaceholderCards = (count: number): CardData[] => {
    const cards: CardData[] = [];
    for (let i = 0; i < count; i++) {
        cards.push({
            id: `card-${i}`,
            name: `Card ${i + 1}`,
            attack: Math.floor(Math.random() * 5) + 1,
            defense: Math.floor(Math.random() * 5) + 1,
            imageUrl: '/card_placeholder_1765931222851.png',
        });
    }
    return cards;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const [playerDeck, setPlayerDeck] = useState<CardData[]>([]);
    const [playerHand, setPlayerHand] = useState<CardData[]>([]);
    const [opponentHand, setOpponentHand] = useState<CardData[]>([]);
    const [resources, setResources] = useState({ tokens: 1000, coins: 500, level: 1, wins: 0 });
    const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [previewCard, setPreviewCard] = useState<CardType | null>(null);

    // Initialise game state on mount (no persistence for now)
    useEffect(() => {
        const deck = generatePlaceholderCards(20);
        setPlayerDeck(deck);
        setPlayerHand(deck.slice(0, 5));
        const oppDeck = generatePlaceholderCards(20);
        setOpponentHand(oppDeck.slice(0, 5));
    }, []);

    const drawCard = () => {
        if (playerDeck.length === 0) return;
        const [next, ...rest] = playerDeck;
        setPlayerDeck(rest);
        setPlayerHand(prev => [...prev, next]);
    };

    const playCard = (cardId: string) => {
        const card = playerHand.find(c => c.id === cardId);
        if (!card) return;
        setPlayerHand(prev => prev.filter(c => c.id !== cardId));
        setSelectedCardId(null);
    };

    const endTurn = () => {
        setCurrentTurn(prev => (prev === 'player' ? 'opponent' : 'player'));
        setSelectedCardId(null);
        if (currentTurn === 'player') {
            setTimeout(() => {
                if (opponentHand.length === 0) return;
                const randomIdx = Math.floor(Math.random() * opponentHand.length);
                const card = opponentHand[randomIdx];
                console.log('Opponent plays', card.name);
                setOpponentHand(prev => prev.filter(c => c.id !== card.id));
                setCurrentTurn('player');
            }, 500);
        }
    };

    const attack = (cardId: string) => {
        const card = playerHand.find(c => c.id === cardId);
        if (card) {
            console.log(`Player attacks with ${card.name}`);
        }
    };

    const equip = (cardId: string) => {
        console.log(`Equip action on ${cardId}`);
    };

    const selectCard = (cardId: string) => {
        setSelectedCardId(cardId);
    };

    const value: GameContextProps = {
        playerDeck,
        playerHand,
        opponentHand,
        resources,
        currentTurn,
        selectedCardId,
        drawCard,
        playCard,
        endTurn,
        attack,
        equip,
        selectCard,
        previewCard,
        setPreviewCard,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
