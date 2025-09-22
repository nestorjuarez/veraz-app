import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function checkAuthenticated() {
    const session = await getServerSession(authOptions);
    return !!session;
}

export async function GET(request: Request, { params }: { params: { dni: string } }) {
    if (!(await checkAuthenticated())) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
        const client = await prisma.client.findUnique({
            where: { dni: params.dni },
            include: {
                debts: {
                    include: {
                        comercio: {
                            select: {
                                name: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc',
                    }
                },
            },
        });

        if (!client) {
            return NextResponse.json({ error: 'Cliente no encontrado con el DNI proporcionado.' }, { status: 404 });
        }
        return NextResponse.json(client);
    } catch (error) {
        return NextResponse.json({ error: 'Error al buscar el cliente' }, { status: 500 });
    }
}
