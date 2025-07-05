"use client";

import { Heart } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type FavoriteButtonProps = {
  novelSlug: string;
};

export const FavoriteButton = ({ novelSlug }: FavoriteButtonProps) => {
  const { user, isLoaded } = useUser();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    const checkFavoriteStatus = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/favorite?novelSlug=${novelSlug}`, { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          setIsFavorited(data.isFavorited);
        }
      } catch (error) {
        console.error("Error fetching favorite status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFavoriteStatus();
  }, [user, isLoaded, novelSlug]);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.warning("Please login to add to favorites.", {
        action: { label: "Login", onClick: () => router.push("/sign-in") },
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelSlug }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsFavorited(data.isFavorited);

        if (data.isFavorited) {
          toast.success("Added to favorites!");
        } else {
          toast.info("Removed from favorites.");
        }
      } else {
        toast.error(data.error || "Failed to update status.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <Button variant="secondary" size="lg" disabled>
        <Heart className="w-5 h-5 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <Button onClick={handleToggleFavorite} disabled={isLoading} variant="secondary" size="lg">
      <Heart className={`w-5 h-5 mr-2 transition-all ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
      {isFavorited ? "Favorited" : "Add to Favorite"}
    </Button>
  );
};
