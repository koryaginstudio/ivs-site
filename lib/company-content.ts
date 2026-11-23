import { cache } from "react";
import reviewSeed from "./reviews-seed.json";
import vacancySeed from "./vacancies-seed.json";

export type Review = { id: string; organization: string; mark: string; author: string; role: string; text: string; logo: string | null; documentUrl: string | null; sortOrder: number };
export type Vacancy = { id: string; title: string; city: string; phone: string; email: string; summary: string[]; sections: {title: string; items: string[]}[]; sortOrder: number };

// Одинаковые записи и поля для главной, разделов компании и будущей админки.
async function published<T>(table: string, fallback: T[]): Promise<T[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const db = createClient(url, key, {auth: {persistSession: false, autoRefreshToken: false}});
      const {data, error} = await db.from(table).select("content").eq("is_published", true).order("sort_order");
      if (error) throw error;
      return (data ?? []).map(row => row.content as T);
    } catch (error) {
      console.warn(`[${table}] Используется локальный снимок`, error instanceof Error ? error.message : error);
    }
  }
  return fallback;
}
export const getReviews = cache(() => published<Review>("reviews", reviewSeed));
export const getVacancies = cache(() => published<Vacancy>("vacancies", vacancySeed));
