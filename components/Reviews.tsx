"use client";

import { Reveal } from "./Reveal";
import { useRef, useState } from "react";
import { SectionHead } from "./SectionHead";
import reviewMedia from "./reviews-media.json";
import home from "../app/home.module.css";
import styles from "./Reviews.module.css";

const reviewsUrl = "https://ivs-corp.ru/company/reviews/";

type Review = {
  organization: string;
  mark: string;
  author: string;
  role: string;
  text: string;
};

// Все отзывы с официальной страницы ivs-corp.ru/company/reviews (текст сокращён, смысл сохранён).
const reviews: Review[] = [
  {
    organization: "Пермская ГРЭС",
    mark: "ГРЭС",
    author: "А.Л. Соколов",
    role: "Главный инженер, АО «Интер РАО - Электрогенерация»",
    text: "Модернизация холодильных машин системы кондиционирования БЩУ-1. Рекомендуем ИВС как надёжного партнёра по созданию систем кондиционирования воздуха.",
  },
  {
    organization: "Аппарат Правительства Пермского края",
    mark: "АП",
    author: "В.М. Микрюков",
    role: "Начальник отдела информационных ресурсов",
    text: "Сервис печати с авторизацией пользователей и учётом объёмов по всем сотрудникам аппарата. За время контракта - ни простоев оборудования, ни нарушений условий госконтракта.",
  },
  {
    organization: "Вологдаоблкоммунэнерго",
    mark: "ВКЭ",
    author: "Е.А. Кринкин",
    role: "Заместитель директора ГЭП",
    text: "Проектирование, монтаж и ввод в эксплуатацию корпоративной сети связи, поставка и пуско-наладка системы передачи сигналов противоаварийной автоматики турбин станции.",
  },
  {
    organization: "Газпром бытовые системы",
    mark: "ГБС",
    author: "В.Ю. Кузьминых",
    role: "Начальник отдела ИТ, Чайковский филиал",
    text: "Оборудование учёта продукции по штрихкодам поставлено в полном объёме, а пожелания филиала по потребительским характеристикам - учтены.",
  },
  {
    organization: "ГУ Банка России по Пермскому краю",
    mark: "ЦБ",
    author: "В.С. Галкин",
    role: "И.о. начальника",
    text: "Техническое обслуживание, ремонт и снабжение расходными материалами копировально-множительной техники и МФУ. Качественные материалы, оперативный сервис.",
  },
  {
    organization: "ИНГК-Промтех",
    mark: "ИП",
    author: "Т.М. Бусовикова",
    role: "Коммерческий директор",
    text: "Поставка фальцовщика ROWE VarioFold Compact в полном объёме и в срок, пуско-наладка и обучение персонала работе с техникой.",
  },
  {
    organization: "Лукойл-Информ",
    mark: "ЛИ",
    author: "И.А. Злобин",
    role: "Заместитель управляющего по ИТ, филиал в Перми",
    text: "С 2004 года - проекты по повышению качества и эффективности ИТ-инфраструктуры, включая внедрение системы резервирования и восстановления данных.",
  },
  {
    organization: "Министерство общественной безопасности Пермского края",
    mark: "МОБ",
    author: "В.М. Капищенко",
    role: "Заместитель председателя Правительства",
    text: "83 видеокамеры системы «Безопасный город» на улицах Перми. Высокая организация производства и технический уровень специалистов при монтаже сложного оборудования.",
  },
  {
    organization: "Министерство социального развития Пермского края",
    mark: "МСР",
    author: "П.С. Фокин",
    role: "Заместитель председателя",
    text: "ИТ-инфраструктура для более чем 30 территориальных управлений министерства - выполнено в требуемый срок и в полном объёме по условиям госконтрактов.",
  },
  {
    organization: "Объединенная кабельная компания",
    mark: "ОКК",
    author: "А.П. Бузилов",
    role: "Генеральный директор",
    text: "Расширение телефонной сети предприятия на базе телекоммуникационных серверов AVAYA под управлением Linux Red Hat.",
  },
  {
    organization: "Уралоргсинтез",
    mark: "УОС",
    author: "В.Н. Попсуй",
    role: "Заместитель управляющего директора безопасности",
    text: "Модернизация комплексной системы видеонаблюдения периметра и объектов основной производственной площадки - качественное круглосуточное наблюдение.",
  },
  {
    organization: "Пермский завод «Машиностроитель»",
    mark: "ПМ",
    author: "О.Г. Фофанов",
    role: "Директор по ИТ",
    text: "Реконструкция инженерно-технических средств физической защиты сборочно-комплектовочной базы - качественно и без нарушения графика.",
  },
  {
    organization: "КЧХК «Уралхим»",
    mark: "УХ",
    author: "А.Н. Семенюк",
    role: "Главный инженер филиала, Кирово-Чепецк",
    text: "Системы пожаротушения, пожарной сигнализации, оповещения и управления эвакуацией для отделений компрессии цеха 51.",
  },
  {
    organization: "Пермский пороховой завод",
    mark: "ППЗ",
    author: "Г.А. Бублик",
    role: "Заместитель гендиректора по безопасности и режиму",
    text: "Поставка МФУ Xerox AltaLink B8045 в срок и в полном объёме, настройка техники квалифицированными специалистами.",
  },
  {
    organization: "Пермский пороховой завод",
    mark: "ППЗ",
    author: "А.С. Мальцев",
    role: "Начальник отдела закупки ВМиО",
    text: "Поставка персональных компьютеров, тонких клиентов, моноблоков и ноутбуков в полном объёме и в оговорённые сроки.",
  },
  {
    organization: "НИУ ВШЭ - Пермь",
    mark: "ВШЭ",
    author: "В.А. Матвеев",
    role: "Заместитель директора филиала",
    text: "Длительное сотрудничество: поставка сетевого и серверного оборудования, вычислительной техники и программного обеспечения.",
  },
  {
    organization: "АКБ «Урал ФД»",
    mark: "УФД",
    author: "Д.В. Соромотин",
    role: "Начальник управления сопровождения ИТ",
    text: "17 лет партнёрства в области информационных технологий: техника и услуги, полностью отвечающие требованиям банка.",
  },
  {
    organization: "ПГМА им. Е.А. Вагнера",
    mark: "ПГМА",
    author: "Е.Г. Фурман",
    role: "И.о. ректора, профессор",
    text: "Поставка и развёртывание оборудования EMC - мощный программно-аппаратный комплект для задач образовательного учреждения.",
  },
  {
    organization: "ПермКапиталСтрой",
    mark: "ПКС",
    author: "А.В. Мехоношин",
    role: "Директор",
    text: "Комплекс работ в здании Пермского краевого суда: СКС, кондиционирование, серверные узлы, СКУД, ЛВС, информационная безопасность, телефония.",
  },
  {
    organization: "Пермская ГРЭС",
    mark: "ГРЭС",
    author: "А.Л. Соколов",
    role: "Главный инженер филиала",
    text: "Системы газового пожаротушения серверных зданий: проектно-изыскательские, строительно-монтажные и пуско-наладочные работы под ключ.",
  },
  {
    organization: "Пермэнергосбыт",
    mark: "ПЭС",
    author: "И.В. Шершаков",
    role: "Генеральный директор",
    text: "Перестройка технического помещения в ЦОД со всеми инженерными системами, видеонаблюдением, СКУД и модернизацией ввода электропитания.",
  },
  {
    organization: "Пермская телефонная компания",
    mark: "ПТК",
    author: "П.В. Лисин",
    role: "Генеральный директор",
    text: "Аварийно-восстановительные работы на действующих волоконно-оптических линиях связи Перми - оперативно и в установленные сроки.",
  },
  {
    organization: "Машиностроительное предприятие",
    mark: "МП",
    author: "А.Я. Сушин",
    role: "Заместитель управляющего директора по ИТ",
    text: "Переезд ЦОД менее чем за сутки: более 20 единиц оборудования подготовлены, перевезены, смонтированы и скоммутированы.",
  },
  {
    organization: "Редуктор-ПМ",
    mark: "РПМ",
    author: "А.Я. Сушин",
    role: "Заместитель управляющего директора по ИТ",
    text: "Расширение телефонной сети на серверах S8300D под Linux Red Hat и более трёх лет технического обслуживания сети.",
  },
  {
    organization: "Связьстрой",
    mark: "СС",
    author: "Н.В. Цветков",
    role: "Технический директор",
    text: "Строительство фрагмента сети широкополосного доступа по технологии FTTB в Березниках для «Урал-ТрансТелеКом».",
  },
  {
    organization: "Соликамский магниевый завод",
    mark: "СМЗ",
    author: "А.В. Прокопенко",
    role: "Генеральный директор",
    text: "Поставки вычислительной техники, создание серверных решений, развёртывание сетей любой конфигурации, настройка ПО.",
  },
  {
    organization: "Стратегические бизнес-системы",
    mark: "СБС",
    author: "А.Н. Носков",
    role: "Директор филиала в Перми",
    text: "Строительство волоконно-оптических линий для объектов КЭС-Холдинга на территории Пермского края.",
  },
  {
    organization: "СтройПанельКомплект",
    mark: "СПК",
    author: "А.В. Сыропятов",
    role: "Главный инженер",
    text: "Коммуникационная платформа AVAYA на сервере S8400 и подключение телефонной сети предприятия к сети общего пользования Перми.",
  },
  {
    organization: "Уралкалий",
    mark: "УК",
    author: "А.Н. Тодосиенко",
    role: "Заместитель начальника управления ИТ",
    text: "Проектирование и модернизация СЕС, внедрение систем персональной и групповой работы, обслуживание вычислительной техники - без замечаний и претензий.",
  },
  {
    organization: "Уралкалий",
    mark: "УК",
    author: "А.Н. Тодосиенко",
    role: "Начальник отдела связи центра ИТ",
    text: "Проектирование и строительство ЦОД на территории предприятия в роли генподрядчика - с глубоким анализом потребностей заказчика.",
  },
  {
    organization: "Уралтеханалит",
    mark: "УТА",
    author: "А.Н. Лупский",
    role: "Директор",
    text: "Комплексное обслуживание ИТ-инфраструктуры: поставки вычислительной техники, расходных материалов, запасных частей и оперативный сервис.",
  },
  {
    organization: "Филиал «Азот» ОХК «Уралхим»",
    mark: "АЗОТ",
    author: "А.Г. Щукин",
    role: "Заместитель руководителя службы ИТ, Березники",
    text: "Проектирование и строительство ЦОД филиала - профессионально, ответственно и грамотно организованный процесс работы.",
  },
  {
    organization: "ВНИПИнефть",
    mark: "ВН",
    author: "Заместитель технического директора по ИТ",
    role: "Филиал в Перми",
    text: "Поставка копировального оборудования и МФУ Xerox - за всё время сотрудничества ни одного нарекания к продукции.",
  },
  {
    organization: "ФСБ, войсковая часть 2122",
    mark: "ФСБ",
    author: "В.А. Меркурьев",
    role: "Командир части, полковник, г. Сочи",
    text: "Оборудование пограничных объектов техническими средствами - вклад в надёжную охрану южных рубежей страны.",
  },
  {
    organization: "Уралкалий",
    mark: "УК",
    author: "О.В. Пеньков",
    role: "Начальник управления информационных систем",
    text: "Система юридически значимого электронного документооборота на базе 1С:ERP для Объединённого центра обслуживания - от обследования до обучения пользователей.",
  },
  {
    organization: "Камский кабель",
    mark: "КК",
    author: "В.Е. Молоковских",
    role: "Генеральный директор",
    text: "Автоматизация документооборота на платформе DIRECTUM - повышение эффективности бизнес-процессов компании.",
  },
  {
    organization: "МКУ «Информационные технологии»",
    mark: "МКУ",
    author: "А.Ю. Митрофанов",
    role: "Директор",
    text: "Бесперебойная работа оргтехники, систем бесперебойного питания и периферии в соответствии с SLA - с 2019 года.",
  },
  {
    organization: "Уралкалий",
    mark: "УК",
    author: "А.А. Рюмкин",
    role: "Главный энергетик",
    text: "Регламентное обслуживание и восстановительные работы 28 дизель-генераторных установок разной мощности - с 2021 года.",
  },
];

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
export function Reviews() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const dragState = useRef<{ startX: number; startScroll: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const step = () => {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>(`[data-review-card]`);
    if (!track || !card) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    return card.offsetWidth + gap;
  };

  const syncIndex = () => {
    const track = trackRef.current;
    const size = step();
    if (!track || !size) return;
    setIndex(Math.max(0, Math.min(Math.round(track.scrollLeft / size), reviews.length - 1)));
  };

  const goTo = (nextIndex: number) => {
    const track = trackRef.current;
    const size = step();
    if (!track || !size) return;
    const target = Math.max(0, Math.min(nextIndex, reviews.length - 1));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: target * size, behavior: reducedMotion ? "auto" : "smooth" });
    setIndex(target);
  };

  // перетаскивание ленты мышью: тач-устройства работают нативным свайпом
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const track = trackRef.current;
    if (!track) return;
    dragState.current = { startX: event.clientX, startScroll: track.scrollLeft, moved: false };
    try {
      track.setPointerCapture(event.pointerId);
    } catch {
      // синтетические события без активного указателя - drag продолжит работать пока курсор над лентой
    }
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
    }
    if (state.moved) track.scrollLeft = state.startScroll - delta;
  };

  const onPointerEnd = () => {
    const state = dragState.current;
    const track = trackRef.current;
    if (!state || !track) return;
    dragState.current = null;
    track.removeAttribute("data-dragging");
    if (!state.moved) return;
    // доводим ленту до ближайшей карточки после броска
    const size = step();
    if (!size) return;
    const target = Math.max(0, Math.min(Math.round(track.scrollLeft / size), reviews.length - 1));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: target * size, behavior: reducedMotion ? "auto" : "smooth" });
    setIndex(target);
  };

  return (
    <Reveal as="section" className={`${home.section} ${home.sectionMuted}`} ariaLabel="Отзывы клиентов">
      <SectionHead title="Отзывы клиентов" linkHref={reviewsUrl} linkLabel="Все отзывы" />
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
          const media = reviewMedia[cardIndex] as { logo: string | null; doc: string | null } | undefined;
          return (
            <article key={`${review.organization}-${review.author}-${cardIndex}`} className={styles.card} data-review-card>
              <header className={styles.head}>
                {media?.logo ? (
                  <span className={`${styles.mark} ${styles.markLogo}`}>
                    <img src={media.logo} alt="" width={44} height={44} loading="lazy" draggable={false} />
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
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Предыдущий отзыв"
          >
            <Arrow direction="left" />
          </button>
          <button
            type="button"
            className={home.partnerArrow}
            onClick={() => goTo(index + 1)}
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
