import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    let products = await prisma.product.findMany();

    // Auto-seed for hackathon if empty
    if (products.length === 0) {
      await prisma.product.createMany({
        data: [
          { name: 'Bánh Sừng Bò (Croissant)', basePrice: 25000, minPrice: 10000 },
          { name: 'Bánh Mì Baguette', basePrice: 15000, minPrice: 5000 },
          { name: 'Bánh Donut Chocolate', basePrice: 20000, minPrice: 8000 },
          { name: 'Trái Cây Mix', basePrice: 35000, minPrice: 15000 },
          { name: 'Salad Rau Củ', basePrice: 40000, minPrice: 20000 },
        ]
      });
      products = await prisma.product.findMany();
    }

    return NextResponse.json({ data: products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
