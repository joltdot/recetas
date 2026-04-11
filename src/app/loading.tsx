export default function Loading() {
  return (
    <div className="space-y-5">
      {/* Title skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-stone-200 rounded-xl animate-pulse" />
        <div className="h-5 w-16 bg-stone-100 rounded-lg animate-pulse" />
      </div>

      {/* Category filter skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {[80, 72, 88, 64, 96].map((w, i) => (
          <div
            key={i}
            className="h-9 rounded-full bg-stone-200 animate-pulse shrink-0"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Recipe cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card space-y-3">
            <div className="h-5 w-20 bg-stone-100 rounded-full animate-pulse" />
            <div className="h-6 w-3/4 bg-stone-200 rounded-lg animate-pulse" />
            <div className="h-4 w-full bg-stone-100 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-stone-100 rounded animate-pulse" />
            <div className="flex gap-4 pt-1">
              <div className="h-4 w-16 bg-stone-100 rounded animate-pulse" />
              <div className="h-4 w-20 bg-stone-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
