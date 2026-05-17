// app/thanks/page.tsx （修正版）
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Thanks() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dotBackground = isMounted
    ? {
        backgroundImage: 'radial-gradient(#d1d5db 2px, transparent 2px)',
        backgroundSize: '32px 32px',
      }
    : {};

  return (
    <main
      className="flex min-h-screen items-center justify-center p-4 transition-all duration-500 md:p-12"
      style={dotBackground}
    >
      <div className="animate-in fade-in zoom-in-95 w-full max-w-xl rounded-3xl border border-gray-100 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-md duration-500 md:p-12">
        {/* アイコン */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-4xl text-green-500 shadow-inner">
          🎉
        </div>

        {/* ★ タイトル部分の修正：パソコンでは絶対に改行させない指定を追加 */}
        <h1 className="text-2xl font-black whitespace-nowrap text-gray-900 md:text-3xl md:whitespace-normal">
          {/* スマホの時だけ「投票」のあとで綺麗に改行を入れます */}
          投票
          <span className="block md:hidden" />
          ありがとうございました！
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-gray-600">
          ご投票いただいた内容が
          <span className="block md:hidden" />
          送信されました。
          <br />
          OKITO語録大賞の発表を
          <span className="block md:hidden" />
          お楽しみに！
        </p>
      </div>
    </main>
  );
}
