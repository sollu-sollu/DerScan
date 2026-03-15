/**
 * Safe Icon Utility
 * Maps AI-generated icon names to valid MaterialCommunityIcons names.
 * Prevents console errors from invalid icon props.
 */

// Known-good icons that definitely exist in MaterialCommunityIcons
const KNOWN_ICONS = new Set([
  // Medical & Health
  'medical-bag', 'pill', 'hospital-building', 'stethoscope', 'heart-pulse',
  'clipboard-pulse-outline', 'clipboard-text-outline', 'bandage',
  'needle', 'thermometer', 'eye', 'eye-outline', 'flask',
  // Body & Skin
  'hand-heart', 'hand-wash', 'human', 'face-man', 'face-woman',
  'lotion', 'lotion-outline', 'lotion-plus', 'lotion-plus-outline',
  // Time & Schedule
  'clock-outline', 'clock', 'alarm', 'calendar', 'calendar-clock',
  'timer-outline', 'timer-sand',
  // Weather & Nature
  'white-balance-sunny', 'weather-sunny', 'weather-night', 'moon-waning-crescent',
  'water', 'water-outline', 'leaf', 'flower', 'tree',
  'umbrella', 'sunglasses',
  // Food & Drink
  'food-apple', 'food-apple-outline', 'cup-water', 'glass-cocktail',
  'fruit-citrus', 'carrot', 'fish',
  // Fitness & Lifestyle
  'run', 'walk', 'yoga', 'meditation', 'dumbbell', 'weight-lifter',
  'sleep', 'bed', 'bed-outline', 'power-sleep',
  'smoking-off', 'glass-wine', 'beer-outline',
  // General
  'check-circle-outline', 'check-circle', 'check', 'star', 'star-outline',
  'shield-check', 'shield-check-outline', 'alert-circle-outline',
  'information-outline', 'lightbulb-outline', 'lightbulb',
  'emoticon-happy-outline', 'emoticon-outline',
  'spray', 'spray-bottle', 'shower', 'shower-head',
  'hat-fedora', 'tshirt-crew', 'head-snowflake-outline',
  'creation', 'palette', 'auto-fix',
  'fire', 'flash', 'flash-outline',
  'map-marker', 'navigation-variant', 'map-marker-path',
  // Arrows & UI
  'arrow-right', 'chevron-right', 'close', 'plus', 'minus',
  'dots-vertical', 'magnify', 'refresh',
]);

// Keyword → fallback icon mapping for AI-generated icon names
const KEYWORD_MAP: [string, string][] = [
  ['sun', 'white-balance-sunny'],
  ['sunny', 'white-balance-sunny'],
  ['morning', 'white-balance-sunny'],
  ['cream', 'lotion-outline'],
  ['lotion', 'lotion-outline'],
  ['moistur', 'lotion-plus-outline'],
  ['wash', 'hand-wash'],
  ['clean', 'hand-wash'],
  ['face', 'face-man'],
  ['sleep', 'sleep'],
  ['night', 'moon-waning-crescent'],
  ['bed', 'bed-outline'],
  ['water', 'cup-water'],
  ['drink', 'cup-water'],
  ['hydra', 'water-outline'],
  ['food', 'food-apple-outline'],
  ['diet', 'food-apple-outline'],
  ['eat', 'food-apple-outline'],
  ['fruit', 'fruit-citrus'],
  ['exercise', 'run'],
  ['walk', 'walk'],
  ['run', 'run'],
  ['yoga', 'yoga'],
  ['meditat', 'meditation'],
  ['pill', 'pill'],
  ['medicine', 'medical-bag'],
  ['medic', 'medical-bag'],
  ['doctor', 'stethoscope'],
  ['hospital', 'hospital-building'],
  ['protect', 'shield-check-outline'],
  ['shield', 'shield-check-outline'],
  ['spf', 'white-balance-sunny'],
  ['sunscreen', 'white-balance-sunny'],
  ['hat', 'hat-fedora'],
  ['clock', 'clock-outline'],
  ['time', 'clock-outline'],
  ['timer', 'timer-outline'],
  ['alarm', 'alarm'],
  ['shower', 'shower'],
  ['bath', 'shower'],
  ['leaf', 'leaf'],
  ['natural', 'leaf'],
  ['heart', 'heart-pulse'],
  ['stress', 'meditation'],
  ['relax', 'meditation'],
  ['calm', 'meditation'],
  ['smok', 'smoking-off'],
  ['alcohol', 'glass-wine'],
  ['eye', 'eye-outline'],
  ['vitamin', 'pill'],
  ['supplement', 'pill'],
  ['spray', 'spray'],
  ['cloth', 'tshirt-crew'],
  ['wear', 'tshirt-crew'],
  ['check', 'check-circle-outline'],
  ['star', 'star'],
  ['light', 'lightbulb-outline'],
  ['tip', 'lightbulb-outline'],
  ['info', 'information-outline'],
  ['alert', 'alert-circle-outline'],
  ['happy', 'emoticon-happy-outline'],
  ['skin', 'lotion-outline'],
  ['apply', 'lotion-outline'],
  ['routine', 'clipboard-text-outline'],
];

const DEFAULT_ICON = 'check-circle-outline';

/**
 * Resolves an AI-generated icon name to a valid MaterialCommunityIcons name.
 * Returns a guaranteed-valid icon name, never throws.
 */
export function safeIcon(name?: string | any, fallback?: string): string {
  // Not a string at all → return fallback
  if (typeof name !== 'string' || !name.trim()) {
    return fallback || DEFAULT_ICON;
  }

  const cleaned = name.trim().toLowerCase();

  // Direct match in known-good set
  if (KNOWN_ICONS.has(cleaned)) {
    return cleaned;
  }

  // Original casing match (some icons have dashes)
  if (KNOWN_ICONS.has(name.trim())) {
    return name.trim();
  }

  // Keyword-based fuzzy fallback
  for (const [keyword, icon] of KEYWORD_MAP) {
    if (cleaned.includes(keyword)) {
      return icon;
    }
  }

  // Final fallback
  return fallback || DEFAULT_ICON;
}
