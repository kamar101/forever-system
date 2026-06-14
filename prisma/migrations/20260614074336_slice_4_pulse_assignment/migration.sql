-- CreateTable
CREATE TABLE "Pulse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pulse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "pulseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentItem" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "taskDescription" TEXT NOT NULL,
    "gear" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pulse_userId_idx" ON "Pulse"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Pulse_userId_date_key" ON "Pulse"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_pulseId_key" ON "Assignment"("pulseId");

-- CreateIndex
CREATE INDEX "AssignmentItem_assignmentId_idx" ON "AssignmentItem"("assignmentId");

-- AddForeignKey
ALTER TABLE "Pulse" ADD CONSTRAINT "Pulse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_pulseId_fkey" FOREIGN KEY ("pulseId") REFERENCES "Pulse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentItem" ADD CONSTRAINT "AssignmentItem_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
