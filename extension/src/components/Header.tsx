import React, { useState } from 'react';
import type { User } from '../types';
import { useAuthStore } from '../store/authStore';
import logoFullUrl from '../assets/logo-full-white.svg';

interface Props {
  user: User;
}

export function Header({ user }: Props) {
  const logout = useAuthStore((s) => s.logout);
  const [showMenu, setShowMenu] = useState(false);
  const remaining = user.remaining_credits;

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-brand-navy text-white flex-shrink-0 border-b border-white/10">
      {/* Logo */}
      <img src={logoFullUrl} alt="LeadsBuddy.ai" className="h-7 w-auto" />

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Credits */}
        <div className="flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-1">
          <span className="text-brand-orange font-bold text-xs">
            {remaining.toLocaleString()}
          </span>
          <span className="text-white/60 text-xs">credits</span>
        </div>

        {/* User avatar / logout */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            onBlur={() => setTimeout(() => setShowMenu(false), 150)}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            title={user.name}
          >
            <span className="text-xs font-bold">{user.name[0]?.toUpperCase()}</span>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-9 bg-white rounded-lg shadow-lg border border-gray-100 py-1 w-36 z-50">
              <div className="px-3 py-1.5 border-b border-gray-50">
                <p className="text-xs font-medium text-gray-800 truncate">{user.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
