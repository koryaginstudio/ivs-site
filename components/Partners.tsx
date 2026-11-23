"use client";

import { Reveal } from "./Reveal";
import { useEffect, useRef, useState } from "react";
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
export function Partners({ standalone = false }: { standalone?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const targetIndex = useRef(0);
  const programmatic = useRef(false);
  const animationFrame = useRef<number | null>(null);
  const dragState = useRef<{ startX: number; startScroll: number; moved: boolean; dir: number } | null>(null);

  useEffect(() => () => {
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
  }, []);

  const step = () => trackRef.current?.clientWidth ?? 0;

  const measuredIndex = () => {
    const track = trackRef.current;
    const size = step();
    if (!track || !size) return 0;
    return Math.max(0, Math.min(Math.round(track.scrollLeft / size), pages.length - 1));
  };

  const restoreTrack = (track: HTMLDivElement) => {
    track.style.scrollSnapType = "";
    track.style.scrollBehavior = "";
  };

  const finishScroll = (target: number) => {
    animationFrame.current = null;
    programmatic.current = false;
    const track = trackRef.current;
    if (track) {
      restoreTrack(track);
      track.removeAttribute("data-dragging");
    }
    targetIndex.current = target;
    setIndex(target);
  };

  const syncIndex = () => {
    if (dragState.current || programmatic.current) return;
    const actual = measuredIndex();
    targetIndex.current = actual;
    setIndex(actual);
  };

  const animateTo = (target: number) => {
    const track = trackRef.current;
    const size = step();
    if (!track || !size) return;
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);

    targetIndex.current = target;
    setIndex(target);
    const start = track.scrollLeft;
    const end = Math.min(target * size, track.scrollWidth - track.clientWidth);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.style.scrollSnapType = "none";
    track.style.scrollBehavior = "auto";

    if (reducedMotion || start === end) {
      track.scrollLeft = end;
      finishScroll(target);
      return;
    }

    programmatic.current = true;
    let startedAt: number | null = null;
    const duration = 420;
    const animate = (now: number) => {
      if (startedAt === null) startedAt = now;
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      track.scrollLeft = start + (end - start) * eased;
      if (progress < 1) animationFrame.current = requestAnimationFrame(animate);
      else finishScroll(target);
    };
    animationFrame.current = requestAnimationFrame(animate);
  };

  const goTo = (direction: number) => {
    const target = Math.max(0, Math.min(targetIndex.current + direction, pages.length - 1));
    animateTo(target);
  };

  // перетаскивание ленты мышью: тач-устройства работают нативным свайпом
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    // Останавливаем незавершённую анимацию перед началом жеста.
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
    animationFrame.current = null;
    programmatic.current = false;
    restoreTrack(track);
    targetIndex.current = measuredIndex();
    dragState.current = { startX: event.clientX, startScroll: track.scrollLeft, moved: false, dir: 0 };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    const track = trackRef.current;
    if (!state || !track) return;
    const delta = event.clientX - state.startX;
    if (!state.moved && Math.abs(delta) > 5) {
      state.moved = true;
      track.setAttribute("data-dragging", "");
      track.style.scrollSnapType = "none";
      track.style.scrollBehavior = "auto";
      try {
        track.setPointerCapture(event.pointerId);
      } catch {
        // синтетические события без активного указателя - drag продолжит работать пока курсор над лентой
      }
    }
    if (state.moved) {
      // запоминаем последнее направление жеста: 1 - вперёд, -1 - назад
      if (delta !== 0) state.dir = delta < 0 ? 1 : -1;
      track.scrollLeft = state.startScroll - delta;
    }
  };

  const onPointerEnd = () => {
    const state = dragState.current;
    const track = trackRef.current;
    if (!state || !track) return;
    dragState.current = null;
    if (!state.moved) {
      track.removeAttribute("data-dragging");
      return;
    }
    // доводка строго в сторону жеста: лента никогда не едет против руки -
    // тянул вперёд, даже чуть-чуть - карточка доставляется, назад - возвращается
    const size = step();
    if (!size) {
      track.removeAttribute("data-dragging");
      restoreTrack(track);
      return;
    }
    const pos = track.scrollLeft / size;
    const target =
      state.dir > 0
        ? Math.min(Math.ceil(pos - 0.001), pages.length - 1)
        : Math.max(Math.floor(pos + 0.001), 0);
    animateTo(target);
  };

  return (
    <Reveal as="section" id="partners" className={`${s.section} ${s.sectionMuted}`} ariaLabel="Партнёры">
      {!standalone && <SectionHead title="Наши партнёры" linkHref={partnersHref} linkLabel="Все партнёры" />}
      <div
        ref={trackRef}
        className={s.partnerTrack}
        role="region"
        aria-label="Лента партнёров"
        tabIndex={0}
        onScroll={syncIndex}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onPointerLeave={onPointerEnd}
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
                  draggable={false}
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
      <div className={s.partnerControls}>
        <span className={s.partnerPage} aria-live="polite">
          {String(index + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
        </span>
        <div className={s.partnerArrows}>
          {/* стрелки всегда на месте: в крайних положениях не пропадают, а гаснут */}
          <button
            type="button"
            className={s.partnerArrow}
            onClick={() => goTo(-1)}
            disabled={index === 0}
            aria-label="Предыдущие партнёры"
          >
            <Arrow direction="left" />
          </button>
          <button
            type="button"
            className={s.partnerArrow}
            onClick={() => goTo(1)}
            disabled={index === pages.length - 1}
            aria-label="Следующие партнёры"
          >
            <Arrow direction="right" />
          </button>
        </div>
      </div>
    </Reveal>
  );
}
