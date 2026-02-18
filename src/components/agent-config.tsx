"use client";

import type { AgentConfig } from "@/lib/types";

const BASE58_CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function randomBase58(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += BASE58_CHARS[Math.floor(Math.random() * BASE58_CHARS.length)];
  }
  return result;
}

interface AgentConfigPanelProps {
  config: AgentConfig;
  onChange: (config: AgentConfig) => void;
  isLive: boolean;
}

export function AgentConfigPanel({ config, onChange, isLive }: AgentConfigPanelProps) {
  function generateWallet() {
    onChange({ ...config, walletAddress: randomBase58(44) });
  }

  return (
    <div data-tour="agent-config" className="rounded-xl border border-border bg-bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text">Agent Configuration</h3>
          <p className="text-[11px] text-text-dim">On-chain identity and spending guardrails</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isLive
              ? "bg-green/10 text-green"
              : "bg-accent/10 text-accent"
          }`}
        >
          {isLive ? "Live — Solana Devnet" : "Simulation"}
        </span>
      </div>

      {/* Wallet */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs text-text-muted">Wallet Address</label>
        {config.walletAddress ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-bg-input px-3 py-2 font-mono text-xs text-text">
              {config.walletAddress}
            </code>
            <button
              onClick={generateWallet}
              className="shrink-0 rounded-lg bg-bg-input px-2 py-2 text-xs text-text-muted transition-colors hover:text-text"
              title="Regenerate"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={generateWallet}
            className="w-full rounded-lg border border-dashed border-border-bright bg-bg-input px-3 py-2.5 text-xs text-text-muted transition-colors hover:border-accent hover:text-accent"
          >
            Generate Demo Wallet
          </button>
        )}
      </div>

      {/* Chain */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs text-text-muted">Chain</label>
        <select
          value={config.chain}
          onChange={(e) => onChange({ ...config, chain: e.target.value })}
          className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text"
        >
          <option value="solana-devnet">Solana Devnet</option>
          <option value="base-sepolia">Base Sepolia</option>
          <option value="polygon-amoy">Polygon Amoy</option>
        </select>
      </div>

      {/* Spending Limits */}
      <div data-tour="spending-limits" className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs text-text-muted">Max / Request</label>
          <div className="relative">
            <input
              type="text"
              value={config.maxPerRequest}
              onChange={(e) => onChange({ ...config, maxPerRequest: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 pr-14 text-sm text-text"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-dim">
              USDC
            </span>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-text-muted">Daily Limit</label>
          <div className="relative">
            <input
              type="text"
              value={config.dailyLimit}
              onChange={(e) => onChange({ ...config, dailyLimit: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 pr-14 text-sm text-text"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-dim">
              USDC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
