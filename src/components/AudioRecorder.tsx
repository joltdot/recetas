"use client"

import { useState, useRef, useEffect } from "react"
import type { StructuredRecipe } from "@/types"

interface AudioRecorderProps {
  onStructured: (data: StructuredRecipe) => void
}

type Status = "idle" | "listening" | "processing" | "done" | "error"


export default function AudioRecorder({ onStructured }: AudioRecorderProps) {
  const [status, setStatus] = useState<Status>("idle")
  const [transcript, setTranscript] = useState("")
  const [manualText, setManualText] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    )
  }, [])

  function startRecording() {
    setErrorMessage(null)
    setTranscript("")
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognitionCtor()
    recognition.lang = "es-ES"
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const full = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ")
      setTranscript(full)
    }

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "no-speech") return
      setErrorMessage(
        e.error === "not-allowed"
          ? "Permiso de micrófono denegado. Actívalo en la configuración del navegador."
          : "Error en la grabación. Intenta de nuevo."
      )
      setStatus("error")
    }

    recognition.onend = () => {
      if (status === "listening") setStatus("idle")
    }

    recognition.start()
    recognitionRef.current = recognition
    setStatus("listening")
    // Haptic feedback where supported
    if (navigator.vibrate) navigator.vibrate(10)
  }

  async function stopAndProcess() {
    recognitionRef.current?.stop()
    setStatus("processing")
    if (navigator.vibrate) navigator.vibrate(10)

    try {
      const res = await fetch("/api/estructurar-receta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Error al procesar")
      }

      const data: StructuredRecipe = await res.json()
      setStatus("done")
      onStructured(data)
    } catch (e: unknown) {
      setErrorMessage(e instanceof Error ? e.message : "Error al estructurar la receta")
      setStatus("error")
    }
  }

  async function processManual() {
    if (manualText.trim().length < 10) {
      setErrorMessage("El texto es demasiado corto. Describe la receta con más detalle.")
      return
    }
    setErrorMessage(null)
    setStatus("processing")

    try {
      const res = await fetch("/api/estructurar-receta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: manualText }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Error al procesar")
      }

      const data: StructuredRecipe = await res.json()
      setStatus("done")
      onStructured(data)
    } catch (e: unknown) {
      setErrorMessage(e instanceof Error ? e.message : "Error al estructurar la receta")
      setStatus("error")
    }
  }

  function reset() {
    recognitionRef.current?.abort()
    setStatus("idle")
    setTranscript("")
    setManualText("")
    setErrorMessage(null)
  }

  // Loading state while checking support
  if (isSupported === null) return null

  // Safari / iOS fallback: textarea + AI processing
  if (!isSupported) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-stone-500 bg-stone-50 rounded-xl p-3 border border-stone-200">
          <svg className="w-5 h-5 shrink-0 mt-0.5 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <span>Tu navegador no admite grabación de voz (requiere Chrome o Edge). Escribe o pega el texto de la receta y la IA lo estructurará.</span>
        </div>

        {status === "done" ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <svg className="w-6 h-6 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-800 text-sm font-medium">¡Receta estructurada! Revisa los campos del formulario.</span>
            <button type="button" onClick={reset} className="ml-auto btn-ghost text-sm px-3 py-1.5 min-h-0">
              Intentar de nuevo
            </button>
          </div>
        ) : (
          <>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Ej: Tortilla española para 4 personas. Necesitas 4 huevos, 3 patatas medianas y media cebolla. Primero fríe las patatas con la cebolla en aceite de oliva durante 20 minutos. Luego mezcla con los huevos batidos y cuaja en la sartén 5 minutos por cada lado..."
              rows={5}
              className="input resize-none"
              disabled={status === "processing"}
            />
            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
            <button
              type="button"
              onClick={processManual}
              disabled={status === "processing" || manualText.trim().length < 10}
              className="btn-primary w-full"
            >
              {status === "processing" ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Procesando con IA...
                </>
              ) : (
                "✨ Estructurar con IA"
              )}
            </button>
          </>
        )}
      </div>
    )
  }

  // Chrome / Edge: voice recording
  return (
    <div className="space-y-4">
      {/* Idle state */}
      {status === "idle" && (
        <div className="flex flex-col items-center gap-4 py-2">
          <button
            type="button"
            onClick={startRecording}
            className="relative w-20 h-20 rounded-full bg-red-500 active:bg-red-700 text-white flex items-center justify-center shadow-lg transition-colors"
            aria-label="Iniciar grabación"
          >
            <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4zm0 2a2 2 0 00-2 2v6a2 2 0 004 0V5a2 2 0 00-2-2zm-1 15.93V21h2v-2.07A8.001 8.001 0 0020 11h-2a6 6 0 01-12 0H4a8.001 8.001 0 007 7.93z" />
            </svg>
          </button>
          <p className="text-stone-500 text-sm text-center">Presiona el micrófono y describe la receta</p>
        </div>
      )}

      {/* Listening state */}
      {status === "listening" && (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
              <button
                type="button"
                onClick={stopAndProcess}
                className="relative w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg"
                aria-label="Detener y procesar grabación"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            </div>
            <p className="text-red-600 font-medium text-sm animate-pulse">Grabando... presiona para procesar</p>
          </div>

          {transcript && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <p className="text-xs text-stone-400 mb-1.5 font-medium uppercase tracking-wide">Transcripción en vivo</p>
              <p className="text-stone-700 text-sm leading-relaxed">{transcript}</p>
            </div>
          )}
        </div>
      )}

      {/* Processing state */}
      {status === "processing" && (
        <div className="flex flex-col items-center gap-3 py-6">
          <svg className="w-10 h-10 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-stone-600 font-medium">Procesando con IA...</p>
          <p className="text-stone-400 text-sm">Esto tarda unos segundos</p>
        </div>
      )}

      {/* Done state */}
      {status === "done" && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <svg className="w-6 h-6 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-green-800 font-medium text-sm">¡Receta detectada!</p>
            <p className="text-green-700 text-xs">Revisa y ajusta los campos del formulario.</p>
          </div>
          <button type="button" onClick={reset} className="btn-ghost text-sm px-3 py-1.5 min-h-0">
            Grabar de nuevo
          </button>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div className="flex-1">
            <p className="text-red-700 text-sm font-medium">Error</p>
            <p className="text-red-600 text-sm">{errorMessage}</p>
          </div>
          <button type="button" onClick={reset} className="btn-ghost text-sm px-3 py-1.5 min-h-0 text-red-600">
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}
