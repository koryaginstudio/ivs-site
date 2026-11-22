"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ProjectPost } from "@/lib/projects";
import s from "../app/home.module.css";

const PAGE_SIZE = 8;
const FADE_OUT_MS = 180;
const SETTLE_MS = 420;

// Из витрины «Все годы» убраны две карточки: у первой неудачное фото (знак видеонаблюдения),
// у второй нет изображения вовсе. В фильтрах по годам оба проекта по-прежнему показываются.
const SHOWCASE_HIDE = new Set([
  "tekhnicheskoe-perevooruzhenie-sistema-tekhnologicheskogo-videonablyudeniya-na-fabrike-i-proizvodstve",
  "sozdanie-edinogo-pochtovogo-domena-dlya-gosudarstvennykh-i-munitsipalnykh-uchrezhdeniy",
]);

// Карточки проектов + календарная механика: лента лет со счётчиками под сеткой.
// Фильтрация мгновенная, на клиенте - данные уже загружены сервером из слоя БД.
// Смена года идёт в три фазы: старые карточки гаснут, высота сцены плавно
// перетекает к новой, новые карточки каскадно поднимаются - без скачков вёрстки.
export function ProjectsBrowser({ projects }: { projects: ProjectPost[] }) {
  const [year, setYear] = useState<number | null>(null);
  const showcase = useMemo(() => projects.filter((p) => !SHOWCASE_HIDE.has(p.slug)), [projects]);
  const [shown, setShown] = useState(() => projects.filter((p) => !SHOWCASE_HIDE.has(p.slug)).slice(0, PAGE_SIZE));
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const stageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const pinCancel = useRef<(() => void) | null>(null);
  const timers = useRef<number[]>([]);

  // годы по убыванию со счётчиками проектов
  const years = useMemo(() => {
    const map = new Map<number, number>();
    for (const p of projects) map.set(p.year, (map.get(p.year) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [projects]);

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

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  // новые карточки смонтированы - меряем их высоту после коммита DOM
  // и плавно тянем сцену к ней; до этого момента сцена держит старую высоту
  useEffect(() => {
    if (phase !== "in") return;
    const stage = stageRef.current;
    const grid = gridRef.current;
    if (stage && grid) stage.style.height = `${grid.offsetHeight}px`;
  }, [phase, shown]);

  const selectYear = (next: number | null) => {
    const target = next === null || year === next ? null : next;
    setYear(target);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const list = (target === null ? showcase : projects.filter((p) => p.year === target)).slice(0, PAGE_SIZE);
    clearTimers();

    if (reducedMotion) {
      setShown(list);
      setPhase("idle");
      return;
    }

    // пока высота сцены перетекает, держим таймлайн на том же месте экрана -
    // иначе страница «проваливается» под строку лет при сжатии сетки
    pinCancel.current?.();
    const timeline = timelineRef.current;
    let stopPin = () => {};
    if (timeline) {
      const initialTop = timeline.getBoundingClientRect().top;
      const startedAt = performance.now();
      let raf = 0;
      let cancelled = false;
      const cancelOnUserScroll = () => {
        cancelled = true;
      };
      const pin = () => {
        if (!cancelled) {
          const delta = timeline.getBoundingClientRect().top - initialTop;
          if (Math.abs(delta) > 0.5) window.scrollBy({ top: delta, behavior: "instant" });
        }
        if (!cancelled && performance.now() - startedAt < 1200) raf = requestAnimationFrame(pin);
      };
      raf = requestAnimationFrame(pin);
      window.addEventListener("wheel", cancelOnUserScroll, { once: true, passive: true });
      window.addEventListener("touchmove", cancelOnUserScroll, { once: true, passive: true });
      stopPin = () => {
        cancelled = true;
        cancelAnimationFrame(raf);
        window.removeEventListener("wheel", cancelOnUserScroll);
        window.removeEventListener("touchmove", cancelOnUserScroll);
      };
    }
    pinCancel.current = stopPin;

    // фиксируем текущую высоту, чтобы она анимировалась, а не прыгала
    const stage = stageRef.current;
    const grid = gridRef.current;
    if (stage && grid) stage.style.height = `${grid.offsetHeight}px`;

    setPhase("out");
    timers.current.push(
      window.setTimeout(() => {
        setShown(list);
        setPhase("in");
        timers.current.push(
          window.setTimeout(() => {
            // возвращаем auto - сцена снова резиновая под адаптив
            if (stageRef.current) stageRef.current.style.height = "";
            setPhase("idle");
          }, SETTLE_MS),
        );
      }, FADE_OUT_MS),
    );
  };

  return (
    <>
      <div ref={stageRef} className={s.projStage} data-phase={phase}>
        <ul ref={gridRef} className={s.projGrid}>
          {shown.map((p, i) => (
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
      </div>

      {/* Календарная механика: таймлайн с точками-узлами и красной заливкой до активного года.
          На mobile лента прокручивается горизонтально, ширина узлов сохраняется. */}
      <div className={s.timelineScroll} ref={timelineRef}>
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
              onClick={() => selectYear(node.value)}
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
