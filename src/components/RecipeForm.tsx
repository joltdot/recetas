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

  // Local mutable copy so newly created categories appear immediately
  const [localCategories, setLocalCategories] = useState<Category[]>(categories)
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [categoryError, setCategoryError] = useState<string | null>(null)

  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioPrefilled, setAudioPrefilled] = useState(false)

  function handleAudioResult(data: StructuredRecipe, url: string | null) {
    setAudioUrl(url)
    if (data.title) setTitle(data.title)
    if (data.description) setDescription(data.description)
    if (data.ingredients?.length) setIngredients(data.ingredients)
    if (data.steps?.length) setSteps(data.steps.sort((a, b) => a.order - b.order))
    if (data.prep_time) setPrepTime(data.prep_time.toString())
    if (data.servings) setServings(data.servings.toString())
    if (data.category) {
      const matched = localCategories.find(
        (c) => c.slug === data.category || c.name.toLowerCase() === data.category?.toLowerCase()
      )
      if (matched) {
        setCategoryId(matched.id)
        setSuggestedCategory(null)
      } else {
        // Claude suggested a category that doesn't exist yet — offer to create it
        const capitalized = data.category.charAt(0).toUpperCase() + data.category.slice(1).toLowerCase()
        setSuggestedCategory(capitalized)
      }
    }
    setSource("audio")
    setAudioPrefilled(true)
  }

  function slugify(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
  }

  async function handleCreateCategory(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    setCategoryError(null)
    setCreatingCategory(true)
    try {
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, slug: slugify(trimmed) }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? "Error al crear categoría")
      }
      const cat: Category = await res.json()
      setLocalCategories((prev) =>
        [...prev, cat].sort((a, b) => a.name.localeCompare(b.name, "es"))
      )
      setCategoryId(cat.id)
      setSuggestedCategory(null)
      setShowNewCategory(false)
      setNewCategoryName("")
    } catch (e: unknown) {
      setCategoryError(e instanceof Error ? e.message : "Error al crear categoría")
    } finally {
      setCreatingCategory(false)
    }
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
        audioUrl: audioUrl ?? null,
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
            {localCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* AI-suggested new category */}
          {suggestedCategory && (
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
              <span className="text-amber-700">
                IA sugiere: <strong>&ldquo;{suggestedCategory}&rdquo;</strong>
              </span>
              <button
                type="button"
                onClick={() => handleCreateCategory(suggestedCategory)}
                disabled={creatingCategory}
                className="rounded-md bg-amber-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {creatingCategory ? "Creando..." : "Crear y seleccionar"}
              </button>
              <button
                type="button"
                onClick={() => setSuggestedCategory(null)}
                className="text-amber-600 underline text-xs"
              >
                Ignorar
              </button>
            </div>
          )}

          {/* Inline new-category form */}
          {!showNewCategory ? (
            <button
              type="button"
              onClick={() => { setShowNewCategory(true); setSuggestedCategory(null) }}
              className="mt-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              + Nueva categoría
            </button>
          ) : (
            <div className="mt-2 flex gap-2">
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateCategory(newCategoryName))}
                placeholder="Nombre de la categoría"
                className="input flex-1"
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleCreateCategory(newCategoryName)}
                disabled={creatingCategory || !newCategoryName.trim()}
                className="btn-primary px-3 py-2 min-h-0 text-sm"
              >
                {creatingCategory ? "..." : "Crear"}
              </button>
              <button
                type="button"
                onClick={() => { setShowNewCategory(false); setNewCategoryName(""); setCategoryError(null) }}
                className="btn-secondary px-3 py-2 min-h-0 text-sm"
              >
                Cancelar
              </button>
            </div>
          )}
          {categoryError && <p className="mt-1 text-xs text-red-600">{categoryError}</p>}
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
