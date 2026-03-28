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

    allData.forEach((item) => {
      // 並び順が999（未設定）のものはカテゴリー一覧に出さない
      if (item.sortOrder !== 999) {
        if (
          !genreMap.has(item.genre) ||
          item.sortOrder < (genreMap.get(item.genre) ?? 999)
        ) {
          genreMap.set(item.genre, item.sortOrder);
        }
      }
    });

    // 数字の小さい順に並び替え
    const sortedGenres = Array.from(genreMap.entries())
      .sort((a, b) => a[1] - b[1])
      .map((entry) => entry[0]);

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
      .map((item) => ({ value: item.id, label: item.text, genre: item.genre }))
      .sort((a, b) => {
        // localeCompareを使うことで、アルファベットだけでなく日本語（五十音）も正しく昇順になります
        return a.label.localeCompare(b.label, 'ja');
      });
  }, [selectedGenre, allData]);

  // 4. 送信処理
  const handleSubmit = async () => {
    if (selectedGorokus.length === 0) return;

    setIsSubmitting(true);
    try {
      const selectedTexts = selectedGorokus.map((s) => s.label);
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedTexts }),
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 font-sans text-gray-600">
        <p className="animate-pulse text-lg font-bold">
          OKITO語録を読み込み中...
        </p>
      </div>
    );
  }

  // 背景のスタイル（視認性を上げたドット背景）
  const dotBackground = isMounted
    ? {
        backgroundImage: 'radial-gradient(#d1d5db 2px, transparent 2px)',
        backgroundSize: '32px 32px',
      }
    : {};

  // 色名からTailwindのクラスを返す関数
  const getGenreStyle = (color: string, isActive: boolean) => {
    const styles: Record<string, string> = {
      red: isActive
        ? 'bg-red-600 text-white shadow-red-200'
        : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
      yellow: isActive
        ? 'bg-yellow-500 text-white shadow-yellow-100'
        : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
      brown: isActive
        ? 'bg-amber-800 text-white shadow-amber-200'
        : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100',
      green: isActive
        ? 'bg-green-600 text-white shadow-green-200'
        : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      purple: isActive
        ? 'bg-purple-600 text-white shadow-purple-200'
        : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      pink: isActive
        ? 'bg-pink-500 text-white shadow-pink-200'
        : 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100',
      blue: isActive
        ? 'bg-blue-600 text-white shadow-blue-200'
        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      gray: isActive ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-500',
    };
    return styles[color] || styles.gray;
  };

  return (
    <main
      className="min-h-screen bg-white p-4 font-sans transition-all duration-500 md:p-12"
      style={dotBackground}
    >
      {/* カード部分：bg-white/80 と backdrop-blur-md でドットを透けさせる */}
      <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-2xl backdrop-blur-md md:p-10">
        {/* ロゴ画像セクション */}
        <div className="mb-6 flex justify-center">
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
        <div className="mb-8 text-center">
          <h1 className="text-2xl leading-tight font-black tracking-tighter text-gray-900 md:text-3xl">
            あなたが選ぶ！
            <br />
            OKITO語録大賞
            <br className="md:hidden" />
            <span className="md:ml-2">投票フォーム</span>
          </h1>
        </div>

        {/* 説明文セクション */}
        <div className="mx-auto mb-10 max-w-sm px-4 text-center md:max-w-2xl">
          <p className="text-sm leading-relaxed text-gray-600 md:text-base">
            あなたの好きなOKITO語録を
            <br className="md:hidden" />
            最大5つまで選んで送信してください。
          </p>
          <p className="mt-2 text-sm text-gray-600 md:text-base">
            <span className="inline-block">OKITO語録集は、</span>
            <span className="inline-block">
              <a
                href="https://hill-growth-b59.notion.site/OKITO-278663e67cd080d8889dd3af35e3bae9"
                target="_blank"
                rel="noopener noreferrer"
                className="mx-1 font-bold text-blue-600 underline decoration-2 underline-offset-4 hover:text-blue-800"
              >
                こちら
              </a>
              からご覧ください。
            </span>
          </p>
        </div>

        {/* 1. カテゴリー選択 */}
        <section className="mb-10">
          <label className="mb-4 block text-xs font-black tracking-widest text-blue-600 uppercase">
            1. カテゴリーで絞り込む
          </label>
          <div className="flex flex-wrap gap-2">
            {genres.map((genreName) => {
              // そのカテゴリーに属する最初のデータの「色」を取得
              const genreColor =
                allData.find((d) => d.genre === genreName)?.genreColor ||
                'gray';

              return (
                <button
                  key={genreName}
                  onClick={() => setSelectedGenre(genreName)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition-all duration-300 ${getGenreStyle(
                    genreColor,
                    selectedGenre === genreName,
                  )} ${selectedGenre === genreName ? 'scale-105 shadow-md' : 'border-transparent'}`}
                >
                  {genreName}
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. 語録選択 */}
        <section className="mb-10">
          <label className="mb-4 block text-xs font-black tracking-widest text-blue-600 uppercase">
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
              noOptionsMessage={() => '見つかりません'}
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '1rem',
                  padding: '4px',
                  borderColor: '#e5e7eb',
                  boxShadow: 'none',
                  '&:hover': { borderColor: '#3b82f6' },
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  zIndex: 50,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? '#eff6ff' : 'white',
                  color: '#1f2937',
                  padding: '12px',
                }),
                multiValue: (base, state) => {
                  const originalData = allData.find(
                    (d) => d.id === (state.data as any).value,
                  );
                  const color = originalData?.genreColor || 'gray';
                  const bgColors: Record<string, string> = {
                    red: '#fef2f2',
                    yellow: '#fefce8',
                    brown: '#fff7ed',
                    green: '#f0fdf4',
                    purple: '#faf5ff',
                    pink: '#fdf2f8',
                    blue: '#eff6ff',
                    gray: '#f9fafb',
                  };
                  return {
                    ...base,
                    borderRadius: '9999px',
                    backgroundColor: bgColors[color] || '#f3f4f6',
                  };
                },

                // 選択後のチップ（文字色）
                multiValueLabel: (base, state) => {
                  const originalData = allData.find(
                    (d) => d.id === (state.data as any).value,
                  );
                  const color = originalData?.genreColor || 'gray';
                  const textColors: Record<string, string> = {
                    red: '#dc2626',
                    yellow: '#a16207',
                    brown: '#78350f',
                    green: '#16a34a',
                    purple: '#9333ea',
                    pink: '#db2777',
                    blue: '#2563eb',
                    gray: '#4b5563',
                  };
                  return {
                    ...base,
                    color: textColors[color] || '#374151',
                    fontWeight: 'bold',
                    paddingLeft: '8px',
                  };
                },

                // 削除ボタン（×）の調整
                multiValueRemove: (base) => ({
                  ...base,
                  color: '#9ca3af',
                  borderRadius: '0 9999px 9999px 0',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#4b5563',
                  },
                }),
              }}
            />
          ) : (
            <div className="h-14 animate-pulse rounded-2xl bg-gray-50" />
          )}
        </section>

        {/* 現在の選択リスト */}
        {selectedGorokus.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-2 mb-10">
            <h3 className="mb-4 text-sm font-black text-gray-900 underline decoration-gray-200 decoration-4 underline-offset-4">
              選択中のOKITO語録：
            </h3>
            <ul className="space-y-3">
              {selectedGorokus.map((s) => {
                // 全データから、この語録のカテゴリー色を特定
                const originalData = allData.find((d) => d.id === s.value);
                const color = originalData?.genreColor || 'gray';

                // カテゴリーごとの背景色・文字色の設定（チップと同じトーン）
                const styles: Record<string, string> = {
                  red: 'bg-red-50 text-red-700 border-red-100',
                  yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                  brown: 'bg-amber-50 text-amber-900 border-amber-200',
                  green: 'bg-green-50 text-green-700 border-green-100',
                  purple: 'bg-purple-50 text-purple-700 border-purple-100',
                  pink: 'bg-pink-50 text-pink-700 border-pink-100',
                  blue: 'bg-blue-50 text-blue-700 border-blue-100',
                  gray: 'bg-gray-50 text-gray-600 border-gray-200',
                };

                return (
                  <li
                    key={s.value}
                    className={`flex items-center rounded-xl border px-4 py-3 text-sm font-bold shadow-sm transition-all ${
                      styles[color] || styles.gray
                    }`}
                  >
                    <span className="mr-3 text-lg">✨</span>
                    {s.label}
                    <span className="ml-auto text-[10px] tracking-widest uppercase opacity-60">
                      {originalData?.genre}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* 送信ボタン */}
        <button
          onClick={handleSubmit}
          disabled={selectedGorokus.length === 0 || isSubmitting}
          className={`w-full rounded-2xl py-5 text-lg font-black shadow-xl transition-all ${
            selectedGorokus.length > 0 && !isSubmitting
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-2xl active:scale-95'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
          }`}
        >
          {isSubmitting ? '保存中...' : '投票を送信する'}
        </button>

        <p className="mt-8 text-center text-[10px] tracking-widest text-gray-400 uppercase">
          OKITO Goroku Award 2026
        </p>
      </div>
    </main>
  );
}
