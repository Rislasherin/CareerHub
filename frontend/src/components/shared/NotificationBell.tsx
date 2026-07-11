'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Check, X } from 'lucide-react';
import { apiClient } from '@/services/api/api.client';
import { API_ROUTES } from '@/constants/api.routes';
import { useRouter } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────────────────────

type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
type PortalRole = 'student' | 'hr' | 'interviewer' | 'college_admin' | 'super_admin';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

interface ApiResponse<T> {
  data: T;
}

interface NotificationBellProps {
  role: PortalRole;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROLE_ROUTE_MAP: Record<PortalRole, string> = {
  student: API_ROUTES.NOTIFICATIONS.STUDENT,
  hr: API_ROUTES.NOTIFICATIONS.HR,
  interviewer: API_ROUTES.NOTIFICATIONS.INTERVIEWER,
  college_admin: API_ROUTES.NOTIFICATIONS.COLLEGE,
  super_admin: API_ROUTES.NOTIFICATIONS.SUPER_ADMIN,
};

const typeConfig: Record<NotificationType, { icon: React.ReactNode; dot: string }> = {
  SUCCESS: { icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, dot: 'bg-emerald-500' },
  WARNING: { icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, dot: 'bg-amber-500' },
  ERROR:   { icon: <XCircle className="w-4 h-4 text-red-500" />, dot: 'bg-red-500' },
  INFO:    { icon: <Info className="w-4 h-4 text-blue-500" />, dot: 'bg-blue-500' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const NotificationBell: React.FC<NotificationBellProps> = ({ role }) => {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const baseRoute = ROLE_ROUTE_MAP[role];

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(baseRoute) as ApiResponse<NotificationsResponse>;
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {
      // Silent fail — don't block UI for notification errors
    } finally {
      setIsLoading(false);
    }
  }, [baseRoute]);

  // Fetch on mount + poll every 60s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await apiClient.patch(`${baseRoute}/${notification.id}/read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      } catch { /* silent */ }
    }
    if (notification.link) {
      setIsOpen(false);
      router.push(notification.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.patch(`${baseRoute}/mark-all-read`);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* silent */ }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bell Trigger ── */}
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen(prev => !prev)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
        aria-label="Open notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-black text-white bg-red-500 rounded-full leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ── */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden z-[999] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-slate-400" />
              <span className="text-sm font-black text-slate-700 tracking-tight">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <Check size={12} /> All read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-50">
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Bell size={20} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-0.5">No notifications yet.</p>
                </div>
              </div>
            ) : (
              notifications.map(notification => {
                const config = typeConfig[notification.type] ?? typeConfig.INFO;
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleMarkAsRead(notification)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 ${
                      !notification.isRead ? 'bg-indigo-50/40' : 'bg-white'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm text-slate-800 truncate ${!notification.isRead ? 'font-bold' : 'font-medium'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                        {timeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${config.dot}`} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
