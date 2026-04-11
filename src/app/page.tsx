export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { db, schema } from "@/db"
import { asc, desc, eq } from "drizzle-orm"
import CategoryFilter from "@/components/CategoryFilter"
import RecipeList from "@/components/RecipeList"
import type { Recipe, Category } from "@/types"

interface HomeProps {
  searchParams: { categoria?: string }
}

async function getRecipes(categoriaSlug?: string): Promise<Recipe[]> {
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
    .orderBy(desc(schema.recipes.createdAt))

  if (categoriaSlug) {
    return rows.filter((r) => r.category?.slug === categoriaSlug) as Recipe[]
  }
  return rows as Recipe[]
}

async function getCategories(): Promise<Category[]> {
  return db.select().from(schema.categories).orderBy(asc(schema.categories.name)) as Promise<Category[]>
}

export default async function HomePage({ searchParams }: HomeProps) {
  const [recipes, categories] = await Promise.all([
    getRecipes(searchParams.categoria),
    getCategories(),
  ])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          {searchParams.categoria
            ? categories.find((c) => c.slug === searchParams.categoria)?.name ?? "Recetas"
            : "Mis Recetas"}
        </h1>
        <span className="text-sm text-stone-400">{recipes.length} {recipes.length === 1 ? "receta" : "recetas"}</span>
      </div>

      <Suspense>
        <CategoryFilter categories={categories} />
      </Suspense>

      <RecipeList recipes={recipes} activeCategory={searchParams.categoria ?? null} />
    </div>
  )
}
