import { newsSeed } from "./news-seed";
import { newsContent } from "./news-content";

// ================= Слой данных новостей =================
// Основной источник: Supabase (Postgres), если заданы NEXT_PUBLIC_SUPABASE_URL
// и NEXT_PUBLIC_SUPABASE_ANON_KEY. Локальный снапшот нужен только для предпросмотра
// без ключей и как аварийный резерв при временной недоступности БД.

export type NewsKind = "news" | "event";

export type NewsPost = {
  slug: string;
  title: string;
  kind: NewsKind;
  publishedAt: string;
  image: string | null;
  sourceUrl: string;
  excerpt: string;
};

export type NewsArticle = NewsPost & {
  contentHtml: string;
};

type NewsRow = {
  slug: string;
  title: string;
  kind: NewsKind;
  published_at: string;
  image_url: string | null;
  source_url: string | null;
  excerpt: string | null;
};

type NewsArticleRow = NewsRow & {
  content_html: string | null;
};

const SUMMARY_SELECT = "slug, title, kind, published_at, image_url, source_url, excerpt";
const ARTICLE_SELECT = `${SUMMARY_SELECT}, content_html`;

const fromRow = (r: NewsRow): NewsPost => ({
  slug: r.slug,
  title: r.title,
  kind: r.kind,
  publishedAt: r.published_at,
  image: r.image_url,
  sourceUrl: r.source_url ?? "",
  excerpt: r.excerpt ?? "",
});

const fromArticleRow = (r: NewsArticleRow): NewsArticle => ({
  ...fromRow(r),
  contentHtml: r.content_html ?? "",
});

const hasSupabase = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function supabaseClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

const sortByDate = (items: NewsPost[]) =>
  [...items].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

const articleFromSeed = (slug: string): NewsArticle | null => {
  const post = newsSeed.find((item) => item.slug === slug);
  const content = newsContent[slug];
  if (!post || !content) return null;
  return { ...post, contentHtml: content.contentHtml };
};

/** Последние материалы для главной, архива и поиска. */
export async function getLatestNews(limit = 3): Promise<NewsPost[]> {
  const safeLimit = Math.max(1, Math.min(limit, 100));
  if (hasSupabase()) {
    try {
      const supabase = await supabaseClient();
      const { data, error } = await supabase
        .from("news")
        .select(SUMMARY_SELECT)
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(safeLimit);
      if (error) throw error;
      return ((data ?? []) as NewsRow[]).map(fromRow);
    } catch (e) {
      console.warn("[news] Supabase недоступен, отдаю локальный снапшот:", (e as Error).message);
    }
  }
  return sortByDate(newsSeed).slice(0, safeLimit);
}

const orderBySlugs = (pool: NewsPost[], slugs: string[]): NewsPost[] =>
  slugs.map((slug) => pool.find((n) => n.slug === slug)).filter((n): n is NewsPost => !!n);

/** Витрина главной: выбранные редакцией материалы в заданном порядке. */
export async function getFeaturedNews(slugs: string[]): Promise<NewsPost[]> {
  if (hasSupabase()) {
    try {
      const supabase = await supabaseClient();
      const { data, error } = await supabase
        .from("news")
        .select(SUMMARY_SELECT)
        .eq("is_published", true)
        .in("slug", slugs);
      if (error) throw error;
      return orderBySlugs(((data ?? []) as NewsRow[]).map(fromRow), slugs);
    } catch (e) {
      console.warn("[news] Supabase недоступен, отдаю локальный снапшот:", (e as Error).message);
    }
  }
  return orderBySlugs(newsSeed, slugs);
}

/** Полный материал для локальной страницы /info/news/[slug]/. */
export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  if (hasSupabase()) {
    try {
      const supabase = await supabaseClient();
      const { data, error } = await supabase
        .from("news")
        .select(ARTICLE_SELECT)
        .eq("is_published", true)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data ? fromArticleRow(data as NewsArticleRow) : null;
    } catch (e) {
      console.warn("[news] Supabase недоступен, отдаю локальный снапшот:", (e as Error).message);
    }
  }
  return articleFromSeed(slug);
}

export { formatNewsDate, kindLabel, newsItemHref } from "./news-format";
