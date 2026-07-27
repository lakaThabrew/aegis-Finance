export interface HeldTransfer {
  id: string;
  reference: string;
  senderAccountNumber: string;
  receiverAccountNumber: string;
  amount: number;
  currency: string;
  riskScore: number;
  fraudReasons: string;
  status: 'HELD' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  event: string;
  actor: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

export interface DashboardStats {
  totalTransactions: number;
  heldTransfers: number;
  totalVolume: number;
  flaggedPercentage: number;
}
