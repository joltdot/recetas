import { create } from "zustand"
import type { StructuredRecipe } from "@/types"

interface RecipeStore {
  pendingAudioData: StructuredRecipe | null
  setPendingAudioData: (data: StructuredRecipe | null) => void
  categoryFilter: string | null
  setCategoryFilter: (slug: string | null) => void
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  pendingAudioData: null,
  setPendingAudioData: (data) => set({ pendingAudioData: data }),
  categoryFilter: null,
  setCategoryFilter: (slug) => set({ categoryFilter: slug }),
}))
