"use client";

import { useState } from "react";
import { RatingPicker } from "@/components/rating-picker";

export function ReviewForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const review = {
      reviewerName: String(formData.get("reviewerName") ?? "").trim(),
      rating: Number(formData.get("rating")),
      comment: String(formData.get("comment") ?? "").trim(),
      company: String(formData.get("company") ?? "").trim(),
    };

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setStatus("error");
      setError(body?.error ?? "حصلت مشكلة، جرّب تاني.");
      return;
    }

    setStatus("done");
    form.reset();
  }

  if (status === "done") {
    return (
      <div className="rounded-3xl border border-lagoon bg-sand-100 p-8 text-center">
        <p className="font-display text-xl text-laguna-deep">
          مرسي عالمشاركة! تقييمك اتحفظ.
        </p>
        <p className="mt-2 text-sm text-ink-700">
          انعش الصفحة عشان تشوفه في القائمة.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">متسبش الحقل ده فارغ</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label
          htmlFor="reviewerName"
          className="mb-1.5 block text-sm font-medium text-ink-700"
        >
          اسمك
        </label>
        <input
          id="reviewerName"
          name="reviewerName"
          type="text"
          required
          placeholder="مثلاً: أحمد"
          className="w-full rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-ink-900 placeholder:text-ink-300 focus:border-laguna focus:outline-none"
        />
      </div>

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-ink-700">
          تقييمك بالنجوم (1–5)
        </legend>
        <RatingPicker name="rating" />
      </fieldset>

      <div>
        <label
          htmlFor="comment"
          className="mb-1.5 block text-sm font-medium text-ink-700"
        >
          تعليقك
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          placeholder="إيه رأيك في القهوة والجو؟"
          className="w-full rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-ink-900 placeholder:text-ink-300 focus:border-laguna focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-laguna px-6 py-3 font-medium text-white transition-colors hover:bg-laguna-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "بيتبعت..." : "أضف التقييم"}
      </button>
    </form>
  );
}