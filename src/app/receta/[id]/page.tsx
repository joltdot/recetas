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

      {/* Ingredients */}
      <section className="card">
        <h2 className="font-serif text-xl font-semibold mb-4 text-stone-800">Ingredientes</h2>
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
        <h2 className="font-serif text-xl font-semibold mb-4 text-stone-800">Preparación</h2>
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
