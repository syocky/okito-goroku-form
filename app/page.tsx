'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Select from 'react-select';

export default function Home() {
  const [allData, setAllData] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('すべて');
  const [selectedGorokus, setSelectedGorokus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 1. 起動時にNotionから語録データを取得
  useEffect(() => {
    setIsMounted(true);
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

  // 2. ジャンル一覧を自動生成（「並び順」関数の数字に基づいてソート）
  const genres = useMemo(() => {
    if (allData.length === 0) return ['すべて'];

    const genreMap = new Map<string, number>();
    
    allData.forEach(item => {
      // 並び順が999（未設定）のものはカテゴリー一覧に出さない
      if (item.sortOrder !== 999) {
        if (!genreMap.has(item.genre) || item.sortOrder < (genreMap.get(item.genre) ?? 999)) {
          genreMap.set(item.genre, item.sortOrder);
        }
      }
    });

    // 数字の小さい順に並び替え
    const sortedGenres = Array.from(genreMap.entries())
      .sort((a, b) => a[1] - b[1])
      .map(entry => entry[0]);

    return ['すべて', ...sortedGenres];
  }, [allData]);

  // 3. 選択されたジャンルで検索候補をフィルタリング（未設定999は除外）
  const filteredOptions = useMemo(() => {
    return allData
      .filter((item) => {
        // 並び順が999のものは物理的に表示させない
        if (item.sortOrder === 999) return false;
        return selectedGenre === 'すべて' || item.genre === selectedGenre;
      })
      .map((item) => ({ value: item.id, label: item.text, genre: item.genre }));
  }, [selectedGenre, allData]);

  // 4. 送信処理
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
        setSelectedGorokus([]); 
      } else {
        alert('保存に失敗しました。');
      }
    } catch (err) {
      alert('通信エラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-600 font-sans">
        <p className="animate-pulse font-bold text-lg">OKITO語録を読み込み中...</p>
      </div>
    );
  }

  // 背景のスタイル（視認性を上げたドット背景）
  const dotBackground = isMounted 
    ? { 
        backgroundImage: 'radial-gradient(#d1d5db 2px, transparent 2px)', 
        backgroundSize: '32px 32px' 
      }
    : {};

  return (
    <main 
      className="min-h-screen bg-white p-4 md:p-12 font-sans transition-all duration-500"
      style={dotBackground}
    >
      {/* カード部分：bg-white/80 と backdrop-blur-md でドットを透けさせる */}
      <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-md p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-100 mt-10">
        
        {/* ロゴ画像セクション */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.jpg"
            alt="OKITO語録ロゴ"
            width={180}
            height={60}
            className="object-contain"
            priority
          />
        </div>

        {/* タイトルセクション */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter leading-tight">
           あなたが選ぶ！<br /> 
            OKITO語録大賞<br className="md:hidden" />
            <span className="md:ml-2">投票フォーム</span>
          </h1>
        </div>

        {/* 説明文セクション */}
        <div className="text-center mb-10 max-w-sm md:max-w-2xl mx-auto px-4"> 
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            あなたの好きなOKITO語録を<br className="md:hidden" />
            最大5つまで選んで送信してください。
          </p>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            <span className="inline-block">OKITO語録集は、</span>
            <span className="inline-block">
              <a 
                href="https://hill-growth-b59.notion.site/OKITO-278663e67cd080d8889dd3af35e3bae9" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 underline hover:text-blue-800 font-bold decoration-2 underline-offset-4 mx-1"
              >
                こちら
              </a>
              からご覧ください。
            </span>
          </p>
        </div>

        {/* 1. カテゴリー選択 */}
        <section className="mb-10">
          <label className="block text-xs font-black text-blue-600 uppercase tracking-widest mb-4">
            1. カテゴリーで絞り込む
          </label>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  selectedGenre === g 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        {/* 2. 語録選択 */}
        <section className="mb-10">
          <label className="block text-xs font-black text-blue-600 uppercase tracking-widest mb-4">
            2. OKITO語録を検索・追加（あと {5 - selectedGorokus.length} つ）
          </label>
          {isMounted ? (
            <Select
              instanceId="goroku-select"
              isMulti
              options={filteredOptions}
              placeholder="タップして語録を検索..."
              onChange={(values: any) => setSelectedGorokus(values || [])}
              isOptionDisabled={() => selectedGorokus.length >= 5}
              noOptionsMessage={() => "見つかりません"}
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '1rem',
                  padding: '4px',
                  borderColor: '#e5e7eb',
                  boxShadow: 'none',
                  '&:hover': { borderColor: '#3b82f6' }
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  zIndex: 50,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? '#eff6ff' : 'white',
                  color: '#1f2937',
                  padding: '12px'
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: '#eff6ff',
                  borderRadius: '9999px'
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: '#1e40af',
                  fontWeight: 'bold'
                })
              }}
            />
          ) : (
            <div className="h-14 bg-gray-50 rounded-2xl animate-pulse" />
          )}
        </section>

        {/* 現在の選択リスト */}
        {selectedGorokus.length > 0 && (
          <section className="mb-10 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-blue-900 font-black text-sm mb-3">選択中の語録：</h3>
            <ul className="space-y-2">
              {selectedGorokus.map((s) => (
                <li key={s.value} className="text-sm text-blue-800 flex items-start">
                  <span className="mr-2">✨</span> {s.label}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 送信ボタン */}
        <button
          onClick={handleSubmit}
          disabled={selectedGorokus.length === 0 || isSubmitting}
          className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl ${
            selectedGorokus.length > 0 && !isSubmitting
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-2xl active:scale-95'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? '保存中...' : '投票を送信する'}
        </button>

        <p className="mt-8 text-center text-[10px] text-gray-400 tracking-widest uppercase">
          OKITO Goroku Award 2026
        </p>
      </div>
    </main>
  );
}