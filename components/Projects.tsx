import { featuredProjects, projectsCatalogHref } from "@/components/ivs-content";
import { SectionHead } from "./SectionHead";
import { Note } from "./Note";
import s from "../app/home.module.css";

// Избранные проекты: нумерованный список с разделителями, без карточек-коробок.
export function Projects() {
  return (
    <section className={s.section} aria-label="Проекты">
      <SectionHead
        title="Проекты"
        linkHref={projectsCatalogHref}
        linkLabel="Все проекты"
        aside={
          <Note id="note-projects" label="Пометка к блоку проектов">
            Шесть реальных проектов из каталога ivs-corp.ru, теги выведены из названий. Ссылки пока ведут в общий
            каталог старого сайта — после переноса страниц каждая строка откроет свой кейс.
          </Note>
        }
      />
      <ul className={s.projList}>
        {featuredProjects.map((p, i) => (
          <li key={p.title} className={s.projItem}>
            <a href={p.href} className={s.projRow}>
              <span className={s.projIndex}>{String(i + 1).padStart(2, "0")}</span>
              <span className={s.projTitle}>{p.title}</span>
              <span className={s.projTag}>{p.tag}</span>
              <span className={s.projArrow} aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
