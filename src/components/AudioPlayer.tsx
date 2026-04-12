"use client"

import { useEffect, useRef, useState } from "react"

export default function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onEnded = () => setPlaying(false)
    const onCanPlay = () => setReady(true)
    el.addEventListener("ended", onEnded)
    el.addEventListener("canplaythrough", onCanPlay)
    return () => {
      el.removeEventListener("ended", onEnded)
      el.removeEventListener("canplaythrough", onCanPlay)
    }
  }, [])

  function toggle() {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      el.play()
      setPlaying(true)
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      <button
        type="button"
        onClick={toggle}
        disabled={!ready}
        aria-label={playing ? "Pausar grabación" : "Escuchar grabación original"}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${playing ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-600 hover:bg-amber-200"}`}>
          {playing ? (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg className="w-3 h-3 translate-x-px" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          )}
        </span>
        {playing ? "Pausar" : "Escuchar grabación"}
      </button>
    </span>
  )
}
