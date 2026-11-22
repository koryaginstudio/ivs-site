import { Reveal } from "./Reveal";
import { getFeaturedNews, formatNewsDate, kindLabel } from "@/lib/news";
import { newsHref } from "@/components/ivs-content";
import { SectionHead } from "./SectionHead";
import { Note } from "./Note";
import s from "../app/home.module.css";

// Витрина главной: четыре выбранных материала (не просто последние по дате).
const featuredSlugs = [
  "kiberpatrul-v-dele",
  "it-channel-news-opublikoval-novost-i-fotoreportazh-o-mezhregionalnom-tsifrovom-forume",
  "iyunya-nasha-komanda-ivs-prinyala-uchastie-v-ekstremalnom-zabege-stalnoy-kharakter-na-distantsii-5-k",
  "zao-ivs-seti-prinyalo-uchastie-v-blagotvoritelnoy-aktsii-blagotvoritelnogo-fonda-istochnik-nadezhdy",
];

// Новости и мероприятия: данные из слоя lib/news (Supabase, пока - локальный снапшот ivs-corp.ru).
// Карточка с фото 4:3 - фото прикрепляется к материалу при заведении в БД.
export async function News() {
  const items = await getFeaturedNews(featuredSlugs);

  return (
    <Reveal as="section" className={s.section} ariaLabel="Новости и мероприятия">
      <SectionHead
        title="Новости и мероприятия"
        linkHref={newsHref}
        linkLabel="Все новости"
        aside={
          <Note id="note-news" label="Пометка к блоку новостей">
            Реальные материалы из раздела «Новости» ivs-corp.ru, ссылки пока ведут на старый сайт. Лента уже
            подключена к слою данных: как только в .env.local появятся ключи Supabase, карточки пойдут из таблицы
            news - сейчас работает локальный снапшот. Мероприятия с tilda заведём туда же с пометкой «Мероприятие».
          </Note>
        }
      />
      <ul className={s.newsGrid}>
        {items.map((n) => (
          <li key={n.slug}>
            <a href={n.sourceUrl} className={s.newsCard}>
              <span className={s.newsMedia}>
                {n.image ? <img src={n.image} alt="" loading="lazy" /> : null}
              </span>
              <span className={s.newsMeta}>
                <span className={s.newsKind}>{kindLabel[n.kind]}</span>
                <time dateTime={n.publishedAt}>{formatNewsDate(n.publishedAt)}</time>
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
    </Reveal>
  );
}
