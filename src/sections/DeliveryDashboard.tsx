import { useState, useEffect, useCallback } from 'react';
import { LogOut, Check, X, Lock, AlertTriangle, Clock, RefreshCw, Package, Download, Truck, Search, Edit3 } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProgrammeOrder {
  id: number;
  contactName: string;
  organisationName: string;
  postalAddress: string;
  numberOfProgrammes: number;
  mobileNumber: string;
  deliveryNotes: string | null;
  status: string;
  trackingInfo: string | null;
  createdAt: string;
  updatedAt: string;
}

const SESSION_KEY = 'hlr-delivery-session';
const PASSWORD_KEY = 'hlr-delivery-password';

export function DeliveryDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [orders, setOrders] = useState<ProgrammeOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent'>('all');
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [editingTrackingInfo, setEditingTrackingInfo] = useState('');

  const getStoredPassword = () => sessionStorage.getItem(PASSWORD_KEY) || '';

  // Check for existing session
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/programme-orders', {
        headers: { 'x-admin-password': getStoredPassword() },
      });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch {
      // Failed to load
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, loadOrders]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await fetch('/.netlify/functions/delivery-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();

      if (data.authenticated) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        sessionStorage.setItem(PASSWORD_KEY, password);
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
    sessionStorage.removeItem(PASSWORD_KEY);
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string, trackingInfo?: string) => {
    try {
      const res = await fetch('/api/programme-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': getStoredPassword() },
        body: JSON.stringify({ id: orderId, status, trackingInfo }),
      });
      const data = await res.json();
      if (data.order) {
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
      }
      setEditingOrderId(null);
      setEditingTrackingInfo('');
    } catch {
      // Failed to update
    }
  };

  const exportOrdersToCSV = () => {
    const headers = ['ID', 'Contact Name', 'Organisation', 'Postal Address', 'Programmes', 'Mobile', 'Delivery Notes', 'Status', 'Tracking Info', 'Order Date'];
    const rows = orders.map(o => [
      o.id,
      o.contactName,
      o.organisationName,
      `"${o.postalAddress.replace(/"/g, '""')}"`,
      o.numberOfProgrammes,
      o.mobileNumber,
      o.deliveryNotes ? `"${o.deliveryNotes.replace(/"/g, '""')}"` : '',
      o.status,
      o.trackingInfo || '',
      o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `programme-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'pending' && order.status !== 'pending') return false;
    if (statusFilter === 'sent' && order.status !== 'sent') return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        order.contactName.toLowerCase().includes(q) ||
        order.organisationName.toLowerCase().includes(q) ||
        order.postalAddress.toLowerCase().includes(q) ||
        order.mobileNumber.includes(q)
      );
    }
    return true;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const sentCount = orders.filter(o => o.status === 'sent').length;
  const totalQuantity = orders.reduce((sum, o) => sum + o.numberOfProgrammes, 0);

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#784982]/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#784982] mb-4">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Delivery Portal</h1>
            <p className="text-gray-500 mt-1">Programme Package Management</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div>
              <Label htmlFor="delivery-password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="delivery-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter delivery password"
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
                <Truck className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Delivery Portal</h1>
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
        <div className="flex items-center gap-2 mb-6">
          <Package className="w-5 h-5 text-[#784982]" />
          <h2 className="text-xl leading-normal font-bold text-gray-900">Programme Package Requests</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Sent</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{sentCount}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Programmes Requested</p>
            <p className="text-3xl font-bold text-[#784982] mt-1">{totalQuantity}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'pending' | 'sent')}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={loadOrders}
                disabled={ordersLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${ordersLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportOrdersToCSV}
                disabled={orders.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="hidden sm:table-cell">Mobile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Tracking</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                    {orders.length === 0 ? 'No orders yet.' : 'No orders match your search.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <span className="font-medium text-gray-900">{order.contactName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-700">{order.organisationName}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-gray-600 max-w-[200px] truncate block" title={order.postalAddress}>
                        {order.postalAddress}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-[#784982]/10 text-[#784982]">
                        {order.numberOfProgrammes}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-gray-600">{order.mobileNumber}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        order.status === 'sent'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }>
                        {order.status === 'sent' ? 'Sent' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {editingOrderId === order.id ? (
                        <div className="flex gap-1">
                          <Input
                            value={editingTrackingInfo}
                            onChange={(e) => setEditingTrackingInfo(e.target.value)}
                            placeholder="Tracking #"
                            className="h-8 text-xs w-32"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleUpdateOrderStatus(order.id, 'sent', editingTrackingInfo)}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => { setEditingOrderId(null); setEditingTrackingInfo(''); }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {order.trackingInfo || '—'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {order.status === 'pending' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50"
                            title="Mark as sent & add tracking"
                            onClick={() => { setEditingOrderId(order.id); setEditingTrackingInfo(order.trackingInfo || ''); }}
                          >
                            <Truck className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                            title="Mark as pending"
                            onClick={() => handleUpdateOrderStatus(order.id, 'pending')}
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          title="Edit tracking info"
                          onClick={() => { setEditingOrderId(order.id); setEditingTrackingInfo(order.trackingInfo || ''); }}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Delivery Notes - shown below when an order has notes */}
        {filteredOrders.some(o => o.deliveryNotes) && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Orders with Delivery Notes</h3>
            <div className="space-y-3">
              {filteredOrders.filter(o => o.deliveryNotes).map(order => (
                <div key={order.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <span className="text-sm font-medium text-gray-900">{order.contactName}</span>
                    <span className="text-sm text-gray-500 ml-2">({order.organisationName})</span>
                  </div>
                  <p className="text-sm text-gray-600">{order.deliveryNotes}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
