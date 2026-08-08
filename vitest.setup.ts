import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("next/font/google", () => {
  const make = () => ({ variable: "font-test", className: "font-test" });
  return { Fraunces: make, Inter: make };
});