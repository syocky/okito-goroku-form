export async function getGorokuData() {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!token || !databaseId) return [];

  let allResults: any[] = [];
  let hasMore = true;
  let cursor: string | undefined = undefined;

  try {
    while (hasMore) {
      // fetchの戻り値を Response 型として扱うよう明示（または単純に新しく定義）
      const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_cursor: cursor,
          page_size: 100,
        }),
        cache: 'no-store'
      });

      if (!response.ok) {
        console.error("Notion API error:", response.status);
        break;
      }

      const data = await response.json();
      allResults = [...allResults, ...data.results];

      hasMore = data.has_more;
      cursor = data.next_cursor;
    }

    return allResults.map((page: any) => ({
      id: page.id,
      text: page.properties.OKITO語録?.title[0]?.plain_text || "無題",
      genre: page.properties.カテゴリー?.select?.name || "未分類",
    }));

  } catch (err) {
    console.error("全件取得エラー:", err);
    return [];
  }
}