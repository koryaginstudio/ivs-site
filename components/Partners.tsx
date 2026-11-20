import { partnerLogos, partnersHref } from "@/components/ivs-content";
import { SectionHead } from "./SectionHead";
import s from "../app/home.module.css";

// Партнёры: официальные логотипы с ivs-corp.ru/company/partners/ — ч/б по умолчанию, цвет при наведении.
export function Partners() {
  return (
    <section className={s.section} aria-label="Партнёры">
      <SectionHead title="Наши партнёры" linkHref={partnersHref} linkLabel="Все партнёры" />
      <ul className={s.partnerGrid}>
        {partnerLogos.map((p) => (
          <li key={p.name} className={s.partnerItem}>
            <img className={s.partnerLogo} src={p.logo} alt={p.name} loading="lazy" />
          </li>
        ))}
      </ul>
    </section>
  );
}
