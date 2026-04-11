"use client"

import { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Don't show if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return

    const dismissed = sessionStorage.getItem("install-banner-dismissed")
    if (dismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show after 30 seconds
      setTimeout(() => setShow(true), 30_000)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (!show || !deferredPrompt) return null

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setShow(false)
    setDeferredPrompt(null)
  }

  function dismiss() {
    sessionStorage.setItem("install-banner-dismissed", "1")
    setShow(false)
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 inset-x-4 z-50 max-w-sm sm:max-w-sm sm:left-auto sm:right-6">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 text-white font-bold text-lg">
          R
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-900">Instalar en tu móvil</p>
          <p className="text-xs text-stone-500">Acceso offline y sin navegador</p>
        </div>
        <button onClick={handleInstall} className="btn-primary text-sm px-3 py-2 min-h-0 shrink-0">
          Instalar
        </button>
        <button onClick={dismiss} className="btn-ghost px-2 py-2 min-h-0 shrink-0" aria-label="Cerrar">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
