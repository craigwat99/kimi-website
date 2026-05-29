import { useState, useEffect, useCallback } from 'react';
import { Navigation } from './Navigation';
import { Events } from './Events';
import { EventDetailModal } from './EventDetailModal';
import { SubmitEvent } from './SubmitEvent';
import { EditEvent } from './EditEvent';
import { Footer } from './Footer';
import type { Event } from '../types';
import { generateEditToken } from '../utils/tokens';
import '../App.css';

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  // Fetch events from server on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/.netlify/functions/get-events');
        const data = await res.json();
        if (data.events && data.events.length > 0) {
          setEvents(data.events);
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      }
    };
    fetchEvents();
  }, []);

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

    fetch('/.netlify/functions/save-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event }),
    }).catch(err => console.error('Failed to save event:', err));

    return event.editToken;
  }, []);

  const handleUpdateEvent = useCallback((updatedEvent: Event) => {
    const updated = { ...updatedEvent, updatedAt: new Date().toISOString() };
    setEvents(prev => prev.map(e =>
      e.id === updatedEvent.id ? updated : e
    ));
    setEditingEvent(null);

    fetch('/.netlify/functions/save-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: updated }),
    }).catch(err => console.error('Failed to update event:', err));
  }, []);

  const handleDeleteEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setEditingEvent(null);

    fetch('/.netlify/functions/delete-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    }).catch(err => console.error('Failed to delete event:', err));
  }, []);

  // Section links live on the home page — fall back to navigating there with a hash.
  const navigateToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };

  // Only show approved events on the public site
  const approvedEvents = events.filter(e => e.approved !== false);

  return (
    <div className="min-h-screen bg-white">
      <Navigation onNavigate={navigateToSection} />

      <main className="pt-20">
        <Events
          events={approvedEvents}
          onEventClick={setSelectedEvent}
          onSubmitClick={() => setShowSubmitForm(true)}
        />

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

      <Footer onNavigate={navigateToSection} />
    </div>
  );
}
