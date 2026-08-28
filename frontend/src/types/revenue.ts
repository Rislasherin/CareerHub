export interface RevenueSummary {
  totalRevenue: number | null;
  mrr: number | null;
  arr: number | null;
  averageRevenuePerCollege: number | null;
  growthMoM: number | null;
  growthYoY: number | null;
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

export interface PlanRevenueData {
  planType: string;
  amount: number | null;
  collegeCount: number;
}

export interface TopRevenueCollege {
  collegeName: string;
  amount: number;
}

export interface RevenueTransaction {
  id: string;
  invoiceNumber: string;
  collegeName: string;
  plan: string;
  amount: number | null;
  date: string;
  paymentMethod: string | null;
  status: string;
}

export interface RevenueAnalyticsResponse {
  summary: RevenueSummary;
  monthlyRevenue: MonthlyRevenueData[];
  planRevenue: PlanRevenueData[] | null;
  topColleges: TopRevenueCollege[];
  transactions: RevenueTransaction[];
  total: number;
}
