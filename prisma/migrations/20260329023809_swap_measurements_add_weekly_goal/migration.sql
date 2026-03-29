/*
  Warnings:

  - You are about to drop the column `arms` on the `Checkpoint` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Checkpoint` table. All the data in the column will be lost.
  - You are about to drop the column `cardioMinutes` on the `DailyLog` table. All the data in the column will be lost.
  - You are about to drop the column `cardioType` on the `DailyLog` table. All the data in the column will be lost.
  - You are about to drop the column `fastingHours` on the `DailyLog` table. All the data in the column will be lost.
  - You are about to drop the column `mood` on the `DailyLog` table. All the data in the column will be lost.
  - You are about to drop the column `trackCardio` on the `Phase` table. All the data in the column will be lost.
  - You are about to drop the column `trackFasting` on the `Phase` table. All the data in the column will be lost.
  - You are about to drop the column `startArms` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `startWeight` on the `Profile` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ProteinSource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "protein" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Checkpoint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "waist" REAL,
    "hips" REAL,
    "chest" REAL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Checkpoint" ("chest", "createdAt", "date", "id", "note", "waist") SELECT "chest", "createdAt", "date", "id", "note", "waist" FROM "Checkpoint";
DROP TABLE "Checkpoint";
ALTER TABLE "new_Checkpoint" RENAME TO "Checkpoint";
CREATE TABLE "new_DailyLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "phaseId" INTEGER,
    "proteinPriority" BOOLEAN,
    "fiberGrams" REAL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyLog_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DailyLog" ("createdAt", "date", "id", "note", "phaseId", "proteinPriority", "updatedAt") SELECT "createdAt", "date", "id", "note", "phaseId", "proteinPriority", "updatedAt" FROM "DailyLog";
DROP TABLE "DailyLog";
ALTER TABLE "new_DailyLog" RENAME TO "DailyLog";
CREATE UNIQUE INDEX "DailyLog_date_key" ON "DailyLog"("date");
CREATE TABLE "new_Phase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL DEFAULT '🧪',
    "color" TEXT NOT NULL DEFAULT '#E8A838',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 14,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "trackProtein" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Phase" ("active", "color", "createdAt", "description", "duration", "endDate", "icon", "id", "name", "sortOrder", "startDate", "trackProtein", "updatedAt") SELECT "active", "color", "createdAt", "description", "duration", "endDate", "icon", "id", "name", "sortOrder", "startDate", "trackProtein", "updatedAt" FROM "Phase";
DROP TABLE "Phase";
ALTER TABLE "new_Phase" RENAME TO "Phase";
CREATE TABLE "new_Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT 'Gabriel',
    "age" INTEGER NOT NULL DEFAULT 30,
    "proteinGoal" INTEGER NOT NULL DEFAULT 120,
    "weeklyProteinGoal" INTEGER NOT NULL DEFAULT 0,
    "fiberGoal" INTEGER NOT NULL DEFAULT 25,
    "unit" TEXT NOT NULL DEFAULT 'lbs',
    "startWaist" REAL,
    "startHips" REAL,
    "startChest" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Profile" ("age", "createdAt", "id", "name", "proteinGoal", "startChest", "startWaist", "unit", "updatedAt") SELECT "age", "createdAt", "id", "name", "proteinGoal", "startChest", "startWaist", "unit", "updatedAt" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ProteinSource_key_key" ON "ProteinSource"("key");
