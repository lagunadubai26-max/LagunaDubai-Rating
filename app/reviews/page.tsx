import { prisma } from "@/lib/prisma";
import { ReviewForm } from "@/components/review-form";
import { RatingStars } from "@/components/rating-stars";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <header className="anim-rise py-10">
        <p className="text-sm font-medium uppercase tracking-widest text-laguna">
          رأيك يهمنا
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-laguna-deep sm:text-4xl">
          التقييمات
        </h1>
      </header>

      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_360px] md:items-start">
        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-ink-500">
            {reviews.length} تقييم
          </h2>

          {reviews.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-sand-200 bg-white p-10 text-center">
              <p className="text-ink-700">لسه مفيش تقييمات.</p>
              <p className="mt-1 text-sm text-ink-500">
                خليك أول واحد يشارك رأيه!
              </p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {reviews.map((review, index) => (
                <li
                  key={review.id}
                  className={`anim-rise lift flex flex-col rounded-2xl border border-sand-200 bg-white p-5 ${
                    index % 4 === 0
                      ? "stagger-1"
                      : index % 4 === 1
                        ? "stagger-2"
                        : index % 4 === 2
                          ? "stagger-3"
                          : "stagger-4"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-ink-900">
                      {review.reviewerName}
                    </p>
                    <time
                      className="text-xs text-ink-500"
                      dateTime={review.createdAt.toISOString()}
                    >
                      {new Intl.DateTimeFormat("ar-EG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(review.createdAt)}
                    </time>
                  </div>
                  <div className="mt-2">
                    <RatingStars rating={review.rating} size="sm" />
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-sm leading-relaxed text-ink-700">
                      {review.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="anim-rise stagger-2 rounded-3xl border border-sand-200 bg-sand-100/60 p-6 md:sticky md:top-20">
          <h2 className="font-display text-xl font-semibold text-laguna-deep">
            أضف تقييمك
          </h2>
          <p className="mt-1 mb-6 text-sm text-ink-500">
            خبّرنا عن تجربتك، رأيك يهمنا.
          </p>
          <ReviewForm />
        </aside>
      </div>
    </div>
  );
}