/**
 * Unit Tests — Input Sanitization
 *
 * Tests the pure sanitization logic.
 * Note: DOMPurify integration is tested via E2E; here we test the wrapper logic.
 */

// Mock isomorphic-dompurify for Jest (ESM compatibility)
jest.mock("isomorphic-dompurify", () => ({
  __esModule: true,
  default: {
    sanitize: (input: string, config?: any) => {
      // Simple mock: strip tags if no allowed tags, pass through otherwise
      if (config?.ALLOWED_TAGS?.length === 0) {
        return input.replace(/<[^>]*>/g, "");
      }
      return input;
    },
  },
}));

import { sanitizeText, sanitizeUrl, clampLength } from "@/lib/sanitize";

describe("Input Sanitization", () => {
  describe("sanitizeText", () => {
    it("should strip HTML tags", () => {
      expect(sanitizeText("<script>alert('xss')</script>")).not.toContain("<script>");
    });

    it("should strip img tags", () => {
      expect(sanitizeText('<img src=x onerror=alert(1)>')).not.toContain("<img");
    });

    it("should preserve plain text", () => {
      expect(sanitizeText("Hello world")).toBe("Hello world");
    });

    it("should handle empty string", () => {
      expect(sanitizeText("")).toBe("");
    });

    it("should handle null/undefined gracefully", () => {
      expect(sanitizeText(null as any)).toBe("");
      expect(sanitizeText(undefined as any)).toBe("");
    });
  });

  describe("sanitizeUrl", () => {
    it("should allow https URLs", () => {
      expect(sanitizeUrl("https://example.com")).toBe("https://example.com");
    });

    it("should allow http URLs", () => {
      expect(sanitizeUrl("http://example.com")).toBe("http://example.com");
    });

    it("should reject javascript: URIs", () => {
      expect(sanitizeUrl("javascript:alert(1)")).toBe("");
    });

    it("should reject data: URIs", () => {
      expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("");
    });

    it("should reject empty string", () => {
      expect(sanitizeUrl("")).toBe("");
    });

    it("should trim whitespace", () => {
      expect(sanitizeUrl("  https://example.com  ")).toBe("https://example.com");
    });
  });

  describe("clampLength", () => {
    it("should not modify short strings", () => {
      expect(clampLength("hello", 10)).toBe("hello");
    });

    it("should truncate long strings", () => {
      expect(clampLength("hello world", 5)).toBe("hello");
    });

    it("should handle empty string", () => {
      expect(clampLength("", 10)).toBe("");
    });
  });
});
