/**
 * Reading History utility
 * - Uses localStorage for guest users
 * - Marks chapters as read when user opens them
 * - Returns set of read chapter slugs for visual indicators
 */

const STORAGE_KEY = "noctua_read_chapters";

function getReadSlugs(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function markChapterAsRead(chapterSlug: string): void {
  if (typeof window === "undefined") return;
  const read = getReadSlugs();
  read.add(chapterSlug);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...read]));
}

export function getReadChapters(): string[] {
  return [...getReadSlugs()];
}

export function isChapterRead(chapterSlug: string): boolean {
  return getReadSlugs().has(chapterSlug);
}

/**
 * Check if a chapter slug is in the read set.
 * Pass the full set for batch lookups (more efficient in lists).
 */
export function isChapterInSet(chapterSlug: string, readSet: Set<string>): boolean {
  return readSet.has(chapterSlug);
}
