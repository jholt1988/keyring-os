/**
 * Proposed Keyring prices. Integer cents only — do not introduce binary floats.
 * Competitor cells are copied from the November plan. Do not recalculate them.
 */

export const DOOR_MIN = 1;
export const DOOR_MAX = 300;

export const LANDLORD_MAX_DOORS = 15;
export const LANDLORD_MONTHLY_CENTS = 3900;
export const LANDLORD_ANNUAL_CENTS = 39000;

export const OPERATOR_FLOOR_CENTS = 9900;
export const OPERATOR_PER_DOOR_CENTS = 175;

export const PORTFOLIO_FLOOR_CENTS = 24900;
export const PORTFOLIO_PER_DOOR_CENTS = 275;

export type TierId = "landlord" | "operator" | "portfolio";

export interface TierPrice {
  id: TierId;
  name: string;
  /** null when this tier does not sell at the given door count. */
  monthlyCents: number | null;
  /** Annual is defined only for Landlord. Other tiers stay null. */
  annualCents: number | null;
  recommended: boolean;
}

export interface DoorQuote {
  doors: number;
  tiers: [TierPrice, TierPrice, TierPrice];
  recommended: TierPrice;
}

export function isDoorCountInRange(doors: number): boolean {
  return Number.isInteger(doors) && doors >= DOOR_MIN && doors <= DOOR_MAX;
}

/** Whole numbers only. Out of 1..300, or anything that is not an integer, is no price. */
export function parseDoorCount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^[0-9]+$/.test(trimmed)) return null;
  const doors = Number(trimmed);
  return isDoorCountInRange(doors) ? doors : null;
}

function atLeast(floorCents: number, perDoorCents: number, doors: number): number {
  const usage = doors * perDoorCents;
  return usage > floorCents ? usage : floorCents;
}

export function quoteDoors(doors: number): DoorQuote | null {
  if (!isDoorCountInRange(doors)) return null;

  const landlordAvailable = doors <= LANDLORD_MAX_DOORS;
  const recommendedId: TierId = landlordAvailable ? "landlord" : "operator";

  const landlord: TierPrice = {
    id: "landlord",
    name: "Landlord",
    monthlyCents: landlordAvailable ? LANDLORD_MONTHLY_CENTS : null,
    annualCents: landlordAvailable ? LANDLORD_ANNUAL_CENTS : null,
    recommended: recommendedId === "landlord",
  };
  const operator: TierPrice = {
    id: "operator",
    name: "Operator",
    monthlyCents: atLeast(OPERATOR_FLOOR_CENTS, OPERATOR_PER_DOOR_CENTS, doors),
    annualCents: null,
    recommended: recommendedId === "operator",
  };
  const portfolio: TierPrice = {
    id: "portfolio",
    name: "Portfolio AI",
    monthlyCents: atLeast(PORTFOLIO_FLOOR_CENTS, PORTFOLIO_PER_DOOR_CENTS, doors),
    annualCents: null,
    recommended: false,
  };

  const tiers: [TierPrice, TierPrice, TierPrice] = [landlord, operator, portfolio];
  const recommended = tiers.find((tier) => tier.recommended);
  if (!recommended || recommended.monthlyCents === null) return null;
  return { doors, tiers, recommended };
}

/** Format integer cents as dollars. $39 stays $39; 26250 cents is $262.50. */
export function formatUsdFromCents(cents: number): string {
  if (!Number.isInteger(cents)) {
    throw new Error("formatUsdFromCents requires integer cents");
  }
  const negative = cents < 0;
  const abs = negative ? -cents : cents;
  const dollars = Math.trunc(abs / 100);
  const remainder = abs % 100;
  const body = remainder === 0 ? String(dollars) : `${dollars}.${String(remainder).padStart(2, "0")}`;
  return `${negative ? "-" : ""}$${body}`;
}

export interface ComparisonRow {
  doors: 10 | 60 | 150;
  keyring: string;
  buildium: string;
  doorloop: string;
  /** Set only when the competitor cell is a labeled plan estimate, not a fresh quote. */
  doorloopNote: string | null;
}

/**
 * Copied comparison rows. Do not derive these from the calculator.
 * The 150-door DoorLoop cell is the November 12 plan estimate, not 150 × $1.50.
 * Buildium has no 150-door figure in the source table.
 */
export const COMPARISON_ROWS: readonly ComparisonRow[] = [
  {
    doors: 10,
    keyring: "$39",
    buildium: "from $65",
    doorloop: "$69-$99",
    doorloopNote: null,
  },
  {
    doors: 60,
    keyring: "$105",
    buildium: "Growth from $202",
    doorloop: "about $199-$219",
    doorloopNote: null,
  },
  {
    doors: 150,
    keyring: "$262.50",
    buildium: "not in the source table",
    doorloop: "about $325",
    doorloopNote: "November 12 plan estimate, not a fresh quote",
  },
];

export const INCLUDED_ON_EVERY_TIER = [
  "Free onboarding and migration",
  "No unit cliffs",
  "Self-serve cancellation",
  "Full data export",
  "Unlimited users",
] as const;
