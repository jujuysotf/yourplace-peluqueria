export type ServiceCategory = 'all' | 'cortes' | 'color' | 'tratamientos' | 'eventos';

export interface Service {
  id: string;
  name: string;
  category: 'cortes' | 'color' | 'tratamientos' | 'eventos';
  durationMinutes: number;
  durationLabel: string;
  price: number;
  formattedPrice: string;
  description: string;
  popular?: boolean;
  features?: string[];
  image?: string;
}

export interface Stylist {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  specialties: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: 'color' | 'cortes' | 'tratamientos' | 'eventos';
  categoryLabel: string;
  image: string;
  description: string;
  tags: string[];
  stylist: string;
}

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'guest';
}

export interface Booking {
  id: string;
  referenceCode: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  stylistId: string;
  stylistName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientNotes?: string;
  clientAuthProvider?: 'google' | 'guest';
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  syncedToGoogleCalendar?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  service: string;
  comment: string;
  rating: number;
  date: string;
  clientAvatar?: string;
}

export interface SalonInfo {
  name: string;
  tagline: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  whatsappMessage: string;
  email: string;
  address: string;
  city: string;
  hours: {
    days: string;
    time: string;
  }[];
  socials: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
}
