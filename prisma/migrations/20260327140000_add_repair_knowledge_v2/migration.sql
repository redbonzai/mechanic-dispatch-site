-- CreateEnum
CREATE TYPE "SafetyLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ProcedureSourceType" AS ENUM ('INTERNAL', 'LICENSED', 'IMPORTED');

-- CreateEnum
CREATE TYPE "WarningSeverity" AS ENUM ('INFO', 'WARNING', 'DANGER');

-- CreateTable
CREATE TABLE "VehicleMakeCatalog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDailyDriver" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT,

    CONSTRAINT "VehicleMakeCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleModelCatalog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "makeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "VehicleModelCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleYearCatalog" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "VehicleYearCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleTrimCatalog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "modelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "yearFrom" INTEGER,
    "yearTo" INTEGER,

    CONSTRAINT "VehicleTrimCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleEngineCatalog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "modelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displacementL" DOUBLE PRECISION,
    "fuelType" TEXT,
    "aspiration" TEXT,
    "cylinders" INTEGER,
    "yearFrom" INTEGER,
    "yearTo" INTEGER,

    CONSTRAINT "VehicleEngineCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueCategory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "IssueCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "symptomSummary" TEXT NOT NULL,
    "diyFriendly" BOOLEAN NOT NULL DEFAULT true,
    "safetyLevel" "SafetyLevel" NOT NULL DEFAULT 'MEDIUM',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueAlias" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,

    CONSTRAINT "IssueAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchIntentMapping" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "phrase" TEXT NOT NULL,

    CONSTRAINT "SearchIntentMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixProcedure" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "issueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "difficulty" "RepairDifficulty" NOT NULL,
    "diyFriendly" BOOLEAN NOT NULL DEFAULT true,
    "estimatedCostMinCents" INTEGER,
    "estimatedCostMaxCents" INTEGER,
    "timeEstimateMinutes" INTEGER,
    "summary" TEXT NOT NULL,
    "diagnosisNotes" TEXT,
    "whenToStop" TEXT,
    "sourceType" "ProcedureSourceType" NOT NULL,
    "sourceConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FixProcedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixProcedureStep" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "isDiagnostic" BOOLEAN NOT NULL DEFAULT false,
    "requiresLift" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FixProcedureStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixProcedureTool" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "FixProcedureTool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixProcedurePart" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" TEXT,
    "notes" TEXT,
    "isConsumable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FixProcedurePart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixProcedureWarning" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "severity" "WarningSeverity" NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "FixProcedureWarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideFitment" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "makeId" TEXT NOT NULL,
    "modelId" TEXT,
    "trimId" TEXT,
    "engineId" TEXT,
    "yearFrom" INTEGER,
    "yearTo" INTEGER,
    "notes" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "GuideFitment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalSource" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "baseUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ExternalSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureSourceReference" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "externalId" TEXT,
    "sourceUrl" TEXT,
    "licenseScope" TEXT,
    "fetchedAt" TIMESTAMP(3),
    "rawPayload" JSONB,

    CONSTRAINT "ProcedureSourceReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecallReference" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "makeId" TEXT,
    "modelId" TEXT,
    "year" INTEGER,
    "nhtsaCampaign" TEXT NOT NULL,
    "component" TEXT,
    "summary" TEXT NOT NULL,
    "consequence" TEXT,
    "remedy" TEXT,
    "reportDate" TIMESTAMP(3),
    "sourceUrl" TEXT,

    CONSTRAINT "RecallReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchMiss" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "query" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "trim" TEXT,
    "normalizedIssue" TEXT,
    "reason" TEXT,
    "userId" TEXT,
    "sessionId" TEXT,

    CONSTRAINT "SearchMiss_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleMakeCatalog_slug_key" ON "VehicleMakeCatalog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleMakeCatalog_name_key" ON "VehicleMakeCatalog"("name");

-- CreateIndex
CREATE INDEX "VehicleMakeCatalog_isActive_isDailyDriver_idx" ON "VehicleMakeCatalog"("isActive", "isDailyDriver");

-- CreateIndex
CREATE INDEX "VehicleModelCatalog_makeId_name_idx" ON "VehicleModelCatalog"("makeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleModelCatalog_makeId_slug_key" ON "VehicleModelCatalog"("makeId", "slug");

-- CreateIndex
CREATE INDEX "VehicleYearCatalog_year_idx" ON "VehicleYearCatalog"("year");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleYearCatalog_modelId_year_key" ON "VehicleYearCatalog"("modelId", "year");

-- CreateIndex
CREATE INDEX "VehicleTrimCatalog_modelId_yearFrom_yearTo_idx" ON "VehicleTrimCatalog"("modelId", "yearFrom", "yearTo");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleTrimCatalog_modelId_slug_key" ON "VehicleTrimCatalog"("modelId", "slug");

-- CreateIndex
CREATE INDEX "VehicleEngineCatalog_modelId_name_idx" ON "VehicleEngineCatalog"("modelId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "IssueCategory_slug_key" ON "IssueCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "IssueCategory_name_key" ON "IssueCategory"("name");

-- CreateIndex
CREATE INDEX "Issue_categoryId_isPublished_idx" ON "Issue"("categoryId", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_slug_key" ON "Issue"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_categoryId_name_key" ON "Issue"("categoryId", "name");

-- CreateIndex
CREATE INDEX "IssueAlias_alias_idx" ON "IssueAlias"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "IssueAlias_issueId_alias_key" ON "IssueAlias"("issueId", "alias");

-- CreateIndex
CREATE INDEX "SearchIntentMapping_phrase_idx" ON "SearchIntentMapping"("phrase");

-- CreateIndex
CREATE UNIQUE INDEX "SearchIntentMapping_issueId_phrase_key" ON "SearchIntentMapping"("issueId", "phrase");

-- CreateIndex
CREATE INDEX "FixProcedure_issueId_isPublished_idx" ON "FixProcedure"("issueId", "isPublished");

-- CreateIndex
CREATE INDEX "FixProcedure_sourceType_sourceConfidence_idx" ON "FixProcedure"("sourceType", "sourceConfidence");

-- CreateIndex
CREATE UNIQUE INDEX "FixProcedure_slug_key" ON "FixProcedure"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FixProcedureStep_procedureId_stepNumber_key" ON "FixProcedureStep"("procedureId", "stepNumber");

-- CreateIndex
CREATE INDEX "FixProcedureTool_procedureId_idx" ON "FixProcedureTool"("procedureId");

-- CreateIndex
CREATE INDEX "FixProcedurePart_procedureId_idx" ON "FixProcedurePart"("procedureId");

-- CreateIndex
CREATE INDEX "FixProcedureWarning_procedureId_severity_idx" ON "FixProcedureWarning"("procedureId", "severity");

-- CreateIndex
CREATE INDEX "GuideFitment_makeId_modelId_yearFrom_yearTo_idx" ON "GuideFitment"("makeId", "modelId", "yearFrom", "yearTo");

-- CreateIndex
CREATE INDEX "GuideFitment_trimId_idx" ON "GuideFitment"("trimId");

-- CreateIndex
CREATE INDEX "GuideFitment_engineId_idx" ON "GuideFitment"("engineId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalSource_name_key" ON "ExternalSource"("name");

-- CreateIndex
CREATE INDEX "ProcedureSourceReference_procedureId_idx" ON "ProcedureSourceReference"("procedureId");

-- CreateIndex
CREATE INDEX "ProcedureSourceReference_sourceId_externalId_idx" ON "ProcedureSourceReference"("sourceId", "externalId");

-- CreateIndex
CREATE INDEX "RecallReference_makeId_modelId_year_idx" ON "RecallReference"("makeId", "modelId", "year");

-- CreateIndex
CREATE INDEX "RecallReference_nhtsaCampaign_idx" ON "RecallReference"("nhtsaCampaign");

-- CreateIndex
CREATE INDEX "SearchMiss_createdAt_idx" ON "SearchMiss"("createdAt");

-- CreateIndex
CREATE INDEX "SearchMiss_normalizedIssue_idx" ON "SearchMiss"("normalizedIssue");

-- CreateIndex
CREATE INDEX "SearchMiss_make_model_year_idx" ON "SearchMiss"("make", "model", "year");

-- AddForeignKey
ALTER TABLE "VehicleModelCatalog" ADD CONSTRAINT "VehicleModelCatalog_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "VehicleMakeCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleYearCatalog" ADD CONSTRAINT "VehicleYearCatalog_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "VehicleModelCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleTrimCatalog" ADD CONSTRAINT "VehicleTrimCatalog_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "VehicleModelCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleEngineCatalog" ADD CONSTRAINT "VehicleEngineCatalog_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "VehicleModelCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "IssueCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueAlias" ADD CONSTRAINT "IssueAlias_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchIntentMapping" ADD CONSTRAINT "SearchIntentMapping_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixProcedure" ADD CONSTRAINT "FixProcedure_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixProcedureStep" ADD CONSTRAINT "FixProcedureStep_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "FixProcedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixProcedureTool" ADD CONSTRAINT "FixProcedureTool_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "FixProcedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixProcedurePart" ADD CONSTRAINT "FixProcedurePart_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "FixProcedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixProcedureWarning" ADD CONSTRAINT "FixProcedureWarning_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "FixProcedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideFitment" ADD CONSTRAINT "GuideFitment_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "FixProcedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideFitment" ADD CONSTRAINT "GuideFitment_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "VehicleMakeCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideFitment" ADD CONSTRAINT "GuideFitment_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "VehicleModelCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideFitment" ADD CONSTRAINT "GuideFitment_trimId_fkey" FOREIGN KEY ("trimId") REFERENCES "VehicleTrimCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideFitment" ADD CONSTRAINT "GuideFitment_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "VehicleEngineCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureSourceReference" ADD CONSTRAINT "ProcedureSourceReference_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "FixProcedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureSourceReference" ADD CONSTRAINT "ProcedureSourceReference_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ExternalSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecallReference" ADD CONSTRAINT "RecallReference_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "VehicleMakeCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecallReference" ADD CONSTRAINT "RecallReference_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "VehicleModelCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
