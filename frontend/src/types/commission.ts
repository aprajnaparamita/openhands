export enum CommissionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Commission {
  id: string;
  requesterId: string;
  providerId?: string;
  title: string;
  description: string;
  price: number;
  deadline: string;
  status: CommissionStatus;
  referenceImages?: string[];
  finalArtwork?: {
    url: string;
    hash: string;
  };
  escrowAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommissionData {
  title: string;
  description: string;
  price: number;
  deadline: string;
  referenceImages?: string[];
}
