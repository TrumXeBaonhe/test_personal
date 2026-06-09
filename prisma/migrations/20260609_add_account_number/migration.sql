-- AlterTable
ALTER TABLE "users" ADD COLUMN "account_number" TEXT;

-- CreateIndex  
CREATE UNIQUE INDEX "users_account_number_key" ON "users"("account_number");
