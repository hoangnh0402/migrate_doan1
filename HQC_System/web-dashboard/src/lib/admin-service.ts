// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

/**
 * Admin Service
 * Handles all admin-related API calls for dashboard, analytics, and alerts
 * Uses the centralized apiClient for consistent authentication and error handling
 */

import { apiClient } from './api-client';

export interface DashboardOverview {
  timestamp: string;
  user_statistics: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    by_role: Record<string, number>;
  };
  entity_statistics: {
    weather: { total: number; last_24h: number; last_7d: number };
    air_quality: { total: number; last_24h: number; last_7d: number };
    traffic: { total: number; last_24h: number; last_7d: number };
    parking: { total: number; available: number; occupied: number };
    civic_issues: { total: number; open: number; closed: number };
  };
  alert_statistics: {
    critical: number;
    high_priority_open: number;
  };
  system_health: {
    database: string;
    mongodb: string;
    status: string;
  };
}

export interface ActivityTimeline {
  period: string;
  start_date: string;
  end_date: string;
  timeline: Array<{
    date: string;
    weather: number;
    air_quality: number;
    traffic: number;
    civic_issues: number;
    total: number;
  }>;
}

export interface RealTimeMetrics {
  timestamp: string;
  weather: {
    latest: {
      temperature: number | null;
      humidity: number | null;
      description: string | null;
      observed_at: string | null;
    };
    hourly_average: { temperature: number | null };
  };
  air_quality: {
    latest: {
      aqi: number | null;
      pm25: number | null;
      pm10: number | null;
      observed_at: string | null;
    };
    hourly_average: { aqi: number | null };
  };
  traffic: {
    latest: {
      intensity: number | null;
      average_speed: number | null;
      observed_at: string | null;
    };
    hourly_average: { intensity: number | null };
  };
}

export interface Alert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  location: string | null;
  timestamp: string;
  status: string;
  assigned_to: string | null;
  metadata: Record<string, any> | null;
}

export interface TrendData {
  period: string;
  district?: string;
  location?: string;
  data: Array<{
    date: string;
    [key: string]: any;
  }>;
}

export interface StatisticsSummary {
  period: string;
  generated_at: string;
  weather: any;
  air_quality: any;
  traffic: any;
  civic_issues: any;
  parking: any;
}

class AdminService {
  // ============ Dashboard APIs ============
  
  async getDashboardOverview(): Promise<DashboardOverview> {
    return apiClient.get<DashboardOverview>('/admin/dashboard/overview');
  }

  async getActivityTimeline(days: number = 7): Promise<ActivityTimeline> {
    return apiClient.get<ActivityTimeline>('/admin/dashboard/activity-timeline', { days });
  }

  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    return apiClient.get<RealTimeMetrics>('/admin/dashboard/real-time-metrics');
  }

  async getTopLocations(limit: number = 10, metric: 'traffic' | 'air_quality' | 'civic_issues' = 'traffic') {
    return apiClient.get('/admin/dashboard/top-locations', { limit, metric });
  }

  // ============ Analytics APIs ============
  
  async getWeatherTrends(days: number = 30, district?: string): Promise<TrendData> {
    return apiClient.get<TrendData>('/admin/analytics/trends/weather', { days, district });
  }

  async getAirQualityTrends(days: number = 30, district?: string): Promise<TrendData> {
    return apiClient.get<TrendData>('/admin/analytics/trends/air-quality', { days, district });
  }

  async getTrafficTrends(days: number = 7, location?: string) {
    return apiClient.get('/admin/analytics/trends/traffic', { days, location });
  }

  async compareDistricts(metric: 'temperature' | 'aqi' | 'traffic_intensity', days: number = 7) {
    return apiClient.get('/admin/analytics/compare/districts', { metric, days });
  }

  async exportDataCSV(entityType: 'weather' | 'air_quality' | 'traffic' | 'parking' | 'civic_issues', days: number = 7) {
    // For blob downloads, we still use the client directly but via a wrapper or by getting the client instance
    // Since exportDataCSV needs responseType: 'blob', and apiClient wrapper currently doesn't expose it easily
    // Let's use the underlying instance if we can or keep it simple.
    // Actually, apiClient could be extended but let's see.
    // For now, I'll use axios directly here but with the unified token if possible, 
    // but better to just use apiClient if I add a 'request' method.
    
    // I'll keep this one slightly more manual but use the base URL from env
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    const axios = (await import('axios')).default;
    const response = await axios.get(`${API_BASE_URL}/admin/analytics/export/csv`, {
      params: { entity_type: entityType, days },
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      responseType: 'blob'
    });
    
    if (typeof window !== 'undefined') {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `hqc_system_${entityType}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
    
    return true;
  }

  async getStatisticsSummary(days: number = 30): Promise<StatisticsSummary> {
    return apiClient.get<StatisticsSummary>('/admin/analytics/statistics/summary', { days });
  }

  // ============ Alert Management APIs ============
  
  async getActiveAlerts(severity?: 'info' | 'warning' | 'critical', limit: number = 50): Promise<Alert[]> {
    return apiClient.get<Alert[]>('/admin/alerts/active', { severity, limit });
  }

  async getAlertHistory(days: number = 7, alertType?: string, severity?: string) {
    return apiClient.get('/admin/alerts/history', { days, alert_type: alertType, severity });
  }

  async acknowledgeAlert(alertId: string, notes?: string) {
    return apiClient.post(`/admin/alerts/acknowledge/${alertId}`, { notes });
  }

  async getAlertStatistics(days: number = 30) {
    return apiClient.get('/admin/alerts/statistics', { days });
  }

  async getAlertRecommendations() {
    return apiClient.get('/admin/alerts/recommendations');
  }

  // ============ User Management APIs (existing endpoints) ============
  
  async getPendingUsers() {
    return apiClient.get('/admin/users/pending');
  }

  async getAllUsers(status?: string, role?: string) {
    return apiClient.get('/admin/users', { status, role });
  }

  async approveUser(userId: string, approved: boolean, reason?: string) {
    return apiClient.put(`/admin/users/${userId}/approve`, {
      approved,
      reason
    });
  }

  async updateUserRole(userId: string, newRole: string) {
    return apiClient.put(`/admin/users/${userId}/role`, {
      new_role: newRole
    });
  }

  async suspendUser(userId: string, reason: string) {
    return apiClient.post(`/admin/users/${userId}/suspend`, { reason });
  }

  async getUserStats() {
    return apiClient.get('/admin/stats');
  }
}

export const adminService = new AdminService();
export default AdminService;
