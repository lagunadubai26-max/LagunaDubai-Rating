import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

const { mockedPrisma } = vi.hoisted(() => ({
  mockedPrisma: {
    cafe: { findFirst: vi.fn() },
    review: { findMany: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockedPrisma }));

describe("HomePage", () => {
  beforeEach(() => {
    mockedPrisma.cafe.findFirst.mockReset();
    mockedPrisma.review.findMany.mockReset();
    mockedPrisma.review.create.mockReset();
  });

  it("shows the cafe name, description and address", async () => {
    mockedPrisma.cafe.findFirst.mockResolvedValue({
      id: "c1",
      name: "Laguna Dubai",
      description: "قهوة مختصة على الشط.",
      address: "الجميرا، دبي",
      coverImage: null,
      createdAt: new Date(),
      reviews: [],
      _count: { reviews: 0 },
    });

    render(await HomePage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Laguna Dubai" }),
    ).toBeInTheDocument();
    expect(screen.getByText("قهوة مختصة على الشط.")).toBeInTheDocument();
    expect(screen.getByText("الجميرا، دبي")).toBeInTheDocument();
  });

  it("shows the average rating rounded to one decimal", async () => {
    mockedPrisma.cafe.findFirst.mockResolvedValue({
      id: "c1",
      name: "Laguna Dubai",
      description: null,
      address: null,
      coverImage: null,
      createdAt: new Date(),
      reviews: [
        { id: "r1", rating: 5 },
        { id: "r2", rating: 4 },
      ],
      _count: { reviews: 2 },
    });

    render(await HomePage());

    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("من 2 تقييم")).toBeInTheDocument();
  });

  it("shows a placeholder when there are no reviews", async () => {
    mockedPrisma.cafe.findFirst.mockResolvedValue({
      id: "c1",
      name: "Laguna Dubai",
      description: null,
      address: null,
      coverImage: null,
      createdAt: new Date(),
      reviews: [],
      _count: { reviews: 0 },
    });

    render(await HomePage());

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows an empty state when no cafe exists", async () => {
    mockedPrisma.cafe.findFirst.mockResolvedValue(null);
    render(await HomePage());
    expect(
      screen.getByText("رأيك يهمنا."),
    ).toBeInTheDocument();
  });
});