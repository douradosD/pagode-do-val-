import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { getContent, getPublicSchedule, createBooking } from './lib/api';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { WhatsAppButton } from './components/WhatsAppButton';
import type { BandContent, BookingPayload, BookingResponse, PublicSchedule } from './types';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
      <div className="text-center">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-amber-300/20 border-t-amber-300" />
        <p className="mt-6 text-sm uppercase tracking-[0.3em] text-amber-300">Carregando Pagode do Val</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white">
      <div className="max-w-lg rounded-[2rem] border border-rose-400/30 bg-rose-400/10 p-8 text-center">
        <h1 className="text-2xl font-bold">Nao foi possivel carregar o sistema</h1>
        <p className="mt-4 text-sm leading-7 text-rose-100">{message}</p>
      </div>
    </div>
  );
}

function AppRoutes({
  content,
  schedule,
  onCreateBooking,
}: {
  content: BandContent;
  schedule: PublicSchedule;
  onCreateBooking: (payload: BookingPayload) => Promise<BookingResponse>;
}) {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HomePage content={content} schedule={schedule} onCreateBooking={onCreateBooking} />
              <WhatsAppButton phone={content.whatsappNumber} />
            </>
          }
        />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  const [content, setContent] = useState<BandContent | null>(null);
  const [schedule, setSchedule] = useState<PublicSchedule | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadInitialData() {
      try {
        const [contentResponse, scheduleResponse] = await Promise.all([getContent(), getPublicSchedule()]);
        if (!active) return;
        setContent(contentResponse);
        setSchedule(scheduleResponse);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Erro ao carregar informacoes iniciais.');
      }
    }

    void loadInitialData();
    return () => {
      active = false;
    };
  }, []);

  async function handleCreateBooking(payload: BookingPayload) {
    const response = await createBooking(payload);
    const updatedSchedule = await getPublicSchedule();
    setSchedule(updatedSchedule);
    return response;
  }

  if (error) return <ErrorScreen message={error} />;
  if (!content || !schedule) return <LoadingScreen />;

  return <AppRoutes content={content} schedule={schedule} onCreateBooking={handleCreateBooking} />;
}
