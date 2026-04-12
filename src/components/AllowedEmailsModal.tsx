"use client"

import { useEffect, useRef, useState } from "react"

interface EmailEntry {
  id: string
  email: string
}

interface AllowedEmailsModalProps {
  onClose: () => void
}

export default function AllowedEmailsModal({ onClose }: AllowedEmailsModalProps) {
  const [emails, setEmails] = useState<EmailEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/allowed-emails")
      .then((r) => r.json())
      .then((data) => { setEmails(data); setLoading(false) })
      .catch(() => setLoading(false))
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* Modal */}
      <div
        onAnimationEnd={() => { if (closing) onClose() }}
        className={`${closing ? "animate-modal-close" : "animate-modal"} fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="font-serif text-lg font-semibold text-stone-900">Acceso permitido</h2>
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
            emails.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-2 py-1.5 group">
                <span className="text-sm text-stone-700 truncate">{entry.email}</span>
                <button
                  onClick={() => removeEmail(entry)}
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={`Eliminar ${entry.email}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
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
