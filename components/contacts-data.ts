export type OfficeService = {
  label: string;
  email: string;
  phone: string;
  phoneHref: string;
};

export type Office = {
  city: string;
  address: string;
  phone: string;
  phoneHref: string;
  emails: string[];
  coordinates: [number, number];
  service?: OfficeService;
};

// Контакты и координаты меток перенесены с https://ivs-corp.ru/contacts/.
export const offices: Office[] = [
  {
    city: "г. Пермь",
    address: "г. Пермь, ул. Тимирязева, 24",
    phone: "+7 (342) 238-52-00",
    phoneHref: "tel:+73422385200",
    emails: ["info@ivs-corp.ru", "sales@ivs-corp.ru"],
    coordinates: [58.004204, 56.266436],
  },
  {
    city: "г. Березники",
    address: "г. Березники, ул. Юбилейная, 46",
    phone: "+7 (3424) 260-409",
    phoneHref: "tel:+73424260409",
    emails: ["berezniki@ivs-corp.ru"],
    coordinates: [59.410601, 56.828826],
    service: {
      label: "Сервисный центр",
      email: "berezniki-service@ivs-corp.ru",
      phone: "+7 (3424) 260-092",
      phoneHref: "tel:+73424260092",
    },
  },
  {
    city: "г. Киров",
    address: "г. Киров, Октябрьский проспект, 104 (БЦ Kirov Project), офис 227/2",
    phone: "+7 (8332) 41-96-03",
    phoneHref: "tel:+78332419603",
    emails: ["kirov@ivs-corp.ru"],
    coordinates: [58.588941, 49.659435],
  },
];
