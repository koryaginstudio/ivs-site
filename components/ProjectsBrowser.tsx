"use client";

import { useMemo, useState } from "react";
import type { ProjectPost } from "@/lib/projects";
import s from "../app/home.module.css";

const PAGE_SIZE = 6;

// Карточки проектов + календарная механика: лента лет со счётчиками под сеткой.
// Фильтрация мгновенная, на клиенте - данные уже загружены сервером из слоя БД.
export function ProjectsBrowser({ projects }: { projects: ProjectPost[] }) {
  const [year, setYear] = useState<number | null>(null);

  // годы по убыванию со счётчиками проектов
  const years = useMemo(() => {
    const map = new Map<number, number>();
    for (const p of projects) map.set(p.year, (map.get(p.year) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [projects]);

  const visible = useMemo(
    () => (year === null ? projects : projects.filter((p) => p.year === year)).slice(0, PAGE_SIZE),
    [projects, year],
  );

  return (
    <>
      <ul className={s.projGrid} key={year ?? "all"}>
        {visible.map((p) => (
          <li key={p.slug}>
            <a href={p.sourceUrl} className={s.projCard}>
              <span className={s.projMedia}>
                {p.image ? <img src={p.image} alt="" loading="lazy" /> : null}
              </span>
              <span className={s.projMeta}>
                {p.industry ? <span className={s.projIndustry}>{p.industry}</span> : null}
                <span className={s.projYear}>{p.year}</span>
              </span>
              <span className={s.projCardTitle}>{p.title}</span>
              {p.description ? <span className={s.projDesc}>{p.description}</span> : null}
              <span className={s.projArrow} aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          </li>
        ))}
      </ul>

      {/* Календарная механика: годы-пилюли со счётчиками вместо select старого сайта */}
      <div className={s.yearRail} role="group" aria-label="Проекты по годам">
        <span className={s.yearRailLabel}>Проекты по годам:</span>
        <button
          type="button"
          className={s.yearChip}
          data-active={year === null || undefined}
          onClick={() => setYear(null)}
        >
          Все годы
          <span className={s.yearCount}>{projects.length}</span>
        </button>
        {years.map(([y, count]) => (
          <button
            key={y}
            type="button"
            className={s.yearChip}
            data-active={year === y || undefined}
            onClick={() => setYear(year === y ? null : y)}
            aria-pressed={year === y}
          >
            {y}
            <span className={s.yearCount}>{count}</span>
          </button>
        ))}
      </div>
    </>
  );
}
