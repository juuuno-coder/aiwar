import { useEffect } from 'react';

/**
 * ESC 키를 눌렀을 때 모달을 닫는 공통 훅
 * @param isOpen - 모달이 열려있는지 여부
 * @param onClose - 모달을 닫는 함수
 */
export function useEscapeKey(isOpen: boolean, onClose: () => void) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
}
