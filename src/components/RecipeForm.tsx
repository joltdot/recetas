"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import IngredientEditor from "./IngredientEditor"
import StepEditor from "./StepEditor"
import AudioRecorder from "./AudioRecorder"
import type { Category, Recipe, Ingredient, Step, StructuredRecipe } from "@/types"

interface RecipeFormProps {
  categories: Category[]
  initialData?: Recipe
}

export default function RecipeForm({ categories, initialData }: RecipeFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  const [title, setTitle] = useState(initialData?.title ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "")
  const [prepTime, setPrepTime] = useState(initialData?.prepTime?.toString() ?? "")
  const [servings, setServings] = useState(initialData?.servings?.toString() ?? "")
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    (initialData?.ingredients as Ingredient[]) ?? [{ amount: "", unit: "", name: "" }]
  )
  const [steps, setSteps] = useState<Step[]>(
    (initialData?.steps as Step[]) ?? [{ order: 1, instruction: "" }]
  )
  const [source, setSource] = useState(initialData?.source ?? "manual")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioPrefilled, setAudioPrefilled] = useState(false)

  function handleAudioResult(data: StructuredRecipe) {
    if (data.title) setTitle(data.title)
    if (data.description) setDescription(data.description)
    if (data.ingredients?.length) setIngredients(data.ingredients)
    if (data.steps?.length) setSteps(data.steps.sort((a, b) => a.order - b.order))
    if (data.prep_time) setPrepTime(data.prep_time.toString())
    if (data.servings) setServings(data.servings.toString())
    if (data.category) {
      const matched = categories.find(
        (c) => c.slug === data.category || c.name.toLowerCase() === data.category?.toLowerCase()
      )
      if (matched) setCategoryId(matched.id)
    }
    setSource("audio")
    setAudioPrefilled(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("El nombre de la receta es obligatorio.")
      return
    }
    const validIngredients = ingredients.filter((i) => i.name.trim())
    if (validIngredients.length === 0) {
      setError("Agrega al menos un ingrediente.")
      return
    }
    const validSteps = steps.filter((s) => s.instruction.trim())
    if (validSteps.length === 0) {
      setError("Agrega al menos un paso de preparación.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        ingredients: validIngredients,
        steps: validSteps.map((s, i) => ({ ...s, order: i + 1 })),
        categoryId: categoryId || null,
        prepTime: prepTime ? parseInt(prepTime) : null,
        servings: servings ? parseInt(servings) : null,
        source,
      }

      const res = await fetch(
        isEdit ? `/api/recetas/${initialData!.id}` : "/api/recetas",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Error al guardar")
      }

      const saved = await res.json()
      router.push(`/receta/${saved.id}`)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar la receta")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Audio recorder — only on create */}
      {!isEdit && (
        <section className="card">
          <h2 className="font-serif text-lg font-semibold mb-1 text-stone-800">Dictar receta por voz</h2>
          <p className="text-stone-500 text-sm mb-4">Habla y la IA estructurará la receta automáticamente.</p>
          <AudioRecorder onStructured={handleAudioResult} />
        </section>
      )}

      {/* Audio prefill notice */}
      {audioPrefilled && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          ✨ Receta pre-rellenada desde audio. Revisa y ajusta los campos antes de guardar.
        </div>
      )}

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="font-serif text-lg font-semibold text-stone-800">Información básica</h2>

        <div>
          <label htmlFor="title" className="label">Nombre de la receta *</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Tortilla española"
            inputMode="text"
            autoCapitalize="words"
            className="input"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="label">Descripción breve</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Una línea describiendo la receta..."
            rows={2}
            className="input resize-none"
          />
        </div>

        <div>
          <label htmlFor="category" className="label">Categoría</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input"
          >
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="prepTime" className="label">Tiempo (min)</label>
            <input
              id="prepTime"
              type="number"
              inputMode="numeric"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="30"
              min="1"
              className="input"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="servings" className="label">Porciones</label>
            <input
              id="servings"
              type="number"
              inputMode="numeric"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              placeholder="4"
              min="1"
              className="input"
            />
          </div>
        </div>
      </section>

      {/* Ingredients */}
      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-stone-800">
          Ingredientes {ingredients.length > 0 && <span className="text-stone-400 font-sans text-base font-normal">({ingredients.length})</span>}
        </h2>
        <IngredientEditor ingredients={ingredients} onChange={setIngredients} />
      </section>

      {/* Steps */}
      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-stone-800">
          Preparación {steps.length > 0 && <span className="text-stone-400 font-sans text-base font-normal">({steps.length} pasos)</span>}
        </h2>
        <StepEditor steps={steps} onChange={setSteps} />
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary flex-1"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary flex-1"
          disabled={loading}
        >
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear receta"}
        </button>
      </div>
    </form>
  )
}
