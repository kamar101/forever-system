-- CreateEnum
CREATE TYPE "DayStatus" AS ENUM ('green', 'empty');

-- CreateTable
CREATE TABLE "Day" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "DayStatus" NOT NULL DEFAULT 'empty',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Day_userId_idx" ON "Day"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Day_userId_date_key" ON "Day"("userId", "date");

-- AddForeignKey
ALTER TABLE "Day" ADD CONSTRAINT "Day_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
