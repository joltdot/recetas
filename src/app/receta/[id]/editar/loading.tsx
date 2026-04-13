export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse pt-safe sm:pt-0">
      {/* Back button placeholder */}
      <div className="w-24 h-9 bg-stone-200 rounded-full" />

      {/* Title */}
      <div className="h-8 w-40 bg-stone-200 rounded-lg" />

      {/* Main image */}
      <div className="w-full aspect-video bg-stone-200 rounded-xl" />

      {/* Title field */}
      <div className="space-y-1.5">
        <div className="h-4 w-20 bg-stone-200 rounded" />
        <div className="h-12 bg-stone-200 rounded-xl" />
      </div>

      {/* Description field */}
      <div className="space-y-1.5">
        <div className="h-4 w-28 bg-stone-200 rounded" />
        <div className="h-20 bg-stone-200 rounded-xl" />
      </div>

      {/* Two column fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="h-4 w-20 bg-stone-200 rounded" />
          <div className="h-12 bg-stone-200 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <div className="h-4 w-20 bg-stone-200 rounded" />
          <div className="h-12 bg-stone-200 rounded-xl" />
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-2">
        <div className="h-4 w-24 bg-stone-200 rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-xl" />
        ))}
      </div>

      {/* Steps */}
      <div className="space-y-2">
        <div className="h-4 w-16 bg-stone-200 rounded" />
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded-xl" />
        ))}
      </div>

      {/* Save button */}
      <div className="h-12 bg-stone-200 rounded-xl" />
    </div>
  )
}
