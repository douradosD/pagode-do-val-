import { MessageCircleMore } from 'lucide-react';

interface WhatsAppButtonProps {
  phone: string;
}

export function WhatsAppButton({ phone }: WhatsAppButtonProps) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(
    'Oi! Quero saber mais sobre o Pagode do Val.',
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-emerald-950/30 transition hover:scale-105 hover:bg-emerald-400"
      aria-label="Conversar no WhatsApp"
    >
      <MessageCircleMore className="h-5 w-5" />
      WhatsApp
    </a>
  );
}
