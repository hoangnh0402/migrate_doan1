// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

'use client';

import { useEffect, useState } from 'react';
import { Bell, Shield, Palette, User, Mail, Phone, Building, Save, Camera, Key, Globe, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  phone?: string;
  role: string;
  department?: string;
  position?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'appearance'>('profile');
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    email: 'admin@HQC System.vn',
    username: 'admin',
    full_name: 'Quáº£n trá»‹ viÃªn HQC System',
    phone: '0912345678',
    role: 'admin',
    department: 'CÃ´ng nghá»‡ thÃ´ng tin',
    position: 'Quáº£n trá»‹ há»‡ thá»‘ng',
    bio: 'Quáº£n trá»‹ viÃªn há»‡ thá»‘ng HQC System',
    created_at: new Date().toISOString(),
  });

  const [editedProfile, setEditedProfile] = useState(profile);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    report_alerts: true,
    system_updates: false,
    weekly_summary: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'system' as 'light' | 'dark' | 'system',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
  });

  useEffect(() => {
    // Load user profile from localStorage or API
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      setEditedProfile(parsed);
    }
  }, []);

  const handleSaveProfile = async () => {
    try {
      // API call to update profile
      localStorage.setItem('user_profile', JSON.stringify(editedProfile));
      setProfile(editedProfile);
      toast.success('ÄÃ£ cáº­p nháº­t thÃ´ng tin cÃ¡ nhÃ¢n');
    } catch (error) {
      toast.error('KhÃ´ng thá»ƒ cáº­p nháº­t thÃ´ng tin');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current_password || !passwordForm.new_password) {
      toast.error('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin');
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      toast.error('Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 8 kÃ½ tá»±');
      return;
    }

    try {
      // API call to change password
      toast.success('ÄÃ£ thay Ä‘á»•i máº­t kháº©u');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      toast.error('KhÃ´ng thá»ƒ thay Ä‘á»•i máº­t kháº©u');
    }
  };

  const handleSaveNotifications = async () => {
    try {
      localStorage.setItem('notification_settings', JSON.stringify(notificationSettings));
      toast.success('ÄÃ£ lÆ°u cÃ i Ä‘áº·t thÃ´ng bÃ¡o');
    } catch (error) {
      toast.error('KhÃ´ng thá»ƒ lÆ°u cÃ i Ä‘áº·t');
    }
  };

  const handleSaveAppearance = async () => {
    try {
      localStorage.setItem('appearance_settings', JSON.stringify(appearanceSettings));
      toast.success('ÄÃ£ lÆ°u cÃ i Ä‘áº·t giao diá»‡n');
      
      // Apply theme
      if (appearanceSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (appearanceSettings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (error) {
      toast.error('KhÃ´ng thá»ƒ lÆ°u cÃ i Ä‘áº·t');
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Há»“ sÆ¡ cÃ¡ nhÃ¢n', icon: User },
    { id: 'security' as const, label: 'Báº£o máº­t', icon: Shield },
    { id: 'notifications' as const, label: 'ThÃ´ng bÃ¡o', icon: Bell },
    { id: 'appearance' as const, label: 'Giao diá»‡n', icon: Palette },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">CÃ i Ä‘áº·t</h1>
        <p className="mt-2 text-muted-foreground">
          Quáº£n lÃ½ thÃ´ng tin cÃ¡ nhÃ¢n vÃ  cáº¥u hÃ¬nh há»‡ thá»‘ng
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-50 dark:bg-green-950/20 text-green-600 font-medium'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">ThÃ´ng tin cÃ¡ nhÃ¢n</h2>
                
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold">
                      {profile.full_name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-green-600 text-white rounded-full hover:bg-green-700">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avatar</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      TÃªn Ä‘Äƒng nháº­p
                    </label>
                    <input
                      type="text"
                      value={editedProfile.username}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Há» tÃªn Ä‘áº§y Ä‘á»§
                    </label>
                    <input
                      type="text"
                      value={editedProfile.full_name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Sá»‘ Ä‘iá»‡n thoáº¡i
                    </label>
                    <input
                      type="tel"
                      value={editedProfile.phone || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Building className="h-4 w-4 inline mr-2" />
                      PhÃ²ng ban
                    </label>
                    <input
                      type="text"
                      value={editedProfile.department || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, department: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Chá»©c vá»¥
                    </label>
                    <input
                      type="text"
                      value={editedProfile.position || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, position: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Giá»›i thiá»‡u
                  </label>
                  <textarea
                    value={editedProfile.bio || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                    placeholder="Viáº¿t vÃ i dÃ²ng giá»›i thiá»‡u vá» báº¡n..."
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="mt-6 flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="h-4 w-4" />
                  LÆ°u thay Ä‘á»•i
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Báº£o máº­t</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Máº­t kháº©u hiá»‡n táº¡i
                    </label>
                    <input
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Máº­t kháº©u má»›i
                    </label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Ãt nháº¥t 8 kÃ½ tá»±</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      XÃ¡c nháº­n máº­t kháº©u má»›i
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Key className="h-4 w-4" />
                    Äá»•i máº­t kháº©u
                  </button>
                </div>

                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-4">PhiÃªn Ä‘Äƒng nháº­p</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">MacBook Pro â€¢ Chrome</p>
                        <p className="text-sm text-muted-foreground">HÃ  Ná»™i, Viá»‡t Nam â€¢ Äang hoáº¡t Ä‘á»™ng</p>
                      </div>
                      <button className="text-sm text-red-600 hover:text-red-700">
                        ÄÄƒng xuáº¥t
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">CÃ i Ä‘áº·t thÃ´ng bÃ¡o</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">ThÃ´ng bÃ¡o email</p>
                    <p className="text-sm text-muted-foreground">Nháº­n thÃ´ng bÃ¡o qua email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.email_notifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, email_notifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">ThÃ´ng bÃ¡o Ä‘áº©y</p>
                    <p className="text-sm text-muted-foreground">Nháº­n thÃ´ng bÃ¡o trÃªn trÃ¬nh duyá»‡t</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.push_notifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, push_notifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Cáº£nh bÃ¡o bÃ¡o cÃ¡o</p>
                    <p className="text-sm text-muted-foreground">ThÃ´ng bÃ¡o khi cÃ³ bÃ¡o cÃ¡o má»›i</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.report_alerts}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, report_alerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Cáº­p nháº­t há»‡ thá»‘ng</p>
                    <p className="text-sm text-muted-foreground">ThÃ´ng bÃ¡o vá» cÃ¡c cáº­p nháº­t má»›i</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.system_updates}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, system_updates: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">BÃ¡o cÃ¡o tuáº§n</p>
                    <p className="text-sm text-muted-foreground">BÃ¡o cÃ¡o tá»•ng há»£p hÃ ng tuáº§n</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.weekly_summary}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, weekly_summary: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <button
                  onClick={handleSaveNotifications}
                  className="mt-6 flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="h-4 w-4" />
                  LÆ°u cÃ i Ä‘áº·t
                </button>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Giao diá»‡n</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Chá»§ Ä‘á»
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: 'light' })}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        appearanceSettings.theme === 'light'
                          ? 'border-green-600 bg-green-50 dark:bg-green-950/20'
                          : 'border-border hover:border-green-300'
                      }`}
                    >
                      <Sun className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">SÃ¡ng</p>
                    </button>
                    <button
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: 'dark' })}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        appearanceSettings.theme === 'dark'
                          ? 'border-green-600 bg-green-50 dark:bg-green-950/20'
                          : 'border-border hover:border-green-300'
                      }`}
                    >
                      <Moon className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">Tá»‘i</p>
                    </button>
                    <button
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: 'system' })}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        appearanceSettings.theme === 'system'
                          ? 'border-green-600 bg-green-50 dark:bg-green-950/20'
                          : 'border-border hover:border-green-300'
                      }`}
                    >
                      <Globe className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">Há»‡ thá»‘ng</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    NgÃ´n ngá»¯
                  </label>
                  <select
                    value={appearanceSettings.language}
                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, language: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="vi">Tiáº¿ng Viá»‡t</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    MÃºi giá»
                  </label>
                  <select
                    value={appearanceSettings.timezone}
                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, timezone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="Asia/Ho_Chi_Minh">Giá» Viá»‡t Nam (GMT+7)</option>
                    <option value="Asia/Bangkok">Giá» Bangkok (GMT+7)</option>
                    <option value="Asia/Singapore">Giá» Singapore (GMT+8)</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveAppearance}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="h-4 w-4" />
                  LÆ°u cÃ i Ä‘áº·t
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

