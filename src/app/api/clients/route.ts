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

// GET /api/clients - Obtener todos los clientes de un comercio
export async function GET() {
    const comercioId = await getCommerceId();
    if (!comercioId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        const clients = await prisma.client.findMany({
            where: {
                debts: {
                    some: {
                        comercioId: comercioId,
                        status: {
                            in: ['PENDING', 'PARTIAL']
                        }
                    },
                },
            },
            include: {
                debts: {
                    where: {
                        comercioId: comercioId,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    }
                },
            },
        });

        const clientsWithTotals = clients.map(client => {
            const activeDebts = client.debts.filter(debt => debt.status === 'PENDING' || debt.status === 'PARTIAL');
            const totalDebt = activeDebts.reduce((sum, debt) => sum + debt.amount, 0);

            return {
                ...client,
                totalDebt,
                activeDebts: activeDebts.length,
            };
        });

        return NextResponse.json(clientsWithTotals);
    } catch (error) {
        console.error("Error fetching clients:", error);
        return NextResponse.json({ error: 'Error al obtener los clientes' }, { status: 500 });
    }
}

// POST /api/clients - Crear un nuevo cliente (usado indirectamente al crear deuda)
export async function POST(request: Request) {
     const comercioId = await getCommerceId();
    if (!comercioId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { dni, firstName, lastName, email, phone } = body;

        if (!dni || !firstName || !lastName) {
            return NextResponse.json({ error: 'DNI, nombre y apellido son requeridos' }, { status: 400 });
        }

        // We don't create clients here anymore, it's handled by the debt creation.
        // This endpoint could be removed or repurposed if needed.
        // For now, returning an error to prevent misuse.
        return NextResponse.json({ error: 'Método no permitido. Los clientes se crean al registrar una deuda.' }, { status: 405 });


    } catch (error) {
        // @ts-ignore
        if (error.code === 'P2002') { // Prisma unique constraint violation
            return NextResponse.json({ error: `El DNI o email ya existe.` }, { status: 409 });
        }
        return NextResponse.json({ error: 'Error al crear el cliente' }, { status: 500 });
    }
}
