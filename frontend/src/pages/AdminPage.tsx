import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock3, ShieldAlert, XCircle } from 'lucide-react';
import { adminLogin, getAdminBookings, updateBookingStatus } from '../lib/api';
import type { BookingRecord, BookingStatus } from '../types';

const STORAGE_KEY = 'pagode-do-val-admin-token';

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

function statusLabel(status: BookingStatus) {
  if (status === 'approved') return 'Aprovado';
  if (status === 'rejected') return 'Recusado';
  return 'Pendente';
}

export function AdminPage() {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadBookings(currentToken: string) {
    setLoading(true);
    try {
      const response = await getAdminBookings(currentToken);
      setBookings(response.bookings);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Erro ao carregar pedidos.');
      localStorage.removeItem(STORAGE_KEY);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      void loadBookings(token);
    }
  }, [token]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setLoading(true);

    try {
      const response = await adminLogin(password);
      localStorage.setItem(STORAGE_KEY, response.token);
      setToken(response.token);
      setPassword('');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel entrar.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(bookingId: string, status: BookingStatus) {
    if (!token) return;

    setFeedback(null);

    try {
      const response = await updateBookingStatus(token, bookingId, status);
      setBookings((current) =>
        current.map((item) => (item.id === bookingId ? response.booking : item)),
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel atualizar o pedido.');
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#080808] px-6 py-20 text-white">
        <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <Link
            to="/"
            className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-amber-300 hover:text-amber-200"
          >
            Voltar ao site
          </Link>
          <div className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 p-3 text-amber-300">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">Area administrativa</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Entre com a senha configurada no back-end para revisar pedidos, aprovar datas e recusar conflitos.
          </p>
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-amber-300"
              placeholder="Senha admin"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-amber-400 px-5 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:opacity-70"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            {feedback ? <p className="text-sm text-amber-100">{feedback}</p> : null}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] px-6 py-14 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Painel administrativo</p>
            <h1 className="mt-2 text-4xl font-black">Pedidos de agendamento</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/"
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-amber-300 hover:text-amber-200"
            >
              Voltar ao site
            </Link>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                setToken(null);
                setBookings([]);
              }}
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-amber-300 hover:text-amber-200"
            >
              Sair
            </button>
          </div>
        </div>

        {feedback ? (
          <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {feedback}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">Total</div>
            <div className="mt-2 text-4xl font-black">{bookings.length}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">Pendentes</div>
            <div className="mt-2 text-4xl font-black text-amber-300">
              {bookings.filter((item) => item.status === 'pending').length}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">Aprovados</div>
            <div className="mt-2 text-4xl font-black text-emerald-300">
              {bookings.filter((item) => item.status === 'approved').length}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-300">Carregando pedidos...</div>
          ) : null}

          {!loading && bookings.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-300">Nenhum pedido cadastrado ainda.</div>
          ) : null}

          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-[2rem] border border-white/10 bg-black/40 p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="grid gap-4 md:grid-cols-2 xl:flex-1">
                  <div>
                    <div className="text-sm uppercase tracking-[0.2em] text-amber-300">{formatDate(booking.eventDate)}</div>
                    <h2 className="mt-2 text-2xl font-semibold">{booking.clientName}</h2>
                    <p className="mt-1 text-slate-300">{booking.eventType}</p>
                  </div>
                  <div className="space-y-2 text-sm text-slate-300">
                    <p>
                      <span className="font-semibold text-white">WhatsApp:</span> {booking.phone}
                    </p>
                    <p>
                      <span className="font-semibold text-white">Local:</span> {booking.eventLocation}
                    </p>
                    <p>
                      <span className="font-semibold text-white">Status:</span> {statusLabel(booking.status)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(booking.id, 'approved')}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Aprovar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(booking.id, 'pending')}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-amber-400"
                  >
                    <Clock3 className="h-4 w-4" />
                    Pendente
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(booking.id, 'rejected')}
                    className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
                  >
                    <XCircle className="h-4 w-4" />
                    Recusar
                  </button>
                </div>
              </div>

              {booking.message ? (
                <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm leading-7 text-slate-300">
                  {booking.message}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
