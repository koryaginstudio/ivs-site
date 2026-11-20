import { nav, phone, contacts, requisites } from "@/components/ivs-content";
import s from "../app/home.module.css";

// Футер: тёмная подложка (surface-inverse из ДС), разделы и контакты — как на ivs-corp.ru.
// Документы — заглушки без ссылок (правка Антона, 20.11): адреса PDF подставим при переносе.
const legalDocs = [
  "Политика обработки персональных данных",
  "Согласие на обработку персональных данных",
  "Использование cookie",
  "Реквизиты компании",
  "Сведения о СОУТ",
];

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

          <div className={s.footerCol} aria-label="Документы">
            <span className={s.footerColTitle}>Документы</span>
            {legalDocs.map((d) => (
              <span key={d} className={s.footerLink} data-stub="" title="Ссылка появится при переносе документов">
                {d}
              </span>
            ))}
          </div>
        </div>

        <div className={s.footerBottom}>
          {/* год обновляется автоматически, диапазон — от основания компании (1990) */}
          <span>
            © 1990–{new Date().getFullYear()} {requisites.name}
          </span>
          <span>
            ИНН {requisites.inn} · КПП {requisites.kpp}
          </span>
        </div>
      </div>
    </footer>
  );
}
