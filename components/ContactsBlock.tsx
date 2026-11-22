import { Reveal } from "./Reveal";
import { contacts } from "@/components/ivs-content";
import s from "../app/home.module.css";

// Контактный блок: без формы (согласовано с заказчиком) — телефон, почта, офисы, переход на страницу контактов.
export function ContactsBlock() {
  return (
    <Reveal as="section" className={s.section} ariaLabel="Контакты">
      <div className={s.contactPanel}>
        <div className={s.contactMain}>
          <h2 className={s.contactTitle}>Как мы можем помочь вашему бизнесу?</h2>
          <p className={s.contactLead}>
            Позвоните или напишите — ответим на вопросы и подберём решение под вашу задачу.
          </p>
          <a href={contacts.phone.href} className={s.contactPhone}>
            {contacts.phone.label}
          </a>
          <a href={`mailto:${contacts.email}`} className={s.contactMail}>
            {contacts.email}
          </a>
          <span className={s.contactAddr}>{contacts.address}</span>
          <a href={contacts.href} className={`${s.btn} ${s.btnPrimary} ${s.contactBtn}`}>
            <span className={s.btnChip}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Все контакты
          </a>
        </div>
        <ul className={s.officeList} aria-label="Офисы">
          {contacts.offices.map((o) => (
            <li key={o.city} className={s.office}>
              <span className={s.officeCity}>{o.city}</span>
              <span className={s.officeDetail}>{o.detail}</span>
              <span className={s.officeLinks}>
                <a href={`tel:${o.tel.replace(/[^+\d]/g, "")}`}>{o.tel}</a>
                <a href={`mailto:${o.mail}`}>{o.mail}</a>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
