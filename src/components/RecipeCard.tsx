"use client"

import { cn, formatDate, formatTime, getCategoryStyle } from "@/lib/utils"
import RippleLink from "./RippleLink"
import type { Recipe } from "@/types"

interface RecipeCardProps {
  recipe: Recipe
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const categoryName = recipe.category?.name
  const categoryColor = recipe.category?.color

  const firstImage = recipe.images?.[0]
  const hasBadge = !!categoryName

  return (
    <RippleLink
      href={`/receta/${recipe.id}`}
      rippleColor="bg-amber-300"
      pageTransition
      className={cn("card block group min-h-[120px]", firstImage && "p-0")}
    >
      {firstImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={firstImage}
          alt={recipe.title}
          loading="lazy"
          decoding="async"
          className="w-full aspect-[16/10] object-cover"
        />
      )}

      <div className={firstImage ? cn("px-4 pb-4", hasBadge ? "pt-4" : "pt-2") : ""}>
        {(categoryName || recipe.source === "audio") && (
          <div className="flex items-start gap-2 mb-2">
            {categoryName && (
              <span className="badge text-[11px]" style={getCategoryStyle(categoryColor)}>
                {categoryName}
              </span>
            )}
            {recipe.source === "audio" && (
              <span className="badge text-[11px] bg-violet-100 text-violet-700 ml-auto shrink-0">🎙 IA</span>
            )}
          </div>
        )}

        <h3 className="font-serif text-lg font-semibold text-stone-900 leading-snug mb-1 group-hover:text-amber-700 transition-colors line-clamp-2">
          {recipe.title}
        </h3>

        {recipe.description && (
          <p className="text-stone-500 text-sm line-clamp-2 mb-3">{recipe.description}</p>
        )}

        <div className="flex items-center gap-4 text-stone-400 text-sm mt-auto">
          {recipe.createdAt && (
            <span className="text-xs text-stone-400">{formatDate(recipe.createdAt)}</span>
          )}
          {recipe.prepTime != null && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(recipe.prepTime)}
            </span>
          )}
          {recipe.servings != null && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              {recipe.servings} {recipe.servings === 1 ? "porción" : "porciones"}
            </span>
          )}
        </div>
      </div>
    </RippleLink>
  )
}
