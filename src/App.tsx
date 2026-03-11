import { useState, useEffect, useCallback } from 'react';
import { Navigation } from './sections/Navigation';
import { Hero } from './sections/Hero';
import { Introduction } from './sections/Introduction';
import { Events } from './sections/Events';
import { EventDetailModal } from './sections/EventDetailModal';
import { SubmitEvent } from './sections/SubmitEvent';
import { EditEvent } from './sections/EditEvent';
import { HistoryTimeline } from './sections/HistoryTimeline';
import { Gallery } from './sections/Gallery';
import { Footer } from './sections/Footer';
import type { Event } from './types';
import { generateEditToken } from './utils/tokens';
import './App.css';

// Sample initial events
const sampleEvents: Event[] = [
  {
    id: '1',
    name: '40 Years Celebration Gala',
    organizer: 'Rainbow Communities NZ',
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
    editToken: generateEditToken(),
    approved: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'History Talk: The Journey to Reform',
    organizer: 'Wellington Heritage',
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
    editToken: generateEditToken(),
    approved: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Through the Lens: 40 Years of Pride',
    organizer: 'Christchurch Art Gallery',
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
    editToken: generateEditToken(),
    approved: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Stories of Resilience - Theatre Performance',
    organizer: 'Dunedin Pride',
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
    editToken: generateEditToken(),
    approved: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Youth Workshop: Creating Inclusive Spaces',
    organizer: 'Rainbow Youth',
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
    editToken: generateEditToken(),
    approved: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function App() {
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('hlr-events');
    if (saved) {
      return JSON.parse(saved);
    }
    return sampleEvents;
  });
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('hlr-events', JSON.stringify(events));
  }, [events]);

  const handleAddEvent = useCallback((newEvent: Omit<Event, 'id' | 'editToken' | 'approved' | 'createdAt' | 'updatedAt'>) => {
    const event: Event = {
      ...newEvent,
      id: Date.now().toString(),
      editToken: generateEditToken(),
      approved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEvents(prev => [event, ...prev]);
    return event.editToken;
  }, []);

  const handleUpdateEvent = useCallback((updatedEvent: Event) => {
    setEvents(prev => prev.map(e => 
      e.id === updatedEvent.id 
        ? { ...updatedEvent, updatedAt: new Date().toISOString() }
        : e
    ));
    setEditingEvent(null);
  }, []);

  const handleDeleteEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setEditingEvent(null);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Only show approved events on the public site
  const approvedEvents = events.filter(e => e.approved !== false);

  return (
    <div className="min-h-screen bg-white">
      <Navigation onNavigate={scrollToSection} />

      <main>
        <Hero />
        <Introduction />

        <Events
          events={approvedEvents}
          onEventClick={setSelectedEvent}
          onSubmitClick={() => setShowSubmitForm(true)}
        />
        
        <HistoryTimeline />
        
        <Gallery />
        
        <SubmitEvent 
          isOpen={showSubmitForm}
          onClose={() => setShowSubmitForm(false)}
          onSubmit={handleAddEvent}
        />
        
        <EditEvent
          event={editingEvent}
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          onUpdate={handleUpdateEvent}
          onDelete={handleDeleteEvent}
        />
        
        <EventDetailModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEditRequest={(event) => {
            setSelectedEvent(null);
            setEditingEvent(event);
          }}
        />
      </main>
      
      <Footer onNavigate={scrollToSection} />
    </div>
  );
}

export default App;
