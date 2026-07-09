export const slugify = (text: string) =>
  text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

export const getSlugFromUrl = (url: string): string => {
  if (!url) return "";
  return url.split("/").filter(Boolean).pop() || "";
};
