import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return false;
    }
    return true;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(params.id) },
            select: { id: true, name: true, email: true, role: true, cuit: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener el usuario' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { name, email, role, cuit, password } = body;

        const dataToUpdate: any = { name, email, role, cuit };

        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(params.id) },
            data: dataToUpdate,
        });

        const { password: _, ...userWithoutPassword } = updatedUser;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        return NextResponse.json({ error: 'Error al actualizar el usuario' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        await prisma.user.delete({
            where: { id: parseInt(params.id) },
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json({ error: 'Error al eliminar el usuario' }, { status: 500 });
    }
}
