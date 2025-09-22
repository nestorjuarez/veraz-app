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

// POST /api/debts - Crear una nueva deuda (y posiblemente un nuevo cliente)
export async function POST(request: Request) {
    const comercioId = await getCommerceId();
    if (!comercioId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const {
            dni, firstName, lastName, email, phone, // Datos del cliente
            amount, description // Datos de la deuda
        } = body;
        
        if (!dni || !firstName || !lastName || !amount || !description) {
            return NextResponse.json({ error: 'Todos los campos del cliente y la deuda son requeridos.' }, { status: 400 });
        }

        // Usamos `upsert` para crear el cliente si no existe, o conectarlo si ya existe por su DNI.
        const debt = await prisma.debt.create({
            data: {
                amount: parseFloat(amount),
                description,
                comercioId: comercioId,
                client: {
                    connectOrCreate: {
                        where: { dni: dni },
                        create: {
                            dni,
                            firstName,
                            lastName,
                            email,
                            phone,
                        },
                    },
                },
            },
        });

        return NextResponse.json(debt, { status: 201 });

    } catch (error) {
        console.error("Error al crear la deuda:", error);
        return NextResponse.json({ error: 'Error al crear la deuda' }, { status: 500 });
    }
}
