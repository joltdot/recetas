"use client"

import type { Ingredient } from "@/types"
import ImageUploader from "./ImageUploader"

interface IngredientEditorProps {
  ingredients: Ingredient[]
  onChange: (ingredients: Ingredient[]) => void
}

export default function IngredientEditor({ ingredients, onChange }: IngredientEditorProps) {
  function update(index: number, field: keyof Ingredient, value: string | null) {
    const updated = ingredients.map((ing, i) =>
      i === index ? { ...ing, [field]: value } : ing
    )
    onChange(updated)
  }

  function remove(index: number) {
    onChange(ingredients.filter((_, i) => i !== index))
  }

  function add() {
    onChange([...ingredients, { amount: "", unit: "", name: "" }])
  }

  return (
    <div className="space-y-2">
      {ingredients.map((ing, i) => (
        <div key={i} className="flex flex-col xs:flex-row gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
          <div className="flex gap-2 xs:flex-none">
            <input
              value={ing.amount}
              onChange={(e) => update(i, "amount", e.target.value)}
              placeholder="Cant."
              inputMode="decimal"
              className="input xs:w-20"
              aria-label="Cantidad"
            />
            <input
              value={ing.unit}
              onChange={(e) => update(i, "unit", e.target.value)}
              placeholder="Unidad"
              className="input xs:w-24"
              aria-label="Unidad"
            />
          </div>
          <div className="flex gap-2 flex-1">
            <input
              value={ing.name}
              onChange={(e) => update(i, "name", e.target.value)}
              placeholder="Ingrediente *"
              className="input flex-1"
              required
              aria-label="Nombre del ingrediente"
            />
            <ImageUploader
              value={ing.imageUrl ?? null}
              onChange={(url) => update(i, "imageUrl", url)}
              compact
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="btn-ghost text-red-400 px-3 min-w-[44px]"
              aria-label={`Eliminar ingrediente ${i + 1}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="btn-secondary w-full">
        + Agregar ingrediente
      </button>
    </div>
  )
}
