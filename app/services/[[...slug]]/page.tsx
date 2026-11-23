import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { nav, contacts } from "@/components/ivs-content";
import { DIRECTION_ICONS, SERVICE_GROUP_ICONS } from "@/components/direction-icons";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactsBlock } from "@/components/ContactsBlock";
import { getProjects } from "@/lib/projects";
import serviceProjects from "@/lib/service-projects.json";
import styles from "./services.module.css";

export const revalidate = 300;
const serviceNav = nav.find(item => item.kind === "mega" && item.label === "Услуги");
const groups = serviceNav?.kind === "mega" ? serviceNav.groups : [];
type Props = {params: Promise<{slug?: string[]}>};
function resolve(slug?: string[]) {
 const href = "/services/" + (slug?.length ? slug.join("/") + "/" : "");
 const group = groups.find(group => href === group.href || group.items.some(item => item.href === href));
 const item = group?.items.find(item => item.href === href);
 return {href, group, item, title: item?.label ?? group?.label ?? "Услуги"};
}
export function generateStaticParams() {
 return [{slug: []}, ...groups.flatMap(group => [group, ...group.items].map(item => ({slug: item.href.split("/").filter(Boolean).slice(1)})))];
}
export async function generateMetadata({params}: Props): Promise<Metadata> {
 return {title: resolve((await params).slug).title + " - ИВС-СЕТИ"};
}
export default async function ServicePage({params}: Props) {
 const slug = (await params).slug;
 const {href, group, item, title} = resolve(slug);
 if (slug?.length && !group) notFound();
 const mapping = serviceProjects as Record<string, string[]>;
 const selectedSlugs = item ? mapping[href] ?? [] : group ? group.items.flatMap(item => mapping[item.href] ?? []) : [];
 const selected = new Set(selectedSlugs);
 const projects = item || group ? (await getProjects()).filter(project => selected.has(project.slug)) : [];
 const orderHref = `mailto:${contacts.email}?subject=${encodeURIComponent("Заявка на услугу «"+title+"»")}`;
 return <><Header /><main className={styles.page}>
  <nav className={styles.breadcrumbs} aria-label="Хлебные крошки"><Link href="/">Главная</Link><span>/</span>{group ? <Link href="/services/">Услуги</Link> : <span>Услуги</span>}{group && <><span>/</span>{item ? <Link href={group.href}>{group.label}</Link> : <span>{group.label}</span>}</>}{item && <><span>/</span><span aria-current="page">{item.label}</span></>}</nav>
  <h1>{title}</h1>
  {!group ? <div className={styles.directions}>{groups.map((group,index) => <article key={group.href}><span className={styles.icon}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{DIRECTION_ICONS[SERVICE_GROUP_ICONS[index]]}</svg></span><h2><Link href={group.href}>{group.label}</Link></h2><ul>{group.items.map(item => <li key={item.href}><Link href={item.href}>{item.label} ↗︎</Link></li>)}</ul></article>)}</div> : <>
   {!item && <ul className={styles.subtypes}>{group.items.map(item => <li key={item.href}><Link href={item.href}>{item.label}<span aria-hidden="true">↗︎</span></Link></li>)}</ul>}
   <div className={styles.layout}>
    <aside className={styles.question}><span className={styles.icon} aria-hidden="true"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="m8 10 3 3 5-5"/></svg></span><h2>Наши специалисты ответят на любой интересующий вопрос по услуге</h2><a href="#contacts" className={styles.outline}>Задать вопрос</a></aside>
    <div className={styles.content}>
     <section className={styles.order} aria-label="Заказать услугу"><p>Оформите заявку на услугу, мы свяжемся с вами в ближайшее время и ответим на все интересующие вопросы.</p><a href={orderHref} className={styles.button}>Заказать услугу ↗︎</a></section>
     <section aria-label="Реализованные проекты"><h2>Реализованные проекты</h2>{projects.length ? <div className={styles.projects}>{projects.map(project => <Link key={project.slug} href={`/projects/${project.slug}/`} className={styles.project}>{project.image && <img src={project.image} alt="" loading="lazy" />}<h3>{project.title}</h3></Link>)}</div> : <p className={styles.empty}>Кейсы по этому направлению пока не опубликованы. Свяжитесь с нами, чтобы обсудить вашу задачу.</p>}</section>
     <Link href={item ? group.href : "/services/"} className={styles.back}>← Назад к списку</Link>
    </div>
   </div>
  </>}
 </main><ContactsBlock title="Наши специалисты ответят на ваши вопросы" /><Footer /></>;
}
