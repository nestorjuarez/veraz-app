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

  const comercioEmail = 'comercio@veraz.com';
  let comercio = await prisma.user.findUnique({
    where: { email: comercioEmail },
  });

  if (!comercio) {
    const hashedPassword = await bcrypt.hash('comercio2300', 10);
    comercio = await prisma.user.create({
      data: {
        email: comercioEmail,
        name: 'Comercio',
        password: hashedPassword,
        cuit: '30-12345678-9',
        role: Role.COMERCIO,
      },
    });
    console.log(`Usuario de comercio creado: ${comercio.email}`);
  } else {
    console.log(`El usuario de comercio ya existe.`);
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
