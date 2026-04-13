"use client"

import { useState, useRef, useEffect } from "react"
import { flushSync } from "react-dom"
import { useRouter } from "next/navigation"
import IngredientEditor from "./IngredientEditor"
import StepEditor from "./StepEditor"
import AudioRecorder from "./AudioRecorder"
import ImageUploader from "./ImageUploader"
import { COLOR_OPTIONS, getCategoryStyle } from "@/lib/utils"
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
  const [newCategoryColor, setNewCategoryColor] = useState("stone")
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [categoryError, setCategoryError] = useState<string | null>(null)

  const [images, setImages] = useState<string[]>((initialData?.images as string[]) ?? [])
  const [audioUrl, setAudioUrl] = useState<string | null>(initialData?.audioUrl ?? null)
  const [transcript, setTranscript] = useState<string>(initialData?.transcript ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioPrefilled, setAudioPrefilled] = useState(false)
  const errorRef = useRef<HTMLDivElement>(null)

  // Slider for category pills
  const catContainerRef = useRef<HTMLDivElement>(null)
  const catSliderRef = useRef<HTMLDivElement>(null)
  const catPillRefs = useRef<Map<string, HTMLElement>>(new Map())

  // visualCategoryId follows categoryId only after the slider finishes travelling
  const [visualCategoryId, setVisualCategoryId] = useState(categoryId)
  const categoryIdRef = useRef(categoryId)
  categoryIdRef.current = categoryId

  useEffect(() => {
    const container = catContainerRef.current
    const slider = catSliderRef.current
    const pill = catPillRefs.current.get(categoryId || "__none__")
    if (!container || !slider || !pill) return
    const cr = container.getBoundingClientRect()
    const pr = pill.getBoundingClientRect()
    slider.style.width = `${pr.width}px`
    slider.style.height = `${pr.height}px`
    slider.style.left = `${pr.left - cr.left + container.scrollLeft}px`
    slider.style.top = `${pr.top - cr.top}px`
  }, [categoryId, localCategories])

  useEffect(() => {
    const slider = catSliderRef.current
    if (!slider) return
    const handle = (e: TransitionEvent) => {
      if (e.propertyName === "left") flushSync(() => setVisualCategoryId(categoryIdRef.current))
    }
    slider.addEventListener("transitionend", handle)
    return () => slider.removeEventListener("transitionend", handle)
  }, [])


  function handleAudioResult(data: StructuredRecipe, url: string | null, text: string) {
    setAudioUrl(url)
    setTranscript(text)
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

  async function handleUpdateCategoryColor(catId: string, color: string) {
    // Optimistic update
    setLocalCategories((prev) => prev.map((c) => (c.id === catId ? { ...c, color } : c)))
    try {
      await fetch(`/api/categorias/${catId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color }),
      })
    } catch {
      // non-critical — color will revert on next page load
    }
  }

  async function handleCreateCategory(name: string, color: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    setCategoryError(null)
    setCreatingCategory(true)
    try {
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, slug: slugify(trimmed), color }),
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
      setNewCategoryColor("stone")
    } catch (e: unknown) {
      setCategoryError(e instanceof Error ? e.message : "Error al crear categoría")
    } finally {
      setCreatingCategory(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    function showError(msg: string) {
      setError(msg)
      // Wait for React to render the error element, then scroll it into view
      requestAnimationFrame(() => {
        errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      })
    }

    if (!title.trim()) {
      showError("El nombre de la receta es obligatorio.")
      return
    }
    const validIngredients = ingredients.filter((i) => i.name.trim())
    if (validIngredients.length === 0) {
      showError("Agrega al menos un ingrediente.")
      return
    }
    const validSteps = steps.filter((s) => s.instruction.trim())
    if (validSteps.length === 0) {
      showError("Agrega al menos un paso de preparación.")
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
        transcript: transcript || null,
        images,
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
      showError(e instanceof Error ? e.message : "Error al guardar la receta")
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

      {/* Recipe images */}
      <section className="card space-y-3">
        <h2 className="font-serif text-lg font-semibold text-stone-800">Fotos de la receta</h2>
        <div className="grid grid-cols-2 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative aspect-video rounded-xl overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Foto ${i + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity"
                aria-label="Eliminar foto"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <ImageUploader
            value={null}
            onChange={(url) => { if (url) setImages((prev) => [...prev, url]) }}
            label="Agregar foto"
            aspect="video"
          />
        </div>
      </section>

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
          <label className="label">Categoría</label>

          {/* Visual pill picker — single scrollable row with slider */}
          <div
            ref={catContainerRef}
            className="relative flex overflow-x-auto gap-2 -mx-4 px-4 scrollbar-hide overscroll-x-contain pb-1 mb-1"
          >
            <div
              ref={catSliderRef}
              className="absolute rounded-full bg-amber-500 pointer-events-none transition-[left,width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              aria-hidden
            />
            <button
              type="button"
              ref={(el) => { if (el) catPillRefs.current.set("__none__", el) }}
              onClick={() => setCategoryId("")}
              className="badge relative shrink-0 py-2 px-3 cursor-pointer"
              style={{ color: !visualCategoryId ? "#fff" : "#78716c", transition: "color 150ms ease" }}
            >
              Sin categoría
            </button>
            {localCategories.map((cat) => (
              <button
                type="button"
                key={cat.id}
                ref={(el) => { if (el) catPillRefs.current.set(cat.id, el) }}
                onClick={() => setCategoryId(cat.id)}
                className="badge relative shrink-0 py-2 px-3 cursor-pointer"
                style={{ color: visualCategoryId === cat.id ? "#fff" : getCategoryStyle(cat.color).color, transition: "color 150ms ease" }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Color picker for the selected category */}
          {categoryId && (
            <div className="flex items-center gap-2 mb-2 pl-1">
              <span className="text-xs text-stone-400 shrink-0">Color:</span>
              <div className="flex overflow-x-auto gap-2 scrollbar-hide py-1">
                {COLOR_OPTIONS.map((opt) => {
                  const isSelected = localCategories.find((c) => c.id === categoryId)?.color === opt.key
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleUpdateCategoryColor(categoryId, opt.key)}
                      title={opt.key}
                      className={`shrink-0 w-6 h-6 rounded-full transition-transform ${isSelected ? "ring-2 ring-offset-1 ring-stone-500 scale-110" : "hover:scale-110"}`}
                      style={{ backgroundColor: opt.dot }}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* AI-suggested new category */}
          {suggestedCategory && (
            <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
              <span className="text-amber-700">
                IA sugiere: <strong>&ldquo;{suggestedCategory}&rdquo;</strong>
              </span>
              <button
                type="button"
                onClick={() => handleCreateCategory(suggestedCategory, "stone")}
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
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              + Nueva categoría
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateCategory(newCategoryName, newCategoryColor))}
                  placeholder="Nombre de la categoría"
                  className="input flex-1"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleCreateCategory(newCategoryName, newCategoryColor)}
                  disabled={creatingCategory || !newCategoryName.trim()}
                  className="btn-primary px-3 py-2 min-h-0 text-sm"
                >
                  {creatingCategory ? "..." : "Crear"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewCategory(false); setNewCategoryName(""); setNewCategoryColor("stone"); setCategoryError(null) }}
                  className="btn-secondary px-3 py-2 min-h-0 text-sm"
                >
                  Cancelar
                </button>
              </div>
              {/* Color picker for new category */}
              <div className="flex items-center gap-2 pl-1">
                <span className="text-xs text-stone-400 shrink-0">Color:</span>
                <div className="flex overflow-x-auto gap-2 scrollbar-hide py-1">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setNewCategoryColor(opt.key)}
                      title={opt.key}
                      className={`shrink-0 w-6 h-6 rounded-full transition-transform ${newCategoryColor === opt.key ? "ring-2 ring-offset-1 ring-stone-500 scale-110" : "hover:scale-110"}`}
                      style={{ backgroundColor: opt.dot }}
                    />
                  ))}
                </div>
              </div>
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
        <div ref={errorRef} className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions — sticky on mobile so save is always reachable on long forms.
          Positioned above the bottom nav bar using pb-safe + bottom offset. */}
      <div className="flex gap-3 pt-2 sm:pt-2 sticky bottom-[calc(65px+max(env(safe-area-inset-bottom,0px),1rem))] sm:static bg-stone-50 sm:bg-transparent py-3 sm:py-0 -mx-4 px-4 sm:mx-0 sm:px-0 border-t border-stone-200 sm:border-0 z-10">
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
