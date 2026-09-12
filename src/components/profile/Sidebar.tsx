"use client";

import { Tab } from "./types";

interface SidebarProps {
  user: { name: string; email: string; avatar: string };
  avatarColor: string;
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  onLogoutClick: () => void;
}

const navItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
  {
    key: "personal",
    label: "Personal Info",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    ),
  },
  {
    key: "addresses",
    label: "Addresses",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
];

export default function Sidebar({ user, avatarColor, tab, onTabChange, onLogoutClick }: SidebarProps) {
  return (
    <>
      <div className="flex flex-col items-center py-6 px-4 border-b border-gray-100">
        <div className={`w-16 h-16 ${avatarColor} rounded-full flex items-center justify-center text-white text-xl font-bold mb-3`}>
          {user.avatar}
        </div>
        <p className="font-bold text-gray-900 text-sm text-center truncate w-full">{user.name}</p>
        <p className="text-xs text-gray-400 truncate w-full text-center">{user.email}</p>
      </div>

      <nav className="py-2">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => onTabChange(item.key)}
            className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all text-left
              ${tab === item.key
                ? "text-orange-500 bg-orange-50 border-r-2 border-orange-500"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <button
          onClick={onLogoutClick}
          className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-all text-left"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Logout
        </button>
      </nav>
    </>
  );
}
