import { partners, partnersHref } from "@/components/ivs-content";
import { SectionHead } from "./SectionHead";
import { Note } from "./Note";
import s from "../app/home.module.css";

// Партнёры: лента вендоров без коробок — приглушённые, при наведении проявляются.
export function Partners() {
  return (
    <section className={s.section} aria-label="Партнёры">
      <SectionHead
        index="04"
        eyebrow="Партнёры"
        title="Работаем с ведущими вендорами"
        linkHref={partnersHref}
        linkLabel="Все партнёры"
        aside={
          <Note id="note-partners" label="Пометка к блоку партнёров">
            Выборка 12 из 60+ вендоров со страницы «Партнёры» старого сайта, показана текстом. При переносе заменим
            на официальные логотипы — состав и порядок подтвердить у заказчика.
          </Note>
        }
      />
      <ul className={s.partnerGrid}>
        {partners.map((p) => (
          <li key={p} className={s.partnerItem}>
            {p}
          </li>
        ))}
      </ul>
    </section>
  );
}
