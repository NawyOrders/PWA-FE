export function ProductCardSkeleton() {
  return (
    <div className="flex items-stretch gap-3 rounded-card bg-surface p-3 shadow-card lg:flex-col lg:gap-0 lg:overflow-hidden lg:p-0">
      <div className="flex flex-1 flex-col gap-2 py-1 lg:p-4 lg:pt-4">
        <div className="skeleton h-4 w-3/4 rounded-full" />
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 lg:pt-4">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="flex items-center gap-2">
            <div className="skeleton h-11 w-11 rounded-full" />
            <div className="skeleton h-11 w-11 rounded-full" />
          </div>
        </div>
      </div>
      <div className="skeleton aspect-square w-[40%] shrink-0 rounded-image lg:order-first lg:aspect-[4/3] lg:w-full lg:rounded-none" />
    </div>
  );
}
