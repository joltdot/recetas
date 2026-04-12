export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import { db, schema } from "@/db"
import { eq, asc } from "drizzle-orm"
import RecipeForm from "@/components/RecipeForm"
import type { Recipe, Category } from "@/types"

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
      images: schema.recipes.images,
      createdAt: schema.recipes.createdAt,
      updatedAt: schema.recipes.updatedAt,
      category: {
        id: schema.categories.id,
        name: schema.categories.name,
        slug: schema.categories.slug,
        color: schema.categories.color,
        createdAt: schema.categories.createdAt,
      },
    })
    .from(schema.recipes)
    .leftJoin(schema.categories, eq(schema.recipes.categoryId, schema.categories.id))
    .where(eq(schema.recipes.id, id))
    .limit(1)

  return (rows[0] as Recipe) ?? null
}

async function getCategories(): Promise<Category[]> {
  return db.select().from(schema.categories).orderBy(asc(schema.categories.name)) as Promise<Category[]>
}

export default async function EditarRecetaPage({ params }: { params: { id: string } }) {
  const [recipe, categories] = await Promise.all([getRecipe(params.id), getCategories()])
  if (!recipe) notFound()

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/receta/${params.id}`} className="btn-ghost px-2 py-2" aria-label="Volver">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="font-serif text-2xl font-bold text-stone-900">Editar Receta</h1>
      </div>
      <RecipeForm categories={categories} initialData={recipe} />
    </div>
  )
}
