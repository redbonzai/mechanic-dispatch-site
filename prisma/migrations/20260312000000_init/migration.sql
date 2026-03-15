-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('INACTIVE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('BASIC', 'PRO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "RepairDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "avatarUrl" TEXT,
    "searchCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "trim" TEXT,
    "vin" TEXT,
    "licensePlate" TEXT,
    "plateState" TEXT,
    "notes" TEXT,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedFix" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "query" TEXT NOT NULL,
    "fixData" JSONB NOT NULL,

    CONSTRAINT "SavedFix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mechanic" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "imageUrl" TEXT,
    "shopName" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "serviceRadius" INTEGER,
    "yearsExperience" INTEGER NOT NULL,
    "sinceYear" INTEGER NOT NULL,
    "certifications" TEXT[],
    "badges" TEXT[],
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "searchAppearances" INTEGER NOT NULL DEFAULT 0,
    "linkClicks" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "subscriptionTier" "SubscriptionTier",
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStartAt" TIMESTAMP(3),
    "subscriptionEndAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),

    CONSTRAINT "Mechanic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MechanicRefreshToken" (
    "id" TEXT NOT NULL,
    "mechanicId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MechanicRefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MechanicSubscription" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mechanicId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),

    CONSTRAINT "MechanicSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MechanicSkill" (
    "id" TEXT NOT NULL,
    "mechanicId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "MechanicSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewerLocation" TEXT NOT NULL,
    "reviewText" TEXT NOT NULL,
    "carModel" TEXT NOT NULL,
    "carYear" INTEGER NOT NULL,
    "serviceDescription" TEXT NOT NULL,
    "mechanicId" TEXT NOT NULL,
    "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairGuide" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "symptom" TEXT NOT NULL,
    "systemCategory" TEXT NOT NULL,
    "vehicleMakes" TEXT[],
    "vehicleModels" TEXT[],
    "yearFrom" INTEGER,
    "yearTo" INTEGER,
    "difficulty" "RepairDifficulty" NOT NULL,
    "estimatedCostMinCents" INTEGER,
    "estimatedCostMaxCents" INTEGER,
    "timeEstimateMinutes" INTEGER,
    "diyFriendly" BOOLEAN NOT NULL DEFAULT true,
    "steps" JSONB NOT NULL,
    "tools" TEXT[],
    "parts" TEXT[],
    "warnings" TEXT[],
    "relatedSkills" TEXT[],
    "sources" JSONB,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RepairGuide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "query" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "userId" TEXT,
    "sessionId" TEXT,
    "resultsCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MechanicProfileView" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mechanicId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "source" TEXT,
    "clickedLink" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MechanicProfileView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastFailedLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminRefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminRefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");

CREATE INDEX "Vehicle_userId_idx" ON "Vehicle"("userId");
CREATE INDEX "Vehicle_vin_idx" ON "Vehicle"("vin");

CREATE UNIQUE INDEX "UserRefreshToken_token_key" ON "UserRefreshToken"("token");
CREATE INDEX "UserRefreshToken_userId_idx" ON "UserRefreshToken"("userId");
CREATE INDEX "UserRefreshToken_token_idx" ON "UserRefreshToken"("token");
CREATE INDEX "UserRefreshToken_expiresAt_idx" ON "UserRefreshToken"("expiresAt");

CREATE INDEX "SavedFix_userId_idx" ON "SavedFix"("userId");

CREATE UNIQUE INDEX "Mechanic_email_key" ON "Mechanic"("email");
CREATE UNIQUE INDEX "Mechanic_slug_key" ON "Mechanic"("slug");

CREATE UNIQUE INDEX "MechanicRefreshToken_token_key" ON "MechanicRefreshToken"("token");
CREATE INDEX "MechanicRefreshToken_mechanicId_idx" ON "MechanicRefreshToken"("mechanicId");
CREATE INDEX "MechanicRefreshToken_token_idx" ON "MechanicRefreshToken"("token");
CREATE INDEX "MechanicRefreshToken_expiresAt_idx" ON "MechanicRefreshToken"("expiresAt");

CREATE UNIQUE INDEX "MechanicSubscription_mechanicId_key" ON "MechanicSubscription"("mechanicId");
CREATE UNIQUE INDEX "MechanicSubscription_stripeSubscriptionId_key" ON "MechanicSubscription"("stripeSubscriptionId");
CREATE INDEX "MechanicSubscription_mechanicId_idx" ON "MechanicSubscription"("mechanicId");
CREATE INDEX "MechanicSubscription_stripeSubscriptionId_idx" ON "MechanicSubscription"("stripeSubscriptionId");

CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

CREATE UNIQUE INDEX "MechanicSkill_mechanicId_skillId_key" ON "MechanicSkill"("mechanicId", "skillId");

CREATE INDEX "Review_mechanicId_idx" ON "Review"("mechanicId");
CREATE INDEX "Review_rating_idx" ON "Review"("rating");
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

CREATE UNIQUE INDEX "RepairGuide_slug_key" ON "RepairGuide"("slug");
CREATE INDEX "RepairGuide_systemCategory_idx" ON "RepairGuide"("systemCategory");
CREATE INDEX "RepairGuide_symptom_idx" ON "RepairGuide"("symptom");
CREATE INDEX "RepairGuide_isPublished_idx" ON "RepairGuide"("isPublished");

CREATE INDEX "SearchQuery_createdAt_idx" ON "SearchQuery"("createdAt");
CREATE INDEX "SearchQuery_query_idx" ON "SearchQuery"("query");
CREATE INDEX "SearchQuery_userId_idx" ON "SearchQuery"("userId");
CREATE INDEX "SearchQuery_sessionId_idx" ON "SearchQuery"("sessionId");

CREATE INDEX "MechanicProfileView_mechanicId_idx" ON "MechanicProfileView"("mechanicId");
CREATE INDEX "MechanicProfileView_createdAt_idx" ON "MechanicProfileView"("createdAt");
CREATE INDEX "MechanicProfileView_userId_idx" ON "MechanicProfileView"("userId");

CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE INDEX "AdminUser_email_idx" ON "AdminUser"("email");

CREATE UNIQUE INDEX "AdminRefreshToken_token_key" ON "AdminRefreshToken"("token");
CREATE INDEX "AdminRefreshToken_userId_idx" ON "AdminRefreshToken"("userId");
CREATE INDEX "AdminRefreshToken_expiresAt_idx" ON "AdminRefreshToken"("expiresAt");
CREATE INDEX "AdminRefreshToken_token_idx" ON "AdminRefreshToken"("token");

CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_resourceType_idx" ON "AuditLog"("resourceType");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserRefreshToken" ADD CONSTRAINT "UserRefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedFix" ADD CONSTRAINT "SavedFix_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedFix" ADD CONSTRAINT "SavedFix_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MechanicRefreshToken" ADD CONSTRAINT "MechanicRefreshToken_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MechanicSubscription" ADD CONSTRAINT "MechanicSubscription_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MechanicSkill" ADD CONSTRAINT "MechanicSkill_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MechanicSkill" ADD CONSTRAINT "MechanicSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SearchQuery" ADD CONSTRAINT "SearchQuery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MechanicProfileView" ADD CONSTRAINT "MechanicProfileView_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MechanicProfileView" ADD CONSTRAINT "MechanicProfileView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdminRefreshToken" ADD CONSTRAINT "AdminRefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
