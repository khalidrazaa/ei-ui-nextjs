export type PublishStatus = "draft" | "published";

export interface Article {
  id: number;
  title: string;
  slug: string;
  seo_title?: string | null;
  category?: string | null;
  subcategory?: string | null;
  status?: PublishStatus;
  created_at?: string | null;
  updated_at?: string | null;
  published_at?: string | null;
  drafted_at?: string | null;
  content?: string | null;
  excerpt?: string | null;
  reading_time?: number | null;
  tags?: string[];
  keywords?: string[];
  host_site?: string | null;
  language?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  schema_type?: string | null;
  open_graph_title?: string | null;
  open_graph_description?: string | null;
  open_graph_image?: string | null;
  featured_image_url?: string | null;
  image_alt_text?: string | null;
  is_featured?: boolean;
}

export interface ArticleComment {
  id: number;
  article_id: number;
  host_site: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface CreateCommentPayload {
  slug: string;
  author_name: string;
  content: string;
}
