import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Disc3,
  Instagram,
  MapPin,
  Menu,
  Music4,
  Phone,
  PlayCircle,
  Quote,
  Send,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { SectionTitle } from '../components/SectionTitle';
import type { BandContent, BookingPayload, BookingResponse, PublicSchedule } from '../types';

interface HomePageProps {
  content: BandContent;
  schedule: PublicSchedule;
  serviceNotice?: string | null;
  onCreateBooking: (payload: BookingPayload) => Promise<BookingResponse>;
}

const eventTypes = ['Aniversario', 'Casamento', 'Festa privada', 'Corporativo', 'Barzinho'];
const navigationItems = [
  { href: '#sobre', label: 'Sobre' },
  { href: '#agenda', label: 'Agenda' },
  { href: '#galeria', label: 'Galeria' },
  { href: '#agendar', label: 'Contrate Agora' },
  { href: '/admin', label: 'Admin' },
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 12) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }

  if (digits.length === 13) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }

  return phone;
}

function buildCalendar(occupiedDates: string[]) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const days = [];

  for (let i = 0; i < startOffset; i += 1) {
    days.push({ key: `blank-${i}`, label: '', occupied: false, isBlank: true });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const isoDate = new Date(year, month, day).toISOString().slice(0, 10);
    days.push({
      key: isoDate,
      label: String(day),
      occupied: occupiedDates.includes(isoDate),
      isBlank: false,
    });
  }

  return {
    monthLabel: new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(today),
    days,
  };
}

function getBudgetHint(eventType: string) {
  switch (eventType) {
    case 'Casamento':
      return 'Estimativa premium com set completo e repertorio personalizado.';
    case 'Corporativo':
      return 'Pacote corporativo com recepcao musical e performance elegante.';
    case 'Barzinho':
      return 'Set enxuto com alta proximidade e clima descontraido.';
    default:
      return 'Pacote sob medida conforme estrutura, data e deslocamento.';
  }
}

export function HomePage({ content, schedule, serviceNotice, onCreateBooking }: HomePageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState<BookingPayload>({
    clientName: '',
    phone: '',
    eventDate: '',
    eventLocation: '',
    eventType: eventTypes[0],
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const calendar = useMemo(() => buildCalendar(schedule.occupiedDates), [schedule.occupiedDates]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await onCreateBooking(formData);
      setFeedback(response.confirmationMessage);
      setFormData({
        clientName: '',
        phone: '',
        eventDate: '',
        eventLocation: '',
        eventType: eventTypes[0],
        message: '',
      });
      window.setTimeout(() => {
        window.location.href = response.whatsappUrl;
      }, 700);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel enviar o agendamento.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[#080808] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#inicio" className="text-lg font-bold tracking-wide text-amber-300">
            {content.bandName}
          </a>
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-slate-200 transition hover:border-amber-300 hover:text-amber-200 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <nav className="hidden gap-6 text-sm text-slate-300 md:flex">
            {navigationItems.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-amber-300">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div
        className={[
          'fixed inset-0 z-50 md:hidden',
          mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none',
        ].join(' ')}
      >
        <button
          type="button"
          aria-label="Fechar menu lateral"
          onClick={() => setMobileMenuOpen(false)}
          className={[
            'absolute inset-0 bg-black/60 transition-opacity',
            mobileMenuOpen ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />
        <aside
          className={[
            'absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col border-l border-white/10 bg-[#080808] p-6 shadow-2xl transition-transform duration-300',
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
        >
          <div className="flex items-center justify-between">
            <a
              href="#inicio"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-bold tracking-wide text-amber-300"
            >
              {content.bandName}
            </a>
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-slate-200 transition hover:border-amber-300 hover:text-amber-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-10 flex flex-col gap-3">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base font-semibold text-slate-200 transition hover:border-amber-300 hover:text-amber-200"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>
      </div>

      <main>
        {serviceNotice ? (
          <section className="border-b border-amber-400/20 bg-amber-400/10">
            <div className="mx-auto max-w-7xl px-6 py-4 text-sm leading-7 text-amber-100">{serviceNotice}</div>
          </section>
        ) : null}

        <section id="inicio" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_38%),linear-gradient(135deg,_rgba(255,255,255,0.04),_transparent_55%)]" />
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-10"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
                <Sparkles className="h-4 w-4" />
                {content.location}
              </span>
              <h1 className="mt-6 max-w-2xl text-5xl font-black leading-tight md:text-7xl">
                {content.bandName}
              </h1>
              <p className="mt-5 text-xl text-amber-200">{content.slogan}</p>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">{content.description}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#agendar"
                  className="rounded-full bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300"
                >
                  Agendar Show
                </a>
                <a
                  href={content.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition hover:border-amber-300 hover:text-amber-200"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {content.highlightNumbers.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="text-3xl font-black text-amber-300">{item.value}</div>
                    <div className="mt-1 text-sm text-slate-400">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-5 rounded-[2rem] bg-amber-400/10 blur-3xl" />
              <img
                src={content.heroImage}
                alt="Ilustracao da banda Pagode do Val"
                className="relative w-full rounded-[2rem] border border-amber-300/20 object-cover shadow-2xl shadow-black/60"
              />
            </motion.div>
          </div>
        </section>

        <section id="sobre" className="mx-auto max-w-7xl px-6 py-20">
          <SectionTitle
            eyebrow="Sobre a banda"
            title="Energia de roda de samba com presença de palco elegante"
            description={
              <p>
                {content.longDescription} Repertorio atualizado, romantico e animado para aniversarios,
                casamentos, eventos corporativos e festas privativas.
              </p>
            }
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <Disc3 className="h-8 w-8 text-amber-300" />
              <h3 className="mt-4 text-xl font-semibold">Estilo musical</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {content.musicalStyle.map((style) => (
                  <span
                    key={style}
                    className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-sm text-slate-300"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <Music4 className="h-8 w-8 text-amber-300" />
              <h3 className="mt-4 text-xl font-semibold">Experiencia memoravel</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Formacao pronta para criar clima sofisticado, repertorio envolvente e interacao natural com o publico.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <MapPin className="h-8 w-8 text-amber-300" />
              <h3 className="mt-4 text-xl font-semibold">Atendimento regional</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Base em Parnaiba, com agenda para litoral, Piaui e regioes proximas mediante consulta.
              </p>
            </div>
          </div>
        </section>

        <section id="agenda" className="border-y border-white/10 bg-white/[0.03]">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionTitle
                eyebrow="Agenda de shows"
                title="Consulte datas disponiveis e acompanhe os proximos eventos"
                description="Datas ocupadas aparecem destacadas no calendario. Novos pedidos entram em analise para evitar conflitos."
              />
              <div className="mt-8 rounded-3xl border border-white/10 bg-black/40 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Calendario</div>
                    <div className="mt-1 text-xl font-semibold capitalize text-white">{calendar.monthLabel}</div>
                  </div>
                  <CalendarDays className="h-8 w-8 text-amber-300" />
                </div>
                <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.15em] text-slate-500">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-7 gap-2">
                  {calendar.days.map((day) => (
                    <div
                      key={day.key}
                      className={[
                        'flex aspect-square items-center justify-center rounded-2xl text-sm font-medium',
                        day.isBlank ? 'bg-transparent' : 'border border-white/10 bg-white/5',
                        day.occupied ? 'border-amber-300/50 bg-amber-400/15 text-amber-200' : '',
                      ].join(' ')}
                    >
                      {day.label}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-300" />
                    Ocupado
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-white/30" />
                    Disponivel
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {schedule.upcomingEvents.map((eventItem) => (
                <div
                  key={eventItem.id}
                  className="rounded-3xl border border-white/10 bg-black/40 p-6 transition hover:border-amber-300/40"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-amber-300">{formatDate(eventItem.date)}</p>
                      <h3 className="mt-2 text-2xl font-semibold">{eventItem.title}</h3>
                      <p className="mt-2 text-slate-300">
                        {eventItem.venue} - {eventItem.city}
                      </p>
                    </div>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
                      {eventItem.status === 'approved' ? 'Confirmado' : 'Em analise'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="galeria" className="mx-auto max-w-7xl px-6 py-20">
          <SectionTitle
            eyebrow="Galeria e videos"
            title="Mostre ao cliente a atmosfera do evento antes mesmo do primeiro acorde"
            description="Fotos, clipes e registros de eventos anteriores ajudam a vender a experiencia da banda."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {content.gallery.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
                <img src={item.image} alt={item.title} className="h-72 w-full object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {content.videos.map((video) => (
              <div key={video.id} className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/50">
                <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
                  <PlayCircle className="h-5 w-5 text-amber-300" />
                  <span className="font-medium text-white">{video.title}</span>
                </div>
                <div className="aspect-video">
                  <iframe
                    className="h-full w-full"
                    src={video.embedUrl}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.03]">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <SectionTitle
              eyebrow="Avaliacoes"
              title="Prova social que fortalece a conversao"
              description="Depoimentos de clientes ajudam a validar a banda para aniversarios, casamentos e eventos empresariais."
            />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {content.testimonials.map((item) => (
                <div key={item.id} className="rounded-3xl border border-white/10 bg-black/40 p-6">
                  <Quote className="h-8 w-8 text-amber-300" />
                  <div className="mt-5 flex gap-1 text-amber-300">
                    {Array.from({ length: item.rating }).map((_, index) => (
                      <Star key={item.id + index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">"{item.quote}"</p>
                  <div className="mt-5">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-slate-400">{item.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <SectionTitle
            eyebrow="Orcamento automatico"
            title="Pacotes iniciais para acelerar a decisao do cliente"
            description="Os valores servem como referencia comercial e podem variar conforme estrutura, horario e deslocamento."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {content.budgetPackages.map((item) => (
              <div key={item.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <div className="text-sm uppercase tracking-[0.2em] text-amber-300">{item.name}</div>
                <div className="mt-4 text-4xl font-black">{item.priceLabel}</div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{item.description}</p>
                <div className="mt-5 space-y-3 text-sm text-slate-300">
                  {item.features.map((feature) => (
                    <div key={feature} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="agendar" className="border-t border-white/10 bg-[linear-gradient(180deg,_rgba(245,158,11,0.08),_rgba(8,8,8,1))]">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionTitle
                eyebrow="Contrate agora"
                title="Receba uma resposta rapida e envie seu pedido direto para o WhatsApp"
                description="Preencha os dados abaixo, envie a solicitacao e continue a conversa com mensagem automatica pronta."
              />
              <div className="mt-8 rounded-[2rem] border border-white/10 bg-black/40 p-6">
                <div className="flex items-center gap-3 text-slate-300">
                  <Phone className="h-5 w-5 text-amber-300" />
                  <span>Contato para shows: {formatPhone(content.whatsappNumber)}</span>
                </div>
                <div className="mt-4 flex items-center gap-3 text-slate-300">
                  <Instagram className="h-5 w-5 text-amber-300" />
                  <a href={content.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-amber-200">
                    {content.instagramUrl.replace('https://', '')}
                  </a>
                </div>
                <div className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-400/10 p-5 text-sm leading-7 text-amber-100">
                  Sugestao automatica para <strong>{formData.eventType}</strong>: {getBudgetHint(formData.eventType)}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-black/50 p-6 md:p-8">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 md:col-span-1">
                  <span className="text-sm text-slate-300">Nome do cliente</span>
                  <input
                    required
                    value={formData.clientName}
                    onChange={(event) => setFormData((current) => ({ ...current, clientName: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300"
                    placeholder="Seu nome"
                  />
                </label>
                <label className="space-y-2 md:col-span-1">
                  <span className="text-sm text-slate-300">Telefone / WhatsApp</span>
                  <input
                    required
                    value={formData.phone}
                    onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300"
                    placeholder="(86) 99999-9999"
                  />
                </label>
                <label className="space-y-2 md:col-span-1">
                  <span className="text-sm text-slate-300">Data do evento</span>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={formData.eventDate}
                    onChange={(event) => setFormData((current) => ({ ...current, eventDate: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300"
                  />
                </label>
                <label className="space-y-2 md:col-span-1">
                  <span className="text-sm text-slate-300">Tipo de evento</span>
                  <select
                    value={formData.eventType}
                    onChange={(event) => setFormData((current) => ({ ...current, eventType: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300"
                  >
                    {eventTypes.map((type) => (
                      <option key={type} value={type} className="bg-[#101010]">
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-slate-300">Local do evento</span>
                  <input
                    required
                    value={formData.eventLocation}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, eventLocation: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300"
                    placeholder="Cidade, bairro ou espaco do evento"
                  />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-slate-300">Mensagem adicional</span>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(event) => setFormData((current) => ({ ...current, message: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300"
                    placeholder="Conte um pouco sobre o evento, horario e estrutura desejada"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Enviando...' : 'Enviar e abrir WhatsApp'}
              </button>
              {feedback ? <p className="mt-4 text-sm text-amber-100">{feedback}</p> : null}
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
