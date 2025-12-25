# Real-time PvP System - Quick Start Guide

## 🎮 How to Access

1. **Navigate to Real-time PvP**:
   ```
   http://localhost:3000/pvp/realtime
   ```

2. **Or add a navigation link** to your main menu/footer

---

## 🚀 Quick Setup

### 1. Firebase Configuration

Make sure your `.env.local` has Firebase Realtime Database enabled:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url  # Important!
```

### 2. Firebase Realtime Database Rules

Set these security rules in Firebase Console:

```json
{
  "rules": {
    "matchmaking": {
      "$mode": {
        "$playerId": {
          ".write": "$playerId === auth.uid || true",
          ".read": true
        }
      }
    },
    "battles": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

> **Note**: The rules above are permissive for development. Tighten them for production!

---

## 🎯 How to Play

### Step 1: Choose Battle Mode
- **Sudden Death**: Quick 1-card battle (~2 min)
- **Tactics**: Strategic 5-card battle (~5 min)
- **Ambush**: Advanced with hidden cards (~5 min)

### Step 2: Start Matching
- System finds players within ±5 levels
- Automatic matching every 5 seconds
- Cancel anytime

### Step 3: Battle!
1. **Select** 5 cards from your deck
2. **Reveal** - See opponent's cards (15-20s)
3. **Order** - Arrange your battle sequence
4. **Combat** - Watch rounds unfold
5. **Results** - Collect rewards!

---

## 🏆 Rewards

### Winner
- **Sudden Death**: 200 coins, 50 XP
- **Tactics**: 500 coins, 100 XP
- **Ambush**: 800 coins, 150 XP
- **Plus**: 5 random cards from opponent!

### Loser
- Consolation rewards (30% of winner)
- **Loses**: 5 random common/rare cards

---

## 🔧 Testing Locally

To test with yourself:

1. Open two browser windows
2. Use incognito mode for second window
3. Both join matchmaking
4. System will match you together!

---

## 📝 Known Limitations

- Some lint errors remain (showAlert signature, UserContext structure)
- These don't affect functionality
- Can be fixed by updating Context interfaces

---

## 🎨 Future Enhancements

- Friend invite system
- Ranking/leaderboard
- Battle history
- In-game chat
- Tournament mode

---

Enjoy the battles! 🎮✨
