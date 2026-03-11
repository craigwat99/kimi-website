import { useState, useEffect, useCallback } from 'react';
import { LogOut, Check, X, Trash2, Edit3, Eye, EyeOff, Copy, Search, Shield, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Event } from '../types';
import { formatDate } from '../utils/tokens';

const SESSION_KEY = 'hlr-admin-session';

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Load events from localStorage
  const loadEvents = useCallback(() => {
    const saved = localStorage.getItem('hlr-events');
    if (saved) {
      setEvents(JSON.parse(saved));
    }
  }, []);

  // Save events to localStorage
  const saveEvents = useCallback((updatedEvents: Event[]) => {
    localStorage.setItem('hlr-events', JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  }, []);

  // Check for existing session
  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load events when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [isAuthenticated, loadEvents]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await fetch('/.netlify/functions/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.authenticated) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setLoginError(data.error || 'Invalid password');
      }
    } catch {
      setLoginError('Unable to verify password. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleApprove = (eventId: string) => {
    const updated = events.map(e =>
      e.id === eventId ? { ...e, approved: true, updatedAt: new Date().toISOString() } : e
    );
    saveEvents(updated);
  };

  const handleReject = (eventId: string) => {
    const updated = events.map(e =>
      e.id === eventId ? { ...e, approved: false, updatedAt: new Date().toISOString() } : e
    );
    saveEvents(updated);
  };

  const handleDelete = (eventId: string) => {
    const updated = events.filter(e => e.id !== eventId);
    saveEvents(updated);
    setDeleteConfirm(null);
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    const updated = events.map(e =>
      e.id === updatedEvent.id ? { ...updatedEvent, updatedAt: new Date().toISOString() } : e
    );
    saveEvents(updated);
    setEditingEvent(null);
  };

  const toggleTokenVisibility = (eventId: string) => {
    setVisibleTokens(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  const copyToken = (token: string, eventId: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(eventId);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const filteredEvents = events.filter(event => {
    if (statusFilter === 'approved' && !event.approved) return false;
    if (statusFilter === 'pending' && event.approved) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        event.name.toLowerCase().includes(q) ||
        event.organiser.toLowerCase().includes(q) ||
        event.email.toLowerCase().includes(q) ||
        event.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = events.filter(e => !e.approved).length;
  const approvedCount = events.filter(e => e.approved).length;

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5A2E88]/5 via-white to-[#E91E8C]/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-[#5A2E88] to-[#E91E8C] mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">40 Years - Homosexual Law Reform</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div>
              <Label htmlFor="admin-password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {loginError}
              </div>
            )}

            <Button
              type="submit"
              disabled={loginLoading || !password}
              className="w-full bg-gradient-to-r from-[#5A2E88] to-[#E91E8C] hover:opacity-90"
            >
              {loginLoading ? 'Verifying...' : 'Sign In'}
            </Button>

            <div className="text-center">
              <a href="/" className="text-sm text-gray-500 hover:text-[#5A2E88] transition-colors">
                Back to site
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#5A2E88] to-[#E91E8C] flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="/" className="text-sm text-gray-500 hover:text-[#5A2E88] transition-colors">
                View Site
              </a>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Events</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{events.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{approvedCount}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Pending Approval</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, organiser, email, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'bg-[#5A2E88] hover:bg-[#3D1C5E]' : ''}
              >
                All ({events.length})
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
                className={statusFilter === 'pending' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                Pending ({pendingCount})
              </Button>
              <Button
                variant={statusFilter === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('approved')}
                className={statusFilter === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                Approved ({approvedCount})
              </Button>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Organiser</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Edit Token</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="font-medium text-gray-900 truncate">{event.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{event.eventType}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-gray-900">{event.organiser}</p>
                        <p className="text-xs text-gray-500">{event.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-700">{event.location}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-700">{formatDate(event.startDate)}</span>
                    </TableCell>
                    <TableCell>
                      {event.approved ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {visibleTokens.has(event.id)
                            ? event.editToken
                            : '••••••••••••••••'}
                        </code>
                        <button
                          onClick={() => toggleTokenVisibility(event.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title={visibleTokens.has(event.id) ? 'Hide token' : 'Show token'}
                        >
                          {visibleTokens.has(event.id) ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToken(event.editToken, event.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy token"
                        >
                          {copiedToken === event.id ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {!event.approved ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(event.id)}
                            className="text-green-600 border-green-200 hover:bg-green-50 h-8 px-2"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(event.id)}
                            className="text-amber-600 border-amber-200 hover:bg-amber-50 h-8 px-2"
                            title="Unapprove"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingEvent({ ...event })}
                          className="h-8 px-2"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirm(event.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50 h-8 px-2"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Edit Event Modal */}
      <AdminEditModal
        event={editingEvent}
        onClose={() => setEditingEvent(null)}
        onSave={handleUpdateEvent}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-800">
                This will permanently delete this event. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Inline edit modal for admin
function AdminEditModal({
  event,
  onClose,
  onSave,
}: {
  event: Event | null;
  onClose: () => void;
  onSave: (event: Event) => void;
}) {
  const [formData, setFormData] = useState<Partial<Event>>({});

  useEffect(() => {
    if (event) {
      setFormData({ ...event });
    }
  }, [event]);

  if (!event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...event, ...formData } as Event);
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
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Preview */}
          {formData.images && formData.images[0] && (
            <div>
              <Label>Event Image</Label>
              <div className="mt-1 rounded-lg overflow-hidden h-32">
                <img src={formData.images[0]} alt="Event" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="admin-name">Event Name</Label>
            <Input
              id="admin-name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="admin-organiser">Organiser</Label>
              <Input
                id="admin-organiser"
                value={formData.organiser || ''}
                onChange={(e) => setFormData({ ...formData, organiser: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="admin-location">Location</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="admin-venue">Venue</Label>
              <Input
                id="admin-venue"
                value={formData.venue || ''}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="admin-address">Venue Address</Label>
            <Input
              id="admin-address"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full venue address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="admin-startDate">Start Date</Label>
              <Input
                id="admin-startDate"
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="admin-endDate">End Date</Label>
              <Input
                id="admin-endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="admin-startTime">Start Time</Label>
              <Input
                id="admin-startTime"
                type="time"
                value={formData.startTime || ''}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="admin-endTime">End Time</Label>
              <Input
                id="admin-endTime"
                type="time"
                value={formData.endTime || ''}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="admin-eventType">Event Type</Label>
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
            <Label htmlFor="admin-description">Description</Label>
            <Textarea
              id="admin-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="admin-accessibility">Accessibility</Label>
            <Textarea
              id="admin-accessibility"
              value={formData.accessibility || ''}
              onChange={(e) => setFormData({ ...formData, accessibility: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="admin-ticketPrice">Ticket Price</Label>
              <Input
                id="admin-ticketPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.ticketPrice === null ? '' : formData.ticketPrice}
                onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Free"
              />
            </div>
            <div>
              <Label htmlFor="admin-ticketLink">Ticket Link</Label>
              <Input
                id="admin-ticketLink"
                type="url"
                value={formData.ticketLink || ''}
                onChange={(e) => setFormData({ ...formData, ticketLink: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="admin-facebookLink">Facebook Link</Label>
            <Input
              id="admin-facebookLink"
              type="url"
              value={formData.facebookLink || ''}
              onChange={(e) => setFormData({ ...formData, facebookLink: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#5A2E88] to-[#E91E8C] hover:opacity-90"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
