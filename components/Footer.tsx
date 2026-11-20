import { nav, phone, contacts, requisites } from "@/components/ivs-content";
import { Note } from "./Note";
import s from "../app/home.module.css";

// Футер: тёмная подложка (surface-inverse из ДС), разделы и контакты — как на ivs-corp.ru.
export function Footer() {
  const company = nav.find((n) => n.kind === "menu" && n.label === "Компания");
  const services = nav.find((n) => n.kind === "mega");
  const companyItems = company?.kind === "menu" ? company.items : [];
  const serviceGroups = services?.kind === "mega" ? services.groups : [];

  return (
    <footer className={s.footer}>
      <div className={s.footerInner}>
        <div className={s.footerTop}>
          <div className={s.footerBrand}>
            <img src="/ivs-mark-white.svg" alt="ИВС" width={44} height={44} className={s.footerLogo} />
            <span className={s.footerTagline}>Создаём будущее с 1990 года</span>
            <a href={phone.href} className={s.footerPhone}>
              {phone.label}
            </a>
            <a href={`mailto:${contacts.email}`} className={s.footerMail}>
              {contacts.email}
            </a>
            <span className={s.footerAddr}>{contacts.address}</span>
          </div>

          <nav className={s.footerCol} aria-label="Компания">
            <span className={s.footerColTitle}>Компания</span>
            {companyItems.map((i) => (
              <a key={i.label} href={i.href} className={s.footerLink}>
                {i.label}
              </a>
            ))}
          </nav>

          <nav className={s.footerCol} aria-label="Услуги">
            <span className={s.footerColTitle}>Услуги</span>
            {serviceGroups.map((g) => (
              <a key={g.label} href={g.href} className={s.footerLink}>
                {g.label}
              </a>
            ))}
          </nav>

          <nav className={s.footerCol} aria-label="Разделы">
            <span className={s.footerColTitle}>Разделы</span>
            <a href="https://ivs-corp.ru/projects/" className={s.footerLink}>
              Каталог проектов
            </a>
            <a href="https://ivs-corp.ru/info/news/" className={s.footerLink}>
              Новости
            </a>
            <a href="https://iteventpermkrai.tilda.ws/" className={s.footerLink}>
              Мероприятия
            </a>
            <a href="https://ivs-corp.ru/contacts/" className={s.footerLink}>
              Контакты
            </a>
            <a href="https://link-services-ivs.tilda.ws/" className={s.footerLink}>
              Продукты Link для ВКС
            </a>
          </nav>
        </div>

        <div className={s.footerBottom}>
          <span>
            © {new Date().getFullYear()} {requisites.name}
          </span>
          <span>
            ИНН {requisites.inn} · КПП {requisites.kpp}
          </span>
          <a href={requisites.href} className={s.footerLegal}>
            Реквизиты
          </a>
          <span className={s.footerLegalDocs}>
            Политика обработки ПДн · Согласие на обработку ПДн · Сводная ведомость СОУТ
            <Note id="note-legal" label="Пометка к документам в футере">
              На старом сайте это ссылки на PDF-документы. Их адреса подставим при переносе — сейчас показаны текстом,
              чтобы проверить состав.
            </Note>
          </span>
        </div>
      </div>
    </footer>
  );
}
