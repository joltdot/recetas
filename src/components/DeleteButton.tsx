"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DeleteButton({ recipeId }: { recipeId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await fetch(`/api/recetas/${recipeId}`, { method: "DELETE" })
      router.push("/")
      router.refresh()
    } catch {
      setLoading(false)
      alert("No se pudo eliminar la receta. Intenta de nuevo.")
    }
  }

  if (confirming) {
    return (
      <div className="flex gap-2 flex-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="btn-danger flex-1"
          aria-label="Confirmar eliminación"
        >
          {loading ? "Eliminando..." : "Sí, eliminar"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="btn-secondary flex-1"
          aria-label="Cancelar"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="btn-ghost text-red-500 active:bg-red-50 flex-1"
      aria-label="Eliminar receta"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
      Eliminar
    </button>
  )
}
