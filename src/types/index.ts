export type ViewMode = 'cards' | 'table' | 'day' | 'week';

export type TimeOfDay = 'all' | 'morning' | 'day' | 'evening';
export type AgeGroup = 'all' | 'kids' | 'teens' | 'adults' | 'seniors';
export type ActivityFormat = 'all' | 'indoor' | 'outdoor';

export interface ScheduleChangeRecord {
  id: string;
  timestamp: string; // ISO date string
  author: string;
  type: 'update' | 'reschedule' | 'cancellation' | 'photo_change' | 'general';
  note: string;
  status?: 'active' | 'rescheduled' | 'cancelled' | 'moved_indoor';
}

export interface ScheduleItem {
  id: string;
  title: string;
  sport: string;
  district: string;
  location: string;
  address: string;
  instructor: string;
  instructorPhone?: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // ПН, ВТ, etc.
  time: string; // HH:mm (e.g. 08:30)
  durationMinutes: number;
  ageGroup: string; // "18+", "Дети", "Все возраста", etc.
  targetCategory?: string; // "Взрослые", "Дети", "Подростки", "Все"
  format: 'indoor' | 'outdoor';
  photo: string;
  capacity?: number;
  enrolled?: number;
  description?: string;
  requirements?: string;
  price?: string; // "Бесплатно"
  isFeatured?: boolean;
  // Dynamic change management requested by user
  status?: 'active' | 'rescheduled' | 'cancelled' | 'moved_indoor';
  changeNote?: string;
  lastModified?: string;
  changesHistory?: ScheduleChangeRecord[];
}

export interface District {
  id: string;
  name: string;
  slug: string;
  classesCount: number;
  venuesCount: number;
  schedulesCount?: number;
  description: string;
  photo: string;
  centerCoordinates: [number, number]; // [lat, lng]
  keyVenues: string[];
}

export interface SportsVenue {
  id: string;
  name: string;
  district: string;
  address: string;
  coordinates: [number, number] | { lat: number; lng: number };
  photo: string;
  sports: string[];
  type: 'stadium' | 'park' | 'sports_complex' | 'pool' | 'outdoor_ground' | 'arena';
  phone?: string;
  workingHours?: string;
  features?: string[];
  nextActivity?: {
    title: string;
    time: string;
    date: string;
  };
}

export interface SportCategory {
  id: string;
  name: string;
  iconName: string;
  count: number;
  popularLocations: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  preview?: string;
  category?: string;
  date: string;
  photo: string;
  gallery?: string[];
  district?: string;
  isPublished: boolean;
  author: string;
  views: number;
}

export interface MediaItem {
  id: string;
  fileName: string;
  url: string;
  folder: string; // "sports", "districts", "places", "news"
  detectedSport?: string;
  detectedDistrict?: string;
  detectedPlace?: string;
  sizeBytes: number;
  uploadedAt: string;
  assignedTo?: {
    type: 'schedule' | 'location' | 'district' | 'news';
    id: string;
    name: string;
  };
}

export interface ImportRow {
  id: string;
  raw: Record<string, string>;
  normalized: {
    title?: string;
    sport?: string;
    district?: string;
    location?: string;
    address?: string;
    instructor?: string;
    instructorPhone?: string;
    date?: string;
    time?: string;
    ageGroup?: string;
    format?: 'indoor' | 'outdoor';
    description?: string;
    // Fields for sports events import
    eventType?: string;
    organizer?: string;
    organizerPhone?: string;
    organizerEmail?: string;
    expectedParticipants?: number;
    prizes?: string;
    requirements?: string;
  };
  errors: {
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }[];
  isValid: boolean;
  isIgnored?: boolean;
}

export interface ImportPreviewResult {
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  columnsFound: string[];
  columnMapping: Record<string, string>;
  rows: ImportRow[];
  diff: {
    added: number;
    updated: number;
    deleted: number;
  };
}

export interface ImportHistoryItem {
  id: string;
  fileName: string;
  filename?: string;
  fileType: 'xlsx' | 'docx';
  importedAt: string;
  timestamp?: string;
  author: string;
  rowsCount: number;
  comment?: string;
  snapshotId: string;
  status: 'published' | 'rolled_back';
}

export interface PortalStats {
  schedulesCount: number;
  districtsCount: number;
  locationsCount: number;
  mediaCount: number;
  newsCount: number;
  lastUpdated: string;
}

export interface FilterState {
  search: string;
  district: string;
  sport: string;
  date: string;
  dayOfWeek: string;
  timeOfDay: TimeOfDay;
  ageGroup: AgeGroup;
  format: ActivityFormat;
  sortBy: 'time_asc' | 'time_desc' | 'closest' | 'sport' | 'district' | 'title';
}

export interface SportEventItem {
  id: string;
  title: string;
  eventType: string; // "Турнир", "Марафон", "Фестиваль", "Кубок", "Семейные старты", "Сдача ГТО", "Первенство", "Велопробег"
  sport: string;
  district: string;
  location: string;
  address: string;
  organizer: string;
  organizerPhone?: string;
  organizerEmail?: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  dayOfWeek: string;
  time: string; // HH:mm
  durationHours?: number;
  ageGroup: string; // "Все возраста", "12+", "18+", "Дети"
  targetCategory?: string;
  format: 'indoor' | 'outdoor' | 'combined';
  photo: string;
  expectedParticipants?: number;
  registeredCount?: number;
  description: string;
  prizes?: string;
  registrationDeadline?: string;
  status: 'registration_open' | 'upcoming' | 'ongoing' | 'finished' | 'rescheduled';
  statusLabel?: string;
  price?: string;
  isFeatured?: boolean;
  requirements?: string;
}

export interface EventFilterState {
  search: string;
  district: string;
  eventType: string;
  sport: string;
  date: string;
  dayOfWeek: string;
  timeOfDay: TimeOfDay;
  ageGroup: AgeGroup;
  format: 'all' | 'indoor' | 'outdoor';
  status: 'all' | 'registration_open' | 'upcoming';
  sortBy: 'date_asc' | 'date_desc' | 'popularity' | 'district' | 'title';
}

export interface UserSession {
  username: string;
  role: 'admin' | 'moderator';
  token: string;
}
