export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import { db, schema } from "@/db"
import { eq } from "drizzle-orm"
import { cn, formatTime, CATEGORY_COLORS } from "@/lib/utils"
import DeleteButton from "@/components/DeleteButton"
import type { Recipe } from "@/types"

async function getRecipe(id: string): Promise<Recipe | null> {
  const rows = await db
    .select({
      id: schema.recipes.id,
      title: schema.recipes.title,
      description: schema.recipes.description,
      ingredients: schema.recipes.ingredients,
      steps: schema.recipes.steps,
      categoryId: schema.recipes.categoryId,
      prepTime: schema.recipes.prepTime,
      servings: schema.recipes.servings,
      source: schema.recipes.source,
      audioUrl: schema.recipes.audioUrl,
      createdAt: schema.recipes.createdAt,
      updatedAt: schema.recipes.updatedAt,
      category: {
        id: schema.categories.id,
        name: schema.categories.name,
        slug: schema.categories.slug,
        createdAt: schema.categories.createdAt,
      },
    })
    .from(schema.recipes)
    .leftJoin(schema.categories, eq(schema.recipes.categoryId, schema.categories.id))
    .where(eq(schema.recipes.id, id))
    .limit(1)

  return rows[0] as Recipe | null
}

export default async function RecipePage({ params }: { params: { id: string } }) {
  const recipe = await getRecipe(params.id)
  if (!recipe) notFound()

  const categorySlug = recipe.category?.slug
  const categoryName = recipe.category?.name

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/" className="inline-flex items-center gap-1 text-stone-500 text-sm mb-4 hover:text-stone-700 transition-colors min-h-[44px]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver
        </Link>

        <div className="flex flex-wrap gap-2 mb-3">
          {categorySlug && (
            <span className={cn("badge", CATEGORY_COLORS[categorySlug] ?? "bg-stone-100 text-stone-600")}>
              {categoryName}
            </span>
          )}
          {recipe.source === "audio" && (
            <span className="badge bg-violet-100 text-violet-700">🎙 Creada con IA</span>
          )}
        </div>

        <h1 className="font-serif text-3xl font-bold text-stone-900 leading-tight mb-2">
          {recipe.title}
        </h1>

        {recipe.description && (
          <p className="text-stone-600 text-base leading-relaxed">{recipe.description}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-4 mt-4 text-stone-500 text-sm">
          {recipe.prepTime != null && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(recipe.prepTime)}
            </span>
          )}
          {recipe.servings != null && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              {recipe.servings} {recipe.servings === 1 ? "porción" : "porciones"}
            </span>
          )}
        </div>
      </div>

      {/* Audio recording */}
      {recipe.audioUrl && (
        <section className="card">
          <h2 className="font-serif text-xl font-semibold mb-3 text-stone-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5V18M7.5 9.75V18M11.25 6v12M15 3.75V18M18.75 8.25V18" />
            </svg>
            Grabación original
          </h2>
          <audio
            src={recipe.audioUrl}
            controls
            className="w-full rounded-lg"
            preload="metadata"
          />
        </section>
      )}

      {/* Ingredients */}
      <section className="card">
        <h2 className="font-serif text-xl font-semibold mb-4 text-stone-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.659 1.591L19.5 14.5M14.25 3.104c.251.023.501.05.75.082M19.5 14.5l-1.409 4.853A2.25 2.25 0 0115.926 21H8.074a2.25 2.25 0 01-2.165-1.647L4.5 14.5m15 0H4.5" />
          </svg>
          Ingredientes
        </h2>
        <ul className="space-y-2">
          {(recipe.ingredients as { amount: string; unit: string; name: string }[]).map((ing, i) => (
            <li key={i} className="flex items-start gap-3 py-1 border-b border-stone-100 last:border-0">
              <span className="text-amber-500 mt-0.5">•</span>
              <span className="text-stone-700">
                {ing.amount && <strong className="font-semibold">{ing.amount} </strong>}
                {ing.unit && <span className="text-stone-500">{ing.unit} </span>}
                {ing.name}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section className="card">
        <h2 className="font-serif text-xl font-semibold mb-4 text-stone-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
          </svg>
          Preparación
        </h2>
        <ol className="space-y-4">
          {(recipe.steps as { order: number; instruction: string }[])
            .sort((a, b) => a.order - b.order)
            .map((step) => (
              <li key={step.order} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                  {step.order}
                </span>
                <p className="text-stone-700 leading-relaxed pt-1">{step.instruction}</p>
              </li>
            ))}
        </ol>
      </section>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Link href={`/receta/${recipe.id}/editar`} className="btn-secondary flex-1 text-center">
          Editar receta
        </Link>
        <DeleteButton recipeId={recipe.id} />
      </div>
    </div>
  )
}
