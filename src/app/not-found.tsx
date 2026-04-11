import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h2 className="font-serif text-xl font-semibold text-stone-700 mb-2">Receta no encontrada</h2>
      <p className="text-stone-500 mb-6 max-w-xs text-sm">
        Esta receta no existe o fue eliminada.
      </p>
      <Link href="/" className="btn-primary">
        Volver al inicio
      </Link>
    </div>
  )
}
