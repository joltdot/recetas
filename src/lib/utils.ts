import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return ""
  return new Date(date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
}

export function formatTime(minutes: number | null | undefined): string {
  if (!minutes) return "—"
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

/** All available category color options. Keys are stored in the DB `color` column.
 *  `bg` / `text` / `dot` are hex values used via inline `style` props so they
 *  are never purged by Tailwind's content scanner. */
export const COLOR_OPTIONS = [
  { key: "pink",   bg: "#fce7f3", text: "#be185d", dot: "#f472b6" },
  { key: "red",    bg: "#fee2e2", text: "#b91c1c", dot: "#f87171" },
  { key: "orange", bg: "#ffedd5", text: "#c2410c", dot: "#fb923c" },
  { key: "amber",  bg: "#fef3c7", text: "#b45309", dot: "#fbbf24" },
  { key: "yellow", bg: "#fef9c3", text: "#a16207", dot: "#facc15" },
  { key: "lime",   bg: "#ecfccb", text: "#4d7c0f", dot: "#a3e635" },
  { key: "green",  bg: "#dcfce7", text: "#15803d", dot: "#4ade80" },
  { key: "teal",   bg: "#ccfbf1", text: "#0f766e", dot: "#2dd4bf" },
  { key: "cyan",   bg: "#cffafe", text: "#0e7490", dot: "#22d3ee" },
  { key: "blue",   bg: "#dbeafe", text: "#1d4ed8", dot: "#60a5fa" },
  { key: "indigo", bg: "#e0e7ff", text: "#4338ca", dot: "#818cf8" },
  { key: "purple", bg: "#f3e8ff", text: "#7e22ce", dot: "#c084fc" },
  { key: "rose",   bg: "#ffe4e6", text: "#be123c", dot: "#fb7185" },
  { key: "stone",  bg: "#f5f5f4", text: "#57534e", dot: "#a8a29e" },
] as const

export type ColorKey = (typeof COLOR_OPTIONS)[number]["key"]

const DEFAULT_COLOR = { bg: "#f5f5f4", text: "#57534e", dot: "#a8a29e" }

/** Returns `{ backgroundColor, color }` for use in inline `style` props on pills. */
export function getCategoryStyle(color?: string | null): { backgroundColor: string; color: string } {
  const opt = COLOR_OPTIONS.find((o) => o.key === color) ?? DEFAULT_COLOR
  return { backgroundColor: opt.bg, color: opt.text }
}

/** Returns the dot hex color for a given color key. */
export function getCategoryDotColor(color?: string | null): string {
  return (COLOR_OPTIONS.find((o) => o.key === color) ?? DEFAULT_COLOR).dot
}

// Legacy — kept so existing badge renders in CategoryFilter / RecipeCard still compile.
// These classes ARE in globals.css scope or safelist; prefer getCategoryStyle() for new code.
export function getCategoryClasses(color?: string | null): string {
  void color
  return "bg-stone-100 text-stone-600"
}

export const CATEGORY_COLORS: Record<string, string> = {}
