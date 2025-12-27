'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useNotification, NotificationItem, NotificationType } from '@/context/NotificationContext';
import { Bell, X, CheckCircle2, AlertCircle, Info, ArrowUpCircle, Zap, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

import { useRouter } from 'next/navigation';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
    const { notifications, markAllAsRead, clearNotifications } = useNotification();
    const router = useRouter();

    const handleNotificationClick = (link?: string) => {
        if (link) {
            router.push(link);
            onClose();
        }
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'success': return <CheckCircle2 size={16} className="text-green-500" />;
            case 'error': return <AlertCircle size={16} className="text-red-500" />;
            case 'levelup': return <ArrowUpCircle size={16} className="text-cyan-500" />;
            case 'enhance': return <Zap size={16} className="text-amber-500" />;
            case 'fusion': return <Box size={16} className="text-purple-500" />;
            case 'warning': return <AlertCircle size={16} className="text-orange-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    const getBgColor = (type: NotificationType) => {
        switch (type) {
            case 'success': return 'bg-green-500/10 border-green-500/20';
            case 'error': return 'bg-red-500/10 border-red-500/20';
            case 'levelup': return 'bg-cyan-500/10 border-cyan-500/20';
            case 'enhance': return 'bg-amber-500/10 border-amber-500/20';
            case 'fusion': return 'bg-purple-500/10 border-purple-500/20';
            case 'warning': return 'bg-orange-500/10 border-orange-500/20';
            default: return 'bg-white/5 border-white/10';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile mostly, allows clicking outside to close */}
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />

                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="fixed top-16 right-4 md:right-20 z-50 w-[360px] max-w-[90vw] bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-2">
                                <Bell size={18} className="text-white" />
                                <h3 className="font-bold text-white orbitron">알림 센터</h3>
                                <span className="bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full">
                                    {notifications.length}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-white/40 hover:text-cyan-400 transition-colors"
                                >
                                    모두 읽음
                                </button>
                                <div className="w-px h-3 bg-white/20" />
                                <button
                                    onClick={clearNotifications}
                                    className="text-xs text-white/40 hover:text-red-400 transition-colors"
                                >
                                    지우기
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                            {notifications.length === 0 ? (
                                <div className="text-center py-10 text-white/30">
                                    <Bell size={40} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">새로운 알림이 없습니다.</p>
                                </div>
                            ) : (
                                notifications.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleNotificationClick(item.link)}
                                        className={cn(
                                            "relative p-3 rounded-xl border transition-all hover:bg-white/5",
                                            item.link ? "cursor-pointer hover:border-white/30 active:scale-[0.98]" : "",
                                            getBgColor(item.type),
                                            !item.read && "border-l-4 border-l-cyan-500"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                {getIcon(item.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className={cn(
                                                        "text-sm font-bold truncate pr-2",
                                                        !item.read ? "text-white" : "text-white/70"
                                                    )}>
                                                        {item.title}
                                                    </h4>
                                                    <span className="text-[10px] text-white/30 flex-shrink-0">
                                                        {formatDistanceToNow(item.timestamp, { addSuffix: true, locale: ko })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-white/50 leading-relaxed break-words">
                                                    {item.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
