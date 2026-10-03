import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const items = await prisma.clearanceItem.findMany({
      where: { currentQuantity: { gt: 0 }, expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: 'asc' }
    });
    return NextResponse.json({ data: items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Set expiry to 2 hours from now by default if not provided
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : new Date(Date.now() + 2 * 60 * 60 * 1000);

    const item = await prisma.clearanceItem.create({
      data: {
        name: body.name,
        originalPrice: body.originalPrice,
        currentPrice: body.originalPrice,
        initialQuantity: body.quantity,
        currentQuantity: body.quantity,
        expiresAt: expiresAt,
        imageUrl: body.imageUrl || null,
        aiPricingStrategy: body.aiPricingStrategy ? JSON.stringify(body.aiPricingStrategy) : null,
        aiRationale: body.aiRationale || null
      }
    });

    return NextResponse.json({ data: item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
