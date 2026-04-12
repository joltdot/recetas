"use client"

import { useState, useEffect, useRef, useCallback } from "react"

const INTERVAL_MS = 5000

interface RecipeCarouselProps {
  images: string[]
}

export default function RecipeCarousel({ images }: RecipeCarouselProps) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length)
  }, [images.length])

  // Reset the interval every time the active slide changes so manual navigation
  // also resets the 5-second countdown.
  useEffect(() => {
    if (images.length <= 1) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(advance, INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [current, advance, images.length])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      setCurrent((prev) =>
        diff > 0 ? (prev + 1) % images.length : (prev - 1 + images.length) % images.length
      )
    }
    touchStartX.current = null
  }

  if (!images.length) return null

  return (
    <>
      {/* Self-contained keyframe — no Tailwind dependency */}
      <style>{`
        @keyframes dot-progress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>

      <div className="relative overflow-hidden rounded-2xl shadow-sm">
        {/* Slides */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((url, i) => (
            <div key={i} className="w-full flex-shrink-0 aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Foto ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                decoding={i === 0 ? "sync" : "async"}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Dot indicators — only shown when there is more than one image */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0 pointer-events-none">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Ir a imagen ${i + 1}`}
                className="pointer-events-auto flex items-end justify-center px-1 py-3"
                style={{ minWidth: 28, minHeight: 44 }}
              >
                {/* Visual dot -- kept small for aesthetics, padded wrapper
                    provides the 44px touch target around it. */}
                <span
                  className={`relative block rounded-full overflow-hidden transition-all duration-300 ${
                    i === current ? "w-8 h-1.5 bg-white/30" : "w-1.5 h-1.5 bg-white/50"
                  }`}
                >
                  {i === current && (
                    <span
                      key={current}
                      className="absolute inset-y-0 left-0 rounded-full bg-white"
                      style={{
                        width: 0,
                        animation: `dot-progress ${INTERVAL_MS}ms linear forwards`,
                      }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
