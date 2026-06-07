/**
 * Escape regex special characters in a string to prevent ReDoS attacks.
 *
 * Use this before passing **any** user-supplied string to `new RegExp()` or
 * MongoDB's `$regex` operator.
 *
 * @example
 *   const safe = escapeRegex(userInput);
 *   const regex = new RegExp(safe, "i");
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
