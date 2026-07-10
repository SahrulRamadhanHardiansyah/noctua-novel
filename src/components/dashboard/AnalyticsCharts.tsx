"use client";

import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

interface NovelAnalytics {
  novelId: string;
  title: string;
  viewCount: number;
  chapterCount: number;
  favoriteCount: number;
  avgRating: number;
}

interface AnalyticsChartsProps {
  novels: NovelAnalytics[];
  overview: {
    totalNovels: number;
    totalChapters: number;
    totalViews: number;
    totalFavorites: number;
    totalReviews: number;
    avgRating: number;
    totalEarnings: number;
  };
}

const COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#ec4899", "#10b981", "#6366f1", "#f97316", "#14b8a6"];

export default function AnalyticsCharts({ novels, overview }: AnalyticsChartsProps) {
  // Prepare data for views bar chart
  const viewsData = novels.map((n) => ({
    name: n.title.length > 20 ? n.title.slice(0, 20) + "…" : n.title,
    views: n.viewCount,
    favorites: n.favoriteCount,
  }));

  // Prepare data for rating pie chart
  const ratingData = novels
    .filter((n) => n.avgRating > 0)
    .map((n) => ({
      name: n.title.length > 15 ? n.title.slice(0, 15) + "…" : n.title,
      value: n.avgRating,
    }));

  // Prepare data for chapters line chart
  const chapterData = novels.map((n) => ({
    name: n.title.length > 15 ? n.title.slice(0, 15) + "…" : n.title,
    chapters: n.chapterCount,
    rating: n.avgRating,
  }));

  if (novels.length === 0) return null;

  return (
    <div className="space-y-8 mt-8">
      <h2 className="text-xl font-bold text-white">Visual Analytics</h2>

      {/* Views & Favorites Bar Chart */}
      <div className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Views & Favorites by Novel</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={viewsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
            <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
              labelStyle={{ color: "#f4f4f5" }}
              itemStyle={{ color: "#a1a1aa" }}
            />
            <Legend wrapperStyle={{ color: "#a1a1aa" }} />
            <Bar dataKey="views" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="favorites" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rating Pie Chart */}
        <div className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Rating Distribution</h3>
          {ratingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ratingData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value.toFixed(1)})`}
                >
                  {ratingData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  labelStyle={{ color: "#f4f4f5" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-zinc-500 text-center py-10">No ratings yet</p>
          )}
        </div>

        {/* Chapters & Rating Line Chart */}
        <div className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Chapters & Ratings</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chapterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                labelStyle={{ color: "#f4f4f5" }}
                itemStyle={{ color: "#a1a1aa" }}
              />
              <Legend wrapperStyle={{ color: "#a1a1aa" }} />
              <Line type="monotone" dataKey="chapters" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6" }} />
              <Line type="monotone" dataKey="rating" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
