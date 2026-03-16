import { useEffect, useState } from 'react';
import { X, MapPin, Calendar, Clock, Accessibility, DollarSign, ExternalLink, Facebook, Edit3, Check } from 'lucide-react';
import type { Event } from '../types';
import { formatDate, formatTime, formatPrice } from '../utils/tokens';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getGoogleMapsEmbedUrl, getStaticMapUrl } from '../hooks/useGoogleMaps';

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onEditRequest: (event: Event) => void;
}

export function EventDetailModal({ event, isOpen, onClose, onEditRequest }: EventDetailModalProps) {
  const [showEditVerify, setShowEditVerify] = useState(false);
  const [editToken, setEditToken] = useState('');
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setShowEditVerify(false);
      setEditToken('');
      setTokenError('');
    }
  }, [isOpen]);

  if (!event) return null;

  const handleVerifyToken = () => {
    if (editToken === event.editToken) {
      setTokenError('');
      onEditRequest(event);
    } else {
      setTokenError('Invalid edit token. Please check your email or contact the event organiser.');
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      celebration: 'Celebration',
      discussion: 'Discussion',
      exhibition: 'Exhibition',
      performance: 'Performance',
      workshop: 'Workshop',
    };
    return labels[type] || type;
  };

  const getEventImage = (event: Event) => {
    if (event.images && event.images[0]) return event.images[0];
    const typeImages: Record<string, string> = {
      celebration: '/event-celebration.jpg',
      discussion: '/event-discussion.jpg',
      exhibition: '/event-exhibition.jpg',
      performance: '/event-performance.jpg',
      workshop: '/event-workshop.jpg',
    };
    return typeImages[event.eventType] || '/event-celebration.jpg';
  };

  const hasLocation = event.latitude && event.longitude;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Image Header */}
        <div className="relative h-64 sm:h-80">
          <img
            src={getEventImage(event)}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-[#5A2E88] mb-3">
              {getEventTypeLabel(event.eventType)}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{event.name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-[#5A2E88] mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Date</p>
                <p className="text-gray-600">{formatDate(event.startDate)}</p>
                {event.endDate && event.startDate !== event.endDate && (
                  <p className="text-gray-600">to {formatDate(event.endDate)}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-[#5A2E88] mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Time</p>
                <p className="text-gray-600">{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 text-[#5A2E88] mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Location</p>
                <p className="text-gray-600">{event.venue}</p>
                {event.address ? (
                  <p className="text-gray-500 text-sm">{event.address}</p>
                ) : (
                  <p className="text-gray-500 text-sm">{event.location}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <DollarSign className="w-5 h-5 text-[#5A2E88] mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Tickets</p>
                <p className="text-gray-600">{formatPrice(event.ticketPrice)}</p>
              </div>
            </div>
          </div>

          {/* Map */}
          {hasLocation && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Venue Location</h3>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <iframe
                  src={getGoogleMapsEmbedUrl(event.latitude!, event.longitude!)}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Event location map"
                />
              </div>
              <a
                href={getStaticMapUrl(event.latitude!, event.longitude!)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[#5A2E88] hover:text-[#E91E8C] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open in maps
              </a>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">About This Event</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Accessibility */}
          {event.accessibility && (
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
              <Accessibility className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Accessibility Information</p>
                <p className="text-green-700 text-sm">{event.accessibility}</p>
              </div>
            </div>
          )}

          {/* Organiser */}
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <h3 className="text-sm font-semibold text-[#5A2E88] mb-3 uppercase tracking-wider">Organiser</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5A2E88] to-[#E91E8C] flex items-center justify-center text-white font-bold text-lg">
                {event.organiser.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{event.organiser}</p>
                <p className="text-gray-500 text-sm">{event.email}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            {event.ticketLink && (
              <a
                href={event.ticketLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#5A2E88] to-[#E91E8C] text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                <ExternalLink className="w-5 h-5" />
                Get Tickets
              </a>
            )}

            {event.facebookLink && (
              <a
                href={event.facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 hover:shadow-lg transition-all"
              >
                <Facebook className="w-5 h-5" />
                Facebook Event
              </a>
            )}

            {/* Edit button */}
            {!showEditVerify ? (
              <button
                onClick={() => setShowEditVerify(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-[#5A2E88] hover:text-[#5A2E88] transition-all"
              >
                <Edit3 className="w-5 h-5" />
                Edit Event
              </button>
            ) : (
              <div className="w-full p-4 bg-gray-50 rounded-xl space-y-3">
                <p className="text-sm text-gray-600">
                  Enter your edit token to modify this event:
                </p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter edit token"
                    value={editToken}
                    onChange={(e) => setEditToken(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleVerifyToken} className="bg-[#5A2E88]">
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
                {tokenError && (
                  <p className="text-sm text-red-600">{tokenError}</p>
                )}
                <p className="text-xs text-gray-500">
                  The edit token was provided when the event was created. Check your email or contact the organiser.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
