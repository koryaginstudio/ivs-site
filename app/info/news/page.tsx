import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NewsArchive } from "@/components/NewsArchive";
import { formatNewsDate, getLatestNews, kindLabel, newsItemHref } from "@/lib/news";
import s from "./news.module.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Новости — ИВС-СЕТИ",
  description: "Новости, проекты и события компании ИВС-СЕТИ. Архив публикаций с 2021 года.",
};

export default async function NewsPage() {
  const items = await getLatestNews(100);
  const [featured, ...archive] = items;
  const years = items.map((item) => item.publishedAt.slice(0, 4));
  const range = years.length ? `${years[years.length - 1]}–${years[0]}` : "";

  return (
    <>
      <Header />
      <main className={s.newsPage}>
        <nav className={s.breadcrumbs} aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Новости</span>
        </nav>

        <header className={s.pageHead}>
          <h1>Новости</h1>
          <p>{items.length} материалов <span>·</span> {range}</p>
        </header>

        {featured ? (
          <article className={s.featured}>
            <Link href={newsItemHref(featured.slug)} className={s.featuredLink}>
              <span className={s.featuredCopy}>
                <span className={s.meta}>
                  <span>{kindLabel[featured.kind]}</span>
                  <time dateTime={featured.publishedAt}>{formatNewsDate(featured.publishedAt)}</time>
                </span>
                <h2>{featured.title}</h2>
                {featured.excerpt ? <span className={s.featuredExcerpt}>{featured.excerpt}</span> : null}
                <span className={s.readMore}>
                  Читать материал
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
              <span className={s.featuredMedia}>
                {featured.image ? <img src={featured.image} alt="" /> : null}
              </span>
            </Link>
          </article>
        ) : (
          <p className={s.empty}>Публикации скоро появятся.</p>
        )}

        <NewsArchive items={archive} />
      </main>
      <Footer />
    </>
  );
}
