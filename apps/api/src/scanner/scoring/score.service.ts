import type { Result } from "axe-core";

const PENALTIES: Record<NonNullable<Result["impact"]>, number> = {
  critical: 12,
  serious: 6,
  moderate: 3,
  minor: 1,
};

export function calculateScore(violations: Result[]) {
  const penalty = violations.reduce((total, violation) => {
    const impact = violation.impact;

    if (!impact) {
      return total;
    }

    return total + (PENALTIES[impact] ?? 0);
  }, 0);

  return Math.max(0, Math.round(100 - penalty));
}
