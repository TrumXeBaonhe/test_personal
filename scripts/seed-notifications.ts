import { PrismaClient, NotificationType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  
  console.log(`Đang khởi tạo thông báo cho ${users.length} người dùng...`);

  for (const user of users) {
    const dedupeKey = `system-stable:${user.id}`;
    
    await prisma.notification.upsert({
      where: { dedupeKey },
      update: {},
      create: {
        userId: user.id,
        type: NotificationType.SYSTEM,
        title: "Hệ thống đã ổn định",
        message: "Thông báo này xác nhận tính năng thông báo đang hoạt động chính xác trên máy của bạn.",
        link: "/",
        dedupeKey,
        isRead: false,
      },
    });
  }

  console.log("Đã khởi tạo thông báo thành công!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
