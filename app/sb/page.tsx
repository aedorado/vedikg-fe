'use client';

import Link from 'next/link';

const CANTOS = [
  { part: 1,  title: 'Creation',                          chapters: 19, icon: '🌅', desc: 'The source and beginning of all creation' },
  { part: 2,  title: 'The Cosmic Manifestation',          chapters: 10, icon: '🌌', desc: 'Universal form and the process of creation' },
  { part: 3,  title: 'The Status Quo',                    chapters: 33, icon: '⚖️', desc: 'Maitreya-Vidura dialogue; creation of the universe' },
  { part: 4,  title: 'The Creation of the Fourth Order',  chapters: 31, icon: '🏹', desc: 'Kings and sages of the solar dynasty' },
  { part: 5,  title: 'The Creative Impetus',              chapters: 26, icon: '🌍', desc: 'Cosmic geography and the hellish planets' },
  { part: 6,  title: 'Prescribed Duties for Mankind',     chapters: 19, icon: '📿', desc: 'Ajāmila and the science of liberation' },
  { part: 7,  title: 'The Science of God',                chapters: 15, icon: '🦁', desc: 'Prahlāda Mahārāja and Lord Nṛsiṁhadeva' },
  { part: 8,  title: 'Withdrawal of the Cosmic Creations',chapters: 24, icon: '🐢', desc: 'Churning of the ocean; Gajendra\'s liberation' },
  { part: 9,  title: 'Liberation',                        chapters: 24, icon: '🌿', desc: 'Dynasties of the kings; Lord Rāmacandra' },
  { part: 10, title: 'The Summum Bonum',                  chapters: 90, icon: '🦚', desc: 'The complete pastimes of Lord Śrī Kṛṣṇa' },
  { part: 11, title: 'General History',                   chapters: 31, icon: '🌊', desc: 'Instructions to Uddhava; the Yadu dynasty' },
  { part: 12, title: 'The Age of Deterioration',          chapters: 13, icon: '⏳', desc: 'Kali-yuga prophecies and the final instructions' },
];

const PALETTE = [
  { color: 'var(--saffron)',  bg: 'rgba(224,123,34,0.07)',  border: 'rgba(224,123,34,0.20)' },
  { color: 'var(--gold)',     bg: 'rgba(184,134,11,0.07)',  border: 'rgba(184,134,11,0.20)' },
  { color: 'var(--lotus)',    bg: 'rgba(194,84,122,0.07)',  border: 'rgba(194,84,122,0.20)' },
];

export default function SBPage() {
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* Header */}
      <div
        className="relative overflow-hidden py-14 text-center"
        style={{
          background: 'linear-gradient(160deg, var(--hero-bg-start) 0%, var(--hero-bg-end) 100%)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        {/* Background Om */}
        <div aria-hidden="true" style={{
          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
          fontSize: '16rem', fontFamily: 'Noto Serif Devanagari, serif',
          color: 'var(--saffron)', opacity: 0.07, lineHeight: 1, userSelect: 'none',
        }}>ॐ</div>

        <div className="relative max-w-3xl mx-auto px-4">
          <div className="section-label mb-3">12 Cantos · 18,000 Verses</div>
          <h1
            className="font-serif mb-3"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}
          >
            Śrīmad-Bhāgavatam
          </h1>
          <p
            className="font-serif text-lg italic mb-1"
            style={{ color: 'var(--saffron)' }}
          >
            The Ripened Fruit of the Vedic Tree
          </p>
          <p
            className="text-sm"
            style={{ color: 'var(--text-muted)', fontFamily: '"Crimson Text", Georgia, serif' }}
          >
            By Śrīla Vyāsadeva · Translated with purports by Śrīla Prabhupāda
          </p>
        </div>
      </div>

      {/* Cantos grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CANTOS.map((canto) => {
            const pal = PALETTE[(canto.part - 1) % PALETTE.length];
            return (
              <Link key={canto.part} href={`/sb/${canto.part}`} style={{ textDecoration: 'none' }}>
                <div
                  className="canto-card h-full"
                  style={{ background: `linear-gradient(135deg, ${pal.bg} 0%, var(--bg-card) 100%)`, borderColor: pal.border }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span
                        className="section-label"
                        style={{ color: pal.color }}
                      >
                        Canto {canto.part}
                      </span>
                    </div>
                    <span className="text-2xl" title={canto.title}>{canto.icon}</span>
                  </div>

                  <h2
                    className="font-serif text-xl font-semibold mb-2"
                    style={{ color: 'var(--text-primary)', lineHeight: 1.3 }}
                  >
                    {canto.title}
                  </h2>

                  <p
                    className="text-sm mb-4"
                    style={{ color: 'var(--text-muted)', lineHeight: 1.65 }}
                  >
                    {canto.desc}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {canto.chapters} chapters
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
      </section>

      {/* Bottom note */}
      <div
        className="text-center pb-12"
        style={{ color: 'var(--text-muted)', fontFamily: '"Crimson Text", Georgia, serif', fontSize: '0.9375rem' }}
      >
        <span style={{ color: 'var(--saffron)', opacity: 0.7 }}>✦</span>
        {' '}dharmaḥ projjhita-kaitavo 'tra paramo nirmatsarāṇāṁ satāṁ{' '}
        <span style={{ color: 'var(--saffron)', opacity: 0.7 }}>✦</span>
      </div>
    </div>
  );
}
