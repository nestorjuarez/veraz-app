import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return false;
    }
    return true;
}

export async function GET() {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                cuit: true,
                createdAt: true,
            },
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener los usuarios' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { name, email, password, role, cuit } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'El email ya está en uso' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                cuit: cuit || null,
            },
        });

        const { password: _, ...userWithoutPassword } = newUser;
        return NextResponse.json(userWithoutPassword, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: 'Error al crear el usuario' }, { status: 500 });
    }
}
