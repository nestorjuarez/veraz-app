import { PrismaClient } from '@/app/generated-prisma-client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more: https://pris.ly/d/help/next-js-best-practices

const prismaClientSingleton = () => {
  const databaseUrl = process.env.OVERRIDE_DATABASE_URL || process.env.DATABASE_URL;
  console.log(`--- PRISMA DIAGNOSTIC --- Intentando usar URL que empieza con: ${databaseUrl ? databaseUrl.substring(0, 40) : 'URL NO ENCONTRADA'}`);

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
