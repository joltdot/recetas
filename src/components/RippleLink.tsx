"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRipple } from "@/hooks/useRipple"

interface RippleLinkProps {
  href: string
  className?: string
  rippleColor?: string
  /** When true, intercepts navigation and runs a circular reveal transition */
  pageTransition?: boolean
  children: React.ReactNode
}

export default function RippleLink({
  href,
  className,
  rippleColor = "bg-amber-400",
  pageTransition = false,
  children,
}: RippleLinkProps) {
  const router = useRouter()
  const { ripples, addRipple, containerRef } = useRipple()

  function handlePointerDown(e: React.PointerEvent) {
    if (pageTransition) {
      document.documentElement.style.setProperty("--ripple-x", `${e.clientX}px`)
      document.documentElement.style.setProperty("--ripple-y", `${e.clientY}px`)
    }
    addRipple(e)
  }

  function handleClick(e: React.MouseEvent) {
    if (!pageTransition) return
    // Fall back to normal navigation if the API isn't available (Firefox, old Safari)
    if (!("startViewTransition" in document)) return
    e.preventDefault()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(document as any).startViewTransition(() => router.push(href))
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
