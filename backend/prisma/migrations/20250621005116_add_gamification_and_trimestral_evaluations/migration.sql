/*
  Warnings:

  - You are about to drop the `semestral_evaluations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "semestral_evaluations_userId_semester_year_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "semestral_evaluations";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "trimestral_evaluations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "trimester" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "generalComment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "trimestral_evaluations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "gamification_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "quick_answers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quick_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "quick_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "gamification_questions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,
    CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_category_ratings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evaluationId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "category_ratings_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "trimestral_evaluations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_category_ratings" ("category", "comment", "createdAt", "evaluationId", "id", "rating") SELECT "category", "comment", "createdAt", "evaluationId", "id", "rating" FROM "category_ratings";
DROP TABLE "category_ratings";
ALTER TABLE "new_category_ratings" RENAME TO "category_ratings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "trimestral_evaluations_userId_trimester_year_key" ON "trimestral_evaluations"("userId", "trimester", "year");
