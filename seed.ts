// seed.ts
import { PrismaClient, Role } from './src/app/generated-prisma-client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(`Comenzando el sembrado de datos...`);

  const adminEmail = 'admin@veraz.com';
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin2300', 10);
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Administrador',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log(`Usuario administrador creado: ${admin.email}`);
  } else {
    console.log(`El usuario administrador ya existe.`);
  }

  console.log(`Sembrado de datos finalizado.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
