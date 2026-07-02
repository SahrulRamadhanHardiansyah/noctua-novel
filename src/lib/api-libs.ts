export const getNovelResponse = async <T = any>(resource: string, query?: string): Promise<T> => {
  let url = `${process.env.NEXT_PUBLIC_NOVEL_API_URL}/api/${resource}`;

  if (query) {
    url += `?${query}`;
  }

  const res = await fetch(url, { next: { revalidate: 300 } });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data: T = await res.json();
  return data;
};
