import type { QuickCommerceLink } from "@/lib/types";

/**
 * Quick-commerce reorder via deep links.
 *
 * Per the product strategy, Prana Sync does NOT hold inventory or process
 * fulfilment. When a routine item runs low we build a search/cart deep link
 * into Blinkit / Zepto / Swiggy Instamart so the user checks out in 1 click on
 * the platform they already trust. Prana Sync earns affiliate commission.
 *
 * These are public search/deep-link URL patterns; an `AFFILIATE_TAG` env var is
 * appended when present so attribution works once an affiliate deal is signed.
 */

function affiliateTag(): string {
  return process.env.AFFILIATE_TAG ?? "";
}

function withTag(url: string): string {
  const tag = affiliateTag();
  if (!tag) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}utm_source=pranasync&utm_medium=affiliate&ref=${encodeURIComponent(tag)}`;
}

/**
 * Build reorder deep links for a product across all supported platforms.
 * `query` is typically the generic product name, e.g. "probiotic capsules".
 */
export function buildReorderLinks(query: string): QuickCommerceLink[] {
  const q = encodeURIComponent(query.trim());
  return [
    {
      platform: "blinkit",
      label: "Reorder on Blinkit",
      url: withTag(`https://blinkit.com/s/?q=${q}`),
    },
    {
      platform: "zepto",
      label: "Reorder on Zepto",
      url: withTag(`https://www.zeptonow.com/search?query=${q}`),
    },
    {
      platform: "instamart",
      label: "Reorder on Swiggy Instamart",
      url: withTag(`https://www.swiggy.com/instamart/search?custom_back=true&query=${q}`),
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
