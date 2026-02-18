"use client";

import type { TransactionLogEntry } from "@/lib/types";

interface SpendTrackerProps {
  totalSpent: number;
  dailyLimit: number;
  transactions: TransactionLogEntry[];
}

export function SpendTracker({ totalSpent, dailyLimit, transactions }: SpendTrackerProps) {
  const percentage = dailyLimit > 0 ? Math.min((totalSpent / dailyLimit) * 100, 100) : 0;
  const isNearLimit = percentage > 80;

  return (
    <div data-tour="spend-tracker" className="rounded-xl border border-border bg-bg-card p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-text">Spend Tracker</h3>
        <p className="text-[11px] text-text-dim">Real-time budget usage for this session</p>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="h-2 overflow-hidden rounded-full bg-bg-input">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isNearLimit ? "bg-yellow" : "bg-accent"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-sm font-medium text-text">
          {totalSpent.toFixed(3)} <span className="text-text-muted">/ {dailyLimit.toFixed(2)} USDC</span>
        </span>
        <span className="text-xs text-text-dim">{percentage.toFixed(1)}%</span>
      </div>

      {/* Per-request breakdown */}
      {transactions.length > 0 ? (
        <div className="space-y-1">
          {transactions.slice(-5).map((tx, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="font-mono text-text-dim">{tx.endpoint}</span>
              <span className="text-text-muted">-{tx.cost} USDC</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-xs text-text-dim">No transactions yet</div>
      )}
    </div>
  );
}
