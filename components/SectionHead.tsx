import s from "../app/home.module.css";

// Шапка секции: один заголовок (без надзаголовков — правило Антона) и ссылка-переход справа.
export function SectionHead({
  title,
  linkHref,
  linkLabel,
  aside,
}: {
  title: string;
  linkHref?: string;
  linkLabel?: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className={s.head}>
      <h2 className={s.headTitle}>
        {title}
        {aside}
      </h2>
      {linkHref && linkLabel ? (
        <a href={linkHref} className={s.headLink}>
          {linkLabel}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      ) : null}
    </div>
  );
}
