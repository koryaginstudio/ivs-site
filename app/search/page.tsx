import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getProjects } from "@/lib/projects";
import { getLatestNews } from "@/lib/news";
import { staticEntries, projectEntries, newsEntries, searchEntries } from "@/lib/search";
import s from "../home.module.css";

export const metadata: Metadata = { title: "Поиск по сайту — ИВС-СЕТИ" };

// Порядок групп в выдаче - от главного к второстепенному.
const CATEGORY_ORDER = ["Услуги", "Направления деятельности", "Проекты", "Новости", "Мероприятия", "Страницы"];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const [projects, news] = await Promise.all([getProjects(), getLatestNews(50)]);
  const index = [...staticEntries(), ...projectEntries(projects), ...newsEntries(news)];
  const results = searchEntries(index, query);

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: results.filter((r) => r.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <Header />
      <main className={s.staticPage}>
        <div className={s.staticWrap}>
          <h1 className={s.staticTitle}>Поиск по сайту</h1>

          <form className={s.searchForm} action="/search" method="get" role="search">
            <input
              className={s.searchFormInput}
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Услуга, проект, новость, партнёр…"
              aria-label="Поисковый запрос"
              autoFocus
            />
            <button className={s.searchFormBtn} type="submit">
              Найти
            </button>
          </form>

          {query.length < 2 ? (
            <p className={s.staticLead}>Введите минимум две буквы - найду услуги, проекты, новости и страницы.</p>
          ) : results.length === 0 ? (
            <p className={s.staticLead}>
              По запросу «{query}» ничего не нашлось. Попробуйте короче: «ЦОД», «безопасность», «1С», «сети».
            </p>
          ) : (
            <>
              <p className={s.searchSummary}>
                По запросу «{query}»: {results.length} {plural(results.length)}
              </p>
              {groups.map((g) => (
                <section key={g.category} className={s.searchGroup}>
                  <h2 className={s.searchGroupTitle}>
                    {g.category} <span className={s.searchGroupCount}>{g.items.length}</span>
                  </h2>
                  <ul className={s.searchList}>
                    {g.items.map((r) => (
                      <li key={`${g.category}-${r.href}-${r.title}`}>
                        <a href={r.href} className={s.searchItem}>
                          <span className={s.searchItemTitle}>{r.title}</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function plural(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "результат";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "результата";
  return "результатов";
}
