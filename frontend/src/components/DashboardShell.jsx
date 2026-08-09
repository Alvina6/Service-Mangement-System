"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Snowflake, LogOut, Bell, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const roleLabels = {
  customer: "Customer",
  technician: "Technician",
  dispatcher: "Dispatcher",
  admin: "Administrator",
};

export default function DashboardShell({ role, children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== role) {
      router.replace(`/dashboard/${user.role}`);
      return;
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [user, loading, role, router]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    try {
      await Promise.all(unread.map((n) => api.put(`/notifications/${n._id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user || user.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ice">
        <p className="text-sm text-slate">Loading dashboard…</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-ice">
      <header className="sticky top-0 z-40 bg-graphite text-ice shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-semibold">
            <Snowflake size={18} className="text-frost-light" />
            ArcticAir <span className="text-slate-light font-body font-normal text-sm">/ {roleLabels[role]}</span>
          </Link>
          <div className="flex items-center gap-6">
            
            {/* Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 text-slate-light hover:text-ice hover:bg-graphite-light rounded-full transition-all focus:outline-none"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-ember text-ice text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-3 w-80 bg-white text-graphite rounded-2xl shadow-xl border border-graphite/10 py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-graphite/5">
                      <h4 className="text-sm font-semibold font-display">Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[10px] text-frost hover:underline font-semibold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto mt-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate text-center py-6 italic">No notifications yet</p>
                      ) : (
                        <ul className="divide-y divide-graphite/5">
                          {notifications.map((n) => (
                            <li
                              key={n._id}
                              className={`p-3 text-left transition-colors hover:bg-ice/40 flex items-start gap-2.5 ${
                                !n.isRead ? "bg-frost/5" : ""
                              }`}
                            >
                              <div className="flex-1">
                                <p className="text-xs font-semibold">{n.title}</p>
                                <p className="text-[11px] text-slate mt-0.5 leading-normal">{n.message}</p>
                                <span className="text-[9px] text-slate-light block mt-1">
                                  {new Date(n.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              {!n.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(n._id)}
                                  className="text-frost hover:text-frost-dark p-0.5 rounded-full hover:bg-frost/10"
                                  title="Mark as read"
                                >
                                  <Check size={12} />
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <span className="text-sm text-slate-light hidden sm:inline">{user.name}</span>
            <button onClick={() => { logout(); router.push("/"); }} className="flex items-center gap-1.5 text-sm text-slate-light hover:text-ice transition-colors">
              <LogOut size={15} /> Log out
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
