import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { getContent, getPublicSchedule, createBooking } from './lib/api';
import { fallbackContent, fallbackSchedule } from './lib/fallbackData';
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

function AppRoutes({
  content,
  schedule,
  serviceNotice,
  onCreateBooking,
}: {
  content: BandContent;
  schedule: PublicSchedule;
  serviceNotice: string | null;
  onCreateBooking: (payload: BookingPayload) => Promise<BookingResponse>;
}) {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HomePage
                content={content}
                schedule={schedule}
                serviceNotice={serviceNotice}
                onCreateBooking={onCreateBooking}
              />
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
  const [serviceNotice, setServiceNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadInitialData() {
      try {
        const [contentResponse, scheduleResponse] = await Promise.all([getContent(), getPublicSchedule()]);
        if (!active) return;
        setContent(contentResponse);
        setSchedule(scheduleResponse);
        setServiceNotice(null);
      } catch (err) {
        if (!active) return;
        setContent(fallbackContent);
        setSchedule(fallbackSchedule);
        setServiceNotice(
          err instanceof Error
            ? `${err.message} O site abriu com dados de demonstracao enquanto o servidor e ajustado.`
            : 'Servidor indisponivel. O site abriu com dados de demonstracao enquanto o servidor e ajustado.',
        );
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
    setServiceNotice(null);
    return response;
  }

  if (!content || !schedule) return <LoadingScreen />;

  return (
    <AppRoutes
      content={content}
      schedule={schedule}
      serviceNotice={serviceNotice}
      onCreateBooking={handleCreateBooking}
    />
  );
}
