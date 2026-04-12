import { create } from "zustand"
import type { StructuredRecipe } from "@/types"

interface RecipeStore {
  pendingAudioData: StructuredRecipe | null
  setPendingAudioData: (data: StructuredRecipe | null) => void
  // undefined = not yet initialised (fall back to URL); null = "Todas"
  categoryFilter: string | null | undefined
  setCategoryFilter: (slug: string | null) => void
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  pendingAudioData: null,
  setPendingAudioData: (data) => set({ pendingAudioData: data }),
  categoryFilter: undefined,
  setCategoryFilter: (slug) => set({ categoryFilter: slug }),
}))
