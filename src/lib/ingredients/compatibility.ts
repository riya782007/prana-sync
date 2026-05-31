import type { CompatibilityIssue, ProductIngredients } from "@/lib/types";

/**
 * Brand-agnostic ingredient compatibility engine.
 *
 * Each rule expresses a known interaction between two active families. We match
 * on normalized synonyms so users can paste raw INCI lists from any brand.
 */

interface ActiveFamily {
  key: string;
  label: string;
  synonyms: string[];
}

const ACTIVE_FAMILIES: ActiveFamily[] = [
  {
    key: "vitamin_c",
    label: "Vitamin C (L-ascorbic acid)",
    synonyms: [
      "ascorbic acid",
      "l-ascorbic acid",
      "vitamin c",
      "sodium ascorbyl phosphate",
      "ascorbyl glucoside",
    ],
  },
  {
    key: "retinoid",
    label: "Retinoid (retinol)",
    synonyms: ["retinol", "retinal", "retinaldehyde", "retinoic acid", "retinyl"],
  },
  {
    key: "aha",
    label: "AHA (glycolic / lactic acid)",
    synonyms: ["glycolic acid", "lactic acid", "mandelic acid", "aha"],
  },
  {
    key: "bha",
    label: "BHA (salicylic acid)",
    synonyms: ["salicylic acid", "bha", "betaine salicylate"],
  },
  {
    key: "niacinamide",
    label: "Niacinamide",
    synonyms: ["niacinamide", "nicotinamide"],
  },
  {
    key: "copper_peptide",
    label: "Copper peptides",
    synonyms: ["copper peptide", "copper tripeptide", "ghk-cu", "copper gluconate"],
  },
  {
    key: "benzoyl_peroxide",
    label: "Benzoyl peroxide",
    synonyms: ["benzoyl peroxide"],
  },
];

interface Rule {
  a: string;
  b: string;
  severity: CompatibilityIssue["severity"];
  reason: string;
}

const RULES: Rule[] = [
  {
    a: "vitamin_c",
    b: "copper_peptide",
    severity: "separate_am_pm",
    reason:
      "L-ascorbic acid can oxidise copper peptides and blunt both. Use vitamin C in the AM and copper peptides in the PM.",
  },
  {
    a: "retinoid",
    b: "aha",
    severity: "caution",
    reason:
      "Retinoids + AHAs together over-exfoliate and irritate the barrier. Alternate nights rather than layering.",
  },
  {
    a: "retinoid",
    b: "bha",
    severity: "caution",
    reason:
      "Retinoid + salicylic acid can be drying/irritating when stacked. Alternate or buffer with moisturiser.",
  },
  {
    a: "retinoid",
    b: "vitamin_c",
    severity: "separate_am_pm",
    reason:
      "Best split by time of day: vitamin C in the AM for antioxidant + SPF synergy, retinoid in the PM.",
  },
  {
    a: "retinoid",
    b: "benzoyl_peroxide",
    severity: "avoid",
    reason:
      "Benzoyl peroxide can oxidise and deactivate many retinoids when applied together. Keep them in separate routines.",
  },
  {
    a: "aha",
    b: "bha",
    severity: "caution",
    reason:
      "Stacking AHA + BHA raises the risk of over-exfoliation. Limit combined use to 1-2x/week.",
  },
];

function detectFamilies(ingredients: string[]): Set<string> {
  const found = new Set<string>();
  const normalized = ingredients.map((i) => i.trim().toLowerCase());
  for (const fam of ACTIVE_FAMILIES) {
    if (
      normalized.some((ing) =>
        fam.synonyms.some((syn) => ing.includes(syn)),
      )
    ) {
      found.add(fam.key);
    }
  }
  return found;
}

function familyLabel(key: string): string {
  return ACTIVE_FAMILIES.find((f) => f.key === key)?.label ?? key;
}

/**
 * Check a set of products for clashing actives. Works whether each product's
 * ingredients are listed separately (preferred) or merged into one list.
 */
export function checkCompatibility(
  products: ProductIngredients[],
): CompatibilityIssue[] {
  const allIngredients = products.flatMap((p) => p.ingredients);
  const families = detectFamilies(allIngredients);
  const issues: CompatibilityIssue[] = [];

  for (const rule of RULES) {
    if (families.has(rule.a) && families.has(rule.b)) {
      issues.push({
        ingredientA: familyLabel(rule.a),
        ingredientB: familyLabel(rule.b),
        severity: rule.severity,
        reason: rule.reason,
      });
    }
  }

  return issues;
}

/** Detected active families, for display in the UI. */
export function detectedActives(products: ProductIngredients[]): string[] {
  const families = detectFamilies(products.flatMap((p) => p.ingredients));
  return [...families].map(familyLabel);
}
