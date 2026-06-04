'use client'

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';

const SB_CANTO_INFO = [
  { title: 'Canto 1 — Creation',                           chapters: 19, subtitle: 'The source and beginning' },
  { title: 'Canto 2 — The Cosmic Manifestation',           chapters: 10, subtitle: 'Universal form' },
  { title: 'Canto 3 — The Status Quo',                     chapters: 33, subtitle: 'Maitreya-Vidura dialogue' },
  { title: 'Canto 4 — The Creation of the Fourth Order',   chapters: 31, subtitle: 'Kings of the solar dynasty' },
  { title: 'Canto 5 — The Creative Impetus',               chapters: 26, subtitle: 'Cosmic geography' },
  { title: 'Canto 6 — Prescribed Duties for Mankind',      chapters: 19, subtitle: 'Ajāmila and liberation' },
  { title: 'Canto 7 — The Science of God',                 chapters: 15, subtitle: 'Prahlāda Mahārāja' },
  { title: 'Canto 8 — Withdrawal of Cosmic Creations',     chapters: 24, subtitle: 'Churning of the ocean' },
  { title: 'Canto 9 — Liberation',                         chapters: 24, subtitle: 'Lord Rāmacandra' },
  { title: 'Canto 10 — The Summum Bonum',                  chapters: 90, subtitle: 'Pastimes of Lord Kṛṣṇa' },
  { title: 'Canto 11 — General History',                   chapters: 31, subtitle: 'Instructions to Uddhava' },
  { title: 'Canto 12 — The Age of Deterioration',          chapters: 13, subtitle: 'Kali-yuga prophecies' },
];

const PALETTE = [
  { color: 'var(--saffron)',  bg: 'rgba(224,123,34,0.07)',  border: 'rgba(224,123,34,0.20)' },
  { color: 'var(--gold)',     bg: 'rgba(184,134,11,0.07)',  border: 'rgba(184,134,11,0.20)' },
  { color: 'var(--lotus)',    bg: 'rgba(194,84,122,0.07)',  border: 'rgba(194,84,122,0.20)' },
];

interface Chapter {
  chapter_number: number;
  title: string;
  summary?: string;
  verse_count: number;
}

export default function SBCantoPage() {
  const params = useParams();
  const cantoNum = parseInt((params?.canto as string) || '1', 10);
  const canto = SB_CANTO_INFO[cantoNum - 1];
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        console.log(`Fetching chapters for canto ${cantoNum}...`);
        const res = await axios.get(`http://localhost:8000/api/verses/sb/chapters/${cantoNum}`);
        console.log('API Response:', res.data);
        const data = Array.isArray(res.data) ? res.data : res.data.chapters || res.data;
        console.log('Processed data:', data);
        setChapters(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Failed to fetch chapters:', err.response?.status, err.response?.data, err.message);
        console.log('Using fallback with', canto?.chapters, 'chapters');
        setChapters(Array.from({ length: canto?.chapters || 0 }, (_, i) => ({
          chapter_number: i + 1,
          title: `Chapter ${i + 1}`,
          verse_count: 0,
        })));
      } finally {
        setLoading(false);
      }
    };

    if (canto) {
      fetchChapters();
    }
  }, [cantoNum, canto]);

  if (!canto) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p style={{ color: 'var(--text-muted)' }}>Canto not found.</p>
        </div>
      </main>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>

      {/* Header */}
      <div
        className="py-12 text-center"
        style={{
          background: 'linear-gradient(160deg, var(--hero-bg-start) 0%, var(--hero-bg-end) 100%)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/sb"
            className="text-sm hover:underline"
            style={{ color: 'var(--saffron)', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}
          >
            ← Śrīmad-Bhāgavatam
          </Link>
          <h1
            className="font-serif mb-2"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 600, color: 'var(--text-primary)' }}
          >
            {canto.title}
          </h1>
          <p className="font-serif italic" style={{ color: 'var(--saffron)' }}>{canto.subtitle}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{canto.chapters} chapters</p>
          <div className="flex justify-center gap-3 mt-5">
            {cantoNum > 1 && (
              <Link href={`/sb/${cantoNum - 1}`} className="btn-outline" style={{ padding: '0.3rem 0.875rem', fontSize: '0.8125rem', borderRadius: '9999px' }}>
                ← Canto {cantoNum - 1}
              </Link>
            )}
            {cantoNum < SB_CANTO_INFO.length && (
              <Link href={`/sb/${cantoNum + 1}`} className="btn-outline" style={{ padding: '0.3rem 0.875rem', fontSize: '0.8125rem', borderRadius: '9999px' }}>
                Canto {cantoNum + 1} →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Chapters grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="text-center" style={{ color: 'var(--text-muted)' }}>Loading chapters...</div>
        ) : chapters.length === 0 ? (
          <div className="text-center" style={{ color: 'var(--text-muted)' }}>
            <p>No chapters found. Check browser console for errors.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((ch, idx) => {
              const pal = PALETTE[idx % PALETTE.length];
              return (
                <Link key={ch.chapter_number} href={`/sb/${cantoNum}/${ch.chapter_number}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="canto-card h-full"
                    style={{ background: `linear-gradient(135deg, ${pal.bg} 0%, var(--bg-card) 100%)`, borderColor: pal.border }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className="section-label"
                        style={{ color: pal.color }}
                      >
                        Chapter {ch.chapter_number}
                      </span>
                    </div>

                    <h3
                      className="font-serif text-lg font-semibold mb-2"
                      style={{ color: 'var(--text-primary)', lineHeight: 1.3 }}
                    >
                      {ch.title || `Chapter ${ch.chapter_number}`}
                    </h3>

                    {ch.summary && (
                      <p
                        className="text-sm mb-4"
                        style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}
                      >
                        {ch.summary.substring(0, 120)}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {ch.verse_count} verses
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: pal.color }}
                      >
                        Read →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
