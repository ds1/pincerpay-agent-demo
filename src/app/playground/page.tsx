"use client";

import { useState, useCallback, useRef } from "react";
import type { DemoEndpoint, AgentConfig, FlowStep, TransactionLogEntry } from "@/lib/types";
import { demoEndpoints } from "@/lib/demo-endpoints";
import { AgentConfigPanel } from "@/components/agent-config";
import { EndpointPicker } from "@/components/endpoint-picker";
import { FlowVisualizer } from "@/components/flow-visualizer";
import { ResponsePanel } from "@/components/response-panel";
import { SpendTracker } from "@/components/spend-tracker";
import { executeRequest } from "./actions";

export default function PlaygroundPage() {
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    walletAddress: "",
    chain: "solana-devnet",
    maxPerRequest: "0.10",
    dailyLimit: "1.00",
  });
  const [selectedEndpoint, setSelectedEndpoint] = useState<DemoEndpoint | null>(null);
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([]);
  const [response, setResponse] = useState<unknown>(null);
  const [cost, setCost] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [sessionSpend, setSessionSpend] = useState(0);
  const [transactionLog, setTransactionLog] = useState<TransactionLogEntry[]>([]);

  const isLive = false; // Client-side can't check env, always simulation in UI

  const animationRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const handleExecute = useCallback(async () => {
    if (!selectedEndpoint || !agentConfig.walletAddress) return;

    // Clear previous
    setIsExecuting(true);
    setFlowSteps([]);
    setResponse(null);
    setCost(null);
    setTotalTime(null);

    // Clear pending animations
    animationRef.current.forEach(clearTimeout);
    animationRef.current = [];

    try {
      const result = await executeRequest(selectedEndpoint, agentConfig, sessionSpend);

      // Animate steps one at a time
      let cumulativeDelay = 0;
      result.steps.forEach((step, index) => {
        const stepDelay = step.delay ?? 200;
        cumulativeDelay += stepDelay;

        // Show step as active
        const activeTimer = setTimeout(() => {
          setFlowSteps((prev) => [
            ...prev.slice(0, index),
            { ...step, status: "active" as const },
          ]);
        }, cumulativeDelay);
        animationRef.current.push(activeTimer);

        // Mark step as complete (or error)
        const duration = step.duration ?? 200;
        cumulativeDelay += duration;
        const completeTimer = setTimeout(() => {
          setFlowSteps((prev) =>
            prev.map((s, i) =>
              i === index ? { ...s, status: step.status } : s
            )
          );
        }, cumulativeDelay);
        animationRef.current.push(completeTimer);
      });

      // Show final result after all animations
      const finalTimer = setTimeout(() => {
        setIsExecuting(false);

        if (result.response) {
          setResponse(result.response);
          setCost(result.cost);

          const totalMs = result.steps.reduce((sum, s) => sum + (s.duration ?? 0), 0);
          setTotalTime(totalMs);

          const newSpend = parseFloat(result.totalSpent);
          setSessionSpend(newSpend);

          setTransactionLog((prev) => [
            ...prev,
            {
              endpoint: selectedEndpoint.path,
              cost: result.cost,
              txHash: result.txHash ?? "N/A",
              timestamp: Date.now(),
            },
          ]);
        } else {
          setIsExecuting(false);
        }
      }, cumulativeDelay + 100);
      animationRef.current.push(finalTimer);
    } catch {
      setIsExecuting(false);
    }
  }, [selectedEndpoint, agentConfig, sessionSpend]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text">Agent Playground</h1>
        <p className="text-sm text-text-muted">
          Simulate how an AI agent interacts with paid API endpoints using the x402 protocol
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left column — Config + Spend */}
        <div className="space-y-4 lg:col-span-3">
          <AgentConfigPanel
            config={agentConfig}
            onChange={setAgentConfig}
            isLive={isLive}
          />
          <SpendTracker
            totalSpent={sessionSpend}
            dailyLimit={parseFloat(agentConfig.dailyLimit) || 1}
            transactions={transactionLog}
          />
        </div>

        {/* Center column — Endpoints + Response */}
        <div className="space-y-4 lg:col-span-5">
          <EndpointPicker
            endpoints={demoEndpoints}
            selected={selectedEndpoint}
            onSelect={setSelectedEndpoint}
            onExecute={handleExecute}
            isExecuting={isExecuting}
          />
          <ResponsePanel
            response={response}
            cost={cost}
            totalTime={totalTime}
          />
        </div>

        {/* Right column — Flow Visualizer */}
        <div className="lg:col-span-4">
          <FlowVisualizer
            steps={flowSteps}
            transactionLog={transactionLog}
          />
        </div>
      </div>
    </main>
  );
}
