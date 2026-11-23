import { projectsSeed } from "./projects-seed";
import { industryFilters } from "./project-filters";

// ================= Слой данных проектов =================
// Как и новости: Supabase, если заданы ключи в .env.local, иначе локальный снапшот
// lib/projects-seed.ts. Переезд на локальную SQL заказчика - заменить клиент здесь,
// схема (supabase/migrations/0002_projects.sql) и формат ProjectPost не меняются.

export type ProjectPost = {
  slug: string;
  title: string;
  industry: string | null;
  industryId: number | null;
  competencyIds: number[];
  // 0 означает, что год не указан в оригинальном каталоге.
  year: number;
  description: string | null;
  image: string | null;
  sourceUrl: string;
};

type ProjectRow = {
  slug: string;
  title: string;
  industry: string | null;
  year: number;
  description: string | null;
  image_url: string | null;
  source_url: string;
};

const fromRow = (r: ProjectRow): ProjectPost => ({
  slug: r.slug,
  title: r.title,
  industry: r.industry,
  industryId: industryFilters.find((item) => item.label === r.industry)?.id ?? null,
  competencyIds: [],
  year: r.year,
  description: r.description,
  image: r.image_url,
  sourceUrl: r.source_url,
});

const hasSupabase =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function fetchFromSupabase(): Promise<ProjectPost[]> {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data, error } = await supabase
    .from("projects")
    .select("slug, title, industry, year, description, image_url, source_url")
    .eq("is_published", true)
    .order("year", { ascending: false })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as ProjectRow[]).map(fromRow);
}

/** Все опубликованные проекты (лента лет фильтрует на клиенте). При ошибке БД - снапшот. */
export async function getProjects(): Promise<ProjectPost[]> {
  if (hasSupabase) {
    try {
      const rows = await fetchFromSupabase();
      if (rows.length > 0) return rows;
    } catch (e) {
      console.warn("[projects] Supabase недоступен, отдаю локальный снапшот:", (e as Error).message);
    }
  }
  // Сохраняем порядок оригинального каталога.
  return [...projectsSeed];
}
