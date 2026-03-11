import { useState } from 'react';
import { Check, Copy, Calendar, MapPin, User, Mail, DollarSign, Link, Facebook, FileText, Accessibility } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Event } from '../types';

interface SubmitEventProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<Event, 'id' | 'editToken' | 'createdAt' | 'updatedAt'>) => string;
}

export function SubmitEvent({ isOpen, onClose, onSubmit }: SubmitEventProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [editToken, setEditToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    organizer: '',
    email: '',
    location: '',
    venue: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    eventType: 'celebration' as const,
    description: '',
    accessibility: '',
    ticketPrice: '',
    ticketLink: '',
    facebookLink: '',
    images: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Event name is required';
    if (!formData.organizer.trim()) newErrors.organizer = 'Organiser name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const eventData = {
      ...formData,
      ticketPrice: formData.ticketPrice ? parseFloat(formData.ticketPrice) : null,
    };

    const token = onSubmit(eventData);
    setEditToken(token);
    setStep('success');

    // Attempt to send the edit token via email
    setEmailSent(null);
    fetch('/.netlify/functions/send-edit-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        eventName: formData.name,
        editToken: token,
      }),
    })
      .then((res) => res.json())
      .then((data) => setEmailSent(data.sent === true))
      .catch(() => setEmailSent(false));
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(editToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      name: '',
      organizer: '',
      email: '',
      location: '',
      venue: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      eventType: 'celebration',
      description: '',
      accessibility: '',
      ticketPrice: '',
      ticketLink: '',
      facebookLink: '',
      images: [],
    });
    setErrors({});
    setEmailSent(null);
    onClose();
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">
            {step === 'form' ? 'Add Your Event' : 'Event Submitted!'}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Basic Information</h3>
              
              <div>
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., 40 Years Celebration"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizer">Organiser Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="organizer"
                      value={formData.organizer}
                      onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                      placeholder="Your organisation"
                      className={`pl-10 ${errors.organizer ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.organizer && <p className="text-sm text-red-500 mt-1">{errors.organizer}</p>}
                </div>

                <div>
                  <Label htmlFor="email">Contact Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
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
                  <Label htmlFor="location">City/Region *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                  >
                    <SelectTrigger className={errors.location ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select location" />
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
                  <Label htmlFor="venue">Venue *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      placeholder="Venue name"
                      className={`pl-10 ${errors.venue ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.venue && <p className="text-sm text-red-500 mt-1">{errors.venue}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={`pl-10 ${errors.startDate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <Label htmlFor="endDate">End Date (if multi-day)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className={errors.startTime ? 'border-red-500' : ''}
                  />
                  {errors.startTime && <p className="text-sm text-red-500 mt-1">{errors.startTime}</p>}
                </div>

                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Event Details</h3>
              
              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Select
                  value={formData.eventType}
                  onValueChange={(value) => setFormData({ ...formData, eventType: value as typeof formData.eventType })}
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
                <Label htmlFor="description">Description *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell people about your event..."
                    rows={4}
                    className={`pl-10 ${errors.description ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>

              <div>
                <Label htmlFor="accessibility">Accessibility Information</Label>
                <div className="relative">
                  <Accessibility className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Textarea
                    id="accessibility"
                    value={formData.accessibility}
                    onChange={(e) => setFormData({ ...formData, accessibility: e.target.value })}
                    placeholder="e.g., Wheelchair accessible, NZSL interpreters available..."
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
                  <Label htmlFor="ticketPrice">Ticket Price (leave blank for free)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="ticketPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.ticketPrice}
                      onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ticketLink">Ticket Link</Label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="ticketLink"
                      type="url"
                      value={formData.ticketLink}
                      onChange={(e) => setFormData({ ...formData, ticketLink: e.target.value })}
                      placeholder="https://..."
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="facebookLink">Facebook Event Link</Label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="facebookLink"
                    type="url"
                    value={formData.facebookLink}
                    onChange={(e) => setFormData({ ...formData, facebookLink: e.target.value })}
                    placeholder="https://facebook.com/events/..."
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#5A2E88] to-[#E91E8C] hover:opacity-90"
              >
                Submit Event
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-6 py-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your event has been submitted!</h3>
              <p className="text-gray-600">
                Save this edit token - you'll need it to make changes to your event:
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <code className="flex-1 text-sm font-mono text-[#5A2E88] break-all">{editToken}</code>
              <button
                onClick={handleCopyToken}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-[#5A2E88] text-white hover:bg-[#3D1C5E]'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <p className="text-sm text-gray-500">
              {emailSent === true
                ? "We've also sent this token to your email for safekeeping."
                : emailSent === false
                ? 'Please copy and save this token now — it could not be sent to your email.'
                : 'Sending a copy of this token to your email...'}
            </p>

            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-[#5A2E88] to-[#E91E8C]"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
