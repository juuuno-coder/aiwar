'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Card } from '@/lib/types';

// 푸터 액션 버튼 설정
export interface FooterAction {
    label: string;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
    isDisabled?: boolean;
    isLoading?: boolean;
    onClick: () => void;
}

// 푸터 모드
export type FooterMode = 'default' | 'selection';

// 캐릭터 오버레이 설정
export interface CharacterOverlay {
    characterImage: string;               // 캐릭터 이미지 경로
    position: 'left' | 'right';          // 위치
    dialogue?: string;                    // 대사 (말풍선)
    emotion?: 'neutral' | 'happy' | 'serious' | 'surprised'; // 표정
    name?: string;                        // 캐릭터 이름
}

// 푸터 상태
export interface FooterState {
    // 현재 덱 (기본 모드에서 표시)
    deck: Card[];
    maxDeckSize: number;

    // 푸터 모드
    mode: FooterMode;

    // 선택 모드 슬롯 (선택 모드에서 사용)
    selectionSlots: Card[];
    maxSelectionSlots: number;
    selectionLabel?: string; // "2장 선택" 등

    // 왼쪽 영역: 네비게이션/전환 버튼
    leftNav?: {
        type: 'back' | 'menu' | 'custom';
        label?: string;
        onClick?: () => void;
    };

    // 오른쪽 영역: 메인 액션 버튼
    action?: FooterAction;

    // 오른쪽 영역: 보조 액션 버튼 (자동강화/자동합성 등)
    secondaryAction?: FooterAction;

    // 추가 정보 표시
    info?: {
        label: string;
        value: string;
        color?: string;
    }[];

    // 캐릭터 오버레이 (z-index 높게 푸터 위에 표시)
    characterOverlay?: CharacterOverlay;

    // 푸터 표시 여부
    visible: boolean;

    // 덱 슬롯 표시 여부 (강화/합성 등에서 숨김) - 하위 호환
    showDeckSlots: boolean;
}

interface FooterContextType {
    state: FooterState;

    // 덱 관리 (기본 모드)
    setDeck: (cards: Card[]) => void;
    addToDeck: (card: Card) => boolean;
    removeFromDeck: (cardId: string) => void;
    clearDeck: () => void;

    // 선택 모드 관리
    setSelectionMode: (maxSlots: number, label?: string) => void;
    addToSelection: (card: Card) => boolean;
    removeFromSelection: (cardId: string) => void;
    reorderSelection: (cards: Card[]) => void;
    clearSelection: () => void;
    exitSelectionMode: () => void;

    // 액션 버튼 설정
    setAction: (action: FooterAction | undefined) => void;
    setSecondaryAction: (action: FooterAction | undefined) => void;

    // 네비게이션 설정
    setLeftNav: (nav: FooterState['leftNav']) => void;

    // 추가 정보 설정
    setInfo: (info: FooterState['info']) => void;

    // 캐릭터 오버레이 설정
    setCharacterOverlay: (overlay: CharacterOverlay) => void;
    clearCharacterOverlay: () => void;

    // 푸터 표시/숨김
    showFooter: () => void;
    hideFooter: () => void;

    // 덱 슬롯 표시/숨김 (하위 호환)
    showDeckSlots: () => void;
    hideDeckSlots: () => void;

    // 전체 상태 초기화
    resetFooter: () => void;
}

const defaultState: FooterState = {
    deck: [],
    maxDeckSize: 5,
    mode: 'default',
    selectionSlots: [],
    maxSelectionSlots: 5,
    selectionLabel: undefined,
    visible: true,
    showDeckSlots: false,
};

const FooterContext = createContext<FooterContextType | undefined>(undefined);

export function FooterProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<FooterState>(defaultState);

    // ============================================
    // 덱 관리 (기본 모드)
    // ============================================
    const setDeck = useCallback((cards: Card[]) => {
        setState(prev => ({ ...prev, deck: cards.slice(0, prev.maxDeckSize) }));
    }, []);

    const addToDeck = useCallback((card: Card): boolean => {
        let added = false;
        setState(prev => {
            if (prev.deck.length < prev.maxDeckSize && !prev.deck.find(c => c.id === card.id)) {
                added = true;
                return { ...prev, deck: [...prev.deck, card] };
            }
            return prev;
        });
        return added;
    }, []);

    const removeFromDeck = useCallback((cardId: string) => {
        setState(prev => ({
            ...prev,
            deck: prev.deck.filter(c => c.id !== cardId)
        }));
    }, []);

    const clearDeck = useCallback(() => {
        setState(prev => ({ ...prev, deck: [] }));
    }, []);

    // ============================================
    // 선택 모드 관리
    // ============================================
    const setSelectionMode = useCallback((maxSlots: number, label?: string) => {
        setState(prev => ({
            ...prev,
            mode: 'selection',
            selectionSlots: [],
            maxSelectionSlots: maxSlots,
            selectionLabel: label || `${maxSlots}장 선택`,
            showDeckSlots: false, // 선택 모드에서는 덱 슬롯 숨김
        }));
    }, []);

    const addToSelection = useCallback((card: Card): boolean => {
        let added = false;
        setState(prev => {
            if (prev.mode === 'selection' &&
                prev.selectionSlots.length < prev.maxSelectionSlots &&
                !prev.selectionSlots.find(c => c.id === card.id)) {
                added = true;
                return { ...prev, selectionSlots: [...prev.selectionSlots, card] };
            }
            return prev;
        });
        return added;
    }, []);

    const removeFromSelection = useCallback((cardId: string) => {
        setState(prev => ({
            ...prev,
            selectionSlots: prev.selectionSlots.filter(c => c.id !== cardId)
        }));
    }, []);
    const reorderSelection = useCallback((cards: Card[]) => {
        setState(prev => ({
            ...prev,
            selectionSlots: cards
        }));
    }, []);
    const clearSelection = useCallback(() => {
        setState(prev => ({ ...prev, selectionSlots: [] }));
    }, []);

    const exitSelectionMode = useCallback(() => {
        setState(prev => ({
            ...prev,
            mode: 'default',
            selectionSlots: [],
            selectionLabel: undefined,
            showDeckSlots: true,
            secondaryAction: undefined,
        }));
    }, []);

    // ============================================
    // 액션 버튼 설정
    // ============================================
    const setAction = useCallback((action: FooterAction | undefined) => {
        setState(prev => ({ ...prev, action }));
    }, []);

    const setSecondaryAction = useCallback((action: FooterAction | undefined) => {
        setState(prev => ({ ...prev, secondaryAction: action }));
    }, []);

    // ============================================
    // 네비게이션/정보 설정
    // ============================================
    const setLeftNav = useCallback((leftNav: FooterState['leftNav']) => {
        setState(prev => ({ ...prev, leftNav }));
    }, []);

    const setInfo = useCallback((info: FooterState['info']) => {
        setState(prev => ({ ...prev, info }));
    }, []);

    // ============================================
    // 캐릭터 오버레이 설정
    // ============================================
    const setCharacterOverlay = useCallback((overlay: CharacterOverlay) => {
        setState(prev => ({ ...prev, characterOverlay: overlay }));
    }, []);

    const clearCharacterOverlay = useCallback(() => {
        setState(prev => ({ ...prev, characterOverlay: undefined }));
    }, []);

    // ============================================
    // 표시 제어
    // ============================================
    const showFooter = useCallback(() => {
        setState(prev => ({ ...prev, visible: true }));
    }, []);

    const hideFooter = useCallback(() => {
        setState(prev => ({ ...prev, visible: false }));
    }, []);

    const showDeckSlotsFunc = useCallback(() => {
        setState(prev => ({ ...prev, showDeckSlots: true }));
    }, []);

    const hideDeckSlotsFunc = useCallback(() => {
        setState(prev => ({ ...prev, showDeckSlots: false }));
    }, []);

    const resetFooter = useCallback(() => {
        setState(defaultState);
    }, []);

    return (
        <FooterContext.Provider value={{
            state,
            setDeck,
            addToDeck,
            removeFromDeck,
            clearDeck,
            setSelectionMode,
            addToSelection,
            removeFromSelection,
            reorderSelection,
            clearSelection,
            exitSelectionMode,
            setAction,
            setSecondaryAction,
            setLeftNav,
            setInfo,
            setCharacterOverlay,
            clearCharacterOverlay,
            showFooter,
            hideFooter,
            showDeckSlots: showDeckSlotsFunc,
            hideDeckSlots: hideDeckSlotsFunc,
            resetFooter,
        }}>
            {children}
        </FooterContext.Provider>
    );
}

export function useFooter() {
    const context = useContext(FooterContext);
    if (!context) {
        throw new Error('useFooter must be used within a FooterProvider');
    }
    return context;
}
