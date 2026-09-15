-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('QUEUED', 'INITIALIZING', 'CRAWLING', 'ANALYZING', 'GENERATING_REPORT', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ScanType" AS ENUM ('QUICK', 'WEBSITE', 'MONITORING');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('CRITICAL', 'SERIOUS', 'MODERATE', 'MINOR');

-- CreateEnum
CREATE TYPE "MonitoringFrequency" AS ENUM ('DAILY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Website" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "type" "ScanType" NOT NULL,
    "status" "ScanStatus" NOT NULL DEFAULT 'QUEUED',
    "score" DOUBLE PRECISION,
    "pagesScanned" INTEGER NOT NULL DEFAULT 0,
    "pagesTotal" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "websiteId" TEXT NOT NULL,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "statusCode" INTEGER,
    "screenshot" TEXT,
    "scanId" TEXT NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViolationOccurrence" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "impact" "Severity" NOT NULL,
    "description" TEXT NOT NULL,
    "help" TEXT,
    "helpUrl" TEXT,
    "wcagTags" TEXT[],
    "selector" TEXT,
    "html" TEXT,
    "pageId" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,

    CONSTRAINT "ViolationOccurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Monitoring" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "frequency" "MonitoringFrequency" NOT NULL DEFAULT 'DAILY',
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "websiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Monitoring_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Website_projectId_idx" ON "Website"("projectId");

-- CreateIndex
CREATE INDEX "Scan_websiteId_idx" ON "Scan"("websiteId");

-- CreateIndex
CREATE INDEX "Scan_status_idx" ON "Scan"("status");

-- CreateIndex
CREATE INDEX "Scan_createdAt_idx" ON "Scan"("createdAt");

-- CreateIndex
CREATE INDEX "Page_scanId_idx" ON "Page"("scanId");

-- CreateIndex
CREATE INDEX "ViolationOccurrence_scanId_idx" ON "ViolationOccurrence"("scanId");

-- CreateIndex
CREATE INDEX "ViolationOccurrence_pageId_idx" ON "ViolationOccurrence"("pageId");

-- CreateIndex
CREATE INDEX "ViolationOccurrence_ruleId_idx" ON "ViolationOccurrence"("ruleId");

-- CreateIndex
CREATE INDEX "ViolationOccurrence_impact_idx" ON "ViolationOccurrence"("impact");

-- CreateIndex
CREATE UNIQUE INDEX "Monitoring_websiteId_key" ON "Monitoring"("websiteId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Website" ADD CONSTRAINT "Website_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViolationOccurrence" ADD CONSTRAINT "ViolationOccurrence_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViolationOccurrence" ADD CONSTRAINT "ViolationOccurrence_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Monitoring" ADD CONSTRAINT "Monitoring_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;
