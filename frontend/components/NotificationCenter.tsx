// 알림 센터 - 모든 보상 및 성취 알림 관리

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/custom/Button';

export type NotificationType = 'reward' | 'levelup' | 'card' | 'quest' | 'achievement' | 'warning' | 'error';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    icon: string;
    timestamp: string;
    read: boolean;
    data?: any;
}

interface NotificationCenterProps {
    onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationCenter({ onNotificationClick }: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showPanel, setShowPanel] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        const count = notifications.filter(n => !n.read).length;
        setUnreadCount(count);
    }, [notifications]);

    const loadNotifications = () => {
        if (typeof window === 'undefined') return;

        const saved = localStorage.getItem('notifications');
        if (saved) {
            setNotifications(JSON.parse(saved));
        }
    };

    const saveNotifications = (notifs: Notification[]) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('notifications', JSON.stringify(notifs));
        setNotifications(notifs);
    };

    const markAsRead = (id: string) => {
        const updated = notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        );
        saveNotifications(updated);
    };

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        saveNotifications(updated);
    };

    const clearAll = () => {
        saveNotifications([]);
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (onNotificationClick) {
            onNotificationClick(notification);
        }
    };

    const getTypeColor = (type: NotificationType): string => {
        const colors = {
            reward: 'text-yellow-400',
            levelup: 'text-purple-400',
            card: 'text-blue-400',
            quest: 'text-green-400',
            achievement: 'text-pink-400',
            warning: 'text-orange-400',
            error: 'text-red-400'
        };
        return colors[type];
    };

    const getTypeBg = (type: NotificationType): string => {
        const colors = {
            reward: 'bg-yellow-900/20 border-yellow-500/30',
            levelup: 'bg-purple-900/20 border-purple-500/30',
            card: 'bg-blue-900/20 border-blue-500/30',
            quest: 'bg-green-900/20 border-green-500/30',
            achievement: 'bg-pink-900/20 border-pink-500/30',
            warning: 'bg-orange-900/20 border-orange-500/30',
            error: 'bg-red-900/20 border-red-500/30'
        };
        return colors[type];
    };

    return (
        <>
            {/* 알림 버튼 */}
            <div className="relative">
                <button
                    onClick={() => setShowPanel(!showPanel)}
                    className="relative p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                    <span className="text-2xl">🔔</span>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* 알림 패널 */}
            {showPanel && (
                <>
                    {/* 배경 오버레이 */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setShowPanel(false)}
                    />

                    {/* 알림 패널 */}
                    <div className="fixed right-4 top-20 w-96 max-h-[600px] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                        {/* 헤더 */}
                        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">알림</h3>
                                <p className="text-xs text-gray-400">
                                    {unreadCount}개의 읽지 않은 알림
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {notifications.length > 0 && (
                                    <>
                                        <Button
                                            color="secondary"
                                            size="sm"
                                            onClick={markAllAsRead}
                                        >
                                            모두 읽음
                                        </Button>
                                        <Button
                                            color="secondary"
                                            size="sm"
                                            onClick={clearAll}
                                        >
                                            전체 삭제
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* 알림 목록 */}
                        <div className="overflow-y-auto max-h-[500px]">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">
                                    <div className="text-5xl mb-4">📭</div>
                                    <p>알림이 없습니다</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-800">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`
                        p-4 cursor-pointer transition-all
                        ${!notification.read ? 'bg-blue-900/10' : ''}
                        hover:bg-gray-800
                      `}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* 아이콘 */}
                                                <div className={`
                          text-3xl flex-shrink-0
                          ${getTypeColor(notification.type)}
                        `}>
                                                    {notification.icon}
                                                </div>

                                                {/* 내용 */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-sm truncate">
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.read && (
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-400 mb-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(notification.timestamp).toLocaleString('ko-KR')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

/**
 * 알림 추가 헬퍼 함수
 */
export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    if (typeof window === 'undefined') return;

    const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        read: false
    };

    const saved = localStorage.getItem('notifications');
    const notifications: Notification[] = saved ? JSON.parse(saved) : [];

    notifications.unshift(newNotification);

    // 최대 50개까지만 저장
    if (notifications.length > 50) {
        notifications.splice(50);
    }

    localStorage.setItem('notifications', JSON.stringify(notifications));

    // 커스텀 이벤트 발생 (다른 컴포넌트에서 감지 가능)
    window.dispatchEvent(new CustomEvent('notification-added'));
}
