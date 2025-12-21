"use client";
import styles from '@/components/GameBoard.module.css';
import Card from '@/components/Card';
import { useGame } from '@/components/GameContext';

import { motion, AnimatePresence } from 'framer-motion';

export default function GameBoard() {
    const {
        playerHand,
        opponentHand,
        selectedCardId,
        selectCard,
    } = useGame();

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { y: 50, opacity: 0, scale: 0.8 },
        show: { y: 0, opacity: 1, scale: 1 }
    };

    return (
        <div className={styles.boardContainer}>
            {/* Opponent Area */}
            <div className={styles.opponentArea}>
                <h2 className={styles.sectionTitle}>Opponent</h2>
                <motion.div
                    className={styles.cardRow}
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <AnimatePresence>
                        {opponentHand.map(card => (
                            <motion.div key={card.id} variants={cardVariants} layout>
                                <Card card={card} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Player Area */}
            <div className={styles.playerArea}>
                <h2 className={styles.sectionTitle}>Your Hand</h2>
                <motion.div
                    className={styles.cardRow}
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <AnimatePresence>
                        {playerHand.map(card => (
                            <motion.div
                                key={card.id}
                                variants={cardVariants}
                                layout
                                whileHover={{ y: -20, scale: 1.05, zIndex: 10, transition: { duration: 0.2 } }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Card
                                    card={card}
                                    onClick={selectCard}
                                    selected={selectedCardId === card.id}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
