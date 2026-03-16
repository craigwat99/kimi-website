import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

const sampleEvents = [
  {
    name: '40 Years Celebration Gala',
    organiser: 'Rainbow Communities NZ',
    email: 'info@rainbownz.org',
    location: 'Auckland',
    venue: 'Auckland Town Hall',
    address: '303 Queen Street, Auckland CBD, Auckland 1010',
    latitude: -36.8485,
    longitude: 174.7633,
    startDate: '2026-07-08',
    endDate: '2026-07-08',
    startTime: '19:00',
    endTime: '23:00',
    eventType: 'celebration',
    description: 'A grand celebration marking 40 years since the Homosexual Law Reform Act. Join us for an evening of reflection, celebration, and looking toward the future.',
    accessibility: 'Wheelchair accessible, NZSL interpreters available, quiet room available',
    ticketPrice: 45,
    ticketLink: 'https://example.com/tickets',
    facebookLink: 'https://facebook.com/events/example',
    images: ['/event-celebration.jpg'],
    editToken: '',
    approved: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    name: 'History Talk: The Journey to Reform',
    organiser: 'Wellington Heritage',
    email: 'heritage@wellington.nz',
    location: 'Wellington',
    venue: 'National Library Auditorium',
    address: '70 Molesworth Street, Thorndon, Wellington 6011',
    latitude: -41.2769,
    longitude: 174.7760,
    startDate: '2026-07-10',
    endDate: '2026-07-10',
    startTime: '18:30',
    endTime: '20:30',
    eventType: 'discussion',
    description: 'Hear from activists who were there during the 1985-1986 campaign. Learn about the challenges, triumphs, and what it took to achieve law reform.',
    accessibility: 'Wheelchair accessible, Hearing loop installed',
    ticketPrice: null,
    ticketLink: '',
    facebookLink: 'https://facebook.com/events/history-talk',
    images: ['/event-discussion.jpg'],
    editToken: '',
    approved: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    name: 'Through the Lens: 40 Years of Pride',
    organiser: 'Christchurch Art Gallery',
    email: 'exhibitions@christchurch.art',
    location: 'Christchurch',
    venue: 'Christchurch Art Gallery',
    address: '49 Worcester Boulevard, Christchurch Central City, Christchurch 8013',
    latitude: -43.5306,
    longitude: 172.6329,
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    startTime: '10:00',
    endTime: '17:00',
    eventType: 'exhibition',
    description: 'A photographic exhibition documenting the rainbow community in New Zealand from 1986 to today. Rare archival images alongside contemporary photography.',
    accessibility: 'Fully wheelchair accessible, Audio descriptions available',
    ticketPrice: null,
    ticketLink: '',
    facebookLink: 'https://facebook.com/events/exhibition',
    images: ['/event-exhibition.jpg'],
    editToken: '',
    approved: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    name: 'Stories of Resilience - Theatre Performance',
    organiser: 'Dunedin Pride',
    email: 'dunedin@pride.org.nz',
    location: 'Dunedin',
    venue: 'Regent Theatre',
    address: '17 The Octagon, Dunedin Central, Dunedin 9016',
    latitude: -45.8742,
    longitude: 170.5036,
    startDate: '2026-07-15',
    endDate: '2026-07-15',
    startTime: '20:00',
    endTime: '22:00',
    eventType: 'performance',
    description: 'An original theatre production sharing stories from the law reform era. Written and performed by local LGBTQ+ artists.',
    accessibility: 'Wheelchair accessible, NZSL interpreted performance on July 17',
    ticketPrice: 25,
    ticketLink: 'https://example.com/theatre-tickets',
    facebookLink: 'https://facebook.com/events/theatre',
    images: ['/event-performance.jpg'],
    editToken: '',
    approved: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    name: 'Youth Workshop: Creating Inclusive Spaces',
    organiser: 'Rainbow Youth',
    email: 'workshops@rainbowyouth.org.nz',
    location: 'Auckland',
    venue: 'Rainbow Youth Centre',
    address: '281 Karangahape Road, Auckland CBD, Auckland 1010',
    latitude: -36.8590,
    longitude: 174.7584,
    startDate: '2026-07-12',
    endDate: '2026-07-12',
    startTime: '14:00',
    endTime: '17:00',
    eventType: 'workshop',
    description: 'A workshop for young people on creating and maintaining inclusive spaces in schools and communities. Open to all youth aged 14-24.',
    accessibility: 'Wheelchair accessible, Sensory-friendly environment',
    ticketPrice: null,
    ticketLink: '',
    facebookLink: 'https://facebook.com/events/youth-workshop',
    images: ['/event-workshop.jpg'],
    editToken: '',
    approved: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const store = getStore("events");
    const { blobs } = await store.list();

    // Only seed if the store is empty
    if (blobs.length > 0) {
      return new Response(JSON.stringify({ seeded: false, message: "Events already exist", count: blobs.length }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    for (let i = 0; i < sampleEvents.length; i++) {
      const id = `event-sample-${i + 1}`;
      await store.setJSON(id, sampleEvents[i]);
    }

    return new Response(JSON.stringify({ seeded: true, count: sampleEvents.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error seeding events:", err);
    return new Response(JSON.stringify({ error: "Failed to seed events" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
