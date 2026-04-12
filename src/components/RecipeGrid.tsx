"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import RecipeCard from "./RecipeCard"
import type { Recipe } from "@/types"

interface RecipeGridProps {
  allRecipes: Recipe[]
}

export default function RecipeGrid({ allRecipes }: RecipeGridProps) {
  const searchParams = useSearchParams()
  const categoria = searchParams.get("categoria")

  function filter(slug: string | null) {
    return slug ? allRecipes.filter((r) => r.category?.slug === slug) : allRecipes
  }

  const [displayed, setDisplayed] = useState<Recipe[]>(() => filter(categoria))
  const [fading, setFading] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip animation on initial render
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const next = filter(categoria)
    // Skip animation if the resulting recipe list is identical (e.g. navigating
    // back to home restores the same state — no visual change needed)
    const unchanged =
      next.length === displayed.length && next.every((r, i) => r.id === displayed[i]?.id)
    if (unchanged) return

    setFading(true)
    const t = setTimeout(() => {
      setDisplayed(next)
      setFading(false)
    }, 180)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria])

  if (displayed.length === 0 && !fading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🍳</div>
        <h2 className="font-serif text-xl font-semibold text-stone-700 mb-2">
          {categoria ? "No hay recetas en esta categoría" : "Aún no tienes recetas"}
        </h2>
        <p className="text-stone-500 mb-6 max-w-xs">
          {categoria
            ? "Prueba seleccionando otra categoría o agrega una receta nueva."
            : "¡Agrega tu primera receta! Puedes escribirla o dictarla por voz."}
        </p>
        <Link href="/receta/nueva" className="btn-primary">
          + Nueva Receta
        </Link>
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      style={{
        opacity: fading ? 0 : 1,
        transform: fading ? "translateY(6px)" : "translateY(0)",
        transition: "opacity 180ms ease, transform 180ms ease",
      }}
    >
      {displayed.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  )
}
