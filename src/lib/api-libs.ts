export const getNovelResponse = async (resource: string, query?: string) => {
  let url = `${process.env.NEXT_PUBLIC_NOVEL_API_URL}/api/${resource}`;

  if (query) {
    url += `?${query}`;
  }

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();
  return data;
};
