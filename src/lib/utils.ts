import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(minutes: number | null | undefined): string {
  if (!minutes) return "—"
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export const CATEGORY_LABELS: Record<string, string> = {
  postres: "Postres",
  carnes: "Carnes",
  pastas: "Pastas",
  sopas: "Sopas",
  ensaladas: "Ensaladas",
  bebidas: "Bebidas",
  otros: "Otros",
}

export const CATEGORY_COLORS: Record<string, string> = {
  postres: "bg-pink-100 text-pink-700",
  carnes: "bg-red-100 text-red-700",
  pastas: "bg-yellow-100 text-yellow-700",
  sopas: "bg-orange-100 text-orange-700",
  ensaladas: "bg-green-100 text-green-700",
  bebidas: "bg-blue-100 text-blue-700",
  otros: "bg-stone-100 text-stone-700",
}
