"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getCategoryStyle } from "@/lib/utils"
import RippleButton from "./RippleButton"
import { useRecipeStore } from "@/store/recipeStore"
import type { Category } from "@/types"

interface CategoryFilterProps {
  categories: Category[]
}

/** Linearly interpolate between two hex colours and return an rgb() string. */
function lerpHex(a: string, b: string, t: number): string {
  const p = (hex: string, o: number) => parseInt(hex.slice(o, o + 2), 16)
  const r = Math.round(p(a, 1) + (p(b, 1) - p(a, 1)) * t)
  const g = Math.round(p(a, 3) + (p(b, 3) - p(a, 3)) * t)
  const bl = Math.round(p(a, 5) + (p(b, 5) - p(a, 5)) * t)
  return `rgb(${r},${g},${bl})`
}

/** How much of `pill` is covered by `slider`, as a 0-1 fraction of pill width. */
function overlapFraction(slider: DOMRect, pill: DOMRect): number {
  const left = Math.max(slider.left, pill.left)
  const right = Math.min(slider.right, pill.right)
  return Math.max(0, Math.min(1, (right - left) / pill.width))
}

const SLIDER_DURATION = 300 // must match Tailwind duration-300 on the slider div

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const storeActive = useRecipeStore((s) => s.categoryFilter)
  const setCategoryFilter = useRecipeStore((s) => s.setCategoryFilter)

  const urlActive = searchParams.get("categoria")
  useEffect(() => {
    setCategoryFilter(urlActive)
  }, [urlActive, setCategoryFilter])

  const active = storeActive !== undefined ? storeActive : urlActive

  // Used only for the initial/static paint; rAF takes over during transitions.
  const [visualActive, setVisualActive] = useState<string | null | undefined>(active)

  const containerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const pillRefs = useRef<Map<string | null, HTMLElement>>(new Map())
  // Rest colour (not-under-slider) for each pill, populated in ref callbacks.
  const pillRestColors = useRef<Map<string | null, string>>(new Map())
  const rafRef = useRef<number | null>(null)

  // Move slider whenever active changes
  useEffect(() => {
    const container = containerRef.current
    const slider = sliderRef.current
    const activePill = pillRefs.current.get(active)
    if (!container || !slider || !activePill) return

    const containerRect = container.getBoundingClientRect()
    const pillRect = activePill.getBoundingClientRect()

    slider.style.width = `${pillRect.width}px`
    slider.style.height = `${pillRect.height}px`
    slider.style.left = `${pillRect.left - containerRect.left + container.scrollLeft}px`
    slider.style.top = `${pillRect.top - containerRect.top}px`
  }, [active, categories])

  function select(slug: string | null) {
    setCategoryFilter(slug)
    startTransition(() => {
      router.replace(slug ? `/?categoria=${slug}` : "/", { scroll: false })
    })

    const slider = sliderRef.current
    if (!slider) return

    // Cancel any in-progress animation before starting a new one.
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)

    const startTime = performance.now()

    function animate() {
      const elapsed = performance.now() - startTime
      const sliderRect = slider!.getBoundingClientRect()

      pillRefs.current.forEach((pillEl, pillSlug) => {
        const pillRect = pillEl.getBoundingClientRect()
        const t = overlapFraction(sliderRect, pillRect)
        const restColor = pillRestColors.current.get(pillSlug) ?? "#78716c"
        pillEl.style.color = lerpHex(restColor, "#ffffff", t)
      })

      if (elapsed < SLIDER_DURATION) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        rafRef.current = null
        setVisualActive(slug) // sync React state so next render is correct
      }
    }

    rafRef.current = requestAnimationFrame(animate)
  }

  return (
    <div
      ref={containerRef}
      className="relative flex overflow-x-auto gap-2 -mx-4 px-4 scrollbar-hide overscroll-x-contain touch-pan-x"
    >
      <div
        ref={sliderRef}
        className="absolute rounded-full bg-amber-500 transition-[left,width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
        aria-hidden
      />

      <RippleButton
        ref={(el) => {
          if (el) {
            pillRefs.current.set(null, el)
            pillRestColors.current.set(null, "#78716c")
          }
        }}
        onClick={() => select(null)}
        rippleColor="bg-white/40"
        className="badge relative shrink-0 py-2 px-4 text-sm cursor-pointer min-h-[44px] hover:opacity-80"
        style={{ color: !visualActive ? "#fff" : "#78716c" }}
        aria-pressed={!active}
      >
        Todas
      </RippleButton>

      {categories.map((cat) => {
        const colorStyle = getCategoryStyle(cat.color)
        return (
          <RippleButton
            key={cat.id}
            ref={(el) => {
              if (el) {
                pillRefs.current.set(cat.slug, el)
                pillRestColors.current.set(cat.slug, colorStyle.color)
              }
            }}
            onClick={() => select(cat.slug)}
            rippleColor="bg-white/40"
            className="badge relative shrink-0 py-2 px-4 text-sm cursor-pointer min-h-[44px] hover:opacity-80"
            style={{ color: visualActive === cat.slug ? "#fff" : colorStyle.color }}
            aria-pressed={active === cat.slug}
          >
            {cat.name}
          </RippleButton>
        )
      })}
    </div>
  )
}
