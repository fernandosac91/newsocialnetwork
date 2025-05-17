/*
  Warnings:

  - Added the required column `username` to the `Circle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN "coverImage" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Circle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "description" TEXT,
    "communityId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Circle_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Circle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Insert existing circles with a generated username (lowercase name with hyphens + ID suffix)
INSERT INTO "new_Circle" ("communityId", "createdAt", "createdById", "description", "id", "name", "updatedAt", "username") 
SELECT 
    "communityId", 
    "createdAt", 
    "createdById", 
    "description", 
    "id", 
    "name", 
    "updatedAt", 
    LOWER(REPLACE(REPLACE(REPLACE("name", ' ', '-'), '.', ''), ',', '')) || '-' || SUBSTR("id", 1, 8) 
FROM "Circle";

DROP TABLE "Circle";
ALTER TABLE "new_Circle" RENAME TO "Circle";
CREATE UNIQUE INDEX "Circle_username_key" ON "Circle"("username");
CREATE INDEX "Circle_communityId_idx" ON "Circle"("communityId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
