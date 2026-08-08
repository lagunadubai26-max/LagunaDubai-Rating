import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewForm } from "@/components/review-form";

describe("ReviewForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("submits name, rating and comment to /api/reviews", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ review: { id: "1" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<ReviewForm />);

    await user.type(screen.getByLabelText("اسمك"), "سارة");
    await user.type(screen.getByLabelText("تعليقك"), "قهوة ممتازة وعرض جميل");
    await user.click(screen.getByRole("button", { name: "أضف التقييم" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/reviews");
    const payload = JSON.parse(init.body);
    expect(payload.reviewerName).toBe("سارة");
    expect(payload.rating).toBe(5);
    expect(payload.comment).toBe("قهوة ممتازة وعرض جميل");
    expect(payload.company).toBe("");

    await screen.findByText("مرسي عالمشاركة! تقييمك اتحفظ.");

    vi.unstubAllGlobals();
  });

  it("shows the server error message when the request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "التقييم لازم يكون من 1 لـ 5" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<ReviewForm />);

    await user.type(screen.getByLabelText("اسمك"), "عمر");
    await user.click(screen.getByRole("button", { name: "أضف التقييم" }));

    await screen.findByText("التقييم لازم يكون من 1 لـ 5");
    vi.unstubAllGlobals();
  });

  it("keeps the rating picker with stars 1 through 5", () => {
    render(<ReviewForm />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(5);
    expect(screen.getByRole("radio", { name: "5 من 5" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});