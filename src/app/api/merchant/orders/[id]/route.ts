import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reservationId = parseInt(params.id);
    const { action } = await req.json(); // 'COMPLETED' or 'CANCELLED'

    if (!reservationId || (action !== 'COMPLETED' && action !== 'CANCELLED')) {
      return NextResponse.json({ error: 'Invalid action or ID' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: { clearanceItem: true }
      });

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      if (reservation.status !== 'PENDING') {
        throw new Error('Reservation is already ' + reservation.status);
      }

      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: { status: action }
      });

      // If cancelled, we must restore the quantity to the clearance item
      if (action === 'CANCELLED') {
        await tx.clearanceItem.update({
          where: { id: reservation.clearanceItemId },
          data: {
            currentQuantity: reservation.clearanceItem.currentQuantity + reservation.quantity
          }
        });
      }

      return updatedReservation;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Update Order Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
