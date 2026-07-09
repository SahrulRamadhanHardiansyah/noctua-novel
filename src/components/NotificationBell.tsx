"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Bell,
  BookOpen,
  MessageSquare,
  Trophy,
  Coins,
  CheckCheck,
} from "lucide-react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils/notifications";

const typeIcons: Record<string, React.ReactNode> = {
  chapter_release: <BookOpen className="w-4 h-4 text-blue-400" />,
  comment_reply: <MessageSquare className="w-4 h-4 text-green-400" />,
  achievement: <Trophy className="w-4 h-4 text-yellow-400" />,
  coin: <Coins className="w-4 h-4 text-amber-400" />,
  system: <Bell className="w-4 h-4 text-gray-400" />,
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const fetch_ = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) setNotifications(await res.json());
      } catch {}
    };
    fetch_();
    const interval = setInterval(fetch_, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAsRead = async (id?: string) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        id
          ? prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
          : prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-300 hover:text-white transition cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-gray-950 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex justify-between items-center p-3 bg-gray-900 border-b border-gray-800">
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAsRead()}
                className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No notifications yet
              </div>
            ) : (
              <ul className="divide-y divide-gray-800/50">
                {notifications.slice(0, 10).map((n) => (
                  <li
                    key={n.id}
                    className={`flex items-start gap-3 p-3 hover:bg-gray-800/50 transition cursor-pointer ${
                      !n.isRead ? "bg-gray-900/60 border-l-2 border-primary" : ""
                    }`}
                    onClick={() => {
                      markAsRead(n.id);
                      if (n.link) router.push(n.link);
                      setIsOpen(false);
                    }}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {typeIcons[n.type] || typeIcons.system}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-gray-600 mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="block text-center text-sm text-primary font-medium p-3 bg-gray-900/50 border-t border-gray-800 hover:bg-gray-800 transition"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
