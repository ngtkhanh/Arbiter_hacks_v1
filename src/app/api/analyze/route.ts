import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageAndGeneratePricing } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Missing image data' }, { status: 400 });
    }

    const aiResult = await analyzeImageAndGeneratePricing(imageBase64, mimeType || 'image/jpeg');

    return NextResponse.json({ data: aiResult });
  } catch (error: any) {
    console.error('Analyze API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
