"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { NewsPost } from "@/lib/news";
import { formatNewsDate, kindLabel, newsItemHref } from "@/lib/news-format";
import s from "@/app/info/news/news.module.css";

function plural(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "публикация";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "публикации";
  return "публикаций";
}

export function NewsArchive({ items }: { items: NewsPost[] }) {
  const years = useMemo(
    () => Array.from(new Set(items.map((item) => item.publishedAt.slice(0, 4)))),
    [items],
  );
  const [year, setYear] = useState("all");
  const [previewSlug, setPreviewSlug] = useState(items[0]?.slug ?? "");
  const [displayedSlug, setDisplayedSlug] = useState(items[0]?.slug ?? "");
  const [previewVisible, setPreviewVisible] = useState(true);

  const filtered = year === "all" ? items : items.filter((item) => item.publishedAt.startsWith(year));
  const selectedPreview = filtered.find((item) => item.slug === previewSlug) ?? filtered[0];
  const preview = filtered.find((item) => item.slug === displayedSlug) ?? filtered[0];

  const selectYear = (nextYear: string) => {
    const nextItems = nextYear === "all" ? items : items.filter((item) => item.publishedAt.startsWith(nextYear));
    setYear(nextYear);
    setPreviewSlug(nextItems[0]?.slug ?? "");
  };

  useEffect(() => {
    const nextSlug = selectedPreview?.slug ?? "";
    if (nextSlug === displayedSlug) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayedSlug(nextSlug);
      setPreviewVisible(true);
      return;
    }

    setPreviewVisible(false);
    const timer = window.setTimeout(() => {
      setDisplayedSlug(nextSlug);
      setPreviewVisible(true);
    }, 140);
    return () => window.clearTimeout(timer);
  }, [selectedPreview?.slug, displayedSlug]);

  return (
    <section className={s.archive} aria-labelledby="news-archive-title">
      <div className={s.archiveHead}>
        <h2 id="news-archive-title" className={s.archiveTitle}>Архив публикаций</h2>
        <p className={s.resultCount} aria-live="polite">
          {filtered.length} {plural(filtered.length)}
        </p>
      </div>

      <div className={s.filters} role="group" aria-label="Фильтр новостей по годам">
        <button type="button" aria-pressed={year === "all"} onClick={() => selectYear("all")}>
          Все года
        </button>
        {years.map((itemYear) => (
          <button
            type="button"
            key={itemYear}
            aria-pressed={year === itemYear}
            onClick={() => selectYear(itemYear)}
          >
            {itemYear}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className={s.empty}>За выбранный год публикаций нет.</p>
      ) : (
        <div className={s.archiveGrid}>
          <ol className={s.newsList}>
            {filtered.map((item, index) => {
              const itemYear = item.publishedAt.slice(0, 4);
              const showYear = index === 0 || filtered[index - 1].publishedAt.slice(0, 4) !== itemYear;
              const active = selectedPreview?.slug === item.slug;
              return (
                <li
                  key={item.slug}
                  className={s.newsRow}
                  data-active={active || undefined}
                  data-year-start={showYear && index > 0 ? true : undefined}
                >
                  <Link
                    href={newsItemHref(item.slug)}
                    className={s.newsRowLink}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse") setPreviewSlug(item.slug);
                    }}
                    onFocus={() => setPreviewSlug(item.slug)}
                  >
                    <span className={s.rowYear} aria-hidden={!showYear}>{showYear ? itemYear : ""}</span>
                    <span className={s.rowContent}>
                      <span className={s.rowTitle}>{item.title}</span>
                      <span className={s.rowMetaMobile}>
                        {kindLabel[item.kind]} · {formatNewsDate(item.publishedAt)}
                      </span>
                    </span>
                    {item.image ? (
                      <span className={s.rowMedia} aria-hidden="true">
                        <img src={item.image} alt="" loading="lazy" />
                      </span>
                    ) : null}
                    <span className={s.rowMeta}>
                      <span>{kindLabel[item.kind]}</span>
                      <time dateTime={item.publishedAt}>{formatNewsDate(item.publishedAt)}</time>
                    </span>
                    <svg className={s.rowArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ol>

          {preview ? (
            <aside className={s.previewPane} aria-label="Превью выбранной публикации" data-switching={!previewVisible || undefined}>
              <Link href={newsItemHref(preview.slug)} className={s.previewLink} tabIndex={-1} aria-hidden="true">
                <span className={s.previewMedia} key={preview.slug}>
                  {preview.image ? <img src={preview.image} alt="" /> : null}
                </span>
                <span className={s.previewCaption}>
                  <span>{formatNewsDate(preview.publishedAt)}</span>
                  <span>Открыть материал</span>
                </span>
              </Link>
            </aside>
          ) : null}
        </div>
      )}
    </section>
  );
}
