export const dynamic = "force-dynamic"

import Link from "next/link"
import { db, schema } from "@/db"
import { asc } from "drizzle-orm"
import RecipeForm from "@/components/RecipeForm"
import type { Category } from "@/types"

async function getCategories(): Promise<Category[]> {
  return db.select().from(schema.categories).orderBy(asc(schema.categories.name)) as Promise<Category[]>
}

export default async function NuevaRecetaPage() {
  const categories = await getCategories()

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="btn-ghost px-2 py-2" aria-label="Volver">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="font-serif text-2xl font-bold text-stone-900">Nueva Receta</h1>
      </div>
      <RecipeForm categories={categories} />
    </div>
  )
}
