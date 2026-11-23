import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { YandexOfficesMap } from "@/components/YandexOfficesMap";
import { offices } from "@/components/contacts-data";
import s from "./contacts.module.css";

export const metadata: Metadata = {
  title: "Контакты — ИВС-СЕТИ",
  description: "Контакты центрального офиса ИВС-СЕТИ в Перми и подразделений в Березниках и Кирове.",
};

export default function ContactsPage() {
  const centralOffice = offices[0];

  return (
    <>
      <Header />
      <main className={s.contactsPage}>
        <nav className={s.breadcrumbs} aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Контакты</span>
        </nav>

        <header className={s.pageHead}>
          <h1>Контакты</h1>
        </header>

        <section className={s.central} aria-labelledby="central-office-title">
          <div className={s.centralCopy}>
            <span className={s.eyebrow}>Центральный офис</span>
            <h2 id="central-office-title">Пермь, ул. Тимирязева, 24</h2>

            <dl className={s.contactList}>
              <div>
                <dt>Справочная служба</dt>
                <dd><a href={centralOffice.phoneHref}>{centralOffice.phone}</a></dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd><a href="mailto:sales@ivs-corp.ru">sales@ivs-corp.ru</a></dd>
              </div>
            </dl>

            <a
              className={s.questionLink}
              href="mailto:sales@ivs-corp.ru?subject=%D0%92%D0%BE%D0%BF%D1%80%D0%BE%D1%81%20%D1%81%20%D1%81%D0%B0%D0%B9%D1%82%D0%B0"
            >
              Задать вопрос
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <YandexOfficesMap offices={offices} />
        </section>

        <section className={s.departments} aria-labelledby="departments-title">
          <div className={s.departmentsIntro}>
            <h2 id="departments-title">Наши подразделения</h2>
            <p>
              Наша компания имеет широкую сеть региональных представительств и дилеров.
              Вы можете обратиться в ближайший к Вам офис для получения дополнительных консультаций.
            </p>
          </div>

          <div className={s.officeList}>
            {offices.map((office) => (
              <article className={s.officeRow} key={office.city}>
                <h3>{office.city}</h3>
                <p className={s.officeAddress}>{office.address}</p>
                <div className={s.officeContacts}>
                  <div className={s.officeMainContacts}>
                    {office.emails.map((email) => (
                      <a href={`mailto:${email}`} key={email}>{email}</a>
                    ))}
                    <a className={s.officePhone} href={office.phoneHref}>{office.phone}</a>
                  </div>

                  {office.service ? (
                    <div className={s.service}>
                      <span>{office.service.label}</span>
                      <a href={`mailto:${office.service.email}`}>{office.service.email}</a>
                      <a className={s.officePhone} href={office.service.phoneHref}>{office.service.phone}</a>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
