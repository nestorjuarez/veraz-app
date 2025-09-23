// seed.ts
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Comenzando el sembrado de datos...');

  const adminEmail = 'admin@veraz.com';
  const comercioEmail = 'comercio@veraz.com';

  // Forzar reconstrucción en Vercel
  
  // Crear o actualizar usuario Admin
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminUser) {
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
    const hashedPassword = await bcrypt.hash('admin2300', 10);
    await prisma.user.update({
      where: { email: adminEmail },
      data: { password: hashedPassword },
    });
    console.log(`La contraseña del administrador ha sido actualizada.`);
  }

  const comercio = await prisma.user.findUnique({
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
    const hashedPassword = await bcrypt.hash('comercio2300', 10);
    await prisma.user.update({
      where: { email: comercioEmail },
      data: { password: hashedPassword },
    });
    console.log(`La contraseña del usuario de comercio ha sido actualizada.`);
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
