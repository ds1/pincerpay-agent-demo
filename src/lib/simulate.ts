import type { DemoEndpoint, AgentConfig, FlowStep, ExecutionResult } from "./types";

const BASE58_CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function randomBase58(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += BASE58_CHARS[Math.floor(Math.random() * BASE58_CHARS.length)];
  }
  return result;
}

function generateSolanaAddress(): string {
  return randomBase58(32 + Math.floor(Math.random() * 12));
}

function generateTxHash(): string {
  return randomBase58(88);
}

function truncateAddress(addr: string): string {
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function generateResponseSize(response: unknown): number {
  return JSON.stringify(response).length;
}

export function simulateFlow(
  endpoint: DemoEndpoint,
  agent: AgentConfig,
  currentSpend: number
): ExecutionResult {
  const price = endpoint.priceNum;
  const maxPerReq = parseFloat(agent.maxPerRequest);
  const dailyLimit = parseFloat(agent.dailyLimit);
  const remaining = dailyLimit - currentSpend;

  // Check spending limits before signing
  if (price > maxPerReq) {
    return buildErrorResult(
      endpoint,
      agent,
      currentSpend,
      `Per-request limit exceeded — ${endpoint.price} USDC exceeds max of ${agent.maxPerRequest} USDC`
    );
  }

  if (price > remaining) {
    return buildErrorResult(
      endpoint,
      agent,
      currentSpend,
      `Daily budget exceeded — ${endpoint.price} USDC exceeds remaining budget of ${remaining.toFixed(3)} USDC`
    );
  }

  const txHash = generateTxHash();
  const responseSize = generateResponseSize(endpoint.mockResponse);
  const newTotalSpent = currentSpend + price;

  const steps: FlowStep[] = [
    {
      id: "step-1",
      type: "request",
      label: "Sending Request",
      detail: `${endpoint.method} ${endpoint.path}`,
      status: "complete",
      duration: 180 + Math.floor(Math.random() * 40),
      delay: 200,
    },
    {
      id: "step-2",
      type: "challenge",
      label: "Payment Required",
      detail: `402 — ${endpoint.price} USDC on ${endpoint.chain}`,
      status: "complete",
      duration: 250 + Math.floor(Math.random() * 100),
      delay: 300,
    },
    {
      id: "step-3",
      type: "sign",
      label: "Signing Payment",
      detail: `Wallet ${truncateAddress(agent.walletAddress)} authorizing ${endpoint.price} USDC`,
      status: "complete",
      duration: 350 + Math.floor(Math.random() * 100),
      delay: 400,
    },
    {
      id: "step-4",
      type: "verify",
      label: "Verifying Signature",
      detail: "Facilitator validating payment proof...",
      status: "complete",
      duration: 200 + Math.floor(Math.random() * 100),
      delay: 250,
    },
    {
      id: "step-5",
      type: "settle",
      label: "Payment Settled",
      detail: `tx ${truncateAddress(txHash)}`,
      status: "complete",
      duration: 300 + Math.floor(Math.random() * 100),
      delay: 350,
    },
    {
      id: "step-6",
      type: "response",
      label: "Data Received",
      detail: `${responseSize} bytes — ${endpoint.description}`,
      status: "complete",
      duration: 120 + Math.floor(Math.random() * 60),
      delay: 150,
    },
  ];

  return {
    steps,
    response: endpoint.mockResponse,
    cost: endpoint.price,
    txHash,
    totalSpent: newTotalSpent.toFixed(3),
    remainingBudget: (dailyLimit - newTotalSpent).toFixed(3),
  };
}

function buildErrorResult(
  endpoint: DemoEndpoint,
  agent: AgentConfig,
  currentSpend: number,
  errorDetail: string
): ExecutionResult {
  const dailyLimit = parseFloat(agent.dailyLimit);

  const steps: FlowStep[] = [
    {
      id: "step-1",
      type: "request",
      label: "Sending Request",
      detail: `${endpoint.method} ${endpoint.path}`,
      status: "complete",
      duration: 180 + Math.floor(Math.random() * 40),
      delay: 200,
    },
    {
      id: "step-2",
      type: "challenge",
      label: "Payment Required",
      detail: `402 — ${endpoint.price} USDC on ${endpoint.chain}`,
      status: "complete",
      duration: 250 + Math.floor(Math.random() * 100),
      delay: 300,
    },
    {
      id: "step-3",
      type: "error",
      label: "Spending Limit Exceeded",
      detail: errorDetail,
      status: "error",
      duration: 50,
      delay: 200,
    },
  ];

  return {
    steps,
    cost: "0",
    totalSpent: currentSpend.toFixed(3),
    remainingBudget: (dailyLimit - currentSpend).toFixed(3),
  };
}
