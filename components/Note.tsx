import s from "../app/home.module.css";

// Наводимая пометка для спорных мест макета: кружок «!», тултип по наведению/фокусу.
// Это dev-элемент: перед показом заказчику пометки снимаются.
export function Note({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <span className={s.noteStatic}>
      <button type="button" className={s.noteBtn} aria-label={label} aria-describedby={id}>
        !
      </button>
      <span role="tooltip" id={id} className={s.noteTip}>
        {children}
      </span>
    </span>
  );
}
