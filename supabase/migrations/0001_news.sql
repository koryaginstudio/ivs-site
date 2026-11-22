-- Таблица новостей и мероприятий. Сейчас - Supabase (Postgres), структура простая,
-- переезд на локальную SQL у заказчика = тот же набор колонок, меняется только клиент в lib/news.ts.

create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  kind text not null default 'news' check (kind in ('news', 'event')),
  published_at date not null,
  image_url text,
  source_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists news_published_idx on news (is_published, published_at desc);

alter table news enable row level security;

-- публичное чтение только опубликованных (anon key)
create policy "news public read" on news
  for select to anon using (is_published = true);

-- наполнение: снапшот раздела «Новости» ivs-corp.ru от 20.11.2026
insert into news (slug, title, kind, published_at, image_url, source_url) values
  ('kiberpatrul-v-dele', '"КИБЕРПАТРУЛЬ" в деле', 'news', '2026-04-20', '/news/news-1.jpg', 'https://ivs-corp.ru/info/news/kiberpatrul-v-dele/'),
  ('s-novym-godom', 'С Новым годом', 'news', '2025-12-30', '/news/news-2.jpg', 'https://ivs-corp.ru/info/news/s-novym-godom/'),
  ('permskiy-kray-perekhodit-na-otechestvennuyu-operatsionnuyu-sistemu-red-os', 'Пермский край переходит на отечественную операционную систему РЕД ОС', 'news', '2025-12-23', '/news/news-3.jpg', 'https://ivs-corp.ru/info/news/permskiy-kray-perekhodit-na-otechestvennuyu-operatsionnuyu-sistemu-red-os/'),
  ('it-channel-news-opublikoval-novost-i-fotoreportazh-o-mezhregionalnom-tsifrovom-forume', 'IT Channel News опубликовал новость и фоторепортаж о Межрегиональном Цифровом Форуме', 'news', '2025-05-14', '/news/news-4.jpg', 'https://ivs-corp.ru/info/news/it-channel-news-opublikoval-novost-i-fotoreportazh-o-mezhregionalnom-tsifrovom-forume/'),
  ('mezhregionalnyy-it-forum-provedut-v-prikame', 'Межрегиональный ИТ-форум проведут в Прикамье', 'news', '2025-03-27', '/news/news-5.jpg', 'https://ivs-corp.ru/info/news/mezhregionalnyy-it-forum-provedut-v-prikame/'),
  ('zao-ivs-seti-v-14-raz-stalo-pobeditelem-reytinga-25-luchshikh-regionalnykh-it-kompaniy-2024-po-mneni', 'ЗАО "ИВС-СЕТИ" в 14 раз стало победителем рейтинга «25 лучших региональных ИТ-компаний 2024» по мнению редакции IT Channel News', 'news', '2024-11-28', '/news/news-6.jpg', 'https://ivs-corp.ru/info/news/zao-ivs-seti-v-14-raz-stalo-pobeditelem-reytinga-25-luchshikh-regionalnykh-it-kompaniy-2024-po-mneni/'),
  ('iyunya-nasha-komanda-ivs-prinyala-uchastie-v-ekstremalnom-zabege-stalnoy-kharakter-na-distantsii-5-k', '1 июня наша команда "ИВС" приняла участие в экстремальном забеге "Стальной характер" на дистанции 5 км.', 'news', '2024-06-03', '/news/news-7.jpg', 'https://ivs-corp.ru/info/news/iyunya-nasha-komanda-ivs-prinyala-uchastie-v-ekstremalnom-zabege-stalnoy-kharakter-na-distantsii-5-k/'),
  ('zao-ivs-seti-prinyalo-uchastie-v-blagotvoritelnoy-aktsii-blagotvoritelnogo-fonda-istochnik-nadezhdy', 'ЗАО "ИВС-СЕТИ" приняло участие в благотворительной акции Благотворительного Фонда "Источник Надежды"', 'news', '2024-06-03', '/news/news-8.jpg', 'https://ivs-corp.ru/info/news/zao-ivs-seti-prinyalo-uchastie-v-blagotvoritelnoy-aktsii-blagotvoritelnogo-fonda-istochnik-nadezhdy/'),
  ('sistemnyy-integrator-zao-ivs-seti-vystupil-ekspertom-na-permskom-forume-noveyshaya-tsifrovaya-sreda', 'Системный интегратор ЗАО «ИВС-СЕТИ» выступил экспертом на Пермском форуме "Новейшая цифровая среда"', 'news', '2023-03-28', '/news/news-9.jpg', 'https://ivs-corp.ru/info/news/sistemnyy-integrator-zao-ivs-seti-vystupil-ekspertom-na-permskom-forume-noveyshaya-tsifrovaya-sreda/'),
  ('institut-informatsionnykh-sistem-prinyal-uchastie-v-itopk-2022', 'Институт информационных систем принял участие в ИТОПК-2022', 'news', '2022-09-19', '/news/news-10.jpg', 'https://ivs-corp.ru/info/news/institut-informatsionnykh-sistem-prinyal-uchastie-v-itopk-2022/'),
  ('sistemnyy-integrator-zao-ivs-seti-obyavlen-aktivnym-partnyerom-za-2021-god-kompaniey-usergate', 'Системный интегратор ЗАО «ИВС-СЕТИ» объявлен Активным партнёром за 2021 год компанией UserGate', 'news', '2022-05-20', '/news/news-11.jpg', 'https://ivs-corp.ru/info/news/sistemnyy-integrator-zao-ivs-seti-obyavlen-aktivnym-partnyerom-za-2021-god-kompaniey-usergate/'),
  ('kompaniya-ivs-voshla-v-reyting-krupneyshikh-postavshchikov-it-resheniy-dlya-gossektora-cnews-analyti', 'Компания ИВС вошла  в рейтинг крупнейших поставщиков ИТ-решений для госсектора CNews Analytics', 'news', '2022-02-03', '/news/news-12.jpg', 'https://ivs-corp.ru/info/news/kompaniya-ivs-voshla-v-reyting-krupneyshikh-postavshchikov-it-resheniy-dlya-gossektora-cnews-analyti/'),
  ('internet-portal-cnews-ru-opublikoval-novost-o-zavershenii-zao-ivs-seti-proekta-po-postroeniyu-tsifro', 'Интернет-портал cnews.ru опубликовал новость о завершении ЗАО «ИВС-Сети» проекта по построению цифровой инфраструктуры на основе решений Cisco в Пермском радиотехническом колледже им. А. С. Попова', 'news', '2021-06-11', '/news/news-13.jpg', 'https://ivs-corp.ru/info/news/internet-portal-cnews-ru-opublikoval-novost-o-zavershenii-zao-ivs-seti-proekta-po-postroeniyu-tsifro/'),
  ('platforma-cisco-hyperflex-vnedrena-v-permskom-radiotekhnicheskom-kolledzhe-im-a-s-popova', 'Платформа Cisco HyperFlex внедрена в Пермском радиотехническом колледже им. А. С. Попова', 'news', '2021-06-11', '/news/news-14.jpg', 'https://ivs-corp.ru/info/news/platforma-cisco-hyperflex-vnedrena-v-permskom-radiotekhnicheskom-kolledzhe-im-a-s-popova/'),
  ('spetsialistami-kompanii-zao-ivs-seti-vnedreno-sertifitsirovannoe-reshenie-po-tsentralizovannoy-antiv', 'Специалистами компании ЗАО «ИВС-СЕТИ» внедрено сертифицированное решение по централизованной антивирусной защите.', 'news', '2021-05-27', '/news/news-15.jpg', 'https://ivs-corp.ru/info/news/spetsialistami-kompanii-zao-ivs-seti-vnedreno-sertifitsirovannoe-reshenie-po-tsentralizovannoy-antiv/'),
  ('zao-ivs-seti-luchshee-energoservisnoe-predpriyatie-zapadnogo-urala-2020', 'ЗАО «ИВС-СЕТИ» – лучшее энергосервисное предприятие Западного Урала 2020', 'news', '2021-04-09', '/news/news-16.png', 'https://ivs-corp.ru/info/news/zao-ivs-seti-luchshee-energoservisnoe-predpriyatie-zapadnogo-urala-2020/'),
  ('vnedrenie-sistemy-videokontrolya-proizvodstvennoy-bezopasnosti-na-azot-ao-okhk-uralkhim-v-bereznikakh', 'Внедрение системы видеоконтроля производственной безопасности на «Азот» АО «ОХК «УРАЛХИМ» в Березниках', 'news', '2021-03-02', '/news/news-17.jpg', 'https://ivs-corp.ru/info/news/vnedrenie-sistemy-videokontrolya-proizvodstvennoy-bezopasnosti-na-azot-ao-okhk-uralkhim-v-bereznikakh/'),
  ('podpisano-trekhstoronnee-soglashenie-o-sotrudnichestve-i-vzaimodeystvii', 'Подписано трехстороннее соглашение о сотрудничестве и взаимодействии', 'news', '2021-02-10', '/news/news-18.jpg', 'https://ivs-corp.ru/info/news/podpisano-trekhstoronnee-soglashenie-o-sotrudnichestve-i-vzaimodeystvii/');
