import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import LandingPage from "../landing/page";
import PricingPage from "./page";
import { formatUsdFromCents, quoteDoors } from "./prices";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function setDoors(value: string) {
  fireEvent.change(screen.getByLabelText(/door count/i), { target: { value } });
}

function tierPrice(id: string) {
  return screen.getByTestId(`tier-${id}-price`).textContent;
}

describe("pricing math", () => {
  it("keeps quotes in integer cents", () => {
    expect(quoteDoors(8)?.tiers.map((tier) => tier.monthlyCents)).toEqual([3900, 9900, 24900]);
    expect(quoteDoors(20)?.tiers[1].monthlyCents).toBe(9900);
    expect(quoteDoors(60)?.tiers[1].monthlyCents).toBe(10500);
    expect(quoteDoors(60)?.tiers[2].monthlyCents).toBe(24900);
    expect(quoteDoors(150)?.tiers[1].monthlyCents).toBe(26250);
    expect(quoteDoors(150)?.tiers[2].monthlyCents).toBe(41250);
    expect(quoteDoors(8)?.tiers[0].annualCents).toBe(39000);
    expect(quoteDoors(16)?.tiers[0].monthlyCents).toBeNull();
    expect(quoteDoors(16)?.tiers[1].annualCents).toBeNull();
    expect(quoteDoors(16)?.tiers[2].annualCents).toBeNull();
    expect(quoteDoors(0)).toBeNull();
    expect(quoteDoors(301)).toBeNull();
    expect(quoteDoors(1.5)).toBeNull();
    expect(formatUsdFromCents(3900)).toBe("$39");
    expect(formatUsdFromCents(26250)).toBe("$262.50");
    expect(formatUsdFromCents(41250)).toBe("$412.50");
  });
});

describe("pricing page", () => {
  it("renders Proposed and the copied comparison rows without a session", () => {
    render(<PricingPage />);

    expect(screen.getByText("Proposed")).toBeTruthy();
    expect(screen.getByTestId("comparison-10-keyring").textContent).toBe("$39");
    expect(screen.getByTestId("comparison-10-buildium").textContent).toBe("from $65");
    expect(screen.getByTestId("comparison-10-doorloop").textContent).toBe("$69-$99");

    expect(screen.getByTestId("comparison-60-keyring").textContent).toBe("$105");
    expect(screen.getByTestId("comparison-60-buildium").textContent).toBe("Growth from $202");
    expect(screen.getByTestId("comparison-60-doorloop").textContent).toBe("about $199-$219");

    expect(screen.getByTestId("comparison-150-keyring").textContent).toBe("$262.50");
    expect(screen.getByTestId("comparison-150-buildium").textContent).toBe("not in the source table");
    expect(screen.getByTestId("comparison-150-doorloop").textContent).toContain("about $325");
    expect(screen.getByTestId("comparison-150-doorloop").textContent).toContain("November 12 plan estimate");
    expect(screen.getByTestId("comparison-150-doorloop").textContent).toContain("not a fresh quote");
    expect(screen.getByTestId("comparison-150-doorloop").textContent).not.toContain("$225");

    expect(screen.queryByRole("button", { name: /buy|checkout|subscribe|trial/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /buy|checkout|subscribe|trial/i })).toBeNull();
    expect(document.body.textContent).not.toContain("$1.50");
    expect(document.body.textContent?.toLowerCase()).not.toContain("stripe");
  });

  it("prices the calculator checks and shows no price outside 1 to 300", () => {
    render(<PricingPage />);

    setDoors("8");
    expect(tierPrice("landlord")).toBe("$39");
    expect(tierPrice("operator")).toBe("$99");
    expect(tierPrice("portfolio")).toBe("$249");

    setDoors("10");
    expect(screen.getByTestId("recommended-price").textContent).toBe("$39");
    expect(screen.getByTestId("tier-landlord").textContent).toContain("Recommended");
    expect(screen.getByTestId("tier-portfolio").textContent).not.toContain("Recommended");

    setDoors("16");
    expect(tierPrice("landlord")).toBe("No price");
    expect(tierPrice("operator")).toBe("$99");
    expect(screen.getByTestId("recommended-price").textContent).toBe("$99");
    expect(screen.getByTestId("tier-portfolio").textContent).not.toContain("Recommended");
    expect(screen.queryByTestId("tier-operator-annual")).toBeNull();

    setDoors("20");
    expect(tierPrice("operator")).toBe("$99");

    setDoors("60");
    expect(tierPrice("operator")).toBe("$105");
    expect(tierPrice("portfolio")).toBe("$249");

    setDoors("150");
    expect(tierPrice("operator")).toBe("$262.50");
    expect(tierPrice("portfolio")).toBe("$412.50");

    setDoors("0");
    expect(screen.getByTestId("calculator").textContent).toContain("No price");
    expect(screen.queryByTestId("tier-landlord-price")).toBeNull();
    expect(screen.queryByTestId("tier-operator-price")).toBeNull();
    expect(screen.queryByTestId("tier-portfolio-price")).toBeNull();

    setDoors("301");
    expect(screen.getByTestId("calculator").textContent).toContain("No price");
    expect(screen.queryByTestId("tier-operator-price")).toBeNull();
  });
});

describe("landing page", () => {
  it("links to pricing next to sign in", () => {
    render(<LandingPage />);
    const pricing = screen.getByRole("link", { name: "Pricing" });
    const signIn = screen.getByRole("link", { name: "Sign in" });
    expect(pricing.getAttribute("href")).toBe("/pricing");
    expect(signIn.getAttribute("href")).toBe("/login");
    expect(pricing.compareDocumentPosition(signIn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
