import { newsSeed } from "./news-seed";

// ================= Слой данных новостей =================
// Сейчас: Supabase (Postgres), если заданы NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
// в .env.local - иначе локальный снапшот из lib/news-seed.ts.
// Переезд на локальную SQL заказчика: добавить сюда клиент (pg/mysql) и ветку по NEWS_DB=local,
// формат NewsPost и SQL-схема (supabase/migrations/0001_news.sql) при этом не меняются.

export type NewsKind = "news" | "event";

export type NewsPost = {
  slug: string;
  title: string;
  kind: NewsKind;
  publishedAt: string; // ISO date
  image: string | null;
  sourceUrl: string;
};

type NewsRow = {
  slug: string;
  title: string;
  kind: NewsKind;
  published_at: string;
  image_url: string | null;
  source_url: string;
};

const fromRow = (r: NewsRow): NewsPost => ({
  slug: r.slug,
  title: r.title,
  kind: r.kind,
  publishedAt: r.published_at,
  image: r.image_url,
  sourceUrl: r.source_url,
});

const hasSupabase =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function fetchFromSupabase(limit: number): Promise<NewsPost[]> {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data, error } = await supabase
    .from("news")
    .select("slug, title, kind, published_at, image_url, source_url")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as NewsRow[]).map(fromRow);
}

/** Последние материалы для главной/раздела. При любой ошибке БД - тихий откат на снапшот. */
export async function getLatestNews(limit = 3): Promise<NewsPost[]> {
  if (hasSupabase) {
    try {
      const rows = await fetchFromSupabase(limit);
      if (rows.length > 0) return rows;
    } catch (e) {
      console.warn("[news] Supabase недоступен, отдаю локальный снапшот:", (e as Error).message);
    }
  }
  return [...newsSeed].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1)).slice(0, limit);
}

async function fetchFeaturedFromSupabase(slugs: string[]): Promise<NewsPost[]> {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data, error } = await supabase
    .from("news")
    .select("slug, title, kind, published_at, image_url, source_url")
    .eq("is_published", true)
    .in("slug", slugs);
  if (error) throw error;
  const rows = (data as NewsRow[]).map(fromRow);
  return orderBySlugs(rows, slugs);
}

const orderBySlugs = (pool: NewsPost[], slugs: string[]): NewsPost[] =>
  slugs
    .map((slug) => pool.find((n) => n.slug === slug))
    .filter((n): n is NewsPost => !!n);

/** Витрина главной: выбранные редакцией материалы в заданном порядке. */
export async function getFeaturedNews(slugs: string[]): Promise<NewsPost[]> {
  if (hasSupabase) {
    try {
      const rows = await fetchFeaturedFromSupabase(slugs);
      if (rows.length === slugs.length) return rows;
    } catch (e) {
      console.warn("[news] Supabase недоступен, отдаю локальный снапшот:", (e as Error).message);
    }
  }
  return orderBySlugs(newsSeed, slugs);
}

const dateFmt = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });

export const formatNewsDate = (iso: string) => dateFmt.format(new Date(iso));

export const kindLabel: Record<NewsKind, string> = {
  news: "Новость",
  event: "Мероприятие",
};
