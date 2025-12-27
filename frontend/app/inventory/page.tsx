'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/my-cards');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <p>Redirecting to My Cards...</p>
        </div>
    );
}
