'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} })

const FONT_MIN = 14
const FONT_MAX = 24
const FONT_STEP = 2
const FONT_DEFAULT = 18

const FontSizeContext = createContext<{ fontSize: number; inc: () => void; dec: () => void }>({
  fontSize: FONT_DEFAULT, inc: () => {}, dec: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [fontSize, setFontSize] = useState(FONT_DEFAULT)

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved) setTheme(saved)
    const savedFont = parseInt(localStorage.getItem('fontSize') ?? '', 10)
    if (!isNaN(savedFont)) setFontSize(savedFont)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`)
    document.body.style.fontSize = `${fontSize}px`
    localStorage.setItem('fontSize', String(fontSize))
  }, [fontSize])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const inc = () => setFontSize(s => Math.min(s + FONT_STEP, FONT_MAX))
  const dec = () => setFontSize(s => Math.max(s - FONT_STEP, FONT_MIN))

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <FontSizeContext.Provider value={{ fontSize, inc, dec }}>
        {children}
      </FontSizeContext.Provider>
    </ThemeContext.Provider>
  )
}

export function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext)
  return (
    <button
      onClick={toggle}
      className="theme-toggle-btn"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}

export function FontSizeControls() {
  const { fontSize, inc, dec } = useContext(FontSizeContext)
  return (
    <div className="flex items-center gap-1" title={`Font size: ${fontSize}px`}>
      <button
        onClick={dec}
        disabled={fontSize <= FONT_MIN}
        className="theme-toggle-btn"
        style={{ fontSize: '0.8rem', fontWeight: 700 }}
        title="Decrease font size"
      >
        A−
      </button>
      <button
        onClick={inc}
        disabled={fontSize >= FONT_MAX}
        className="theme-toggle-btn"
        style={{ fontSize: '0.9rem', fontWeight: 700 }}
        title="Increase font size"
      >
        A+
      </button>
    </div>
  )
}
