export type Novel = {
  url: any;
  slug: any;
  title: any;
  image_url: any;
  latest_chapters: any | null;
  rating: any | null;
  genres: any | null;
  synopsis: string | null;
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
