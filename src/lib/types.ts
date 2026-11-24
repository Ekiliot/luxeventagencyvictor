export type Currency = 'EUR' | 'MDL';

export type LeadStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';

export interface Lead {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  service?: string;
  status: LeadStatus;
  notes?: string;
}

export interface LocalizedString {
  ru: string;
  ro: string;
  en: string;
}

export interface CatalogCategory {
  id: string;
  name: LocalizedString;
  order: number;
}

export interface CatalogItem {
  id: string;
  categoryId: string;
  title: LocalizedString;
  description: LocalizedString;
  price: string;
  currency?: Currency;
  priceFrom?: boolean;
  image: string;
  badge?: string;
  features: LocalizedString[];
  order: number;
  active: boolean;
}

export interface CatalogData {
  categories: CatalogCategory[];
  items: CatalogItem[];
}

export interface PortfolioItem {
  id: string;
  title: LocalizedString;
  category: LocalizedString;
  image: string; // Base64 (data:image/...;base64,...) or URL
  order: number;
  active: boolean;
}

export interface ClientDossier {
  id: string;
  createdAt: string;
  updatedAt?: string;
  name: string;
  phone: string;
  email?: string;
  eventDate?: string;
  eventType?: string;
  budget?: string;
  budgetAmount?: number;
  budgetCurrency?: Currency;
  expensesAmount?: number;
  status: 'lead' | 'in_discussion' | 'contract' | 'paid' | 'completed' | 'archived';
  tags?: string[];
  notes?: string;
  preferences?: string;
}

export interface VisitRecord {
  id: string;
  timestamp: string;
  path: string;
  referrer: string;
  country: string;
  city: string;
  device: string;
  browser: string;
  ip: string;
}

export interface AnalyticsData {
  summary: {
    totalViews: number;
    uniqueVisitors: number;
  };
  daily: Record<string, { views: number; unique: number }>;
  sources: Record<string, number>;
  countries: Record<string, number>;
  devices: Record<string, number>;
  recentVisits: VisitRecord[];
}
