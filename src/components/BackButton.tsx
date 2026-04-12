"use client"

import { useRouter } from "next/navigation"
import { useRipple } from "@/hooks/useRipple"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  className?: string
  children: React.ReactNode
}

export default function BackButton({ className, children }: BackButtonProps) {
  const router = useRouter()
  const { ripples, addRipple, containerRef } = useRipple()

  function handlePointerDown(e: React.PointerEvent) {
    addRipple(e)
  }

  function handleClick(e: React.MouseEvent) {
    if (!("startViewTransition" in document)) {
      router.push("/")
      return
    }

    document.documentElement.style.setProperty("--ripple-x", `${e.clientX}px`)
    document.documentElement.style.setProperty("--ripple-y", `${e.clientY}px`)

    document.documentElement.classList.add("vt-backward")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transition = (document as any).startViewTransition(() => router.push("/"))
    transition.finished.finally(() => {
      document.documentElement.classList.remove("vt-backward")
      document.documentElement.style.removeProperty("--ripple-x")
      document.documentElement.style.removeProperty("--ripple-y")
    })
  }

  return (
    <>
      <style>{`
        @keyframes ripple-expand {
          from { transform: translate(-50%, -50%) scale(0); opacity: 0.35; }
          to   { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
      `}</style>
      <button
        ref={containerRef as React.RefObject<HTMLButtonElement>}
        type="button"
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        className={cn("relative overflow-hidden select-none", className)}
      >
        {children}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="absolute rounded-full pointer-events-none bg-amber-400"
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
      </button>
    </>
  )
}
