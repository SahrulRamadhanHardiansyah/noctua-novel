"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Coins } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CoinBalance() {
  const [balance, setBalance] = useState<number | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/coins");
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance ?? 0);
        }
      } catch {
        // non-critical: balance degrades silently
      }
    };
    fetchBalance();
    // ponytail: poll every 60s, faster refresh if needed later
    const interval = setInterval(fetchBalance, 60000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user || balance === null) return null;

  return (
    <Link
      href="/coins"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition text-amber-400 text-sm font-semibold"
      title="My Coins"
    >
      <Coins className="w-4 h-4" />
      {balance.toLocaleString()}
    </Link>
  );
}
