// src/components/Skeletons.jsx
export function CalendarSkeleton() {
  return (
    <div className="cal" role="status">
      <span className="sr-only">Loading days</span>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="skeleton skeleton-day" aria-hidden="true" />
      ))}
    </div>
  );
}

export function SheetSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading times</span>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="skeleton skeleton-row" aria-hidden="true" />
      ))}
    </div>
  );
}