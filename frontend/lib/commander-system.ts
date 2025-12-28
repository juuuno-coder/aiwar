import { InventoryCard, addCardToInventory, removeCardFromInventory } from './inventory-system';
import { db } from './firebase';
import { doc, updateDoc, increment, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { getUserId } from './firebase-auth';

/**
 * Commander Training Result
 */
export interface TrainingResult {
    success: boolean;
    message: string;
    affinityGained?: number;
    levelUp?: boolean;
    statIncreases?: {
        efficiency?: number;
        creativity?: number;
        function?: number;
    };
    newCard?: InventoryCard;
}

/**
 * Train a Commander Card
 * Increases affinity. If affinity >= 100, triggers Level Up.
 * Cost: TBD (Current implementation is free or costs Coins in UI)
 */
export async function trainCommander(card: InventoryCard): Promise<TrainingResult> {
    if (card.rarity !== 'commander') {
        return { success: false, message: 'Only Commanders can be trained.' };
    }

    if (!db) {
        return { success: false, message: 'Database not initialized.' };
    }

    try {
        const userId = await getUserId();
        const cardRef = doc(db, 'users', userId, 'inventory', card.instanceId);

        // 1. Calculate Affinity Gain
        // Random gain 5-15 based on "interaction"
        const affinityGain = Math.floor(Math.random() * 11) + 5;
        let newAffinity = (card.affinity || 0) + affinityGain;
        let levelUp = false;
        let statIncreases: any = {};
        let newLevel = card.level || 1;
        let newStats = { ...card.stats };

        // 2. Check Level Up
        if (newAffinity >= 100) {
            levelUp = true;
            newAffinity = newAffinity - 100; // Reset or carry over? Usually reset for next level or carry over. Let's carry over.
            newLevel += 1;

            // 3. Random Stat Increase (+1 to +3 for each main stat)
            // Efficiency
            const incEff = Math.floor(Math.random() * 3) + 1;
            const incCre = Math.floor(Math.random() * 3) + 1;
            const incFun = Math.floor(Math.random() * 3) + 1;

            newStats.efficiency = (newStats.efficiency || 0) + incEff;
            newStats.creativity = (newStats.creativity || 0) + incCre;
            newStats.function = (newStats.function || 0) + incFun;
            newStats.totalPower = (newStats.totalPower || 0) + incEff + incCre + incFun;

            statIncreases = {
                efficiency: incEff,
                creativity: incCre,
                function: incFun
            };
        }

        // 4. Update Database
        const updates: any = {
            affinity: newAffinity,
            level: newLevel,
            stats: newStats
        };

        if (card.instanceId.startsWith('commander-')) {
            // Handle "Virtual" Inventory Cards from LocalStorage/Fake data? 
            // If card is from `loadCards` ultra logic, it doesn't exist in Firestore 'inventory'.
            // We must SAVE it to Firestore first if it was a virtual card.
            // But valid inventory cards have valid instanceIds from Firestore.
            // Assuming this is a real card in inventory.
        }

        await updateDoc(cardRef, updates);

        const updatedCard = {
            ...card,
            ...updates
        };

        return {
            success: true,
            message: levelUp ? `Level Up! Lv.${newLevel}` : `Affinity +${affinityGain}`,
            affinityGained: affinityGain,
            levelUp,
            statIncreases,
            newCard: updatedCard
        };

    } catch (error) {
        console.error("Training Error:", error);
        return { success: false, message: 'Training failed.' };
    }
}

/**
 * Apply Research Bonus to All Commander Cards
 * Called when a research is completed.
 */
export async function applyResearchStatBonus(categoryId: string, newLevel: number): Promise<{ success: boolean; message: string; count: number }> {
    if (!db) return { success: false, message: 'Database not initialized.', count: 0 };

    // Mapping: Research Category -> Commander Stat
    const statMapping: Record<string, 'efficiency' | 'creativity' | 'function'> = {
        'efficiency': 'efficiency',
        'insight': 'creativity',
        'mastery': 'function'
    };

    const targetStat = statMapping[categoryId];
    if (!targetStat) {
        return { success: true, message: 'No direct stats for this research.', count: 0 };
    }

    try {
        const userId = await getUserId();
        const inventoryRef = collection(db, 'users', userId, 'inventory');
        const q = query(inventoryRef, where('rarity', '==', 'commander'));
        const snaps = await getDocs(q);

        if (snaps.empty) {
            return { success: true, message: 'No commanders found to upgrade.', count: 0 };
        }

        const batch = writeBatch(db);
        let count = 0;
        const bonusAmount = 3; // +3 stat per research level

        snaps.forEach(docSnap => {
            const card = docSnap.data() as InventoryCard;
            const newStats = { ...card.stats };

            // Update specific stat
            newStats[targetStat] = (newStats[targetStat] || 0) + bonusAmount;

            // Recalculate total power
            newStats.totalPower = (newStats.efficiency || 0) + (newStats.creativity || 0) + (newStats.function || 0);

            batch.update(docSnap.ref, {
                stats: newStats,
                power: newStats.totalPower // Sync top-level power alias if exists
            });
            count++;
        });

        await batch.commit();

        return {
            success: true,
            message: `Cmdr Stat Boost: ${targetStat.toUpperCase()} +${bonusAmount}`,
            count
        };

    } catch (error) {
        console.error("Failed to apply research bonus:", error);
        return { success: false, message: 'Failed to update commander stats.', count: 0 };
    }
}
