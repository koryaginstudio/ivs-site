import type { NewsKind } from "./news";

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const formatNewsDate = (iso: string) => dateFmt.format(new Date(iso));
export const newsItemHref = (slug: string) => `/info/news/${slug}/`;

export const kindLabel: Record<NewsKind, string> = {
  news: "Новость",
  event: "Мероприятие",
};
