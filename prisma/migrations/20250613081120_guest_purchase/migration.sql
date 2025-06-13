/*
  Warnings:

  - You are about to drop the `Achat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Achat";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "GuestPurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
