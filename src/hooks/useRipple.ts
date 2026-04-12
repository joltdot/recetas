"use client"

import { useRef, useState } from "react"

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const containerRef = useRef<HTMLElement>(null)
  const nextId = useRef(0)

  function addRipple(e: React.PointerEvent) {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const size = Math.hypot(rect.width, rect.height) * 2
    const id = nextId.current++
    setRipples((prev) => [...prev, { id, x, y, size }])
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 1000)
  }

  return { ripples, addRipple, containerRef }
}
