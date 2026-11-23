"use client";

import { Reveal } from "./Reveal";
import { useEffect, useRef, useState } from "react";
import { SectionHead } from "./SectionHead";
import type { Review } from "@/lib/company-content";
import home from "../app/home.module.css";
import styles from "./Reviews.module.css";

const reviewsUrl = "/company/reviews/";



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

// Слайдер отзывов: нативный свайп, карточки со scroll-snap, стрелки гаснут в крайних положениях.
export function Reviews({ standalone = false, reviews }: { standalone?: boolean; reviews: Review[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const targetIndex = useRef(0);
  const programmatic = useRef(false);
  const animationFrame = useRef<number | null>(null);
  const dragState = useRef<{ startX: number; startScroll: number; moved: boolean; dir: number } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => () => {
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
  }, []);

  const step = () => {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>(`[data-review-card]`);
    if (!track || !card) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    return card.offsetWidth + gap;
  };

  const measuredIndex = () => {
    const track = trackRef.current;
    const size = step();
    if (!track || !size) return 0;
    return Math.max(0, Math.min(Math.round(track.scrollLeft / size), reviews.length - 1));
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
    const target = Math.max(0, Math.min(targetIndex.current + direction, reviews.length - 1));
    animateTo(target);
  };

  // перетаскивание ленты мышью: тач-устройства работают нативным свайпом
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const track = trackRef.current;
    if (!track) return;
    // Останавливаем незавершённую анимацию перед началом жеста.
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
    animationFrame.current = null;
    programmatic.current = false;
    restoreTrack(track);
    targetIndex.current = measuredIndex();
    dragState.current = { startX: event.clientX, startScroll: track.scrollLeft, moved: false, dir: 0 };
    // захват указателя ставим только после превышения порога движения,
    // иначе обычный клик по ссылке «Оригинал» съедается захватом
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    const track = trackRef.current;
    if (!state || !track) return;
    const delta = event.clientX - state.startX;
    if (!state.moved && Math.abs(delta) > 5) {
      state.moved = true;
      suppressClick.current = true;
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
        ? Math.min(Math.ceil(pos - 0.001), reviews.length - 1)
        : Math.max(Math.floor(pos + 0.001), 0);
    animateTo(target);
  };

  if (standalone) return (
    <section className={`${home.section} ${styles.list}`} aria-label="Отзывы клиентов">
      {reviews.map(review => <article key={review.id} className={styles.fullCard} data-review-id={review.id}>
        <header className={styles.fullHead}>
          {review.logo && <img src={review.logo} alt="" width={88} height={88} loading="lazy" />}
          <div><h2>{review.organization}</h2><p>{review.author}</p><p className={styles.role}>{review.role}</p></div>
        </header>
        <p className={styles.fullText}>{review.text}</p>
        {review.documentUrl && <a className={styles.doc} href={review.documentUrl} target="_blank" rel="noopener noreferrer">Оригинал отзыва ↗</a>}
      </article>)}
    </section>
  );

  return (
    <Reveal as="section" className={`${home.section} ${home.sectionMuted}`} ariaLabel="Отзывы клиентов">
      {!standalone && <SectionHead title="Отзывы клиентов" linkHref={reviewsUrl} linkLabel="Все отзывы" />}
      <div
        ref={trackRef}
        className={styles.track}
        role="region"
        aria-label="Лента отзывов"
        tabIndex={0}
        onScroll={syncIndex}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={(event) => {
          // клик после перетаскивания гасим, чтобы не срабатывала ссылка «Оригинал»
          if (suppressClick.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressClick.current = false;
          }
        }}
      >
        {reviews.map((review, cardIndex) => {
          // лого и скан оригинала с официальной страницы отзывов; без лого - монограмма
          const media = { logo: review.logo, doc: review.documentUrl };
          return (
            <article key={`${review.organization}-${review.author}-${cardIndex}`} className={styles.card} data-review-id={review.id} data-review-card>
              <header className={styles.head}>
                {media?.logo ? (
                  <span className={`${styles.mark} ${styles.markLogo}`}>
                    <img src={media.logo} alt="" width={56} height={56} loading="lazy" draggable={false} />
                  </span>
                ) : (
                  <span className={styles.mark} aria-hidden="true">
                    {review.mark}
                  </span>
                )}
                <h3 className={styles.org}>{review.organization}</h3>
              </header>
              <p className={styles.text}>{review.text}</p>
              <footer className={styles.foot}>
                <div className={styles.who}>
                  <span className={styles.author}>{review.author}</span>
                  <span className={styles.role}>{review.role}</span>
                </div>
                {media?.doc ? (
                  <a
                    className={styles.doc}
                    href={media.doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Оригинал отзыва - ${review.organization}`}
                    draggable={false}
                  >
                    Оригинал
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                ) : null}
              </footer>
            </article>
          );
        })}
      </div>
      <div className={home.partnerControls}>
        <span className={home.partnerPage} aria-live="polite">
          {String(index + 1).padStart(2, "0")} / {String(reviews.length).padStart(2, "0")}
        </span>
        <div className={home.partnerArrows}>
          {/* стрелки всегда на месте: в крайних положениях не пропадают, а гаснут */}
          <button
            type="button"
            className={home.partnerArrow}
            onClick={() => goTo(-1)}
            disabled={index === 0}
            aria-label="Предыдущий отзыв"
          >
            <Arrow direction="left" />
          </button>
          <button
            type="button"
            className={home.partnerArrow}
            onClick={() => goTo(1)}
            disabled={index === reviews.length - 1}
            aria-label="Следующий отзыв"
          >
            <Arrow direction="right" />
          </button>
        </div>
      </div>
    </Reveal>
  );
}
