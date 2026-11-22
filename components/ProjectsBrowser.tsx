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

  // Узлы таймлайна: «Все годы» + годы по убыванию. Активный узел ведёт красную заливку линии.
  const nodes = useMemo(
    () => [
      { key: "all" as const, label: "Все годы", value: null as number | null, count: projects.length },
      ...years.map(([y, count]) => ({ key: String(y), label: String(y), value: y as number | null, count })),
    ],
    [years, projects.length],
  );
  const activeIndex = nodes.findIndex((n) => n.value === year);
  const n = nodes.length;
  // узлы равной ширины - центры точек распределены равномерно, линия ложится точно
  const trackInset = `${50 / n}%`;
  const fillWidth = n > 1 && activeIndex > 0 ? `${(activeIndex / (n - 1)) * 100}%` : "0%";

  return (
    <>
      <ul className={s.projGrid} key={year ?? "all"}>
        {visible.map((p, i) => (
          <li key={p.slug} style={{ "--i": i } as React.CSSProperties}>
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

      {/* Календарная механика: таймлайн с точками-узлами и красной заливкой до активного года.
          На mobile лента прокручивается горизонтально, ширина узлов сохраняется. */}
      <div className={s.timelineScroll}>
        <div className={s.timeline} role="group" aria-label="Проекты по годам" style={{ "--n": n } as React.CSSProperties}>
          <span className={s.timelineTrack} aria-hidden="true" style={{ left: trackInset, right: trackInset }}>
            <span className={s.timelineFill} style={{ width: fillWidth }} />
          </span>
          {nodes.map((node) => (
            <button
              key={node.key}
              type="button"
              className={s.timelineNode}
              data-active={year === node.value || undefined}
              onClick={() => setYear(node.value === null || year === node.value ? null : node.value)}
              aria-pressed={year === node.value}
            >
              <span className={s.timelineYear}>{node.label}</span>
              <span className={s.timelineDot} aria-hidden="true" />
              <span className={s.timelineCount}>
                {node.count} {pluralProjects(node.count)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function pluralProjects(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "проект";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "проекта";
  return "проектов";
}
