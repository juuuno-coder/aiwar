"use client";

import Image from 'next/image';
import CyberButton from '@/components/CyberButton';
import { useRouter } from 'next/navigation';
import avatarPlaceholder from '@/public/avatar_placeholder_1765931243779.png';

export default function Header() {
    const router = useRouter();
    return (
        <header className="flex items-center justify-between px-6 py-4 bg-gray-800 text-white shadow-md">
            <div className="flex items-center space-x-3">
                <Image src={avatarPlaceholder} alt="Logo" width={40} height={40} className="rounded-full" />
                <h1 className="text-2xl font-bold">AI War</h1>
            </div>
            <nav className="space-x-4">
                <CyberButton onClick={() => router.push('/')}>홈</CyberButton>
                <CyberButton onClick={() => router.push('/story')}>스토리</CyberButton>
                <CyberButton onClick={() => router.push('/battle')}>전투</CyberButton>
                <CyberButton onClick={() => router.push('/pvp')}>PvP</CyberButton>
            </nav>
        </header>
    );
}
