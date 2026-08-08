type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export function RatingStars({
  rating,
  size = "md",
  label,
}: {
  rating: number | null;
  size?: Size;
  label?: string;
}) {
  const rounded = rating === null ? 0 : Math.round(rating);
  const readable = rating === null ? "غير متاح" : String(rating);
  return (
    <div className="flex items-center gap-1">
      <div
        className="flex gap-0.5"
        role="img"
        aria-label={label ?? `تقييم ${readable} من 5`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rounded ? "text-ember" : "text-sand-200"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.29 3.96a1 1 0 0 0 .95.69h4.18c.97 0 1.37 1.24.59 1.81l-3.39 2.46a1 1 0 0 0-.36 1.12l1.29 3.96c.3.92-.75 1.69-1.54 1.12l-3.38-2.46a1 1 0 0 0-1.18 0l-3.38 2.46c-.79.57-1.84-.2-1.54-1.12l1.29-3.96a1 1 0 0 0-.36-1.12L2.04 9.39c-.78-.57-.38-1.81.59-1.81h4.18a1 1 0 0 0 .95-.69l1.29-3.96Z" />
          </svg>
        ))}
      </div>
    </div>
  );
}