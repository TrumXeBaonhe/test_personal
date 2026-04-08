import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = "test@example.com";
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      fullName: "Test User",
      passwordHash: hashedPassword,
    },
  });

  const wallet1 = await prisma.wallet.create({
    data: {
      userId: user.id,
      name: "Ví Chính",
      balance: 10000000,
    },
  });

  const wallet2 = await prisma.wallet.create({
    data: {
      userId: user.id,
      name: "Tiết kiệm",
      balance: 5000000,
    },
  });

  const categories = await prisma.category.findMany({ where: { userId: user.id } });
  let catIncome, catExpense;
  if (categories.length === 0) {
    catIncome = await prisma.category.create({ data: { userId: user.id, name: "Lương", type: "INCOME" } });
    catExpense = await prisma.category.create({ data: { userId: user.id, name: "Ăn uống", type: "EXPENSE" } });
  } else {
    catIncome = categories.find(c => c.type === "INCOME");
    catExpense = categories.find(c => c.type === "EXPENSE");
  }

  // Create 15 transactions
  for (let i = 1; i <= 15; i++) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        walletId: wallet1.id,
        categoryId: i % 2 === 0 ? catIncome.id : catExpense.id,
        type: i % 2 === 0 ? "INCOME" : "EXPENSE",
        amount: 10000 * i,
        date: new Date(),
        note: `Giao dịch mẫu số ${i}`,
      },
    });
  }

  // Create a transfer
  await prisma.transaction.create({
    data: {
      userId: user.id,
      walletId: wallet1.id,
      toWalletId: wallet2.id,
      type: "TRANSFER",
      amount: 500000,
      date: new Date(),
      note: "Chuyển sang tiết kiệm",
    },
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
