"use client"

import { useState } from "react"

export default function TranscriptToggle({ transcript }: { transcript: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-700 transition-colors"
      >
        <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${open ? "bg-stone-200 text-stone-700" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        </span>
        {open ? "Ocultar transcripción" : "Ver transcripción"}
      </button>

      {open && (
        <div className="mt-3 bg-stone-50 border border-stone-200 rounded-xl p-4 max-h-48 overflow-y-auto">
          <p className="text-xs text-stone-400 font-medium uppercase tracking-wide mb-2">Transcripción de voz</p>
          <p className="text-stone-700 text-sm leading-relaxed">{transcript}</p>
        </div>
      )}
    </div>
  )
}
