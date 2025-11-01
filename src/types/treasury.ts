export interface TreasuryStats {
  annual_budget: number;
  trsc_count: number;
  pssc_count: number;
  claimed_by_vendors_ada: number;
  allocated_to_trsc_ada: number;
  remaining_treasury_ada: number;
  treasury_balance_ada: number;
  budget_claimed_percentage: number;
}

export interface Milestone {
  date?: string;
  title?: string;
  amount_ada?: number;
  status?: string;
}

export interface PsscContract {
  id?: string;
  fund_tx: string;
  project?: string;
  vendor?: string;
  pssc_addr?: string;
  budget: number;
  balance?: number;
  claimed: number;
  status: number;
  milestones?: Milestone[];
  fund_date?: string;
}

export interface TrscChild {
  id: string;
  vendor?: string;
  name?: string;
  budgetAda?: number;
  balance?: number;
  claimedAda?: number;
  status?: string;
  milestones?: Milestone[];
  fund_date?: string;
}

export interface TrscContract {
  id: string;
  instance_id?: string;
  name: string;
  currency: string;
  balance: number;
  incomingToTRSC?: number;
  children_count?: number;
  undeclaredAmount?: number;
  children: TrscChild[];
}

export interface TreasuryData {
  trsc: TrscContract[];
  pssc: PsscContract[];
  totalTreasuryADA?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  className?: string;
  extendedProps?: Record<string, unknown> & {
    amount_ada?: number;
    pssc_addr?: string;
  };
}

export interface TreasuryOverview {
  stats: TreasuryStats;
  data: TreasuryData;
}

