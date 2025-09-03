import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // hash the password
  const email=process.env.ADMIN_EMAIL;
  if (!email) {
    throw new Error("ADMIN_EMAIL environment variable is not set");
  }
  const adminPassword=process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD environment variable is not set");
  }
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { email: email},
    update: {},
    create: {
      email: email,
      password: hashedPassword,
    },
  });

  console.log("✅ Admin seeded");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
