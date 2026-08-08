import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ReviewsPage from "@/app/reviews/page";

const { mockedPrisma } = vi.hoisted(() => ({
  mockedPrisma: {
    cafe: { findFirst: vi.fn() },
    review: { findMany: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockedPrisma }));

describe("ReviewsPage", () => {
  beforeEach(() => {
    mockedPrisma.review.findMany.mockReset();
  });

  it("lists reviews newest first with reviewer, stars, comment and date", async () => {
    mockedPrisma.review.findMany.mockResolvedValue([
      {
        id: "r1",
        cafeId: "c1",
        reviewerName: "سارة",
        rating: 5,
        comment: "قهوة ممتازة",
        createdAt: new Date("2026-08-01"),
      },
      {
        id: "r2",
        cafeId: "c1",
        reviewerName: "أحمد",
        rating: 3,
        comment: null,
        createdAt: new Date("2026-07-20"),
      },
    ]);

    render(await ReviewsPage());

    expect(screen.getByText("سارة")).toBeInTheDocument();
    expect(screen.getByText("أحمد")).toBeInTheDocument();
    expect(screen.getByText("قهوة ممتازة")).toBeInTheDocument();
    expect(screen.getByText("2 تقييم")).toBeInTheDocument();
  });

  it("shows the review form and an empty state when there are no reviews", async () => {
    mockedPrisma.review.findMany.mockResolvedValue([]);
    render(await ReviewsPage());

    expect(screen.getByText("أضف تقييمك")).toBeInTheDocument();
    expect(screen.getByLabelText("اسمك")).toBeInTheDocument();
    expect(screen.getByText("لسه مفيش تقييمات.")).toBeInTheDocument();
  });
});