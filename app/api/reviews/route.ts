import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const reviewSchema = z.object({
  reviewerName: z
    .string({ error: "الاسم مطلوب." })
    .trim()
    .min(2, "الاسم لازم يكون حرفين على الأقل.")
    .max(50, "الاسم طويل أوي."),
  rating: z.coerce
    .number({ error: "التقييم لازم يكون رقمًا." })
    .int({ error: "التقييم لازم يكون رقمًا صحيحًا." })
    .min(1, "التقييم لازم يكون من 1 لـ 5.")
    .max(5, "التقييم لازم يكون من 1 لـ 5."),
  comment: z
    .string({ error: "التعليق لازم يكون نصًا." })
    .trim()
    .min(5, "التعليق لازم يكون 5 حروف على الأقل.")
    .max(500, "التعليق طويل جدًا."),
});

function containsHoneypot(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false;
  const value = (body as Record<string, unknown>).company;
  return typeof value === "string" && value.trim().length > 0;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return (request.headers.get("x-real-ip") ?? "unknown").trim();
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function errorResponse(message: string, status: number, extraHeaders?: HeadersInit) {
  return NextResponse.json({ error: message }, { status, headers: extraHeaders });
}

export async function GET() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return errorResponse(
      "كتير أوي، استنى شوية قبل ما تضيف تقييم جديد.",
      429,
      { "Retry-After": String(limit.retryAfter) },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("بيانات مش صالحة.", 400);
  }

  if (containsHoneypot(body)) {
    return errorResponse("بيانات مش صالحة.", 400);
  }

  if (!isSameOrigin(request)) {
    return errorResponse("بيانات مش صالحة.", 400);
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "بيانات مش صالحة.";
    return errorResponse(message, 400);
  }

  const cafe = await prisma.cafe.findFirst();
  if (!cafe) {
    return errorResponse("مفيش كافيه متسجل لسه.", 400);
  }

  const review = await prisma.review.create({
    data: {
      cafeId: cafe.id,
      reviewerName: parsed.data.reviewerName,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}