export interface Ingredient {
  amount: string
  unit: string
  name: string
}

export interface Step {
  order: number
  instruction: string
}

export interface Category {
  id: string
  name: string
  slug: string
  createdAt: Date | null
}

export interface Recipe {
  id: string
  title: string
  description: string | null
  ingredients: Ingredient[]
  steps: Step[]
  categoryId: string | null
  prepTime: number | null
  servings: number | null
  source: string | null
  createdAt: Date | null
  updatedAt: Date | null
  category?: Category | null
}

export interface StructuredRecipe {
  title: string | null
  description: string | null
  ingredients: Ingredient[]
  steps: Step[]
  category: string | null
  prep_time: number | null
  servings: number | null
}
