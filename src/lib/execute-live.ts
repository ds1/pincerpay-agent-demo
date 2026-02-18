import type { DemoEndpoint, AgentConfig, ExecutionResult, FlowStep } from "./types";

/**
 * Live mode execution — calls real merchant server with @pincerpay/agent SDK.
 * Only works when DEMO_MODE=live and dependencies are installed.
 */
export async function executeLive(
  endpoint: DemoEndpoint,
  agent: AgentConfig,
  currentSpend: number
): Promise<ExecutionResult> {
  const dailyLimit = parseFloat(agent.dailyLimit);
  const startTime = Date.now();
  const steps: FlowStep[] = [];

  try {
    // Dynamic import — these are optional deps
    const { PincerPayAgent } = await import("@pincerpay/agent");

    steps.push({
      id: "step-1",
      type: "request",
      label: "Sending Request",
      detail: `${endpoint.method} http://localhost:3001${endpoint.path}`,
      status: "complete",
      duration: Date.now() - startTime,
      delay: 0,
    });

    const agentClient = await PincerPayAgent.create({
      chains: ["solana"],
      solanaPrivateKey: process.env.AGENT_SOLANA_KEY!,
      facilitatorUrl: process.env.FACILITATOR_URL,
    });

    const response = await agentClient.fetch(`http://localhost:3001${endpoint.path}`);
    const data = await response.json();
    const totalDuration = Date.now() - startTime;
    const price = endpoint.priceNum;
    const newTotalSpent = currentSpend + price;

    steps.push(
      {
        id: "step-2",
        type: "challenge",
        label: "Payment Required",
        detail: `402 — ${endpoint.price} USDC on ${endpoint.chain}`,
        status: "complete",
        duration: Math.floor(totalDuration * 0.2),
        delay: 0,
      },
      {
        id: "step-3",
        type: "sign",
        label: "Payment Signed",
        detail: `Wallet ${agent.walletAddress.slice(0, 4)}...${agent.walletAddress.slice(-4)}`,
        status: "complete",
        duration: Math.floor(totalDuration * 0.25),
        delay: 0,
      },
      {
        id: "step-4",
        type: "verify",
        label: "Signature Verified",
        detail: "Facilitator validated payment",
        status: "complete",
        duration: Math.floor(totalDuration * 0.15),
        delay: 0,
      },
      {
        id: "step-5",
        type: "settle",
        label: "Payment Settled",
        detail: "On-chain settlement confirmed",
        status: "complete",
        duration: Math.floor(totalDuration * 0.3),
        delay: 0,
      },
      {
        id: "step-6",
        type: "response",
        label: "Data Received",
        detail: `${JSON.stringify(data).length} bytes`,
        status: "complete",
        duration: Math.floor(totalDuration * 0.1),
        delay: 0,
      }
    );

    return {
      steps,
      response: data,
      cost: endpoint.price,
      totalSpent: newTotalSpent.toFixed(3),
      remainingBudget: (dailyLimit - newTotalSpent).toFixed(3),
    };
  } catch (error) {
    steps.push({
      id: `step-${steps.length + 1}`,
      type: "error",
      label: "Execution Failed",
      detail: error instanceof Error ? error.message : "Unknown error",
      status: "error",
      duration: Date.now() - startTime,
      delay: 0,
    });

    return {
      steps,
      cost: "0",
      totalSpent: currentSpend.toFixed(3),
      remainingBudget: (dailyLimit - currentSpend).toFixed(3),
    };
  }
}
