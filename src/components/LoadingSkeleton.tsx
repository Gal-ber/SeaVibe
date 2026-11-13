// מצב טעינה: צורות אפורות במקום הכרטיס, לא מסך ריק ולא אפסים.
export default function LoadingSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="mb-12 space-y-4 animate-pulse">
      <span className="sr-only">{label}</span>
      <div className="h-6 w-24 rounded-full bg-white/60" />
      <div className="h-10 w-48 rounded-2xl bg-white/70" />
      <div className="h-72 rounded-[3rem] bg-white/60" />
    </div>
  );
}
