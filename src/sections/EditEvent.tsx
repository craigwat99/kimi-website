import { useState, useEffect } from 'react';
import { Calendar, MapPin, User, Mail, DollarSign, Link, Facebook, FileText, Accessibility, Trash2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Event } from '../types';

interface EditEventProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

export function EditEvent({ event, isOpen, onClose, onUpdate, onDelete }: EditEventProps) {
  const [formData, setFormData] = useState<Partial<Event>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      setFormData({ ...event });
    }
  }, [event]);

  if (!event) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) newErrors.name = 'Event name is required';
    if (!formData.organizer?.trim()) newErrors.organizer = 'Organiser name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.location?.trim()) newErrors.location = 'Location is required';
    if (!formData.venue?.trim()) newErrors.venue = 'Venue is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onUpdate({ ...event, ...formData } as Event);
  };

  const handleDelete = () => {
    onDelete(event.id);
    setShowDeleteConfirm(false);
  };

  const locations = ['Auckland', 'Wellington', 'Christchurch', 'Dunedin', 'Hamilton', 'Tauranga', 'Nelson', 'Other'];
  const eventTypes = [
    { value: 'celebration', label: 'Celebration' },
    { value: 'discussion', label: 'Discussion' },
    { value: 'exhibition', label: 'Exhibition' },
    { value: 'performance', label: 'Performance' },
    { value: 'workshop', label: 'Workshop' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">
            Edit Event
          </DialogTitle>
        </DialogHeader>

        {showDeleteConfirm ? (
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl">
              <AlertTriangle className="w-10 h-10 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Delete this event?</h3>
                <p className="text-red-600 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Event
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Basic Information</h3>
              
              <div>
                <Label htmlFor="edit-name">Event Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-organizer">Organizer Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="edit-organizer"
                      value={formData.organizer || ''}
                      onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                      className={`pl-10 ${errors.organizer ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.organizer && <p className="text-sm text-red-500 mt-1">{errors.organizer}</p>}
                </div>

                <div>
                  <Label htmlFor="edit-email">Contact Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="edit-email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Location & Date */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Location & Date</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-location">City/Region *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                  >
                    <SelectTrigger className={errors.location ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
                </div>

                <div>
                  <Label htmlFor="edit-venue">Venue *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="edit-venue"
                      value={formData.venue || ''}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      className={`pl-10 ${errors.venue ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.venue && <p className="text-sm text-red-500 mt-1">{errors.venue}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-startDate">Start Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="edit-startDate"
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={`pl-10 ${errors.startDate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <Label htmlFor="edit-endDate">End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="edit-endDate"
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-startTime">Start Time *</Label>
                  <Input
                    id="edit-startTime"
                    type="time"
                    value={formData.startTime || ''}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className={errors.startTime ? 'border-red-500' : ''}
                  />
                  {errors.startTime && <p className="text-sm text-red-500 mt-1">{errors.startTime}</p>}
                </div>

                <div>
                  <Label htmlFor="edit-endTime">End Time</Label>
                  <Input
                    id="edit-endTime"
                    type="time"
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Event Details</h3>
              
              <div>
                <Label htmlFor="edit-eventType">Event Type</Label>
                <Select
                  value={formData.eventType}
                  onValueChange={(value) => setFormData({ ...formData, eventType: value as Event['eventType'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-description">Description *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Textarea
                    id="edit-description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className={`pl-10 ${errors.description ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>

              <div>
                <Label htmlFor="edit-accessibility">Accessibility Information</Label>
                <div className="relative">
                  <Accessibility className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Textarea
                    id="edit-accessibility"
                    value={formData.accessibility || ''}
                    onChange={(e) => setFormData({ ...formData, accessibility: e.target.value })}
                    rows={2}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Tickets & Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tickets & Links</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-ticketPrice">Ticket Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="edit-ticketPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.ticketPrice === null ? '' : formData.ticketPrice}
                      onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="Free"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-ticketLink">Ticket Link</Label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="edit-ticketLink"
                      type="url"
                      value={formData.ticketLink || ''}
                      onChange={(e) => setFormData({ ...formData, ticketLink: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-facebookLink">Facebook Event Link</Label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="edit-facebookLink"
                    type="url"
                    value={formData.facebookLink || ''}
                    onChange={(e) => setFormData({ ...formData, facebookLink: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#5A2E88] to-[#E91E8C] hover:opacity-90"
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
