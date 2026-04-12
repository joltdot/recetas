export default function RecipeLoading() {
  return (
    <div>
      {/* Sticky back button skeleton */}
      <div className="sticky top-4 sm:top-[4.5rem] z-20 mb-4">
        <div className="inline-flex h-9 w-24 rounded-full bg-stone-200 animate-pulse" />
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-3 animate-pulse">
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-stone-200 rounded-full" />
          </div>
          <div className="h-8 bg-stone-200 rounded-lg w-3/4" />
          <div className="h-8 bg-stone-200 rounded-lg w-1/2" />
          <div className="h-4 bg-stone-200 rounded w-full" />
          <div className="h-4 bg-stone-200 rounded w-4/5" />
          <div className="flex gap-4 pt-1">
            <div className="h-4 bg-stone-200 rounded-full w-20" />
            <div className="h-4 bg-stone-200 rounded-full w-16" />
            <div className="h-4 bg-stone-200 rounded-full w-20" />
          </div>
        </div>

        {/* Ingredients */}
        <div className="card space-y-3 animate-pulse">
          <div className="h-6 bg-stone-200 rounded-lg w-32" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 bg-stone-100 rounded w-full" />
          ))}
        </div>

        {/* Steps */}
        <div className="card space-y-4 animate-pulse">
          <div className="h-6 bg-stone-200 rounded-lg w-32" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-stone-200 shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 bg-stone-100 rounded w-full" />
                <div className="h-4 bg-stone-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
