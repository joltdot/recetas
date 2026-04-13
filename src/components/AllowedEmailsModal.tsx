"use client"

import { useEffect, useRef, useState } from "react"

interface EmailEntry {
  id: string
  email: string
}

interface PresenceEntry {
  email: string
  name: string | null
  image: string | null
  lastSeenAt: string
}

interface AllowedEmailsModalProps {
  onClose: () => void
}

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000)
  if (mins < 1) return "Ahora"
  if (mins < 60) return `Hace ${mins} min`
  const h = Math.floor(mins / 60)
  return `Hace ${h}h`
}

function isOnline(date: Date) {
  return Date.now() - date.getTime() < 3 * 60_000
}

export default function AllowedEmailsModal({ onClose }: AllowedEmailsModalProps) {
  const [emails, setEmails] = useState<EmailEntry[]>([])
  const [presence, setPresence] = useState<Map<string, PresenceEntry>>(new Map())
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/allowed-emails").then((r) => r.json()),
      fetch("/api/presence").then((r) => r.ok ? r.json() : []),
    ]).then(([emailData, presenceData]: [EmailEntry[], PresenceEntry[]]) => {
      setEmails(emailData)
      const map = new Map<string, PresenceEntry>()
      for (const p of presenceData) {
        map.set(p.email.toLowerCase(), p)
      }
      setPresence(map)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [loading])

  function closeModal() {
    setClosing(true)
  }

  async function addEmail() {
    const trimmed = input.trim().toLowerCase()
    if (!trimmed) return
    setAdding(true)
    setError(null)
    const res = await fetch("/api/allowed-emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmed }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "Error al agregar")
    } else {
      setEmails((prev) => [...prev, data])
      setInput("")
    }
    setAdding(false)
  }

  async function removeEmail(entry: EmailEntry) {
    const res = await fetch(`/api/allowed-emails/${encodeURIComponent(entry.email)}`, { method: "DELETE" })
    if (res.ok) {
      setEmails((prev) => prev.filter((e) => e.id !== entry.id))
    }
  }

  const onlineCount = emails.filter((e) => {
    const p = presence.get(e.email.toLowerCase())
    return p && isOnline(new Date(p.lastSeenAt))
  }).length

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* Modal — bottom sheet on mobile, centered dialog on desktop */}
      <div
        onAnimationEnd={() => { if (closing) onClose() }}
        className={`fixed z-50 bg-white shadow-2xl border border-stone-200 overflow-hidden bottom-0 left-0 right-0 rounded-t-2xl pb-safe sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-sm sm:rounded-2xl sm:pb-0 ${closing ? "animate-modal-close" : "animate-modal"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div>
            <h2 className="font-serif text-lg font-semibold text-stone-900">Acceso permitido</h2>
            {!loading && onlineCount > 0 && (
              <p className="text-xs text-emerald-600 font-medium mt-0.5">
                {onlineCount} en línea ahora
              </p>
            )}
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Email list */}
        <div className="px-5 py-3 max-h-64 overflow-y-auto space-y-1">
          {loading ? (
            <p className="text-sm text-stone-400 py-4 text-center">Cargando...</p>
          ) : emails.length === 0 ? (
            <p className="text-sm text-stone-400 py-4 text-center">No hay emails guardados</p>
          ) : (
            emails.map((entry) => {
              const p = presence.get(entry.email.toLowerCase())
              const online = p ? isOnline(new Date(p.lastSeenAt)) : false
              const ago = p ? timeAgo(new Date(p.lastSeenAt)) : null

              return (
                <div key={entry.id} className="flex items-center justify-between gap-2 py-1.5 group">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Presence dot */}
                    <span
                      className={`shrink-0 w-2 h-2 rounded-full ${online ? "bg-emerald-500" : "bg-stone-300"}`}
                      title={online ? "En línea" : ago ?? "Sin actividad"}
                    />
                    <div className="min-w-0">
                      <span className="text-sm text-stone-700 truncate block">{entry.email}</span>
                      {ago && (
                        <span className={`text-xs ${online ? "text-emerald-600" : "text-stone-400"}`}>
                          {online ? "En línea" : ago}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeEmail(entry)}
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-40 group-hover:opacity-100"
                    aria-label={`Eliminar ${entry.email}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Add email */}
        <div className="px-5 py-4 border-t border-stone-100 space-y-2">
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="email"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(null) }}
              onKeyDown={(e) => { if (e.key === "Enter") addEmail() }}
              placeholder="nuevo@email.com"
              className="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-colors"
            />
            <button
              onClick={addEmail}
              disabled={adding || !input.trim()}
              className="btn-primary text-sm px-4 py-2 min-h-0 disabled:opacity-50 disabled:pointer-events-none"
            >
              {adding ? "..." : "Agregar"}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
