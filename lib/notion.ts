export async function getGorokuData() {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!token || !databaseId) {
    console.error("設定エラー: .env.local にトークンまたはIDがありません。");
    return [];
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28', // Notion APIのバージョン指定
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // 常に最新データを取得
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Notion APIエラー詳細:", errorData);
      return [];
    }

    const data = await res.json();

    // 取得したデータを整形
    return data.results.map((page: any) => ({
      id: page.id,
      // Notionの列名が「名前」「ジャンル」である前提です
      text: page.properties.OKITO語録?.title[0]?.plain_text || "タイトルなし",
      genre: page.properties.カテゴリー?.select?.name || "未分類",
    }));
  } catch (err) {
    console.error("接続エラー:", err);
    return [];
  }
}