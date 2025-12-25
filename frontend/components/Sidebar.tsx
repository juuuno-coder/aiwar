import { useState } from 'react';
import Image from 'next/image';
import avatarPlaceholder from '@/public/avatar_placeholder_1765931243779.png';
import { useUser } from '@/context/UserContext';
import {
    Card,
    CardBody,
} from "@/components/ui/custom/Card";
import { Avatar } from "@/components/ui/custom/Avatar";
import { Progress } from "@/components/ui/custom/Progress";
import { Button } from "@/components/ui/custom/Button";
import { Divider } from "@/components/ui/custom/Divider";
import { Tooltip } from "@/components/ui/custom/Tooltip";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sword,
    Shield,
    ShoppingCart,
    Zap,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Settings,
    Sparkles,
    BookOpen,
    FlaskConical,
    User,
    Heart,
    Trophy,
} from "lucide-react";
import { useRouter, usePathname } from 'next/navigation';
import SettingsModal from './SettingsModal';
import CommanderProfileModal from './CommanderProfileModal';
import { useTranslation } from '@/context/LanguageContext';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const { coins, tokens, level, experience } = useUser();
    // const [isOpen, setIsOpen] = useState(true); // Lifted to LayoutWrapper
    const router = useRouter();
    const pathname = usePathname();
    const expPercentage = Math.min(100, (experience / (level * 100)) * 100);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const { t, language } = useTranslation();
    const navItems = [
        { name: language === 'ko' ? '내 카드' : 'My Cards', path: '/my-cards', icon: <Shield size={18} />, color: "primary" },
        { name: language === 'ko' ? '생성' : 'Generation', path: '/generation', icon: <Zap size={18} />, color: "warning" },
        { name: language === 'ko' ? 'AI 군단' : 'AI Factions', path: '/factions', icon: <Trophy size={18} />, color: "secondary" },
        { name: language === 'ko' ? '유니크 생성' : 'Unique Creation', path: '/unique-create', icon: <Sparkles size={18} />, color: "success" },
        { name: language === 'ko' ? '강화' : 'Enhancement', path: '/enhance', icon: <Heart size={18} />, color: "danger" },
        { name: language === 'ko' ? '합성' : 'Fusion', path: '/fusion', icon: <FlaskConical size={18} />, color: "secondary" },
        { name: language === 'ko' ? '도감' : 'Encyclopedia', path: '/encyclopedia', icon: <BookOpen size={18} />, color: "default" },
    ];
    // navItemsFixed is now same as navItems
    const navItemsFixed = navItems;


    return (
        <motion.aside
            animate={{ width: isOpen ? 280 : 80 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-20 bottom-0 z-40 p-4 select-none"
        >
            <Card
                className="h-full bg-black/40 backdrop-blur-2xl border-l border-white/5 shadow-2xl overflow-hidden rounded-lg"
            >
                {/* 토글 버튼 */}
                <Button
                    size="sm"
                    variant="light"
                    onPress={onToggle}
                    className="absolute top-2 left-1 z-50 text-gray-500 hover:text-white min-w-0 px-2"
                >
                    {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </Button>

                <CardBody className="p-0 flex flex-col h-full overflow-hidden">
                    {/* 프로필 섹션 */}
                    <div className="pt-14 pb-6 flex flex-col items-center px-6">
                        <motion.div
                            animate={{
                                scale: isOpen ? 1 : 0.9,
                                marginBottom: isOpen ? 0 : -10
                            }}
                            className="relative transition-all duration-300 cursor-pointer group"
                            onClick={() => setIsProfileOpen(true)}
                        >
                            <div className="absolute -inset-2 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-full blur-lg opacity-30 group-hover:opacity-60 transition-opacity" />
                            <Avatar
                                src={typeof window !== 'undefined' ? localStorage.getItem('user_avatar') || avatarPlaceholder.src : avatarPlaceholder.src}
                                className={`transition-all duration-300 text-large border-2 border-purple-500/50 ${isOpen ? 'w-16 h-16' : 'w-10 h-10'}`}
                                isBordered
                                color="secondary"
                            />
                            <div className={`absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center border-2 border-black font-black text-white shadow-lg transition-all duration-300 ${isOpen ? 'w-6 h-6 text-[10px]' : 'w-4 h-4 text-[8px]'}`}>
                                {level}
                            </div>
                            {!isOpen && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
                                    <User size={14} className="text-white" />
                                </div>
                            )}
                        </motion.div>

                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-4 text-center"
                                >
                                    <h2 className="text-sm font-black text-white orbitron tracking-tight">{t('sidebar.commander')}_7429</h2>
                                    <p className="text-[10px] text-purple-400 font-bold tracking-[0.2em] uppercase opacity-80">{t('sidebar.eliteCommander')}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <Divider className="bg-white/5" />

                                {/* EXP 바 */}
                                <div className="px-6 py-4">
                                    <div className="flex justify-between items-center mb-2 px-1">
                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{language === 'ko' ? '경험치' : 'Experience'}</span>
                                        <span className="text-[9px] text-purple-400 font-mono">{experience} / {level * 100} PX</span>
                                    </div>
                                    <Progress
                                        size="sm"
                                        value={expPercentage}
                                        color="secondary"
                                        className="h-1"
                                        classNames={{
                                            track: "bg-white/5",
                                            indicator: "shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                        }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Divider className="bg-white/5" />

                    {/* 내비게이션 */}
                    <div className="flex-1 p-2 space-y-2 overflow-y-auto no-scrollbar">
                        {navItemsFixed.map((item) => (
                            <Tooltip key={item.path} content={item.name} placement="left" isDisabled={isOpen}>
                                <Button
                                    fullWidth
                                    variant="light"
                                    color="default"
                                    onPress={() => router.push(item.path)}
                                    className={`
                                        h-12 !justify-start px-4 transition-all relative overflow-hidden
                                        ${pathname.startsWith(item.path) ? "font-bold text-white bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"}
                                        ${!isOpen ? "min-w-0 px-0 justify-center" : ""}
                                    `}
                                >
                                    {pathname.startsWith(item.path) && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className={
                                                item.color === 'primary' ? 'absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] rounded-l-md' :
                                                    item.color === 'success' ? 'absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)] rounded-l-md' :
                                                        item.color === 'danger' ? 'absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.8)] rounded-l-md' :
                                                            item.color === 'warning' ? 'absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.8)] rounded-l-md' :
                                                                'absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-zinc-400 shadow-[0_0_12px_rgba(161,161,170,0.8)] rounded-l-md'
                                            }
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                    <div className="relative z-10 flex items-center w-full">
                                        <div className={`${pathname.startsWith(item.path) ? "text-white" : "opacity-60"}`}>
                                            {item.icon}
                                        </div>
                                        {isOpen && <span className="ml-2 orbitron text-xs">{item.name}</span>}
                                    </div>
                                </Button>
                            </Tooltip>
                        ))}
                    </div>

                    <Divider className="bg-white/5" />

                    <div className="p-4 space-y-2 pb-8">
                        <div className="flex gap-2">
                            <Button
                                fullWidth
                                variant="light"
                                color="default"
                                onPress={() => setIsSettingsOpen(true)}
                                className={`h-10 text-gray-400 hover:text-white hover:bg-white/5 ${!isOpen ? "min-w-0 px-0 justify-center" : "!justify-start"}`}
                                startContent={<Settings size={18} />}
                            >
                                {isOpen && <span className="ml-2 font-bold text-xs orbitron">{language === 'ko' ? '시스템 설정' : 'SYSTEM SETTINGS'}</span>}
                            </Button>
                        </div>
                        <Button
                            fullWidth
                            variant="light"
                            color="danger"
                            onPress={async () => {
                                try {
                                    const { signOutUser } = await import('@/lib/firebase-auth');
                                    await signOutUser();
                                    router.push('/login');
                                } catch (error) {
                                    console.error('Logout failed:', error);
                                }
                            }}
                            className={`h-10 text-gray-400 hover:text-red-400 ${!isOpen ? "min-w-0 px-0 justify-center" : "!justify-start"}`}
                            startContent={<LogOut size={18} />}
                        >
                            {isOpen && <span className="ml-2 font-bold text-xs orbitron">{language === 'ko' ? '시스템 로그아웃' : 'SYSTEM LOGOUT'}</span>}
                        </Button>
                        {isOpen && (
                            <div className="text-center pt-2">
                                <span className="text-[8px] text-gray-600 font-bold orbitron">AI WAR v1.2.0-PREMIUM</span>
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            <CommanderProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </motion.aside >
    );
}
