"use client"

import { useState, useRef } from "react"
import type { StructuredRecipe } from "@/types"

interface AudioRecorderProps {
  onStructured: (data: StructuredRecipe, audioUrl: string | null) => void
}

type Status = "idle" | "recording" | "processing" | "done" | "error"

export default function AudioRecorder({ onStructured }: AudioRecorderProps) {
  const [status, setStatus] = useState<Status>("idle")
  const [transcript, setTranscript] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  async function startRecording() {
    setErrorMessage(null)
    setTranscript("")
    chunksRef.current = []

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setErrorMessage("Permiso de micrófono denegado. Actívalo en la configuración del navegador.")
      setStatus("error")
      return
    }

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "audio/mp4"

    const recorder = new MediaRecorder(stream, { mimeType })

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop())
    }

    recorder.start(250) // collect chunks every 250ms
    mediaRecorderRef.current = recorder
    setStatus("recording")
    if (navigator.vibrate) navigator.vibrate(10)
  }

  async function stopAndProcess() {
    const recorder = mediaRecorderRef.current
    if (!recorder) return

    setStatus("processing")
    if (navigator.vibrate) navigator.vibrate(10)

    // Wait for the recorder to fully stop and flush the last chunk
    await new Promise<void>((resolve) => {
      recorder.addEventListener("stop", () => resolve(), { once: true })
      recorder.stop()
    })

    const mimeType = recorder.mimeType || "audio/webm"
    const audioBlob = new Blob(chunksRef.current, { type: mimeType })

    try {
      // Each fetch needs its own FormData — sharing one object across parallel
      // requests causes browsers to send an empty body on the second request.
      const transcribeForm = new FormData()
      transcribeForm.append("audio", audioBlob)
      const uploadForm = new FormData()
      uploadForm.append("audio", audioBlob)

      // Step 1: transcribe + upload audio in parallel
      const [transcribeRes, uploadRes] = await Promise.all([
        fetch("/api/transcribir", { method: "POST", body: transcribeForm }),
        fetch("/api/upload-audio", { method: "POST", body: uploadForm }),
      ])

      if (!transcribeRes.ok) {
        const data = await transcribeRes.json()
        throw new Error(data.error ?? "Error al transcribir")
      }

      const { text } = await transcribeRes.json()
      setTranscript(text)

      // Audio URL is best-effort — if upload fails we still proceed
      const audioUrl: string | null = uploadRes.ok ? (await uploadRes.json()).url : null

      // Step 2: structure with Claude
      const structureRes = await fetch("/api/estructurar-receta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (!structureRes.ok) {
        const data = await structureRes.json()
        throw new Error(data.error ?? "Error al procesar")
      }

      const data: StructuredRecipe = await structureRes.json()
      setStatus("done")
      onStructured(data, audioUrl)
    } catch (e: unknown) {
      setErrorMessage(e instanceof Error ? e.message : "Error al procesar el audio")
      setStatus("error")
    }
  }

  function reset() {
    mediaRecorderRef.current?.stop()
    setStatus("idle")
    setTranscript("")
    setErrorMessage(null)
  }

  return (
    <div className="space-y-4">
      {/* Idle */}
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

      {/* Recording */}
      {status === "recording" && (
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
      )}

      {/* Processing */}
      {status === "processing" && (
        <div className="flex flex-col items-center gap-3 py-6">
          <svg className="w-10 h-10 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-stone-600 font-medium">Procesando con IA...</p>
          {transcript ? (
            <div className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3">
              <p className="text-xs text-stone-400 mb-1 font-medium uppercase tracking-wide">Transcripción</p>
              <p className="text-stone-700 text-sm leading-relaxed max-h-40 overflow-y-auto">{transcript}</p>
            </div>
          ) : (
            <p className="text-stone-400 text-sm">Transcribiendo audio...</p>
          )}
        </div>
      )}

      {/* Done */}
      {status === "done" && (
        <div className="space-y-3">
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
          {transcript && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <p className="text-xs text-stone-400 mb-1 font-medium uppercase tracking-wide">Transcripción</p>
              <p className="text-stone-700 text-sm leading-relaxed">{transcript}</p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
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
