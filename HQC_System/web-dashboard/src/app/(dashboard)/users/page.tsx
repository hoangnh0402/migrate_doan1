// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

'use client';

import { Users, UserPlus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UsersPage() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quáº£n lÃ½ ngÆ°á»i dÃ¹ng</h1>
          <p className="mt-2 text-muted-foreground">
            Quáº£n lÃ½ tÃ i khoáº£n vÃ  phÃ¢n quyá»n ngÆ°á»i dÃ¹ng
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-white transition-smooth hover:bg-accent/90 hover:shadow-lg">
          <UserPlus className="h-5 w-5" />
          ThÃªm ngÆ°á»i dÃ¹ng
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="TÃ¬m kiáº¿m ngÆ°á»i dÃ¹ng..."
          className={cn(
            "w-full rounded-lg border border-input bg-background pl-12 pr-4 py-3",
            "text-sm placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
            "transition-smooth"
          )}
        />
      </div>

      {/* Coming Soon */}
      <div className="rounded-xl border border-border bg-card p-12">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
            <Users className="h-10 w-10 text-accent" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-foreground">
            Trang quáº£n lÃ½ ngÆ°á»i dÃ¹ng Ä‘ang Ä‘Æ°á»£c phÃ¡t triá»ƒn
          </h2>
          <p className="mt-3 text-muted-foreground">
            TÃ­nh nÄƒng quáº£n lÃ½ ngÆ°á»i dÃ¹ng sáº½ sá»›m Ä‘Æ°á»£c hoÃ n thiá»‡n
          </p>
        </div>
      </div>
    </div>
  );
}

