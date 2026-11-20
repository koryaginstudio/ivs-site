import { newsItems, newsHref } from "@/components/ivs-content";
import { SectionHead } from "./SectionHead";
import { Note } from "./Note";
import s from "../app/home.module.css";

// Новости и мероприятия: реальные события с iteventpermkrai.tilda.ws.
export function News() {
  return (
    <section className={s.section} aria-label="Новости и мероприятия">
      <SectionHead
        index="05"
        eyebrow="Новости"
        title="Новости и мероприятия"
        linkHref={newsHref}
        linkLabel="Все новости"
        aside={
          <Note id="note-news" label="Пометка к блоку новостей">
            Показаны мероприятия с iteventpermkrai.tilda.ws — их согласовано влить на новый сайт. Новости на старом
            сайте устарели (2021 год), свежие будут заводиться через админку. Уточнить: смешанная лента или отдельные
            блоки «Новости» и «Мероприятия».
          </Note>
        }
      />
      <ul className={s.newsGrid}>
        {newsItems.map((n) => (
          <li key={n.title}>
            <a href={n.href} className={s.newsCard}>
              <span className={s.newsMeta}>
                <span className={s.newsKind}>{n.kind}</span>
                <time>{n.date}</time>
              </span>
              <span className={s.newsTitle}>{n.title}</span>
              <span className={s.newsArrow} aria-hidden="true">
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
