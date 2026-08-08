"use client";

import { useState } from "react";

type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function RatingPicker({
  name,
  defaultValue = 5,
  size = "md",
  label = "التقييم بالنجوم",
}: {
  name: string;
  defaultValue?: number;
  size?: Size;
  label?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState(0);

  const active = hover || value;

  return (
    <div>
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label={label}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} من 5`}
            onClick={() => setValue(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="rounded-full p-0.5 transition-colors"
          >
            <svg
              className={`${sizeClasses[size]} ${
                n <= active ? "text-ember" : "text-sand-200"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.29 3.96a1 1 0 0 0 .95.69h4.18c.97 0 1.37 1.24.59 1.81l-3.39 2.46a1 1 0 0 0-.36 1.12l1.29 3.96c.3.92-.75 1.69-1.54 1.12l-3.38-2.46a1 1 0 0 0-1.18 0l-3.38 2.46c-.79.57-1.84-.2-1.54-1.12l1.29-3.96a1 1 0 0 0-.36-1.12L2.04 9.39c-.78-.57-.38-1.81.59-1.81h4.18a1 1 0 0 0 .95-.69l1.29-3.96Z" />
            </svg>
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={value} />
      <p className="mt-1 text-sm text-ink-500" aria-live="polite">
        قيمتك: {value} من 5
      </p>
    </div>
  );
}