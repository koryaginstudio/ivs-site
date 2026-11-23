import { Reveal } from "./Reveal";
import { IndustryCard } from "./IndustryCard";
import { SectionHead } from "./SectionHead";
import s from "../app/home.module.css";
import styles from "./IndustryCards.module.css";

const projects = "/projects/";
const stats = [
  { value: "1400+", label: "крупных ИТ-проектов" },
  { value: "200+", label: "сертифицированных специалистов" },
  { value: "36 лет", label: "на рынке ИТ - с 1990 года" },
];
const industries = [
  { icon: "government", label: "Госсектор", filter: 95 },
  { icon: "oil-gas", label: "Нефть и газ", filter: 96 },
  { icon: "education", label: "Образование", filter: 97 },
  { icon: "logistics", label: "Логистика и транспорт", filter: 98 },
  { icon: "engineering", label: "Машиностроение", filter: 99 },
  { icon: "medicine", label: "Медицина", filter: 100 },
  { icon: "commercial", label: "Коммерческий сектор", filter: 101 },
  { icon: "energy", label: "Энергетика", filter: 102 },
  { icon: "metallurgy", label: "Металлургия", filter: 103 },
  { icon: "forestry", label: "Лесная и целлюлозно-бумажная промышленность", filter: 104 },
  { icon: "chemistry", label: "Химическая промышленность", filter: 105 },
];

export function Cards() {
  return (
    <Reveal as="section" className={s.cards} ariaLabel="Направления деятельности">
      <header className={styles.intro}>
        <SectionHead
          title={<><span className={`${s.titleAccent} ${styles.headingAccent}`}>&gt; 10</span>&nbsp;направлений деятельности</>}
          linkHref={projects}
          linkLabel="Все проекты"
        />
        <div className={styles.introStatement} aria-label="ИВС в цифрах">
          {stats.map(({ value, label }) => (
            <div className={styles.proof} key={value}>
              <strong className={styles.proofValue}>{value}</strong>
              <span className={styles.proofLabel}>{label}</span>
            </div>
          ))}
        </div>
      </header>
      <ul className={s.cardGrid}>
        {industries.map(({ icon, label, filter }) => (
          <li key={icon}>
            <IndustryCard icon={icon} label={label} href={filter ? `${projects}?industries=${filter}` : projects} />
          </li>
        ))}
        {/* красная CTA-карточка закрывает сетку: для клиентов, чьей сферы нет в списке */}
        <li>
          <IndustryCard
            icon="chrome-question"
            label="Не нашли свою сферу?"
            description="Расскажите о задаче - подберём решение"
            href="#contacts"
          />
        </li>
      </ul>
    </Reveal>
  );
}
