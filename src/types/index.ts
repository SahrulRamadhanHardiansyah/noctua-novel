export type Novel = {
  url: string;
  slug: string;
  title: string;
  image_url: string;
  latest_chapters: {
    title: string;
    slug: string;
    url: string;
    chapter_short_title?: string;
  }[] | null;
  rating: number | null;
  genres: string[] | null;
  synopsis: string | null;
};

export type ChapterData = {
  chapter_title: string;
  content: string;
};

export type NovelDetail = {
  title: string;
  image_url: string;
  synopsis: string;
  rating: number | null;
  genres: string[];
  metadata: {
    author: string;
    status: string;
  };
  chapters: {
    slug: string;
    chapter_full_title: string;
    release_date: string;
  }[];
};
