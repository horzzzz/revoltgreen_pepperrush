/**
 * Build-time feature flags. Flip one here to turn a feature on; everything
 * behind it stays out of the tree while it is `false`.
 */
export const FEATURE_FLAGS = {
  /**
   * Promotional / ad surfaces (currently the shop's "free coins" banner).
   * Off until the ad integration is ready -- no ad shows anywhere while false.
   */
  ads: false,
} as const;
