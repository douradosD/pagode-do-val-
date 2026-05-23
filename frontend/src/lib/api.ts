import type {
  BandContent,
  BookingPayload,
  BookingResponse,
  BookingRecord,
  BookingStatus,
  PublicSchedule,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = 3500;

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const error = await response.json().catch(() => ({ message: 'Erro inesperado.' }));
    return error.message || 'Erro inesperado.';
  }

  const rawText = await response.text().catch(() => '');
  const trimmedText = rawText.trim().toLowerCase();

  if (trimmedText.startsWith('<!doctype') || trimmedText.startsWith('<html')) {
    return 'Servidor indisponivel. Verifique se o backend publicado esta acessivel e autorizado.';
  }

  return rawText || 'Erro inesperado.';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new Error(
      'Servidor indisponivel. Publique o backend separadamente e configure `VITE_API_URL` com a URL publica da API.',
    );
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error('Resposta invalida do servidor. Verifique a URL publica da API.');
  }

  return response.json() as Promise<T>;
}

export function getContent() {
  return request<BandContent>('/content');
}

export function getPublicSchedule() {
  return request<PublicSchedule>('/bookings/public');
}

export function createBooking(payload: BookingPayload) {
  return request<BookingResponse>('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function adminLogin(password: string) {
  return request<{ token: string }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export function getAdminBookings(token: string) {
  return request<{ bookings: BookingRecord[] }>('/admin/bookings', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateBookingStatus(token: string, bookingId: string, status: BookingStatus) {
  return request<{ booking: BookingRecord }>('/admin/bookings/' + bookingId + '/status', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}
