import { about } from "@/components/ivs-content";
import s from "../app/home.module.css";

// О компании коротко: формулировка из раздела «О компании» ivs-corp.ru, цифры — с главной старого сайта.
export function About() {
  return (
    <section className={s.section} aria-label="О компании">
      <div className={s.aboutPanel}>
        <div>
          <h2 className={s.aboutTitle}>{about.title}</h2>
          <p className={s.aboutText}>{about.text}</p>
          <a href={about.href} className={`${s.btn} ${s.btnSecondary} ${s.aboutBtn}`}>
            <span className={s.btnChip}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Подробнее о компании
          </a>
        </div>
        <ul className={s.aboutNums}>
          {about.numbers.map((n) => (
            <li key={n.label} className={s.aboutNum}>
              <span className={s.aboutNumValue}>{n.value}</span>
              <span className={s.aboutNumLabel}>{n.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
