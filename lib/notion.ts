export async function getGorokuData() {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!token || !databaseId) return [];

  let allResults: any[] = [];
  let hasMore = true;
  let cursor: string | undefined = undefined;

  try {
    // hasMore が true の間、ループして全部持ってくる
    while (hasMore) {
      const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_cursor: cursor, // 「ここから続き」を指定
          page_size: 100,
        }),
        cache: 'no-store'
      });

      if (!res.ok) break;

      const data = await res.json();
      allResults = [...allResults, ...data.results];

      // 続きがあるかチェック
      hasMore = data.has_more;
      cursor = data.next_cursor;
    }

    // 最後に全件を整形して返す
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