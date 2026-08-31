"use client";

import { useEffect, useState } from "react";

export default function StudentProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress/summary")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading progress metrics...</div>;
  if (!data) return <div className="p-6">Unable to load progress.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Learning Analytics</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <span className="text-sm font-semibold text-orange-600">Daily Streak</span>
          <p className="text-3xl font-bold text-orange-900 mt-1">🔥 {data.currentStreak} Days</p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <span className="text-sm font-semibold text-purple-600">Total XP</span>
          <p className="text-3xl font-bold text-purple-900 mt-1">⚡ {data.totalXP} XP</p>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-semibold text-blue-600">Accuracy</span>
          <p className="text-3xl font-bold text-blue-900 mt-1">🎯 {data.overallAccuracy}%</p>
        </div>
      </div>

      {/* Weak Areas */}
      {data.weakAreas && data.weakAreas.length > 0 && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-lg space-y-3">
          <h3 className="font-semibold text-red-900">Recommended Practice (Weak Points)</h3>
          <div className="divide-y divide-red-200">
            {data.weakAreas.map((item: any, idx: number) => (
              <div key={idx} className="py-2 flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium text-red-900">[{item.topicTitle}]</span>
                  <p className="text-red-700">{item.questionText}</p>
                </div>
                <span className="px-2 py-1 bg-red-200 text-red-800 font-bold rounded text-xs">
                  {item.mistakeCount} errors
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}