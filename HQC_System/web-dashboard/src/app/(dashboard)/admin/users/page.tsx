// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import { adminService } from '@/lib/admin-service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  phone?: string;
  department?: string;
  position?: string;
  created_at: string;
}

const roleColors: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  manager: 'bg-green-100 text-green-800',
  analyst: 'bg-yellow-100 text-yellow-800',
  viewer: 'bg-gray-100 text-gray-800'
};

const statusColors: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800',
  rejected: 'bg-gray-100 text-gray-800'
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'KhÃ´ng thá»ƒ táº£i danh sÃ¡ch ngÆ°á»i dÃ¹ng');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminService.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleApprove = async (userId: string, approved: boolean) => {
    try {
      await adminService.approveUser(userId, approved);
      toast.success(approved ? 'ÄÃ£ phÃª duyá»‡t ngÆ°á»i dÃ¹ng' : 'ÄÃ£ tá»« chá»‘i ngÆ°á»i dÃ¹ng');
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'KhÃ´ng thá»ƒ xá»­ lÃ½ yÃªu cáº§u');
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      toast.success('ÄÃ£ cáº­p nháº­t vai trÃ² ngÆ°á»i dÃ¹ng');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'KhÃ´ng thá»ƒ cáº­p nháº­t vai trÃ²');
    }
  };

  const handleSuspend = async (userId: string) => {
    const reason = prompt('LÃ½ do táº¡m ngÆ°ng tÃ i khoáº£n:');
    if (!reason) return;

    try {
      await adminService.suspendUser(userId, reason);
      toast.success('ÄÃ£ táº¡m ngÆ°ng tÃ i khoáº£n');
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'KhÃ´ng thá»ƒ táº¡m ngÆ°ng tÃ i khoáº£n');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quáº£n lÃ½ ngÆ°á»i dÃ¹ng</h1>
        <p className="text-muted-foreground mt-1">
          Quáº£n lÃ½ tÃ i khoáº£n, phÃ¢n quyá»n vÃ  phÃª duyá»‡t ngÆ°á»i dÃ¹ng
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tá»•ng sá»‘</p>
              <h3 className="text-2xl font-bold text-foreground">{stats?.total_users || 0}</h3>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Äang hoáº¡t Ä‘á»™ng</p>
              <h3 className="text-2xl font-bold text-green-600">{stats?.approved_users || 0}</h3>
            </div>
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Chá» duyá»‡t</p>
              <h3 className="text-2xl font-bold text-yellow-600">{stats?.pending_users || 0}</h3>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">ÄÃ£ khÃ³a</p>
              <h3 className="text-2xl font-bold text-red-600">{stats?.suspended_users || 0}</h3>
            </div>
            <UserX className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="TÃ¬m kiáº¿m theo email hoáº·c tÃªn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Táº¥t cáº£ tráº¡ng thÃ¡i</option>
            <option value="approved">ÄÃ£ duyá»‡t</option>
            <option value="pending">Chá» duyá»‡t</option>
            <option value="suspended">ÄÃ£ khÃ³a</option>
            <option value="rejected">ÄÃ£ tá»« chá»‘i</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Táº¥t cáº£ vai trÃ²</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="manager">Quáº£n lÃ½</option>
            <option value="analyst">PhÃ¢n tÃ­ch viÃªn</option>
            <option value="viewer">NgÆ°á»i xem</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  NgÆ°á»i dÃ¹ng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  ThÃ´ng tin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Vai trÃ²
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tráº¡ng thÃ¡i
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  NgÃ y táº¡o
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  HÃ nh Ä‘á»™ng
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan={6}>
                      <div className="h-12 bg-muted rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-foreground">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {user.department && (
                          <div className="text-muted-foreground">{user.department}</div>
                        )}
                        {user.position && (
                          <div className="text-muted-foreground text-xs">{user.position}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium border-0",
                          roleColors[user.role] || 'bg-gray-100 text-gray-800'
                        )}
                        disabled={user.status !== 'approved'}
                      >
                        <option value="viewer">NgÆ°á»i xem</option>
                        <option value="analyst">PhÃ¢n tÃ­ch viÃªn</option>
                        <option value="manager">Quáº£n lÃ½</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        statusColors[user.status] || 'bg-gray-100 text-gray-800'
                      )}>
                        {user.status === 'approved' && 'ÄÃ£ duyá»‡t'}
                        {user.status === 'pending' && 'Chá» duyá»‡t'}
                        {user.status === 'suspended' && 'ÄÃ£ khÃ³a'}
                        {user.status === 'rejected' && 'Tá»« chá»‘i'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(user.id, true)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="PhÃª duyá»‡t"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApprove(user.id, false)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Tá»« chá»‘i"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {user.status === 'approved' && (
                          <button
                            onClick={() => handleSuspend(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="KhÃ³a tÃ i khoáº£n"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng nÃ o
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

