-- Backup generated on 2026-04-12T00:39:39.575Z
SET session_replication_role = 'replica';

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "DebtLoanType" AS ENUM ('DEBT', 'LOAN');

-- CreateEnum
CREATE TYPE "DebtLoanStatus" AS ENUM ('OPEN', 'PAID');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "RecurringInterval" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "RecurringStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('LOGIN', 'PASSWORD_CHANGE', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DAILY_INPUT_REMINDER', 'BUDGET_WARNING', 'BUDGET_EXCEEDED', 'RECURRING_DUE', 'SYSTEM', 'INFO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DECIMAL(19,4) NOT NULL,
    "icon" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "to_wallet_id" TEXT,
    "category_id" TEXT,
    "amount" DECIMAL(19,4) NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "note" TEXT,
    "receipt_url" TEXT,
    "type" "TransactionType" NOT NULL,
    "location_name" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "saving_goal_id" TEXT,
    "recurring_transaction_id" TEXT,
    "debt_loan_id" TEXT,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "saving_goals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_round_up" BOOLEAN NOT NULL DEFAULT false,
    "target_amount" DECIMAL(19,4) NOT NULL,
    "current_amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "deadline_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "saving_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT,
    "limit_amount" DECIMAL(19,4) NOT NULL,
    "month_year" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "wallets_user_id_idx" ON "wallets"("user_id");

-- CreateIndex
CREATE INDEX "categories_user_id_idx" ON "categories"("user_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_wallet_id_idx" ON "transactions"("wallet_id");

-- CreateIndex
CREATE INDEX "transactions_category_id_idx" ON "transactions"("category_id");

-- CreateIndex
CREATE INDEX "transactions_saving_goal_id_idx" ON "transactions"("saving_goal_id");

-- CreateIndex
CREATE INDEX "transactions_recurring_transaction_id_idx" ON "transactions"("recurring_transaction_id");

-- CreateIndex
CREATE INDEX "transactions_debt_loan_id_idx" ON "transactions"("debt_loan_id");

-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "transactions"("date");

-- CreateIndex
CREATE INDEX "tags_user_id_idx" ON "tags"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_user_id_name_key" ON "tags"("user_id", "name");

-- CreateIndex
CREATE INDEX "tags_on_transactions_transaction_id_idx" ON "tags_on_transactions"("transaction_id");

-- CreateIndex
CREATE INDEX "saving_goals_user_id_idx" ON "saving_goals"("user_id");

-- CreateIndex
CREATE INDEX "budgets_user_id_idx" ON "budgets"("user_id");

-- CreateIndex
CREATE INDEX "budgets_category_id_idx" ON "budgets"("category_id");

-- CreateIndex
CREATE INDEX "budgets_month_year_idx" ON "budgets"("month_year");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_user_id_category_id_month_year_key" ON "budgets"("user_id", "category_id", "month_year");

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

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurring_transaction_id_fkey" FOREIGN KEY ("recurring_transaction_id") REFERENCES "recurring_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_saving_goal_id_fkey" FOREIGN KEY ("saving_goal_id") REFERENCES "saving_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_wallet_id_fkey" FOREIGN KEY ("to_wallet_id") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_debt_loan_id_fkey" FOREIGN KEY ("debt_loan_id") REFERENCES "debts_loans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_transactions" ADD CONSTRAINT "tags_on_transactions_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_transactions" ADD CONSTRAINT "tags_on_transactions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saving_goals" ADD CONSTRAINT "saving_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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



INSERT INTO "users" ("id", "email", "password_hash", "full_name", "currency", "avatar_url", "created_at", "updated_at") VALUES ('cmnsm5l7c0000l104apo2ilvq', 'test@example.com', '$2b$10$YqaQboEjxXSKuLt1hMS5KeY4YWML9KVTU36xS6qAwgpv/5Wz57eD6', 'Test User', 'VND', NULL, '2026-04-10T07:57:49.081Z', '2026-04-10T07:57:49.081Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "currency", "avatar_url", "created_at", "updated_at") VALUES ('cmnsmffho0000l205ws62scwu', 'test1@example.com', '$2b$10$GgEVm6V7MVxCqebB2W.lBeHaWvOjzpJhORWHzm8eXGYob.66MHrmO', 'test1', 'VND', NULL, '2026-04-10T08:05:28.236Z', '2026-04-10T08:05:28.236Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "currency", "avatar_url", "created_at", "updated_at") VALUES ('cmnsmnuix000al10420rqd3lh', 'tester123@example.com', '$2b$10$hvZLIAeltuEraKm5jxE.m.XW8yP/yUDVYSS1e.0bjcqMOXq.2Uk/e', 'Tester', 'VND', NULL, '2026-04-10T08:12:00.969Z', '2026-04-10T08:12:00.969Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "currency", "avatar_url", "created_at", "updated_at") VALUES ('cmnsmvxyc0000l204u5j002nx', 'molkoh2002@gmail.com', '$2b$10$lm3fNtBzHjpKIEFaSSYjDe3xgvO44kE9uHBFz/SkZpgX9I5k6QCti', 'BBTEST2', 'VND', NULL, '2026-04-10T08:18:18.661Z', '2026-04-10T08:18:18.661Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "currency", "avatar_url", "created_at", "updated_at") VALUES ('cmnsmylc0000cl204fcik8ywj', 'test2@example.com', '$2b$10$UvvXH/TQYLQ9DMp3OPwsqOznbACl6ZEQMudqu/HeZZlK2XdvVP2IC', 'test2', 'VND', NULL, '2026-04-10T08:20:22.272Z', '2026-04-10T08:20:22.272Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "currency", "avatar_url", "created_at", "updated_at") VALUES ('cmnslljab0000l704dv8hf9rg', 'thanhbinh.101201@gmail.com', '$2b$12$QRJVMn2XZVVoijDzwcFIN.uKdljqVsbWWPEbGy5toA3v/i2CB8v3u', 'Báo Ngọc Thiên Bảo', 'VND', NULL, '2026-04-10T07:42:13.476Z', '2026-04-10T11:20:58.827Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "currency", "avatar_url", "created_at", "updated_at") VALUES ('cmnslo29u0000jy04dk2m3mjg', 'hoanghuudien123@gmail.com', '$2b$10$.fg81Pv0uBYpD/7y9NNDAeB/pazZzfsO716CpS/Pk6YqL4sfHEUqK', 'Điệp', 'VND', NULL, '2026-04-10T07:44:11.394Z', '2026-04-10T15:51:22.137Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "currency", "avatar_url", "created_at", "updated_at") VALUES ('cmnuiooxu0000jy04ut2f9lln', '1721031229@dntu.edu.vn', '$2b$10$rtKXvOhw0mu61qnNS8nsuO6Fy6jkfW7ot23SDjDqhKUFf2H7hP5UC', 'Ninh Văn Dũng', 'VND', NULL, '2026-04-11T15:56:14.274Z', '2026-04-11T15:56:14.274Z');
INSERT INTO "users" ("id", "email", "password_hash", "full_name", "currency", "avatar_url", "created_at", "updated_at") VALUES ('cmnuiywj10004jr04n4jkj0gu', 'quoclam0122@gmail.com', '$2b$10$DDfdQ8P32O0oIwUJi0jrIe4g.vU/BcK6tWhXSXjGPzkx0IOV8.pv2', 'Noah', 'VND', NULL, '2026-04-11T16:04:10.670Z', '2026-04-11T16:04:10.670Z');

INSERT INTO "wallets" ("id", "user_id", "name", "balance", "icon", "created_at", "updated_at") VALUES ('cmnsmffhw0002l205wj4m6yr9', 'cmnsmffho0000l205ws62scwu', 'Tiền mặt', '0.0000', NULL, '2026-04-10T08:05:28.245Z', '2026-04-10T08:05:28.245Z');
INSERT INTO "wallets" ("id", "user_id", "name", "balance", "icon", "created_at", "updated_at") VALUES ('cmnsmnuj0000cl104pm49og3j', 'cmnsmnuix000al10420rqd3lh', 'Tiền mặt', '0.0000', NULL, '2026-04-10T08:12:00.973Z', '2026-04-10T08:12:00.973Z');
INSERT INTO "wallets" ("id", "user_id", "name", "balance", "icon", "created_at", "updated_at") VALUES ('cmnsmvxyj0002l204u0s6rjq7', 'cmnsmvxyc0000l204u5j002nx', 'Tiền mặt', '399999.0000', NULL, '2026-04-10T08:18:18.667Z', '2026-04-10T08:18:35.961Z');
INSERT INTO "wallets" ("id", "user_id", "name", "balance", "icon", "created_at", "updated_at") VALUES ('cmnsmylc3000el2047jnyns19', 'cmnsmylc0000cl204fcik8ywj', 'Tiền mặt', '0.0000', NULL, '2026-04-10T08:20:22.275Z', '2026-04-10T08:20:22.275Z');
INSERT INTO "wallets" ("id", "user_id", "name", "balance", "icon", "created_at", "updated_at") VALUES ('cmnsm5l7w0002l104fh83g7wr', 'cmnsm5l7c0000l104apo2ilvq', 'Tiền mặt', '-180000.0000', NULL, '2026-04-10T07:57:49.100Z', '2026-04-10T08:30:35.462Z');
INSERT INTO "wallets" ("id", "user_id", "name", "balance", "icon", "created_at", "updated_at") VALUES ('cmnslljaq0002l704r7wtmeia', 'cmnslljab0000l704dv8hf9rg', 'Tiền mặt', '4200000.0000', 'Wallet', '2026-04-10T07:42:13.490Z', '2026-04-10T09:06:35.545Z');
INSERT INTO "wallets" ("id", "user_id", "name", "balance", "icon", "created_at", "updated_at") VALUES ('cmnslo2a10002jy044he6vlbb', 'cmnslo29u0000jy04dk2m3mjg', 'Tiền mặt', '0.0000', NULL, '2026-04-10T07:44:11.402Z', '2026-04-10T16:01:25.802Z');
INSERT INTO "wallets" ("id", "user_id", "name", "balance", "icon", "created_at", "updated_at") VALUES ('cmnt32frj0007kz04dt58fmg6', 'cmnslo29u0000jy04dk2m3mjg', 'MB Bank', '3946888421.0526', 'Wallet', '2026-04-10T15:51:15.535Z', '2026-04-10T16:02:00.104Z');
INSERT INTO "wallets" ("id", "user_id", "name", "balance", "icon", "created_at", "updated_at") VALUES ('cmnuj89460001kv045xbm6hap', 'cmnuiywj10004jr04n4jkj0gu', 'Tiền mặt', '60000.0000', 'Banknote', '2026-04-11T16:11:26.883Z', '2026-04-11T16:21:26.576Z');
INSERT INTO "wallets" ("id", "user_id", "name", "balance", "icon", "created_at", "updated_at") VALUES ('cmnuiooy30002jy0437ue4bkw', 'cmnuiooxu0000jy04ut2f9lln', 'Tiền mặt', '6670000.0000', NULL, '2026-04-11T15:56:14.283Z', '2026-04-11T23:24:54.182Z');

INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnslljaz0003l7048nynvs0p', 'cmnslljab0000l704dv8hf9rg', 'Lương', 'INCOME', NULL, NULL, false, '2026-04-10T07:42:13.499Z', '2026-04-10T07:42:13.499Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnslljaz0004l7041jwoyh6o', 'cmnslljab0000l704dv8hf9rg', 'Ăn uống', 'EXPENSE', NULL, NULL, false, '2026-04-10T07:42:13.499Z', '2026-04-10T07:42:13.499Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnslljaz0005l704leg0r9mq', 'cmnslljab0000l704dv8hf9rg', 'Di chuyển', 'EXPENSE', NULL, NULL, false, '2026-04-10T07:42:13.499Z', '2026-04-10T07:42:13.499Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnslljaz0006l704j57l3c67', 'cmnslljab0000l704dv8hf9rg', 'Hóa đơn', 'EXPENSE', NULL, NULL, false, '2026-04-10T07:42:13.499Z', '2026-04-10T07:42:13.499Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnslljaz0007l704009zwcd8', 'cmnslljab0000l704dv8hf9rg', 'Giải trí', 'EXPENSE', NULL, NULL, false, '2026-04-10T07:42:13.499Z', '2026-04-10T07:42:13.499Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnslo2a50003jy040mlof9w5', 'cmnslo29u0000jy04dk2m3mjg', 'Lương', 'INCOME', NULL, NULL, false, '2026-04-10T07:44:11.406Z', '2026-04-10T07:44:11.406Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnslo2a50004jy04vjabbuk3', 'cmnslo29u0000jy04dk2m3mjg', 'Ăn uống', 'EXPENSE', NULL, NULL, false, '2026-04-10T07:44:11.406Z', '2026-04-10T07:44:11.406Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnslo2a50005jy04oj63hoe8', 'cmnslo29u0000jy04dk2m3mjg', 'Di chuyển', 'EXPENSE', NULL, NULL, false, '2026-04-10T07:44:11.406Z', '2026-04-10T07:44:11.406Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnslo2a50006jy047ps7c3bh', 'cmnslo29u0000jy04dk2m3mjg', 'Hóa đơn', 'EXPENSE', NULL, NULL, false, '2026-04-10T07:44:11.406Z', '2026-04-10T07:44:11.406Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnslo2a50007jy04jd64ssrx', 'cmnslo29u0000jy04dk2m3mjg', 'Giải trí', 'EXPENSE', NULL, NULL, false, '2026-04-10T07:44:11.406Z', '2026-04-10T07:44:11.406Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsm5l8g0003l104u7btupih', 'cmnsm5l7c0000l104apo2ilvq', 'Lương', 'INCOME', NULL, NULL, false, '2026-04-10T07:57:49.120Z', '2026-04-10T07:57:49.120Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsm5l8g0004l104c0t7e56z', 'cmnsm5l7c0000l104apo2ilvq', 'Ăn uống', 'EXPENSE', NULL, NULL, false, '2026-04-10T07:57:49.120Z', '2026-04-10T07:57:49.120Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsm5l8g0005l1045rf7xzqe', 'cmnsm5l7c0000l104apo2ilvq', 'Di chuyển', 'EXPENSE', NULL, NULL, false, '2026-04-10T07:57:49.120Z', '2026-04-10T07:57:49.120Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsm5l8g0006l104eolirwn1', 'cmnsm5l7c0000l104apo2ilvq', 'Hóa đơn', 'EXPENSE', NULL, NULL, false, '2026-04-10T07:57:49.120Z', '2026-04-10T07:57:49.120Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsm5l8g0007l1049vqgho82', 'cmnsm5l7c0000l104apo2ilvq', 'Giải trí', 'EXPENSE', NULL, NULL, false, '2026-04-10T07:57:49.120Z', '2026-04-10T07:57:49.120Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmffi30003l205rxqrpchf', 'cmnsmffho0000l205ws62scwu', 'Lương', 'INCOME', NULL, NULL, false, '2026-04-10T08:05:28.251Z', '2026-04-10T08:05:28.251Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmffi30004l205zer5kym1', 'cmnsmffho0000l205ws62scwu', 'Ăn uống', 'EXPENSE', NULL, NULL, false, '2026-04-10T08:05:28.251Z', '2026-04-10T08:05:28.251Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmffi30005l205jxkl4h8o', 'cmnsmffho0000l205ws62scwu', 'Di chuyển', 'EXPENSE', NULL, NULL, false, '2026-04-10T08:05:28.251Z', '2026-04-10T08:05:28.251Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmffi30006l205edex51u4', 'cmnsmffho0000l205ws62scwu', 'Hóa đơn', 'EXPENSE', NULL, NULL, false, '2026-04-10T08:05:28.251Z', '2026-04-10T08:05:28.251Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmffi30007l205fnfdaq4p', 'cmnsmffho0000l205ws62scwu', 'Giải trí', 'EXPENSE', NULL, NULL, false, '2026-04-10T08:05:28.251Z', '2026-04-10T08:05:28.251Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmnuj4000dl104k1u9mw8a', 'cmnsmnuix000al10420rqd3lh', 'Lương', 'INCOME', NULL, NULL, false, '2026-04-10T08:12:00.977Z', '2026-04-10T08:12:00.977Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmnuj4000el104qj3nilsg', 'cmnsmnuix000al10420rqd3lh', 'Ăn uống', 'EXPENSE', NULL, NULL, false, '2026-04-10T08:12:00.977Z', '2026-04-10T08:12:00.977Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmnuj4000fl104h33zvpua', 'cmnsmnuix000al10420rqd3lh', 'Di chuyển', 'EXPENSE', NULL, NULL, false, '2026-04-10T08:12:00.977Z', '2026-04-10T08:12:00.977Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmnuj4000gl104v93ftd0b', 'cmnsmnuix000al10420rqd3lh', 'Hóa đơn', 'EXPENSE', NULL, NULL, false, '2026-04-10T08:12:00.977Z', '2026-04-10T08:12:00.977Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmnuj4000hl104rzdlsq9u', 'cmnsmnuix000al10420rqd3lh', 'Giải trí', 'EXPENSE', NULL, NULL, false, '2026-04-10T08:12:00.977Z', '2026-04-10T08:12:00.977Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmvxyo0003l2040ucxru6x', 'cmnsmvxyc0000l204u5j002nx', 'Lương', 'INCOME', NULL, NULL, false, '2026-04-10T08:18:18.673Z', '2026-04-10T08:18:18.673Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmvxyo0004l204m0kbmnj7', 'cmnsmvxyc0000l204u5j002nx', 'Ăn uống', 'EXPENSE', NULL, NULL, false, '2026-04-10T08:18:18.673Z', '2026-04-10T08:18:18.673Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmvxyo0005l204hnbizvx5', 'cmnsmvxyc0000l204u5j002nx', 'Di chuyển', 'EXPENSE', NULL, NULL, false, '2026-04-10T08:18:18.673Z', '2026-04-10T08:18:18.673Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmvxyo0006l204crah0haf', 'cmnsmvxyc0000l204u5j002nx', 'Hóa đơn', 'EXPENSE', NULL, NULL, false, '2026-04-10T08:18:18.673Z', '2026-04-10T08:18:18.673Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmvxyo0007l204oku0nn8g', 'cmnsmvxyc0000l204u5j002nx', 'Giải trí', 'EXPENSE', NULL, NULL, false, '2026-04-10T08:18:18.673Z', '2026-04-10T08:18:18.673Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmylc6000fl204jdptr5hg', 'cmnsmylc0000cl204fcik8ywj', 'Lương', 'INCOME', NULL, NULL, false, '2026-04-10T08:20:22.278Z', '2026-04-10T08:20:22.278Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmylc6000gl2040w98bfjh', 'cmnsmylc0000cl204fcik8ywj', 'Ăn uống', 'EXPENSE', NULL, NULL, false, '2026-04-10T08:20:22.278Z', '2026-04-10T08:20:22.278Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmylc6000hl204nzdygzoz', 'cmnsmylc0000cl204fcik8ywj', 'Di chuyển', 'EXPENSE', NULL, NULL, false, '2026-04-10T08:20:22.278Z', '2026-04-10T08:20:22.278Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmylc6000il204e2703w38', 'cmnsmylc0000cl204fcik8ywj', 'Hóa đơn', 'EXPENSE', NULL, NULL, false, '2026-04-10T08:20:22.278Z', '2026-04-10T08:20:22.278Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnsmylc6000jl204vdklpam6', 'cmnsmylc0000cl204fcik8ywj', 'Giải trí', 'EXPENSE', NULL, NULL, false, '2026-04-10T08:20:22.278Z', '2026-04-10T08:20:22.278Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnuiooyl0003jy04metycnhh', 'cmnuiooxu0000jy04ut2f9lln', 'Lương', 'INCOME', NULL, NULL, false, '2026-04-11T15:56:14.301Z', '2026-04-11T15:56:14.301Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnuiooyl0004jy046ev4q298', 'cmnuiooxu0000jy04ut2f9lln', 'Ăn uống', 'EXPENSE', NULL, NULL, false, '2026-04-11T15:56:14.301Z', '2026-04-11T15:56:14.301Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnuiooyl0005jy04dz7c1m58', 'cmnuiooxu0000jy04ut2f9lln', 'Di chuyển', 'EXPENSE', NULL, NULL, false, '2026-04-11T15:56:14.301Z', '2026-04-11T15:56:14.301Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnuiooyl0006jy04zdulbi15', 'cmnuiooxu0000jy04ut2f9lln', 'Hóa đơn', 'EXPENSE', NULL, NULL, false, '2026-04-11T15:56:14.301Z', '2026-04-11T15:56:14.301Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnuiooyl0007jy04o3a026ai', 'cmnuiooxu0000jy04ut2f9lln', 'Giải trí', 'EXPENSE', NULL, NULL, false, '2026-04-11T15:56:14.301Z', '2026-04-11T15:56:14.301Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnuiywjf0007jr04wkqnxfo9', 'cmnuiywj10004jr04n4jkj0gu', 'Lương', 'INCOME', NULL, NULL, false, '2026-04-11T16:04:10.684Z', '2026-04-11T16:04:10.684Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnuiywjf0008jr04gnu5lrk6', 'cmnuiywj10004jr04n4jkj0gu', 'Ăn uống', 'EXPENSE', NULL, NULL, false, '2026-04-11T16:04:10.684Z', '2026-04-11T16:04:10.684Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnuiywjf0009jr04j0rzgbgx', 'cmnuiywj10004jr04n4jkj0gu', 'Di chuyển', 'EXPENSE', NULL, NULL, false, '2026-04-11T16:04:10.684Z', '2026-04-11T16:04:10.684Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnuiywjf000ajr04pj7amrmf', 'cmnuiywj10004jr04n4jkj0gu', 'Hóa đơn', 'EXPENSE', NULL, NULL, false, '2026-04-11T16:04:10.684Z', '2026-04-11T16:04:10.684Z');
INSERT INTO "categories" ("id", "user_id", "name", "type", "icon", "color", "is_deleted", "created_at", "updated_at") VALUES ('cmnuiywjf000bjr048ot9dvte', 'cmnuiywj10004jr04n4jkj0gu', 'Giải trí', 'EXPENSE', NULL, NULL, false, '2026-04-11T16:04:10.684Z', '2026-04-11T16:04:10.684Z');

INSERT INTO "transactions" ("id", "user_id", "wallet_id", "to_wallet_id", "category_id", "amount", "date", "note", "receipt_url", "type", "created_at", "updated_at", "saving_goal_id", "debt_loan_id", "latitude", "location_name", "longitude", "recurring_transaction_id") VALUES ('cmnsmwbb80001l007kb797306', 'cmnsmvxyc0000l204u5j002nx', 'cmnsmvxyj0002l204u0s6rjq7', NULL, 'cmnsmvxyo0003l2040ucxru6x', '399999.0000', '2026-04-10T00:00:00.000Z', '', NULL, 'INCOME', '2026-04-10T08:18:35.972Z', '2026-04-10T08:18:35.972Z', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "transactions" ("id", "user_id", "wallet_id", "to_wallet_id", "category_id", "amount", "date", "note", "receipt_url", "type", "created_at", "updated_at", "saving_goal_id", "debt_loan_id", "latitude", "location_name", "longitude", "recurring_transaction_id") VALUES ('cmnsn98tx000bl804q3qlhzdq', 'cmnsm5l7c0000l104apo2ilvq', 'cmnsm5l7w0002l104fh83g7wr', NULL, 'cmnsm5l8g0006l104eolirwn1', '90000.0000', '2026-04-10T00:00:00.000Z', '', NULL, 'EXPENSE', '2026-04-10T08:28:39.286Z', '2026-04-10T08:28:39.286Z', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "transactions" ("id", "user_id", "wallet_id", "to_wallet_id", "category_id", "amount", "date", "note", "receipt_url", "type", "created_at", "updated_at", "saving_goal_id", "debt_loan_id", "latitude", "location_name", "longitude", "recurring_transaction_id") VALUES ('cmnsnbqh80001jr04txm8260d', 'cmnsm5l7c0000l104apo2ilvq', 'cmnsm5l7w0002l104fh83g7wr', NULL, 'cmnsm5l8g0005l1045rf7xzqe', '90000.0000', '2026-04-10T00:00:00.000Z', '', NULL, 'EXPENSE', '2026-04-10T08:30:35.468Z', '2026-04-10T08:30:35.468Z', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "transactions" ("id", "user_id", "wallet_id", "to_wallet_id", "category_id", "amount", "date", "note", "receipt_url", "type", "created_at", "updated_at", "saving_goal_id", "debt_loan_id", "latitude", "location_name", "longitude", "recurring_transaction_id") VALUES ('cmnsol9ee0005jp044wn0jccc', 'cmnslljab0000l704dv8hf9rg', 'cmnslljaq0002l704r7wtmeia', NULL, NULL, '300000.0000', '2026-04-10T00:00:00.000Z', 'Cho mượn Hữu Điền: Tiền mua loa laptop', NULL, 'EXPENSE', '2026-04-10T09:05:59.511Z', '2026-04-10T09:05:59.511Z', NULL, 'cmnsol9e50003jp04lq4asfu8', NULL, NULL, NULL, NULL);
INSERT INTO "transactions" ("id", "user_id", "wallet_id", "to_wallet_id", "category_id", "amount", "date", "note", "receipt_url", "type", "created_at", "updated_at", "saving_goal_id", "debt_loan_id", "latitude", "location_name", "longitude", "recurring_transaction_id") VALUES ('cmnsom17i0003ld040bbkkkxy', 'cmnslljab0000l704dv8hf9rg', 'cmnslljaq0002l704r7wtmeia', NULL, 'cmnslljaz0003l7048nynvs0p', '900000.0000', '2026-04-10T00:00:00.000Z', 'Lương thưởng ngày', NULL, 'INCOME', '2026-04-10T09:06:35.551Z', '2026-04-10T09:06:35.551Z', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "transactions" ("id", "user_id", "wallet_id", "to_wallet_id", "category_id", "amount", "date", "note", "receipt_url", "type", "created_at", "updated_at", "saving_goal_id", "debt_loan_id", "latitude", "location_name", "longitude", "recurring_transaction_id") VALUES ('cmnt34yte0005jm04hdghf3b4', 'cmnslo29u0000jy04dk2m3mjg', 'cmnt32frj0007kz04dt58fmg6', NULL, NULL, '1000000.0000', '2026-04-10T00:00:00.000Z', 'Cho mượn Điền:', NULL, 'EXPENSE', '2026-04-10T15:53:13.539Z', '2026-04-10T15:53:13.539Z', NULL, 'cmnt34yt50003jm04xx6431qk', NULL, NULL, NULL, NULL);
INSERT INTO "transactions" ("id", "user_id", "wallet_id", "to_wallet_id", "category_id", "amount", "date", "note", "receipt_url", "type", "created_at", "updated_at", "saving_goal_id", "debt_loan_id", "latitude", "location_name", "longitude", "recurring_transaction_id") VALUES ('cmnt3g94m0005jy04j3d07wam', 'cmnslo29u0000jy04dk2m3mjg', 'cmnt32frj0007kz04dt58fmg6', NULL, 'cmnslo2a50003jy040mlof9w5', '520000.0000', '2026-04-10T00:00:00.000Z', 'tiền lương', NULL, 'INCOME', '2026-04-10T16:02:00.118Z', '2026-04-10T16:02:00.118Z', NULL, NULL, 21.02939180913695, 'Vietcombank, 133, Phố Hàng Bông, Khu phố cổ, Phường Hoàn Kiếm, Hà Nội, 11024, Việt Nam', 105.8457183837891, NULL);
INSERT INTO "transactions" ("id", "user_id", "wallet_id", "to_wallet_id", "category_id", "amount", "date", "note", "receipt_url", "type", "created_at", "updated_at", "saving_goal_id", "debt_loan_id", "latitude", "location_name", "longitude", "recurring_transaction_id") VALUES ('cmnujl3wh0003jg043bh2c31m', 'cmnuiywj10004jr04n4jkj0gu', 'cmnuj89460001kv045xbm6hap', NULL, 'cmnuiywjf0008jr04gnu5lrk6', '40000.0000', '2026-04-11T00:00:00.000Z', 'Bát bảo ngô gia', NULL, 'EXPENSE', '2026-04-11T16:21:26.657Z', '2026-04-11T16:21:26.657Z', NULL, NULL, 10.94942465869303, 'Khu phố 5, Trảng Bom, Xã Trảng Bom, Đồng Nai Province, 76000, Vietnam', 107.0039661444095, NULL);
INSERT INTO "transactions" ("id", "user_id", "wallet_id", "to_wallet_id", "category_id", "amount", "date", "note", "receipt_url", "type", "created_at", "updated_at", "saving_goal_id", "debt_loan_id", "latitude", "location_name", "longitude", "recurring_transaction_id") VALUES ('cmnuygd500005k004z5irjabz', 'cmnuiooxu0000jy04ut2f9lln', 'cmnuiooy30002jy0437ue4bkw', NULL, 'cmnuiooyl0003jy04metycnhh', '7000000.0000', '2026-04-05T00:00:00.000Z', '', NULL, 'INCOME', '2026-04-11T23:17:39.589Z', '2026-04-11T23:17:39.589Z', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "transactions" ("id", "user_id", "wallet_id", "to_wallet_id", "category_id", "amount", "date", "note", "receipt_url", "type", "created_at", "updated_at", "saving_goal_id", "debt_loan_id", "latitude", "location_name", "longitude", "recurring_transaction_id") VALUES ('cmnuylhjl000dli04ocpu3doh', 'cmnuiooxu0000jy04ut2f9lln', 'cmnuiooy30002jy0437ue4bkw', NULL, 'cmnuiooyl0004jy046ev4q298', '54090.0000', '2026-04-11T00:00:00.000Z', '''CÀ PHÊ HOÀNG PHÚC.', NULL, 'EXPENSE', '2026-04-11T23:21:38.577Z', '2026-04-11T23:21:38.577Z', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "transactions" ("id", "user_id", "wallet_id", "to_wallet_id", "category_id", "amount", "date", "note", "receipt_url", "type", "created_at", "updated_at", "saving_goal_id", "debt_loan_id", "latitude", "location_name", "longitude", "recurring_transaction_id") VALUES ('cmnuylhk1000fli04w1i2k1xv', 'cmnuiooxu0000jy04ut2f9lln', 'cmnuiooy30002jy0437ue4bkw', NULL, NULL, '5910.0000', '2026-04-11T00:00:00.000Z', 'Tiết kiệm tự động (Round-up) từ giao dịch 54.090đ', NULL, 'EXPENSE', '2026-04-11T23:21:38.594Z', '2026-04-11T23:21:38.594Z', 'cmnuyk7sk000bli04n9bywyr5', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "transactions" ("id", "user_id", "wallet_id", "to_wallet_id", "category_id", "amount", "date", "note", "receipt_url", "type", "created_at", "updated_at", "saving_goal_id", "debt_loan_id", "latitude", "location_name", "longitude", "recurring_transaction_id") VALUES ('cmnuyp3ad0007la04n93o8c2f', 'cmnuiooxu0000jy04ut2f9lln', 'cmnuiooy30002jy0437ue4bkw', NULL, 'cmnuiooyl0004jy046ev4q298', '167000.0000', '2026-04-07T00:00:00.000Z', 'cơ ->', NULL, 'EXPENSE', '2026-04-11T23:24:26.725Z', '2026-04-11T23:24:26.725Z', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "transactions" ("id", "user_id", "wallet_id", "to_wallet_id", "category_id", "amount", "date", "note", "receipt_url", "type", "created_at", "updated_at", "saving_goal_id", "debt_loan_id", "latitude", "location_name", "longitude", "recurring_transaction_id") VALUES ('cmnuyp3aw0009la04ekr9czag', 'cmnuiooxu0000jy04ut2f9lln', 'cmnuiooy30002jy0437ue4bkw', NULL, NULL, '3000.0000', '2026-04-07T00:00:00.000Z', 'Tiết kiệm tự động (Round-up) từ giao dịch 167.000đ', NULL, 'EXPENSE', '2026-04-11T23:24:26.744Z', '2026-04-11T23:24:26.744Z', 'cmnuyk7sk000bli04n9bywyr5', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "transactions" ("id", "user_id", "wallet_id", "to_wallet_id", "category_id", "amount", "date", "note", "receipt_url", "type", "created_at", "updated_at", "saving_goal_id", "debt_loan_id", "latitude", "location_name", "longitude", "recurring_transaction_id") VALUES ('cmnuypoh70001js047f8nm035', 'cmnuiooxu0000jy04ut2f9lln', 'cmnuiooy30002jy0437ue4bkw', NULL, 'cmnuiooyl0005jy04dz7c1m58', '100000.0000', '2026-04-11T00:00:00.000Z', '', NULL, 'EXPENSE', '2026-04-11T23:24:54.187Z', '2026-04-11T23:24:54.187Z', NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO "budgets" ("id", "user_id", "category_id", "limit_amount", "month_year", "created_at", "updated_at") VALUES ('cmnsn6wsb000rl204d3qrev6i', 'cmnsm5l7c0000l104apo2ilvq', 'cmnsm5l8g0005l1045rf7xzqe', '100000.0000', '2026-03-31T17:00:00.000Z', '2026-04-10T08:26:50.325Z', '2026-04-10T08:26:50.325Z');
INSERT INTO "budgets" ("id", "user_id", "category_id", "limit_amount", "month_year", "created_at", "updated_at") VALUES ('cmnt3338n0009kz04entcazcg', 'cmnslo29u0000jy04dk2m3mjg', 'cmnslo2a50004jy04vjabbuk3', '10000000.0000', '2026-03-31T17:00:00.000Z', '2026-04-10T15:51:45.957Z', '2026-04-10T15:51:45.957Z');
INSERT INTO "budgets" ("id", "user_id", "category_id", "limit_amount", "month_year", "created_at", "updated_at") VALUES ('cmnt33bwb000bkz04lzzd7tkc', 'cmnslo29u0000jy04dk2m3mjg', 'cmnslo2a50007jy04jd64ssrx', '111111.0000', '2026-03-31T17:00:00.000Z', '2026-04-10T15:51:57.180Z', '2026-04-10T15:51:57.180Z');
INSERT INTO "budgets" ("id", "user_id", "category_id", "limit_amount", "month_year", "created_at", "updated_at") VALUES ('cmnuyi7m70005li04b4l0d1nm', 'cmnuiooxu0000jy04ut2f9lln', 'cmnuiooyl0005jy04dz7c1m58', '500000.0000', '2026-03-31T17:00:00.000Z', '2026-04-11T23:19:05.742Z', '2026-04-11T23:19:05.742Z');
INSERT INTO "budgets" ("id", "user_id", "category_id", "limit_amount", "month_year", "created_at", "updated_at") VALUES ('cmnuyihaz0007li043omq3amz', 'cmnuiooxu0000jy04ut2f9lln', 'cmnuiooyl0007jy04o3a026ai', '1000000.0000', '2026-03-31T17:00:00.000Z', '2026-04-11T23:19:18.298Z', '2026-04-11T23:19:18.298Z');
INSERT INTO "budgets" ("id", "user_id", "category_id", "limit_amount", "month_year", "created_at", "updated_at") VALUES ('cmnuyixim0009li04za0jlp0s', 'cmnuiooxu0000jy04ut2f9lln', 'cmnuiooyl0004jy046ev4q298', '3500000.0000', '2026-03-31T17:00:00.000Z', '2026-04-11T23:19:39.308Z', '2026-04-11T23:19:39.308Z');

INSERT INTO "saving_goals" ("id", "user_id", "name", "target_amount", "current_amount", "deadline_date", "created_at", "updated_at", "is_round_up") VALUES ('cmnt33uuf0001jm0426egymd0', 'cmnslo29u0000jy04dk2m3mjg', 'Mua xe', '500000000.0000', '0.0000', '2026-05-15T17:00:00.000Z', '2026-04-10T15:52:21.735Z', '2026-04-10T15:52:21.735Z', true);
INSERT INTO "saving_goals" ("id", "user_id", "name", "target_amount", "current_amount", "deadline_date", "created_at", "updated_at", "is_round_up") VALUES ('cmnujtqez0003ih04hlgqg137', 'cmnuiywj10004jr04n4jkj0gu', 'Đi Vũng Tàu', '1000000.0000', '0.0000', '2026-05-09T17:00:00.000Z', '2026-04-11T16:28:09.056Z', '2026-04-11T16:28:09.056Z', true);
INSERT INTO "saving_goals" ("id", "user_id", "name", "target_amount", "current_amount", "deadline_date", "created_at", "updated_at", "is_round_up") VALUES ('cmnuyk7sk000bli04n9bywyr5', 'cmnuiooxu0000jy04ut2f9lln', 'Mua Đt mới', '5000000.0000', '8910.0000', '2026-12-31T17:00:00.000Z', '2026-04-11T23:20:39.283Z', '2026-04-11T23:24:26.739Z', true);

INSERT INTO "recurring_transactions" ("id", "user_id", "wallet_id", "to_wallet_id", "category_id", "amount", "type", "note", "interval", "status", "start_date", "end_date", "next_processing_date", "last_processed_date", "created_at", "updated_at") VALUES ('cmnsok6nj0001ld0429iwp5in', 'cmnslljab0000l704dv8hf9rg', 'cmnslljaq0002l704r7wtmeia', NULL, 'cmnslljaz0004l7041jwoyh6o', '75000.0000', 'EXPENSE', 'Tiền ăn mỗi ngày', 'DAILY', 'ACTIVE', '2026-04-09T17:00:00.000Z', '2026-05-09T17:00:00.000Z', '2026-04-09T17:00:00.000Z', NULL, '2026-04-10T09:05:09.292Z', '2026-04-10T09:05:09.292Z');
INSERT INTO "recurring_transactions" ("id", "user_id", "wallet_id", "to_wallet_id", "category_id", "amount", "type", "note", "interval", "status", "start_date", "end_date", "next_processing_date", "last_processed_date", "created_at", "updated_at") VALUES ('cmnt34gm10001jy04hlrfh1jk', 'cmnslo29u0000jy04dk2m3mjg', 'cmnslo2a10002jy044he6vlbb', 'cmnt32frj0007kz04dt58fmg6', NULL, '100000.0000', 'TRANSFER', 'tiền xăng', 'WEEKLY', 'ACTIVE', '2026-04-09T17:00:00.000Z', '2026-04-15T17:00:00.000Z', '2026-04-09T17:00:00.000Z', NULL, '2026-04-10T15:52:49.944Z', '2026-04-10T15:52:49.944Z');
INSERT INTO "recurring_transactions" ("id", "user_id", "wallet_id", "to_wallet_id", "category_id", "amount", "type", "note", "interval", "status", "start_date", "end_date", "next_processing_date", "last_processed_date", "created_at", "updated_at") VALUES ('cmnuywde3000bla040xtrbouc', 'cmnuiooxu0000jy04ut2f9lln', 'cmnuiooy30002jy0437ue4bkw', NULL, 'cmnuiooyl0006jy04zdulbi15', '900000.0000', 'EXPENSE', 'Tiền phòng', 'MONTHLY', 'ACTIVE', '2026-04-12T17:00:00.000Z', NULL, '2026-04-12T17:00:00.000Z', NULL, '2026-04-11T23:30:06.390Z', '2026-04-11T23:30:06.390Z');

INSERT INTO "debts_loans" ("id", "user_id", "wallet_id", "person_name", "type", "status", "amount", "remaining_amount", "due_date", "start_date", "note", "created_at", "updated_at") VALUES ('cmnsol9e50003jp04lq4asfu8', 'cmnslljab0000l704dv8hf9rg', 'cmnslljaq0002l704r7wtmeia', 'Hữu Điền', 'LOAN', 'OPEN', '300000.0000', '300000.0000', '2026-06-09T17:00:00.000Z', '2026-04-09T17:00:00.000Z', 'Tiền mua loa laptop', '2026-04-10T09:05:59.502Z', '2026-04-10T09:05:59.502Z');
INSERT INTO "debts_loans" ("id", "user_id", "wallet_id", "person_name", "type", "status", "amount", "remaining_amount", "due_date", "start_date", "note", "created_at", "updated_at") VALUES ('cmnt34yt50003jm04xx6431qk', 'cmnslo29u0000jy04dk2m3mjg', 'cmnt32frj0007kz04dt58fmg6', 'Điền', 'LOAN', 'OPEN', '1000000.0000', '1000000.0000', '2026-04-29T17:00:00.000Z', '2026-04-09T17:00:00.000Z', '', '2026-04-10T15:53:13.529Z', '2026-04-10T15:53:13.529Z');

INSERT INTO "tags" ("id", "user_id", "name", "color", "created_at", "updated_at") VALUES ('cmnt3g1eo0003jy04r6cx6qqf', 'cmnslo29u0000jy04dk2m3mjg', 'luong1', '#ef4444', '2026-04-10T16:01:50.113Z', '2026-04-10T16:01:50.113Z');
INSERT INTO "tags" ("id", "user_id", "name", "color", "created_at", "updated_at") VALUES ('cmnujayps0001jg041zfkjnua', 'cmnuiywj10004jr04n4jkj0gu', 'an-uong', '#ef4444', '2026-04-11T16:13:33.362Z', '2026-04-11T16:13:33.362Z');

INSERT INTO "tags_on_transactions" ("tag_id", "transaction_id") VALUES ('cmnt3g1eo0003jy04r6cx6qqf', 'cmnt3g94m0005jy04j3d07wam');
INSERT INTO "tags_on_transactions" ("tag_id", "transaction_id") VALUES ('cmnujayps0001jg041zfkjnua', 'cmnujl3wh0003jg043bh2c31m');

INSERT INTO "notifications" ("id", "user_id", "type", "title", "message", "link", "is_read", "read_at", "dedupe_key", "created_at") VALUES ('cmnslspp900017kc8taa8bmye', 'cmnslljab0000l704dv8hf9rg', 'SYSTEM', 'Hệ thống đã ổn định', 'Thông báo này xác nhận tính năng thông báo đang hoạt động chính xác trên máy của bạn.', '/', false, NULL, 'system-stable:cmnslljab0000l704dv8hf9rg', '2026-04-10T00:47:48.381Z');
INSERT INTO "notifications" ("id", "user_id", "type", "title", "message", "link", "is_read", "read_at", "dedupe_key", "created_at") VALUES ('cmnslspwp00037kc8x2apzuhy', 'cmnslo29u0000jy04dk2m3mjg', 'SYSTEM', 'Hệ thống đã ổn định', 'Thông báo này xác nhận tính năng thông báo đang hoạt động chính xác trên máy của bạn.', '/', true, '2026-04-10T01:21:23.466Z', 'system-stable:cmnslo29u0000jy04dk2m3mjg', '2026-04-10T00:47:48.649Z');
INSERT INTO "notifications" ("id", "user_id", "type", "title", "message", "link", "is_read", "read_at", "dedupe_key", "created_at") VALUES ('cmnsncslg0005jr04mviv3qxj', 'cmnsm5l7c0000l104apo2ilvq', 'BUDGET_WARNING', 'Sắp chạm ngưỡng ngân sách: Di chuyển', 'Bạn đã sử dụng 90% ngân sách của danh mục Di chuyển.', '/budgets', true, '2026-04-10T01:31:45.014Z', 'budget-warning:cmnsn6wsb000rl204d3qrev6i:2026-04', '2026-04-10T01:31:24.869Z');
INSERT INTO "notifications" ("id", "user_id", "type", "title", "message", "link", "is_read", "read_at", "dedupe_key", "created_at") VALUES ('cmnsook690005l104xyzwgtve', 'cmnslljab0000l704dv8hf9rg', 'RECURRING_DUE', 'Sắp đến hạn: Tiền ăn mỗi ngày', 'Giao dịch định kỳ "Tiền ăn mỗi ngày" sẽ được xử lý vào ngày 10/04/2026.', '/recurring-transactions', true, '2026-04-10T02:10:09.648Z', 'recurring-due:cmnsok6nj0001ld0429iwp5in:2026-04-10', '2026-04-10T02:08:33.442Z');
INSERT INTO "notifications" ("id", "user_id", "type", "title", "message", "link", "is_read", "read_at", "dedupe_key", "created_at") VALUES ('cmnt382jg0005jp04kn0gshwd', 'cmnslo29u0000jy04dk2m3mjg', 'BUDGET_EXCEEDED', 'Đã vượt ngân sách: Ăn uống', 'Bạn đã chi 263% ngân sách cho danh mục Ăn uống. Hãy kiểm soát các khoản phát sinh tiếp theo.', '/budgets', false, NULL, 'budget-exceeded:cmnt3338n0009kz04entcazcg:2026-04', '2026-04-10T08:55:38.332Z');
INSERT INTO "notifications" ("id", "user_id", "type", "title", "message", "link", "is_read", "read_at", "dedupe_key", "created_at") VALUES ('cmnt382jt0007jp04wk7sse7b', 'cmnslo29u0000jy04dk2m3mjg', 'RECURRING_DUE', 'Sắp đến hạn: tiền xăng', 'Giao dịch định kỳ "tiền xăng" sẽ được xử lý vào ngày 10/04/2026.', '/recurring-transactions', false, NULL, 'recurring-due:cmnt34gm10001jy04hlrfh1jk:2026-04-10', '2026-04-10T08:55:38.346Z');
INSERT INTO "notifications" ("id", "user_id", "type", "title", "message", "link", "is_read", "read_at", "dedupe_key", "created_at") VALUES ('cmnuyeyzb0003k004nlqdry3t', 'cmnuiooxu0000jy04ut2f9lln', 'DAILY_INPUT_REMINDER', 'Nhắc nhập liệu hôm nay', 'Hôm nay bạn chưa ghi nhận giao dịch nào. Hãy cập nhật để theo dõi chi tiêu chính xác hơn.', '/transactions', true, '2026-04-11T16:22:23.815Z', 'daily-input:cmnuiooxu0000jy04ut2f9lln:2026-04-11', '2026-04-11T16:16:34.584Z');

INSERT INTO "notification_preferences" ("id", "user_id", "daily_input_enabled", "budget_alert_enabled", "recurring_reminder_enabled", "daily_reminder_hour", "recurring_reminder_days", "created_at", "updated_at") VALUES ('cmnsmv8t80001l804js3c1q8x', 'cmnslljab0000l704dv8hf9rg', true, true, true, 20, 2, '2026-04-10T01:17:46.076Z', '2026-04-10T01:17:46.076Z');
INSERT INTO "notification_preferences" ("id", "user_id", "daily_input_enabled", "budget_alert_enabled", "recurring_reminder_enabled", "daily_reminder_hour", "recurring_reminder_days", "created_at", "updated_at") VALUES ('cmnsmvzwd0001l804eqbgby2l', 'cmnsmvxyc0000l204u5j002nx', true, true, true, 20, 2, '2026-04-10T01:18:21.176Z', '2026-04-10T01:18:21.176Z');
INSERT INTO "notification_preferences" ("id", "user_id", "daily_input_enabled", "budget_alert_enabled", "recurring_reminder_enabled", "daily_reminder_hour", "recurring_reminder_days", "created_at", "updated_at") VALUES ('cmnsmym4g000ll204gsidz1zl', 'cmnsmylc0000cl204fcik8ywj', true, true, true, 20, 2, '2026-04-10T01:20:23.297Z', '2026-04-10T01:20:23.297Z');
INSERT INTO "notification_preferences" ("id", "user_id", "daily_input_enabled", "budget_alert_enabled", "recurring_reminder_enabled", "daily_reminder_hour", "recurring_reminder_days", "created_at", "updated_at") VALUES ('cmnsmzsyb000nl2046f48u2lm', 'cmnslo29u0000jy04dk2m3mjg', true, true, true, 20, 2, '2026-04-10T01:21:18.801Z', '2026-04-10T01:21:18.801Z');
INSERT INTO "notification_preferences" ("id", "user_id", "daily_input_enabled", "budget_alert_enabled", "recurring_reminder_enabled", "daily_reminder_hour", "recurring_reminder_days", "created_at", "updated_at") VALUES ('cmnsn0xev0009l804l46gbxh1', 'cmnsm5l7c0000l104apo2ilvq', true, true, true, 20, 2, '2026-04-10T01:22:11.239Z', '2026-04-10T01:22:11.239Z');
INSERT INTO "notification_preferences" ("id", "user_id", "daily_input_enabled", "budget_alert_enabled", "recurring_reminder_enabled", "daily_reminder_hour", "recurring_reminder_days", "created_at", "updated_at") VALUES ('cmnsnhp2t0003jk04soc42bgm', 'cmnsmnuix000al10420rqd3lh', true, true, true, 20, 2, '2026-04-10T01:35:13.589Z', '2026-04-10T01:35:13.589Z');
INSERT INTO "notification_preferences" ("id", "user_id", "daily_input_enabled", "budget_alert_enabled", "recurring_reminder_enabled", "daily_reminder_hour", "recurring_reminder_days", "created_at", "updated_at") VALUES ('cmnuioq4x0001jq04b3ooitvi', 'cmnuiooxu0000jy04ut2f9lln', true, true, true, 20, 2, '2026-04-11T08:56:15.826Z', '2026-04-11T08:56:15.826Z');
INSERT INTO "notification_preferences" ("id", "user_id", "daily_input_enabled", "budget_alert_enabled", "recurring_reminder_enabled", "daily_reminder_hour", "recurring_reminder_days", "created_at", "updated_at") VALUES ('cmnuiyx6e0009jy04atzhqcea', 'cmnuiywj10004jr04n4jkj0gu', true, true, true, 20, 2, '2026-04-11T09:04:11.510Z', '2026-04-11T09:04:11.510Z');

INSERT INTO "otp_tokens" ("id", "user_id", "code_hash", "purpose", "expires_at", "used", "created_at") VALUES ('cmnsmxyit000bl2045maghdjt', 'cmnsmffho0000l205ws62scwu', '$2b$06$Tlg1bPS61BZDnJD36JmRL./lejatnbTjPULGh6ZRLrJifIX6WUQKW', 'LOGIN', '2026-04-10T01:29:52.709Z', false, '2026-04-10T01:19:52.710Z');
INSERT INTO "otp_tokens" ("id", "user_id", "code_hash", "purpose", "expires_at", "used", "created_at") VALUES ('cmnsnrt2s0003jr044he43ilx', 'cmnslljab0000l704dv8hf9rg', '$2b$06$h8w3R3.zk58fYSbJUDRcauAlLdN8zbF2L4feGRKcyEgbM7Kcg1WL6', 'LOGIN', '2026-04-10T01:53:05.331Z', true, '2026-04-10T01:43:05.332Z');
INSERT INTO "otp_tokens" ("id", "user_id", "code_hash", "purpose", "expires_at", "used", "created_at") VALUES ('cmnt2vxx10001kz04i7x889z8', 'cmnslo29u0000jy04dk2m3mjg', '$2b$06$ilbabOjfPdhL61LAulvykeL1R3aOUqhFHLgwTrcq52h5OtXmCyAwy', 'LOGIN', '2026-04-10T08:56:12.469Z', true, '2026-04-10T08:46:12.470Z');
INSERT INTO "otp_tokens" ("id", "user_id", "code_hash", "purpose", "expires_at", "used", "created_at") VALUES ('cmnuk94ay0003kz045p8ot7t6', 'cmnuiywj10004jr04n4jkj0gu', '$2b$06$jxwy0Ep3nhQSVfqxVpVXh./OYOFQp3hbbdB4XJp5MZ0WOhTy9hcLa', 'LOGIN', '2026-04-11T09:50:06.921Z', true, '2026-04-11T09:40:06.922Z');
INSERT INTO "otp_tokens" ("id", "user_id", "code_hash", "purpose", "expires_at", "used", "created_at") VALUES ('cmnuyeadm0001li042e1h0p3f', 'cmnuiooxu0000jy04ut2f9lln', '$2b$06$RO88uRwQKkOsRk9iP164HuZczAhg2/Puv3epPqm6rTZCWRIKV.Nz2', 'LOGIN', '2026-04-11T16:26:02.698Z', true, '2026-04-11T16:16:02.699Z');

INSERT INTO "known_ips" ("id", "user_id", "ip_address", "last_seen_at") VALUES ('cmnsnwge50005jr0448hul4tv', 'cmnslljab0000l704dv8hf9rg', '171.236.229.197', '2026-04-10T04:20:03.112Z');
INSERT INTO "known_ips" ("id", "user_id", "ip_address", "last_seen_at") VALUES ('cmnt2x51v0003kz041dx94s72', 'cmnslo29u0000jy04dk2m3mjg', '14.191.104.115', '2026-04-10T09:10:37.052Z');
INSERT INTO "known_ips" ("id", "user_id", "ip_address", "last_seen_at") VALUES ('cmnuk9zkn0005kz04s7c4rli6', 'cmnuiywj10004jr04n4jkj0gu', '115.75.241.229', '2026-04-11T09:40:47.447Z');
INSERT INTO "known_ips" ("id", "user_id", "ip_address", "last_seen_at") VALUES ('cmnuyey930003li04sq8d2cxk', 'cmnuiooxu0000jy04ut2f9lln', '115.76.50.183', '2026-04-11T16:16:33.640Z');

SET session_replication_role = 'origin';
