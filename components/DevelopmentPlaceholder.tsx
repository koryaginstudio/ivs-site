"use client";
import { useRouter } from "next/navigation";
import styles from "./DevelopmentPlaceholder.module.css";
export function DevelopmentPlaceholder({title}: {title: string}) {
 const router = useRouter();
 return <main className={styles.page}><div className={styles.content}>
  <span className={styles.lock}><svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg></span>
  <p>{title}</p><h1>Находится в разработке</h1>
  <button type="button" onClick={() => window.history.length > 1 ? router.back() : router.push("/")}>← Вернуться назад</button>
 </div></main>;
}
