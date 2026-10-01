import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const orders = await prisma.reservation.findMany({
      include: {
        clearanceItem: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ data: orders });
  } catch (error: any) {
    console.error('Fetch Orders Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
