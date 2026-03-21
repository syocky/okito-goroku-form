import { getGorokuData } from '@/lib/notion';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await getGorokuData();
  return NextResponse.json(data);
}