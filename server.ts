import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { db } from './server/db.ts';
import { requireAdmin, verifyAdminCredentials, generateToken, AuthenticatedRequest } from './server/auth.ts';
import {
  parseExcelBuffer,
  parseWordBuffer,
  analyzeImportRows,
  publishImportedRows,
  generateSampleExcelBuffer,
  generateEmptyTemplateExcelBuffer,
  exportSchedulesToExcelBuffer,
  analyzeImportEventsRows,
  publishImportedEvents,
  generateSampleEventsExcelBuffer,
  generateEmptyEventsTemplateExcelBuffer,
  exportEventsToExcelBuffer
} from './server/importEngine.ts';
import { initMediaFolders, analyzeFileName, processZipArchive } from './server/mediaEngine.ts';

const PORT = 3000;
const app = express();

// Initialize directories
initMediaFolders();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer memory storage for parsing buffers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});

// ==========================================
// API ROUTES
// ==========================================

// --- Health ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'sport54-nsk', timestamp: new Date().toISOString() });
});

// --- Auth ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Укажите логин и пароль' });
  }

  if (verifyAdminCredentials(username, password)) {
    const token = generateToken(username);
    return res.json({
      success: true,
      token,
      user: {
        username,
        role: 'admin',
        name: 'Администратор портала'
      }
    });
  }

  return res.status(401).json({ error: 'Неверный логин или пароль администратора' });
});

app.get('/api/auth/me', requireAdmin, (req: AuthenticatedRequest, res) => {
  res.json({
    authenticated: true,
    user: req.user
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// --- Stats & Settings ---
app.get('/api/stats', (req, res) => {
  res.json(db.getStats());
});

app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.put('/api/settings', requireAdmin, (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// --- Schedules ---
app.get('/api/schedules', (req, res) => {
  const {
    district,
    sport,
    date,
    dayOfWeek,
    timeOfDay,
    ageGroup,
    format,
    search,
    sortBy
  } = req.query;

  const schedules = db.getSchedules({
    district: district as string,
    sport: sport as string,
    date: date as string,
    dayOfWeek: dayOfWeek as string,
    timeOfDay: timeOfDay as string,
    ageGroup: ageGroup as string,
    format: format as string,
    search: search as string,
    sortBy: sortBy as string
  });

  res.json(schedules);
});

// Export all active schedules to Excel
app.get(['/api/schedules/export.xlsx', '/api/schedules/export-excel'], (req, res) => {
  try {
    const schedules = db.getSchedules();
    const buffer = exportSchedulesToExcelBuffer(schedules);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Raspisanie_Novosibirsk_Vse.xlsx"; filename*=UTF-8\'\'Raspisanie_Novosibirsk_Vse.xlsx');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/schedules/:id', (req, res) => {
  const item = db.getScheduleById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Занятие не найдено' });
  res.json(item);
});

app.post('/api/schedules', requireAdmin, (req, res) => {
  try {
    const created = db.addSchedule(req.body);
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Ошибка создания занятия' });
  }
});

app.put('/api/schedules/:id', requireAdmin, (req, res) => {
  const updated = db.updateSchedule(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Занятие не найдено' });
  res.json(updated);
});

app.delete('/api/schedules/:id', requireAdmin, (req, res) => {
  const success = db.deleteSchedule(req.params.id);
  if (!success) return res.status(404).json({ error: 'Занятие не найдено' });
  res.json({ success: true, id: req.params.id });
});

app.post('/api/schedules/batch-delete', requireAdmin, (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: 'Требуется массив идентификаторов ids' });
  }
  const deletedCount = db.deleteSchedulesBatch(ids);
  res.json({ success: true, count: deletedCount });
});

// --- Events (Мероприятия) ---
app.get('/api/events', (req, res) => {
  const {
    district,
    eventType,
    sport,
    date,
    dayOfWeek,
    format,
    status,
    search,
    sortBy
  } = req.query;

  const events = db.getEvents({
    district: district as string,
    eventType: eventType as string,
    sport: sport as string,
    date: date as string,
    dayOfWeek: dayOfWeek as string,
    format: format as string,
    status: status as string,
    search: search as string,
    sortBy: sortBy as string
  });

  res.json(events);
});

app.get('/api/events/:id', (req, res) => {
  const item = db.getEventById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Мероприятие не найдено' });
  res.json(item);
});

app.post('/api/events/:id/register', (req, res) => {
  const item = db.getEventById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Мероприятие не найдено' });
  const updatedCount = (item.registeredCount || 0) + 1;
  const updated = db.updateEvent(req.params.id, { registeredCount: updatedCount });
  res.json({ success: true, registeredCount: updatedCount, event: updated });
});

app.post('/api/events', requireAdmin, (req, res) => {
  try {
    const created = db.addEvent(req.body);
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Ошибка создания мероприятия' });
  }
});

app.put('/api/events/:id', requireAdmin, (req, res) => {
  const updated = db.updateEvent(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Мероприятие не найдено' });
  res.json(updated);
});

app.delete('/api/events/:id', requireAdmin, (req, res) => {
  const success = db.deleteEvent(req.params.id);
  if (!success) return res.status(404).json({ error: 'Мероприятие не найдено' });
  res.json({ success: true, id: req.params.id });
});

app.post('/api/events/batch-delete', requireAdmin, (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Не указаны ID мероприятий для удаления' });
  }
  const deletedCount = db.deleteEventsBatch(ids);
  res.json({ success: true, deletedCount });
});

app.get('/api/events/export.xlsx', (req, res) => {
  try {
    const events = db.getEvents();
    const buffer = exportEventsToExcelBuffer(events);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Meropriyatiya_Novosibirsk.xlsx"; filename*=UTF-8\'\'Meropriyatiya_Novosibirsk.xlsx');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- Districts ---
app.get('/api/districts', (req, res) => {
  res.json(db.getDistricts());
});

app.get('/api/districts/:slug', (req, res) => {
  const district = db.getDistrictBySlug(req.params.slug);
  if (!district) return res.status(404).json({ error: 'Район не найден' });
  res.json(district);
});

app.put('/api/districts/:id', requireAdmin, (req, res) => {
  const updated = db.updateDistrict(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Район не найден' });
  res.json(updated);
});

// --- Locations ---
app.get('/api/locations', (req, res) => {
  res.json(db.getLocations());
});

app.post('/api/locations', requireAdmin, (req, res) => {
  const created = db.addLocation(req.body);
  res.status(201).json(created);
});

app.put('/api/locations/:id', requireAdmin, (req, res) => {
  const updated = db.updateLocation(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Объект не найден' });
  res.json(updated);
});

app.delete('/api/locations/:id', requireAdmin, (req, res) => {
  const ok = db.deleteLocation(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Объект не найден' });
  res.json({ success: true });
});

// --- Sports Categories ---
app.get('/api/sports', (req, res) => {
  const schedules = db.getSchedules();
  const counts: Record<string, number> = {};
  for (const s of schedules) {
    counts[s.sport] = (counts[s.sport] || 0) + 1;
  }
  const list = Object.entries(counts).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count);
  res.json(list);
});

// --- News ---
app.get('/api/news', (req, res) => {
  const all = req.query.all === 'true';
  res.json(db.getNews(!all));
});

app.get('/api/news/:id', (req, res) => {
  const item = db.getNewsById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Новость не найдена' });
  res.json(item);
});

app.post('/api/news', requireAdmin, (req, res) => {
  const created = db.addNews(req.body);
  res.status(201).json(created);
});

app.put('/api/news/:id', requireAdmin, (req, res) => {
  const updated = db.updateNews(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Новость не найдена' });
  res.json(updated);
});

app.delete('/api/news/:id', requireAdmin, (req, res) => {
  const ok = db.deleteNews(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Новость не найдена' });
  res.json({ success: true });
});

// --- Media ---
app.get('/api/media', (req, res) => {
  const folder = req.query.folder as string | undefined;
  res.json(db.getMedia(folder));
});

app.post('/api/media/upload', requireAdmin, upload.any(), (req, res) => {
  const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Файлы не переданы' });
  }

  const results = [];
  for (const f of files) {
    const { sport, district, place, suggestedFolder } = analyzeFileName(f.originalname);
    const destDir = path.resolve(uploadsDir, suggestedFolder);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const cleanName = `${Date.now()}-${f.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const destPath = path.join(destDir, cleanName);
    fs.writeFileSync(destPath, f.buffer);

    const publicUrl = `/uploads/${suggestedFolder}/${cleanName}`;
    const item = db.addMediaItem({
      fileName: f.originalname,
      url: publicUrl,
      folder: suggestedFolder,
      detectedSport: sport,
      detectedDistrict: district,
      detectedPlace: place,
      sizeBytes: f.size
    });
    results.push(item);
  }

  res.json({
    success: true,
    count: results.length,
    items: results,
    url: results[0]?.url,
    item: results[0]
  });
});

app.post('/api/media/zip', requireAdmin, upload.single('zip'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Архив не передан' });
  }

  try {
    const items = await processZipArchive(req.file.buffer);
    res.json({
      success: true,
      count: items.length,
      items,
      message: `Распакован ZIP: успешно извлечено и каталогизировано ${items.length} изображений.`
    });
  } catch (err: any) {
    console.error('ZIP processing error:', err);
    res.status(500).json({ error: `Ошибка при распаковке ZIP архива: ${err.message}` });
  }
});

app.post('/api/media/assign', requireAdmin, (req, res) => {
  const { mediaId, assignment } = req.body;
  if (!mediaId || !assignment) {
    return res.status(400).json({ error: 'Не указаны mediaId и назначение' });
  }
  const ok = db.assignMedia(mediaId, assignment);
  res.json({ success: ok });
});

app.delete('/api/media/:id', requireAdmin, (req, res) => {
  const ok = db.deleteMedia(req.params.id);
  res.json({ success: ok });
});

// --- Import Engine ---
app.post('/api/import/excel', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл Excel не выбран' });
  }

  const isEvents = req.query.target === 'events' || req.body.target === 'events';

  try {
    const { rows, headers } = parseExcelBuffer(req.file.buffer);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Файл пуст или не содержит строк с данными' });
    }

    const preview = isEvents ? analyzeImportEventsRows(rows) : analyzeImportRows(rows);
    res.json({
      fileName: req.file.originalname,
      headers,
      preview,
      target: isEvents ? 'events' : 'schedules'
    });
  } catch (e: any) {
    console.error('Excel parse error:', e);
    res.status(500).json({ error: `Ошибка чтения Excel: ${e.message}` });
  }
});

app.post('/api/import/word', requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл Word не выбран' });
  }

  const isEvents = req.query.target === 'events' || req.body.target === 'events';

  try {
    const { rows, headers } = await parseWordBuffer(req.file.buffer);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'В документе Word не обнаружены таблицы с данными' });
    }

    const preview = isEvents ? analyzeImportEventsRows(rows) : analyzeImportRows(rows);
    res.json({
      fileName: req.file.originalname,
      headers,
      preview,
      target: isEvents ? 'events' : 'schedules'
    });
  } catch (e: any) {
    console.error('Word parse error:', e);
    res.status(500).json({ error: `Ошибка чтения Word: ${e.message}` });
  }
});

app.post('/api/import/preview', requireAdmin, (req, res) => {
  const { rawRows, columnMapping, target } = req.body;
  if (!Array.isArray(rawRows)) {
    return res.status(400).json({ error: 'Требуется массив rawRows' });
  }

  const isEvents = target === 'events';
  const preview = isEvents
    ? analyzeImportEventsRows(rawRows, columnMapping)
    : analyzeImportRows(rawRows, columnMapping);
  res.json(preview);
});

app.post('/api/import/publish', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { rows, filename, target } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'Нет строк для публикации' });
  }

  const author = req.user?.username || 'Администратор';
  const isEvents = target === 'events';

  if (isEvents) {
    const result = publishImportedEvents(rows, author, filename || 'Импорт_мероприятий.xlsx');
    return res.json({
      success: true,
      publishedCount: result.count,
      historyId: result.historyId,
      target: 'events',
      timestamp: new Date().toISOString()
    });
  }

  const result = publishImportedRows(rows, author, filename || 'Импорт_расписания.xlsx');
  res.json({
    success: true,
    publishedCount: result.count,
    historyId: result.historyId,
    target: 'schedules',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/import/history', requireAdmin, (req, res) => {
  res.json(db.getImportHistory());
});

app.post('/api/import/rollback/:id', requireAdmin, (req, res) => {
  const ok = db.rollbackImport(req.params.id);
  if (!ok) {
    return res.status(400).json({ error: 'Не удалось откатить версию (снимок не найден или поврежден)' });
  }
  res.json({ success: true, message: 'Расписание успешно возвращено к предыдущей версии!' });
});

// Download sample Excel with realistic Novosibirsk schedule data
app.get(['/api/import/sample-excel', '/api/import/sample-excel.xlsx'], (req, res) => {
  try {
    const buffer = generateSampleExcelBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Obrazets_raspisaniya_Novosibirsk.xlsx"; filename*=UTF-8\'\'Obrazets_raspisaniya_Novosibirsk.xlsx');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Download empty blank template Excel file
app.get(['/api/import/template-empty.xlsx', '/api/import/sample-empty.xlsx'], (req, res) => {
  try {
    const buffer = generateEmptyTemplateExcelBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Shablon_raspisaniya_Novosibirsk.xlsx"; filename*=UTF-8\'\'Shablon_raspisaniya_Novosibirsk.xlsx');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Download sample Excel with realistic Novosibirsk sports events data
app.get(['/api/import/events-sample.xlsx', '/api/import/events-sample'], (req, res) => {
  try {
    const buffer = generateSampleEventsExcelBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Obrazets_meropriyatiy_Novosibirsk.xlsx"; filename*=UTF-8\'\'Obrazets_meropriyatiy_Novosibirsk.xlsx');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Download empty blank template Excel file for sports events
app.get(['/api/import/events-template.xlsx', '/api/import/events-template'], (req, res) => {
  try {
    const buffer = generateEmptyEventsTemplateExcelBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Shablon_meropriyatiy_Novosibirsk.xlsx"; filename*=UTF-8\'\'Shablon_meropriyatiy_Novosibirsk.xlsx');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ==========================================
// VITE OR STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`«СПОРТИВНЫЙ ГОРОД 54» сервер запущен на порту ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Server startup failure:', err);
  process.exit(1);
});
