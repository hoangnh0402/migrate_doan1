// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Trash2, Shield, RefreshCw, 
  Filter, UserCheck, UserX, Phone,
  Calendar, MapPin, Activity, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================

interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'staff' | 'user';
  source: 'dashboard' | 'app';
  status: string;  // 'active', 'approved', 'pending', 'suspended', 'inactive'
  is_active: boolean;
  created_at: string;
  last_login?: string;
  avatar?: string;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  dashboard: number;
  app: number;
  by_role: {
    admin?: number;
    staff?: number;
    citizen?: number;
  };
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);

  // Add User Form
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    full_name: '',
    phone: '',
    password: '',
    role: 'citizen',
    source: 'dashboard',
    department: '',
    position: '',
  });
  const [addingUser, setAddingUser] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // ============================================
  // API CALLS
  // ============================================

  const fetchUsers = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams();
      
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (sourceFilter !== 'all') params.append('source', sourceFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(
        `http://localhost:8000/api/v1/users?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      console.log('Fetched users:', data);
      
      // API tráº£ vá» array trá»±c tiáº¿p, khÃ´ng pháº£i object
      const usersArray = Array.isArray(data) ? data : (data.users || []);
      setUsers(usersArray);

      if (showToast) toast.success('ÄÃ£ cáº­p nháº­t danh sÃ¡ch ngÆ°á»i dÃ¹ng');
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('KhÃ´ng thá»ƒ táº£i danh sÃ¡ch ngÆ°á»i dÃ¹ng tá»« mÃ¡y chá»§. Vui lÃ²ng kiá»ƒm tra API service.');
      toast.error('KhÃ´ng thá»ƒ táº£i danh sÃ¡ch ngÆ°á»i dÃ¹ng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:8000/api/v1/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      console.log('Fetched stats:', data);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const toggleUserStatus = async (userId: number | string, currentStatus: string, userSource: string = 'dashboard') => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `http://localhost:8000/api/v1/users/${userId}/toggle-status?source=${userSource}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to toggle status');

      toast.success(
        `ÄÃ£ ${currentStatus === 'active' ? 'vÃ´ hiá»‡u hÃ³a' : 'kÃ­ch hoáº¡t'} ngÆ°á»i dÃ¹ng`
      );
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('KhÃ´ng thá»ƒ thay Ä‘á»•i tráº¡ng thÃ¡i ngÆ°á»i dÃ¹ng');
    }
  };

  const deleteUser = async (userId: number | string, userSource: string = 'dashboard') => {
    if (!confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a ngÆ°á»i dÃ¹ng nÃ y?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:8000/api/v1/users/${userId}?source=${userSource}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete user');

      toast.success('ÄÃ£ xÃ³a ngÆ°á»i dÃ¹ng');
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('KhÃ´ng thá»ƒ xÃ³a ngÆ°á»i dÃ¹ng');
    }
  };

  const createUser = async () => {
    // Validate
    if (!newUser.email || !newUser.full_name || !newUser.password) {
      toast.error('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin báº¯t buá»™c');
      return;
    }

    try {
      setAddingUser(true);
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch('http://localhost:8000/api/v1/users/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newUser,
          username: newUser.username || newUser.email.split('@')[0],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create user');
      }

      toast.success('ÄÃ£ táº¡o ngÆ°á»i dÃ¹ng má»›i thÃ nh cÃ´ng');
      setShowAddModal(false);
      setNewUser({
        email: '',
        username: '',
        full_name: '',
        phone: '',
        password: '',
        role: 'citizen',
        source: 'dashboard',
        department: '',
        position: '',
      });
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error instanceof Error ? error.message : 'KhÃ´ng thá»ƒ táº¡o ngÆ°á»i dÃ¹ng');
    } finally {
      setAddingUser(false);
    }
  };

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [roleFilter, sourceFilter, statusFilter]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery) {
        fetchUsers();
      } else if (searchQuery === '') {
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // ============================================
  // PAGINATION
  // ============================================

  const filteredUsers = users;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ============================================
  // RENDER HELPERS
  // ============================================

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
      staff: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
      user: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    };

    const labels = {
      admin: 'Quáº£n trá»‹ viÃªn',
      staff: 'NhÃ¢n viÃªn',
      user: 'NgÆ°á»i dÃ¹ng',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role as keyof typeof styles] || styles.user}`}>
        {labels[role as keyof typeof labels] || role}
      </span>
    );
  };

  const getSourceBadge = (source: string) => {
    const styles = {
      dashboard: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
      app: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    };

    const labels = {
      dashboard: 'Web Dashboard',
      app: 'Mobile App',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[source as keyof typeof styles]}`}>
        {labels[source as keyof typeof labels]}
      </span>
    );
  };

  const getStatusBadge = (user: User) => {
    // Check is_active first, then fall back to status string check
    const isActive = user.is_active === true || 
                     user.status === 'active' || 
                     user.status === 'approved';
    
    return isActive ? (
      <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
        <UserCheck className="h-4 w-4" />
        Hoáº¡t Ä‘á»™ng
      </span>
    ) : (
      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
        <UserX className="h-4 w-4" />
        VÃ´ hiá»‡u hÃ³a
      </span>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  if (error && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-10 rounded-3xl max-w-lg">
          <div className="bg-red-100 dark:bg-red-900/50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">Lá»—i truy cáº­p dá»¯ liá»‡u</h2>
          <p className="text-red-700 dark:text-red-300 mb-8 leading-relaxed">
            {error}
          </p>
          <button 
            onClick={() => {
              setLoading(true);
              fetchUsers();
              fetchStats();
            }}
            className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-5 w-5" />
            Thá»­ láº¡i
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-medium">Äang táº£i danh sÃ¡ch ngÆ°á»i dÃ¹ng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-green-600" />
            Quáº£n lÃ½ NgÆ°á»i dÃ¹ng
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quáº£n lÃ½ tÃ i khoáº£n vÃ  phÃ¢n quyá»n ngÆ°á»i dÃ¹ng Web Dashboard & Mobile App
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            LÃ m má»›i
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            ThÃªm ngÆ°á»i dÃ¹ng
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Users className="h-3 w-3" />
              Tá»•ng sá»‘
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <UserCheck className="h-3 w-3" />
              Hoáº¡t Ä‘á»™ng
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <UserX className="h-3 w-3" />
              VÃ´ hiá»‡u hÃ³a
            </div>
            <div className="text-2xl font-bold text-gray-500">{stats.inactive}</div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Shield className="h-3 w-3" />
              Admin
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.by_role?.admin || 0}</div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Activity className="h-3 w-3" />
              Staff
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.by_role?.staff || 0}</div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Users className="h-3 w-3" />
              NgÆ°á»i dÃ¹ng
            </div>
            <div className="text-2xl font-bold text-gray-600">{stats.by_role?.citizen || 0}</div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-purple-600 text-xs mb-1">
              <Activity className="h-3 w-3" />
              Dashboard
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.dashboard}</div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-green-600 text-xs mb-1">
              <Activity className="h-3 w-3" />
              Mobile App
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.app}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Bá»™ lá»c</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="TÃ¬m kiáº¿m theo tÃªn, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500 text-foreground"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500 text-foreground"
          >
            <option value="all">Táº¥t cáº£ vai trÃ²</option>
            <option value="admin">Quáº£n trá»‹ viÃªn</option>
            <option value="staff">NhÃ¢n viÃªn</option>
            <option value="user">NgÆ°á»i dÃ¹ng</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500 text-foreground"
          >
            <option value="all">Táº¥t cáº£ nguá»“n</option>
            <option value="dashboard">Web Dashboard</option>
            <option value="app">Mobile App</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500 text-foreground"
          >
            <option value="all">Táº¥t cáº£ tráº¡ng thÃ¡i</option>
            <option value="active">Hoáº¡t Ä‘á»™ng</option>
            <option value="inactive">VÃ´ hiá»‡u hÃ³a</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                  NgÆ°á»i dÃ¹ng
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                  LiÃªn há»‡
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                  Vai trÃ²
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                  Nguá»“n
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                  Tráº¡ng thÃ¡i
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                  NgÃ y táº¡o
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">
                  Thao tÃ¡c
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold">
                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{user.full_name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {user.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      )}
                      {user.address && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {user.address}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="py-3 px-4">
                    {getSourceBadge(user.source)}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(user)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </div>
                    {user.last_login && (
                      <div className="text-xs text-muted-foreground mt-1">
                        ÄÄƒng nháº­p: {new Date(user.last_login).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.is_active ? 'active' : 'inactive', user.source)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title={user.is_active ? 'VÃ´ hiá»‡u hÃ³a' : 'KÃ­ch hoáº¡t'}
                      >
                        {user.is_active ? (
                          <UserX className="h-4 w-4 text-orange-600" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id, user.source)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="XÃ³a"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Hiá»ƒn thá»‹ {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} / {filteredUsers.length} ngÆ°á»i dÃ¹ng
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-border rounded hover:bg-muted disabled:opacity-50 transition-colors"
              >
                TrÆ°á»›c
              </button>
              <span className="text-sm text-muted-foreground">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-border rounded hover:bg-muted disabled:opacity-50 transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                ThÃªm ngÆ°á»i dÃ¹ng má»›i
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Táº¡o tÃ i khoáº£n má»›i cho Web Dashboard hoáº·c Mobile App
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Source Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Loáº¡i tÃ i khoáº£n <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="source"
                      value="dashboard"
                      checked={newUser.source === 'dashboard'}
                      onChange={(e) => setNewUser({ ...newUser, source: e.target.value, role: 'viewer' })}
                      className="text-green-600"
                    />
                    <span className="text-sm text-foreground">Web Dashboard</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="source"
                      value="app"
                      checked={newUser.source === 'app'}
                      onChange={(e) => setNewUser({ ...newUser, source: e.target.value, role: 'citizen' })}
                      className="text-green-600"
                    />
                    <span className="text-sm text-foreground">Mobile App</span>
                  </label>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  TÃªn Ä‘Äƒng nháº­p
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="username (tá»± Ä‘á»™ng láº¥y tá»« email náº¿u bá» trá»‘ng)"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Há» vÃ  tÃªn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="Nguyá»…n VÄƒn A"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sá»‘ Ä‘iá»‡n thoáº¡i
                </label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="0123456789"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Máº­t kháº©u <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Role (only for Dashboard) */}
              {newUser.source === 'dashboard' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Vai trÃ² <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="viewer">NgÆ°á»i xem (Viewer)</option>
                    <option value="staff">NhÃ¢n viÃªn (Staff)</option>
                    <option value="admin">Quáº£n trá»‹ viÃªn (Admin)</option>
                  </select>
                </div>
              )}

              {/* Department & Position (only for Dashboard) */}
              {newUser.source === 'dashboard' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      PhÃ²ng ban
                    </label>
                    <input
                      type="text"
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      placeholder="PhÃ²ng CÃ´ng nghá»‡"
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Chá»©c vá»¥
                    </label>
                    <input
                      type="text"
                      value={newUser.position}
                      onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                      placeholder="Ká»¹ sÆ° pháº§n má»m"
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-border flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Há»§y
              </button>
              <button
                onClick={createUser}
                disabled={addingUser}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {addingUser ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Äang táº¡o...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Táº¡o ngÆ°á»i dÃ¹ng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

