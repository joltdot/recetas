"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="font-serif text-xl font-semibold text-stone-700 mb-2">Algo salió mal</h2>
      <p className="text-stone-500 mb-6 max-w-xs text-sm">
        {error.message ?? "Ocurrió un error inesperado. Por favor intenta de nuevo."}
      </p>
      <button onClick={reset} className="btn-primary">
        Intentar de nuevo
      </button>
    </div>
  )
}
