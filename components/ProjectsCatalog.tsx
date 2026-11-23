"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ProjectPost } from "@/lib/projects";
import { competencyFilters, industryFilters } from "@/lib/project-filters";
import card from "../app/home.module.css";
import s from "../app/projects/projects.module.css";

const PAGE_SIZE = 12;

type Filters = {
  industries: string;
  competencies: string;
  year: string;
  page: string;
};

function readFilters(): Filters {
  const params = new URLSearchParams(window.location.search);
  return {
    industries: params.get("industries") ?? "all",
    competencies: params.get("competencies") ?? "all",
    year: params.get("year") ?? "all",
    page: params.get("PAGEN_1") ?? "1",
  };
}

function pluralProjects(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "проект";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "проекта";
  return "проектов";
}

export function ProjectsCatalog({ projects, initialFilters }: { projects: ProjectPost[]; initialFilters: Filters }) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const topRef = useRef<HTMLElement>(null);

  const years = useMemo(
    () => [...new Set(projects.map((project) => project.year).filter((year) => year > 0))].sort((a, b) => b - a),
    [projects],
  );

  const filtered = useMemo(() => projects.filter((project) => {
    if (filters.industries !== "all" && project.industryId !== Number(filters.industries)) return false;
    if (filters.competencies !== "all" && !project.competencyIds.includes(Number(filters.competencies))) return false;
    if (filters.year !== "all" && project.year !== Number(filters.year)) return false;
    return true;
  }), [filters, projects]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requestedPage = Number.parseInt(filters.page, 10);
  const page = Math.min(pageCount, Math.max(1, Number.isFinite(requestedPage) ? requestedPage : 1));
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = filters.industries !== "all" || filters.competencies !== "all" || filters.year !== "all";

  useEffect(() => {
    const onPopState = () => setFilters(readFilters());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const update = (patch: Partial<Filters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    const params = new URLSearchParams();
    if (next.industries !== "all") params.set("industries", next.industries);
    if (next.competencies !== "all") params.set("competencies", next.competencies);
    if (next.year !== "all") params.set("year", next.year);
    if (next.page !== "1") params.set("PAGEN_1", next.page);
    const query = params.toString();
    window.history.pushState(null, "", `/projects/${query ? `?${query}` : ""}`);
  };

  const changeFilter = (key: "industries" | "competencies" | "year", value: string) => {
    update({ [key]: value, page: "1" });
  };

  const reset = () => update({ industries: "all", competencies: "all", year: "all", page: "1" });

  const goToPage = (nextPage: number) => {
    update({ page: String(nextPage) });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    topRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <section className={s.catalog} aria-label="Каталог проектов" ref={topRef}>
      <div className={s.filters}>
        <FilterSelect
          label="Отрасль"
          value={filters.industries}
          onChange={(value) => changeFilter("industries", value)}
          allLabel="Все отрасли"
          options={industryFilters.map((item) => ({ value: String(item.id), label: item.label }))}
        />
        <FilterSelect
          label="Компетенция"
          value={filters.competencies}
          onChange={(value) => changeFilter("competencies", value)}
          allLabel="Все компетенции"
          options={competencyFilters.map((item) => ({ value: String(item.id), label: item.label }))}
        />
        <FilterSelect
          label="Год"
          value={filters.year}
          onChange={(value) => changeFilter("year", value)}
          allLabel="Все годы"
          options={years.map((year) => ({ value: String(year), label: String(year) }))}
        />
      </div>

      <div className={s.resultBar}>
        <p aria-live="polite">Найдено: <strong>{filtered.length}</strong> {pluralProjects(filtered.length)}</p>
        <button type="button" className={s.reset} onClick={reset} disabled={!hasFilters && page === 1}>
          Сбросить фильтры
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {shown.length ? (
        <ul className={s.grid}>
          {shown.map((project) => (
            <li key={project.slug}>
              <a href={"/projects/" + project.slug + "/"} className={`${card.projCard} ${s.card}`}>
                <span className={`${card.projMedia} ${s.media}`}>
                  {project.image ? <img src={project.image} alt="" loading="lazy" /> : null}
                </span>
                <span className={card.projMeta}>
                  {project.industry ? <span className={card.projIndustry}>{project.industry}</span> : <span />}
                  {project.year > 0 ? <span className={card.projYear}>{project.year}</span> : null}
                </span>
                <span className={card.projCardTitle}>{project.title}</span>
                <span className={card.projArrow} aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className={s.empty}>
          <h2>Проекты не найдены</h2>
          <p>Попробуйте изменить сочетание фильтров или посмотреть весь каталог.</p>
          <button type="button" onClick={reset}>Показать все проекты</button>
        </div>
      )}

      {pageCount > 1 ? (
        <nav className={s.pagination} aria-label="Страницы каталога">
          <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 1} aria-label="Предыдущая страница">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="m11 4-5 5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className={s.pageNumbers}>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <button
                type="button"
                key={number}
                className={s.pageNumber}
                data-active={number === page || undefined}
                onClick={() => goToPage(number)}
                aria-label={`Страница ${number}`}
                aria-current={number === page ? "page" : undefined}
              >
                {number}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => goToPage(page + 1)} disabled={page === pageCount} aria-label="Следующая страница">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="m7 4 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </nav>
      ) : null}
    </section>
  );
}

function FilterSelect({ label, value, onChange, allLabel, options }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  options: { value: string; label: string }[];
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const items = [{ value: "all", label: allLabel }, ...options];
  const selected = items.find((item) => item.value === value) ?? items[0];

  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLElement>("[aria-checked=true]")?.focus();
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  function close() {
    trigger.current?.focus();
    setOpen(false);
  }

  return (
    <div className={s.filter} ref={root} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <span className={s.filterLabel} id={id + "-label"}>{label}</span>
      <div className={s.selectWrap}>
        <button type="button" ref={trigger} className={s.filterButton}
          aria-labelledby={id + "-label " + id + "-value"} aria-haspopup="menu" aria-expanded={open}
          onClick={() => setOpen(!open)} onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
            }
          }}>
          <span id={id + "-value"}>{selected.label}</span>
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden="true"><path d="m1 1.5 6 5 6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        {open && (
          <div className={s.filterMenu} role="menu" aria-labelledby={id + "-label"} onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              close();
              return;
            }
            const entries = [...event.currentTarget.querySelectorAll("button")];
            const current = entries.indexOf(document.activeElement as HTMLButtonElement);
            let next = current;
            if (event.key === "Home") next = 0;
            else if (event.key === "End") next = entries.length - 1;
            else if (event.key === "ArrowDown") next = (current + 1) % entries.length;
            else if (event.key === "ArrowUp") next = (current - 1 + entries.length) % entries.length;
            else return;
            event.preventDefault();
            entries[next]?.focus();
          }}>
            {items.map((option) => (
              <button key={option.value} type="button" role="menuitemradio" aria-checked={option.value === selected.value} tabIndex={-1}
                onClick={() => { onChange(option.value); close(); }}>
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
