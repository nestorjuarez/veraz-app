import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('--- Iniciando autorización en Vercel ---');
        if (!credentials?.email || !credentials?.password) {
          console.log('Error: Faltan credenciales.');
          return null;
        }
        console.log(`Intentando encontrar usuario con email: ${credentials.email}`);

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log('Resultado: Usuario no encontrado en la base de datos.');
          return null;
        }
        
        console.log(`Usuario encontrado: ${user.name}. Comparando contraseñas...`);
        
        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        
        console.log(`Resultado de la comparación de contraseñas: ${passwordMatch}`);

        if (passwordMatch) {
          console.log('Éxito: Contraseña correcta. Autorización concedida.');
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } else {
          console.log('Error: Contraseña incorrecta.');
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role!;
      }
      return token;
    },
    async session({ session, token }) {
        if (session.user) {
            session.user.id = token.id as string;
            session.user.role = token.role as string;
        }
        return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
