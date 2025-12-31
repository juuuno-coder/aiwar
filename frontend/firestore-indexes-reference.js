// This file is for reference on how to configure Firestore rules/indexes
// for the Leaderboard feature to work efficiently.

// firestore.indexes.json
/*
{
  "indexes": [
    {
      "collectionGroup": "profile",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "level", "order": "DESCENDING" },
        { "fieldPath": "exp", "order": "DESCENDING" }
      ]
    }
  ]
}
*/
