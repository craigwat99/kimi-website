import { useState, useEffect, useCallback, useRef } from 'react';
import { LogOut, Check, X, Trash2, Edit3, Eye, EyeOff, Copy, Search, Shield, Lock, AlertTriangle, Plus, Clock, ImageIcon, Upload, Heart, RefreshCw, Video, FileText, Star, ExternalLink } from 'lucide-react';
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
import type { Event, TimelineEvent, Supporter } from '../types';
import { formatDate } from '../utils/tokens';
import { defaultTimelineEvents } from '../data/defaultTimeline';
import { uploadEventImage } from '../utils/images';

interface Letter {
  id: string;
  authorName: string;
  email: string;
  letterType: string;
  recipientName: string;
  message: string;
  videoKey: string | null;
  imageKey: string | null;
  galaPermission: boolean;
  approved: boolean;
  createdAt: string;
}

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
  const [activeTab, setActiveTab] = useState<'events' | 'timeline' | 'letters' | 'supporters'>('events');
  const [timelineItems, setTimelineItems] = useState<TimelineEvent[]>([]);
  const [editingTimeline, setEditingTimeline] = useState<TimelineEvent | null>(null);
  const [addingTimeline, setAddingTimeline] = useState(false);
  const [deleteTimelineConfirm, setDeleteTimelineConfirm] = useState<string | null>(null);

  // Letters of Love state
  const [letters, setLetters] = useState<Letter[]>([]);
  const [lettersLoading, setLettersLoading] = useState(false);
  const [letterSearchQuery, setLetterSearchQuery] = useState('');
  const [letterStatusFilter, setLetterStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [viewingLetter, setViewingLetter] = useState<Letter | null>(null);
  const [deleteLetterConfirm, setDeleteLetterConfirm] = useState<string | null>(null);

  // Supporters state
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [supportersLoading, setSupportersLoading] = useState(false);
  const [addingSupporter, setAddingSupporter] = useState(false);
  const [editingSupporter, setEditingSupporter] = useState<Supporter | null>(null);
  const [deleteSupporterConfirm, setDeleteSupporterConfirm] = useState<string | null>(null);

  // Load events from server
  const loadEvents = useCallback(async () => {
    try {
      const res = await fetch('/.netlify/functions/get-events');
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  }, []);

  // Save a single event to server
  const persistEvent = useCallback((event: Event) => {
    fetch('/.netlify/functions/save-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event }),
    }).catch(err => console.error('Failed to save event:', err));
  }, []);

  // Delete a single event from server
  const persistDeleteEvent = useCallback((eventId: string) => {
    fetch('/.netlify/functions/delete-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    }).catch(err => console.error('Failed to delete event:', err));
  }, []);

  // Load timeline from server
  const loadTimeline = useCallback(async () => {
    try {
      const res = await fetch('/.netlify/functions/get-timeline');
      const data = await res.json();
      if (data.timeline && Array.isArray(data.timeline) && data.timeline.length > 0) {
        setTimelineItems(data.timeline);
      } else {
        // No server data yet — load defaults so the admin can manage them
        setTimelineItems(defaultTimelineEvents);
      }
    } catch {
      console.error('Failed to load timeline');
      setTimelineItems(defaultTimelineEvents);
    }
  }, []);

  // Save timeline to server
  const persistTimeline = useCallback((items: TimelineEvent[]) => {
    fetch('/.netlify/functions/save-timeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeline: items }),
    }).catch(err => console.error('Failed to save timeline:', err));
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
      loadTimeline();
    }
  }, [isAuthenticated, loadEvents, loadTimeline]);

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
        sessionStorage.setItem('hlr-admin-password', password);
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
    sessionStorage.removeItem('hlr-admin-password');
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleApprove = (eventId: string) => {
    const updated = events.map(e =>
      e.id === eventId ? { ...e, approved: true, updatedAt: new Date().toISOString() } : e
    );
    setEvents(updated);
    const event = updated.find(e => e.id === eventId);
    if (event) persistEvent(event);
  };

  const handleReject = (eventId: string) => {
    const updated = events.map(e =>
      e.id === eventId ? { ...e, approved: false, updatedAt: new Date().toISOString() } : e
    );
    setEvents(updated);
    const event = updated.find(e => e.id === eventId);
    if (event) persistEvent(event);
  };

  const handleDelete = (eventId: string) => {
    const updated = events.filter(e => e.id !== eventId);
    setEvents(updated);
    persistDeleteEvent(eventId);
    setDeleteConfirm(null);
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    const eventWithTimestamp = { ...updatedEvent, updatedAt: new Date().toISOString() };
    const updated = events.map(e =>
      e.id === updatedEvent.id ? eventWithTimestamp : e
    );
    setEvents(updated);
    persistEvent(eventWithTimestamp);
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

  // Timeline handlers
  const handleSaveTimeline = (item: TimelineEvent) => {
    const updated = timelineItems.map(t => t.id === item.id ? item : t);
    setTimelineItems(updated);
    persistTimeline(updated);
    setEditingTimeline(null);
  };

  const handleAddTimeline = (item: TimelineEvent) => {
    const updated = [...timelineItems, item].sort((a, b) => a.year - b.year);
    setTimelineItems(updated);
    persistTimeline(updated);
    setAddingTimeline(false);
  };

  const handleDeleteTimeline = (id: string) => {
    const updated = timelineItems.filter(t => t.id !== id);
    setTimelineItems(updated);
    persistTimeline(updated);
    setDeleteTimelineConfirm(null);
  };

  // Letters of Love handlers
  const getStoredPassword = () => sessionStorage.getItem('hlr-admin-password') || '';

  const loadLetters = useCallback(async () => {
    setLettersLoading(true);
    try {
      const response = await fetch('/.netlify/functions/get-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: getStoredPassword() }),
      });
      const data = await response.json();
      if (data.letters) {
        setLetters(data.letters);
      }
    } catch {
      // Failed to load letters
    } finally {
      setLettersLoading(false);
    }
  }, []);

  const handleApproveLetter = async (letterId: string, approved: boolean) => {
    try {
      await fetch('/.netlify/functions/update-letter-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: getStoredPassword(), letterId, approved }),
      });
      setLetters(prev => prev.map(l => l.id === letterId ? { ...l, approved } : l));
      if (viewingLetter?.id === letterId) {
        setViewingLetter(prev => prev ? { ...prev, approved } : null);
      }
    } catch {
      // Failed to update
    }
  };

  const handleDeleteLetter = async (letterId: string) => {
    try {
      await fetch('/.netlify/functions/delete-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: getStoredPassword(), letterId }),
      });
      setLetters(prev => prev.filter(l => l.id !== letterId));
      setDeleteLetterConfirm(null);
      if (viewingLetter?.id === letterId) {
        setViewingLetter(null);
      }
    } catch {
      // Failed to delete
    }
  };

  // Load letters when switching to letters tab
  useEffect(() => {
    if (isAuthenticated && activeTab === 'letters' && letters.length === 0) {
      loadLetters();
    }
  }, [isAuthenticated, activeTab, letters.length, loadLetters]);

  // Supporters handlers
  const loadSupporters = useCallback(async () => {
    setSupportersLoading(true);
    try {
      const res = await fetch('/.netlify/functions/get-supporters');
      const data = await res.json();
      if (data.supporters) {
        setSupporters(data.supporters);
      }
    } catch {
      // Failed to load supporters
    } finally {
      setSupportersLoading(false);
    }
  }, []);

  const handleSaveSupporter = async (supporter: Supporter) => {
    try {
      const res = await fetch('/.netlify/functions/save-supporter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supporter }),
      });
      const data = await res.json();
      if (data.success) {
        const savedSupporter = { ...supporter, id: data.id };
        setSupporters(prev => {
          const exists = prev.find(s => s.id === savedSupporter.id);
          if (exists) {
            return prev.map(s => s.id === savedSupporter.id ? savedSupporter : s);
          }
          return [...prev, savedSupporter];
        });
        setAddingSupporter(false);
        setEditingSupporter(null);
      }
    } catch {
      // Failed to save
    }
  };

  const handleDeleteSupporter = async (supporterId: string) => {
    try {
      await fetch('/.netlify/functions/delete-supporter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supporterId }),
      });
      setSupporters(prev => prev.filter(s => s.id !== supporterId));
      setDeleteSupporterConfirm(null);
    } catch {
      // Failed to delete
    }
  };

  // Load supporters when switching to supporters tab
  useEffect(() => {
    if (isAuthenticated && activeTab === 'supporters' && supporters.length === 0) {
      loadSupporters();
    }
  }, [isAuthenticated, activeTab, supporters.length, loadSupporters]);

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

  // Letters filtering
  const filteredLetters = letters.filter(letter => {
    if (letterStatusFilter === 'approved' && !letter.approved) return false;
    if (letterStatusFilter === 'pending' && letter.approved) return false;
    if (letterSearchQuery) {
      const q = letterSearchQuery.toLowerCase();
      return (
        letter.authorName.toLowerCase().includes(q) ||
        letter.email.toLowerCase().includes(q) ||
        letter.message.toLowerCase().includes(q) ||
        letter.recipientName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const lettersPendingCount = letters.filter(l => !l.approved).length;
  const lettersApprovedCount = letters.filter(l => l.approved).length;
  const lettersGalaCount = letters.filter(l => l.galaPermission).length;

  const letterTypeLabel = (type: string) => {
    switch (type) {
      case 'to-myself': return 'To Myself';
      case 'to-passed': return 'To Someone Passed';
      case 'to-future-self': return 'To Future Self';
      case 'to-someone-special': return 'To Someone Special';
      default: return type;
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#784982]/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#784982] mb-4">
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
              className="w-full bg-[#784982] hover:bg-[#5a3562]"
            >
              {loginLoading ? 'Verifying...' : 'Sign In'}
            </Button>

            <div className="text-center">
              <a href="/" className="text-sm text-gray-500 hover:text-[#784982] transition-colors">
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
              <div className="w-8 h-8 rounded-lg bg-[#784982] flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="/" className="text-sm text-gray-500 hover:text-[#784982] transition-colors">
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
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'events'
                ? 'bg-[#784982] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'timeline'
                ? 'bg-[#784982] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Timeline ({timelineItems.length})
          </button>
          <button
            onClick={() => setActiveTab('letters')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'letters'
                ? 'bg-[#784982] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Heart className="w-4 h-4" />
            Letters of Love ({letters.length})
          </button>
          <button
            onClick={() => setActiveTab('supporters')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'supporters'
                ? 'bg-[#784982] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Star className="w-4 h-4" />
            Supporters ({supporters.length})
          </button>
        </div>

        {activeTab === 'events' && (
        <>
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
                className={statusFilter === 'all' ? 'bg-[#784982] hover:bg-[#5a3562]' : ''}
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
        </>
        )}

        {activeTab === 'timeline' && (
        <>
        {/* Timeline Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl leading-normal font-bold text-gray-900">Timeline Management</h2>
            <p className="text-sm text-gray-500 mt-1">Manage the historical timeline shown on the main page</p>
          </div>
          <Button
            onClick={() => setAddingTimeline(true)}
            className="bg-[#784982] hover:bg-[#5a3562]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Timeline Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Year</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Photo</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timelineItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    No timeline items found
                  </TableCell>
                </TableRow>
              ) : (
                timelineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="font-bold text-[#784982]">{item.year}</span>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{item.title}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="text-sm text-gray-600 line-clamp-2 max-w-[300px]">{item.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        item.category === 'reform'
                          ? 'bg-[#e5c858] text-white border-0'
                          : item.category === 'before'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : 'bg-pink-100 text-pink-800 border-pink-200'
                      }>
                        {item.category === 'before' ? 'Before Reform' : item.category === 'reform' ? 'Reform' : 'After Reform'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.image ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTimeline({ ...item })}
                          className="h-8 px-2"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteTimelineConfirm(item.id)}
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
        </>
        )}

        {activeTab === 'letters' && (
        <>
        {/* Letters Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Letters</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{letters.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{lettersApprovedCount}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{lettersPendingCount}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Gala Permission</p>
            <p className="text-3xl font-bold text-[#784982] mt-1">{lettersGalaCount}</p>
          </div>
        </div>

        {/* Letters Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by author, email, message..."
                value={letterSearchQuery}
                onChange={(e) => setLetterSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={letterStatusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLetterStatusFilter('all')}
                className={letterStatusFilter === 'all' ? 'bg-[#784982] hover:bg-[#5a3562]' : ''}
              >
                All ({letters.length})
              </Button>
              <Button
                variant={letterStatusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLetterStatusFilter('pending')}
                className={letterStatusFilter === 'pending' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                Pending ({lettersPendingCount})
              </Button>
              <Button
                variant={letterStatusFilter === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLetterStatusFilter('approved')}
                className={letterStatusFilter === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                Approved ({lettersApprovedCount})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadLetters}
                disabled={lettersLoading}
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${lettersLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Letters Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Content</TableHead>
                <TableHead>Gala</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lettersLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    Loading letters...
                  </TableCell>
                </TableRow>
              ) : filteredLetters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    {letters.length === 0 ? 'No letters submitted yet' : 'No letters match your filters'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLetters.map((letter) => (
                  <TableRow key={letter.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{letter.authorName}</p>
                        <p className="text-xs text-gray-500">{letter.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {letter.videoKey ? (
                          <Video className="w-3.5 h-3.5 text-[#784982]" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        <span className="text-sm">{letterTypeLabel(letter.letterType)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="text-sm text-gray-600 line-clamp-2 max-w-[250px]">
                        {letter.message || (letter.videoKey ? '(Video message)' : '(No text)')}
                      </p>
                    </TableCell>
                    <TableCell>
                      {letter.galaPermission ? (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">Yes</Badge>
                      ) : (
                        <span className="text-xs text-gray-400">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        letter.approved
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }>
                        {letter.approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-gray-500">
                        {new Date(letter.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingLetter(letter)}
                          className="h-8 px-2"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {letter.approved ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveLetter(letter.id, false)}
                            className="text-amber-600 border-amber-200 hover:bg-amber-50 h-8 px-2"
                            title="Unapprove"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveLetter(letter.id, true)}
                            className="text-green-600 border-green-200 hover:bg-green-50 h-8 px-2"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteLetterConfirm(letter.id)}
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
        </>
        )}
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

      {/* Timeline Edit Modal */}
      <TimelineEditModal
        item={editingTimeline}
        onClose={() => setEditingTimeline(null)}
        onSave={handleSaveTimeline}
      />

      {/* Timeline Add Modal */}
      <TimelineEditModal
        item={addingTimeline ? { id: '', year: new Date().getFullYear(), title: '', description: '', category: 'after' } : null}
        onClose={() => setAddingTimeline(false)}
        onSave={handleAddTimeline}
        isNew
      />

      {/* Delete Timeline Confirmation */}
      <Dialog open={!!deleteTimelineConfirm} onOpenChange={() => setDeleteTimelineConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Timeline Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-800">
                This will permanently remove this item from the timeline. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteTimelineConfirm(null)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => deleteTimelineConfirm && handleDeleteTimeline(deleteTimelineConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

        {activeTab === 'supporters' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Supporters</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{supporters.length}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Gold</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{supporters.filter(s => s.level === 'gold').length}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Silver</p>
              <p className="text-3xl font-bold text-gray-500 mt-1">{supporters.filter(s => s.level === 'silver').length}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Bronze</p>
              <p className="text-3xl font-bold text-amber-700 mt-1">{supporters.filter(s => s.level === 'bronze').length}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg leading-normal font-semibold text-gray-900">Manage Supporters</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadSupporters}
                disabled={supportersLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${supportersLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => setAddingSupporter(true)}
                className="bg-[#784982] hover:bg-[#5a3562]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Supporter
              </Button>
            </div>
          </div>

          {/* Supporters Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supportersLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                      Loading supporters...
                    </TableCell>
                  </TableRow>
                ) : supporters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                      No supporters yet. Click "Add Supporter" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  supporters.map((supporter) => (
                    <TableRow key={supporter.id}>
                      <TableCell>
                        <div className="w-16 h-12 rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                          {supporter.logoKey ? (
                            <img
                              src={`/.netlify/functions/get-supporter-logo?key=${encodeURIComponent(supporter.logoKey)}`}
                              alt={supporter.name}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-gray-900">{supporter.name}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          supporter.level === 'gold'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            : supporter.level === 'silver'
                            ? 'bg-gray-100 text-gray-700 border-gray-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }>
                          {supporter.level.charAt(0).toUpperCase() + supporter.level.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {supporter.url && (
                          <a
                            href={supporter.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#784982] hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {supporter.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                          </a>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingSupporter(supporter)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteSupporterConfirm(supporter.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
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
        </>
        )}

      {/* Add/Edit Supporter Modal */}
      {(addingSupporter || editingSupporter) && (
        <SupporterEditModal
          supporter={editingSupporter}
          isNew={addingSupporter}
          onClose={() => { setAddingSupporter(false); setEditingSupporter(null); }}
          onSave={handleSaveSupporter}
        />
      )}

      {/* Delete Supporter Confirmation */}
      <Dialog open={!!deleteSupporterConfirm} onOpenChange={() => setDeleteSupporterConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Supporter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-800">
                This will permanently delete this supporter and their logo. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteSupporterConfirm(null)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => deleteSupporterConfirm && handleDeleteSupporter(deleteSupporterConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Letter Modal */}
      <Dialog open={!!viewingLetter} onOpenChange={() => setViewingLetter(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Letter Details</DialogTitle>
          </DialogHeader>
          {viewingLetter && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Author</p>
                  <p className="font-medium">{viewingLetter.authorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{viewingLetter.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Letter Type</p>
                  <p className="font-medium">{letterTypeLabel(viewingLetter.letterType)}</p>
                </div>
                {viewingLetter.recipientName && (
                  <div>
                    <p className="text-sm text-gray-500">Recipient</p>
                    <p className="font-medium">{viewingLetter.recipientName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="font-medium">{new Date(viewingLetter.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gala Permission</p>
                  <p className="font-medium">{viewingLetter.galaPermission ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge className={
                  viewingLetter.approved
                    ? 'bg-green-100 text-green-800 border-green-200 mt-1'
                    : 'bg-amber-100 text-amber-800 border-amber-200 mt-1'
                }>
                  {viewingLetter.approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>

              {viewingLetter.message && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Message</p>
                  <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-sm">
                    {viewingLetter.message}
                  </div>
                </div>
              )}

              {viewingLetter.videoKey && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Video</p>
                  <video
                    controls
                    className="w-full rounded-lg border border-gray-200"
                    src={`/.netlify/functions/get-video?key=${encodeURIComponent(viewingLetter.videoKey)}`}
                  />
                </div>
              )}

              {viewingLetter.imageKey && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Attached Image</p>
                  <img
                    src={`/.netlify/functions/get-letter-image?key=${encodeURIComponent(viewingLetter.imageKey)}`}
                    alt="Letter attachment"
                    className="w-full rounded-lg border border-gray-200 max-h-96 object-contain bg-gray-50"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                {viewingLetter.approved ? (
                  <Button
                    variant="outline"
                    onClick={() => handleApproveLetter(viewingLetter.id, false)}
                    className="flex-1 text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Unapprove
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleApproveLetter(viewingLetter.id, true)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteLetterConfirm(viewingLetter.id);
                    setViewingLetter(null);
                  }}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Letter Confirmation */}
      <Dialog open={!!deleteLetterConfirm} onOpenChange={() => setDeleteLetterConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Letter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-800">
                This will permanently delete this letter and any associated video. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteLetterConfirm(null)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => deleteLetterConfirm && handleDeleteLetter(deleteLetterConfirm)}
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
              className="flex-1 bg-[#784982] hover:bg-[#5a3562]"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Timeline edit/add modal
function TimelineEditModal({
  item,
  onClose,
  onSave,
  isNew = false,
}: {
  item: TimelineEvent | null;
  onClose: () => void;
  onSave: (item: TimelineEvent) => void;
  isNew?: boolean;
}) {
  const [formData, setFormData] = useState<Partial<TimelineEvent>>({});
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalItem: TimelineEvent = {
      ...item,
      ...formData,
      id: isNew ? `tl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` : item.id,
    } as TimelineEvent;
    onSave(finalItem);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const url = await uploadEventImage(file);
      setFormData({ ...formData, image: url });
    } catch {
      // Keep existing image on failure
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const categories = [
    { value: 'before', label: 'Before Reform' },
    { value: 'reform', label: 'Reform' },
    { value: 'after', label: 'After Reform' },
  ];

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add Timeline Item' : 'Edit Timeline Item'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tl-year">Year</Label>
              <Input
                id="tl-year"
                type="number"
                min="1800"
                max="2100"
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="tl-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as TimelineEvent['category'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tl-title">Title</Label>
            <Input
              id="tl-title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Event title"
              required
            />
          </div>

          <div>
            <Label htmlFor="tl-description">Description</Label>
            <Textarea
              id="tl-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Describe this historical event..."
              required
            />
          </div>

          {/* Photo Section */}
          <div>
            <Label>Photo</Label>
            {formData.image ? (
              <div className="mt-2 space-y-2">
                <div className="relative rounded-lg overflow-hidden h-40 border border-gray-200">
                  <img src={formData.image} alt={formData.title || 'Timeline'} className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Replace
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#784982] hover:bg-purple-50/50 transition-colors"
              >
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {imageUploading ? 'Uploading...' : 'Click to upload a photo'}
                </p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={imageUploading || !formData.title || !formData.description || !formData.year}
              className="flex-1 bg-[#784982] hover:bg-[#5a3562]"
            >
              {isNew ? 'Add Item' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Supporter edit/add modal
function SupporterEditModal({
  supporter,
  isNew = false,
  onClose,
  onSave,
}: {
  supporter: Supporter | null;
  isNew?: boolean;
  onClose: () => void;
  onSave: (supporter: Supporter) => void;
}) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<'gold' | 'silver' | 'bronze'>('bronze');
  const [url, setUrl] = useState('');
  const [logoKey, setLogoKey] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (supporter && !isNew) {
      setName(supporter.name);
      setLevel(supporter.level);
      setUrl(supporter.url);
      setLogoKey(supporter.logoKey);
      if (supporter.logoKey) {
        setLogoPreview(`/.netlify/functions/get-supporter-logo?key=${encodeURIComponent(supporter.logoKey)}`);
      }
    }
  }, [supporter, isNew]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      const result = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const base64 = result.split(',')[1];
      const contentType = file.type || 'image/png';

      const response = await fetch('/.netlify/functions/upload-supporter-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: base64, contentType }),
      });

      if (response.ok) {
        const data = await response.json();
        setLogoKey(data.key);
        setLogoPreview(data.url);
      }
    } catch {
      // Upload failed
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supporterData: Supporter = {
      id: isNew ? '' : (supporter?.id || ''),
      name,
      level,
      url,
      logoKey,
      createdAt: isNew ? new Date().toISOString() : (supporter?.createdAt || new Date().toISOString()),
    };
    onSave(supporterData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add Supporter' : 'Edit Supporter'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="supporter-name">Organisation Name</Label>
            <Input
              id="supporter-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wellington City Council"
              required
            />
          </div>

          <div>
            <Label htmlFor="supporter-level">Sponsorship Level</Label>
            <Select
              value={level}
              onValueChange={(value) => setLevel(value as 'gold' | 'silver' | 'bronze')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="supporter-url">Website URL</Label>
            <Input
              id="supporter-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.example.com"
              required
            />
          </div>

          {/* Logo Upload */}
          <div>
            <Label>Logo</Label>
            {logoPreview ? (
              <div className="mt-2 space-y-2">
                <div className="relative rounded-lg overflow-hidden h-32 border border-gray-200 bg-gray-50 flex items-center justify-center p-4">
                  <img src={logoPreview} alt={name || 'Supporter logo'} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Replace
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { setLogoKey(''); setLogoPreview(''); }}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#784982] hover:bg-purple-50/50 transition-colors"
              >
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {uploading ? 'Uploading...' : 'Click to upload a logo'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, SVG, or JPG recommended</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading || !name || !url || !logoKey}
              className="flex-1 bg-[#784982] hover:bg-[#5a3562]"
            >
              {isNew ? 'Add Supporter' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
