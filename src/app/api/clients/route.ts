import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getCommerceId() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'COMERCIO') {
        return null;
    }
    return parseInt(session.user.id);
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
                    },
                },
            },
            include: {
                debts: {
                    where: {
                        comercioId: comercioId,
                    },
                },
            },
        });
        return NextResponse.json(clients);
    } catch (error) {
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

        const newClient = await prisma.client.create({
            data: {
                dni,
                firstName,
                lastName,
                email,
                phone,
            },
        });

        return NextResponse.json(newClient, { status: 201 });

    } catch (error) {
        // @ts-ignore
        if (error.code === 'P2002') { // Código de error de Prisma para violaciones de unicidad
            return NextResponse.json({ error: `El DNI o email ya existe.` }, { status: 409 });
        }
        return NextResponse.json({ error: 'Error al crear el cliente' }, { status: 500 });
    }
}
