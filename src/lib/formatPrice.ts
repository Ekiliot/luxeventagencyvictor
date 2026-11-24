import { Currency, ClientDossier } from './types';

export type PriceLang = 'ru' | 'ro' | 'en';

export interface ParsedPrice {
  amount: string;
  numericAmount: number;
  currency: Currency;
  priceFrom: boolean;
}

/**
 * Extracts normalized amount, currency (EUR/MDL), and priceFrom flag
 * from either structured DB fields or legacy free-text price strings (e.g. "от 280 €", "5000 MDL").
 */
export function parsePriceFields(
  rawPrice?: string | number | null,
  explicitCurrency?: Currency | string | null,
  explicitPriceFrom?: boolean | null
): ParsedPrice {
  const str = rawPrice !== undefined && rawPrice !== null ? String(rawPrice).trim() : '';
  const lower = str.toLowerCase();

  // Detect currency
  let currency: Currency = 'EUR';
  if (explicitCurrency === 'MDL' || explicitCurrency === 'EUR') {
    currency = explicitCurrency;
  } else if (
    lower.includes('mdl') ||
    lower.includes('лей') ||
    lower.includes('леев') ||
    lower.includes('lei') ||
    lower.includes('leu')
  ) {
    currency = 'MDL';
  } else if (lower.includes('€') || lower.includes('eur') || lower.includes('евро')) {
    currency = 'EUR';
  }

  // Detect "from" prefix
  const hasFromInText =
    /^(от|de\s+la|from)\b/i.test(lower) ||
    /\b(от|de\s+la|from)\s+\d/i.test(lower);

  const priceFrom =
    typeof explicitPriceFrom === 'boolean' ? explicitPriceFrom : hasFromInText;

  // Extract clean numeric part (strip prefixes & currency words/symbols)
  const stripped = str
    .replace(/^(от|de\s+la|from)\s+/i, '')
    .replace(/(€|eur|евро|mdl|леев|лей|lei|leu|\$)/gi, '')
    .trim();

  // Parse numeric value for formatting & calculations
  const numericMatch = stripped.replace(/\s+/g, '').replace(',', '.').match(/\d+(\.\d+)?/);
  const numericAmount = numericMatch ? parseFloat(numericMatch[0]) : 0;

  return {
    amount: stripped || (numericAmount ? String(numericAmount) : ''),
    numericAmount,
    currency,
    priceFrom,
  };
}

/**
 * Formats a number with thin spaces for thousands (e.g. 15000 -> "15 000").
 */
export function formatAmountNumber(num: number): string {
  if (!Number.isFinite(num)) return '0';
  const rounded = Math.round(num * 100) / 100;
  const parts = String(rounded).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return parts.join('.');
}

/**
 * Returns the localized currency unit label.
 */
export function getCurrencyLabel(currency: Currency, lang: PriceLang = 'ru'): string {
  if (currency === 'EUR') {
    return '€';
  }
  if (lang === 'ro') return 'lei';
  if (lang === 'en') return 'MDL';
  return 'лей';
}

/**
 * Returns the localized "from" prefix.
 */
export function getFromPrefix(lang: PriceLang = 'ru'): string {
  if (lang === 'ro') return 'de la';
  if (lang === 'en') return 'from';
  return 'от';
}

/**
 * Formats a catalog item's price for display on the website or admin panel.
 * Respects DB currency (EUR / MDL) and priceFrom ("от" / "de la" / "from") toggle.
 */
export function formatPrice(
  item: { price: string; currency?: Currency; priceFrom?: boolean },
  lang: PriceLang = 'ru'
): string {
  const parsed = parsePriceFields(item.price, item.currency, item.priceFrom);
  const unit = getCurrencyLabel(parsed.currency, lang);
  const prefix = parsed.priceFrom ? `${getFromPrefix(lang)} ` : '';

  // If the cleaned amount is purely numeric (e.g. "280", "5000", "15 000"), format nicely
  const compact = parsed.amount.replace(/\s+/g, '').replace(',', '.');
  if (/^\d+(\.\d+)?$/.test(compact)) {
    const formattedNum = formatAmountNumber(parseFloat(compact));
    return `${prefix}${formattedNum} ${unit}`;
  }

  // Fallback for custom range strings like "200 - 350"
  if (parsed.amount) {
    return `${prefix}${parsed.amount} ${unit}`;
  }

  return item.price || '';
}

/**
 * Formats a monetary total (for dashboard KPIs, revenue, profit, budgets).
 */
export function formatMoney(
  amount: number,
  currency: Currency,
  lang: PriceLang = 'ru'
): string {
  const formatted = formatAmountNumber(amount);
  const unit = getCurrencyLabel(currency, lang);
  return `${formatted} ${unit}`;
}

/**
 * Extracts numeric revenue, expenses, and currency from a ClientDossier
 * (supports both new structured fields and legacy free-text `budget`).
 */
export function parseClientFinancials(client: ClientDossier): {
  revenue: number;
  expenses: number;
  profit: number;
  currency: Currency;
} {
  const parsedLegacy = parsePriceFields(client.budget, client.budgetCurrency, false);
  const currency: Currency =
    client.budgetCurrency === 'MDL' || client.budgetCurrency === 'EUR'
      ? client.budgetCurrency
      : parsedLegacy.currency;

  const revenue =
    typeof client.budgetAmount === 'number' && client.budgetAmount > 0
      ? client.budgetAmount
      : parsedLegacy.numericAmount;

  const expenses =
    typeof client.expensesAmount === 'number' && client.expensesAmount > 0
      ? client.expensesAmount
      : 0;

  return {
    revenue,
    expenses,
    profit: revenue - expenses,
    currency,
  };
}
