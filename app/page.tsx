'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';

export default function Home() {
  const [allData, setAllData] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('すべて');
  const [selectedGorokus, setSelectedGorokus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // これを追加

  // 1. 起動時にNotionから語録データを取得
  useEffect(() => {
    setIsMounted(true); // ブラウザで読み込まれたら true にする
    const fetchData = async () => {
      try {
        const res = await fetch('/api/goroku');
        if (!res.ok) throw new Error('データの取得に失敗しました');
        const data = await res.json();
        setAllData(data);
      } catch (err) {
        console.error(err);
        alert('Notionからのデータ読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. ジャンル一覧を自動生成（重複排除）
  const genres = useMemo(() => {
    return ['すべて', ...Array.from(new Set(allData.map((item) => item.genre)))];
  }, [allData]);

  // 3. 選択されたジャンルで検索候補をフィルタリング
  const filteredOptions = useMemo(() => {
    return allData
      .filter((item) => selectedGenre === 'すべて' || item.genre === selectedGenre)
      .map((item) => ({ value: item.id, label: item.text, genre: item.genre }));
  }, [selectedGenre, allData]);

  // 4. 送信処理（もう一つのAPIルート /api/submit を叩く）
  const handleSubmit = async () => {
    if (selectedGorokus.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const selectedTexts = selectedGorokus.map(s => s.label);
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedTexts })
      });

      if (res.ok) {
        alert('Notionの回答用データベースに保存しました！');
        setSelectedGorokus([]); // 選択をリセット
      } else {
        const errorData = await res.json();
        console.error('Submit error:', errorData);
        alert('保存に失敗しました。APIの設定を確認してください。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-600">
        <p className="animate-pulse font-bold text-lg">OKITO語録を読み込み中...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-12 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-100">
        <h1 className="text-3xl font-black mb-2 text-gray-900 tracking-tight">あなたが選ぶ！<br/>OKITO語録大賞 投票フォーム</h1>
        <p className="text-gray-500 mb-10 text-sm">
          あなたの好きなOKITO語録を最大5つまで選んで送信してください。<br/>
          OKITO語録集は、
            <a
              href="https://hill-growth-b59.notion.site/OKITO-278663e67cd080d8889dd3af35e3bae9"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 font-bold decoration-2 underline-offset-4">
              こちら
            </a>
            からご覧ください。
        </p>
        {/* --- 絞り込みセクション --- */}
        <section className="mb-8">
          <label className="block text-xs font-black text-blue-600 uppercase tracking-widest mb-3">
            1. カテゴリーで絞り込む
          </label>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  selectedGenre === g 
                  ? 'bg-blue-600 text-white shadow-lg scale-105' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        {/* --- 検索・選択セクション --- */}
        <section className="mb-10">
          <label className="block text-xs font-black text-blue-600 uppercase tracking-widest mb-3">
            2. OKITO語録を検索・追加（あと {5 - selectedGorokus.length} つ選択可能）
          </label>
          {isMounted ? (
            <Select
              isMulti
              options={filteredOptions}
              placeholder="キーワードを入力..."
              onChange={(values: any) => setSelectedGorokus(values || [])}
              isOptionDisabled={() => selectedGorokus.length >= 5}
              noOptionsMessage={() => "見つかりません"}
              className="text-sm shadow-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '1rem',
                  padding: '4px',
                  borderColor: '#e5e7eb',
                  backgroundColor: 'white', // 背景を白に固定
                  color: '#333',            // 文字色を濃いグレーに
                  '&:hover': { borderColor: '#3b82f6' }
                }),
                // 検索入力中の文字色
                input: (base) => ({
                  ...base,
                  color: '#333',
                }),
                // 選択肢（プルダウンの中身）のスタイル
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? '#f0f7ff' : 'white', // ホバー時は薄い青
                  color: '#333', // ★ここが重要！選択肢の文字を濃いグレーにする
                  fontSize: '14px',
                  padding: '10px',
                  '&:active': {
                    backgroundColor: '#e0efff',
                  },
                }),
                // 選択した後に表示されるラベルの文字色
                multiValueLabel: (base) => ({
                  ...base,
                  color: '#1e40af', // 選択済みは濃い青にすると見やすいです
                  fontWeight: 'bold',
                }),
                // プルダウンメニュー自体の背景
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                }),
                // 「見つかりません」などのメッセージ色
                noOptionsMessage: (base) => ({
                  ...base,
                  color: '#999',
                })
              }}
            />
          ) : (
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse"></div> // 読み込み中のダミー
          )}
        </section>

        {/* --- 現在の選択リスト --- */}
        {selectedGorokus.length > 0 && (
          <section className="mb-10 p-5 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-blue-900 font-black text-sm mb-3 underline decoration-blue-200 decoration-4">選択中のOKITO語録：</h3>
            <ul className="space-y-2">
              {selectedGorokus.map((s) => (
                <li key={s.value} className="text-sm text-blue-800 flex items-start">
                  <span className="mr-2">✨</span> {s.label}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* --- 送信ボタン --- */}
        <button
          onClick={handleSubmit}
          disabled={selectedGorokus.length === 0 || isSubmitting}
          className={`w-full py-4 rounded-2xl font-black text-lg transition-all transform active:scale-95 ${
            selectedGorokus.length > 0 && !isSubmitting
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? '保存中...' : `${selectedGorokus.length} つ選んで送信する`}
        </button>

        <p className="mt-6 text-center text-xs text-gray-400">
          Powered by Notion API × Next.js
        </p>
      </div>
    </main>
  );
}