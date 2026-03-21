import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { selectedTexts } = body;

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: process.env.NOTION_ANSWERS_DATABASE_ID },
      properties: {
        '名前': {
          title: [{ text: { content: `回答 - ${new Date().toLocaleString()}` } }]
        },
        // ここを修正：multi_select 形式に合わせる
        'OKITO語録': {
          multi_select: selectedTexts.map((text: string) => ({
            name: text.replace(/,/g, ' ') // カンマが含まれるとエラーになる場合があるため置換
          }))
        }
      }
    })
  });

  if (!res.ok) {
    const error = await res.json();
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ message: '成功' });
}