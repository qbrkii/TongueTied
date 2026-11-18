import { ColorTheme, DisplayFormat, ThemePreferences } from '../types';

export interface ThemeConfig {
  id: ColorTheme;
  name: string;
  subtitle: string;
  hex: string;
  bgHex: string;
  bgAppClass: string;
  primaryBtnClass: string;
  primaryBtnHoverClass: string;
  secondaryBtnClass: string;
  accentTextClass: string;
  accentBadgeClass: string;
  accentBorderClass: string;
  cardHighlightClass: string;
  ringClass: string;
}

export const THEME_CONFIGS: Record<ColorTheme, ThemeConfig> = {
  sky: {
    id: 'sky',
    name: 'Blue (Sky Calm)',
    subtitle: 'Classic serene blue for focused learning',
    hex: '#0284c7',
    bgHex: '#f8fafc',
    bgAppClass: 'bg-slate-50/80',
    primaryBtnClass: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20',
    primaryBtnHoverClass: 'hover:bg-sky-700',
    secondaryBtnClass: 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200',
    accentTextClass: 'text-sky-700',
    accentBadgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    accentBorderClass: 'border-sky-300',
    cardHighlightClass: 'border-sky-300 bg-sky-50/50',
    ringClass: 'focus:ring-sky-500 ring-sky-300',
  },
  rose: {
    id: 'rose',
    name: 'Rose (Blush Warmth)',
    subtitle: 'Gentle coral rose creating an inviting feeling',
    hex: '#e11d48',
    bgHex: '#fff8f8',
    bgAppClass: 'bg-[#FFF8F8]',
    primaryBtnClass: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
    primaryBtnHoverClass: 'hover:bg-rose-700',
    secondaryBtnClass: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200',
    accentTextClass: 'text-rose-700',
    accentBadgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    accentBorderClass: 'border-rose-300',
    cardHighlightClass: 'border-rose-300 bg-rose-50/50',
    ringClass: 'focus:ring-rose-500 ring-rose-300',
  },
  sage: {
    id: 'sage',
    name: 'Sage (Earthy Olive)',
    subtitle: 'Soothing grounded green for calming nervous energy',
    hex: '#059669',
    bgHex: '#f6f9f6',
    bgAppClass: 'bg-[#F6F9F6]',
    primaryBtnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
    primaryBtnHoverClass: 'hover:bg-emerald-700',
    secondaryBtnClass: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200',
    accentTextClass: 'text-emerald-700',
    accentBadgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    accentBorderClass: 'border-emerald-300',
    cardHighlightClass: 'border-emerald-300 bg-emerald-50/50',
    ringClass: 'focus:ring-emerald-500 ring-emerald-300',
  },
  amber: {
    id: 'amber',
    name: 'Amber (Warm Honey)',
    subtitle: 'Sunny friendly amber radiating social encouragement',
    hex: '#d97706',
    bgHex: '#fffdf7',
    bgAppClass: 'bg-[#FFFDF7]',
    primaryBtnClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
    primaryBtnHoverClass: 'hover:bg-amber-700',
    secondaryBtnClass: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200',
    accentTextClass: 'text-amber-800',
    accentBadgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    accentBorderClass: 'border-amber-300',
    cardHighlightClass: 'border-amber-300 bg-amber-50/50',
    ringClass: 'focus:ring-amber-500 ring-amber-300',
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender (Soft Violet)',
    subtitle: 'Playful mindful purple encouraging confidence',
    hex: '#7c3aed',
    bgHex: '#faf8ff',
    bgAppClass: 'bg-[#FAF8FF]',
    primaryBtnClass: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/20',
    primaryBtnHoverClass: 'hover:bg-violet-700',
    secondaryBtnClass: 'bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200',
    accentTextClass: 'text-violet-700',
    accentBadgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
    accentBorderClass: 'border-violet-300',
    cardHighlightClass: 'border-violet-300 bg-violet-50/50',
    ringClass: 'focus:ring-violet-500 ring-violet-300',
  },
};

export const COLOR_THEME_LIST: ThemeConfig[] = [
  THEME_CONFIGS.sky,
  THEME_CONFIGS.rose,
  THEME_CONFIGS.sage,
  THEME_CONFIGS.amber,
  THEME_CONFIGS.lavender,
];

export const DEFAULT_THEME_PREFERENCES: ThemePreferences = {
  colorTheme: 'sky',
  displayFormat: 'comfortable',
};

export function getThemeConfig(theme: ColorTheme): ThemeConfig {
  return THEME_CONFIGS[theme] || THEME_CONFIGS.sky;
}

/**
 * Applies active theme and display format dynamically to HTML root and body
 */
export function applyThemeToDocument(prefs: ThemePreferences): void {
  const cfg = getThemeConfig(prefs.colorTheme);
  
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.setAttribute('data-theme', prefs.colorTheme);
    root.setAttribute('data-format', prefs.displayFormat);
    root.style.setProperty('--color-theme-primary', cfg.hex);
    root.style.setProperty('--color-theme-bg', cfg.bgHex);

    if (document.body) {
      document.body.style.backgroundColor = cfg.bgHex;
      document.body.setAttribute('data-theme', prefs.colorTheme);
      document.body.setAttribute('data-format', prefs.displayFormat);
    }
  }
}
