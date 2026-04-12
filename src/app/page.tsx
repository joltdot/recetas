export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { db, schema } from "@/db"
import { asc, desc, eq } from "drizzle-orm"
import CategoryFilter from "@/components/CategoryFilter"
import RecipeGrid from "@/components/RecipeGrid"
import type { Recipe, Category } from "@/types"

interface HomeProps {
  searchParams: { categoria?: string }
}

async function getRecipes(): Promise<Recipe[]> {
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
        createdAt: schema.categories.createdAt,
      },
    })
    .from(schema.recipes)
    .leftJoin(schema.categories, eq(schema.recipes.categoryId, schema.categories.id))
    .orderBy(desc(schema.recipes.createdAt))

  return rows as Recipe[]
}

async function getCategories(): Promise<Category[]> {
  return db.select().from(schema.categories).orderBy(asc(schema.categories.name)) as Promise<Category[]>
}

export default async function HomePage({ searchParams }: HomeProps) {
  const [recipes, categories] = await Promise.all([getRecipes(), getCategories()])

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-2xl font-bold text-stone-900">Mis Recetas</h1>

      {/* Desktop: inline */}
      <div className="hidden sm:block">
        <Suspense>
          <CategoryFilter categories={categories} />
        </Suspense>
      </div>

      {/* Extra bottom padding on mobile so grid clears the fixed category bar */}
      <div className="pb-16 sm:pb-0">
        <Suspense>
          <RecipeGrid allRecipes={recipes} />
        </Suspense>
      </div>

      {/* Mobile: fixed above the bottom nav bar.
          Outer div fills bottom-0 so there's no gap behind the nav bar.
          Inner div uses only inline styles for centering to avoid Tailwind conflicts. */}
      <div
        className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur-sm"
        style={{ paddingBottom: "calc(65px + max(env(safe-area-inset-bottom, 0px), 1rem))" }}
      >
        <div
          className="border-t border-stone-200 px-4"
          style={{ display: "flex", alignItems: "center", minHeight: "52px" }}
        >
          <div style={{ width: "100%" }}>
            <Suspense>
              <CategoryFilter categories={categories} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
