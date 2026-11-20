-- Таблица проектов (кейсов). Структура универсальная - при переезде на локальную SQL
-- заказчика меняется только клиент в lib/projects.ts.

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  industry text,
  year int not null,
  description text,
  image_url text,
  source_url text,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists projects_published_idx on projects (is_published, year desc);

alter table projects enable row level security;

create policy "projects public read" on projects
  for select to anon using (is_published = true);

-- наполнение: снапшот каталога ivs-corp.ru/projects/ от 20.11.2026
insert into projects (slug, title, industry, year, description, image_url, source_url, sort_order) values
  ('tekhnicheskoe-perevooruzhenie-sistema-tekhnologicheskogo-videonablyudeniya-na-fabrike-i-proizvodstve', 'Техническое перевооружение. Система технологического видеонаблюдения на фабрике и производственном узле размола', 'Химическая промышленность', 2022, 'Техническое перевооружение системы видеонаблюдения за узлами и агрегатами, осуществляющими размол и транспортировку продукции', '/projects/proj-01.jpg', 'https://ivs-corp.ru/projects/tekhnicheskoe-perevooruzhenie-sistema-tekhnologicheskogo-videonablyudeniya-na-fabrike-i-proizvodstve/', 0),
  ('montazh-i-puskonaladochnye-raboty-sistemy-razdeleniya-kholodnogo-i-goryachego-koridorov-i-modernizats', 'Монтаж и пусконаладочные работы системы разделения холодного и горячего коридоров и модернизация системы бесперебойного питания электроснабжения ЦОД', 'Химическая промышленность', 2022, 'Создание холодного коридора в ЦОДе. Установка нового источника бесперебойного питания и отключение уже существующих ИБП', '/projects/proj-02.jpg', 'https://ivs-corp.ru/projects/montazh-i-puskonaladochnye-raboty-sistemy-razdeleniya-kholodnogo-i-goryachego-koridorov-i-modernizats/', 1),
  ('sozdanie-sistemy-bespereboynogo-pitaniya-servernogo-oborudovaniya-energosnabzhayushchey-kompanii-', 'Создание системы бесперебойного питания серверного оборудования энергоснабжающей компании', 'Энергетика', 2023, null, '/projects/proj-03.png', 'https://ivs-corp.ru/projects/sozdanie-sistemy-bespereboynogo-pitaniya-servernogo-oborudovaniya-energosnabzhayushchey-kompanii-/', 2),
  ('postavka-oborudovaniya-obespechivayushchego-elektropitanie-klassa-a-na-predpriyatii-aviatsionnogo-i-', 'Поставка оборудования, обеспечивающего электропитание класса А на предприятии авиационного и промышленного двигателестроения', 'Машиностроение', 2019, '· Организовать выделенное электропитание сетевого оборудования класса А, установленного в коммутационных шкафах от источника бесперебойного питания.', '/projects/proj-04.jpg', 'https://ivs-corp.ru/projects/postavka-oborudovaniya-obespechivayushchego-elektropitanie-klassa-a-na-predpriyatii-aviatsionnogo-i-/', 3),
  ('sistema-telefonnoy-svyazi-na-obektakh-proizvoditelya-kompleksnykh-udobreniy-', 'Система телефонной связи на объектах производителя комплексных удобрений', 'Химическая промышленность', 2023, null, '/projects/proj-05.jpg', 'https://ivs-corp.ru/projects/sistema-telefonnoy-svyazi-na-obektakh-proizvoditelya-kompleksnykh-udobreniy-/', 4),
  ('proektirovanie-i-stroitelstvo-seti-svyazi-na-territorii-krupnogo-promyshlennogo-predpriyatiya-', 'Проектирование и строительство сети связи на территории крупного промышленного предприятия', 'Химическая промышленность', 2023, null, '/projects/proj-06.jpg', 'https://ivs-corp.ru/projects/proektirovanie-i-stroitelstvo-seti-svyazi-na-territorii-krupnogo-promyshlennogo-predpriyatiya-/', 5),
  ('postavka-i-vnedrenie-v-infrastrukturu-otechestvennogo-ngfw-na-krupnom-promyshlennom-predpriyatii', 'Поставка и внедрение в инфраструктуру отечественного NGFW на крупном промышленном предприятии', 'Химическая промышленность', 2023, null, '/projects/proj-07.jpeg', 'https://ivs-corp.ru/projects/postavka-i-vnedrenie-v-infrastrukturu-otechestvennogo-ngfw-na-krupnom-promyshlennom-predpriyatii/', 6),
  ('sozdanie-edinogo-pochtovogo-domena-dlya-gosudarstvennykh-i-munitsipalnykh-uchrezhdeniy', 'Создание единого почтового домена для государственных и муниципальных учреждений', 'Госсектор', 2021, 'Найти альтернативу Microsoft Exchange Server в рамках программы импортозамещения;', null, 'https://ivs-corp.ru/projects/sozdanie-edinogo-pochtovogo-domena-dlya-gosudarstvennykh-i-munitsipalnykh-uchrezhdeniy/', 7),
  ('postavka-i-vnedrenie-sertifitsirovannoy-platformy-virtualizatsii-dlya-organov-gosudarstvennoy-vlasti', 'Поставка и внедрение сертифицированной платформы виртуализации для органов государственной власти', 'Госсектор', 2022, null, '/projects/proj-09.jpg', 'https://ivs-corp.ru/projects/postavka-i-vnedrenie-sertifitsirovannoy-platformy-virtualizatsii-dlya-organov-gosudarstvennoy-vlasti/', 8),
  ('raboty-po-sozdaniyu-sistemy-zashchity-informatsionnoy-sistemy-personalnykh-dannykh-informatsionnaya-', 'Работы по созданию системы защиты информационной системы персональных данных - Информационная система управления землями на территории города Перми', 'Госсектор', 2018, null, '/projects/proj-10.png', 'https://ivs-corp.ru/projects/raboty-po-sozdaniyu-sistemy-zashchity-informatsionnoy-sistemy-personalnykh-dannykh-informatsionnaya-/', 9),
  ('obespechenie-zashchity-konfidentsialnoy-informatsii', 'Обеспечение защиты конфиденциальной информации', 'Госсектор', 2021, null, '/projects/proj-11.png', 'https://ivs-corp.ru/projects/obespechenie-zashchity-konfidentsialnoy-informatsii/', 10),
  ('motazh-slabotochnykh-setey-i-avtomatizatsii-inzhenernykh-sistem-stendovoy-bazy-dlya-ispytaniy-agrega', 'Монтаж слаботочных сетей и автоматизации инженерных систем для машиностроительного предприятия', 'Машиностроение', 2018, 'Выполнить монтаж и пуско-наладку обеспечивающих инженерных систем производственного здания на основании существующего проекта.', '/projects/proj-12.jpeg', 'https://ivs-corp.ru/projects/motazh-slabotochnykh-setey-i-avtomatizatsii-inzhenernykh-sistem-stendovoy-bazy-dlya-ispytaniy-agrega/', 11),
  ('obespechenie-zashchity-personalnykh-dannykh', 'Обеспечение защиты персональных данных', 'Госсектор', 2019, 'Обеспечить защиту персональных данных в информационных системах Организации в соответствии с требованиями 152-ФЗ «О персональных данных»', '/projects/proj-13.jpg', 'https://ivs-corp.ru/projects/obespechenie-zashchity-personalnykh-dannykh/', 12),
  ('tsentralnoe-obsluzhivanie-arm-polzovateley', 'Центральное обслуживание АРМ пользователей', 'Госсектор', 2015, 'Обеспечить функционирование технических средств обработки информации.', '/projects/proj-14.jpg', 'https://ivs-corp.ru/projects/tsentralnoe-obsluzhivanie-arm-polzovateley/', 13),
  ('ogranizatsiya-zashchishchennogo-i-kontroliruemogo-dostupa-k-lokalnym-setevym-resursam', 'Огранизация защищенного и контролируемого доступа к локальным сетевым ресурсам', 'Госсектор', 2019, null, '/projects/proj-15.png', 'https://ivs-corp.ru/projects/ogranizatsiya-zashchishchennogo-i-kontroliruemogo-dostupa-k-lokalnym-setevym-resursam/', 14),
  ('montazh-i-pusko-naladka-oborudovaniya', 'Монтаж и пуско-наладка оборудования', 'Госсектор', 2019, 'Произвести монтаж и пуско-наладку оборудования.', '/projects/proj-16.jpg', 'https://ivs-corp.ru/projects/montazh-i-pusko-naladka-oborudovaniya/', 15),
  ('litsenzii-dlya-oborudovaniya-i-smartnet-cisco-na-pao-permenergosbyt', 'Лицензии для оборудования и Smartnet CISCO на ПАО "Пермэнергосбыт"', 'Энергетика', 2019, null, '/projects/proj-17.jpg', 'https://ivs-corp.ru/projects/litsenzii-dlya-oborudovaniya-i-smartnet-cisco-na-pao-permenergosbyt/', 16),
  ('modernizatsiya-sistemy-ucheta-obrashcheniy-polzovateley', 'Модернизация системы учета обращений пользователей', 'Коммерческий сектор', 2021, 'Обновить ПО службы по централизованному приему всех обращений пользователей.', '/projects/proj-18.jpeg', 'https://ivs-corp.ru/projects/modernizatsiya-sistemy-ucheta-obrashcheniy-polzovateley/', 17),
  ('povysheniya-bystrodeystviya-formirovaniya-otchetov-v-biznes-sisteme-na-baze-1s-predpriyatie-8-0', 'Повышения быстродействия формирования отчетов в бизнес-системе на базе 1С:ПРЕДПРИЯТИЕ 8.0', 'Коммерческий сектор', 2007, 'Повышение быстродействия бизнес - системы 1С: Предприятие 8.0 с настройками дисковой подсистемы сервера СУБД, ОС Windows Server 2003 для сервера СУБД и терминального сервера, а также СУБД SQL Server 2005.', '/projects/proj-19.jpg', 'https://ivs-corp.ru/projects/povysheniya-bystrodeystviya-formirovaniya-otchetov-v-biznes-sisteme-na-baze-1s-predpriyatie-8-0/', 18),
  ('sozdanie-sistemy-ucheta-polzovateley', 'Создание системы учета пользователей', 'Коммерческий сектор', 2013, 'Создать службу по централизованному приему всех обращений пользователей.', '/projects/proj-20.jpg', 'https://ivs-corp.ru/projects/sozdanie-sistemy-ucheta-polzovateley/', 19);
