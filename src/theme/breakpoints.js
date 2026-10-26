/**
 * Shared media-query strings used across the theme modules. Each already
 * carries its `@media` prefix so it can be used directly as an MUI `sx` key.
 *
 * Short landscape is the awkward case: a rotated phone is usually wider than
 * the 640px phone breakpoint, so a rule nested under `max-width: 640px` never
 * fires on it. `SHORT_LANDSCAPE` deliberately has no width cap so the same
 * compact layout applies to a 568x320, a 667x375 and an 844x390 phone.
 */
export const PHONE = "@media (max-width: 640px)";
export const NARROW = "@media (max-width: 380px)";
export const TABLET = "@media (min-width: 641px) and (max-width: 1024px)";
export const PHONE_PORTRAIT =
  "@media (max-width: 640px) and (orientation: portrait)";
export const TINY_PORTRAIT =
  "@media (max-width: 360px) and (orientation: portrait)";
export const SHORT_LANDSCAPE =
  "@media (orientation: landscape) and (max-height: 500px)";

/** Phone-sized or short-landscape: the screens that need the compact chrome. */
export const COMPACT =
  "@media (max-width: 640px), (orientation: landscape) and (max-height: 500px)";
