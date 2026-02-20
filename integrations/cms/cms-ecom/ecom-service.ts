/**
 * Local stub for buy-now flow in non-Wix mode.
 */
export async function buyNow(
  items: Array<{ collectionId: string; itemId: string; quantity?: number }>
): Promise<void> {
  if (items.length === 0) {
    throw new Error("At least one item is required for checkout");
  }

  if (typeof window !== "undefined") {
    window.alert("Checkout is disabled in non-Wix mode. Cart-only local demo is active.");
  }
}
