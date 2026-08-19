-- CreateTable
CREATE TABLE "OtpVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Tontine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'ROTATIVE',
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "contributionAmount" REAL NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "maxMembers" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "Tontine_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TontineRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tontineId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'STRING',
    CONSTRAINT "TontineRule_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "Tontine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TontineMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tontineId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" DATETIME,
    "payoutOrder" INTEGER,
    "isPayoutReceived" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "TontineMember_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "Tontine" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TontineMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TontineCycle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tontineId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "beneficiaryMemberId" TEXT,
    "potAmount" REAL,
    "potReceived" REAL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TontineCycle_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "Tontine" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TontineCycle_beneficiaryMemberId_fkey" FOREIGN KEY ("beneficiaryMemberId") REFERENCES "TontineMember" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cycleId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "method" TEXT NOT NULL DEFAULT 'MANUAL',
    "providerRef" TEXT,
    "declaredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" DATETIME,
    "confirmedById" TEXT,
    "lateFee" REAL NOT NULL DEFAULT 0,
    "penaltyApplied" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    CONSTRAINT "Contribution_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "TontineCycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Contribution_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "TontineMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Contribution_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tontineId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "method" TEXT NOT NULL DEFAULT 'MANUAL',
    "providerRef" TEXT,
    "initiatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "failureReason" TEXT,
    CONSTRAINT "Payout_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "Tontine" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payout_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "TontineCycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payout_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "TontineMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "apiKeyRef" TEXT,
    "webhookSecretRef" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerId" TEXT NOT NULL,
    "providerRef" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "status" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentTransaction_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "PaymentProvider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tontineId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "quorum" INTEGER NOT NULL DEFAULT 0,
    "eligibleVoterIds" TEXT NOT NULL,
    "result" TEXT,
    "openedAt" DATETIME,
    "closedAt" DATETIME,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "Vote_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "Tontine" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoteBallot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voteId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "choice" TEXT NOT NULL,
    "votedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VoteBallot_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "Vote" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VoteBallot_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "TontineMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tontineId" TEXT NOT NULL,
    "cycleId" TEXT,
    "contributionId" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "openedById" TEXT NOT NULL,
    "openedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "resolvedById" TEXT,
    "decision" TEXT,
    CONSTRAINT "Dispute_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "Tontine" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Dispute_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Dispute_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Dispute_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "Contribution" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DisputeEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "disputeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DisputeEvidence_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrustProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cyclesCompleted" INTEGER NOT NULL DEFAULT 0,
    "paymentsOnTime" INTEGER NOT NULL DEFAULT 0,
    "paymentsLate" INTEGER NOT NULL DEFAULT 0,
    "disputesResolved" INTEGER NOT NULL DEFAULT 0,
    "disputesUnresolved" INTEGER NOT NULL DEFAULT 0,
    "memberSince" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL DEFAULT 50,
    CONSTRAINT "TrustProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT,
    "actorRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tontineId" TEXT,
    "messages" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AIConversation_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "Tontine" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tontineId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'LOW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIInsight_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "Tontine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" DATETIME,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "OtpVerification_phone_key" ON "OtpVerification"("phone");

-- CreateIndex
CREATE INDEX "OtpVerification_phone_idx" ON "OtpVerification"("phone");

-- CreateIndex
CREATE INDEX "OtpVerification_expiresAt_idx" ON "OtpVerification"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "Tontine_createdById_idx" ON "Tontine"("createdById");

-- CreateIndex
CREATE INDEX "Tontine_status_idx" ON "Tontine"("status");

-- CreateIndex
CREATE INDEX "Tontine_type_idx" ON "Tontine"("type");

-- CreateIndex
CREATE INDEX "Tontine_startDate_idx" ON "Tontine"("startDate");

-- CreateIndex
CREATE INDEX "TontineRule_tontineId_idx" ON "TontineRule"("tontineId");

-- CreateIndex
CREATE INDEX "TontineRule_tontineId_key_idx" ON "TontineRule"("tontineId", "key");

-- CreateIndex
CREATE INDEX "TontineMember_tontineId_idx" ON "TontineMember"("tontineId");

-- CreateIndex
CREATE INDEX "TontineMember_userId_idx" ON "TontineMember"("userId");

-- CreateIndex
CREATE INDEX "TontineMember_tontineId_userId_idx" ON "TontineMember"("tontineId", "userId");

-- CreateIndex
CREATE INDEX "TontineMember_tontineId_status_idx" ON "TontineMember"("tontineId", "status");

-- CreateIndex
CREATE INDEX "TontineCycle_tontineId_idx" ON "TontineCycle"("tontineId");

-- CreateIndex
CREATE INDEX "TontineCycle_tontineId_sequence_idx" ON "TontineCycle"("tontineId", "sequence");

-- CreateIndex
CREATE INDEX "TontineCycle_status_idx" ON "TontineCycle"("status");

-- CreateIndex
CREATE INDEX "TontineCycle_startDate_idx" ON "TontineCycle"("startDate");

-- CreateIndex
CREATE INDEX "Contribution_cycleId_idx" ON "Contribution"("cycleId");

-- CreateIndex
CREATE INDEX "Contribution_memberId_idx" ON "Contribution"("memberId");

-- CreateIndex
CREATE INDEX "Contribution_cycleId_memberId_idx" ON "Contribution"("cycleId", "memberId");

-- CreateIndex
CREATE INDEX "Contribution_status_idx" ON "Contribution"("status");

-- CreateIndex
CREATE INDEX "Contribution_declaredAt_idx" ON "Contribution"("declaredAt");

-- CreateIndex
CREATE INDEX "Payout_tontineId_idx" ON "Payout"("tontineId");

-- CreateIndex
CREATE INDEX "Payout_cycleId_idx" ON "Payout"("cycleId");

-- CreateIndex
CREATE INDEX "Payout_memberId_idx" ON "Payout"("memberId");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- CreateIndex
CREATE INDEX "Payout_initiatedAt_idx" ON "Payout"("initiatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentProvider_name_key" ON "PaymentProvider"("name");

-- CreateIndex
CREATE INDEX "PaymentProvider_type_idx" ON "PaymentProvider"("type");

-- CreateIndex
CREATE INDEX "PaymentProvider_isActive_idx" ON "PaymentProvider"("isActive");

-- CreateIndex
CREATE INDEX "PaymentTransaction_providerId_idx" ON "PaymentTransaction"("providerId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_providerRef_idx" ON "PaymentTransaction"("providerRef");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");

-- CreateIndex
CREATE INDEX "PaymentTransaction_createdAt_idx" ON "PaymentTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "Vote_tontineId_idx" ON "Vote"("tontineId");

-- CreateIndex
CREATE INDEX "Vote_status_idx" ON "Vote"("status");

-- CreateIndex
CREATE INDEX "Vote_openedAt_idx" ON "Vote"("openedAt");

-- CreateIndex
CREATE INDEX "VoteBallot_voteId_idx" ON "VoteBallot"("voteId");

-- CreateIndex
CREATE INDEX "VoteBallot_memberId_idx" ON "VoteBallot"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "VoteBallot_voteId_memberId_key" ON "VoteBallot"("voteId", "memberId");

-- CreateIndex
CREATE INDEX "Dispute_tontineId_idx" ON "Dispute"("tontineId");

-- CreateIndex
CREATE INDEX "Dispute_cycleId_idx" ON "Dispute"("cycleId");

-- CreateIndex
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");

-- CreateIndex
CREATE INDEX "Dispute_openedAt_idx" ON "Dispute"("openedAt");

-- CreateIndex
CREATE INDEX "DisputeEvidence_disputeId_idx" ON "DisputeEvidence"("disputeId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustProfile_userId_key" ON "TrustProfile"("userId");

-- CreateIndex
CREATE INDEX "TrustProfile_score_idx" ON "TrustProfile"("score");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_resource_idx" ON "AuditLog"("resource");

-- CreateIndex
CREATE INDEX "AuditLog_resourceId_idx" ON "AuditLog"("resourceId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AIConversation_userId_idx" ON "AIConversation"("userId");

-- CreateIndex
CREATE INDEX "AIConversation_tontineId_idx" ON "AIConversation"("tontineId");

-- CreateIndex
CREATE INDEX "AIConversation_createdAt_idx" ON "AIConversation"("createdAt");

-- CreateIndex
CREATE INDEX "AIInsight_tontineId_idx" ON "AIInsight"("tontineId");

-- CreateIndex
CREATE INDEX "AIInsight_priority_idx" ON "AIInsight"("priority");

-- CreateIndex
CREATE INDEX "AIInsight_createdAt_idx" ON "AIInsight"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "Notification"("status");

-- CreateIndex
CREATE INDEX "Notification_channel_idx" ON "Notification"("channel");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
