export type BookingStatus = 'pending' | 'approved' | 'rejected';

export interface BandContent {
  bandName: string;
  slogan: string;
  location: string;
  description: string;
  longDescription: string;
  musicalStyle: string[];
  whatsappNumber: string;
  instagramUrl: string;
  heroImage: string;
  highlightNumbers: Array<{
    label: string;
    value: string;
  }>;
  gallery: Array<{
    id: string;
    title: string;
    image: string;
    description: string;
  }>;
  videos: Array<{
    id: string;
    title: string;
    embedUrl: string;
  }>;
  testimonials: Array<{
    id: string;
    name: string;
    role: string;
    quote: string;
    rating: number;
  }>;
  budgetPackages: Array<{
    id: string;
    name: string;
    priceLabel: string;
    description: string;
    features: string[];
  }>;
}

export interface PublicSchedule {
  occupiedDates: string[];
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    city: string;
    venue: string;
    status: BookingStatus;
  }>;
}

export interface BookingPayload {
  clientName: string;
  phone: string;
  eventDate: string;
  eventLocation: string;
  eventType: string;
  message?: string;
}

export interface BookingRecord extends BookingPayload {
  id: string;
  status: BookingStatus;
  createdAt: string;
}

export interface BookingResponse {
  booking: BookingRecord;
  whatsappUrl: string;
  confirmationMessage: string;
}
