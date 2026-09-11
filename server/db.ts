import fs from 'fs';
import path from 'path';
import {
  ScheduleItem,
  District,
  SportsVenue,
  NewsItem,
  MediaItem,
  ImportHistoryItem,
  PortalStats,
  SportEventItem,
  ParticipantRegistration
} from '../src/types/index.ts';
import { INITIAL_EVENTS, INITIAL_REGISTRATIONS } from '../src/data/initialData.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const SNAPSHOTS_DIR = path.join(DATA_DIR, 'snapshots');

export interface DatabaseSchema {
  schedules: ScheduleItem[];
  events: SportEventItem[];
  registrations: ParticipantRegistration[];
  districts: District[];
  locations: SportsVenue[];
  news: NewsItem[];
  media: MediaItem[];
  importHistory: ImportHistoryItem[];
  settings: Record<string, any>;
}

// Initial seed data for Novosibirsk sports portal
export const INITIAL_DISTRICTS: District[] = [
  {
    id: 'dist-1',
    name: 'Центральный',
    slug: 'centralnyj',
    classesCount: 34,
    venuesCount: 8,
    description: 'Сердце спортивной жизни города: стадион «Спартак», Центральный парк и спортивные залы.',
    photo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    centerCoordinates: [55.0302, 82.9204],
    keyVenues: ['Стадион «Спартак»', 'Театральный сквер', 'Центральный парк']
  },
  {
    id: 'dist-2',
    name: 'Железнодорожный',
    slug: 'zheleznodorozhnyj',
    classesCount: 22,
    venuesCount: 5,
    description: 'Спортивные комплексы около Вокзала-Главного, залы единоборств и фитнес-центры.',
    photo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    centerCoordinates: [55.0355, 82.8988],
    keyVenues: ['СК «Локомотив»', 'Парк «Березовая роща» (запад)', 'ФОК Железнодорожник']
  },
  {
    id: 'dist-3',
    name: 'Заельцовский',
    slug: 'zaeltsovskij',
    classesCount: 28,
    venuesCount: 6,
    description: 'Экологический оазис спорта: Заельцовский бор, лыжные базы, велодорожки и роллерные трассы.',
    photo: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    centerCoordinates: [55.0612, 82.8833],
    keyVenues: ['ПКиО «Заельцовский»', 'База «Локомотив»', 'СК «Север»']
  },
  {
    id: 'dist-4',
    name: 'Октябрьский',
    slug: 'oktyabrskij',
    classesCount: 31,
    venuesCount: 7,
    description: 'Спортивные площадки Михайловской набережной, бассейны и студенческие спорткомплексы Сибстрин и РАНХиГС.',
    photo: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    centerCoordinates: [55.0189, 82.9556],
    keyVenues: ['Михайловская набережная', 'Бассейн СКА', 'Спорткомплекс «Олимпик»']
  },
  {
    id: 'dist-5',
    name: 'Дзержинский',
    slug: 'dzerzhinskij',
    classesCount: 21,
    venuesCount: 5,
    description: 'Парк «Березовая роща», спортзалы авиастроителей, секции бокса и настольного тенниса.',
    photo: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80',
    centerCoordinates: [55.0489, 82.9789],
    keyVenues: ['Парк «Березовая роща»', 'Стадион «Чкаловец»', 'Спортзал «Заря-Восток»']
  },
  {
    id: 'dist-6',
    name: 'Кировский',
    slug: 'kirovskij',
    classesCount: 26,
    venuesCount: 6,
    description: 'Скейт-парки, волейбольные центры, арены на левом берегу и площадки парка «Бугринская роща».',
    photo: 'https://images.unsplash.com/photo-1547919307-1ecb10702e6f?auto=format&fit=crop&w=800&q=80',
    centerCoordinates: [54.9654, 82.9345],
    keyVenues: ['Парк «Бугринская роща»', 'СК «Фламинго»', 'Ледовая арена «Кировец»']
  },
  {
    id: 'dist-7',
    name: 'Калининский',
    slug: 'kalininskij',
    classesCount: 25,
    venuesCount: 6,
    description: 'Легендарный бассейн «Нептун», ЛДС «Сибирь», спортивный комплекс «Электрон» и сосновый бор.',
    photo: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    centerCoordinates: [55.0833, 82.9500],
    keyVenues: ['Бассейн «Нептун»', 'ЛДС «Сибирь»', 'Парк «Сосновый бор»']
  },
  {
    id: 'dist-8',
    name: 'Ленинский',
    slug: 'leninskij',
    classesCount: 38,
    venuesCount: 9,
    description: 'Грандиозная «Сибирь-Арена», Дворец спорта «Заря», Сквер Славы и пляжные зоны Юго-Западного жилмассива.',
    photo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    centerCoordinates: [54.9833, 82.8667],
    keyVenues: ['ЛДС «Сибирь-Арена»', 'ЦСП «Заря»', 'Сквер Славы (воркаут)', 'Монумент Славы']
  },
  {
    id: 'dist-9',
    name: 'Первомайский',
    slug: 'pervomajskij',
    classesCount: 19,
    venuesCount: 4,
    description: 'Спортивные секции для всей семьи, лыжные трассы, стадион «Локомотив» и лесные маршруты.',
    photo: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80',
    centerCoordinates: [54.9500, 83.0667],
    keyVenues: ['Стадион «Локомотив» (Первомайский)', 'ПКиО «Первомайский»', 'СК «Молодость»']
  },
  {
    id: 'dist-10',
    name: 'Советский',
    slug: 'sovetskij',
    classesCount: 32,
    venuesCount: 7,
    description: 'Академгородок, Обское водохранилище, парусный спорт, легкоатлетические трассы НГУ и пляжный волейбол.',
    photo: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    centerCoordinates: [54.8500, 83.1000],
    keyVenues: ['Стадион НГУ', 'Пляж «Звезда» (Волейбол)', 'Спорткомплекс «Энергия»', 'Морской проспект']
  }
];

export const INITIAL_LOCATIONS: SportsVenue[] = [
  {
    id: 'loc-1',
    name: 'Стадион «Спартак»',
    district: 'Центральный',
    address: 'ул. Мичурина, 10',
    coordinates: [55.0354, 82.9238],
    photo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    sports: ['Футбол', 'Легкая атлетика', 'Воркаут'],
    type: 'stadium',
    phone: '+7 (383) 217-10-85',
    workingHours: '07:00 - 22:00'
  },
  {
    id: 'loc-2',
    name: 'Театральный сквер (у НОВАТа)',
    district: 'Центральный',
    address: 'Красный проспект, 36',
    coordinates: [55.0304, 82.9248],
    photo: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    sports: ['Йога', 'Зарядка', 'Скандинавская ходьба'],
    type: 'park',
    phone: '+7 (383) 222-33-44',
    workingHours: 'Круглосуточно'
  },
  {
    id: 'loc-3',
    name: 'Центральный парк Новосибирска',
    district: 'Центральный',
    address: 'ул. Мичурина, 8',
    coordinates: [55.0380, 82.9280],
    photo: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    sports: ['ОФП', 'Бег', 'Йога', 'Шахматы'],
    type: 'park',
    phone: '+7 (383) 224-61-04',
    workingHours: '06:00 - 23:00'
  },
  {
    id: 'loc-4',
    name: 'ЛДС «Сибирь-Арена»',
    district: 'Ленинский',
    address: 'ул. Немировича-Данченко, 160',
    coordinates: [54.9961, 82.9150],
    photo: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    sports: ['Хоккей', 'Фигурное катание', 'ОФП'],
    type: 'arena',
    phone: '+7 (383) 388-77-54',
    workingHours: '08:00 - 23:00'
  },
  {
    id: 'loc-5',
    name: 'Михайловская набережная',
    district: 'Октябрьский',
    address: 'ул. Большевистская, 12б',
    coordinates: [55.0112, 82.9467],
    photo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    sports: ['Бег', 'Воркаут', 'Йога', 'Ролики/Велосипед'],
    type: 'park',
    phone: '+7 (383) 304-80-00',
    workingHours: 'Круглосуточно'
  },
  {
    id: 'loc-6',
    name: 'Бассейн «Нептун»',
    district: 'Калининский',
    address: 'ул. Богдана Хмельницкого, 25',
    coordinates: [55.0768, 82.9492],
    photo: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80',
    sports: ['Плавание', 'Аквааэробика', 'Водное поло'],
    type: 'pool',
    phone: '+7 (383) 276-34-60',
    workingHours: '07:00 - 22:00'
  },
  {
    id: 'loc-7',
    name: 'Парк культуры «Бугринская роща»',
    district: 'Кировский',
    address: 'ул. Саввы Кожевникова, 39',
    coordinates: [54.9680, 82.9450],
    photo: 'https://images.unsplash.com/photo-1547919307-1ecb10702e6f?auto=format&fit=crop&w=800&q=80',
    sports: ['Волейбол', 'Воркаут', 'Скандинавская ходьба'],
    type: 'park',
    phone: '+7 (383) 317-21-44',
    workingHours: '06:00 - 23:00'
  },
  {
    id: 'loc-8',
    name: 'ПКиО «Заельцовский»',
    district: 'Заельцовский',
    address: 'ул. Парковая, 88',
    coordinates: [55.0680, 82.8550],
    photo: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
    sports: ['Бег', 'Велоспорт', 'ОФП', 'Лыжероллеры'],
    type: 'park',
    phone: '+7 (383) 229-57-99',
    workingHours: '07:00 - 22:00'
  },
  {
    id: 'loc-9',
    name: 'Спортивный пляж «Звезда»',
    district: 'Советский',
    address: 'Бердский тупик, 9',
    coordinates: [54.8520, 83.0560],
    photo: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
    sports: ['Волейбол', 'Пляжный футбол', 'Сапсерфинг'],
    type: 'outdoor_ground',
    phone: '+7 (383) 263-36-22',
    workingHours: '08:00 - 22:00'
  },
  {
    id: 'loc-10',
    name: 'Стадион НГУ',
    district: 'Советский',
    address: 'ул. Пирогова, 12',
    coordinates: [54.8432, 83.0965],
    photo: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80',
    sports: ['Футбол', 'Легкая атлетика', 'Баскетбол'],
    type: 'stadium',
    phone: '+7 (383) 363-41-41',
    workingHours: '07:00 - 22:00'
  }
];

export const INITIAL_SCHEDULES: ScheduleItem[] = [
  {
    id: 'sch-1',
    title: 'Утренняя хатха-йога для бодрости',
    sport: 'Йога',
    district: 'Центральный',
    location: 'Театральный сквер (у НОВАТа)',
    address: 'Красный проспект, 36',
    instructor: 'Иванова Е.А.',
    instructorPhone: '+7 (913) 456-78-90',
    date: '2026-09-08',
    dayOfWeek: 'ВТ',
    time: '08:30',
    durationMinutes: 60,
    ageGroup: '18+',
    targetCategory: 'Взрослые',
    format: 'outdoor',
    photo: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    capacity: 25,
    enrolled: 18,
    description: 'Мягкий комплекс асан, дыхательные практики и суставная гимнастика на свежем воздухе. Подходит для любого уровня подготовки.',
    requirements: 'Коврик для йоги, удобная спортивная форма по погоде, бутылка воды.',
    price: 'Бесплатно'
  },
  {
    id: 'sch-2',
    title: 'Городская зарядка «Бодрое утро 54»',
    sport: 'Зарядка',
    district: 'Центральный',
    location: 'Центральный парк Новосибирска',
    address: 'ул. Мичурина, 8',
    instructor: 'Смирнов М.В.',
    instructorPhone: '+7 (913) 987-65-43',
    date: '2026-09-09',
    dayOfWeek: 'СР',
    time: '08:30',
    durationMinutes: 45,
    ageGroup: 'Все возраста',
    targetCategory: 'Все',
    format: 'outdoor',
    photo: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    capacity: 40,
    enrolled: 32,
    description: 'Энергичная разминка для всех жителей города под ритмичную музыку. Заряд позитива на весь рабочий день!',
    requirements: 'Удобная обувь и одежда.',
    price: 'Бесплатно'
  },
  {
    id: 'sch-3',
    title: 'Скандинавская ходьба с техникой шага',
    sport: 'Скандинавская ходьба',
    district: 'Заельцовский',
    location: 'ПКиО «Заельцовский»',
    address: 'ул. Парковая, 88',
    instructor: 'Ковалева Н.Д.',
    instructorPhone: '+7 (923) 111-22-33',
    date: '2026-09-08',
    dayOfWeek: 'ВТ',
    time: '09:00',
    durationMinutes: 75,
    ageGroup: 'Взрослые 50+',
    targetCategory: 'Взрослые',
    format: 'outdoor',
    photo: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
    capacity: 20,
    enrolled: 15,
    description: 'Обучение правильной биомеханике толчка палками, безопасная кардио-нагрузка по лесным дорожкам бора.',
    requirements: 'Скандинавские палки (при отсутствии выдаются на месте).',
    price: 'Бесплатно'
  },
  {
    id: 'sch-4',
    title: 'Открытая тренировка по плаванию и технике кроля',
    sport: 'Плавание',
    district: 'Калининский',
    location: 'Бассейн «Нептун»',
    address: 'ул. Богдана Хмельницкого, 25',
    instructor: 'Попов А.С.',
    instructorPhone: '+7 (913) 234-56-78',
    date: '2026-09-08',
    dayOfWeek: 'ВТ',
    time: '10:00',
    durationMinutes: 45,
    ageGroup: 'Подростки',
    targetCategory: 'Подростки',
    format: 'indoor',
    photo: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80',
    capacity: 15,
    enrolled: 12,
    description: 'Постановка правильного вдоха, отработка скольжения в воде и синхронности движений рук и ног.',
    requirements: 'Шапочка, очки для плавания, купальный костюм, сменная обувь, медицинская справка.',
    price: 'Бесплатно'
  },
  {
    id: 'sch-5',
    title: 'Детская секция футбола: основы дриблинга',
    sport: 'Футбол',
    district: 'Центральный',
    location: 'Стадион «Спартак»',
    address: 'ул. Мичурина, 10',
    instructor: 'Федоров Д.И.',
    instructorPhone: '+7 (903) 777-88-99',
    date: '2026-09-08',
    dayOfWeek: 'ВТ',
    time: '11:30',
    durationMinutes: 60,
    ageGroup: 'Дети (7-12 лет)',
    targetCategory: 'Дети',
    format: 'outdoor',
    photo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    capacity: 22,
    enrolled: 20,
    description: 'Игровая тренировка для ребят. Отработка паса, координации, ведения мяча и мини-матч.',
    requirements: 'Кроссовки или шиповки (без металлических шипов), спортивная форма.',
    price: 'Бесплатно'
  },
  {
    id: 'sch-6',
    title: 'Шахматный клуб и открытый блиц-турнир',
    sport: 'Шахматы',
    district: 'Октябрьский',
    location: 'Михайловская набережная (шахматная беседка)',
    address: 'ул. Большевистская, 12б',
    instructor: 'Карпов В.Ю.',
    instructorPhone: '+7 (952) 345-67-89',
    date: '2026-09-08',
    dayOfWeek: 'ВТ',
    time: '15:00',
    durationMinutes: 90,
    ageGroup: 'Все возраста',
    targetCategory: 'Все',
    format: 'outdoor',
    photo: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80',
    capacity: 30,
    enrolled: 24,
    description: 'Разбор дебютов, решение тактических задач и дружеский турнир с контролем времени.',
    requirements: 'Желание играть, шахматные часы (по возможности).',
    price: 'Бесплатно'
  },
  {
    id: 'sch-7',
    title: 'Городской любительский волейбол 6х6',
    sport: 'Волейбол',
    district: 'Советский',
    location: 'Спортивный пляж «Звезда»',
    address: 'Бердский тупик, 9',
    instructor: 'Кузнецов В.Н.',
    instructorPhone: '+7 (913) 333-44-55',
    date: '2026-09-08',
    dayOfWeek: 'ВТ',
    time: '18:00',
    durationMinutes: 90,
    ageGroup: '18+',
    targetCategory: 'Взрослые',
    format: 'outdoor',
    photo: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
    capacity: 24,
    enrolled: 22,
    description: 'Динамичный пляжный волейбол на берегу Обского моря. Разминка, отработка приема и подачи, товарищеские партии.',
    requirements: 'Песочные носки или босиком, спортивная майка/шорты, вода.',
    price: 'Бесплатно'
  },
  {
    id: 'sch-8',
    title: 'Силовой воркаут и функциональное многоборье',
    sport: 'Воркаут',
    district: 'Ленинский',
    location: 'Сквер Славы (воркаут-зона)',
    address: 'ул. Станиславского, 7',
    instructor: 'Богданов С.А.',
    instructorPhone: '+7 (913) 777-12-34',
    date: '2026-09-08',
    dayOfWeek: 'ВТ',
    time: '19:30',
    durationMinutes: 60,
    ageGroup: 'Подростки и взрослые',
    targetCategory: 'Взрослые',
    format: 'outdoor',
    photo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    capacity: 20,
    enrolled: 17,
    description: 'Подтягивания, выходы силой, брусья, планки и прокачка мышц кора под присмотром мастера спорта.',
    requirements: 'Спортивные перчатки, удобные кроссовки.',
    price: 'Бесплатно'
  },
  {
    id: 'sch-9',
    title: 'Настольный теннис для всех желающих',
    sport: 'Настольный теннис',
    district: 'Дзержинский',
    location: 'Парк «Березовая роща»',
    address: 'ул. Планетная, 53',
    instructor: 'Васильев О.К.',
    instructorPhone: '+7 (923) 444-55-66',
    date: '2026-09-08',
    dayOfWeek: 'ВТ',
    time: '20:00',
    durationMinutes: 60,
    ageGroup: 'Все возраста',
    targetCategory: 'Все',
    format: 'indoor',
    photo: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80',
    capacity: 16,
    enrolled: 14,
    description: 'Вечерние спарринги, отработка топ-спинов и парные игры на профессиональных столах.',
    requirements: 'Ракетка (или аренда на месте), чистая сменная обувь.',
    price: 'Бесплатно'
  },
  {
    id: 'sch-10',
    title: 'Баскетбол 3х3: открытый турнир районов',
    sport: 'Баскетбол',
    district: 'Кировский',
    location: 'Парк «Бугринская роща»',
    address: 'ул. Саввы Кожевникова, 39',
    instructor: 'Громов Е.В.',
    instructorPhone: '+7 (913) 555-66-77',
    date: '2026-09-09',
    dayOfWeek: 'СР',
    time: '18:00',
    durationMinutes: 90,
    ageGroup: 'Подростки',
    targetCategory: 'Подростки',
    format: 'outdoor',
    photo: 'https://images.unsplash.com/photo-1547919307-1ecb10702e6f?auto=format&fit=crop&w=800&q=80',
    capacity: 18,
    enrolled: 15,
    description: 'Стритбол на новом резиновом покрытии. Командные связки, броски со средней и дальней дистанции.',
    requirements: 'Баскетбольные кроссовки с фиксацией голеностопа.',
    price: 'Бесплатно'
  },
  {
    id: 'sch-11',
    title: 'Легкоатлетический забег по набережной 5 км',
    sport: 'Бег',
    district: 'Октябрьский',
    location: 'Михайловская набережная',
    address: 'ул. Большевистская, 12б',
    instructor: 'Макарова Л.С.',
    instructorPhone: '+7 (913) 888-99-00',
    date: '2026-09-09',
    dayOfWeek: 'СР',
    time: '19:00',
    durationMinutes: 60,
    ageGroup: '18+',
    targetCategory: 'Взрослые',
    format: 'outdoor',
    photo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    capacity: 35,
    enrolled: 29,
    description: 'Беговой клуб для любителей. Разминка, темповый бег в комфортном темпе, заминка и растяжка.',
    requirements: 'Беговые кроссовки, ветровка по погоде.',
    price: 'Бесплатно'
  },
  {
    id: 'sch-12',
    title: 'ОФП и суставная гимнастика для долголетия',
    sport: 'ОФП',
    district: 'Первомайский',
    location: 'ПКиО «Первомайский»',
    address: 'ул. Маяковского, 5а',
    instructor: 'Семенова Т.А.',
    instructorPhone: '+7 (923) 666-77-88',
    date: '2026-09-09',
    dayOfWeek: 'СР',
    time: '10:00',
    durationMinutes: 50,
    ageGroup: 'Взрослые 55+',
    targetCategory: 'Взрослые',
    format: 'outdoor',
    photo: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80',
    capacity: 25,
    enrolled: 21,
    description: 'Комплекс упражнений для гибкости суставов, укрепления спины и поддержания тонуса мышц.',
    requirements: 'Удобная спортивная одежда.',
    price: 'Бесплатно'
  }
];

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Новосибирск запускает проект «Спортивный Город 54»: бесплатные тренировки во всех 10 районах',
    summary: 'Городской спортивный комитет открыл сезон бесплатных спортивных секций с участием ведущих тренеров и олимпийских призеров.',
    content: 'С 1 сентября в Новосибирске стартовала масштабная городская программа «Спортивный Город 54». Теперь каждый житель может выбрать подходящее занятие рядом со своим домом: от утренней йоги в Театральном сквере до вечернего волейбола на Бугринской роще и в Академгородке. Все тренировки проводятся профессиональными сертифицированными инструкторами бесплатно по утвержденному расписанию.',
    date: '08.09.2026',
    photo: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80'
    ],
    district: 'Центральный',
    isPublished: true,
    author: 'Пресс-служба Управления физкультуры и спорта мэрии Новосибирска',
    views: 1420
  },
  {
    id: 'news-2',
    title: 'Новые воркаут-площадки открылись в Ленинском и Кировском районах',
    summary: 'Современные тренажерные комплексы с антитравматичным резиновым покрытием доступны круглосуточно.',
    content: 'В Сквере Славы и парке Бугринская роща завершился монтаж многофункциональных комплексов с турниками, брусьями и адаптивными тренажерами для людей любого возраста. Площадки оснащены QR-кодами с видеоуроками правильной техники выполнения упражнений.',
    date: '05.09.2026',
    photo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    district: 'Ленинский',
    isPublished: true,
    author: 'Редакция портала',
    views: 890
  },
  {
    id: 'news-3',
    title: 'Сибирский фестиваль бега и полумарафон Раевича собрал более 12 000 участников',
    summary: 'Главный беговой праздник осени состоялся на Красном проспекте при идеальной солнечной погоде.',
    content: 'В минувшие выходные центральные улицы Новосибирска наполнились тысячами любителей бега со всей Сибири. Победители получили памятные медали и кубки, а для зрителей на площади Ленина работали интерактивные спортивные локации.',
    date: '03.09.2026',
    photo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    district: 'Центральный',
    isPublished: true,
    author: 'Спортивный обозреватель',
    views: 2150
  },
  {
    id: 'news-4',
    title: 'В бассейне «Нептун» стартовали бесплатные мастер-классы по безопасному плаванию для детей',
    summary: 'Опытные тренеры учат держаться на воде, правильному дыханию и спасению на воде.',
    content: 'Программа направлена на повышение безопасности детей и подростков на водоемах региона. Занятия проходят еженедельно по вторникам и четвергам в малой и большой ваннах спорткомплекса.',
    date: '01.09.2026',
    photo: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=80',
    district: 'Калининский',
    isPublished: true,
    author: 'Отдел детского спорта',
    views: 1120
  }
];

export const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'med-1',
    fileName: 'yoga-central-park.jpg',
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    folder: 'sports/yoga',
    detectedSport: 'Йога',
    detectedDistrict: 'Центральный',
    detectedPlace: 'Парк',
    sizeBytes: 245000,
    uploadedAt: '2026-09-08T08:00:00Z'
  },
  {
    id: 'med-2',
    fileName: 'volleyball-sovetsky-zvezda.jpg',
    url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
    folder: 'sports/volleyball',
    detectedSport: 'Волейбол',
    detectedDistrict: 'Советский',
    detectedPlace: 'Пляж Звезда',
    sizeBytes: 312000,
    uploadedAt: '2026-09-08T08:15:00Z'
  },
  {
    id: 'med-3',
    fileName: 'football-spartak-stadium.jpg',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    folder: 'sports/football',
    detectedSport: 'Футбол',
    detectedDistrict: 'Центральный',
    detectedPlace: 'Стадион Спартак',
    sizeBytes: 410000,
    uploadedAt: '2026-09-08T08:30:00Z'
  },
  {
    id: 'med-4',
    fileName: 'swimming-neptun-pool.jpg',
    url: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80',
    folder: 'sports/swimming',
    detectedSport: 'Плавание',
    detectedDistrict: 'Калининский',
    detectedPlace: 'Бассейн Нептун',
    sizeBytes: 290000,
    uploadedAt: '2026-09-08T08:45:00Z'
  },
  {
    id: 'med-5',
    fileName: 'workout-leninsky-skver.jpg',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    folder: 'places',
    detectedSport: 'Воркаут',
    detectedDistrict: 'Ленинский',
    detectedPlace: 'Сквер Славы',
    sizeBytes: 330000,
    uploadedAt: '2026-09-08T09:00:00Z'
  }
];

export const INITIAL_IMPORT_HISTORY: ImportHistoryItem[] = [
  {
    id: 'imp-1',
    fileName: 'Raspisanie_Sentyabr_2026_Novosibirsk.xlsx',
    fileType: 'xlsx',
    importedAt: '08.09.2026, 08:00',
    author: 'Администратор (Главный редактор)',
    rowsCount: 248,
    comment: 'Базовое утвержденное расписание спортивных секций Новосибирска на сентябрь 2026',
    snapshotId: 'snap-1',
    status: 'published'
  },
  {
    id: 'imp-2',
    fileName: 'Obnovlenie_Otdeleniy_01_09.docx',
    fileType: 'docx',
    importedAt: '01.09.2026, 14:30',
    author: 'Администратор',
    rowsCount: 216,
    comment: 'Добавлены занятия в Академгородке и на набережной',
    snapshotId: 'snap-2',
    status: 'rolled_back'
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirs();
    this.data = this.loadData();
    this.ensureCompleteRegistrations();
  }

  private ensureDirs() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SNAPSHOTS_DIR)) {
      fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
    }
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.events || !Array.isArray(parsed.events) || parsed.events.length === 0) {
          parsed.events = INITIAL_EVENTS;
          this.saveData(parsed);
        }
        if (!parsed.registrations || !Array.isArray(parsed.registrations) || parsed.registrations.length === 0) {
          parsed.registrations = INITIAL_REGISTRATIONS;
          this.saveData(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Error reading db file, re-initializing with seed data:', e);
    }

    const defaultData: DatabaseSchema = {
      schedules: INITIAL_SCHEDULES,
      events: INITIAL_EVENTS,
      registrations: INITIAL_REGISTRATIONS,
      districts: INITIAL_DISTRICTS,
      locations: INITIAL_LOCATIONS,
      news: INITIAL_NEWS,
      media: INITIAL_MEDIA,
      importHistory: INITIAL_IMPORT_HISTORY,
      settings: {
        portalTitle: 'СПОРТИВНЫЙ ГОРОД 54',
        city: 'Новосибирск',
        phone: '+7 (383) 227-40-00',
        email: 'sport@nsk54.ru',
        vkUrl: 'https://vk.com/sportnsk54',
        telegramUrl: 'https://t.me/sportnsk54',
        youtubeUrl: 'https://youtube.com',
        allowPublicRegistrations: true,
        lastUpdated: '08.09.2026'
      }
    };
    this.saveData(defaultData);
    return defaultData;
  }

  public saveData(customData?: DatabaseSchema): void {
    const toSave = customData || this.data;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  // --- Schedules ---
  public getSchedules(filters?: {
    district?: string;
    sport?: string;
    date?: string;
    dayOfWeek?: string;
    timeOfDay?: string;
    ageGroup?: string;
    format?: string;
    search?: string;
    sortBy?: string;
  }): ScheduleItem[] {
    let result = [...this.data.schedules];

    if (filters) {
      if (filters.district && filters.district !== 'Все районы') {
        result = result.filter(s => s.district.toLowerCase() === filters.district!.toLowerCase());
      }
      if (filters.sport && filters.sport !== 'Все виды спорта') {
        result = result.filter(s => s.sport.toLowerCase() === filters.sport!.toLowerCase());
      }
      if (filters.date) {
        result = result.filter(s => s.date === filters.date);
      }
      if (filters.dayOfWeek && filters.dayOfWeek !== 'Все') {
        result = result.filter(s => s.dayOfWeek.toUpperCase() === filters.dayOfWeek!.toUpperCase());
      }
      if (filters.format && filters.format !== 'all') {
        result = result.filter(s => s.format === filters.format);
      }
      if (filters.timeOfDay && filters.timeOfDay !== 'all') {
        result = result.filter(s => {
          const hour = parseInt(s.time.split(':')[0], 10);
          if (filters.timeOfDay === 'morning') return hour >= 6 && hour < 12;
          if (filters.timeOfDay === 'day') return hour >= 12 && hour < 17;
          if (filters.timeOfDay === 'evening') return hour >= 17 && hour < 24;
          return true;
        });
      }
      if (filters.ageGroup && filters.ageGroup !== 'all') {
        result = result.filter(s => {
          const cat = (s.targetCategory || s.ageGroup).toLowerCase();
          if (filters.ageGroup === 'kids') return cat.includes('дет') || cat.includes('7-') || cat.includes('все');
          if (filters.ageGroup === 'teens') return cat.includes('подр') || cat.includes('все');
          if (filters.ageGroup === 'adults') return cat.includes('взрос') || cat.includes('18+') || cat.includes('все');
          return true;
        });
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(s =>
          s.title.toLowerCase().includes(q) ||
          s.sport.toLowerCase().includes(q) ||
          s.instructor.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.district.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q)
        );
      }

      // TIME SORTING: MUST sort as real time (08:30 < 09:00 < 10:00 < 18:00)
      const parseTimeMinutes = (t: string): number => {
        const parts = t.split(':');
        const h = parseInt(parts[0], 10) || 0;
        const m = parseInt(parts[1], 10) || 0;
        return h * 60 + m;
      };

      if (filters.sortBy === 'time_asc') {
        result.sort((a, b) => parseTimeMinutes(a.time) - parseTimeMinutes(b.time));
      } else if (filters.sortBy === 'time_desc') {
        result.sort((a, b) => parseTimeMinutes(b.time) - parseTimeMinutes(a.time));
      } else if (filters.sortBy === 'sport') {
        result.sort((a, b) => a.sport.localeCompare(b.sport, 'ru'));
      } else if (filters.sortBy === 'district') {
        result.sort((a, b) => a.district.localeCompare(b.district, 'ru'));
      } else if (filters.sortBy === 'title') {
        result.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
      } else {
        // default: sort by date then time
        result.sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return parseTimeMinutes(a.time) - parseTimeMinutes(b.time);
        });
      }
    }

    return result;
  }

  public getScheduleById(id: string): ScheduleItem | undefined {
    return this.data.schedules.find(s => s.id === id);
  }

  public addSchedule(item: Omit<ScheduleItem, 'id'>): ScheduleItem {
    const newItem: ScheduleItem = {
      ...item,
      id: `sch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };
    this.data.schedules.push(newItem);
    this.updateDistrictCounts();
    this.saveData();
    return newItem;
  }

  public updateSchedule(id: string, updates: Partial<ScheduleItem>): ScheduleItem | null {
    const idx = this.data.schedules.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.schedules[idx] = { ...this.data.schedules[idx], ...updates };
    this.updateDistrictCounts();
    this.saveData();
    return this.data.schedules[idx];
  }

  public deleteSchedule(id: string): boolean {
    const prevLen = this.data.schedules.length;
    this.data.schedules = this.data.schedules.filter(s => s.id !== id);
    const deleted = this.data.schedules.length < prevLen;
    if (deleted) {
      this.updateDistrictCounts();
      this.saveData();
    }
    return deleted;
  }

  public deleteSchedulesBatch(ids: string[]): number {
    const idSet = new Set(ids);
    const before = this.data.schedules.length;
    this.data.schedules = this.data.schedules.filter(s => !idSet.has(s.id));
    const count = before - this.data.schedules.length;
    if (count > 0) {
      this.updateDistrictCounts();
      this.saveData();
    }
    return count;
  }

  // --- Events ---
  public getEvents(filters?: {
    district?: string;
    eventType?: string;
    sport?: string;
    date?: string;
    dayOfWeek?: string;
    format?: string;
    status?: string;
    search?: string;
    sortBy?: string;
  }): SportEventItem[] {
    let result = [...(this.data.events || [])];

    if (filters) {
      if (filters.district && filters.district !== 'Все' && filters.district !== 'Все районы') {
        result = result.filter(e => e.district.toLowerCase() === filters.district!.toLowerCase());
      }
      if (filters.eventType && filters.eventType !== 'Все' && filters.eventType !== 'Все типы' && filters.eventType !== 'Все мероприятия') {
        result = result.filter(e => e.eventType.toLowerCase() === filters.eventType!.toLowerCase());
      }
      if (filters.sport && filters.sport !== 'Все' && filters.sport !== 'Все виды спорта') {
        result = result.filter(e => e.sport.toLowerCase() === filters.sport!.toLowerCase());
      }
      if (filters.date) {
        result = result.filter(e => e.date === filters.date);
      }
      if (filters.dayOfWeek && filters.dayOfWeek !== 'Все') {
        result = result.filter(e => e.dayOfWeek.toUpperCase() === filters.dayOfWeek!.toUpperCase());
      }
      if (filters.format && filters.format !== 'all') {
        result = result.filter(e => e.format === filters.format);
      }
      if (filters.status && filters.status !== 'all') {
        result = result.filter(e => e.status === filters.status);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(e =>
          e.title.toLowerCase().includes(q) ||
          e.sport.toLowerCase().includes(q) ||
          e.eventType.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.district.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
        );
      }
      if (filters.sortBy) {
        if (filters.sortBy === 'date_asc') {
          result.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
        } else if (filters.sortBy === 'date_desc') {
          result.sort((a, b) => b.date.localeCompare(a.date));
        } else if (filters.sortBy === 'popularity') {
          result.sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0));
        } else if (filters.sortBy === 'district') {
          result.sort((a, b) => a.district.localeCompare(b.district));
        } else if (filters.sortBy === 'title') {
          result.sort((a, b) => a.title.localeCompare(b.title));
        }
      }
    }

    return result;
  }

  public getEventById(id: string): SportEventItem | undefined {
    return (this.data.events || []).find(e => e.id === id);
  }

  public addEvent(item: Omit<SportEventItem, 'id'>): SportEventItem {
    const newEvent: SportEventItem = {
      ...item,
      id: `ev-${Date.now()}`
    };
    if (!this.data.events) this.data.events = [];
    this.data.events.unshift(newEvent);
    this.saveData();
    return newEvent;
  }

  public updateEvent(id: string, updates: Partial<SportEventItem>): SportEventItem | null {
    if (!this.data.events) this.data.events = [];
    const idx = this.data.events.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.events[idx] = { ...this.data.events[idx], ...updates };
    this.saveData();
    return this.data.events[idx];
  }

  public deleteEvent(id: string): boolean {
    if (!this.data.events) return false;
    const len = this.data.events.length;
    this.data.events = this.data.events.filter(e => e.id !== id);
    if (this.data.events.length < len) {
      this.saveData();
      return true;
    }
    return false;
  }

  public deleteEventsBatch(ids: string[]): number {
    if (!this.data.events || !Array.isArray(ids) || ids.length === 0) return 0;
    const initialLen = this.data.events.length;
    const idSet = new Set(ids);
    this.data.events = this.data.events.filter(e => !idSet.has(e.id));
    const deletedCount = initialLen - this.data.events.length;
    if (deletedCount > 0) {
      this.saveData();
    }
    return deletedCount;
  }

  public replaceEvents(newEvents: SportEventItem[], author: string, filename: string): ImportHistoryItem {
    // 1. Create a rollback snapshot of current events
    const snapshotId = `snap-ev-${Date.now()}`;
    const snapshotPath = path.join(SNAPSHOTS_DIR, `${snapshotId}.json`);
    try {
      fs.writeFileSync(snapshotPath, JSON.stringify(this.data.events || [], null, 2), 'utf-8');
    } catch (e) {
      console.warn('Could not write snapshot:', e);
    }

    // 2. Set new events
    this.data.events = newEvents;
    this.data.settings.lastUpdated = new Date().toLocaleDateString('ru-RU');

    // 3. Log history
    const historyItem: ImportHistoryItem = {
      id: `imp-ev-${Date.now()}`,
      fileName: filename,
      fileType: filename.endsWith('.docx') ? 'docx' : 'xlsx',
      importedAt: new Date().toLocaleString('ru-RU'),
      author,
      rowsCount: newEvents.length,
      snapshotId,
      status: 'published'
    };
    this.data.importHistory.unshift(historyItem);
    this.saveData();
    return historyItem;
  }

  public replaceSchedules(newSchedules: ScheduleItem[], author: string, filename: string): ImportHistoryItem {
    // 1. Create a rollback snapshot of current schedules
    const snapshotId = `snap-${Date.now()}`;
    const snapshotPath = path.join(SNAPSHOTS_DIR, `${snapshotId}.json`);
    fs.writeFileSync(snapshotPath, JSON.stringify(this.data.schedules, null, 2), 'utf-8');

    // 2. Set new schedules
    this.data.schedules = newSchedules;
    this.updateDistrictCounts();
    this.data.settings.lastUpdated = new Date().toLocaleDateString('ru-RU');

    // 3. Log history
    const historyItem: ImportHistoryItem = {
      id: `imp-${Date.now()}`,
      fileName: filename,
      fileType: filename.endsWith('.docx') ? 'docx' : 'xlsx',
      importedAt: new Date().toLocaleString('ru-RU'),
      author,
      rowsCount: newSchedules.length,
      snapshotId,
      status: 'published'
    };
    this.data.importHistory.unshift(historyItem);
    this.saveData();
    return historyItem;
  }

  public rollbackImport(historyId: string): boolean {
    const record = this.data.importHistory.find(h => h.id === historyId);
    if (!record) return false;
    const snapshotPath = path.join(SNAPSHOTS_DIR, `${record.snapshotId}.json`);
    if (!fs.existsSync(snapshotPath)) return false;

    try {
      const restored = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
      this.data.schedules = restored;
      record.status = 'rolled_back';
      this.updateDistrictCounts();
      this.saveData();
      return true;
    } catch (e) {
      console.error('Failed to restore snapshot:', e);
      return false;
    }
  }

  private updateDistrictCounts() {
    for (const district of this.data.districts) {
      district.classesCount = this.data.schedules.filter(
        s => s.district.toLowerCase() === district.name.toLowerCase()
      ).length;
    }
  }

  // --- Districts ---
  public getDistricts(): District[] {
    return this.data.districts;
  }

  public getDistrictBySlug(slug: string): District | undefined {
    return this.data.districts.find(d => d.slug === slug || d.name.toLowerCase() === slug.toLowerCase());
  }

  public updateDistrict(id: string, updates: Partial<District>): District | null {
    const idx = this.data.districts.findIndex(d => d.id === id);
    if (idx === -1) return null;
    this.data.districts[idx] = { ...this.data.districts[idx], ...updates };
    this.saveData();
    return this.data.districts[idx];
  }

  // --- Locations ---
  public getLocations(): SportsVenue[] {
    // Enrich with upcoming activity
    return this.data.locations.map(loc => {
      const upcoming = this.data.schedules.find(s => s.location.includes(loc.name) || loc.name.includes(s.location));
      return {
        ...loc,
        nextActivity: upcoming ? {
          title: upcoming.title,
          time: upcoming.time,
          date: upcoming.date
        } : undefined
      };
    });
  }

  public addLocation(venue: Omit<SportsVenue, 'id'>): SportsVenue {
    const newLoc: SportsVenue = {
      ...venue,
      id: `loc-${Date.now()}`
    };
    this.data.locations.push(newLoc);
    this.saveData();
    return newLoc;
  }

  public updateLocation(id: string, updates: Partial<SportsVenue>): SportsVenue | null {
    const idx = this.data.locations.findIndex(l => l.id === id);
    if (idx === -1) return null;
    this.data.locations[idx] = { ...this.data.locations[idx], ...updates };
    this.saveData();
    return this.data.locations[idx];
  }

  public deleteLocation(id: string): boolean {
    const len = this.data.locations.length;
    this.data.locations = this.data.locations.filter(l => l.id !== id);
    if (this.data.locations.length < len) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- News ---
  public getNews(onlyPublished = true): NewsItem[] {
    if (onlyPublished) {
      return this.data.news.filter(n => n.isPublished);
    }
    return this.data.news;
  }

  public getNewsById(id: string): NewsItem | undefined {
    const item = this.data.news.find(n => n.id === id);
    if (item) {
      item.views = (item.views || 0) + 1;
      this.saveData();
    }
    return item;
  }

  public addNews(item: Omit<NewsItem, 'id' | 'views'>): NewsItem {
    const newItem: NewsItem = {
      ...item,
      id: `news-${Date.now()}`,
      views: 0
    };
    this.data.news.unshift(newItem);
    this.saveData();
    return newItem;
  }

  public updateNews(id: string, updates: Partial<NewsItem>): NewsItem | null {
    const idx = this.data.news.findIndex(n => n.id === id);
    if (idx === -1) return null;
    this.data.news[idx] = { ...this.data.news[idx], ...updates };
    this.saveData();
    return this.data.news[idx];
  }

  public deleteNews(id: string): boolean {
    const len = this.data.news.length;
    this.data.news = this.data.news.filter(n => n.id !== id);
    if (this.data.news.length < len) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Media ---
  public getMedia(folder?: string): MediaItem[] {
    if (folder) {
      return this.data.media.filter(m => m.folder.startsWith(folder));
    }
    return this.data.media;
  }

  public addMediaItem(item: Omit<MediaItem, 'id' | 'uploadedAt'>): MediaItem {
    const newItem: MediaItem = {
      ...item,
      id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      uploadedAt: new Date().toISOString()
    };
    this.data.media.unshift(newItem);
    this.saveData();
    return newItem;
  }

  public assignMedia(mediaId: string, assignment: MediaItem['assignedTo']): boolean {
    const item = this.data.media.find(m => m.id === mediaId);
    if (!item) return false;
    item.assignedTo = assignment;
    this.saveData();
    return true;
  }

  public deleteMedia(mediaId: string): boolean {
    const idx = this.data.media.findIndex(m => m.id === mediaId);
    if (idx === -1) return false;
    this.data.media.splice(idx, 1);
    this.saveData();
    return true;
  }

  // --- Import History ---
  public getImportHistory(): ImportHistoryItem[] {
    return this.data.importHistory;
  }

  // --- Registrations (Учет записавшихся на занятия и мероприятия) ---
  private transliterate(str: string): string {
    const ru: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
      'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
      'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
      'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    return str.toLowerCase().split('').map(c => ru[c] || c).join('').replace(/[^a-z0-9]/g, '');
  }

  private generateMockRegistrationsForSchedule(
    sch: ScheduleItem,
    count: number,
    startIdx: number
  ): ParticipantRegistration[] {
    const FIRST_NAMES_MALE = [
      'Алексей', 'Дмитрий', 'Сергей', 'Андрей', 'Михаил', 'Александр', 'Артем', 'Максим',
      'Денис', 'Роман', 'Евгений', 'Павел', 'Константин', 'Владислав', 'Никита', 'Антон',
      'Кирилл', 'Егор', 'Олег', 'Виктор', 'Владимир', 'Тимофей', 'Ярослав', 'Иван',
      'Григорий', 'Василий', 'Борис', 'Юрий', 'Станислав', 'Валерий'
    ];
    const FIRST_NAMES_FEMALE = [
      'Елена', 'Ольга', 'Анна', 'Татьяна', 'Наталья', 'Екатерина', 'Ирина', 'Светлана',
      'Мария', 'Марина', 'Юлия', 'Анастасия', 'Дарья', 'Надежда', 'Вероника', 'Виктория',
      'Ксения', 'Полина', 'Людмила', 'Алена', 'Валерия', 'Кристина', 'Маргарита', 'Тамара',
      'Любовь', 'Валентина', 'Инна', 'Лариса', 'Галина', 'Алиса'
    ];
    const PATRONYMICS_MALE = [
      'Александрович', 'Алексеевич', 'Дмитриевич', 'Сергеевич', 'Андреевич', 'Михайлович',
      'Иванович', 'Артемович', 'Максимович', 'Денисович', 'Николаевич', 'Владимирович',
      'Павлович', 'Игоревич', 'Викторович', 'Олегович', 'Юрьевич', 'Григорьевич'
    ];
    const PATRONYMICS_FEMALE = [
      'Александровна', 'Алексеевна', 'Дмитриевна', 'Сергеевна', 'Андреевна', 'Михайловна',
      'Ивановна', 'Артемовна', 'Максимовна', 'Денисовна', 'Николаевна', 'Владимировна',
      'Павловна', 'Игоревна', 'Викторовна', 'Олеговна', 'Юрьевна', 'Григорьевна'
    ];
    const LAST_NAMES_MALE = [
      'Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов', 'Михайлов',
      'Новиков', 'Федоров', 'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семенов', 'Егоров',
      'Павлов', 'Козлов', 'Степанов', 'Николаев', 'Орлов', 'Андреев', 'Макаров', 'Никитин',
      'Захаров', 'Зайцев', 'Соловьев', 'Борисов', 'Яковлев', 'Григорьев', 'Романов', 'Ковалев',
      'Белов', 'Тарасов', 'Ильин', 'Медведев', 'Антонов', 'Кузьмин', 'Баранов', 'Фролов'
    ];
    const LAST_NAMES_FEMALE = [
      'Иванова', 'Смирнова', 'Кузнецова', 'Попова', 'Васильева', 'Петрова', 'Соколова', 'Михайлова',
      'Новикова', 'Федорова', 'Морозова', 'Волкова', 'Алексеева', 'Лебедева', 'Семенова', 'Егорова',
      'Павлова', 'Козлова', 'Степанова', 'Николаева', 'Орлова', 'Андреева', 'Макарова', 'Никитина',
      'Захарова', 'Зайцева', 'Соловьева', 'Борисова', 'Яковлева', 'Григорьева', 'Романова', 'Ковалева',
      'Белова', 'Тарасова', 'Ильина', 'Медведева', 'Антонова', 'Кузьмина', 'Баранова', 'Фролова'
    ];
    const COMMENTS_POOL = [
      'Беру собственный коврик для занятий',
      'Первый раз на тренировке, очень жду',
      'Уточните, пожалуйста, точное место сбора группы',
      'Приду вовремя, подтверждаю участие',
      'Был на предыдущем занятии, очень понравилось',
      'Нужна ли предварительная разминка дома?',
      'Есть ли поблизости раздевалка?',
      'Занимаюсь второй сезон подряд',
      'Потребуется ли собственный инвентарь?',
      'Спасибо за организацию бесплатных секций!',
      'Приду пешком из соседнего квартала',
      'Удобный формат и отличное время тренировки',
      ''
    ];
    const PHONE_PREFIXES = ['913', '923', '952', '953', '903', '905', '983'];
    const EMAIL_DOMAINS = ['mail.ru', 'yandex.ru', 'bk.ru', 'gmail.com'];

    const results: ParticipantRegistration[] = [];
    const hash = (str: string) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
      return Math.abs(h);
    };

    for (let i = 0; i < count; i++) {
      const idx = startIdx + i + 1;
      const seed = hash(`${sch.id}-${idx}`);
      const isFemale = seed % 2 === 0;

      const fn = isFemale
        ? FIRST_NAMES_FEMALE[seed % FIRST_NAMES_FEMALE.length]
        : FIRST_NAMES_MALE[seed % FIRST_NAMES_MALE.length];
      const pn = isFemale
        ? PATRONYMICS_FEMALE[(seed >> 3) % PATRONYMICS_FEMALE.length]
        : PATRONYMICS_MALE[(seed >> 3) % PATRONYMICS_MALE.length];
      const ln = isFemale
        ? LAST_NAMES_FEMALE[(seed >> 6) % LAST_NAMES_FEMALE.length]
        : LAST_NAMES_MALE[(seed >> 6) % LAST_NAMES_MALE.length];

      const prefix = PHONE_PREFIXES[seed % PHONE_PREFIXES.length];
      const p1 = String((seed % 899) + 100);
      const p2 = String(((seed >> 4) % 89) + 10);
      const p3 = String(((seed >> 8) % 89) + 10);
      const phone = `+7 (${prefix}) ${p1}-${p2}-${p3}`;

      const domain = EMAIL_DOMAINS[seed % EMAIL_DOMAINS.length];
      const email = `${this.transliterate(fn)}.${this.transliterate(ln)}@${domain}`;

      const daysOffset = (seed % 4) + 1;
      const hoursOffset = (seed % 12) + 8;
      const minsOffset = (seed % 50) + 10;
      const regDate = new Date('2026-09-08T00:00:00Z');
      regDate.setDate(regDate.getDate() - daysOffset);
      regDate.setHours(hoursOffset, minsOffset, 0, 0);

      const statusVal = (seed % 10 < 8) ? 'confirmed' : (seed % 10 === 8 ? 'attended' : 'pending');
      const comment = COMMENTS_POOL[seed % COMMENTS_POOL.length];

      results.push({
        id: `reg-${sch.id}-${idx}`,
        targetType: 'schedule',
        targetId: sch.id,
        targetTitle: sch.title,
        targetDate: sch.date,
        targetTime: sch.time,
        targetLocation: sch.location,
        targetDistrict: sch.district,
        targetSport: sch.sport,
        fullName: `${ln} ${fn} ${pn}`,
        phone,
        email: (seed % 5 !== 0) ? email : '',
        participantsCount: 1,
        comment: comment || undefined,
        status: statusVal as any,
        registeredAt: regDate.toISOString(),
        contactNotes: statusVal === 'confirmed' && (seed % 3 === 0) ? 'Подтверждено по телефону' : undefined
      });
    }

    return results;
  }

  private generateMockRegistrationsForEvent(
    ev: SportEventItem,
    count: number,
    startIdx: number
  ): ParticipantRegistration[] {
    const FIRST_NAMES_MALE = [
      'Алексей', 'Дмитрий', 'Сергей', 'Андрей', 'Михаил', 'Александр', 'Артем', 'Максим',
      'Денис', 'Роман', 'Евгений', 'Павел', 'Константин', 'Владислав', 'Никита', 'Антон',
      'Кирилл', 'Егор', 'Олег', 'Виктор', 'Владимир', 'Тимофей', 'Ярослав', 'Иван'
    ];
    const FIRST_NAMES_FEMALE = [
      'Елена', 'Ольга', 'Анна', 'Татьяна', 'Наталья', 'Екатерина', 'Ирина', 'Светлана',
      'Мария', 'Марина', 'Юлия', 'Анастасия', 'Дарья', 'Надежда', 'Вероника', 'Виктория',
      'Ксения', 'Полина', 'Людмила', 'Алена', 'Валерия', 'Кристина', 'Маргарита', 'Тамара'
    ];
    const PATRONYMICS_MALE = [
      'Александрович', 'Алексеевич', 'Дмитриевич', 'Сергеевич', 'Андреевич', 'Михайлович',
      'Иванович', 'Артемович', 'Максимович', 'Денисович', 'Николаевич', 'Владимирович'
    ];
    const PATRONYMICS_FEMALE = [
      'Александровна', 'Алексеевна', 'Дмитриевна', 'Сергеевна', 'Андреевна', 'Михайловна',
      'Ивановна', 'Артемовна', 'Максимовна', 'Денисовна', 'Николаевна', 'Владимировна'
    ];
    const LAST_NAMES_MALE = [
      'Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов', 'Михайлов',
      'Новиков', 'Федоров', 'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семенов', 'Егоров',
      'Павлов', 'Козлов', 'Степанов', 'Николаев', 'Орлов', 'Андреев', 'Макаров', 'Никитин'
    ];
    const LAST_NAMES_FEMALE = [
      'Иванова', 'Смирнова', 'Кузнецова', 'Попова', 'Васильева', 'Петрова', 'Соколова', 'Михайлова',
      'Новикова', 'Федорова', 'Морозова', 'Волкова', 'Алексеева', 'Лебедева', 'Семенова', 'Егорова',
      'Павлова', 'Козлова', 'Степанова', 'Николаева', 'Орлова', 'Андреева', 'Макарова', 'Никитина'
    ];
    const EVENT_COMMENTS_POOL = [
      'Участвую в индивидуальном зачете',
      'Команда любителей, готовы к старту',
      'Семейный зачет: папа, мама и ребенок',
      'Медицинская справка оформлена',
      'Участвуем ежегодно, отличная организация!',
      'Прошу прислать стартовый протокол на email',
      'Нужна ли предварительная регистрация на месте?'
    ];
    const PHONE_PREFIXES = ['913', '923', '952', '953', '903', '905', '983'];
    const EMAIL_DOMAINS = ['mail.ru', 'yandex.ru', 'gmail.com'];

    const results: ParticipantRegistration[] = [];
    const hash = (str: string) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
      return Math.abs(h);
    };

    for (let i = 0; i < count; i++) {
      const idx = startIdx + i + 1;
      const seed = hash(`${ev.id}-${idx}`);
      const isFemale = seed % 2 === 0;

      const fn = isFemale
        ? FIRST_NAMES_FEMALE[seed % FIRST_NAMES_FEMALE.length]
        : FIRST_NAMES_MALE[seed % FIRST_NAMES_MALE.length];
      const pn = isFemale
        ? PATRONYMICS_FEMALE[(seed >> 3) % PATRONYMICS_FEMALE.length]
        : PATRONYMICS_MALE[(seed >> 3) % PATRONYMICS_MALE.length];
      const ln = isFemale
        ? LAST_NAMES_FEMALE[(seed >> 6) % LAST_NAMES_FEMALE.length]
        : LAST_NAMES_MALE[(seed >> 6) % LAST_NAMES_MALE.length];

      const prefix = PHONE_PREFIXES[seed % PHONE_PREFIXES.length];
      const p1 = String((seed % 899) + 100);
      const p2 = String(((seed >> 4) % 89) + 10);
      const p3 = String(((seed >> 8) % 89) + 10);
      const phone = `+7 (${prefix}) ${p1}-${p2}-${p3}`;

      const domain = EMAIL_DOMAINS[seed % EMAIL_DOMAINS.length];
      const email = `${this.transliterate(fn)}.${this.transliterate(ln)}@${domain}`;

      const daysOffset = (seed % 6) + 1;
      const regDate = new Date('2026-09-08T00:00:00Z');
      regDate.setDate(regDate.getDate() - daysOffset);
      regDate.setHours((seed % 10) + 9, (seed % 50) + 5, 0, 0);

      const statusVal = (seed % 10 < 8) ? 'confirmed' : (seed % 10 === 8 ? 'attended' : 'pending');
      const pCount = (seed % 4 === 0) ? 2 : (seed % 9 === 0 ? 3 : 1);
      const comment = EVENT_COMMENTS_POOL[seed % EVENT_COMMENTS_POOL.length];

      results.push({
        id: `reg-${ev.id}-${idx}`,
        targetType: 'event',
        targetId: ev.id,
        targetTitle: ev.title,
        targetDate: ev.date,
        targetTime: ev.time,
        targetLocation: ev.location,
        targetDistrict: ev.district,
        targetSport: ev.sport,
        fullName: `${ln} ${fn} ${pn}`,
        phone,
        email,
        participantsCount: pCount,
        comment: comment || undefined,
        status: statusVal as any,
        registeredAt: regDate.toISOString(),
        contactNotes: statusVal === 'confirmed' ? 'Участие подтверждено' : undefined
      });
    }

    return results;
  }

  public ensureScheduleRegistrations(scheduleId: string): void {
    const sch = this.getScheduleById(scheduleId);
    if (!sch) return;

    if (!this.data.registrations) {
      this.data.registrations = [];
    }

    const existing = this.data.registrations.filter(
      r => r.targetType === 'schedule' && r.targetId === scheduleId
    );
    const existingCount = existing.reduce((sum, r) => sum + (r.participantsCount || 1), 0);
    const targetEnrolled = sch.enrolled || 0;

    if (existingCount < targetEnrolled) {
      const needed = targetEnrolled - existingCount;
      const generated = this.generateMockRegistrationsForSchedule(sch, needed, existing.length);
      this.data.registrations.push(...generated);
      this.saveData();
    } else if (existingCount > targetEnrolled && targetEnrolled > 0) {
      sch.enrolled = existingCount;
      this.saveData();
    }
  }

  public ensureEventRegistrations(eventId: string): void {
    const ev = this.getEventById(eventId);
    if (!ev) return;

    if (!this.data.registrations) {
      this.data.registrations = [];
    }

    const existing = this.data.registrations.filter(
      r => r.targetType === 'event' && r.targetId === eventId
    );
    const targetMin = Math.min(25, ev.registeredCount || 20);
    if (existing.length < targetMin) {
      const needed = targetMin - existing.length;
      const generated = this.generateMockRegistrationsForEvent(ev, needed, existing.length);
      this.data.registrations.push(...generated);
      this.saveData();
    }
  }

  public ensureCompleteRegistrations(): void {
    if (!this.data.registrations) {
      this.data.registrations = [];
    }
    let changed = false;

    // 1. Ensure all schedules have complete participant records for all enrolled
    for (const sch of (this.data.schedules || [])) {
      const existing = this.data.registrations.filter(
        r => r.targetType === 'schedule' && r.targetId === sch.id
      );
      const existingCount = existing.reduce((sum, r) => sum + (r.participantsCount || 1), 0);
      const targetEnrolled = sch.enrolled || 0;

      if (existingCount < targetEnrolled) {
        const needed = targetEnrolled - existingCount;
        const generated = this.generateMockRegistrationsForSchedule(sch, needed, existing.length);
        this.data.registrations.push(...generated);
        changed = true;
      } else if (existingCount > targetEnrolled && targetEnrolled > 0) {
        sch.enrolled = existingCount;
        changed = true;
      }
    }

    // 2. Ensure all events have rich participant records for attendees modal
    for (const ev of (this.data.events || [])) {
      const existing = this.data.registrations.filter(
        r => r.targetType === 'event' && r.targetId === ev.id
      );
      const targetMin = Math.min(25, ev.registeredCount || 20);
      if (existing.length < targetMin) {
        const needed = targetMin - existing.length;
        const generated = this.generateMockRegistrationsForEvent(ev, needed, existing.length);
        this.data.registrations.push(...generated);
        changed = true;
      }
    }

    if (changed) {
      this.saveData();
    }
  }

  public getRegistrations(filters?: {
    targetType?: 'schedule' | 'event';
    targetId?: string;
    search?: string;
    status?: string;
    district?: string;
  }): ParticipantRegistration[] {
    if (filters?.targetType === 'schedule' && filters?.targetId) {
      this.ensureScheduleRegistrations(filters.targetId);
    } else if (filters?.targetType === 'event' && filters?.targetId) {
      this.ensureEventRegistrations(filters.targetId);
    } else if (!filters?.targetId) {
      this.ensureCompleteRegistrations();
    }

    let result = [...(this.data.registrations || [])];

    if (filters) {
      if (filters.targetType) {
        result = result.filter(r => r.targetType === filters.targetType);
      }
      if (filters.targetId) {
        result = result.filter(r => r.targetId === filters.targetId);
      }
      if (filters.status && filters.status !== 'all') {
        result = result.filter(r => r.status === filters.status);
      }
      if (filters.district && filters.district !== 'Все районы') {
        result = result.filter(r => r.targetDistrict === filters.district);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(r =>
          r.fullName.toLowerCase().includes(q) ||
          r.phone.toLowerCase().includes(q) ||
          (r.email && r.email.toLowerCase().includes(q)) ||
          r.targetTitle.toLowerCase().includes(q) ||
          r.targetLocation.toLowerCase().includes(q) ||
          (r.comment && r.comment.toLowerCase().includes(q)) ||
          (r.contactNotes && r.contactNotes.toLowerCase().includes(q))
        );
      }
    }

    // Sort newest registrations first
    result.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
    return result;
  }

  public getRegistrationById(id: string): ParticipantRegistration | undefined {
    return (this.data.registrations || []).find(r => r.id === id);
  }

  public addRegistration(data: {
    targetType: 'schedule' | 'event';
    targetId: string;
    targetTitle?: string;
    targetDate?: string;
    targetTime?: string;
    targetLocation?: string;
    targetDistrict?: string;
    targetSport?: string;
    fullName: string;
    phone: string;
    email?: string;
    participantsCount?: number;
    comment?: string;
    status?: 'confirmed' | 'pending' | 'attended' | 'cancelled';
    contactNotes?: string;
  }): ParticipantRegistration {
    if (!this.data.registrations) {
      this.data.registrations = [];
    }

    let title = data.targetTitle || '';
    let date = data.targetDate || '';
    let time = data.targetTime || '';
    let location = data.targetLocation || '';
    let district = data.targetDistrict || '';
    let sport = data.targetSport || '';

    // If target details weren't passed, lookup from schedule or event
    if (data.targetType === 'schedule') {
      const sch = this.getScheduleById(data.targetId);
      if (sch) {
        title = title || sch.title;
        date = date || sch.date;
        time = time || sch.time;
        location = location || sch.location;
        district = district || sch.district;
        sport = sport || sch.sport;
        sch.enrolled = (sch.enrolled || 0) + (data.participantsCount || 1);
      }
    } else if (data.targetType === 'event') {
      const ev = this.getEventById(data.targetId);
      if (ev) {
        title = title || ev.title;
        date = date || ev.date;
        time = time || ev.time;
        location = location || ev.location;
        district = district || ev.district;
        sport = sport || ev.sport;
        ev.registeredCount = (ev.registeredCount || 0) + (data.participantsCount || 1);
      }
    }

    const newReg: ParticipantRegistration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      targetType: data.targetType,
      targetId: data.targetId,
      targetTitle: title,
      targetDate: date,
      targetTime: time,
      targetLocation: location,
      targetDistrict: district,
      targetSport: sport,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || '',
      participantsCount: data.participantsCount && data.participantsCount > 0 ? data.participantsCount : 1,
      comment: data.comment || '',
      status: data.status || 'confirmed',
      registeredAt: new Date().toISOString(),
      contactNotes: data.contactNotes || ''
    };

    this.data.registrations.unshift(newReg);
    this.saveData();
    return newReg;
  }

  public updateRegistration(id: string, updates: Partial<ParticipantRegistration>): ParticipantRegistration | null {
    if (!this.data.registrations) return null;
    const idx = this.data.registrations.findIndex(r => r.id === id);
    if (idx === -1) return null;

    this.data.registrations[idx] = {
      ...this.data.registrations[idx],
      ...updates
    };
    this.saveData();
    return this.data.registrations[idx];
  }

  public deleteRegistration(id: string): boolean {
    if (!this.data.registrations) return false;
    const reg = this.data.registrations.find(r => r.id === id);
    if (!reg) return false;

    // Adjust target count
    if (reg.targetType === 'schedule') {
      const sch = this.getScheduleById(reg.targetId);
      if (sch && sch.enrolled) {
        sch.enrolled = Math.max(0, sch.enrolled - (reg.participantsCount || 1));
      }
    } else if (reg.targetType === 'event') {
      const ev = this.getEventById(reg.targetId);
      if (ev && ev.registeredCount) {
        ev.registeredCount = Math.max(0, ev.registeredCount - (reg.participantsCount || 1));
      }
    }

    this.data.registrations = this.data.registrations.filter(r => r.id !== id);
    this.saveData();
    return true;
  }

  public deleteRegistrationsBatch(ids: string[]): number {
    if (!this.data.registrations || !Array.isArray(ids) || ids.length === 0) return 0;
    let count = 0;
    for (const id of ids) {
      if (this.deleteRegistration(id)) {
        count++;
      }
    }
    return count;
  }

  // --- Stats ---
  public getStats(): PortalStats {
    return {
      schedulesCount: this.data.schedules.length,
      districtsCount: this.data.districts.length,
      locationsCount: this.data.locations.length,
      mediaCount: this.data.media.length,
      newsCount: this.data.news.length,
      registrationsCount: (this.data.registrations || []).length,
      lastUpdated: this.data.settings.lastUpdated || '08.09.2026'
    };
  }

  // --- Settings ---
  public getSettings(): Record<string, any> {
    return this.data.settings;
  }

  public updateSettings(updates: Record<string, any>): Record<string, any> {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData();
    return this.data.settings;
  }
}

export const db = new Database();
