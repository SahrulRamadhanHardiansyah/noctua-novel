/**
 * Input sanitization utilities for user-generated content.
 * Prevents XSS attacks on chapter content, comments, reviews, etc.
 */

import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize plain text — strip all HTML tags.
 * Use for: comments, review text, bio, titles.
 */
export function sanitizeText(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}

/**
 * Sanitize rich text — allow safe formatting tags only.
 * Use for: chapter content (if using rich text editor).
 * Allows: p, br, strong, em, u, a, blockquote, ul, ol, li, h1-h6, img
 */
export function sanitizeRichText(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "a", "blockquote",
      "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6",
      "img", "hr", "pre", "code",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize URL — ensure it's a valid http/https URL.
 * Prevents javascript: and data: URI attacks.
 */
export function sanitizeUrl(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "";
}

/**
 * Validate and clamp string length.
 */
export function clampLength(input: string, max: number): string {
  if (!input) return "";
  return input.slice(0, max);
}
