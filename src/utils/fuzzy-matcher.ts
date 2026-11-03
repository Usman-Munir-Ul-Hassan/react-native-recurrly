/**
 * Pure mathematical utility for string similarity and typo tolerance using Levenshtein distance.
 */

/**
 * Computes the Levenshtein edit distance between two strings.
 * Space-optimized to O(min(m, n)) memory.
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.trim().toLowerCase();
  const s2 = str2.trim().toLowerCase();

  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  // Ensure s1 is the shorter string to minimize array size
  const [shortStr, longStr] = s1.length < s2.length ? [s1, s2] : [s2, s1];
  const shortLen = shortStr.length;
  const longLen = longStr.length;

  let prevRow = new Array(shortLen + 1);
  let currRow = new Array(shortLen + 1);

  for (let j = 0; j <= shortLen; j++) {
    prevRow[j] = j;
  }

  for (let i = 1; i <= longLen; i++) {
    currRow[0] = i;
    const longChar = longStr[i - 1];

    for (let j = 1; j <= shortLen; j++) {
      const shortChar = shortStr[j - 1];
      const cost = longChar === shortChar ? 0 : 1;

      currRow[j] = Math.min(
        prevRow[j] + 1,       // Deletion
        currRow[j - 1] + 1,   // Insertion
        prevRow[j - 1] + cost // Substitution
      );
    }

    // Swap row pointers for next iteration
    for (let j = 0; j <= shortLen; j++) {
      prevRow[j] = currRow[j];
    }
  }

  return prevRow[shortLen];
}

/**
 * Calculates similarity ratio between two strings from 0.0 (completely distinct) to 1.0 (exact match).
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.trim().toLowerCase();
  const s2 = str2.trim().toLowerCase();

  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const maxLen = Math.max(s1.length, s2.length);
  const distance = levenshteinDistance(s1, s2);

  return Math.max(0, 1 - distance / maxLen);
}

/**
 * Returns true if two strings match within a tolerance threshold (default: 85%).
 */
export function isFuzzyMatch(
  str1: string,
  str2: string,
  threshold = 0.85
): boolean {
  return calculateSimilarity(str1, str2) >= threshold;
}
