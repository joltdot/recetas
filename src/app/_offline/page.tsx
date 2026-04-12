"use client"

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">📡</div>
      <h1 className="font-serif text-2xl font-bold text-stone-800 mb-2">
        Sin conexión
      </h1>
      <p className="text-stone-500 max-w-xs mb-6">
        No hay conexión a internet. Revisa tu conexión e inténtalo de nuevo.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn-primary"
      >
        Reintentar
      </button>
    </div>
  )
}
