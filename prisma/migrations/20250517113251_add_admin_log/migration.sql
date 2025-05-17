/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ChatMessage` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "userId" TEXT,
    "details" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT,
    "circleId" TEXT,
    CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChatMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ChatMessage_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ChatMessage" ("content", "id", "receiverId", "senderId", "sentAt") SELECT "content", "id", "receiverId", "senderId", "sentAt" FROM "ChatMessage";
DROP TABLE "ChatMessage";
ALTER TABLE "new_ChatMessage" RENAME TO "ChatMessage";
CREATE INDEX "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");
CREATE INDEX "ChatMessage_receiverId_idx" ON "ChatMessage"("receiverId");
CREATE INDEX "ChatMessage_circleId_idx" ON "ChatMessage"("circleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "AdminLog_userId_idx" ON "AdminLog"("userId");

-- CreateIndex
CREATE INDEX "AdminLog_action_idx" ON "AdminLog"("action");

-- CreateIndex
CREATE INDEX "AdminLog_timestamp_idx" ON "AdminLog"("timestamp");

-- CreateIndex
CREATE INDEX "Circle_communityId_idx" ON "Circle"("communityId");

-- CreateIndex
CREATE INDEX "CircleMember_userId_idx" ON "CircleMember"("userId");

-- CreateIndex
CREATE INDEX "CircleMember_circleId_idx" ON "CircleMember"("circleId");

-- CreateIndex
CREATE INDEX "Event_communityId_idx" ON "Event"("communityId");

-- CreateIndex
CREATE INDEX "EventAttendee_userId_idx" ON "EventAttendee"("userId");

-- CreateIndex
CREATE INDEX "EventAttendee_eventId_idx" ON "EventAttendee"("eventId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
