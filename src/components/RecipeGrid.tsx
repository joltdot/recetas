"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import RippleLink from "./RippleLink"
import RecipeCard from "./RecipeCard"
import { useRecipeStore } from "@/store/recipeStore"
import type { Recipe } from "@/types"

const DESKTOP_PAGE_SIZE = 6

interface RecipeGridProps {
  allRecipes: Recipe[]
}

function CardList({ recipes, cols }: { recipes: Recipe[]; cols: string }) {
  return (
    <div className={`${cols} gap-4`}>
      {recipes.map((recipe) => (
        <div key={recipe.id} className="break-inside-avoid mb-4">
          <RecipeCard recipe={recipe} />
        </div>
      ))}
    </div>
  )
}

export default function RecipeGrid({ allRecipes }: RecipeGridProps) {
  const searchParams = useSearchParams()
  const storeCategory = useRecipeStore((s) => s.categoryFilter)
  // storeCategory is undefined until CategoryFilter mounts; fall back to URL
  const categoria = storeCategory !== undefined ? storeCategory : searchParams.get("categoria")

  function filter(slug: string | null) {
    return slug ? allRecipes.filter((r) => r.category?.slug === slug) : allRecipes
  }

  const [displayed, setDisplayed] = useState<Recipe[]>(() => filter(categoria))
  const [fading, setFading] = useState(false)
  const [page, setPage] = useState(0)
  const [pageFading, setPageFading] = useState(false)
  const [slideDir, setSlideDir] = useState<1 | -1>(1)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip animation on initial render
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const next = filter(categoria)
    // Skip animation if the resulting recipe list is identical
    const unchanged =
      next.length === displayed.length && next.every((r, i) => r.id === displayed[i]?.id)
    if (unchanged) return

    const wasEmpty = displayed.length === 0

    setFading(true)
    const t = setTimeout(() => {
      setDisplayed(next)
      setPage(0)
      if (wasEmpty && next.length > 0) {
        requestAnimationFrame(() => setFading(false))
      } else {
        setFading(false)
      }
    }, 180)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria])

  function changePage(newPage: number) {
    const dir = newPage > page ? 1 : -1
    setSlideDir(dir)
    setPageFading(true)
    setTimeout(() => {
      setPage(newPage)
      setPageFading(false)
    }, 160)
  }

  const totalPages = Math.ceil(displayed.length / DESKTOP_PAGE_SIZE)
  const paginatedItems = displayed.slice(page * DESKTOP_PAGE_SIZE, (page + 1) * DESKTOP_PAGE_SIZE)

  const animStyle: React.CSSProperties = {
    opacity: fading ? 0 : 1,
    transform: fading ? "translateY(6px)" : "translateY(0)",
    transition: "opacity 180ms ease, transform 180ms ease",
    pointerEvents: fading ? "none" : undefined,
  }

  if (displayed.length === 0) {
    return (
      <div
        className={`${fading ? "animate-empty-out" : "animate-empty-in"} flex flex-col items-center justify-center py-20 text-center`}
        style={{ pointerEvents: fading ? "none" : undefined }}
      >
        <div className="text-5xl mb-4">🍳</div>
        <h2 className="font-serif text-xl font-semibold text-stone-700 mb-2">
          {categoria ? "No hay recetas en esta categoría" : "Aún no tienes recetas"}
        </h2>
        <p className="text-stone-500 mb-6 max-w-xs">
          {categoria
            ? "Prueba seleccionando otra categoría o agrega una receta nueva."
            : "¡Agrega tu primera receta! Puedes escribirla o dictarla por voz."}
        </p>
        <RippleLink href="/receta/nueva" pageTransition transitionType="slide" rippleColor="bg-white/30" className="btn-primary">
          + Nueva Receta
        </RippleLink>
      </div>
    )
  }

  return (
    <div style={animStyle}>
      {/* Mobile: all cards, no pagination */}
      <div className="sm:hidden">
        <CardList recipes={displayed} cols="columns-1" />
      </div>

      {/* Desktop: paginated to 6 per page */}
      <div className="hidden sm:block">
        <div
          style={{
            opacity: pageFading ? 0 : 1,
            transform: pageFading ? `translateX(${slideDir * 20}px)` : "translateX(0)",
            transition: "opacity 160ms ease, transform 160ms ease",
            pointerEvents: pageFading ? "none" : undefined,
          }}
        >
          <CardList recipes={paginatedItems} cols="columns-2" />
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <button
              onClick={() => changePage(page - 1)}
              disabled={page === 0 || pageFading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-stone-600 border border-stone-200 hover:border-stone-300 hover:text-stone-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Anterior
            </button>

            <span className="text-sm text-stone-400 tabular-nums px-2">
              {page + 1} / {totalPages}
            </span>

            <button
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages - 1 || pageFading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-stone-600 border border-stone-200 hover:border-stone-300 hover:text-stone-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              Siguiente
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
