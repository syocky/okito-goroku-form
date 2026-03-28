// lib/notion.ts

export async function getGorokuData() {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!token || !databaseId) return [];

  let allResults: any[] = [];
  let hasMore = true;
  let cursor: string | undefined = undefined;

  try {
    while (hasMore) {
      const response: Response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_cursor: cursor,
          page_size: 100,
          // --- フィルターの修正：999（未設定）以外のものを取得 ---
          filter: {
            property: "並び順",
            formula: {
              number: {
                does_not_equal: 999
              }
            }
          },
          // --- ソートの追加 ---
          sorts: [
            {
              property: "並び順",
              direction: "ascending"
            }
          ]
        }),
        cache: 'no-store'
      });

      if (!response.ok) break;
      const data: any = await response.json();
      if (data.results) {
        allResults = [...allResults, ...data.results];
      }
      hasMore = data.has_more;
      cursor = data.next_cursor;
    }

    return allResults.map((page: any) => ({
      id: page.id,
      text: page.properties.OKITO語録?.title[0]?.plain_text || "無題",
      genre: page.properties.カテゴリー?.select?.name || "未分類",
      // --- 関数プロパティ（Formula）からの数値取得 ---
      sortOrder: page.properties.並び順?.formula?.number || 999,
    }));

  } catch (err) {
    return [];
  }
}