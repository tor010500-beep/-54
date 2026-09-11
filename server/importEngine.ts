import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { ImportRow, ImportPreviewResult, ScheduleItem, SportEventItem, ParticipantRegistration } from '../src/types/index.ts';
import { db, INITIAL_DISTRICTS } from './db.ts';

// Canonical Novosibirsk districts
const CANONICAL_DISTRICTS = [
  'Центральный',
  'Железнодорожный',
  'Заельцовский',
  'Октябрьский',
  'Дзержинский',
  'Кировский',
  'Калининский',
  'Ленинский',
  'Первомайский',
  'Советский'
];

// Canonical sports
const CANONICAL_SPORTS = [
  'Йога',
  'Волейбол',
  'Футбол',
  'Плавание',
  'Зарядка',
  'Скандинавская ходьба',
  'Баскетбол',
  'Воркаут',
  'ОФП',
  'Шахматы',
  'Настольный теннис',
  'Бег',
  'Единоборства',
  'Хоккей'
];

// Column normalization aliases dictionary
const ALIAS_MAP: Record<string, string> = {
  // Date
  'дата': 'date',
  'дата проведения': 'date',
  'число': 'date',
  'день': 'date',

  // Time
  'время': 'time',
  'время занятия': 'time',
  'время проведения': 'time',
  'начало': 'time',
  'часы': 'time',

  // Title / Activity
  'занятие': 'title',
  'название': 'title',
  'наименование': 'title',
  'название мероприятия': 'title',
  'мероприятие': 'title',
  'название занятия': 'title',
  'тема': 'title',

  // Sport
  'вид спорта': 'sport',
  'спорт': 'sport',
  'дисциплина': 'sport',
  'направление': 'sport',

  // District
  'район': 'district',
  'район города': 'district',
  'административный район': 'district',

  // Location / Venue
  'место проведения': 'location',
  'площадка': 'location',
  'спортивный объект': 'location',
  'объект': 'location',
  'стадион': 'location',
  'бассейн': 'location',

  // Address
  'адрес': 'address',
  'место': 'address',
  'адрес площадки': 'address',
  'фактический адрес': 'address',

  // Instructor
  'ответственный': 'instructor',
  'инструктор': 'instructor',
  'тренер': 'instructor',
  'руководитель': 'instructor',
  'преподаватель': 'instructor',
  'фио тренера': 'instructor',

  // Phone
  'телефон': 'instructorPhone',
  'контакты': 'instructorPhone',
  'телефон тренера': 'instructorPhone',

  // Age group
  'группа': 'ageGroup',
  'возраст': 'ageGroup',
  'категория': 'ageGroup',
  'целевая группа': 'ageGroup',

  // Format
  'формат': 'format',
  'улица/зал': 'format',
  'на улице/в зале': 'format',

  // Event Type
  'тип': 'eventType',
  'тип мероприятия': 'eventType',
  'вид мероприятия': 'eventType',
  'категория мероприятия': 'eventType',
  'формат события': 'eventType',

  // Organizer
  'организатор': 'organizer',
  'оргкомитет': 'organizer',
  'проводящая организация': 'organizer',
  'организаторы': 'organizer',
  'ответственный организатор': 'organizer',

  // Organizer Phone / Email
  'телефон организатора': 'organizerPhone',
  'контактный телефон': 'organizerPhone',
  'email': 'organizerEmail',
  'email организатора': 'organizerEmail',
  'почта': 'organizerEmail',

  // Participants
  'участники': 'expectedParticipants',
  'кол-во участников': 'expectedParticipants',
  'количество участников': 'expectedParticipants',
  'ожидаемые участники': 'expectedParticipants',
  'квота': 'expectedParticipants',

  // Prizes
  'призы': 'prizes',
  'награды': 'prizes',
  'награждение': 'prizes',
  'призовой фонд': 'prizes',

  // Description
  'описание': 'description',
  'примечание': 'description',
  'требования': 'description'
};

export function normalizeColumnHeader(header: string): string {
  const clean = header.trim().toLowerCase();
  for (const [alias, canonical] of Object.entries(ALIAS_MAP)) {
    if (clean === alias || clean.startsWith(alias) || alias.startsWith(clean)) {
      return canonical;
    }
  }
  return header.trim();
}

export function normalizeDistrict(input: string): { name: string; isExact: boolean } {
  if (!input) return { name: '', isExact: false };
  const clean = input.trim().toLowerCase();

  for (const d of CANONICAL_DISTRICTS) {
    if (clean.includes(d.toLowerCase()) || d.toLowerCase().includes(clean)) {
      return { name: d, isExact: true };
    }
  }
  return { name: input.trim(), isExact: false };
}

export function normalizeSport(input: string): { name: string; isExact: boolean } {
  if (!input) return { name: 'ОФП', isExact: false };
  const clean = input.trim().toLowerCase();

  for (const s of CANONICAL_SPORTS) {
    if (clean.includes(s.toLowerCase()) || s.toLowerCase().includes(clean)) {
      return { name: s, isExact: true };
    }
  }
  return { name: input.trim(), isExact: false };
}

export function normalizeTime(input: string): string {
  if (!input) return '';
  let str = input.toString().trim().replace(/[^0-9:]/g, '');
  if (str.length === 4 && !str.includes(':')) {
    str = str.substring(0, 2) + ':' + str.substring(2);
  }
  const parts = str.split(':');
  if (parts.length >= 2) {
    const h = parts[0].padStart(2, '0');
    const m = parts[1].padEnd(2, '0').substring(0, 2);
    return `${h}:${m}`;
  }
  return str;
}

export function normalizeDate(input: string): string {
  if (!input) return '';
  const str = input.toString().trim();
  // e.g. "08.09.2026" or "08-09-2026" -> "2026-09-08"
  const ruMatch = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (ruMatch) {
    const day = ruMatch[1].padStart(2, '0');
    const month = ruMatch[2].padStart(2, '0');
    const year = ruMatch[3];
    return `${year}-${month}-${day}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  return str;
}

export function getDayOfWeekFromDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    return days[d.getDay()] || 'ВТ';
  } catch {
    return 'ВТ';
  }
}

/**
 * Parse Excel Buffer (.xlsx, .xls)
 */
export function parseExcelBuffer(buffer: Buffer): { rows: Record<string, string>[]; headers: string[] } {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (!rawJson || rawJson.length < 2) {
    return { rows: [], headers: [] };
  }

  // Find header row (first row with at least 3 non-empty cells)
  let headerIndex = 0;
  for (let i = 0; i < Math.min(rawJson.length, 5); i++) {
    const cells = rawJson[i].filter((c: any) => c !== undefined && c !== null && String(c).trim() !== '');
    if (cells.length >= 3) {
      headerIndex = i;
      break;
    }
  }

  const rawHeaders: string[] = rawJson[headerIndex].map((h: any) => String(h || '').trim());
  const rows: Record<string, string>[] = [];

  for (let r = headerIndex + 1; r < rawJson.length; r++) {
    const rowCells = rawJson[r];
    if (!rowCells || !rowCells.some((c: any) => String(c || '').trim() !== '')) continue;

    const rowObj: Record<string, string> = {};
    rawHeaders.forEach((header, colIdx) => {
      if (header) {
        rowObj[header] = String(rowCells[colIdx] || '').trim();
      }
    });
    rows.push(rowObj);
  }

  return { rows, headers: rawHeaders };
}

/**
 * Parse Word Buffer (.docx)
 * Extracts HTML table rows from docx and normalizes
 */
export async function parseWordBuffer(buffer: Buffer): Promise<{ rows: Record<string, string>[]; headers: string[] }> {
  const result = await mammoth.convertToHtml({ buffer });
  const html = result.value;

  // Simple and robust regex parser for HTML tables generated by Mammoth
  const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
  if (!tableMatch || tableMatch.length === 0) {
    return { rows: [], headers: [] };
  }

  const allRows: Record<string, string>[] = [];
  let detectedHeaders: string[] = [];

  for (const tableHtml of tableMatch) {
    const trMatches = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    if (!trMatches || trMatches.length < 2) continue;

    const extractCells = (tr: string) => {
      const tdMatches = tr.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || [];
      return tdMatches.map(cell =>
        cell.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
      );
    };

    const tableHeaders = extractCells(trMatches[0]);
    if (tableHeaders.length >= 3) {
      detectedHeaders = tableHeaders;
      for (let i = 1; i < trMatches.length; i++) {
        const cells = extractCells(trMatches[i]);
        if (cells.length > 0 && cells.some(c => c !== '')) {
          const rowObj: Record<string, string> = {};
          tableHeaders.forEach((header, idx) => {
            rowObj[header] = cells[idx] || '';
          });
          allRows.push(rowObj);
        }
      }
    }
  }

  return { rows: allRows, headers: detectedHeaders };
}

/**
 * Validate and analyze imported rows
 */
export function analyzeImportRows(
  rawRows: Record<string, string>[],
  userMappingOverride?: Record<string, string>
): ImportPreviewResult {
  if (rawRows.length === 0) {
    return {
      totalRows: 0,
      validRows: 0,
      errorRows: 0,
      warningRows: 0,
      columnsFound: [],
      columnMapping: {},
      rows: [],
      diff: { added: 0, updated: 0, deleted: 0 }
    };
  }

  const columnsFound = Object.keys(rawRows[0]);
  const columnMapping: Record<string, string> = {};

  // Compute mapping
  columnsFound.forEach(col => {
    if (userMappingOverride && userMappingOverride[col]) {
      columnMapping[col] = userMappingOverride[col];
    } else {
      columnMapping[col] = normalizeColumnHeader(col);
    }
  });

  const existingSchedules = db.getSchedules();
  let validCount = 0;
  let errorCount = 0;
  let warningCount = 0;

  const rows: ImportRow[] = rawRows.map((raw, index) => {
    const normalized: Record<string, any> = {};

    // Map according to columns
    for (const [rawCol, targetField] of Object.entries(columnMapping)) {
      if (raw[rawCol]) {
        normalized[targetField] = raw[rawCol].trim();
      }
    }

    const errors: ImportRow['errors'] = [];

    // 1. Date check
    const dateVal = normalizeDate(normalized.date || '');
    if (!dateVal) {
      errors.push({
        field: 'date',
        message: 'Отсутствует или не указана дата занятия',
        severity: 'error'
      });
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      errors.push({
        field: 'date',
        message: `Нестандартный формат даты: "${normalized.date}" (ожидается ДД.ММ.ГГГГ)`,
        severity: 'warning'
      });
    }
    normalized.date = dateVal;

    // 2. Time check
    const timeVal = normalizeTime(normalized.time || '');
    if (!timeVal) {
      errors.push({
        field: 'time',
        message: 'Отсутствует или не указано время занятия',
        severity: 'error'
      });
    } else if (!/^\d{2}:\d{2}$/.test(timeVal)) {
      errors.push({
        field: 'time',
        message: `Некорректное время: "${normalized.time}" (ожидается ЧЧ:ММ)`,
        severity: 'error'
      });
    }
    normalized.time = timeVal;

    // 3. District check
    const districtCheck = normalizeDistrict(normalized.district || '');
    if (!normalized.district) {
      errors.push({
        field: 'district',
        message: 'Не указан район Новосибирска',
        severity: 'error'
      });
    } else if (!districtCheck.isExact) {
      errors.push({
        field: 'district',
        message: `Неизвестный район: "${normalized.district}". Допустимы только 10 районов Новосибирска.`,
        severity: 'warning'
      });
    } else {
      normalized.district = districtCheck.name;
    }

    // 4. Sport check
    const sportCheck = normalizeSport(normalized.sport || '');
    if (!normalized.sport) {
      errors.push({
        field: 'sport',
        message: 'Не указан вид спорта',
        severity: 'warning'
      });
      normalized.sport = 'ОФП';
    } else if (!sportCheck.isExact) {
      errors.push({
        field: 'sport',
        message: `Нестандартный вид спорта: "${normalized.sport}". Будет использована категория: ${sportCheck.name}`,
        severity: 'warning'
      });
      normalized.sport = sportCheck.name;
    }

    // Default title fallback if missing
    if (!normalized.title) {
      normalized.title = `${normalized.sport || 'Спортивное занятие'} (${normalized.district || 'Новосибирск'})`;
    }

    // Default location fallback if missing
    if (!normalized.location) {
      normalized.location = normalized.address || 'Спортивная площадка района';
    }
    if (!normalized.address) {
      normalized.address = normalized.location;
    }

    // Default instructor fallback if missing
    if (!normalized.instructor) {
      normalized.instructor = 'Инструктор Центра спорта';
    }

    // Format
    if (!normalized.format) {
      const locLower = (normalized.location + ' ' + normalized.title).toLowerCase();
      normalized.format = (locLower.includes('парк') || locLower.includes('сквер') || locLower.includes('пляж') || locLower.includes('набережн'))
        ? 'outdoor'
        : 'indoor';
    }

    const hasErrors = errors.some(e => e.severity === 'error');
    const hasWarnings = errors.some(e => e.severity === 'warning');

    if (hasErrors) errorCount++;
    else if (hasWarnings) warningCount++;
    else validCount++;

    return {
      id: `row-${index + 1}`,
      raw,
      normalized,
      errors,
      isValid: !hasErrors
    };
  });

  // Calculate diff against existing database
  const totalIncoming = rows.filter(r => r.isValid && !r.isIgnored).length;
  const existingCount = existingSchedules.length;

  return {
    totalRows: rawRows.length,
    validRows: validCount,
    errorRows: errorCount,
    warningRows: warningCount,
    columnsFound,
    columnMapping,
    rows,
    diff: {
      added: totalIncoming,
      updated: Math.min(Math.floor(totalIncoming * 0.15), existingCount),
      deleted: Math.max(0, existingCount - totalIncoming)
    }
  };
}

/**
 * Convert normalized valid rows to ScheduleItem array and publish
 */
export function publishImportedRows(
  rows: ImportRow[],
  author: string,
  filename: string
): { count: number; historyId: string } {
  const validRows = rows.filter(r => r.isValid && !r.isIgnored);

  const newSchedules: ScheduleItem[] = validRows.map((r, idx) => {
    const n = r.normalized;
    const dayOfWeek = getDayOfWeekFromDate(n.date || '2026-09-08');

    // Choose fitting photo
    const sportPhotos: Record<string, string> = {
      'Йога': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
      'Волейбол': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
      'Футбол': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      'Плавание': 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80',
      'Зарядка': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      'Воркаут': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      'Шахматы': 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80',
      'Баскетбол': 'https://images.unsplash.com/photo-1547919307-1ecb10702e6f?auto=format&fit=crop&w=800&q=80',
      'ОФП': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
      'Скандинавская ходьба': 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80'
    };

    const photo = sportPhotos[n.sport || ''] || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80';

    return {
      id: `sch-imp-${Date.now()}-${idx}`,
      title: n.title || 'Спортивное занятие',
      sport: n.sport || 'ОФП',
      district: n.district || 'Центральный',
      location: n.location || 'Спортивная площадка',
      address: n.address || n.location || 'г. Новосибирск',
      instructor: n.instructor || 'Инструктор',
      instructorPhone: n.instructorPhone || '+7 (383) 227-40-00',
      date: n.date || '2026-09-08',
      dayOfWeek,
      time: n.time || '09:00',
      durationMinutes: 60,
      ageGroup: n.ageGroup || 'Все возраста',
      targetCategory: (n.ageGroup || '').toLowerCase().includes('дет') ? 'Дети' : 'Взрослые',
      format: n.format === 'outdoor' ? 'outdoor' : 'indoor',
      photo,
      capacity: 25,
      enrolled: Math.floor(Math.random() * 18) + 4,
      description: n.description || 'Регулярное городское физкультурно-оздоровительное занятие.',
      price: 'Бесплатно'
    };
  });

  const history = db.replaceSchedules(newSchedules, author, filename);
  return { count: newSchedules.length, historyId: history.id };
}

/**
 * Generate a realistic downloadable sample Excel file
 */
export function generateSampleExcelBuffer(): Buffer {
  const sampleData = [
    {
      'Дата': '08.09.2026',
      'Время': '08:30',
      'Занятие': 'Утренняя йога в сквере',
      'Вид спорта': 'Йога',
      'Район': 'Центральный',
      'Место': 'Театральный сквер',
      'Адрес': 'Красный проспект, 36',
      'Инструктор': 'Иванова Е.А.',
      'Группа': '18+',
      'Формат': 'На улице',
      'Телефон': '+7 (913) 456-78-90'
    },
    {
      'Дата': '08.09.2026',
      'Время': '09:00',
      'Занятие': 'Скандинавская ходьба',
      'Вид спорта': 'Скандинавская ходьба',
      'Район': 'Заельцовский',
      'Место': 'Заельцовский парк',
      'Адрес': 'ул. Парковая, 88',
      'Инструктор': 'Ковалева Н.Д.',
      'Группа': 'Все возраста',
      'Формат': 'На улице',
      'Телефон': '+7 (923) 111-22-33'
    },
    {
      'Дата': '08.09.2026',
      'Время': '10:00',
      'Занятие': 'Техника плавания кролем',
      'Вид спорта': 'Плавание',
      'Район': 'Калининский',
      'Место': 'Бассейн Нептун',
      'Адрес': 'ул. Богдана Хмельницкого, 25',
      'Инструктор': 'Попов А.С.',
      'Группа': 'Подростки',
      'Формат': 'В помещении',
      'Телефон': '+7 (913) 234-56-78'
    },
    {
      'Дата': '08.09.2026',
      'Время': '11:30',
      'Занятие': 'Детский мини-футбол',
      'Вид спорта': 'Футбол',
      'Район': 'Центральный',
      'Место': 'Стадион Спартак',
      'Адрес': 'ул. Мичурина, 10',
      'Инструктор': 'Федоров Д.И.',
      'Группа': 'Дети 7-12 лет',
      'Формат': 'На улице',
      'Телефон': '+7 (903) 777-88-99'
    },
    {
      'Дата': '08.09.2026',
      'Время': '15:00',
      'Занятие': 'Шахматный клуб и блиц',
      'Вид спорта': 'Шахматы',
      'Район': 'Октябрьский',
      'Место': 'Михайловская набережная',
      'Адрес': 'ул. Большевистская, 12б',
      'Инструктор': 'Карпов В.Ю.',
      'Группа': 'Все возраста',
      'Формат': 'На улице',
      'Телефон': '+7 (952) 345-67-89'
    },
    {
      'Дата': '08.09.2026',
      'Время': '18:00',
      'Занятие': 'Любительский волейбол 6х6',
      'Вид спорта': 'Волейбол',
      'Район': 'Советский',
      'Место': 'Пляж Звезда (Академгородок)',
      'Адрес': 'Бердский тупик, 9',
      'Инструктор': 'Кузнецов В.Н.',
      'Группа': '18+',
      'Формат': 'На улице',
      'Телефон': '+7 (913) 333-44-55'
    },
    {
      'Дата': '08.09.2026',
      'Время': '19:30',
      'Занятие': 'Силовой воркаут',
      'Вид спорта': 'Воркаут',
      'Район': 'Ленинский',
      'Место': 'Сквер Славы',
      'Адрес': 'ул. Станиславского, 7',
      'Инструктор': 'Богданов С.А.',
      'Группа': 'Взрослые',
      'Формат': 'На улице',
      'Телефон': '+7 (913) 777-12-34'
    },
    {
      'Дата': '08.09.2026',
      'Время': '20:00',
      'Занятие': 'Настольный теннис',
      'Вид спорта': 'Настольный теннис',
      'Район': 'Дзержинский',
      'Место': 'Парк Березовая роща',
      'Адрес': 'ул. Планетная, 53',
      'Инструктор': 'Васильев О.К.',
      'Группа': 'Все возраста',
      'Формат': 'В помещении',
      'Телефон': '+7 (923) 444-55-66'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  // Set nice readable column widths
  ws['!cols'] = [
    { wch: 14 }, // Дата
    { wch: 10 }, // Время
    { wch: 32 }, // Занятие
    { wch: 22 }, // Вид спорта
    { wch: 18 }, // Район
    { wch: 28 }, // Место
    { wch: 32 }, // Адрес
    { wch: 20 }, // Инструктор
    { wch: 16 }, // Группа
    { wch: 14 }, // Формат
    { wch: 20 }  // Телефон
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Расписание 54');

  // Add a helper guide sheet with official districts
  const districtsGuide = [
    { 'Номер': 1, 'Район': 'Центральный', 'Формат': 'Улица / Зал' },
    { 'Номер': 2, 'Район': 'Железнодорожный', 'Формат': 'Улица / Зал' },
    { 'Номер': 3, 'Район': 'Заельцовский', 'Формат': 'Улица / Зал' },
    { 'Номер': 4, 'Район': 'Дзержинский', 'Формат': 'Улица / Зал' },
    { 'Номер': 5, 'Район': 'Калининский', 'Формат': 'Улица / Зал' },
    { 'Номер': 6, 'Район': 'Кировский', 'Формат': 'Улица / Зал' },
    { 'Номер': 7, 'Район': 'Ленинский', 'Формат': 'Улица / Зал' },
    { 'Номер': 8, 'Район': 'Октябрьский', 'Формат': 'Улица / Зал' },
    { 'Номер': 9, 'Район': 'Первомайский', 'Формат': 'Улица / Зал' },
    { 'Номер': 10, 'Район': 'Советский', 'Формат': 'Улица / Зал' }
  ];
  const wsDistricts = XLSX.utils.json_to_sheet(districtsGuide);
  wsDistricts['!cols'] = [{ wch: 8 }, { wch: 22 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsDistricts, 'Справочник районов');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Generate an empty template Excel file ready for filling in
 */
export function generateEmptyTemplateExcelBuffer(): Buffer {
  const headers = [
    {
      'Дата': '',
      'Время': '',
      'Занятие': '',
      'Вид спорта': '',
      'Район': '',
      'Место': '',
      'Адрес': '',
      'Инструктор': '',
      'Группа': '',
      'Формат': '',
      'Телефон': ''
    }
  ];

  const ws = XLSX.utils.json_to_sheet(headers);
  ws['!cols'] = [
    { wch: 14 },
    { wch: 10 },
    { wch: 32 },
    { wch: 22 },
    { wch: 18 },
    { wch: 28 },
    { wch: 32 },
    { wch: 20 },
    { wch: 16 },
    { wch: 14 },
    { wch: 20 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Шаблон расписания');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Export actual live schedules list to Excel
 */
export function exportSchedulesToExcelBuffer(items: any[]): Buffer {
  const rows = items.map(item => ({
    'Дата': item.date || '08.09.2026',
    'Время': item.time || '10:00',
    'День недели': item.dayOfWeek || 'ВТ',
    'Занятие': item.title || '',
    'Вид спорта': item.sport || '',
    'Район': item.district || '',
    'Место проведения': item.location || '',
    'Адрес': item.address || '',
    'Инструктор': item.instructor || '',
    'Телефон': item.instructorPhone || '',
    'Возрастная группа': item.ageGroup || 'Все возраста',
    'Формат': item.format === 'outdoor' ? 'На улице' : 'В помещении',
    'Статус': item.status === 'cancelled' ? 'Отменено' : item.status === 'rescheduled' ? 'Перенесено' : 'По графику',
    'Оперативное примечание': item.changeNote || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 32 },
    { wch: 20 },
    { wch: 18 },
    { wch: 26 },
    { wch: 30 },
    { wch: 20 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 35 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Расписание 54');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Validate and analyze imported rows for EVENTS (Мероприятия)
 */
export function analyzeImportEventsRows(
  rawRows: Record<string, string>[],
  userMappingOverride?: Record<string, string>
): ImportPreviewResult {
  if (rawRows.length === 0) {
    return {
      totalRows: 0,
      validRows: 0,
      errorRows: 0,
      warningRows: 0,
      columnsFound: [],
      columnMapping: {},
      rows: [],
      diff: { added: 0, updated: 0, deleted: 0 }
    };
  }

  const columnsFound = Object.keys(rawRows[0]);
  const columnMapping: Record<string, string> = {};

  columnsFound.forEach(col => {
    if (userMappingOverride && userMappingOverride[col]) {
      columnMapping[col] = userMappingOverride[col];
    } else {
      columnMapping[col] = normalizeColumnHeader(col);
    }
  });

  const existingEvents = db.getEvents();
  let validCount = 0;
  let errorCount = 0;
  let warningCount = 0;

  const rows: ImportRow[] = rawRows.map((raw, index) => {
    const normalized: ImportRow['normalized'] = {};
    const errors: ImportRow['errors'] = [];

    // Map each raw column
    for (const [col, val] of Object.entries(raw)) {
      const field = columnMapping[col];
      const strVal = String(val || '').trim();
      if (!field || field === 'unmapped') continue;

      if (field === 'date') {
        const date = normalizeDate(strVal);
        normalized.date = date;
        if (!date) {
          errors.push({ field: 'date', message: `Некорректный формат даты: "${strVal}". Ожидается ГГГГ-ММ-ДД или ДД.ММ.ГГГГ`, severity: 'error' });
        } else if (date !== strVal) {
          errors.push({ field: 'date', message: `Дата скорректирована автоматически: "${strVal}" -> "${date}"`, severity: 'warning' });
        }
      } else if (field === 'time') {
        const time = normalizeTime(strVal);
        normalized.time = time;
        if (!time) {
          errors.push({ field: 'time', message: `Некорректный формат времени: "${strVal}". Ожидается ЧЧ:ММ`, severity: 'error' });
        } else if (time !== strVal) {
          errors.push({ field: 'time', message: `Время приведено к стандарту: "${time}"`, severity: 'warning' });
        }
      } else if (field === 'district') {
        const { name, isExact } = normalizeDistrict(strVal);
        normalized.district = name || 'Центральный';
        if (!isExact) {
          errors.push({ field: 'district', message: `Район сопоставлен приближенно: "${name}"`, severity: 'warning' });
        }
      } else if (field === 'sport') {
        const { name, isExact } = normalizeSport(strVal);
        normalized.sport = name || 'ОФП';
        if (!isExact && strVal) {
          errors.push({ field: 'sport', message: `Вид спорта не из основного списка: "${strVal}"`, severity: 'warning' });
        }
      } else if (field === 'eventType') {
        normalized.eventType = strVal || 'Турнир';
      } else if (field === 'organizer') {
        normalized.organizer = strVal;
      } else if (field === 'organizerPhone') {
        normalized.organizerPhone = strVal;
      } else if (field === 'organizerEmail') {
        normalized.organizerEmail = strVal;
      } else if (field === 'expectedParticipants') {
        const num = parseInt(strVal.replace(/[^0-9]/g, ''), 10);
        normalized.expectedParticipants = isNaN(num) ? 100 : num;
      } else if (field === 'prizes') {
        normalized.prizes = strVal;
      } else if (field === 'format') {
        const lower = strVal.toLowerCase();
        if (lower.includes('зал') || lower.includes('помещ') || lower.includes('indoor')) {
          normalized.format = 'indoor';
        } else {
          normalized.format = 'outdoor';
        }
      } else if (field === 'ageGroup') {
        normalized.ageGroup = strVal || 'Все возраста';
      } else if (field === 'title') {
        normalized.title = strVal;
      } else if (field === 'location') {
        normalized.location = strVal;
      } else if (field === 'address') {
        normalized.address = strVal;
      } else if (field === 'description') {
        normalized.description = strVal;
      }
    }

    if (!normalized.title) {
      normalized.title = `${normalized.eventType || 'Спортивное событие'}: ${normalized.sport || 'спорт'} (${normalized.district || 'Новосибирск'})`;
    }
    if (!normalized.location) {
      normalized.location = normalized.address || 'Центральная городская площадка';
    }
    if (!normalized.address) {
      normalized.address = normalized.location;
    }
    if (!normalized.organizer) {
      normalized.organizer = 'Управление физической культуры и спорта мэрии Новосибирска';
    }
    if (!normalized.eventType) {
      normalized.eventType = 'Турнир';
    }
    if (!normalized.sport) {
      normalized.sport = 'ОФП';
    }

    const hasErrors = errors.some(e => e.severity === 'error');
    const hasWarnings = errors.some(e => e.severity === 'warning');

    if (hasErrors) errorCount++;
    else if (hasWarnings) warningCount++;
    else validCount++;

    return {
      id: `ev-row-${index + 1}`,
      raw,
      normalized,
      errors,
      isValid: !hasErrors
    };
  });

  const totalIncoming = rows.filter(r => r.isValid && !r.isIgnored).length;
  const existingCount = existingEvents.length;

  return {
    totalRows: rawRows.length,
    validRows: validCount,
    errorRows: errorCount,
    warningRows: warningCount,
    columnsFound,
    columnMapping,
    rows,
    diff: {
      added: totalIncoming,
      updated: Math.min(Math.floor(totalIncoming * 0.2), existingCount),
      deleted: Math.max(0, existingCount - totalIncoming)
    }
  };
}

/**
 * Convert normalized rows to SportEventItem and publish
 */
export function publishImportedEvents(
  rows: ImportRow[],
  author: string,
  filename: string
): { count: number; historyId: string } {
  const validRows = rows.filter(r => r.isValid && !r.isIgnored);

  const eventPhotos: Record<string, string> = {
    'Легкая атлетика': 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80',
    'Баскетбол': 'https://images.unsplash.com/photo-1547919307-1ecb10702e6f?auto=format&fit=crop&w=1200&q=80',
    'Футбол': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    'Плавание': 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=80',
    'Волейбол': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80',
    'Воркаут': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    'Шахматы': 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80',
    'Настольный теннис': 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=1200&q=80',
    'Водный спорт': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'Единоборства': 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80'
  };

  const newEvents: SportEventItem[] = validRows.map((r, idx) => {
    const n = r.normalized;
    const dateStr = n.date || '2026-09-20';
    const dayOfWeek = getDayOfWeekFromDate(dateStr);
    const photo = eventPhotos[n.sport || ''] || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80';
    const expected = n.expectedParticipants || 200;
    const regCount = Math.floor(expected * 0.45);

    return {
      id: `ev-imp-${Date.now()}-${idx}`,
      title: n.title || 'Городское спортивное мероприятие',
      eventType: n.eventType || 'Турнир',
      sport: n.sport || 'ОФП',
      district: n.district || 'Центральный',
      location: n.location || 'Спортивный комплекс',
      address: n.address || n.location || 'г. Новосибирск',
      organizer: n.organizer || 'Управление физической культуры и спорта мэрии Новосибирска',
      organizerPhone: n.organizerPhone || '+7 (383) 227-40-00',
      organizerEmail: n.organizerEmail || 'sport@novo-sibirsk.ru',
      date: dateStr,
      dayOfWeek,
      time: n.time || '10:00',
      durationHours: 4,
      ageGroup: n.ageGroup || 'Все возраста',
      targetCategory: 'Все',
      format: (n.format as any) || 'outdoor',
      photo,
      expectedParticipants: expected,
      registeredCount: regCount,
      description: n.description || 'Общегородское спортивное состязание для жителей и гостей города Новосибирска.',
      prizes: n.prizes || 'Кубки, памятные медали и дипломы победителям',
      status: 'registration_open',
      statusLabel: 'Регистрация открыта',
      price: 'Бесплатно',
      isFeatured: idx < 2
    };
  });

  const history = db.replaceEvents(newEvents, author, filename);
  return { count: newEvents.length, historyId: history.id };
}

/**
 * Generate sample Excel file with realistic sports events for Novosibirsk
 */
export function generateSampleEventsExcelBuffer(): Buffer {
  const sampleEventsData = [
    {
      'Дата': '20.09.2026',
      'Время': '09:00',
      'Название мероприятия': 'Городской осенний полумарафон «Рассвет на Оби 2026»',
      'Тип мероприятия': 'Марафон',
      'Вид спорта': 'Легкая атлетика',
      'Район': 'Октябрьский',
      'Место проведения': 'Михайловская набережная',
      'Адрес': 'ул. Большевистская, 12б',
      'Организатор': 'Федерация легкой атлетики Новосибирской области',
      'Телефон': '+7 (383) 222-10-85',
      'Участники': 1200,
      'Призы': 'Кубки мэра Новосибирска, памятные медали всем финишерам',
      'Возраст': 'Все возраста',
      'Формат': 'На улице',
      'Описание': 'Главный осенний забег Сибири вдоль реки Обь на дистанции 5, 10 и 21.1 км.'
    },
    {
      'Дата': '26.09.2026',
      'Время': '11:00',
      'Название мероприятия': 'Открытый кубок мэрии по уличному баскетболу 3х3 «Сибирь Баскет»',
      'Тип мероприятия': 'Турнир',
      'Вид спорта': 'Баскетбол',
      'Район': 'Центральный',
      'Место проведения': 'Стадион «Спартак» (баскетбольная арена)',
      'Адрес': 'ул. Мичурина, 10',
      'Организатор': 'Баскетбольный клуб «Новосибирск»',
      'Телефон': '+7 (383) 217-10-85',
      'Участники': 350,
      'Призы': 'Профессиональные мячи Wilson, кубки чемпионов и форма',
      'Возраст': '14+',
      'Формат': 'На улице',
      'Описание': 'Масштабный стритбол-турнир на 8 кортах одновременно.'
    },
    {
      'Дата': '27.09.2026',
      'Время': '10:00',
      'Название мероприятия': 'Городской открытый турнир по настольному теннису «Золотая ракетка Сибири»',
      'Тип мероприятия': 'Турнир',
      'Вид спорта': 'Настольный теннис',
      'Район': 'Дзержинский',
      'Место проведения': 'Парк «Березовая роща» (теннисный павильон)',
      'Адрес': 'ул. Планетная, 53',
      'Организатор': 'Клуб настольного тенниса Дзержинского района',
      'Телефон': '+7 (383) 279-44-33',
      'Участники': 120,
      'Призы': 'Наборы профессиональных мячей, наградные кубки и грамоты',
      'Возраст': 'Все возраста',
      'Формат': 'В помещении',
      'Описание': 'Личные и парные состязания по олимпийской системе с розыгрышем всех мест.'
    },
    {
      'Дата': '03.10.2026',
      'Время': '12:00',
      'Название мероприятия': 'Шахматный фестиваль под открытым небом «Сибирский гамбит»',
      'Тип мероприятия': 'Фестиваль',
      'Вид спорта': 'Шахматы',
      'Район': 'Центральный',
      'Место проведения': 'Театральный сквер (у НОВАТа)',
      'Адрес': 'Красный проспект, 36',
      'Организатор': 'Шахматная федерация Новосибирской области',
      'Телефон': '+7 (383) 223-14-55',
      'Участники': 200,
      'Призы': 'Электронные шахматные часы DGT, памятные кубки',
      'Возраст': 'Все возраста',
      'Формат': 'На улице',
      'Описание': 'Сеанс одновременной игры на 50 досках и блиц-турнир.'
    },
    {
      'Дата': '04.10.2026',
      'Время': '10:00',
      'Название мероприятия': 'Традиционный легкоатлетический кросс «Золотая осень Первомайки»',
      'Тип мероприятия': 'Марафон',
      'Вид спорта': 'Легкая атлетика',
      'Район': 'Первомайский',
      'Место проведения': 'Стадион «Локомотив»',
      'Адрес': 'ул. Первомайская, 154',
      'Организатор': 'Отдел молодежи и спорта Первомайского района',
      'Телефон': '+7 (383) 337-22-11',
      'Участники': 800,
      'Призы': 'Памятные медали, дипломы и призы от партнеров',
      'Возраст': 'Все возраста',
      'Формат': 'На улице',
      'Описание': 'Осенний пробег по живописным аллеям парка на 1, 3 и 5 км.'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleEventsData);
  ws['!cols'] = [
    { wch: 14 }, // Дата
    { wch: 10 }, // Время
    { wch: 38 }, // Название мероприятия
    { wch: 18 }, // Тип мероприятия
    { wch: 22 }, // Вид спорта
    { wch: 18 }, // Район
    { wch: 30 }, // Место проведения
    { wch: 28 }, // Адрес
    { wch: 32 }, // Организатор
    { wch: 20 }, // Телефон
    { wch: 14 }, // Участники
    { wch: 32 }, // Призы
    { wch: 16 }, // Возраст
    { wch: 14 }, // Формат
    { wch: 45 }  // Описание
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Мероприятия 54');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Generate empty Excel template for sports events
 */
export function generateEmptyEventsTemplateExcelBuffer(): Buffer {
  const headers = [
    {
      'Дата': '',
      'Время': '',
      'Название мероприятия': '',
      'Тип мероприятия': '',
      'Вид спорта': '',
      'Район': '',
      'Место проведения': '',
      'Адрес': '',
      'Организатор': '',
      'Телефон': '',
      'Участники': '',
      'Призы': '',
      'Возраст': '',
      'Формат': '',
      'Описание': ''
    }
  ];

  const ws = XLSX.utils.json_to_sheet(headers);
  ws['!cols'] = [
    { wch: 14 },
    { wch: 10 },
    { wch: 38 },
    { wch: 18 },
    { wch: 22 },
    { wch: 18 },
    { wch: 30 },
    { wch: 28 },
    { wch: 32 },
    { wch: 20 },
    { wch: 14 },
    { wch: 32 },
    { wch: 16 },
    { wch: 14 },
    { wch: 45 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Шаблон мероприятий');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Export live events list to Excel (.xlsx)
 */
export function exportEventsToExcelBuffer(items: SportEventItem[]): Buffer {
  const rows = items.map(ev => ({
    'Дата': ev.date || '',
    'Время': ev.time || '',
    'День недели': ev.dayOfWeek || '',
    'Название': ev.title || '',
    'Тип мероприятия': ev.eventType || '',
    'Вид спорта': ev.sport || '',
    'Район': ev.district || '',
    'Место проведения': ev.location || '',
    'Адрес': ev.address || '',
    'Организатор': ev.organizer || '',
    'Телефон организатора': ev.organizerPhone || '',
    'Email организатора': ev.organizerEmail || '',
    'Ожидаемо участников': ev.expectedParticipants || 0,
    'Зарегистрировано': ev.registeredCount || 0,
    'Формат': ev.format === 'indoor' ? 'В помещении' : ev.format === 'combined' ? 'Смешанный' : 'На улице',
    'Возрастная группа': ev.ageGroup || 'Все возраста',
    'Статус': ev.status === 'registration_open' ? 'Регистрация открыта' : ev.status === 'upcoming' ? 'Скоро' : 'Завершено',
    'Призы и награды': ev.prizes || '',
    'Описание': ev.description || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 36 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
    { wch: 28 },
    { wch: 30 },
    { wch: 28 },
    { wch: 20 },
    { wch: 24 },
    { wch: 20 },
    { wch: 18 },
    { wch: 14 },
    { wch: 18 },
    { wch: 22 },
    { wch: 30 },
    { wch: 45 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Мероприятия Новосибирск');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Export registered attendees list to Excel (.xlsx)
 */
export function exportRegistrationsToExcelBuffer(items: ParticipantRegistration[]): Buffer {
  const rows = items.map(reg => ({
    'ID Записи': reg.id,
    'Категория': reg.targetType === 'schedule' ? 'Занятие (Расписание)' : 'Мероприятие (Турнир/Событие)',
    'Название': reg.targetTitle,
    'Вид спорта': reg.targetSport || '',
    'Дата проведения': reg.targetDate,
    'Время': reg.targetTime,
    'Район': reg.targetDistrict,
    'Площадка / Адрес': reg.targetLocation,
    'ФИО участника': reg.fullName,
    'Телефон': reg.phone,
    'Email': reg.email || '',
    'Количество участников': reg.participantsCount || 1,
    'Статус': reg.status === 'confirmed' ? 'Подтвержден' :
              reg.status === 'pending' ? 'Ожидает подтверждения' :
              reg.status === 'attended' ? 'Присутствовал' : 'Отменен',
    'Дата и время записи': new Date(reg.registeredAt).toLocaleString('ru-RU'),
    'Комментарий жителя': reg.comment || '',
    'Заметки по связи': reg.contactNotes || '',
    'Последний контакт': reg.lastContactedAt ? new Date(reg.lastContactedAt).toLocaleString('ru-RU') : ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 14 },
    { wch: 26 },
    { wch: 38 },
    { wch: 18 },
    { wch: 14 },
    { wch: 10 },
    { wch: 18 },
    { wch: 32 },
    { wch: 30 },
    { wch: 20 },
    { wch: 26 },
    { wch: 14 },
    { wch: 22 },
    { wch: 22 },
    { wch: 35 },
    { wch: 35 },
    { wch: 22 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Записавшиеся участники');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
