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

export async function POST(request: Request) {
    const comercioId = await getCommerceId();
    if (!comercioId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const {
            dni, firstName, lastName, email, phone,
            amount, description
        } = body;
        
        if (!dni || !firstName || !lastName || !amount || !description) {
            return NextResponse.json({ error: 'Todos los campos del cliente y la deuda son requeridos.' }, { status: 400 });
        }

        const newDebt = await prisma.$transaction(async (tx) => {
            const client = await tx.client.upsert({
                where: { dni: dni },
                update: {}, // No actualizamos nada si ya existe
                create: {
                    dni,
                    firstName,
                    lastName,
                    email,
                    phone,
                },
            });

            const debt = await tx.debt.create({
                data: {
                    amount: parseFloat(amount),
                    description,
                    comercioId: comercioId,
                    clientId: client.id, // Enlazamos con el ID del cliente
                },
            });
            
            return debt;
        });

        return NextResponse.json(newDebt, { status: 201 });

    } catch (error) {
        console.error("Error al crear la deuda:", error);
        return NextResponse.json({ error: 'Error al crear la deuda' }, { status: 500 });
    }
}
