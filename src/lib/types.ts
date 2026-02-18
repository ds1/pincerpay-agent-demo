export type FlowStepType =
  | "request"
  | "challenge"
  | "sign"
  | "verify"
  | "settle"
  | "response"
  | "error";

export type FlowStepStatus = "pending" | "active" | "complete" | "error";

export interface FlowStep {
  id: string;
  type: FlowStepType;
  label: string;
  detail?: string;
  status: FlowStepStatus;
  duration?: number;
  delay?: number; // ms to wait before showing this step (for client-side replay)
}

export interface DemoEndpoint {
  method: string;
  path: string;
  price: string;
  priceNum: number;
  chain: string;
  description: string;
  mockResponse: unknown;
}

export interface AgentConfig {
  walletAddress: string;
  chain: string;
  maxPerRequest: string;
  dailyLimit: string;
}

export interface ExecutionResult {
  steps: FlowStep[];
  response?: unknown;
  cost: string;
  txHash?: string;
  totalSpent: string;
  remainingBudget: string;
}

export interface TransactionLogEntry {
  endpoint: string;
  cost: string;
  txHash: string;
  timestamp: number;
}
