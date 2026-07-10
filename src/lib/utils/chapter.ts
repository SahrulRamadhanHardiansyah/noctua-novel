/**
 * Strip the novel title prefix from a full chapter title.
 *
 * API data comes in formats like:
 *   "Who Let Him Cultivate Immortality Chapter 424: Lu Yang..."
 *   "Novel Title - Chapter 76"
 *
 * This returns just the "Chapter ..." part.
 */
export function formatChapterTitle(fullTitle: string, novelTitle?: string): string {
  if (!fullTitle) return fullTitle;

  // If we have the novel title, strip it directly (case-insensitive)
  if (novelTitle) {
    // Try "Novel Title - Chapter X" format
    const dashPrefix = `${novelTitle} - `;
    if (fullTitle.toLowerCase().startsWith(dashPrefix.toLowerCase())) {
      return fullTitle.slice(dashPrefix.length);
    }
    // Try "Novel Title Chapter X" format (no dash)
    const spacePrefix = `${novelTitle} `;
    if (fullTitle.toLowerCase().startsWith(spacePrefix.toLowerCase())) {
      return fullTitle.slice(spacePrefix.length);
    }
  }

  // Fallback: find "Chapter" keyword and return from there
  const chapterIdx = fullTitle.search(/Chapter\s+\d/i);
  if (chapterIdx > 0) {
    return fullTitle.slice(chapterIdx);
  }

  // Last resort: try " - " split
  const dashIdx = fullTitle.indexOf(" - ");
  if (dashIdx !== -1) {
    return fullTitle.slice(dashIdx + 3);
  }

  return fullTitle;
}
