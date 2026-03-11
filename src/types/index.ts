export interface Event {
  id: string;
  name: string;
  organizer: string;
  email: string;
  location: string;
  venue: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  eventType: 'celebration' | 'discussion' | 'exhibition' | 'performance' | 'workshop';
  description: string;
  accessibility: string;
  ticketPrice: number | null;
  ticketLink: string;
  facebookLink: string;
  images: string[];
  editToken: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  image?: string;
  category: 'before' | 'reform' | 'after';
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption: string;
  span?: 'normal' | 'wide' | 'tall';
}

export type EventType = 'all' | 'celebration' | 'discussion' | 'exhibition' | 'performance' | 'workshop';
export type LocationFilter = 'all' | 'Auckland' | 'Wellington' | 'Christchurch' | 'Dunedin' | 'Other';
export type CostFilter = 'all' | 'free' | 'paid';
