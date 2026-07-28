// Shared TypeScript types for the Customer Portal

export interface Account {
  id: string;
  accountNumber: string;
  currency: string;
  balance: number;
  status: 'ACTIVE' | 'FROZEN';
}

export interface Transaction {
  id: string;
  reference: string;
  senderAccountNumber?: string;
  receiverAccountNumber?: string;
  senderAccount?: Account;
  receiverAccount?: Account;
  amount: number | string;
  currency: string;
  status: 'COMPLETED' | 'HELD' | 'REJECTED';
  riskScore?: number;
  createdAt: string;
  completedAt?: string;
}

export interface Beneficiary {
  id: string;
  beneficiaryName: string;
  beneficiaryAccountNumber: string;
}

export interface TransferPayload {
  senderAccountNumber: string;
  receiverAccountNumber: string;
  amount: number;
  idempotencyKey: string;
}
