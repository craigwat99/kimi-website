import { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Calendar, Clock, ExternalLink, Facebook, Filter, X, Search } from 'lucide-react';
import type { Event, EventType, LocationFilter, CostFilter } from '../types';
import { formatDate, formatTime, formatPrice } from '../utils/tokens';

interface EventsProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  onSubmitClick: () => void;
}

export function Events({ events, onEventClick, onSubmitClick }: EventsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  const [typeFilter, setTypeFilter] = useState<EventType>('all');
  const [costFilter, setCostFilter] = useState<CostFilter>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (locationFilter !== 'all' && event.location !== locationFilter) return false;
      if (typeFilter !== 'all' && event.eventType !== typeFilter) return false;
      if (costFilter === 'free' && event.ticketPrice !== null && event.ticketPrice > 0) return false;
      if (costFilter === 'paid' && (event.ticketPrice === null || event.ticketPrice === 0)) return false;
      if (dateFilter && event.startDate !== dateFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          event.name.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.organiser.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      return true;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events, locationFilter, typeFilter, costFilter, dateFilter, searchQuery]);

  const locations = ['all', 'Auckland', 'Wellington', 'Christchurch', 'Dunedin', 'Other'] as const;
  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'celebration', label: 'Celebration' },
    { value: 'discussion', label: 'Discussion' },
    { value: 'exhibition', label: 'Exhibition' },
    { value: 'performance', label: 'Performance' },
    { value: 'workshop', label: 'Workshop' },
  ] as const;
  const costs = [
    { value: 'all', label: 'All Events' },
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid' },
  ] as const;

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

  const clearFilters = () => {
    setLocationFilter('all');
    setTypeFilter('all');
    setCostFilter('all');
    setDateFilter('');
    setSearchQuery('');
  };

  const hasActiveFilters = locationFilter !== 'all' || typeFilter !== 'all' || costFilter !== 'all' || dateFilter || searchQuery;

  return (
    <section
      ref={sectionRef}
      id="events"
      className="relative py-24 sm:py-32 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl leading-normal sm:leading-normal lg:leading-normal font-bold mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <span className="gradient-text">Join the celebrations</span>
          </h2>
                      
        {/* Body text */}
        <div className="space-y-6 text-lg sm:text-xl text-gray-700 leading-relaxed">
          <p
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <strong className="text-[#784982]">Find an event happening around Aotearoa.</strong>
          </p>

          <p
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            Are you a historian, event producer, community organisation or just passionate about our queer culture – why not organise an event and submit it here
          </p>

          <p 
            className={`text-white/70 max-w-xl mx-auto mb-10 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            All events submitted by 1 June 2026, will be included in the printed programme, being distrusted around the country.
          </p>

        </div>                      

         

        </div>

        {/* Search and Filter Bar */}
        <div
          className={`mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-[#784982] focus:ring-2 focus:ring-[#784982]/20 outline-none transition-all"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                showFilters
                  ? 'bg-[#784982] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-[#784982]'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 w-5 h-5 rounded-full bg-[#e5c858] text-white text-xs flex items-center justify-center">
                  {[locationFilter, typeFilter, costFilter].filter(f => f !== 'all').length + (dateFilter ? 1 : 0) + (searchQuery ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Submit event button */}
            <button
              onClick={onSubmitClick}
              className="btn-primary"
            >
              + Add Your Event
            </button>
          </div>

          {/* Expanded filters */}
          <div
            className={`overflow-hidden transition-all duration-500 ${
              showFilters ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Location filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value as LocationFilter)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#784982] focus:ring-2 focus:ring-[#784982]/20 outline-none transition-all"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc === 'all' ? 'All Locations' : loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as EventType)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#784982] focus:ring-2 focus:ring-[#784982]/20 outline-none transition-all"
                  >
                    {types.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cost filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cost</label>
                  <select
                    value={costFilter}
                    onChange={(e) => setCostFilter(e.target.value as CostFilter)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#784982] focus:ring-2 focus:ring-[#784982]/20 outline-none transition-all"
                  >
                    {costs.map((cost) => (
                      <option key={cost.value} value={cost.value}>
                        {cost.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#784982] focus:ring-2 focus:ring-[#784982]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 flex items-center gap-2 text-sm text-[#784982] hover:text-[#e5c858] transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 text-sm text-gray-500">
          Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className={`group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer card-3d ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getEventImage(event)}
                    alt={event.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  
                  {/* Type badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-[#784982] backdrop-blur-sm">
                      {getEventTypeLabel(event.eventType)}
                    </span>
                  </div>

                  {/* Price badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.ticketPrice === null || event.ticketPrice === 0
                        ? 'bg-green-500 text-white'
                        : 'bg-[#e5c858] text-white'
                    }`}>
                      {formatPrice(event.ticketPrice)}
                    </span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg line-clamp-2 group-hover:text-[#e5c858] transition-colors">
                      {event.name}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-[#784982]" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-[#784982]" />
                    <span>{formatTime(event.startTime)}{event.endTime ? ` - ${formatTime(event.endTime)}` : ''}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-[#784982]" />
                    <span>{event.location} • {event.venue}</span>
                  </div>

                  {/* Organiser */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      Organised by <span className="font-medium text-gray-700">{event.organiser}</span>
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2">
                    {event.ticketLink && (
                      <a
                        href={event.ticketLink}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#784982] text-white text-sm font-medium hover:bg-[#5a3562] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Tickets
                      </a>
                    )}
                    {event.facebookLink && (
                      <a
                        href={event.facebookLink}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
