"use client"

import { useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRipple } from "@/hooks/useRipple"

interface RippleLinkProps {
  href: string
  className?: string
  rippleColor?: string
  /** When true, intercepts navigation and runs a page transition */
  pageTransition?: boolean
  /** "reveal" = circular ink reveal (default), "slide" = slide in from right */
  transitionType?: "reveal" | "slide"
  children: React.ReactNode
}

export default function RippleLink({
  href,
  className,
  rippleColor = "bg-amber-400",
  pageTransition = false,
  transitionType = "reveal",
  children,
}: RippleLinkProps) {
  const router = useRouter()
  const { ripples, addRipple, containerRef } = useRipple()
  const rippleFullRadiusRef = useRef(0)

  function handlePointerDown(e: React.PointerEvent) {
    if (pageTransition) {
      document.documentElement.style.setProperty("--ripple-x", `${e.clientX}px`)
      document.documentElement.style.setProperty("--ripple-y", `${e.clientY}px`)
      // Store the full ripple radius (diagonal of the card) so we can hand it
      // off to the page-transition clip-path as the starting circle size.
      const el = containerRef.current
      if (el) {
        const rect = el.getBoundingClientRect()
        rippleFullRadiusRef.current = Math.hypot(rect.width, rect.height)
      }
    }
    addRipple(e)
  }

  function handleClick(e: React.MouseEvent) {
    if (!pageTransition) return
    // Fall back to normal navigation if the API isn't available (Firefox, old Safari)
    if (!("startViewTransition" in document)) return
    e.preventDefault()

    if (transitionType === "slide") {
      document.documentElement.classList.add("vt-slide")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const t = (document as any).startViewTransition(() => router.push(href))
      t.finished.finally(() => document.documentElement.classList.remove("vt-slide"))
      return
    }

    const rippleDuration = 1000 // must match ripple-expand animation duration (ms)
    const delay = 250           // must match setTimeout delay below (ms)
    // Delay the transition so the ripple has time to expand before the browser
    // captures the old-page snapshot (which freezes in-DOM animations).
    setTimeout(() => {
      // At t=250ms into the 1000ms ease-out ripple animation the blob is roughly
      // 50% of its full size. Start the clip-path circle from that same radius so
      // the page reveal feels like a direct continuation of the ink ripple.
      const startRadius = Math.round(rippleFullRadiusRef.current * 0.5)
      // The clip must cover the whole viewport (much more distance than the
      // card-sized ripple), so give it the full ripple duration — not just the
      // remaining slice — so both animations finish at roughly the same time.
      const remainingDuration = rippleDuration
      document.documentElement.style.setProperty("--ripple-start-radius", `${startRadius}px`)
      document.documentElement.style.setProperty("--ripple-transition-duration", `${remainingDuration}ms`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(document as any).startViewTransition(() => router.push(href))
    }, delay)
  }

  return (
    <>
      <style>{`
        @keyframes ripple-expand {
          from { transform: translate(-50%, -50%) scale(0); opacity: 0.35; }
          to   { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
      `}</style>
      <Link
        ref={containerRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        className={`relative overflow-hidden select-none ${className ?? ""}`}
      >
        {children}
        {ripples.map((r) => (
          <span
            key={r.id}
            className={`absolute rounded-full pointer-events-none ${rippleColor}`}
            style={{
              left: r.x,
              top: r.y,
              width: r.size,
              height: r.size,
              zIndex: 50,
              filter: "blur(8px)",
              animation: "ripple-expand 1000ms ease-out forwards",
            }}
          />
        ))}
      </Link>
    </>
  )
}
