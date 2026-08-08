import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RatingStars } from "@/components/rating-stars";

describe("RatingStars", () => {
  it("renders 5 stars with filled count matching the rating", () => {
    const { container } = render(<RatingStars rating={4} />);
    const filled = container.querySelectorAll(".text-ember").length;
    const empty = container.querySelectorAll(".text-sand-200").length;
    expect(filled).toBe(4);
    expect(empty).toBe(1);
  });

  it("rounds a fractional rating to the nearest star", () => {
    const { container } = render(<RatingStars rating={4.6} />);
    expect(container.querySelectorAll(".text-ember").length).toBe(5);
  });

  it("renders all stars empty when rating is null", () => {
    const { container } = render(<RatingStars rating={null} />);
    expect(container.querySelectorAll(".text-ember").length).toBe(0);
    expect(container.querySelectorAll(".text-sand-200").length).toBe(5);
  });

  it("exposes an accessible label", () => {
    render(<RatingStars rating={3} />);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "تقييم 3 من 5");
  });
});