/*
  Warnings:

  - You are about to drop the column `isActive` on the `ApiKey` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "hashedKey" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsed" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "permissions" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "rateLimit" INTEGER NOT NULL DEFAULT 100,
    "rateLimitWindow" INTEGER NOT NULL DEFAULT 60
);
INSERT INTO "new_ApiKey" ("createdAt", "hashedKey", "id", "key", "lastUsed", "name", "permissions", "rateLimit", "rateLimitWindow", "role") SELECT "createdAt", "hashedKey", "id", "key", "lastUsed", "name", "permissions", "rateLimit", "rateLimitWindow", "role" FROM "ApiKey";
DROP TABLE "ApiKey";
ALTER TABLE "new_ApiKey" RENAME TO "ApiKey";
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");
CREATE UNIQUE INDEX "ApiKey_hashedKey_key" ON "ApiKey"("hashedKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
