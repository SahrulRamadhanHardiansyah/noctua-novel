"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  MessageSquare,
  Trophy,
  Coins,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { timeAgo } from "@/lib/utils/notifications";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

function groupByDate(notifications: Notification[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: { label: string; items: Notification[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "This Week", items: [] },
    { label: "Earlier", items: [] },
  ];

  for (const n of notifications) {
    const d = new Date(n.createdAt);
    if (d >= today) groups[0].items.push(n);
    else if (d >= yesterday) groups[1].items.push(n);
    else if (d >= weekAgo) groups[2].items.push(n);
    else groups[3].items.push(n);
  }

  return groups.filter((g) => g.items.length > 0);
}

const typeIcons: Record<string, React.ReactNode> = {
  chapter_release: <BookOpen className="w-5 h-5 text-blue-400" />,
  comment_reply: <MessageSquare className="w-5 h-5 text-green-400" />,
  achievement: <Trophy className="w-5 h-5 text-yellow-400" />,
  coin: <Coins className="w-5 h-5 text-amber-400" />,
  system: <Bell className="w-5 h-5 text-zinc-400" />,
};

export default function NotificationsClient({
  notifications: initial,
}: {
  notifications: Notification[];
}) {
  const [notifications, setNotifications] = React.useState(initial);
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  const markAsRead = async (n: Notification) => {
    if (!n.isRead) {
      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: n.id }),
        });
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
        );
      } catch {}
    }
    if (n.link) router.push(n.link);
  };

  const groups = groupByDate(notifications);

  return (
    <div className="bg-[#09090b] text-white min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-6 md:px-16 lg:px-36">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-zinc-500 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-zinc-500 mt-1">
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 rounded-lg transition cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notification List */}
        {notifications.length === 0 ? (
          <div className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-16 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
            <p className="text-zinc-300 text-lg">No notifications yet</p>
            <p className="text-zinc-500 text-sm mt-2">
              When something happens, you&apos;ll see it here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.label}>
                <h2 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-3 px-1">
                  {group.label}
                </h2>
                <div className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
                  {group.items.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n)}
                      className={`flex items-start gap-4 p-4 hover:bg-white/[0.03] transition cursor-pointer ${
                        !n.isRead ? "border-l-2 border-violet-500 bg-violet-500/5" : ""
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0 p-2 bg-zinc-800/50 rounded-xl">
                        {typeIcons[n.type] || typeIcons.system}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p
                            className={`text-sm font-medium ${
                              !n.isRead ? "text-white" : "text-zinc-400"
                            }`}
                          >
                            {n.title}
                          </p>
                          <span className="text-[11px] text-zinc-600 whitespace-nowrap flex-shrink-0">
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div className="w-2.5 h-2.5 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
