import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getCommerceId() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'COMERCIO') {
        return null;
    }
    return parseInt(session.user.id, 10);
}

export async function GET(request: Request, { params }: { params: { dni: string } }) {
    const comercioId = await getCommerceId();
    if (!comercioId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        const client = await prisma.client.findUnique({
            where: { dni: params.dni },
            include: {
                debts: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        comercio: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!client) {
            return NextResponse.json({ error: 'Cliente no encontrado con el DNI proporcionado.' }, { status: 404 });
        }
        
        // Recalculate totals for all debts, regardless of commerce
        const activeDebts = client.debts.filter(debt => debt.status === 'PENDING' || debt.status === 'PARTIAL');
        const totalDebt = activeDebts.reduce((sum, debt) => sum + debt.amount, 0);

        return NextResponse.json({
            ...client,
            totalDebt,
            activeDebts: activeDebts.length,
        });

    } catch (error) {
        console.error("Error fetching client by DNI:", error);
        return NextResponse.json({ error: 'Error al buscar el cliente' }, { status: 500 });
    }
}
