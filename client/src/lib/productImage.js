/**
 * Shared fallback for product/project photos across the storefront.
 * Used both when a product has no image on record, and as an onError
 * handler when a stored image URL 404s (e.g. a seed placeholder path
 * like "/placeholder-brick-1.jpg" that was never actually uploaded).
 */
export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400';

/** Picks the primary image if flagged, else the first image, else the fallback. */
export function getProductImageUrl(product) {
  const images = product?.images;
  if (!Array.isArray(images) || images.length === 0) return FALLBACK_IMAGE;
  return images.find((img) => img?.isPrimary)?.url || images[0]?.url || FALLBACK_IMAGE;
}

/**
 * onError handler factory for plain <img> tags: swaps to the fallback
 * image once, guarding against an infinite error loop if the fallback
 * itself ever failed to load.
 */
export function handleProductImageError(e) {
  const img = e.currentTarget;
  if (img.src !== FALLBACK_IMAGE) {
    img.src = FALLBACK_IMAGE;
  }
}
