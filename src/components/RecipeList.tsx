import RippleLink from "./RippleLink"
import RecipeCard from "./RecipeCard"
import type { Recipe } from "@/types"

interface RecipeListProps {
  recipes: Recipe[]
  activeCategory: string | null
}

export default function RecipeList({ recipes, activeCategory }: RecipeListProps) {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🍳</div>
        <h2 className="font-serif text-xl font-semibold text-stone-700 mb-2">
          {activeCategory ? "No hay recetas en esta categoría" : "Aún no tienes recetas"}
        </h2>
        <p className="text-stone-500 mb-6 max-w-xs">
          {activeCategory
            ? "Prueba seleccionando otra categoría o agrega una receta nueva."
            : "¡Agrega tu primera receta! Puedes escribirla o dictarla por voz."}
        </p>
        <RippleLink href="/receta/nueva" pageTransition transitionType="slide" rippleColor="bg-white/30" className="btn-primary">
          + Nueva Receta
        </RippleLink>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  )
}
