PRAGMA foreign_keys=OFF;

CREATE TABLE "new_OtpVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE "OtpVerification";
ALTER TABLE "new_OtpVerification" RENAME TO "OtpVerification";

CREATE UNIQUE INDEX "OtpVerification_email_key" ON "OtpVerification"("email");
CREATE INDEX "OtpVerification_email_idx" ON "OtpVerification"("email");
CREATE INDEX "OtpVerification_expiresAt_idx" ON "OtpVerification"("expiresAt");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;