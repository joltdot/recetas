"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn, CATEGORY_COLORS } from "@/lib/utils"
import RippleButton from "./RippleButton"
import type { Category } from "@/types"

interface CategoryFilterProps {
  categories: Category[]
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get("categoria")

  function select(slug: string | null) {
    router.replace(slug ? `/?categoria=${slug}` : "/", { scroll: false })
  }

  return (
    <div className="flex overflow-x-auto gap-2 -mx-4 px-4 scrollbar-hide">
      <RippleButton
        onClick={() => select(null)}
        rippleColor={!active ? "bg-white/40" : "bg-amber-500"}
        className={cn(
          "badge shrink-0 py-2 px-4 text-sm cursor-pointer transition-colors min-h-[36px]",
          !active
            ? "bg-amber-500 text-white"
            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
        )}
        aria-pressed={!active}
      >
        Todas
      </RippleButton>
      {categories.map((cat) => (
        <RippleButton
          key={cat.id}
          onClick={() => select(cat.slug)}
          rippleColor={active === cat.slug ? "bg-white/40" : "bg-amber-500"}
          className={cn(
            "badge shrink-0 py-2 px-4 text-sm cursor-pointer transition-colors min-h-[36px]",
            active === cat.slug
              ? "bg-amber-500 text-white"
              : cn(CATEGORY_COLORS[cat.slug] ?? "bg-stone-100 text-stone-600", "hover:opacity-80")
          )}
          aria-pressed={active === cat.slug}
        >
          {cat.name}
        </RippleButton>
      ))}
    </div>
  )
}
