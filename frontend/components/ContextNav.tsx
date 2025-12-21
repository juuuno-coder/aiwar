// 컨텍스트 네비게이션 컴포넌트 - 상황별 빠른 액션

'use client';

import { useRouter } from 'next/navigation';
import { GameContext, GameAction, getNextActions } from '@/lib/game-flow';
import CyberButton from './CyberButton';

interface ContextNavProps {
    context: GameContext;
    data?: any;
    onActionClick?: (action: GameAction) => void;
}

export default function ContextNav({ context, data, onActionClick }: ContextNavProps) {
    const router = useRouter();
    const actions = getNextActions(context, data);

    const handleClick = (action: GameAction) => {
        if (onActionClick) {
            onActionClick(action);
        }
        router.push(action.route);
    };

    if (actions.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 space-y-4">
            <h3 className="text-xl font-bold text-center text-white">
                다음 행동
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {actions.map((action) => (
                    <div
                        key={action.id}
                        className={`
              relative p-6 rounded-xl border-2 cursor-pointer
              transition-all duration-300 hover:scale-105
              ${action.priority === 1
                                ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500'
                                : 'bg-[var(--dark-card)] border-gray-700'
                            }
            `}
                        onClick={() => handleClick(action)}
                    >
                        {/* 우선순위 배지 */}
                        {action.priority === 1 && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                                추천
                            </div>
                        )}

                        {/* 아이콘 */}
                        <div className="text-5xl mb-3 text-center">
                            {action.icon}
                        </div>

                        {/* 제목 */}
                        <h4 className="text-lg font-bold text-center mb-2 text-white">
                            {action.label}
                        </h4>

                        {/* 설명 */}
                        {action.description && (
                            <p className="text-sm text-gray-400 text-center mb-4">
                                {action.description}
                            </p>
                        )}

                        {/* 버튼 (CyberButton으로 교체) */}
                        <div className="mt-auto pt-4">
                            <CyberButton
                                variant={action.priority === 1 ? 'primary' : 'outline'}
                                size="sm"
                                href={action.route}
                                className="w-full"
                            >
                                수행하기
                            </CyberButton>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
