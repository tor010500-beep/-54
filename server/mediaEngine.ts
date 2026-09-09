import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { MediaItem } from '../src/types/index.ts';
import { db } from './db.ts';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Ensure root and subfolders exist
export function initMediaFolders() {
  const folders = [
    'uploads/sports/yoga',
    'uploads/sports/football',
    'uploads/sports/volleyball',
    'uploads/sports/tennis',
    'uploads/sports/swimming',
    'uploads/districts/central',
    'uploads/districts/zheleznodorozhny',
    'uploads/districts/zaeltsovsky',
    'uploads/districts/oktyabrsky',
    'uploads/districts/dzerzhinsky',
    'uploads/districts/kirovsky',
    'uploads/districts/kalininsky',
    'uploads/districts/leninsky',
    'uploads/districts/pervomaysky',
    'uploads/districts/sovetsky',
    'uploads/places',
    'uploads/news'
  ];

  for (const f of folders) {
    const full = path.resolve(process.cwd(), f);
    if (!fs.existsSync(full)) {
      fs.mkdirSync(full, { recursive: true });
    }
  }
}

/**
 * Intelligent file name tagger
 * e.g. "yoga-central-park.jpg" -> { sport: "Йога", district: "Центральный", place: "Парк" }
 */
export function analyzeFileName(fileName: string): {
  sport?: string;
  district?: string;
  place?: string;
  suggestedFolder: string;
} {
  const lower = fileName.toLowerCase().replace(/[_-]/g, ' ');

  let sport: string | undefined;
  let folder = 'places';

  if (lower.includes('йог') || lower.includes('yoga')) {
    sport = 'Йога';
    folder = 'sports/yoga';
  } else if (lower.includes('футб') || lower.includes('foot') || lower.includes('soccer')) {
    sport = 'Футбол';
    folder = 'sports/football';
  } else if (lower.includes('волейб') || lower.includes('volley')) {
    sport = 'Волейбол';
    folder = 'sports/volleyball';
  } else if (lower.includes('теннис') || lower.includes('tennis')) {
    sport = 'Настольный теннис';
    folder = 'sports/tennis';
  } else if (lower.includes('плаван') || lower.includes('бассейн') || lower.includes('swim')) {
    sport = 'Плавание';
    folder = 'sports/swimming';
  } else if (lower.includes('воркаут') || lower.includes('турник') || lower.includes('workout')) {
    sport = 'Воркаут';
    folder = 'places';
  } else if (lower.includes('бег') || lower.includes('марафон') || lower.includes('run')) {
    sport = 'Бег';
    folder = 'sports';
  }

  let district: string | undefined;
  if (lower.includes('центр') || lower.includes('central')) {
    district = 'Центральный';
    if (!sport) folder = 'districts/central';
  } else if (lower.includes('железно') || lower.includes('rail')) {
    district = 'Железнодорожный';
    if (!sport) folder = 'districts/zheleznodorozhny';
  } else if (lower.includes('заельц') || lower.includes('бор')) {
    district = 'Заельцовский';
    if (!sport) folder = 'districts/zaeltsovsky';
  } else if (lower.includes('октябр') || lower.includes('набереж')) {
    district = 'Октябрьский';
    if (!sport) folder = 'districts/oktyabrsky';
  } else if (lower.includes('дзержин') || lower.includes('березов')) {
    district = 'Дзержинский';
    if (!sport) folder = 'districts/dzerzhinsky';
  } else if (lower.includes('киров') || lower.includes('бугрин')) {
    district = 'Кировский';
    if (!sport) folder = 'districts/kirovsky';
  } else if (lower.includes('калинин') || lower.includes('нептун')) {
    district = 'Калининский';
    if (!sport) folder = 'districts/kalininsky';
  } else if (lower.includes('ленин') || lower.includes('сквер славы') || lower.includes('арена')) {
    district = 'Ленинский';
    if (!sport) folder = 'districts/leninsky';
  } else if (lower.includes('первомай')) {
    district = 'Первомайский';
    if (!sport) folder = 'districts/pervomaysky';
  } else if (lower.includes('совет') || lower.includes('академ') || lower.includes('звезда') || lower.includes('нгу')) {
    district = 'Советский';
    if (!sport) folder = 'districts/sovetsky';
  }

  let place: string | undefined;
  if (lower.includes('парк') || lower.includes('park')) place = 'Парк';
  else if (lower.includes('сквер')) place = 'Сквер';
  else if (lower.includes('стадион') || lower.includes('stadium')) place = 'Стадион';
  else if (lower.includes('пляж') || lower.includes('beach')) place = 'Пляж';
  else if (lower.includes('набережн')) place = 'Набережная';
  else if (lower.includes('арена') || lower.includes('arena')) place = 'Ледовая Арена';

  return { sport, district, place, suggestedFolder: folder };
}

/**
 * Unpack ZIP and process embedded images
 */
export async function processZipArchive(buffer: Buffer): Promise<MediaItem[]> {
  initMediaFolders();
  const zip = await JSZip.loadAsync(buffer);
  const createdItems: MediaItem[] = [];

  const imageRegex = /\.(jpe?g|png|webp|gif)$/i;

  const entries = Object.keys(zip.files);
  for (const relativePath of entries) {
    const file = zip.files[relativePath];
    if (file.dir) continue;
    if (!imageRegex.test(relativePath)) continue;

    const baseName = path.basename(relativePath);
    const cleanFileName = `${Date.now()}-${baseName.replace(/\s+/g, '_')}`;

    const { sport, district, place, suggestedFolder } = analyzeFileName(baseName);
    const destDir = path.resolve(UPLOADS_DIR, suggestedFolder);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const destPath = path.join(destDir, cleanFileName);
    const content = await file.async('nodebuffer');
    fs.writeFileSync(destPath, content);

    const publicUrl = `/uploads/${suggestedFolder}/${cleanFileName}`;
    const mediaItem = db.addMediaItem({
      fileName: baseName,
      url: publicUrl,
      folder: suggestedFolder,
      detectedSport: sport,
      detectedDistrict: district,
      detectedPlace: place,
      sizeBytes: content.length
    });

    createdItems.push(mediaItem);
  }

  return createdItems;
}
