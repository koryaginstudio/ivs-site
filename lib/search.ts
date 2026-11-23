import { nav, directions } from "@/components/ivs-content";
import type { ProjectPost } from "./projects";
import type { NewsPost } from "./news";
import { newsItemHref } from "./news-format";

// ================= Поиск по сайту =================
// Индекс собирается из того же контента, что виден на сайте: меню и страницы,
// 8 направлений и 30 подуслуг, отраслевые направления, проекты и материалы.
// Внутренних страниц пока нет - ссылки ведут туда же, куда и карточки (ivs-corp.ru).

export type SearchEntry = {
  title: string;
  category: string;
  href: string;
  text?: string;
};

/** Страницы, услуги и направления - статичный контент из ivs-content. */
export function staticEntries(): SearchEntry[] {
  const entries: SearchEntry[] = [];
  for (const item of nav) {
    if (item.kind === "link") {
      entries.push({ title: item.label, category: "Страницы", href: item.href });
      continue;
    }
    if (item.kind === "menu") {
      entries.push({ title: item.label, category: "Страницы", href: item.href });
      for (const l of item.items) {
        entries.push({ title: l.label, category: "Страницы", href: l.href, text: item.label });
      }
      continue;
    }
    for (const g of item.groups) {
      entries.push({ title: g.label, category: "Услуги", href: g.href });
      for (const l of g.items) {
        entries.push({ title: l.label, category: "Услуги", href: l.href, text: g.label });
      }
    }
  }
  for (const d of directions) {
    entries.push({
      title: d.label,
      category: "Направления деятельности",
      href: d.href,
      text: d.items.join(" "),
    });
  }
  return entries;
}

export function projectEntries(projects: ProjectPost[]): SearchEntry[] {
  return projects.map((p) => ({
    title: p.title,
    category: "Проекты",
    href: p.sourceUrl,
    text: [p.industry, p.description, p.year > 0 ? String(p.year) : null].filter(Boolean).join(" "),
  }));
}

export function newsEntries(news: NewsPost[]): SearchEntry[] {
  return news.map((n) => ({
    title: n.title,
    category: n.kind === "event" ? "Мероприятия" : "Новости",
    href: newsItemHref(n.slug),
    text: n.excerpt,
  }));
}

/** Простое ранжирование: все слова запроса должны найтись, совпадение в заголовке весомее. */
export function searchEntries(entries: SearchEntry[], query: string): SearchEntry[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0 || query.trim().length < 2) return [];

  const scored: { score: number; entry: SearchEntry }[] = [];
  for (const entry of entries) {
    const title = entry.title.toLowerCase();
    const text = (entry.text ?? "").toLowerCase();
    let score = 0;
    let matched = true;
    for (const token of tokens) {
      if (title.startsWith(token)) score += 4;
      else if (title.includes(token)) score += 2;
      else if (text.includes(token)) score += 1;
      else {
        matched = false;
        break;
      }
    }
    if (matched) scored.push({ score, entry });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.entry);
}
