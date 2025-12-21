// 타입 아이콘 및 정보 표시 컴포넌트

import { AIType } from '@/lib/types';
import { getTypeIcon, getTypeColor, getTypeName } from '@/lib/type-system';

interface TypeBadgeProps {
    type?: AIType;
    size?: 'sm' | 'md' | 'lg';
    showName?: boolean;
}

export default function TypeBadge({ type, size = 'md', showName = true }: TypeBadgeProps) {
    if (!type) return null;
    const icon = getTypeIcon(type);
    const color = getTypeColor(type);
    const name = getTypeName(type);

    const sizeClasses = {
        sm: 'text-sm px-2 py-1',
        md: 'text-base px-3 py-1.5',
        lg: 'text-lg px-4 py-2'
    };

    return (
        <div
            className={`inline-flex items-center gap-1.5 rounded-full font-bold ${sizeClasses[size]}`}
            style={{
                backgroundColor: `${color}20`,
                border: `2px solid ${color}`,
                color: color
            }}
        >
            <span>{icon}</span>
            {showName && <span>{name}</span>}
        </div>
    );
}

interface TypeAdvantageIndicatorProps {
    attackerType?: AIType;
    defenderType?: AIType;
}

export function TypeAdvantageIndicator({ attackerType, defenderType }: TypeAdvantageIndicatorProps) {
    const { hasTypeAdvantage } = require('@/lib/type-system');

    if (!attackerType || !defenderType || !hasTypeAdvantage(attackerType, defenderType)) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 text-yellow-400 font-bold animate-pulse">
            <span>⚡</span>
            <span>상성 우위! +30%</span>
            <span>⚡</span>
        </div>
    );
}
