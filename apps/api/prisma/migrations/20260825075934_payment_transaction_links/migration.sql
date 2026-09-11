-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PaymentTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "internalReference" TEXT,
    "userId" TEXT,
    "tontineId" TEXT,
    "cycleId" TEXT,
    "contributionId" TEXT,
    "providerId" TEXT NOT NULL,
    "providerRef" TEXT,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "status" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentTransaction_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "PaymentProvider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PaymentTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PaymentTransaction_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "Tontine" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PaymentTransaction_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "TontineCycle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PaymentTransaction_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "Contribution" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PaymentTransaction" ("amount", "createdAt", "currency", "direction", "id", "metadata", "providerId", "providerRef", "status", "updatedAt") SELECT "amount", "createdAt", "currency", "direction", "id", "metadata", "providerId", "providerRef", "status", "updatedAt" FROM "PaymentTransaction";
DROP TABLE "PaymentTransaction";
ALTER TABLE "new_PaymentTransaction" RENAME TO "PaymentTransaction";
CREATE UNIQUE INDEX "PaymentTransaction_internalReference_key" ON "PaymentTransaction"("internalReference");
CREATE INDEX "PaymentTransaction_providerId_idx" ON "PaymentTransaction"("providerId");
CREATE INDEX "PaymentTransaction_providerRef_idx" ON "PaymentTransaction"("providerRef");
CREATE INDEX "PaymentTransaction_userId_idx" ON "PaymentTransaction"("userId");
CREATE INDEX "PaymentTransaction_tontineId_cycleId_idx" ON "PaymentTransaction"("tontineId", "cycleId");
CREATE INDEX "PaymentTransaction_contributionId_idx" ON "PaymentTransaction"("contributionId");
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");
CREATE INDEX "PaymentTransaction_createdAt_idx" ON "PaymentTransaction"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
