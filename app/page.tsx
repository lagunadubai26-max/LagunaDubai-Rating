import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RatingStars } from "@/components/rating-stars";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cafe = await prisma.cafe.findFirst({
    include: { reviews: true, _count: { select: { reviews: true } } },
  });

  if (!cafe) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-ink-700">رأيك يهمنا.</p>
      </div>
    );
  }

  const averageRating =
    cafe.reviews.length > 0
      ? cafe.reviews.reduce((sum, r) => sum + r.rating, 0) / cafe.reviews.length
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <section className="relative grid gap-10 overflow-hidden py-12 md:grid-cols-2 md:items-center md:py-16">
        <div className="relative z-10">
          <p className="anim-rise mb-3 inline-flex items-center gap-2 rounded-full border border-ember/40 bg-ember/10 px-4 py-1.5 text-sm font-medium text-ember">
            <span aria-hidden="true">✦</span> رأيك يهمنا
          </p>
          <h1 className="anim-rise stagger-1 font-display text-4xl font-semibold leading-tight text-laguna-deep sm:text-5xl">
            {cafe.name}
          </h1>
          <p className="anim-rise stagger-2 mt-4 max-w-xl text-lg leading-relaxed text-ink-700">
            {cafe.description}
          </p>
          <p className="anim-rise stagger-3 mt-6 flex items-center gap-2 text-ink-500">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
            {cafe.address}
          </p>
        </div>

        <div className="anim-rise stagger-2 relative mx-auto w-full max-w-sm">
          <div
            className="anim-ring absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-lagoon to-laguna-deep blur-2xl"
            aria-hidden="true"
          />
          <div className="anim-floaty relative overflow-hidden rounded-3xl border-4 border-white shadow-2xl shadow-laguna/20">
            {cafe.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cafe.coverImage}
                alt={`غلاف ${cafe.name}`}
                className="aspect-square w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/logo.jpg"
                alt={`شعار ${cafe.name}`}
                className="aspect-square w-full object-cover"
              />
            )}
            <svg
              className="absolute -bottom-px left-0 h-14 w-full text-sand-50"
              viewBox="0 0 1440 64"
              fill="currentColor"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 32c120 16 240 24 360 16s240-24 360-16 240 24 360 16 240-24 360-8-240-16-360-8-240 24-360 16-240-24-360-16Z" />
            </svg>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-6 rounded-3xl border border-sand-200 bg-white p-8 md:grid-cols-3">
        <div className="anim-rise stagger-1 md:col-span-1">
          <p className="text-sm font-medium uppercase tracking-widest text-ink-500">
            متوسط التقييم
          </p>
          <p className="mt-2 font-display text-5xl font-semibold text-laguna-deep">
            {averageRating === null ? "—" : averageRating.toFixed(1)}
          </p>
          <div className="mt-3">
            <RatingStars rating={averageRating} size="lg" />
          </div>
          <p className="mt-2 text-sm text-ink-500">
            من {cafe._count.reviews} تقييم
          </p>
        </div>

        <div className="anim-rise stagger-3 md:col-span-2 flex items-center">
          <Link
            href="/reviews"
            className="lift rounded-full bg-laguna px-6 py-3 font-medium text-white transition-colors hover:bg-laguna-deep"
          >
            شارك رأيك
          </Link>
        </div>
      </section>
    </div>
  );
}