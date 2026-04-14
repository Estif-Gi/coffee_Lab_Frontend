function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-beige/60 bg-white/70 p-5 shadow-lg">
      <div className="mb-4 h-4 w-2/3 rounded bg-beige/90"></div>
      <div className="mb-3 h-3 w-1/3 rounded bg-beige/70"></div>
      <div className="h-3 w-full rounded bg-beige/70"></div>
      <div className="mt-2 h-3 w-5/6 rounded bg-beige/60"></div>
    </div>
  )
}

export default SkeletonCard
