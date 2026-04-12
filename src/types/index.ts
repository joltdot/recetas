export interface Ingredient {
  amount: string
  unit: string
  name: string
  imageUrl?: string | null
}

export interface Step {
  order: number
  instruction: string
  imageUrl?: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  color?: string | null
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
  audioUrl: string | null
  images: string[] | null
  userId: string | null
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
