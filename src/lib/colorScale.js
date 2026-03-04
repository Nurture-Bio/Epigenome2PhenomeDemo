import { scaleDiverging } from 'd3-scale';
import { interpolateHsl } from 'd3-interpolate';

/**
 * Two-arm diverging scale — red ← white → blue
 *
 * RdBu's 11-class palette has orange in the middle of its red arm (t≈0.2–0.4).
 * No subrange avoids it. The fix is two explicit interpolators with clean endpoints:
 *   #d73027 — ColorBrewer RdBu class-3 red  (pure, no orange)
 *   #4575b4 — ColorBrewer RdBu class-3 blue (pure, no purple)
 *   #ffffff — white midpoint
 *
 * scaleDiverging maps domain [-1, 0, +1] → interpolator [0, 0.5, 1].
 * The custom function splits at t=0.5: left arm red, right arm blue.
 */
// interpolateHsl holds hue constant while ramping saturation + lightness.
// RGB interpolation drifts through brown/orange between white and red —
// HSL avoids that by never leaving the red hue family.
//
// Endpoints are ColorBrewer RdBu class-3 (#d73027, #4575b4):
// pure red (H≈4°) and pure blue (H≈218°), no orange zone in the path.
const toRed  = interpolateHsl('#ffffff', 'hsl(4, 55%, 72%)');
const toBlue = interpolateHsl('#ffffff', 'hsl(211, 45%, 68%)');

const rdbu = scaleDiverging(
  t => t < 0.5 ? toRed(1 - t * 2) : toBlue((t - 0.5) * 2)
).domain([-1, 0, 1]);

/**
 * @param {number}      flux  — current flux value
 * @param {number|null} prev  — previous flux value (null = no prior state)
 * @returns {string|undefined} RGB color string, or undefined for neutral rows
 */
export function divergingColor(flux, prev) {
  if (prev == null) return undefined;

  const ratio = (flux - prev) / Math.max(Math.abs(prev), 0.01);
  const t     = Math.max(-1, Math.min(1, ratio));

  if (Math.abs(t) < 0.05) return undefined; // ±5% dead-band — suppress noise

  // Power curve: super-linear ramp — moderate changes stay near white,
  // only large deltas earn saturation. Exponent > 1 compresses toward center.
  const shaped = Math.sign(t) * Math.pow(Math.abs(t), 1.8);

  return rdbu(shaped);
}
