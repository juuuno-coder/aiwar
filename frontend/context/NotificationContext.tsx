'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useFirebase } from '@/components/FirebaseProvider';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'levelup' | 'enhance' | 'fusion';

export interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    link?: string;
}

interface NotificationContextType {
    notifications: NotificationItem[];
    unreadCount: number;
    addNotification: (type: NotificationType, title: string, message: string, link?: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};

const MAX_NOTIFICATIONS = 50;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const { user, loading: authLoading } = useFirebase();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const getStorageKey = useCallback(() => {
        if (!user) return 'ai_war_notifications_guest';
        return `ai_war_notifications_${user.uid}`;
    }, [user]);

    // Load from local storage on mount or user change
    useEffect(() => {
        if (authLoading) return;

        if (typeof window !== 'undefined') {
            const key = getStorageKey();
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setNotifications(parsed);
                } catch (e) {
                    console.error("Failed to parse notifications", e);
                    setNotifications([]);
                }
            } else {
                setNotifications([]);
            }
        }
    }, [user?.uid, authLoading, getStorageKey]);

    // Save to local storage whenever notifications change
    useEffect(() => {
        if (authLoading) return;

        if (typeof window !== 'undefined') {
            const key = getStorageKey();
            localStorage.setItem(key, JSON.stringify(notifications));
            setUnreadCount(notifications.filter(n => !n.read).length);
        }
    }, [notifications, user?.uid, authLoading, getStorageKey]);

    const addNotification = (type: NotificationType, title: string, message: string, link?: string) => {
        const newItem: NotificationItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            type,
            title,
            message,
            timestamp: Date.now(),
            read: false,
            link
        };

        setNotifications(prev => {
            const updated = [newItem, ...prev];
            // Limit to MAX_NOTIFICATIONS
            return updated.slice(0, MAX_NOTIFICATIONS);
        });
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAllAsRead,
            clearNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
