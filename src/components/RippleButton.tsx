"use client"

import React from "react"
import { useRipple } from "@/hooks/useRipple"

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rippleColor?: string
}

const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(function RippleButton(
  { rippleColor = "bg-white/50", className, children, onPointerDown, ...props },
  forwardedRef
) {
  const { ripples, addRipple, containerRef } = useRipple()

  return (
    <>
      <style>{`
        @keyframes ripple-expand {
          from { transform: translate(-50%, -50%) scale(0); opacity: 0.35; }
          to   { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
      `}</style>
      <button
        ref={(el) => {
          ;(containerRef as React.MutableRefObject<HTMLButtonElement | null>).current = el
          if (typeof forwardedRef === "function") forwardedRef(el)
          else if (forwardedRef) forwardedRef.current = el
        }}
        onPointerDown={(e) => { addRipple(e); onPointerDown?.(e) }}
        className={`relative overflow-hidden select-none ${className ?? ""}`}
        {...props}
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
      </button>
    </>
  )
})

export default RippleButton
