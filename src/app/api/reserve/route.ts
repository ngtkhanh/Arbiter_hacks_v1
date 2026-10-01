import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { itemId, quantity, lockedPrice, customerName } = await req.json();

    if (!itemId || !quantity || lockedPrice === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Run in a transaction to ensure quantity is not oversold
    const reservation = await prisma.$transaction(async (tx) => {
      const item = await tx.clearanceItem.findUnique({
        where: { id: itemId }
      });

      if (!item || item.currentQuantity < quantity) {
        throw new Error('Not enough quantity available');
      }

      const pickupCode = `#RC-${Math.floor(1000 + Math.random() * 9000)}`;
      const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes from now

      const res = await tx.reservation.create({
        data: {
          clearanceItemId: itemId,
          quantity,
          lockedPrice,
          customerName: customerName || 'Khách vãng lai',
          pickupCode,
          expiresAt
        }
      });

      await tx.clearanceItem.update({
        where: { id: itemId },
        data: { currentQuantity: item.currentQuantity - quantity }
      });

      return res;
    });

    return NextResponse.json({ success: true, data: reservation });
  } catch (error: any) {
    console.error('Reserve API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
