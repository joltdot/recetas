export default function HomeLoading() {
  return (
    <div className="space-y-5">
      <div className="h-9 w-28 bg-stone-200 rounded-xl animate-pulse" />
      <div className="columns-1 sm:columns-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="break-inside-avoid mb-4">
            <div className="card space-y-3 animate-pulse">
              <div className="h-3 bg-stone-200 rounded-full w-16" />
              <div className="space-y-2">
                <div className="h-5 bg-stone-200 rounded-lg w-4/5" />
                <div className="h-5 bg-stone-200 rounded-lg w-2/3" />
              </div>
              <div className="h-3 bg-stone-200 rounded-full w-full" />
              <div className="h-3 bg-stone-200 rounded-full w-3/4" />
              <div className="flex gap-4 pt-1">
                <div className="h-3 bg-stone-200 rounded-full w-16" />
                <div className="h-3 bg-stone-200 rounded-full w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
