-- CreateEnum
CREATE TYPE "DebtLoanType" AS ENUM ('DEBT', 'LOAN');

-- CreateEnum
CREATE TYPE "DebtLoanStatus" AS ENUM ('OPEN', 'PAID');

-- CreateEnum
CREATE TYPE "RecurringInterval" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "RecurringStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('LOGIN', 'PASSWORD_CHANGE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DAILY_INPUT_REMINDER', 'BUDGET_WARNING', 'BUDGET_EXCEEDED', 'RECURRING_DUE');

-- DropIndex
DROP INDEX "transactions_user_id_date_idx";

-- DropIndex
DROP INDEX "transactions_user_id_type_date_idx";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "debt_loan_id" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "location_name" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "recurring_transaction_id" TEXT;

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags_on_transactions" (
    "tag_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,

    CONSTRAINT "tags_on_transactions_pkey" PRIMARY KEY ("tag_id","transaction_id")
);

-- CreateTable
CREATE TABLE "recurring_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "to_wallet_id" TEXT,
    "category_id" TEXT,
    "amount" DECIMAL(19,4) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "note" TEXT,
    "interval" "RecurringInterval" NOT NULL,
    "status" "RecurringStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "next_processing_date" DATE NOT NULL,
    "last_processed_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "recurring_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debts_loans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "person_name" TEXT NOT NULL,
    "type" "DebtLoanType" NOT NULL,
    "status" "DebtLoanStatus" NOT NULL DEFAULT 'OPEN',
    "amount" DECIMAL(19,4) NOT NULL,
    "remaining_amount" DECIMAL(19,4) NOT NULL,
    "due_date" DATE,
    "start_date" DATE NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "debts_loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "dedupe_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "daily_input_enabled" BOOLEAN NOT NULL DEFAULT true,
    "budget_alert_enabled" BOOLEAN NOT NULL DEFAULT true,
    "recurring_reminder_enabled" BOOLEAN NOT NULL DEFAULT true,
    "daily_reminder_hour" INTEGER NOT NULL DEFAULT 20,
    "recurring_reminder_days" INTEGER NOT NULL DEFAULT 2,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "known_ips" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "known_ips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tags_user_id_idx" ON "tags"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_user_id_name_key" ON "tags"("user_id", "name");

-- CreateIndex
CREATE INDEX "tags_on_transactions_transaction_id_idx" ON "tags_on_transactions"("transaction_id");

-- CreateIndex
CREATE INDEX "recurring_transactions_user_id_idx" ON "recurring_transactions"("user_id");

-- CreateIndex
CREATE INDEX "recurring_transactions_wallet_id_idx" ON "recurring_transactions"("wallet_id");

-- CreateIndex
CREATE INDEX "recurring_transactions_next_processing_date_idx" ON "recurring_transactions"("next_processing_date");

-- CreateIndex
CREATE INDEX "debts_loans_user_id_idx" ON "debts_loans"("user_id");

-- CreateIndex
CREATE INDEX "debts_loans_wallet_id_idx" ON "debts_loans"("wallet_id");

-- CreateIndex
CREATE INDEX "debts_loans_status_idx" ON "debts_loans"("status");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_dedupe_key_key" ON "notifications"("dedupe_key");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

-- CreateIndex
CREATE INDEX "otp_tokens_user_id_idx" ON "otp_tokens"("user_id");

-- CreateIndex
CREATE INDEX "known_ips_user_id_idx" ON "known_ips"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "known_ips_user_id_ip_address_key" ON "known_ips"("user_id", "ip_address");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_recurring_transaction_id_idx" ON "transactions"("recurring_transaction_id");

-- CreateIndex
CREATE INDEX "transactions_debt_loan_id_idx" ON "transactions"("debt_loan_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurring_transaction_id_fkey" FOREIGN KEY ("recurring_transaction_id") REFERENCES "recurring_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_debt_loan_id_fkey" FOREIGN KEY ("debt_loan_id") REFERENCES "debts_loans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_transactions" ADD CONSTRAINT "tags_on_transactions_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_transactions" ADD CONSTRAINT "tags_on_transactions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_to_wallet_id_fkey" FOREIGN KEY ("to_wallet_id") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debts_loans" ADD CONSTRAINT "debts_loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debts_loans" ADD CONSTRAINT "debts_loans_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_tokens" ADD CONSTRAINT "otp_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "known_ips" ADD CONSTRAINT "known_ips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
