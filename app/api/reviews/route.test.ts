import { describe, expect, it, beforeEach, vi } from "vitest";
import { POST, GET } from "@/app/api/reviews/route";
import { resetRateLimits } from "@/lib/rate-limit";

const { mockedPrisma } = vi.hoisted(() => ({
  mockedPrisma: {
    cafe: { findFirst: vi.fn() },
    review: { findMany: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockedPrisma }));

function post(body: unknown, xForwardedFor = "1.2.3.4", origin = "http://localhost") {
  return POST(
    new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": xForwardedFor,
        origin,
      },
      body: JSON.stringify(body),
    }),
  );
}

function postInvalidOrigin(body: unknown, xForwardedFor = "1.2.3.4") {
  return post(body, xForwardedFor, "http://evil.example.com");
}

describe("reviews API", () => {
  beforeEach(() => {
    mockedPrisma.cafe.findFirst.mockReset();
    mockedPrisma.review.create.mockReset();
    mockedPrisma.review.findMany.mockReset();
    resetRateLimits();
  });

  it("rejects a missing reviewerName", async () => {
    const res = await post({ rating: 4, comment: "تعليق طويل كفاية" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("الاسم مطلوب.");
  });

  it("rejects a reviewerName shorter than 2 chars", async () => {
    const res = await post({ reviewerName: "ا", rating: 4, comment: "تعليق طويل كفاية" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("الاسم لازم يكون حرفين على الأقل.");
  });

  it("rejects a rating outside 1-5", async () => {
    const res = await post({ reviewerName: "عمر", rating: 9, comment: "تعليق طويل كفاية" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("التقييم لازم يكون من 1 لـ 5.");
  });

  it("rejects a comment shorter than 5 chars", async () => {
    const res = await post({ reviewerName: "عمر", rating: 4, comment: "تمام" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("التعليق لازم يكون 5 حروف على الأقل.");
  });

  it("rejects invalid JSON", async () => {
    const res = await POST(
      new Request("http://localhost/api/reviews", {
        method: "POST",
        body: "not-json",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects a cross-origin request", async () => {
    const res = await postInvalidOrigin({
      reviewerName: "عمر",
      rating: 4,
      comment: "قهوة لذيذة جدًا",
    });
    expect(res.status).toBe(400);
    expect(mockedPrisma.review.create).not.toHaveBeenCalled();
  });

  it("rejects a request that fills the honeypot field", async () => {
    mockedPrisma.cafe.findFirst.mockResolvedValue({ id: "c1" });
    const res = await post({
      reviewerName: "عمر",
      rating: 4,
      comment: "قهوة لذيذة جدًا",
      company: "spam-bot-inc",
    });
    expect(res.status).toBe(400);
    expect(mockedPrisma.review.create).not.toHaveBeenCalled();
  });

  it("creates a review attached to the first cafe", async () => {
    mockedPrisma.cafe.findFirst.mockResolvedValue({
      id: "c1",
      name: "Laguna Dubai",
    });
    mockedPrisma.review.create.mockResolvedValue({
      id: "r1",
      cafeId: "c1",
      reviewerName: "عمر",
      rating: 5,
      comment: "قهوة لذيذة جدًا",
    });

    const res = await post({
      reviewerName: "عمر",
      rating: 5,
      comment: "قهوة لذيذة جدًا",
    });

    expect(res.status).toBe(201);
    expect(mockedPrisma.review.create).toHaveBeenCalledWith({
      data: {
        cafeId: "c1",
        reviewerName: "عمر",
        rating: 5,
        comment: "قهوة لذيذة جدًا",
      },
    });
  });

  it("returns 400 when no cafe is registered", async () => {
    mockedPrisma.cafe.findFirst.mockResolvedValue(null);
    const res = await post({
      reviewerName: "عمر",
      rating: 4,
      comment: "قهوة لذيذة جدًا",
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("مفيش كافيه متسجل لسه.");
  });

  it("blocks a 6th request from the same IP within a minute", async () => {
    mockedPrisma.cafe.findFirst.mockResolvedValue({ id: "c1" });
    mockedPrisma.review.create.mockResolvedValue({ id: "r1" });
    for (let i = 0; i < 5; i++) {
      const res = await post({
        reviewerName: "عمر",
        rating: 4,
        comment: "قهوة لذيذة جدًا",
      });
      expect(res.status).toBe(201);
    }
    const blocked = await post({
      reviewerName: "عمر",
      rating: 4,
      comment: "قهوة لذيذة جدًا",
    });
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBeTruthy();
  });

  it("allows a different IP even after the first is blocked", async () => {
    mockedPrisma.cafe.findFirst.mockResolvedValue({ id: "c1" });
    mockedPrisma.review.create.mockResolvedValue({ id: "r1" });
    for (let i = 0; i < 5; i++) {
      await post(
        { reviewerName: "عمر", rating: 4, comment: "قهوة لذيذة جدًا" },
        "1.2.3.4",
      );
    }
    const res = await post(
      { reviewerName: "سارة", rating: 5, comment: "قهوة لذيذة جدًا" },
      "5.6.7.8",
    );
    expect(res.status).toBe(201);
  });

  it("GET returns all reviews newest first", async () => {
    mockedPrisma.review.findMany.mockResolvedValue([
      { id: "r1", reviewerName: "سارة", rating: 5 },
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reviews).toHaveLength(1);
    expect(mockedPrisma.review.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
    });
  });
});