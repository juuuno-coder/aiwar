'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/custom/Button';
import avatarsData from '@/data/avatars.json';

interface AvatarSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    currentAvatar: string;
    onSelect: (avatarUrl: string) => void;
}

export default function AvatarSelector({ isOpen, onClose, currentAvatar, onSelect }: AvatarSelectorProps) {
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

    const handleSelect = () => {
        onSelect(selectedAvatar);
        localStorage.setItem('user_avatar', selectedAvatar);
        onClose();
    };

    if (!isOpen) return null;

    const groupedAvatars = avatarsData.avatars.reduce((acc, avatar) => {
        if (!acc[avatar.faction]) {
            acc[avatar.faction] = [];
        }
        acc[avatar.faction].push(avatar);
        return acc;
    }, {} as Record<string, typeof avatarsData.avatars>);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 bg-[#0a0a0a] border-purple-500/30">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-gradient">아바타 선택</h2>
                    <Button color="danger" size="sm" onClick={onClose}>
                        닫기
                    </Button>
                </div>

                <div className="space-y-8">
                    {Object.entries(groupedAvatars).map(([faction, avatars]) => (
                        <div key={faction}>
                            <h3 className="text-xl font-bold text-white mb-4">{faction} 계열</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {avatars.map((avatar) => (
                                    <div
                                        key={avatar.id}
                                        onClick={() => setSelectedAvatar(avatar.imageUrl)}
                                        className={`cursor-pointer transition-all rounded-lg p-4 ${selectedAvatar === avatar.imageUrl
                                                ? 'ring-4 ring-purple-500 bg-purple-500/20 scale-105'
                                                : 'bg-white/5 hover:bg-white/10 hover:scale-105'
                                            }`}
                                    >
                                        <div className="relative w-full aspect-square mb-3">
                                            <Image
                                                src={avatar.imageUrl}
                                                alt={avatar.name}
                                                fill
                                                className="object-cover rounded-lg"
                                            />
                                        </div>
                                        <p className="text-sm font-bold text-white text-center">{avatar.name}</p>
                                        <p className="text-xs text-gray-400 text-center mt-1">{avatar.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <Button color="secondary" onClick={onClose}>
                        취소
                    </Button>
                    <Button color="success" onClick={handleSelect}>
                        선택 완료
                    </Button>
                </div>
            </Card>
        </div>
    );
}
