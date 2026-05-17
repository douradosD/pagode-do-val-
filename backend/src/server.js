import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile = join(__dirname, '../data/db.json');
const adapter = new JSONFile(dataFile);
const defaultData = {
  content: {
    bandName: 'Pagode do Val',
    slogan: 'O melhor do pagode em Parnaiba.',
    location: 'Parnaiba, Piaui, Brasil',
    description: '',
    longDescription: '',
    musicalStyle: [],
    whatsappNumber: '5586999999999',
    instagramUrl: 'https://instagram.com/pagodedoval',
    heroImage: '/band-hero.svg',
    highlightNumbers: [],
    gallery: [],
    videos: [],
    testimonials: [],
    budgetPackages: [],
  },
  events: [],
  bookings: [],
};

const db = new Low(adapter, defaultData);
const app = express();
const port = Number(process.env.PORT || 4000);
const frontendOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const adminPassword = process.env.ADMIN_PASSWORD || 'pagode123';
const adminToken = process.env.ADMIN_TOKEN || 'pagode-do-val-admin-token';

app.use(
  cors({
    origin(origin, callback) {
      // Permite chamadas sem origem explicita, como health checks e ferramentas server-to-server.
      if (!origin || frontendOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origem nao autorizada pelo CORS.'));
    },
  }),
);
app.use(express.json());

function normalizePhone(phone) {
  return phone.replace(/\D/g, '');
}

function formatDateLabel(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

function getActiveDates(ignoreBookingId) {
  const bookedDates = db.data.bookings
    .filter((booking) => booking.status !== 'rejected' && booking.id !== ignoreBookingId)
    .map((booking) => booking.eventDate);
  const eventDates = db.data.events
    .filter((event) => event.status !== 'rejected')
    .map((event) => event.date);

  return [...new Set([...eventDates, ...bookedDates])];
}

function ensureAuth(request, response, next) {
  const bearerToken = request.headers.authorization?.replace('Bearer ', '');
  if (bearerToken !== adminToken) {
    response.status(401).json({ message: 'Nao autorizado.' });
    return;
  }

  next();
}

function validateBookingPayload(payload) {
  const requiredFields = ['clientName', 'phone', 'eventDate', 'eventLocation', 'eventType'];
  const missingField = requiredFields.find((field) => !payload[field]?.trim?.());

  if (missingField) {
    return 'Preencha todos os campos obrigatorios.';
  }

  const selectedDate = new Date(`${payload.eventDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
    return 'Informe uma data de evento valida.';
  }

  return null;
}

function buildWhatsAppUrl(booking) {
  const businessNumber = normalizePhone(db.data.content.whatsappNumber);
  const message = [
    'Oi! Acabei de enviar um pedido pelo site do Pagode do Val.',
    `Nome: ${booking.clientName}`,
    `Data: ${formatDateLabel(booking.eventDate)}`,
    `Tipo: ${booking.eventType}`,
    `Local: ${booking.eventLocation}`,
    booking.message ? `Detalhes: ${booking.message}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;
}

function upcomingEvents() {
  return [...db.data.events]
    .sort((first, second) => first.date.localeCompare(second.date))
    .slice(0, 6);
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true });
});

app.get('/api/content', (_request, response) => {
  response.json(db.data.content);
});

app.get('/api/bookings/public', (_request, response) => {
  response.json({
    occupiedDates: getActiveDates(),
    upcomingEvents: upcomingEvents(),
  });
});

app.post('/api/bookings', async (request, response) => {
  const validationError = validateBookingPayload(request.body);
  if (validationError) {
    response.status(400).json({ message: validationError });
    return;
  }

  if (getActiveDates().includes(request.body.eventDate)) {
    response.status(409).json({ message: 'Essa data ja esta ocupada ou em analise. Escolha outra data.' });
    return;
  }

  const booking = {
    id: uuidv4(),
    clientName: request.body.clientName.trim(),
    phone: normalizePhone(request.body.phone),
    eventDate: request.body.eventDate,
    eventLocation: request.body.eventLocation.trim(),
    eventType: request.body.eventType.trim(),
    message: request.body.message?.trim?.() || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.data.bookings.push(booking);
  await db.write();

  response.status(201).json({
    booking,
    confirmationMessage:
      'Pedido enviado com sucesso. Estamos abrindo o WhatsApp para voce continuar o atendimento.',
    whatsappUrl: buildWhatsAppUrl(booking),
  });
});

app.post('/api/admin/login', (request, response) => {
  if (request.body.password !== adminPassword) {
    response.status(401).json({ message: 'Senha invalida.' });
    return;
  }

  response.json({ token: adminToken });
});

app.get('/api/admin/bookings', ensureAuth, (_request, response) => {
  const bookings = [...db.data.bookings].sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  response.json({ bookings });
});

app.patch('/api/admin/bookings/:bookingId/status', ensureAuth, async (request, response) => {
  const { bookingId } = request.params;
  const { status } = request.body;
  const allowedStatuses = ['pending', 'approved', 'rejected'];

  if (!allowedStatuses.includes(status)) {
    response.status(400).json({ message: 'Status invalido.' });
    return;
  }

  const booking = db.data.bookings.find((item) => item.id === bookingId);
  if (!booking) {
    response.status(404).json({ message: 'Pedido nao encontrado.' });
    return;
  }

  if (status !== 'rejected' && getActiveDates(booking.id).includes(booking.eventDate)) {
    response.status(409).json({ message: 'Conflito detectado: ja existe evento confirmado nessa data.' });
    return;
  }

  booking.status = status;
  await db.write();

  response.json({ booking });
});

async function start() {
  await db.read();
  db.data ||= structuredClone(defaultData);

  app.listen(port, () => {
    console.log(`Pagode do Val API rodando em http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Falha ao iniciar servidor:', error);
  process.exit(1);
});
