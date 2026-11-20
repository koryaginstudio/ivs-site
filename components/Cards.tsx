import { directions } from "@/components/ivs-content";
import { SectionHead } from "./SectionHead";
import s from "../app/home.module.css";

// Карточки направлений: слева плейсхолдер 1:1 (под 3D-иконку/фото без фона, добавим позже),
// справа - заголовок со стрелкой в верхнем углу и текст под ним (правка Антона, 20.11).
export function Cards() {
  return (
    <section className={s.cards} aria-label="Направления деятельности">
      <SectionHead
        title="Направления деятельности"
        linkHref="https://ivs-corp.ru/services/"
        linkLabel="Все услуги"
      />
      <ul className={s.cardGrid}>
        {directions.map((d, i) => (
          <li key={d.label} className={s.reveal} style={{ "--i": 4 + i } as React.CSSProperties}>
            <a href={d.href} className={s.card}>
              {/* плейсхолдер 1:1 - сюда ляжет 3D-иконка без фона (object-fit: contain) */}
              <span className={s.cardMedia} aria-hidden="true" />
              <span className={s.cardBody}>
                <span className={s.cardHead}>
                  <span className={s.cardTitle}>{d.label}</span>
                  <span className={s.cardArrow} aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </span>
                <span className={s.cardText}>{d.items.slice(0, 3).join(" · ")}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
