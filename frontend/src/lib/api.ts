import type {
  BandContent,
  BookingPayload,
  BookingResponse,
  BookingRecord,
  BookingStatus,
  PublicSchedule,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new Error(
      'Servidor indisponivel. Publique o backend separadamente e configure `VITE_API_URL` com a URL publica da API.',
    );
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro inesperado.' }));
    throw new Error(error.message || 'Erro inesperado.');
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
