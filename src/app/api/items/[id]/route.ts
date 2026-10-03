import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Thay vì set currentQuantity = 0, ta ép expiresAt về quá khứ để biến nó thành rác thải (Top Ế)
    await prisma.clearanceItem.update({
      where: { id: parseInt(id) },
      data: { expiresAt: new Date(Date.now() - 60000) } 
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
