export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { db, schema } from "@/db"
import { asc, desc, eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

import { UtensilsCrossed } from "lucide-react"
import CategoryFilter from "@/components/CategoryFilter"
import RecipeGrid from "@/components/RecipeGrid"
import SignOutButton from "@/components/SignOutButton"
import type { Recipe, Category } from "@/types"

async function getRecipes(email: string): Promise<Recipe[]> {
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
      userId: schema.recipes.userId,
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
    .where(eq(schema.recipes.userId, email))
    .orderBy(desc(schema.recipes.createdAt))

  return rows as Recipe[]
}

async function getCategories(): Promise<Category[]> {
  return db.select().from(schema.categories).orderBy(asc(schema.categories.name)) as Promise<Category[]>
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email ?? ""
  const admin = !!email && !!process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
  const [recipes, categories] = await Promise.all([getRecipes(email), getCategories()])

  return (
    <div className="space-y-5">
      {/* Mobile: icon + title + profile in one row */}
      <div className="flex items-center gap-3 sm:hidden">
        <UtensilsCrossed size={26} strokeWidth={1.8} className="text-amber-600 shrink-0" />
        <h1 className="font-serif text-3xl font-bold text-stone-900 flex-1">Recetas</h1>
        {session?.user && (
          <SignOutButton
            name={session.user.name ?? undefined}
            image={session.user.image ?? undefined}
            compact
            isAdmin={admin}
          />
        )}
      </div>
      {/* Desktop: just the title */}
      <h1 className="hidden sm:block font-serif text-2xl font-bold text-stone-900">Recetas</h1>

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
