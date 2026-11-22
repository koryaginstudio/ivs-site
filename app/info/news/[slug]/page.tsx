import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { formatNewsDate, getLatestNews, getNewsBySlug, kindLabel, newsItemHref } from "@/lib/news";
import s from "../news.module.css";

export const revalidate = 300;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const items = await getLatestNews(100);
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return { title: "Новость не найдена — ИВС-СЕТИ" };
  return {
    title: `${article.title} — ИВС-СЕТИ`,
    description: article.excerpt || article.title,
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [article, items] = await Promise.all([getNewsBySlug(slug), getLatestNews(100)]);
  if (!article) notFound();

  const index = items.findIndex((item) => item.slug === article.slug);
  const newer = index > 0 ? items[index - 1] : null;
  const older = index >= 0 && index < items.length - 1 ? items[index + 1] : null;

  return (
    <>
      <Header />
      <main className={s.articlePage}>
        <nav className={s.breadcrumbs} aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <span aria-hidden="true">/</span>
          <Link href="/info/news/">Новости</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Материал</span>
        </nav>

        <article>
          <header className={s.articleHead}>
            <div className={s.meta}>
              <span>{kindLabel[article.kind]}</span>
              <time dateTime={article.publishedAt}>{formatNewsDate(article.publishedAt)}</time>
            </div>
            <h1>{article.title}</h1>
          </header>

          {article.image ? (
            <figure className={s.articleHero}>
              <img src={article.image} alt={article.title} />
            </figure>
          ) : null}

          <div className={s.articleLayout}>
            <div className={s.articleBody} dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
            <aside className={s.articleAside}>
              <Link href="/info/news/" className={s.backLink}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Все новости
              </Link>
              {article.sourceUrl ? (
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className={s.sourceLink}>
                  Оригинал на ivs-corp.ru
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </aside>
          </div>
        </article>

        {newer || older ? (
          <nav className={s.articleNav} aria-label="Соседние публикации">
            {newer ? (
              <Link href={newsItemHref(newer.slug)} className={s.articleNavLink}>
                <span>Предыдущий материал</span>
                <strong>{newer.title}</strong>
              </Link>
            ) : <span />}
            {older ? (
              <Link href={newsItemHref(older.slug)} className={`${s.articleNavLink} ${s.articleNavNext}`}>
                <span>Следующий материал</span>
                <strong>{older.title}</strong>
              </Link>
            ) : null}
          </nav>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
