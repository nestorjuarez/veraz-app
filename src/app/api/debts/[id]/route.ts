import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { DebtStatus } from '@prisma/client';

async function getCommerceId() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'COMERCIO') {
        return null;
    }
    return parseInt(session.user.id, 10);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const commerceId = await getCommerceId();
    if (!commerceId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;
    const { status } = await request.json();

    if (!status) {
        return NextResponse.json({ error: 'El estado es requerido' }, { status: 400 });
    }
    
    if (!Object.values(DebtStatus).includes(status)) {
        return NextResponse.json({ error: 'Estado no válido' }, { status: 400 });
    }

    try {
        const debtId = parseInt(id, 10);
        if (isNaN(debtId)) {
            return NextResponse.json({ error: 'ID de deuda no válido' }, { status: 400 });
        }

        const debt = await prisma.debt.findUnique({
            where: { id: debtId },
        });

        if (!debt) {
            return NextResponse.json({ error: 'Deuda no encontrada' }, { status: 404 });
        }

        if (debt.comercioId !== commerceId) {
            return NextResponse.json({ error: 'No autorizado para modificar esta deuda' }, { status: 403 });
        }

        const updatedDebt = await prisma.debt.update({
            where: { id: debtId },
            data: { status },
        });

        return NextResponse.json(updatedDebt);
    } catch (error) {
        console.error('Error al actualizar la deuda:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
