import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create default payment provider
  await prisma.paymentProvider.upsert({
    where: { name: "mock" },
    update: {},
    create: {
      name: "mock",
      type: "MOCK",
      config: {},
      isActive: true,
    },
  });

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
