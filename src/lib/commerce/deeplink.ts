import type { QuickCommerceLink } from "@/lib/types";

/**
 * One-tap reorder via quick-commerce deep links.
 *
 * When something the user relies on (a water filter cartridge, a probiotic box)
 * is about to run out, we open a ready-made search on the apps they already use
 * — Blinkit, Zepto, Swiggy Instamart — so reordering is one tap. We sell
 * nothing ourselves and take no commission; this is purely a convenience.
 */

/**
 * Build reorder deep links for a product across all supported platforms.
 * `query` is typically the generic product name, e.g. "probiotic capsules".
 */
export function buildReorderLinks(query: string): QuickCommerceLink[] {
  const q = encodeURIComponent(query.trim());
  return [
    {
      platform: "blinkit",
      label: "Open in Blinkit",
      url: `https://blinkit.com/s/?q=${q}`,
    },
    {
      platform: "zepto",
      label: "Open in Zepto",
      url: `https://www.zeptonow.com/search?query=${q}`,
    },
    {
      platform: "instamart",
      label: "Open in Swiggy Instamart",
      url: `https://www.swiggy.com/instamart/search?custom_back=true&query=${q}`,
    },
  ];
}

export interface InventoryItem {
  name: string;
  /** Total units in a pack, e.g. 30 capsules. */
  packSize: number;
  /** Units consumed per day. */
  perDay: number;
  /** ISO date the current pack was started. */
  startedOn: string;
}

export interface DepletionEstimate {
  name: string;
  daysRemaining: number;
  /** True when we should nudge a reorder now. */
  reorderNow: boolean;
  links: QuickCommerceLink[];
}

/**
 * Estimate how many days of a consumable remain and whether to nudge a reorder.
 * Default lead time of 3 days means we prompt before the user runs out.
 */
export function estimateDepletion(
  item: InventoryItem,
  leadTimeDays = 3,
  now: Date = new Date(),
): DepletionEstimate {
  const started = new Date(item.startedOn).getTime();
  const elapsedDays = Math.max(0, (now.getTime() - started) / 86_400_000);
  const consumed = elapsedDays * item.perDay;
  const unitsLeft = Math.max(0, item.packSize - consumed);
  const daysRemaining = item.perDay > 0 ? Math.floor(unitsLeft / item.perDay) : Infinity;

  return {
    name: item.name,
    daysRemaining,
    reorderNow: daysRemaining <= leadTimeDays,
    links: buildReorderLinks(item.name),
  };
}
