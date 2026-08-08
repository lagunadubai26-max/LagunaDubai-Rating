import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RatingPicker } from "@/components/rating-picker";

describe("RatingPicker", () => {
  it("renders 5 star radios with a default value", () => {
    render(<RatingPicker name="rating" />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(5);
    expect(screen.getByRole("radio", { name: "5 من 5" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("updates the hidden input when a star is chosen", async () => {
    const user = userEvent.setup();
    render(<RatingPicker name="rating" />);
    await user.click(screen.getByRole("radio", { name: "3 من 5" }));

    expect(screen.getByRole("radio", { name: "3 من 5" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    const input = document.querySelector('input[name="rating"]');
    expect(input).toHaveValue("3");
    expect(screen.getByText("قيمتك: 3 من 5")).toBeInTheDocument();
  });
});