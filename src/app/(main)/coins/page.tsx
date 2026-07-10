"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Coins,
  CalendarCheck,
  Target,
  History,
  ArrowUp,
  ArrowDown,
  Gift,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

interface CheckInData {
  canCheckIn: boolean;
  currentStreak: number;
  lastCheckIn: string | null;
  todayReward: number;
  weekRewards: number[];
}

interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  reward: number;
  type: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  daily_checkin: "Daily Check-in",
  reading_mission: "Mission Reward",
  chapter_unlock: "Chapter Unlock",
  purchase: "Purchase",
  author_earning: "Author Earning",
};

export default function CoinsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [checkIn, setCheckIn] = useState<CheckInData | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [coinsRes, checkInRes, missionsRes] = await Promise.all([
        fetch("/api/coins"),
        fetch("/api/daily-checkin"),
        fetch("/api/reading-missions"),
      ]);
      if (coinsRes.ok) {
        const data = await coinsRes.json();
        setBalance(data.balance);
        setTransactions(data.transactions);
      }
      if (checkInRes.ok) setCheckIn(await checkInRes.json());
      if (missionsRes.ok) setMissions(await missionsRes.json());
    } catch {
      toast.error("Failed to load coin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
      return;
    }
    if (user) fetchAll();
  }, [user, isLoaded, router, fetchAll]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await fetch("/api/daily-checkin", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Check-in failed");
        return;
      }
      toast.success(`Day ${data.newStreak} check-in! +${data.reward} coins`);
      setBalance(data.newBalance);
      fetchAll();
    } catch {
      toast.error("Check-in failed");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleClaim = async (missionId: string) => {
    setClaimingId(missionId);
    try {
      const res = await fetch("/api/reading-missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Claim failed");
        return;
      }
      toast.success(`Claimed +${data.reward} coins!`);
      setBalance(data.newBalance);
      setMissions((prev) =>
        prev.map((m) => (m.id === missionId ? { ...m, claimed: true } : m))
      );
    } catch {
      toast.error("Claim failed");
    } finally {
      setClaimingId(null);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="bg-[#09090b] text-white min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  // ponytail: streak day index for the 7-circle visual
  // currentStreak 1-7 means days 1..streak are done; if canCheckIn, streak shows completed days so far
  const completedDays = checkIn
    ? checkIn.canCheckIn
      ? checkIn.currentStreak >= 7
        ? 0 // streak reset after 7
        : checkIn.currentStreak
      : checkIn.currentStreak
    : 0;

  return (
    <div className="bg-[#09090b] text-white min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-6 md:px-16 lg:px-36 space-y-10">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-violet-500/15 via-violet-600/10 to-purple-500/15 border border-violet-500/20 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Coins className="w-10 h-10 text-violet-400" />
            <span className="text-5xl font-bold text-violet-300">
              {balance.toLocaleString()}
            </span>
          </div>
          <p className="text-zinc-500 text-sm mt-1">Your Coin Balance</p>
        </div>

        {/* Daily Check-in */}
        {checkIn && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CalendarCheck className="w-5 h-5 text-violet-400" />
              <h2 className="text-xl font-semibold">Daily Check-in</h2>
              {checkIn.currentStreak > 0 && (
                <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">
                  {checkIn.currentStreak} day streak
                </span>
              )}
            </div>
            <div className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-6">
              {/* 7-day circles */}
              <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6">
                {checkIn.weekRewards.map((reward, i) => {
                  const dayNum = i + 1;
                  const isDone = dayNum <= completedDays;
                  const isCurrent =
                    checkIn.canCheckIn && dayNum === completedDays + 1;

                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          isDone
                            ? "bg-violet-600 text-white"
                            : isCurrent
                              ? "bg-violet-500/20 border-2 border-violet-500 text-violet-400 animate-pulse"
                              : "bg-zinc-800/50 border border-white/[0.08] text-zinc-600"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          dayNum
                        )}
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs ${isDone ? "text-violet-400" : isCurrent ? "text-amber-400 font-semibold" : "text-zinc-600"}`}
                      >
                        +{reward}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Check-in button */}
              <button
                onClick={handleCheckIn}
                disabled={!checkIn.canCheckIn || checkingIn}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  checkIn.canCheckIn
                    ? "bg-violet-600 hover:bg-violet-500 text-white cursor-pointer"
                    : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
                }`}
              >
                {checkingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : checkIn.canCheckIn ? (
                  <>
                    <Gift className="w-4 h-4" />
                    Check In — Earn {checkIn.todayReward} Coins
                  </>
                ) : (
                  "Already Checked In Today ✓"
                )}
              </button>
            </div>
          </section>
        )}

        {/* Reading Missions */}
        {missions.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-violet-400" />
              <h2 className="text-xl font-semibold">Reading Missions</h2>
            </div>
            <div className="space-y-3">
              {missions.map((mission) => {
                const pct = Math.min(
                  (mission.progress / mission.target) * 100,
                  100
                );
                return (
                  <div
                    key={mission.id}
                    className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">
                          {mission.title}
                        </h3>
                        <span className="text-[10px] bg-zinc-800/50 text-zinc-500 px-2 py-0.5 rounded-full shrink-0 uppercase">
                          {mission.type}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mb-2">
                        {mission.description}
                      </p>
                      {/* Progress bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-500 shrink-0">
                          {mission.progress}/{mission.target}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:flex-col sm:items-end shrink-0">
                      <span className="text-amber-400 text-sm font-semibold flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />+{mission.reward}
                      </span>
                      {mission.claimed ? (
                        <span className="text-xs text-zinc-500">Claimed</span>
                      ) : mission.completed ? (
                        <button
                          onClick={() => handleClaim(mission.id)}
                          disabled={claimingId === mission.id}
                          className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                        >
                          {claimingId === mission.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Claim"
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-600">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Transaction History */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-semibold">Transaction History</h2>
          </div>
          <div className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl divide-y divide-white/[0.06]">
            {transactions.length === 0 ? (
              <p className="p-6 text-center text-zinc-500 text-sm">
                No transactions yet
              </p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        tx.amount > 0
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {tx.amount > 0 ? (
                        <ArrowDown className="w-4 h-4" />
                      ) : (
                        <ArrowUp className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tx.description}
                      </p>
                      <p className="text-[10px] text-zinc-600">
                        {TYPE_LABELS[tx.type] || tx.type} ·{" "}
                        {new Date(tx.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold shrink-0 ml-3 ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
