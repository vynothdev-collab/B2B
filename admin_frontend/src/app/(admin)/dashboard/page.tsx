"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { STAT_CARDS, RECENT_ACTIVITY, PLAN_DISTRIBUTION } from "@/data/dashboard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3 ${
                card.highlight === "red"
                  ? "border-red-200"
                  : card.highlight === "amber"
                  ? "border-amber-200"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg}`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="mt-0.5 text-sm text-slate-500">{card.label}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {card.trendUp === true && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
                {card.trendUp === false && card.highlight !== "red" && card.highlight !== "amber" && (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                )}
                <span
                  className={`text-xs font-medium ${
                    card.highlight === "red"
                      ? "text-red-600"
                      : card.highlight === "amber"
                      ? "text-amber-600"
                      : card.trendUp === true
                      ? "text-emerald-600"
                      : card.trendUp === false
                      ? "text-red-500"
                      : "text-slate-500"
                  }`}
                >
                  {card.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{item.text}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Plan Distribution</h2>
            <p className="text-xs text-slate-400 mt-0.5">All accounts (individual + enterprise)</p>
          </div>
          <div className="p-5 space-y-5">
            {PLAN_DISTRIBUTION.map((item) => {
              const pct = Math.round((item.count / item.total) * 100);
              return (
                <div key={item.plan} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{item.plan}</span>
                    <span className="text-sm font-semibold text-slate-900">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-400">{pct}% of total users</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
