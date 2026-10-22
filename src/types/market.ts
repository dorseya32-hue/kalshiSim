export type MarketCategory = 'Tech & AI' | 'Crypto & Finance' | 'Science & Space' | 'World & Politics' | 'Culture & Sports';

export type MarketStatus = 'open' | 'resolved' | 'cancelled';

export type Outcome = 'YES' | 'NO';

export interface MarketPosition {
  uid: string;
  username: string;
  email: string;
  side: Outcome;
  stake: number;
  grossStake?: number;
  feePaid?: number;
  timestamp: string;
}

export interface MarketComment {
  id: string;
  uid: string;
  username: string;
  text: string;
  side?: Outcome;
  timestamp: string;
}

export interface Market {
  id: string;
  question: string;
  description: string;
  category: MarketCategory;
  closesAt: string; // ISO string
  createdAt: string; // ISO string
  status: MarketStatus;
  outcome: Outcome | null;
  resolvedAt?: string;
  createdBy: string;
  createdByName: string;
  positions: Record<string, MarketPosition>; // uid -> position
  comments?: MarketComment[];
  totalFeesCollected?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  balance: number;
  createdAt: string;
  avatarColor?: string;
}

export interface ActivityEvent {
  id: string;
  type: 'bet' | 'market_created' | 'market_resolved' | 'credit_adjusted';
  title: string;
  description: string;
  timestamp: string;
  marketId?: string;
  amount?: number;
  user?: string;
}
