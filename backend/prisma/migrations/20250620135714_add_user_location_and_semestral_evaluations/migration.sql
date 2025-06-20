-- AlterTable
ALTER TABLE "users" ADD COLUMN "address" TEXT;
ALTER TABLE "users" ADD COLUMN "latitude" REAL;
ALTER TABLE "users" ADD COLUMN "longitude" REAL;
ALTER TABLE "users" ADD COLUMN "neighborhood" TEXT;

-- CreateTable
CREATE TABLE "semestral_evaluations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "generalComment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "semestral_evaluations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "category_ratings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evaluationId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "category_ratings_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "semestral_evaluations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "semestral_evaluations_userId_semester_year_key" ON "semestral_evaluations"("userId", "semester", "year");
