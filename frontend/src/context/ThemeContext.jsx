import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

const ThemeContext = createContext(null);

function effectiveDark(mode) {
  if (mode === 'light') return false;
  if (mode === 'dark') return true;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return true;
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(() => localStorage.getItem('themeMode') || 'dark');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || 'cyan');

  const setMode = useCallback((m) => {
    setModeState(m);
    localStorage.setItem('themeMode', m);
  }, []);

  useEffect(() => {
    const dark = effectiveDark(mode);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
    const map = {
      cyan: '6 182 212',
      blue: '59 130 246',
      violet: '139 92 246',
      emerald: '16 185 129',
      amber: '245 158 11'
    };
    const rgb = map[accentColor] || map.cyan;
    document.documentElement.style.setProperty('--accent-rgb', rgb);
  }, [accentColor]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!localStorage.getItem('token')) return;
      try {
        const { data } = await api.get('/settings/organization');
        const t = data.settings?.theme;
        if (cancelled || !t) return;
        if (t.mode) setModeState(t.mode);
        if (t.accentColor) setAccentColor(t.accentColor);
      } catch {
        /* keep local */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ mode, setMode, accentColor, setAccentColor }),
    [mode, setMode, accentColor]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeSettings() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { mode: 'dark', setMode: () => {}, accentColor: 'cyan', setAccentColor: () => {} };
  }
  return ctx;
}
