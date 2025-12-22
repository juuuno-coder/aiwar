// 게임 초기화 유틸리티

import { storage, generateCard } from './utils';
import { Card } from './types';

// 신규 플레이어 초기화
export function initializeNewPlayer(): void {
    // 유니크 유닛 타이머는 메인 페이지에서 수동으로 시작
    console.log('게임 초기화 완료');
}

// 게임 데이터 리셋
export function resetGameData(): void {
    if (confirm('정말로 게임 데이터를 초기화하시겠습니까? 모든 진행 상황이 삭제됩니다.')) {
        localStorage.clear();
        window.location.reload();
    }
}
