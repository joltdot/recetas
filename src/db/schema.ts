import { pgTable, uuid, text, jsonb, integer, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
})

export const recipes = pgTable("recipes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  ingredients: jsonb("ingredients").notNull().$type<{ amount: string; unit: string; name: string }[]>(),
  steps: jsonb("steps").notNull().$type<{ order: number; instruction: string }[]>(),
  categoryId: uuid("category_id").references(() => categories.id),
  prepTime: integer("prep_time"),
  servings: integer("servings"),
  source: text("source"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
})

export type CategoryRow = typeof categories.$inferSelect
export type RecipeRow = typeof recipes.$inferSelect
export type NewRecipe = typeof recipes.$inferInsert
export type NewCategory = typeof categories.$inferInsert
