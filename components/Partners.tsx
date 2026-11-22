"use client";

import { Reveal } from "./Reveal";
import { useRef, useState } from "react";
import { partnerLogos, partnersHref } from "@/components/ivs-content";
import { SectionHead } from "./SectionHead";
import s from "../app/home.module.css";

const PAGE_SIZE = 15;
const pages = Array.from({ length: Math.ceil(partnerLogos.length / PAGE_SIZE) }, (_, index) =>
  partnerLogos.slice(index * PAGE_SIZE, (index + 1) * PAGE_SIZE),
);

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={direction === "right" ? "M5 12h14m-6-6 6 6-6 6" : "M19 12H5m6-6-6 6 6 6"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Официальные вендоры ИВС: 15 логотипов на экран, нативный свайп и покадровая навигация.
export function Partners() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const goTo = (nextPage: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.max(0, Math.min(nextPage, pages.length - 1));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: target * track.clientWidth, behavior: reducedMotion ? "auto" : "smooth" });
    setPage(target);
  };

  return (
    <Reveal as="section" id="partners" className={`${s.section} ${s.sectionMuted}`} ariaLabel="Партнёры">
      <SectionHead title="Наши партнёры" linkHref={partnersHref} linkLabel="Все партнёры" />
      <div
        ref={trackRef}
        className={s.partnerTrack}
        role="region"
        aria-label="Лента партнёров"
        tabIndex={0}
        onScroll={(event) => {
          const track = event.currentTarget;
          if (track.clientWidth) setPage(Math.round(track.scrollLeft / track.clientWidth));
        }}
      >
        {pages.map((partners, pageIndex) => (
          <ul className={s.partnerGrid} key={pageIndex} aria-label={`Страница ${pageIndex + 1} из ${pages.length}`}>
            {partners.map((partner) => (
              <li key={partner.name} className={s.partnerItem}>
                <img
                  className={partner.compact ? `${s.partnerLogo} ${s.partnerLogoCompact}` : s.partnerLogo}
                  src={partner.logo}
                  alt={partner.name}
                  loading="lazy"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
      <div className={s.partnerControls}>
        <span className={s.partnerPage} aria-live="polite">
          {String(page + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
        </span>
        <div className={s.partnerArrows}>
          {/* стрелки всегда на месте: в крайних положениях не пропадают, а гаснут */}
          <button
            type="button"
            className={s.partnerArrow}
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            aria-label="Предыдущие партнёры"
          >
            <Arrow direction="left" />
          </button>
          <button
            type="button"
            className={s.partnerArrow}
            onClick={() => goTo(page + 1)}
            disabled={page === pages.length - 1}
            aria-label="Следующие партнёры"
          >
            <Arrow direction="right" />
          </button>
        </div>
      </div>
    </Reveal>
  );
}
