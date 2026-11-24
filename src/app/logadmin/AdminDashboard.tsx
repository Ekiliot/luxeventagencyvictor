'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Tag,
  TrendingUp,
  LogOut,
  ExternalLink,
  Search,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Phone,
  Eye,
  EyeOff,
  Globe,
  Smartphone,
  X,
  Layers,
  Copy,
  Check,
  MessageSquare,
  Upload,
  BookOpen,
  Calendar,
  Send,
  Wallet,
  DollarSign,
  Percent,
  ArrowUpRight,
  PiggyBank,
  Receipt,
  Image as ImageIcon,
  UserPlus,
  Download,
  Database,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  Currency,
  Lead,
  LeadStatus,
  CatalogData,
  CatalogCategory,
  CatalogItem,
  PortfolioItem,
  AnalyticsData,
  ClientDossier,
} from '@/lib/types';
import { adminDict, AdminLang } from '@/lib/adminDict';
import {
  formatPrice,
  formatMoney,
  parsePriceFields,
  parseClientFinancials,
} from '@/lib/formatPrice';
import styles from './admin.module.css';

interface AdminDashboardProps {
  onLogout: () => void;
  lang: AdminLang;
  onLangChange: (l: AdminLang) => void;
}

type AdminTab = 'dashboard' | 'leads' | 'clients' | 'catalog' | 'portfolio' | 'analytics';
type ClientSort = 'newest' | 'eventDate' | 'budget';

interface ToastMsg {
  id: string;
  text: string;
}

/** Optimizes an image File on HTML5 Canvas to crisp, lightweight JPEG Base64 */
function optimizeFileToBase64(file: File, callback: (base64: string) => void) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const rawDataUrl = event.target?.result as string;
    if (!rawDataUrl) return;

    const img = new Image();
    img.onload = () => {
      const MAX_DIM = 1600;
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.84));
      } else {
        callback(rawDataUrl);
      }
    };
    img.onerror = () => callback(rawDataUrl);
    img.src = rawDataUrl;
  };
  reader.readAsDataURL(file);
}

export function AdminDashboard({ onLogout, lang, onLangChange }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Data states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<ClientDossier[]>([]);
  const [catalog, setCatalog] = useState<CatalogData>({ categories: [], items: [] });
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Dashboard report currency & EUR -> MDL exchange rate
  const [reportCurrency, setReportCurrency] = useState<Currency>('EUR');
  const [eurToMdlRate, setEurToMdlRate] = useState<number>(19.5);

  // Filters & Sorts
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
  const [leadNotesDraft, setLeadNotesDraft] = useState<Record<string, string>>({});

  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState<string>('all');
  const [clientSort, setClientSort] = useState<ClientSort>('newest');

  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>('all');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [confirmState, setConfirmState] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Modals
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<ClientDossier> | null>(null);
  const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<CatalogItem> | null>(null);
  const [featuresInput, setFeaturesInput] = useState('');
  const [itemDragActive, setItemDragActive] = useState(false);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState({ ru: '', ro: '', en: '' });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatDraft, setEditingCatDraft] = useState({ ru: '', ro: '', en: '' });

  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Partial<PortfolioItem> | null>(null);
  const [portDragActive, setPortDragActive] = useState(false);

  const t = adminDict[lang] || adminDict.ru;
  const dateLocale = lang === 'ro' ? 'ro-RO' : 'ru-RU';

  const showToast = useCallback((text: string) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 2800);
  }, []);

  const askConfirm = (message: string, onConfirm: () => void) => {
    setConfirmState({ message, onConfirm });
  };

  // Close open modals on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmState) setConfirmState(null);
        else if (itemModalOpen) setItemModalOpen(false);
        else if (categoryModalOpen) setCategoryModalOpen(false);
        else if (clientModalOpen) setClientModalOpen(false);
        else if (portfolioModalOpen) setPortfolioModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmState, itemModalOpen, categoryModalOpen, clientModalOpen, portfolioModalOpen]);

  useEffect(() => {
    const savedRate = localStorage.getItem('luxe_eur_mdl_rate');
    if (savedRate) {
      const parsed = parseFloat(savedRate);
      if (Number.isFinite(parsed) && parsed > 0) setEurToMdlRate(parsed);
    }
    const savedCurr = localStorage.getItem('luxe_report_currency');
    if (savedCurr === 'EUR' || savedCurr === 'MDL') {
      setReportCurrency(savedCurr);
    }
  }, []);

  const handleRateChange = (val: string) => {
    const num = parseFloat(val);
    if (Number.isFinite(num) && num > 0) {
      setEurToMdlRate(num);
      localStorage.setItem('luxe_eur_mdl_rate', String(num));
    }
  };

  const handleReportCurrencyChange = (curr: Currency) => {
    setReportCurrency(curr);
    localStorage.setItem('luxe_report_currency', curr);
  };

  const convertToReportCurrency = useCallback(
    (amount: number, from: Currency): number => {
      if (from === reportCurrency) return amount;
      if (from === 'EUR' && reportCurrency === 'MDL') return amount * eurToMdlRate;
      if (from === 'MDL' && reportCurrency === 'EUR')
        return eurToMdlRate > 0 ? amount / eurToMdlRate : amount;
      return amount;
    },
    [reportCurrency, eurToMdlRate]
  );

  const getLoc = (obj: any): string => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj['ru'] || obj['ro'] || obj['en'] || '';
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(t.toasts.copied);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [leadsRes, clientsRes, catRes, portRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/leads'),
        fetch('/api/admin/clients'),
        fetch('/api/admin/catalog'),
        fetch('/api/admin/portfolio'),
        fetch('/api/admin/analytics'),
      ]);

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data.leads || []);
      }
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.clients || []);
      }
      if (catRes.ok) {
        const data = await catRes.json();
        setCatalog(data || { categories: [], items: [] });
      }
      if (portRes.ok) {
        const data = await portRes.json();
        setPortfolio(data.items || []);
      }
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSyncSupabase = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/admin/sync', { method: 'POST' });
      if (res.ok) {
        showToast(t.toasts.syncSuccess);
        fetchData();
      } else {
        showToast(t.toasts.syncError);
      }
    } catch {
      showToast(t.toasts.syncError);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    onLogout();
  };

  // --- DASHBOARD FINANCIAL & BUSINESS METRICS ---
  const dashboardStats = useMemo(() => {
    let revenueTotal = 0;
    let expensesTotal = 0;
    let pipelineTotal = 0;
    let paidDealsCount = 0;

    let revEur = 0;
    let revMdl = 0;
    let profitEur = 0;
    let profitMdl = 0;

    const statusTotals: Record<string, { count: number; amount: number }> = {
      lead: { count: 0, amount: 0 },
      in_discussion: { count: 0, amount: 0 },
      contract: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 },
      completed: { count: 0, amount: 0 },
    };

    const now = new Date();
    const months: { key: string; label: string; revenue: number; profit: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString(dateLocale, { month: 'short' });
      months.push({ key, label, revenue: 0, profit: 0 });
    }
    const monthMap = new Map(months.map((m) => [m.key, m]));

    for (const c of clients) {
      const fin = parseClientFinancials(c);
      const convRev = convertToReportCurrency(fin.revenue, fin.currency);
      const convExp = convertToReportCurrency(fin.expenses, fin.currency);
      const convProfit = convRev - convExp;

      if (statusTotals[c.status]) {
        statusTotals[c.status].count += 1;
        statusTotals[c.status].amount += convRev;
      }

      if (c.status === 'paid' || c.status === 'completed') {
        revenueTotal += convRev;
        expensesTotal += convExp;
        paidDealsCount += 1;
        if (fin.currency === 'EUR') {
          revEur += fin.revenue;
          profitEur += fin.profit;
        } else {
          revMdl += fin.revenue;
          profitMdl += fin.profit;
        }

        const refDateStr = c.eventDate || c.createdAt;
        if (refDateStr) {
          const dt = new Date(refDateStr);
          if (!isNaN(dt.getTime())) {
            const mKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
            const bucket = monthMap.get(mKey);
            if (bucket) {
              bucket.revenue += convRev;
              bucket.profit += convProfit;
            }
          }
        }
      } else if (c.status === 'contract' || c.status === 'in_discussion') {
        pipelineTotal += convRev;
      }
    }

    const netProfit = revenueTotal - expensesTotal;
    const profitMargin = revenueTotal > 0 ? Math.round((netProfit / revenueTotal) * 100) : 0;
    const avgDeal = paidDealsCount > 0 ? revenueTotal / paidDealsCount : 0;

    const completedLeads = leads.filter((l) => l.status === 'completed').length;
    const conversionRate =
      leads.length > 0 ? Math.round((completedLeads / leads.length) * 100) : 0;

    const activeItems = (catalog.items || []).filter((i) => i.active !== false);
    const itemsEur = activeItems.filter(
      (i) => parsePriceFields(i.price, i.currency, i.priceFrom).currency === 'EUR'
    ).length;
    const itemsMdl = activeItems.filter(
      (i) => parsePriceFields(i.price, i.currency, i.priceFrom).currency === 'MDL'
    ).length;
    const itemsWithFrom = activeItems.filter(
      (i) => parsePriceFields(i.price, i.currency, i.priceFrom).priceFrom
    ).length;

    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingEvents = clients
      .filter((c) => c.eventDate && c.eventDate >= todayStr && c.status !== 'archived')
      .sort((a, b) => (a.eventDate || '').localeCompare(b.eventDate || ''))
      .slice(0, 5);

    return {
      revenueTotal,
      expensesTotal,
      netProfit,
      profitMargin,
      pipelineTotal,
      avgDeal,
      paidDealsCount,
      revEur,
      revMdl,
      profitEur,
      profitMdl,
      conversionRate,
      months,
      statusTotals,
      activeItemsCount: activeItems.length,
      itemsEur,
      itemsMdl,
      itemsWithFrom,
      upcomingEvents,
    };
  }, [clients, leads, catalog.items, convertToReportCurrency, dateLocale]);

  // --- LEADS ACTIONS ---
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
    try {
      await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      showToast(t.toasts.statusUpdated);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleSaveLeadNote = async (lead: Lead, noteValue: string) => {
    if ((lead.notes || '') === noteValue) return;
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, notes: noteValue } : l)));
    try {
      await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, status: lead.status, notes: noteValue }),
      });
      showToast(t.toasts.noteSaved);
    } catch (err) {
      console.error('Failed to save lead note', err);
    }
  };

  const handleConvertLeadToClient = (lead: Lead) => {
    const parsedServicePrice = parsePriceFields(lead.service || '');
    // Try extracting date if present in booking message (YYYY-MM-DD)
    const dateMatch = lead.message?.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
    setConvertingLeadId(lead.id);
    setEditingClient({
      name: lead.name,
      phone: lead.phone,
      email: lead.email || '',
      eventDate: dateMatch ? dateMatch[1] : '',
      eventType: lead.service || t.clients.defaultEventType,
      budgetAmount: parsedServicePrice.numericAmount || 0,
      budgetCurrency: parsedServicePrice.currency || 'EUR',
      expensesAmount: 0,
      status: 'in_discussion',
      notes: [lead.notes, lead.message].filter(Boolean).join('\n'),
      preferences: '',
    });
    setClientModalOpen(true);
    showToast(t.toasts.leadConverted);
  };

  const handleDeleteLead = (leadId: string) => {
    askConfirm(t.leads.confirmDelete, async () => {
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      try {
        await fetch(`/api/admin/leads?id=${leadId}`, { method: 'DELETE' });
        showToast(t.toasts.leadDeleted);
      } catch (err) {
        console.error('Failed to delete lead', err);
      }
    });
  };

  // --- CLIENT ACTIONS (CRM) ---
  const openAddClientModal = () => {
    setConvertingLeadId(null);
    setEditingClient({
      name: '',
      phone: '',
      email: '',
      eventDate: '',
      eventType: t.clients.defaultEventType,
      budget: '',
      budgetAmount: 0,
      budgetCurrency: 'EUR',
      expensesAmount: 0,
      status: 'lead',
      notes: '',
      preferences: '',
    });
    setClientModalOpen(true);
  };

  const openEditClientModal = (c: ClientDossier) => {
    setConvertingLeadId(null);
    const fin = parseClientFinancials(c);
    setEditingClient({
      ...c,
      budgetAmount: fin.revenue,
      budgetCurrency: fin.currency,
      expensesAmount: fin.expenses,
    });
    setClientModalOpen(true);
  };

  const handleQuickClientStatus = async (client: ClientDossier, newStatus: ClientDossier['status']) => {
    setClients((prev) => prev.map((c) => (c.id === client.id ? { ...c, status: newStatus } : c)));
    try {
      await fetch('/api/admin/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: client.id, status: newStatus }),
      });
      showToast(t.toasts.statusUpdated);
    } catch (err) {
      console.error('Failed to update client status', err);
    }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editingClient.name || !editingClient.phone) return;

    const currency: Currency = editingClient.budgetCurrency === 'MDL' ? 'MDL' : 'EUR';
    const budgetAmount = Number(editingClient.budgetAmount) || 0;
    const expensesAmount = Number(editingClient.expensesAmount) || 0;
    const payload = {
      ...editingClient,
      budgetAmount,
      budgetCurrency: currency,
      expensesAmount,
      budget:
        budgetAmount > 0 ? formatMoney(budgetAmount, currency, lang) : editingClient.budget || '',
    };

    try {
      if (editingClient.id) {
        const res = await fetch('/api/admin/clients', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { client } = await res.json();
          setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
          showToast(t.toasts.clientSaved);
        }
      } else {
        const res = await fetch('/api/admin/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { client } = await res.json();
          setClients((prev) => [client, ...prev]);
          showToast(t.toasts.clientSaved);

          if (convertingLeadId) {
            handleStatusChange(convertingLeadId, 'in_progress');
            setConvertingLeadId(null);
            setActiveTab('clients');
          }
        }
      }
      setClientModalOpen(false);
      setEditingClient(null);
    } catch (err) {
      console.error('Failed to save client', err);
    }
  };

  const handleDeleteClient = (id: string) => {
    askConfirm(t.clients.confirmDelete, async () => {
      setClients((prev) => prev.filter((c) => c.id !== id));
      try {
        await fetch(`/api/admin/clients?id=${id}`, { method: 'DELETE' });
        showToast(t.toasts.clientDeleted);
      } catch (err) {
        console.error('Failed to delete client', err);
      }
    });
  };

  const handleExportClientsCsv = () => {
    const headers = ['Name', 'Phone', 'Email', 'Event Date', 'Event Type', 'Status', 'Revenue', 'Expenses', 'Profit', 'Currency', 'Notes'];
    const rows = clients.map((c) => {
      const fin = parseClientFinancials(c);
      return [
        c.name,
        c.phone,
        c.email || '',
        c.eventDate || '',
        c.eventType || '',
        c.status,
        String(fin.revenue),
        String(fin.expenses),
        String(fin.profit),
        fin.currency,
        (c.notes || '').replace(/\r?\n/g, ' '),
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luxe-clients-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t.toasts.csvExported);
  };

  // --- CATALOG ACTIONS ---
  const openAddItemModal = () => {
    setEditingItem({
      categoryId:
        catalogCategoryFilter !== 'all'
          ? catalogCategoryFilter
          : catalog.categories[0]?.id || 'photozones',
      title: { ru: '', ro: '', en: '' },
      description: { ru: '', ro: '', en: '' },
      price: '',
      currency: 'EUR',
      priceFrom: true,
      image: '',
      badge: t.catalog.defaultBadge,
      active: true,
      order: (catalog.items?.length || 0) + 1,
    });
    setFeaturesInput('');
    setItemModalOpen(true);
  };

  const openEditItemModal = (item: CatalogItem) => {
    const parsed = parsePriceFields(item.price, item.currency, item.priceFrom);
    setEditingItem({
      ...item,
      price: parsed.amount || item.price,
      currency: parsed.currency,
      priceFrom: parsed.priceFrom,
    });
    const featStr = (item.features || [])
      .map((f) => (typeof f === 'string' ? f : f[lang] || f.ru || f.ro || f.en))
      .join('\n');
    setFeaturesInput(featStr);
    setItemModalOpen(true);
  };

  const handleToggleItemActive = async (item: CatalogItem) => {
    const nextActive = item.active === false;
    setCatalog((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === item.id ? { ...i, active: nextActive } : i)),
    }));
    try {
      await fetch('/api/admin/catalog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'item',
          id: item.id,
          updates: { active: nextActive },
        }),
      });
      showToast(t.toasts.visibilityUpdated);
    } catch (err) {
      console.error('Failed to toggle item visibility', err);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const parsedFeatures = featuresInput
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean)
      .map((f) => ({ ru: f, ro: f, en: f }));

    const itemPayload = {
      ...editingItem,
      currency: editingItem.currency === 'MDL' ? 'MDL' : 'EUR',
      priceFrom: Boolean(editingItem.priceFrom),
      features: parsedFeatures,
    };

    try {
      if (editingItem.id) {
        const res = await fetch('/api/admin/catalog', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'item',
            id: editingItem.id,
            updates: itemPayload,
          }),
        });
        if (res.ok) {
          const { item } = await res.json();
          setCatalog((prev) => ({
            ...prev,
            items: prev.items.map((i) => (i.id === item.id ? item : i)),
          }));
          showToast(t.toasts.itemSaved);
        }
      } else {
        const res = await fetch('/api/admin/catalog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'item',
            data: itemPayload,
          }),
        });
        if (res.ok) {
          const { item } = await res.json();
          setCatalog((prev) => ({
            ...prev,
            items: [...prev.items, item],
          }));
          showToast(t.toasts.itemSaved);
        }
      }
      setItemModalOpen(false);
    } catch (err) {
      console.error('Failed to save catalog item', err);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    askConfirm(t.catalog.confirmDelete, async () => {
      setCatalog((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.id !== itemId),
      }));
      try {
        await fetch(`/api/admin/catalog?type=item&id=${itemId}`, { method: 'DELETE' });
        showToast(t.toasts.itemDeleted);
      } catch (err) {
        console.error('Failed to delete item', err);
      }
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.ru) return;

    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'category',
          data: {
            name: {
              ru: newCatName.ru,
              ro: newCatName.ro || newCatName.ru,
              en: newCatName.en || newCatName.ru,
            },
            order: (catalog.categories?.length || 0) + 1,
          },
        }),
      });

      if (res.ok) {
        const { category } = await res.json();
        setCatalog((prev) => ({
          ...prev,
          categories: [...prev.categories, category],
        }));
        setNewCatName({ ru: '', ro: '', en: '' });
        showToast(t.toasts.categorySaved);
      }
    } catch (err) {
      console.error('Failed to add category', err);
    }
  };

  const startEditCategory = (c: CatalogCategory) => {
    setEditingCatId(c.id);
    setEditingCatDraft({
      ru: c.name.ru || '',
      ro: c.name.ro || '',
      en: c.name.en || '',
    });
  };

  const handleSaveCategoryEdit = async (catId: string) => {
    if (!editingCatDraft.ru.trim()) return;
    const updatedName = {
      ru: editingCatDraft.ru.trim(),
      ro: editingCatDraft.ro.trim() || editingCatDraft.ru.trim(),
      en: editingCatDraft.en.trim() || editingCatDraft.ru.trim(),
    };
    setCatalog((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === catId ? { ...c, name: updatedName } : c)),
    }));
    setEditingCatId(null);
    try {
      await fetch('/api/admin/catalog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'category',
          id: catId,
          updates: { name: updatedName },
        }),
      });
      showToast(t.toasts.categorySaved);
    } catch (err) {
      console.error('Failed to update category', err);
    }
  };

  const handleDeleteCategory = (catId: string) => {
    askConfirm(t.catalog.confirmDeleteCat, async () => {
      setCatalog((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c.id !== catId),
        items: prev.items.filter((i) => i.categoryId !== catId),
      }));
      try {
        await fetch(`/api/admin/catalog?type=category&id=${catId}`, { method: 'DELETE' });
        showToast(t.toasts.categoryDeleted);
      } catch (err) {
        console.error('Failed to delete category', err);
      }
    });
  };

  // --- PORTFOLIO ACTIONS (BASE64 -> SUPABASE) ---
  const openAddPortfolioModal = () => {
    setEditingPortfolio({
      title: { ru: '', ro: '', en: '' },
      category: { ru: '', ro: '', en: '' },
      image: '',
      order: portfolio.length + 1,
      active: true,
    });
    setPortfolioModalOpen(true);
  };

  const openEditPortfolioModal = (item: PortfolioItem) => {
    setEditingPortfolio({ ...item });
    setPortfolioModalOpen(true);
  };

  const handleTogglePortfolioActive = async (item: PortfolioItem) => {
    const nextActive = item.active === false;
    setPortfolio((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, active: nextActive } : p))
    );
    try {
      await fetch('/api/admin/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, updates: { active: nextActive } }),
      });
      showToast(t.toasts.visibilityUpdated);
    } catch (err) {
      console.error('Failed to toggle portfolio visibility', err);
    }
  };

  const handleMovePortfolio = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= portfolio.length) return;

    const reordered = [...portfolio];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);

    const withNewOrders = reordered.map((p, idx) => ({ ...p, order: idx + 1 }));
    setPortfolio(withNewOrders);

    try {
      await Promise.all([
        fetch('/api/admin/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: withNewOrders[index].id,
            updates: { order: withNewOrders[index].order },
          }),
        }),
        fetch('/api/admin/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: withNewOrders[targetIdx].id,
            updates: { order: withNewOrders[targetIdx].order },
          }),
        }),
      ]);
      showToast(t.toasts.orderUpdated);
    } catch (err) {
      console.error('Failed to reorder portfolio', err);
    }
  };

  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPortfolio || !editingPortfolio.title?.ru || !editingPortfolio.image) return;

    const payload = {
      title: {
        ru: editingPortfolio.title.ru,
        ro: editingPortfolio.title.ro || editingPortfolio.title.ru,
        en: editingPortfolio.title.en || editingPortfolio.title.ru,
      },
      category: {
        ru: editingPortfolio.category?.ru || 'Портфолио',
        ro: editingPortfolio.category?.ro || editingPortfolio.category?.ru || 'Portofoliu',
        en: editingPortfolio.category?.en || editingPortfolio.category?.ru || 'Portfolio',
      },
      image: editingPortfolio.image,
      order: Number(editingPortfolio.order) || 0,
      active: editingPortfolio.active !== false,
    };

    try {
      if (editingPortfolio.id) {
        const res = await fetch('/api/admin/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPortfolio.id, updates: payload }),
        });
        if (res.ok) {
          const { item } = await res.json();
          setPortfolio((prev) =>
            prev.map((p) => (p.id === item.id ? item : p)).sort((a, b) => a.order - b.order)
          );
          showToast(t.toasts.portfolioSaved);
        }
      } else {
        const res = await fetch('/api/admin/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { item } = await res.json();
          setPortfolio((prev) => [...prev, item].sort((a, b) => a.order - b.order));
          showToast(t.toasts.portfolioSaved);
        }
      }
      setPortfolioModalOpen(false);
      setEditingPortfolio(null);
    } catch (err) {
      console.error('Failed to save portfolio item', err);
    }
  };

  const handleDeletePortfolio = (id: string) => {
    askConfirm(t.portfolio.confirmDelete, async () => {
      setPortfolio((prev) => prev.filter((p) => p.id !== id));
      try {
        await fetch(`/api/admin/portfolio?id=${id}`, { method: 'DELETE' });
        showToast(t.toasts.portfolioDeleted);
      } catch (err) {
        console.error('Failed to delete portfolio item', err);
      }
    });
  };

  const createTestLead = async () => {
    const testNames = ['Анастасия Руссу', 'Mihail Cebanu', 'Victoria Moraru', 'Alexander Popov'];
    const testServices =
      lang === 'ro'
        ? ['Fotozonă lucioasă cu neon (de la 280 €)', 'Candy bar «Royal Sweet»', 'Eveniment la cheie']
        : ['Глянцевая фотозона с неоном (от 280 €)', 'Кэнди бар «Royal Sweet»', 'Организация под ключ'];
    const randomName = testNames[Math.floor(Math.random() * testNames.length)];
    const randomService = testServices[Math.floor(Math.random() * testServices.length)];

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: randomName,
        phone: '+37368' + Math.floor(100000 + Math.random() * 900000),
        email: 'client@gmail.com',
        message:
          lang === 'ro'
            ? 'Bună ziua! Dorim să rezervăm decorul pentru eveniment.'
            : 'Добрый день! Хотим забронировать оформление для праздника.',
        service: randomService,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setLeads((prev) => [data.lead, ...prev]);
      showToast(t.toasts.leadCreated);
    }
  };

  // Filtered Lists
  const newLeadsCount = leads.filter((l) => l.status === 'new').length;
  const filteredLeads = leads.filter((l) => {
    const matchesStatus = leadStatusFilter === 'all' || l.status === leadStatusFilter;
    const matchesSearch =
      !leadSearch ||
      l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.phone.toLowerCase().includes(leadSearch.toLowerCase()) ||
      (l.service && l.service.toLowerCase().includes(leadSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const filteredClients = useMemo(() => {
    const base = clients.filter((c) => {
      const matchesStatus = clientStatusFilter === 'all' || c.status === clientStatusFilter;
      const matchesSearch =
        !clientSearch ||
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.phone.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.eventType && c.eventType.toLowerCase().includes(clientSearch.toLowerCase())) ||
        (c.notes && c.notes.toLowerCase().includes(clientSearch.toLowerCase()));
      return matchesStatus && matchesSearch;
    });

    if (clientSort === 'eventDate') {
      return [...base].sort((a, b) => (a.eventDate || '9999').localeCompare(b.eventDate || '9999'));
    }
    if (clientSort === 'budget') {
      return [...base].sort((a, b) => {
        const fa = parseClientFinancials(a);
        const fb = parseClientFinancials(b);
        return (
          convertToReportCurrency(fb.revenue, fb.currency) -
          convertToReportCurrency(fa.revenue, fa.currency)
        );
      });
    }
    return base;
  }, [clients, clientStatusFilter, clientSearch, clientSort, convertToReportCurrency]);

  const filteredCatalogItems = useMemo(() => {
    return (catalog.items || []).filter((item) => {
      const matchesCat =
        catalogCategoryFilter === 'all' || item.categoryId === catalogCategoryFilter;
      if (!matchesCat) return false;
      if (!catalogSearch) return true;
      const q = catalogSearch.toLowerCase();
      return (
        item.title?.ru?.toLowerCase().includes(q) ||
        item.title?.ro?.toLowerCase().includes(q) ||
        item.description?.ru?.toLowerCase().includes(q) ||
        item.description?.ro?.toLowerCase().includes(q)
      );
    });
  }, [catalog.items, catalogCategoryFilter, catalogSearch]);

  const cleanPhone = (phone: string) => phone.replace(/[^\d]/g, '');

  const clientStatusStyles: Record<string, { bg: string; dot: string; text: string }> = {
    lead: { bg: 'rgba(148, 163, 184, 0.12)', dot: '#94a3b8', text: '#cbd5e1' },
    in_discussion: { bg: 'rgba(59, 130, 246, 0.12)', dot: '#3b82f6', text: '#93c5fd' },
    contract: { bg: 'rgba(245, 158, 11, 0.12)', dot: '#f59e0b', text: '#fcd34d' },
    paid: { bg: 'rgba(16, 185, 129, 0.12)', dot: '#10b981', text: '#6ee7b7' },
    completed: { bg: 'rgba(99, 102, 241, 0.12)', dot: '#6366f1', text: '#a5b4fc' },
    archived: { bg: 'rgba(100, 116, 139, 0.12)', dot: '#64748b', text: '#94a3b8' },
  };

  return (
    <div className={styles.workspace}>
      {/* LEFT SIDEBAR (Desktop) */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <span className={styles.brandLogo}>
            LUXE<span className={styles.brandGold}>.</span>
          </span>
          <span className={styles.brandBadge}>{t.top.adminBadge}</span>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.navGroup}>
            <span className={styles.navGroupLabel}>{t.groups.overview}</span>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`${styles.sidebarBtn} ${activeTab === 'dashboard' ? styles.sidebarBtnActive : ''}`}
            >
              <LayoutDashboard size={17} />
              <span>{t.tabs.dashboard}</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`${styles.sidebarBtn} ${activeTab === 'analytics' ? styles.sidebarBtnActive : ''}`}
            >
              <TrendingUp size={17} />
              <span>{t.tabs.analytics}</span>
            </button>
          </div>

          <div className={styles.navGroup}>
            <span className={styles.navGroupLabel}>{t.groups.crm}</span>
            <button
              onClick={() => setActiveTab('leads')}
              className={`${styles.sidebarBtn} ${activeTab === 'leads' ? styles.sidebarBtnActive : ''}`}
            >
              <Users size={17} />
              <span>{t.tabs.leads}</span>
              {newLeadsCount > 0 ? (
                <span className={styles.badgePill}>{newLeadsCount}</span>
              ) : (
                <span className={styles.badgePillMuted}>{leads.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`${styles.sidebarBtn} ${activeTab === 'clients' ? styles.sidebarBtnActive : ''}`}
            >
              <BookOpen size={17} />
              <span>{t.tabs.clients}</span>
              <span className={styles.badgePillMuted}>{clients.length}</span>
            </button>
          </div>

          <div className={styles.navGroup}>
            <span className={styles.navGroupLabel}>{t.groups.content}</span>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`${styles.sidebarBtn} ${activeTab === 'catalog' ? styles.sidebarBtnActive : ''}`}
            >
              <Tag size={17} />
              <span>{t.tabs.catalog}</span>
              <span className={styles.badgePillMuted}>{catalog.items?.length || 0}</span>
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`${styles.sidebarBtn} ${activeTab === 'portfolio' ? styles.sidebarBtnActive : ''}`}
            >
              <ImageIcon size={17} />
              <span>{t.tabs.portfolio}</span>
              <span className={styles.badgePillMuted}>{portfolio.length}</span>
            </button>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarUtilityRow}>
            <button
              onClick={handleSyncSupabase}
              disabled={isSyncing}
              className={styles.actionBtn}
            >
              <Database size={15} className={isSyncing ? styles.spinIcon : ''} />
              <span>{isSyncing ? t.top.syncing : t.top.sync}</span>
            </button>
            <Link href={`/${lang}`} target="_blank" className={styles.actionBtn}>
              <ExternalLink size={15} />
              <span>{t.top.site}</span>
            </Link>
          </div>

          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={15} />
            <span>{t.top.logout}</span>
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE COLUMN */}
      <div className={styles.mainArea}>
        {/* Sticky Top Header */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.mobileBrandOnly}>
              LUXE<span className={styles.brandGold}>.</span>
            </span>
            <span className={styles.topbarSectionTitle}>{t.tabs[activeTab]}</span>
          </div>

          <div className={styles.topActions}>
            <div className={styles.langSwitchWrap}>
              {(['ru', 'ro'] as AdminLang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => onLangChange(l)}
                  className={`${styles.langBtn} ${lang === l ? styles.activeLangBtn : ''}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <button onClick={fetchData} className={styles.actionBtn} title={t.top.refresh}>
              <RefreshCw size={14} className={isLoading ? styles.spinIcon : ''} />
              <span>{t.top.refresh}</span>
            </button>

            <Link href={`/${lang}`} target="_blank" className={styles.actionBtn} title={t.top.site}>
              <ExternalLink size={14} />
              <span>{t.top.site}</span>
            </Link>

            <button onClick={handleLogout} className={styles.logoutBtn} title={t.top.logout}>
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {/* TAB 0: EXECUTIVE PROFIT & BUSINESS DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              <div className={styles.pageHeader}>
                <div>
                  <h2 className={styles.pageTitle}>{t.dashboard.title}</h2>
                  <p className={styles.pageSubtitle}>{t.dashboard.subtitle}</p>
                </div>

                <div className={styles.dashboardControls}>
                  <div className={styles.rateBox}>
                    <span>{t.dashboard.exchangeRateLabel}</span>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={eurToMdlRate}
                      onChange={(e) => handleRateChange(e.target.value)}
                      className={styles.rateInput}
                    />
                    <span>{t.dashboard.mdlUnit}</span>
                  </div>

                  <div className={styles.currencyToggle}>
                    <button
                      type="button"
                      onClick={() => handleReportCurrencyChange('EUR')}
                      className={`${styles.currencyBtn} ${reportCurrency === 'EUR' ? styles.activeCurrencyBtn : ''}`}
                    >
                      EUR (€)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReportCurrencyChange('MDL')}
                      className={`${styles.currencyBtn} ${reportCurrency === 'MDL' ? styles.activeCurrencyBtn : ''}`}
                    >
                      MDL ({t.dashboard.mdlUnit})
                    </button>
                  </div>
                </div>
              </div>

              {/* Primary Financial KPI Cards */}
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} style={{ background: 'rgba(212, 175, 55, 0.14)' }}>
                    <Wallet size={21} color="#e5c365" />
                  </div>
                  <div>
                    <div className={styles.metricValue} style={{ color: '#e5c365' }}>
                      {formatMoney(dashboardStats.revenueTotal, reportCurrency, lang)}
                    </div>
                    <div className={styles.metricLabel}>{t.dashboard.revenue}</div>
                    <div className={styles.metricSub}>
                      {dashboardStats.paidDealsCount} {t.dashboard.dealsCount} ·{' '}
                      {formatMoney(dashboardStats.revEur, 'EUR', lang)} +{' '}
                      {formatMoney(dashboardStats.revMdl, 'MDL', lang)}
                    </div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} style={{ background: 'rgba(16, 185, 129, 0.14)' }}>
                    <PiggyBank size={21} color="#10b981" />
                  </div>
                  <div>
                    <div className={styles.metricValue} style={{ color: '#34d399' }}>
                      {formatMoney(dashboardStats.netProfit, reportCurrency, lang)}
                    </div>
                    <div className={styles.metricLabel}>{t.dashboard.netProfit}</div>
                    <div className={styles.metricSub}>
                      {t.dashboard.marginLabel}: {dashboardStats.profitMargin}%
                    </div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} style={{ background: 'rgba(239, 68, 68, 0.12)' }}>
                    <Receipt size={21} color="#f87171" />
                  </div>
                  <div>
                    <div className={styles.metricValue}>
                      {formatMoney(dashboardStats.expensesTotal, reportCurrency, lang)}
                    </div>
                    <div className={styles.metricLabel}>{t.dashboard.expenses}</div>
                    <div className={styles.metricSub}>{t.dashboard.paidCompletedHint}</div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} style={{ background: 'rgba(59, 130, 246, 0.14)' }}>
                    <DollarSign size={21} color="#60a5fa" />
                  </div>
                  <div>
                    <div className={styles.metricValue} style={{ color: '#93c5fd' }}>
                      {formatMoney(dashboardStats.pipelineTotal, reportCurrency, lang)}
                    </div>
                    <div className={styles.metricLabel}>{t.dashboard.pipeline}</div>
                    <div className={styles.metricSub}>{t.dashboard.inWorkHint}</div>
                  </div>
                </div>
              </div>

              {/* Secondary Business KPIs */}
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} style={{ background: 'rgba(168, 85, 247, 0.12)' }}>
                    <ArrowUpRight size={20} color="#c084fc" />
                  </div>
                  <div>
                    <div className={styles.metricValue} style={{ fontSize: '1.35rem' }}>
                      {formatMoney(dashboardStats.avgDeal, reportCurrency, lang)}
                    </div>
                    <div className={styles.metricLabel}>{t.dashboard.avgDeal}</div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                    <Percent size={20} color="#34d399" />
                  </div>
                  <div>
                    <div className={styles.metricValue} style={{ fontSize: '1.35rem' }}>
                      {dashboardStats.conversionRate}%
                    </div>
                    <div className={styles.metricLabel}>{t.dashboard.conversion}</div>
                    <div className={styles.metricSub}>
                      {leads.length} {t.dashboard.fromLeadsHint}
                    </div>
                  </div>
                </div>

                <div
                  className={styles.metricCard}
                  onClick={() => setActiveTab('leads')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.metricIcon} style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
                    <AlertCircle size={20} color="#f59e0b" />
                  </div>
                  <div>
                    <div className={styles.metricValue} style={{ fontSize: '1.35rem', color: '#f59e0b' }}>
                      {newLeadsCount}
                    </div>
                    <div className={styles.metricLabel}>{t.dashboard.newLeads}</div>
                  </div>
                </div>

                <div
                  className={styles.metricCard}
                  onClick={() => setActiveTab('analytics')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.metricIcon} style={{ background: 'rgba(255, 255, 255, 0.06)' }}>
                    <Eye size={20} color="#ffffff" />
                  </div>
                  <div>
                    <div className={styles.metricValue} style={{ fontSize: '1.35rem' }}>
                      {analytics?.summary?.totalViews || 0}
                    </div>
                    <div className={styles.metricLabel}>{t.dashboard.totalViews}</div>
                    <div className={styles.metricSub}>
                      {t.dashboard.viewsToday}:{' '}
                      {analytics?.daily?.[new Date().toISOString().split('T')[0]]?.views || 0}
                    </div>
                  </div>
                </div>
              </div>

              {dashboardStats.paidDealsCount === 0 && (
                <div
                  style={{
                    background: 'rgba(212, 175, 55, 0.07)',
                    border: '1px solid rgba(212, 175, 55, 0.24)',
                    borderRadius: '14px',
                    padding: '0.95rem 1.2rem',
                    marginBottom: '1.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.8rem',
                  }}
                >
                  <span style={{ color: '#fde68a', fontSize: '0.85rem' }}>
                    {t.dashboard.noFinancialData}
                  </span>
                  <button onClick={() => setActiveTab('clients')} className={styles.goldOutlineBtn}>
                    <BookOpen size={14} />
                    <span>{t.dashboard.goToClients}</span>
                  </button>
                </div>
              )}

              {/* Monthly Revenue & Profit Chart */}
              <div className={styles.chartContainer}>
                <div className={styles.chartTop} style={{ flexWrap: 'wrap', gap: '0.8rem' }}>
                  <div>
                    <h3 className={styles.chartTitle}>{t.dashboard.monthlyChartTitle}</h3>
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      {t.dashboard.monthlyChartSubtitle} ({reportCurrency})
                    </span>
                  </div>
                  <div className={styles.chartLegend}>
                    <span>
                      <span className={styles.legendDot} style={{ background: '#3b82f6' }} />
                      {t.dashboard.revenueLegend}
                    </span>
                    <span>
                      <span className={styles.legendDot} style={{ background: '#10b981' }} />
                      {t.dashboard.profitLegend}
                    </span>
                  </div>
                </div>

                <div className={styles.dualBarChart}>
                  {(() => {
                    const maxVal = Math.max(
                      1,
                      ...dashboardStats.months.map((m) => Math.max(m.revenue, m.profit))
                    );
                    return dashboardStats.months.map((m) => {
                      const revPct = m.revenue > 0 ? Math.max(8, (m.revenue / maxVal) * 100) : 3;
                      const profPct = m.profit > 0 ? Math.max(8, (m.profit / maxVal) * 100) : 3;
                      return (
                        <div
                          key={m.key}
                          className={styles.dualBarGroup}
                          title={`${m.label}: ${t.dashboard.revenueLegend} ${formatMoney(m.revenue, reportCurrency, lang)} | ${t.dashboard.profitLegend} ${formatMoney(m.profit, reportCurrency, lang)}`}
                        >
                          <div className={styles.dualBarPair}>
                            <div className={styles.dualBarTrack}>
                              <div className={styles.barRevenue} style={{ height: `${revPct}%` }} />
                            </div>
                            <div className={styles.dualBarTrack}>
                              <div className={styles.barProfit} style={{ height: `${profPct}%` }} />
                            </div>
                          </div>
                          <span className={styles.barLabel}>{m.label}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Breakdown Row: Funnel + Catalog Currency Summary */}
              <div className={styles.dashboardTwoCol}>
                <div className={styles.breakdownCard}>
                  <h4 className={styles.breakdownTitle}>
                    <Users size={16} color="#3b82f6" />
                    <span>{t.dashboard.funnelTitle}</span>
                  </h4>
                  {(['lead', 'in_discussion', 'contract', 'paid', 'completed'] as const).map((st) => {
                    const row = dashboardStats.statusTotals[st];
                    const totalClients = Math.max(1, clients.length);
                    const pct = Math.round((row.count / totalClients) * 100);
                    const color = clientStatusStyles[st]?.dot || '#3b82f6';
                    return (
                      <div key={st} className={styles.breakdownRow}>
                        <div className={styles.breakdownHeader}>
                          <span>{t.clients.statuses[st]}</span>
                          <span style={{ fontWeight: 600 }}>
                            {row.count} ({formatMoney(row.amount, reportCurrency, lang)})
                          </span>
                        </div>
                        <div className={styles.progressTrack}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.breakdownCard}>
                  <h4 className={styles.breakdownTitle}>
                    <Tag size={16} color="#e5c365" />
                    <span>{t.dashboard.catalogSummaryTitle}</span>
                  </h4>
                  {[
                    {
                      label: t.dashboard.itemsInEur,
                      count: dashboardStats.itemsEur,
                      color: '#e5c365',
                    },
                    {
                      label: t.dashboard.itemsInMdl,
                      count: dashboardStats.itemsMdl,
                      color: '#10b981',
                    },
                    {
                      label: t.dashboard.itemsWithFrom,
                      count: dashboardStats.itemsWithFrom,
                      color: '#3b82f6',
                    },
                  ].map((row) => {
                    const total = Math.max(1, dashboardStats.activeItemsCount);
                    const pct = Math.round((row.count / total) * 100);
                    return (
                      <div key={row.label} className={styles.breakdownRow}>
                        <div className={styles.breakdownHeader}>
                          <span>{row.label}</span>
                          <span style={{ fontWeight: 600 }}>
                            {row.count} / {dashboardStats.activeItemsCount} ({pct}%)
                          </span>
                        </div>
                        <div className={styles.progressTrack}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${pct}%`, background: row.color }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div
                    style={{
                      marginTop: '1.1rem',
                      paddingTop: '0.9rem',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.82rem',
                      color: '#94a3b8',
                    }}
                  >
                    <span>{t.dashboard.byCurrencySplit}</span>
                    <span style={{ color: '#e5c365', fontWeight: 600 }}>
                      {formatMoney(dashboardStats.profitEur, 'EUR', lang)} ·{' '}
                      {formatMoney(dashboardStats.profitMdl, 'MDL', lang)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Upcoming Events + Recent Leads */}
              <div className={styles.dashboardTwoCol}>
                <div className={styles.breakdownCard}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.95rem',
                    }}
                  >
                    <h4 className={styles.breakdownTitle} style={{ marginBottom: 0 }}>
                      <Calendar size={16} color="#f59e0b" />
                      <span>{t.dashboard.upcomingEventsTitle}</span>
                    </h4>
                    <button
                      onClick={() => setActiveTab('clients')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e5c365',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                      }}
                    >
                      {t.dashboard.viewAll}
                    </button>
                  </div>

                  {dashboardStats.upcomingEvents.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.84rem' }}>
                      {t.dashboard.noUpcomingEvents}
                    </p>
                  ) : (
                    <div className={styles.miniList}>
                      {dashboardStats.upcomingEvents.map((ev) => {
                        const fin = parseClientFinancials(ev);
                        return (
                          <div key={ev.id} className={styles.miniListItem}>
                            <div>
                              <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.88rem' }}>
                                {ev.name}
                              </div>
                              <div style={{ color: '#8e9bb0', fontSize: '0.76rem' }}>
                                {ev.eventType || t.clients.notSpecified} · {ev.eventDate}
                              </div>
                            </div>
                            <div style={{ color: '#e5c365', fontWeight: 700, fontSize: '0.86rem' }}>
                              {fin.revenue > 0 ? formatMoney(fin.revenue, fin.currency, lang) : '—'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={styles.breakdownCard}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.95rem',
                    }}
                  >
                    <h4 className={styles.breakdownTitle} style={{ marginBottom: 0 }}>
                      <MessageSquare size={16} color="#10b981" />
                      <span>{t.dashboard.recentLeadsTitle}</span>
                    </h4>
                    <button
                      onClick={() => setActiveTab('leads')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e5c365',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                      }}
                    >
                      {t.dashboard.viewAll}
                    </button>
                  </div>

                  {leads.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.84rem' }}>{t.dashboard.noRecentLeads}</p>
                  ) : (
                    <div className={styles.miniList}>
                      {leads.slice(0, 5).map((lead) => (
                        <div key={lead.id} className={styles.miniListItem}>
                          <div>
                            <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.88rem' }}>
                              {lead.name}
                            </div>
                            <div style={{ color: '#8e9bb0', fontSize: '0.76rem' }}>
                              {lead.service || t.leads.generalInquiry}
                            </div>
                          </div>
                          <span
                            className={styles.statusBadge}
                            style={{
                              background:
                                lead.status === 'new'
                                  ? 'rgba(245, 158, 11, 0.14)'
                                  : lead.status === 'completed'
                                    ? 'rgba(16, 185, 129, 0.14)'
                                    : 'rgba(59, 130, 246, 0.14)',
                              color:
                                lead.status === 'new'
                                  ? '#f59e0b'
                                  : lead.status === 'completed'
                                    ? '#6ee7b7'
                                    : '#93c5fd',
                            }}
                          >
                            {t.leads.statuses[lead.status]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: LEADS / APPLICATIONS */}
          {activeTab === 'leads' && (
            <div>
              <div className={styles.pageHeader}>
                <div>
                  <h2 className={styles.pageTitle}>{t.leads.title}</h2>
                  <p className={styles.pageSubtitle}>{t.leads.subtitle}</p>
                </div>
                <div className={styles.headerActions}>
                  <button onClick={createTestLead} className={styles.actionBtn}>
                    <Plus size={15} />
                    <span>{t.leads.createTest}</span>
                  </button>
                </div>
              </div>

              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} style={{ background: 'rgba(255, 255, 255, 0.06)' }}>
                    <Users size={21} color="#ffffff" />
                  </div>
                  <div>
                    <div className={styles.metricValue}>{leads.length}</div>
                    <div className={styles.metricLabel}>{t.leads.total}</div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
                    <AlertCircle size={21} color="#f59e0b" />
                  </div>
                  <div>
                    <div className={styles.metricValue} style={{ color: '#f59e0b' }}>
                      {newLeadsCount}
                    </div>
                    <div className={styles.metricLabel}>{t.leads.new}</div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
                    <Clock size={21} color="#3b82f6" />
                  </div>
                  <div>
                    <div className={styles.metricValue}>
                      {leads.filter((l) => l.status === 'in_progress').length}
                    </div>
                    <div className={styles.metricLabel}>{t.leads.inProgress}</div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                    <CheckCircle2 size={21} color="#10b981" />
                  </div>
                  <div>
                    <div className={styles.metricValue}>
                      {leads.filter((l) => l.status === 'completed').length}
                    </div>
                    <div className={styles.metricLabel}>{t.leads.completed}</div>
                  </div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className={styles.leadsControls}>
                <div className={styles.searchBox}>
                  <Search size={15} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder={t.leads.searchPlaceholder}
                    className={styles.searchInput}
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                  />
                </div>

                <div className={styles.filterPills}>
                  {(
                    [
                      ['all', t.leads.allFilter, leads.length],
                      ['new', t.leads.newFilter, newLeadsCount],
                      [
                        'in_progress',
                        t.leads.inProgressFilter,
                        leads.filter((l) => l.status === 'in_progress').length,
                      ],
                      [
                        'completed',
                        t.leads.completedFilter,
                        leads.filter((l) => l.status === 'completed').length,
                      ],
                      [
                        'cancelled',
                        t.leads.cancelledFilter,
                        leads.filter((l) => l.status === 'cancelled').length,
                      ],
                    ] as const
                  ).map(([val, label, count]) => (
                    <button
                      key={val}
                      onClick={() => setLeadStatusFilter(val)}
                      className={`${styles.filterPill} ${leadStatusFilter === val ? styles.activeFilterPill : ''}`}
                    >
                      {label} ({count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Leads List */}
              {filteredLeads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                  <Users size={42} style={{ margin: '0 auto 0.9rem', opacity: 0.3 }} />
                  <h3 style={{ color: '#cbd5e1', fontSize: '1.05rem' }}>{t.leads.emptyTitle}</h3>
                  <p style={{ marginTop: '0.35rem', fontSize: '0.85rem' }}>
                    {leads.length === 0 ? t.leads.emptyDesc : t.leads.emptyFilterDesc}
                  </p>
                </div>
              ) : (
                <div className={styles.leadsList}>
                  {filteredLeads.map((lead) => {
                    const dateStr = new Date(lead.createdAt).toLocaleString(dateLocale, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    const statusColors: Record<
                      LeadStatus,
                      { bg: string; dot: string; text: string }
                    > = {
                      new: { bg: 'rgba(245, 158, 11, 0.13)', dot: '#f59e0b', text: '#f59e0b' },
                      in_progress: {
                        bg: 'rgba(59, 130, 246, 0.13)',
                        dot: '#3b82f6',
                        text: '#93c5fd',
                      },
                      completed: {
                        bg: 'rgba(16, 185, 129, 0.13)',
                        dot: '#10b981',
                        text: '#6ee7b7',
                      },
                      cancelled: {
                        bg: 'rgba(100, 116, 139, 0.13)',
                        dot: '#64748b',
                        text: '#94a3b8',
                      },
                    };
                    const currStatus = statusColors[lead.status] || statusColors.new;
                    const draftVal =
                      leadNotesDraft[lead.id] !== undefined
                        ? leadNotesDraft[lead.id]
                        : lead.notes || '';

                    return (
                      <div key={lead.id} className={styles.leadCard}>
                        <div className={styles.leadCardTop}>
                          <div className={styles.clientName}>
                            <span>{lead.name}</span>
                            <span
                              className={styles.statusBadge}
                              style={{ background: currStatus.bg, color: currStatus.text }}
                            >
                              <span
                                className={styles.statusDot}
                                style={{ background: currStatus.dot }}
                              />
                              {t.leads.statuses[lead.status]}
                            </span>
                          </div>
                          <span className={styles.leadTime}>{dateStr}</span>
                        </div>

                        <div className={styles.leadInfoGrid}>
                          <div className={styles.infoCol}>
                            <span className={styles.infoLabel}>{t.leads.phone}</span>
                            <div className={styles.infoValue}>
                              <span>{lead.phone}</span>
                              <button
                                onClick={() => copyToClipboard(lead.phone, `phone_${lead.id}`)}
                                className={styles.copyBtn}
                                title={t.leads.copy}
                              >
                                {copiedId === `phone_${lead.id}` ? (
                                  <Check size={14} color="#10b981" />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                          </div>

                          {lead.email && (
                            <div className={styles.infoCol}>
                              <span className={styles.infoLabel}>{t.leads.email}</span>
                              <div className={styles.infoValue}>
                                <span>{lead.email}</span>
                                <button
                                  onClick={() => copyToClipboard(lead.email!, `email_${lead.id}`)}
                                  className={styles.copyBtn}
                                  title={t.leads.copy}
                                >
                                  {copiedId === `email_${lead.id}` ? (
                                    <Check size={14} color="#10b981" />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                          <div className={styles.infoCol}>
                            <span className={styles.infoLabel}>{t.leads.service}</span>
                            <span
                              className={styles.infoValue}
                              style={{ color: '#e5c365', fontWeight: 600 }}
                            >
                              {lead.service || t.leads.generalInquiry}
                            </span>
                          </div>
                        </div>

                        {lead.message && (
                          <div className={styles.leadMessage}>
                            <strong>{t.leads.message}</strong> {lead.message}
                          </div>
                        )}

                        {/* Inline Manager Quick Note */}
                        <input
                          type="text"
                          className={styles.inlineNoteInput}
                          placeholder={t.leads.notesPlaceholder}
                          value={draftVal}
                          onChange={(e) =>
                            setLeadNotesDraft((prev) => ({ ...prev, [lead.id]: e.target.value }))
                          }
                          onBlur={(e) => handleSaveLeadNote(lead, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              (e.currentTarget as HTMLInputElement).blur();
                            }
                          }}
                        />

                        <div className={styles.leadBottomBar}>
                          <div className={styles.leadQuickButtons}>
                            <a
                              href={`tel:${lead.phone}`}
                              className={`${styles.contactBtn} ${styles.callBtn}`}
                            >
                              <Phone size={13} />
                              <span>{t.leads.call}</span>
                            </a>
                            <a
                              href={`https://wa.me/${cleanPhone(lead.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${styles.contactBtn} ${styles.waBtn}`}
                            >
                              <MessageSquare size={13} />
                              <span>WhatsApp</span>
                            </a>
                            <a
                              href={`viber://chat?number=${cleanPhone(lead.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${styles.contactBtn} ${styles.viberBtn}`}
                            >
                              <Phone size={13} />
                              <span>Viber</span>
                            </a>
                            <a
                              href={`https://t.me/+${cleanPhone(lead.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${styles.contactBtn} ${styles.tgBtn}`}
                            >
                              <Send size={13} />
                              <span>Telegram</span>
                            </a>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => handleConvertLeadToClient(lead)}
                              className={styles.goldOutlineBtn}
                              title={t.leads.convertTooltip}
                            >
                              <UserPlus size={14} />
                              <span>{t.leads.convertToClient}</span>
                            </button>

                            <select
                              value={lead.status}
                              onChange={(e) =>
                                handleStatusChange(lead.id, e.target.value as LeadStatus)
                              }
                              className={styles.statusSelect}
                            >
                              <option value="new">{t.leads.statuses.new}</option>
                              <option value="in_progress">{t.leads.statuses.in_progress}</option>
                              <option value="completed">{t.leads.statuses.completed}</option>
                              <option value="cancelled">{t.leads.statuses.cancelled}</option>
                            </select>

                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className={styles.deleteIconBtn}
                              title={t.leads.deleteBtn}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLIENTS (CRM & FINANCIALS) */}
          {activeTab === 'clients' && (
            <div>
              <div className={styles.pageHeader}>
                <div>
                  <h2 className={styles.pageTitle}>{t.clients.title}</h2>
                  <p className={styles.pageSubtitle}>{t.clients.subtitle}</p>
                </div>

                <div className={styles.headerActions}>
                  {clients.length > 0 && (
                    <button onClick={handleExportClientsCsv} className={styles.actionBtn}>
                      <Download size={14} />
                      <span>{t.clients.exportCsv}</span>
                    </button>
                  )}
                  <button onClick={openAddClientModal} className={styles.primaryBtn}>
                    <Plus size={16} />
                    <span>{t.clients.addBtn}</span>
                  </button>
                </div>
              </div>

              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
                    <Users size={21} color="#3b82f6" />
                  </div>
                  <div>
                    <div className={styles.metricValue}>{clients.length}</div>
                    <div className={styles.metricLabel}>{t.clients.total}</div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
                    <Calendar size={21} color="#f59e0b" />
                  </div>
                  <div>
                    <div className={styles.metricValue}>
                      {clients.filter((c) => c.status === 'contract' || c.status === 'in_discussion').length}
                    </div>
                    <div className={styles.metricLabel}>{t.clients.inWork}</div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                    <CheckCircle2 size={21} color="#10b981" />
                  </div>
                  <div>
                    <div className={styles.metricValue}>
                      {clients.filter((c) => c.status === 'paid' || c.status === 'completed').length}
                    </div>
                    <div className={styles.metricLabel}>{t.clients.paidCompleted}</div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} style={{ background: 'rgba(212, 175, 55, 0.14)' }}>
                    <Wallet size={21} color="#e5c365" />
                  </div>
                  <div>
                    <div className={styles.metricValue} style={{ color: '#e5c365', fontSize: '1.4rem' }}>
                      {formatMoney(dashboardStats.revenueTotal, reportCurrency, lang)}
                    </div>
                    <div className={styles.metricLabel}>{t.clients.totalRevenue}</div>
                  </div>
                </div>
              </div>

              {/* Search, Sort & Status Filters */}
              <div className={styles.leadsControls}>
                <div style={{ display: 'flex', gap: '0.6rem', flex: 1, flexWrap: 'wrap' }}>
                  <div className={styles.searchBox}>
                    <Search size={15} className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder={t.clients.searchPlaceholder}
                      className={styles.searchInput}
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                    />
                  </div>

                  <select
                    value={clientSort}
                    onChange={(e) => setClientSort(e.target.value as ClientSort)}
                    className={styles.statusSelect}
                  >
                    <option value="newest">{t.clients.sortNewest}</option>
                    <option value="eventDate">{t.clients.sortEventDate}</option>
                    <option value="budget">{t.clients.sortBudget}</option>
                  </select>
                </div>

                <div className={styles.filterPills}>
                  <button
                    onClick={() => setClientStatusFilter('all')}
                    className={`${styles.filterPill} ${clientStatusFilter === 'all' ? styles.activeFilterPill : ''}`}
                  >
                    {t.clients.allFilter} ({clients.length})
                  </button>
                  {(['lead', 'in_discussion', 'contract', 'paid', 'completed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setClientStatusFilter(st)}
                      className={`${styles.filterPill} ${clientStatusFilter === st ? styles.activeFilterPill : ''}`}
                    >
                      {t.clients.statuses[st]} ({clients.filter((c) => c.status === st).length})
                    </button>
                  ))}
                </div>
              </div>

              {/* Clients List */}
              {filteredClients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                  <BookOpen size={42} style={{ margin: '0 auto 0.9rem', opacity: 0.3 }} />
                  <h3 style={{ color: '#cbd5e1', fontSize: '1.05rem' }}>{t.clients.emptyTitle}</h3>
                  <p style={{ marginTop: '0.35rem', fontSize: '0.85rem' }}>
                    {clients.length === 0 ? t.clients.emptyDesc : t.clients.emptyFilterDesc}
                  </p>
                  {clients.length === 0 && (
                    <button
                      onClick={openAddClientModal}
                      className={styles.primaryBtn}
                      style={{ margin: '1.25rem auto 0' }}
                    >
                      <Plus size={16} />
                      <span>{t.clients.addFirstBtn}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className={styles.leadsList}>
                  {filteredClients.map((client) => {
                    const stStyle = clientStatusStyles[client.status] || clientStatusStyles.lead;
                    const statusLabel =
                      t.clients.statuses[client.status as keyof typeof t.clients.statuses] ||
                      t.clients.statuses.lead;
                    const fin = parseClientFinancials(client);

                    return (
                      <div key={client.id} className={styles.leadCard}>
                        <div className={styles.leadCardTop}>
                          <div className={styles.clientName}>
                            <span>{client.name}</span>
                            <span
                              className={styles.statusBadge}
                              style={{ background: stStyle.bg, color: stStyle.text }}
                            >
                              <span
                                className={styles.statusDot}
                                style={{ background: stStyle.dot }}
                              />
                              {statusLabel}
                            </span>
                          </div>
                          <span className={styles.leadTime}>
                            {client.eventDate
                              ? `${t.clients.eventDatePrefix} ${client.eventDate}`
                              : t.clients.noEventDate}
                          </span>
                        </div>

                        <div className={styles.leadInfoGrid}>
                          <div className={styles.infoCol}>
                            <span className={styles.infoLabel}>{t.clients.phone}</span>
                            <div className={styles.infoValue}>
                              <span>{client.phone}</span>
                              <button
                                onClick={() =>
                                  copyToClipboard(client.phone, `client_phone_${client.id}`)
                                }
                                className={styles.copyBtn}
                                title={t.leads.copy}
                              >
                                {copiedId === `client_phone_${client.id}` ? (
                                  <Check size={14} color="#10b981" />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className={styles.infoCol}>
                            <span className={styles.infoLabel}>{t.clients.eventType}</span>
                            <span
                              className={styles.infoValue}
                              style={{ color: '#ffffff', fontWeight: 500 }}
                            >
                              {client.eventType || t.clients.notSpecified}
                            </span>
                          </div>

                          <div className={styles.infoCol}>
                            <span className={styles.infoLabel}>{t.clients.budget}</span>
                            <span
                              className={styles.infoValue}
                              style={{ color: '#e5c365', fontWeight: 700 }}
                            >
                              {fin.revenue > 0
                                ? formatMoney(fin.revenue, fin.currency, lang)
                                : client.budget || '—'}
                            </span>
                          </div>

                          {fin.revenue > 0 && (
                            <div className={styles.infoCol}>
                              <span className={styles.infoLabel}>
                                {t.clients.profit} ({t.clients.expenses}:{' '}
                                {formatMoney(fin.expenses, fin.currency, lang)})
                              </span>
                              <span
                                className={styles.infoValue}
                                style={{ color: '#34d399', fontWeight: 700 }}
                              >
                                {formatMoney(fin.profit, fin.currency, lang)}
                              </span>
                            </div>
                          )}
                        </div>

                        {client.preferences && (
                          <div
                            style={{
                              background: 'rgba(212, 175, 55, 0.07)',
                              borderLeft: '3px solid #d4af37',
                              padding: '0.75rem 1rem',
                              borderRadius: '9px',
                              fontSize: '0.86rem',
                              color: '#fef08a',
                            }}
                          >
                            <strong>{t.clients.preferencesLabel}</strong> {client.preferences}
                          </div>
                        )}

                        {client.notes && (
                          <div className={styles.leadMessage}>
                            <strong>{t.clients.notesLabel}</strong> {client.notes}
                          </div>
                        )}

                        <div className={styles.leadBottomBar}>
                          <div className={styles.leadQuickButtons}>
                            <a
                              href={`tel:${client.phone}`}
                              className={`${styles.contactBtn} ${styles.callBtn}`}
                            >
                              <Phone size={13} />
                              <span>{t.clients.call}</span>
                            </a>
                            <a
                              href={`https://wa.me/${cleanPhone(client.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${styles.contactBtn} ${styles.waBtn}`}
                            >
                              <MessageSquare size={13} />
                              <span>WhatsApp</span>
                            </a>
                            <a
                              href={`viber://chat?number=${cleanPhone(client.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${styles.contactBtn} ${styles.viberBtn}`}
                            >
                              <Phone size={13} />
                              <span>Viber</span>
                            </a>
                            <a
                              href={`https://t.me/+${cleanPhone(client.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${styles.contactBtn} ${styles.tgBtn}`}
                            >
                              <Send size={13} />
                              <span>Telegram</span>
                            </a>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <select
                              value={client.status}
                              onChange={(e) =>
                                handleQuickClientStatus(
                                  client,
                                  e.target.value as ClientDossier['status']
                                )
                              }
                              className={styles.statusSelect}
                            >
                              <option value="lead">{t.clients.statuses.lead}</option>
                              <option value="in_discussion">{t.clients.statuses.in_discussion}</option>
                              <option value="contract">{t.clients.statuses.contract}</option>
                              <option value="paid">{t.clients.statuses.paid}</option>
                              <option value="completed">{t.clients.statuses.completed}</option>
                              <option value="archived">{t.clients.statuses.archived}</option>
                            </select>

                            <button
                              onClick={() => openEditClientModal(client)}
                              className={styles.actionBtn}
                              title={t.clients.editTooltip}
                            >
                              <Edit3 size={14} />
                              <span>{t.clients.edit}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteClient(client.id)}
                              className={styles.deleteIconBtn}
                              title={t.clients.deleteTooltip}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CATALOG & PRICING */}
          {activeTab === 'catalog' && (
            <div>
              <div className={styles.pageHeader}>
                <div>
                  <h2 className={styles.pageTitle}>{t.catalog.title}</h2>
                  <p className={styles.pageSubtitle}>{t.catalog.desc}</p>
                </div>

                <div className={styles.headerActions}>
                  <button onClick={() => setCategoryModalOpen(true)} className={styles.actionBtn}>
                    <Layers size={15} />
                    <span>
                      {t.catalog.categoriesBtn} ({catalog.categories?.length || 0})
                    </span>
                  </button>
                  <button onClick={openAddItemModal} className={styles.primaryBtn}>
                    <Plus size={16} />
                    <span>{t.catalog.addPositionBtn}</span>
                  </button>
                </div>
              </div>

              {/* Search + Category Filter Strip */}
              <div className={styles.leadsControls}>
                <div className={styles.searchBox}>
                  <Search size={15} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder={t.catalog.searchPlaceholder}
                    className={styles.searchInput}
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                  />
                </div>

                <div className={styles.filterPills}>
                  <button
                    onClick={() => setCatalogCategoryFilter('all')}
                    className={`${styles.filterPill} ${catalogCategoryFilter === 'all' ? styles.activeFilterPill : ''}`}
                  >
                    {t.catalog.allCategories} ({catalog.items?.length || 0})
                  </button>
                  {catalog.categories.map((cat) => {
                    const cnt = (catalog.items || []).filter((i) => i.categoryId === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCatalogCategoryFilter(cat.id)}
                        className={`${styles.filterPill} ${catalogCategoryFilter === cat.id ? styles.activeFilterPill : ''}`}
                      >
                        {getLoc(cat.name)} ({cnt})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Catalog Items Grid */}
              {filteredCatalogItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                  <Tag size={40} style={{ margin: '0 auto 0.9rem', opacity: 0.3 }} />
                  <h3 style={{ color: '#cbd5e1', fontSize: '1.05rem' }}>{t.catalog.emptyTitle}</h3>
                  <p style={{ marginTop: '0.35rem', fontSize: '0.85rem' }}>{t.catalog.emptyDesc}</p>
                </div>
              ) : (
                <div className={styles.catalogGrid}>
                  {filteredCatalogItems.map((item) => {
                    const cat = catalog.categories.find((c) => c.id === item.categoryId);
                    const titleStr = getLoc(item.title);
                    const descStr = getLoc(item.description);
                    const parsed = parsePriceFields(item.price, item.currency, item.priceFrom);
                    const isHidden = item.active === false;

                    return (
                      <div
                        key={item.id}
                        className={`${styles.catalogCard} ${isHidden ? styles.catalogCardHidden : ''}`}
                      >
                        <div className={styles.catalogThumb}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              item.image ||
                              '/photozones/1f4ebfa4-34af-4cbd-8059-3186ce818cb0.jpg'
                            }
                            alt={titleStr}
                            className={styles.catalogImg}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                '/photozones/1f4ebfa4-34af-4cbd-8059-3186ce818cb0.jpg';
                            }}
                          />
                          {item.badge && (
                            <span
                              style={{
                                position: 'absolute',
                                top: 10,
                                left: 10,
                                padding: '3px 8px',
                                background: 'rgba(9,11,16,0.85)',
                                color: '#ffffff',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                          <div
                            style={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              display: 'flex',
                              gap: '5px',
                            }}
                          >
                            {isHidden && (
                              <span
                                style={{
                                  padding: '3px 7px',
                                  background: 'rgba(239, 68, 68, 0.9)',
                                  color: '#ffffff',
                                  borderRadius: '6px',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                }}
                              >
                                {t.catalog.hiddenBadge}
                              </span>
                            )}
                            <span
                              style={{
                                padding: '3px 8px',
                                background:
                                  parsed.currency === 'MDL'
                                    ? 'rgba(16, 185, 129, 0.92)'
                                    : 'rgba(212, 175, 55, 0.94)',
                                color: '#090b10',
                                borderRadius: '6px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                              }}
                            >
                              {parsed.currency}
                            </span>
                          </div>
                        </div>

                        <div className={styles.catalogBody}>
                          <span className={styles.catalogCategory}>{getLoc(cat?.name)}</span>
                          <h4 className={styles.catalogTitle}>{titleStr}</h4>
                          <div className={styles.catalogPrice}>{formatPrice(item, lang)}</div>
                          <p className={styles.catalogDesc}>{descStr}</p>

                          <div className={styles.catalogActions}>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => openEditItemModal(item)}
                                className={styles.actionBtn}
                              >
                                <Edit3 size={14} />
                                <span>{t.catalog.editBtn}</span>
                              </button>
                              <button
                                onClick={() => handleToggleItemActive(item)}
                                className={styles.iconBtnSmall}
                                title={t.catalog.toggleVisibility}
                              >
                                {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className={styles.deleteIconBtn}
                              title={t.catalog.deleteBtn}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PORTFOLIO MANAGEMENT */}
          {activeTab === 'portfolio' && (
            <div>
              <div className={styles.pageHeader}>
                <div>
                  <h2 className={styles.pageTitle}>{t.portfolio.title}</h2>
                  <p className={styles.pageSubtitle}>{t.portfolio.desc}</p>
                </div>

                <button onClick={openAddPortfolioModal} className={styles.primaryBtn}>
                  <Plus size={16} />
                  <span>{t.portfolio.addBtn}</span>
                </button>
              </div>

              {portfolio.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                  <ImageIcon size={42} style={{ margin: '0 auto 0.9rem', opacity: 0.3 }} />
                  <h3 style={{ color: '#cbd5e1', fontSize: '1.05rem' }}>{t.portfolio.emptyTitle}</h3>
                  <p style={{ marginTop: '0.35rem', fontSize: '0.85rem' }}>
                    {t.portfolio.emptyDesc}
                  </p>
                  <button
                    onClick={openAddPortfolioModal}
                    className={styles.primaryBtn}
                    style={{ margin: '1.25rem auto 0' }}
                  >
                    <Plus size={16} />
                    <span>{t.portfolio.addBtn}</span>
                  </button>
                </div>
              ) : (
                <div className={styles.catalogGrid}>
                  {portfolio.map((item, idx) => {
                    const titleStr = getLoc(item.title);
                    const catStr = getLoc(item.category);
                    const isBase64 = item.image?.startsWith('data:');
                    const isHidden = item.active === false;

                    return (
                      <div
                        key={item.id}
                        className={`${styles.catalogCard} ${isHidden ? styles.catalogCardHidden : ''}`}
                      >
                        <div className={styles.catalogThumb}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              item.image ||
                              '/photozones/1f4ebfa4-34af-4cbd-8059-3186ce818cb0.jpg'
                            }
                            alt={titleStr}
                            className={styles.catalogImg}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                '/photozones/1f4ebfa4-34af-4cbd-8059-3186ce818cb0.jpg';
                            }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              top: 10,
                              left: 10,
                              padding: '3px 8px',
                              background: 'rgba(9,11,16,0.82)',
                              color: '#ffffff',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                            }}
                          >
                            #{idx + 1}
                          </span>
                          <div
                            style={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              display: 'flex',
                              gap: '5px',
                            }}
                          >
                            {isHidden && (
                              <span
                                style={{
                                  padding: '3px 7px',
                                  background: 'rgba(239, 68, 68, 0.9)',
                                  color: '#ffffff',
                                  borderRadius: '6px',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                }}
                              >
                                {t.catalog.hiddenBadge}
                              </span>
                            )}
                            <span
                              style={{
                                padding: '3px 8px',
                                background: isBase64
                                  ? 'rgba(16, 185, 129, 0.92)'
                                  : 'rgba(59, 130, 246, 0.9)',
                                color: isBase64 ? '#090b10' : '#ffffff',
                                borderRadius: '6px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                              }}
                            >
                              {isBase64 ? t.portfolio.base64Badge : t.portfolio.urlBadge}
                            </span>
                          </div>
                        </div>

                        <div className={styles.catalogBody}>
                          <span className={styles.catalogCategory}>{catStr}</span>
                          <h4 className={styles.catalogTitle}>{titleStr}</h4>

                          <div className={styles.catalogActions}>
                            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                              <button
                                onClick={() => openEditPortfolioModal(item)}
                                className={styles.actionBtn}
                              >
                                <Edit3 size={13} />
                                <span>{t.portfolio.editBtn}</span>
                              </button>
                              <button
                                onClick={() => handleTogglePortfolioActive(item)}
                                className={styles.iconBtnSmall}
                                title={t.catalog.toggleVisibility}
                              >
                                {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button
                                onClick={() => handleMovePortfolio(idx, -1)}
                                disabled={idx === 0}
                                className={styles.iconBtnSmall}
                                title={t.portfolio.moveUp}
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                onClick={() => handleMovePortfolio(idx, 1)}
                                disabled={idx === portfolio.length - 1}
                                className={styles.iconBtnSmall}
                                title={t.portfolio.moveDown}
                              >
                                <ArrowDown size={14} />
                              </button>
                            </div>

                            <button
                              onClick={() => handleDeletePortfolio(item.id)}
                              className={styles.deleteIconBtn}
                              title={t.portfolio.deleteBtn}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ANALYTICS & VISITORS */}
          {activeTab === 'analytics' && analytics && (
            <div>
              <div className={styles.pageHeader}>
                <div>
                  <h2 className={styles.pageTitle}>{t.analytics.title}</h2>
                  <p className={styles.pageSubtitle}>{t.analytics.subtitle}</p>
                </div>
              </div>

              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricIcon}>
                    <Eye size={21} color="#ffffff" />
                  </div>
                  <div>
                    <div className={styles.metricValue}>{analytics.summary.totalViews || 0}</div>
                    <div className={styles.metricLabel}>{t.analytics.totalViews}</div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
                    <Users size={21} color="#3b82f6" />
                  </div>
                  <div>
                    <div className={styles.metricValue}>
                      {analytics.summary.uniqueVisitors || 0}
                    </div>
                    <div className={styles.metricLabel}>{t.analytics.uniqueVisitors}</div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon} style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                    <TrendingUp size={21} color="#10b981" />
                  </div>
                  <div>
                    <div className={styles.metricValue}>
                      {analytics.daily[new Date().toISOString().split('T')[0]]?.views || 0}
                    </div>
                    <div className={styles.metricLabel}>{t.analytics.viewsToday}</div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon}>
                    <Globe size={21} color="#e5c365" />
                  </div>
                  <div>
                    <div className={styles.metricValue} style={{ fontSize: '1.2rem' }}>
                      {Object.keys(analytics.sources)[0] || t.analytics.direct}
                    </div>
                    <div className={styles.metricLabel}>{t.analytics.topSource}</div>
                  </div>
                </div>
              </div>

              {/* Daily Visits Chart */}
              <div className={styles.chartContainer}>
                <div className={styles.chartTop}>
                  <h3 className={styles.chartTitle}>{t.analytics.chartTitle}</h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {t.analytics.chartSubtitle}
                  </span>
                </div>

                <div className={styles.barChart}>
                  {(() => {
                    const days: string[] = [];
                    for (let i = 13; i >= 0; i--) {
                      const d = new Date();
                      d.setDate(d.getDate() - i);
                      days.push(d.toISOString().split('T')[0]);
                    }
                    const maxViews = Math.max(1, ...days.map((d) => analytics.daily[d]?.views || 0));

                    return days.map((d) => {
                      const dayData = analytics.daily[d] || { views: 0, unique: 0 };
                      const heightPercent = Math.max(6, (dayData.views / maxViews) * 100);
                      const formattedDate = d.slice(5).replace('-', '.');

                      return (
                        <div
                          key={d}
                          className={styles.barCol}
                          title={`${d}: ${dayData.views} ${t.analytics.viewsTooltip}, ${dayData.unique} ${t.analytics.uniqueTooltip}`}
                        >
                          <div className={styles.barTrack}>
                            <div
                              className={styles.barFill}
                              style={{ height: `${heightPercent}%` }}
                            />
                          </div>
                          <span className={styles.barLabel}>{formattedDate}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className={styles.breakdownGrid}>
                <div className={styles.breakdownCard}>
                  <h4 className={styles.breakdownTitle}>
                    <Globe size={16} color="#3b82f6" />
                    <span>{t.analytics.sourcesTitle}</span>
                  </h4>
                  {Object.keys(analytics.sources).length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.84rem' }}>{t.analytics.noData}</p>
                  ) : (
                    Object.entries(analytics.sources).map(([src, count]) => {
                      const total = analytics.summary.totalViews || 1;
                      const percent = Math.round((count / total) * 100);
                      return (
                        <div key={src} className={styles.breakdownRow}>
                          <div className={styles.breakdownHeader}>
                            <span>{src}</span>
                            <span style={{ fontWeight: 600 }}>
                              {count} ({percent}%)
                            </span>
                          </div>
                          <div className={styles.progressTrack}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className={styles.breakdownCard}>
                  <h4 className={styles.breakdownTitle}>
                    <Globe size={16} color="#10b981" />
                    <span>{t.analytics.countriesTitle}</span>
                  </h4>
                  {Object.keys(analytics.countries).length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.84rem' }}>{t.analytics.noData}</p>
                  ) : (
                    Object.entries(analytics.countries).map(([country, count]) => {
                      const total = analytics.summary.totalViews || 1;
                      const percent = Math.round((count / total) * 100);
                      return (
                        <div key={country} className={styles.breakdownRow}>
                          <div className={styles.breakdownHeader}>
                            <span>{country}</span>
                            <span style={{ fontWeight: 600 }}>
                              {count} ({percent}%)
                            </span>
                          </div>
                          <div className={styles.progressTrack}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${percent}%`, background: '#10b981' }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className={styles.breakdownCard}>
                  <h4 className={styles.breakdownTitle}>
                    <Smartphone size={16} color="#f59e0b" />
                    <span>{t.analytics.devicesTitle}</span>
                  </h4>
                  {Object.keys(analytics.devices).length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.84rem' }}>{t.analytics.noData}</p>
                  ) : (
                    Object.entries(analytics.devices).map(([dev, count]) => {
                      const total = analytics.summary.totalViews || 1;
                      const percent = Math.round((count / total) * 100);
                      return (
                        <div key={dev} className={styles.breakdownRow}>
                          <div className={styles.breakdownHeader}>
                            <span>{dev}</span>
                            <span style={{ fontWeight: 600 }}>
                              {count} ({percent}%)
                            </span>
                          </div>
                          <div className={styles.progressTrack}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${percent}%`, background: '#f59e0b' }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Live Activity Table */}
              <div className={styles.activityCard}>
                <h4 className={styles.breakdownTitle} style={{ marginBottom: '0.9rem' }}>
                  <Clock size={16} color="#e5c365" />
                  <span>{t.analytics.liveTitle}</span>
                </h4>

                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t.analytics.time}</th>
                      <th>{t.analytics.page}</th>
                      <th>{t.analytics.source}</th>
                      <th>{t.analytics.geo}</th>
                      <th>{t.analytics.device}</th>
                      <th>{t.analytics.ip}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics.recentVisits || []).slice(0, 30).map((v) => (
                      <tr key={v.id}>
                        <td style={{ color: '#94a3b8' }}>
                          {new Date(v.timestamp).toLocaleTimeString(dateLocale, {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td>
                          <span
                            style={{
                              background: '#171e2e',
                              padding: '2px 6px',
                              borderRadius: '5px',
                              fontSize: '0.76rem',
                            }}
                          >
                            {v.path}
                          </span>
                        </td>
                        <td style={{ color: '#ffffff', fontWeight: 500 }}>{v.referrer}</td>
                        <td>
                          {v.country} ({v.city})
                        </td>
                        <td>
                          {v.device} • {v.browser}
                        </td>
                        <td
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.76rem',
                            color: '#64748b',
                          }}
                        >
                          {v.ip}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className={styles.mobileBottomNav}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`${styles.mobileNavBtn} ${activeTab === 'dashboard' ? styles.activeMobileTab : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>{t.tabs.dashboard}</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`${styles.mobileNavBtn} ${activeTab === 'leads' ? styles.activeMobileTab : ''}`}
        >
          {newLeadsCount > 0 && <span className={styles.mobileNavBadge}>{newLeadsCount}</span>}
          <Users size={18} />
          <span>{t.tabs.leads}</span>
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`${styles.mobileNavBtn} ${activeTab === 'clients' ? styles.activeMobileTab : ''}`}
        >
          <BookOpen size={18} />
          <span>{t.tabs.clients}</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`${styles.mobileNavBtn} ${activeTab === 'catalog' ? styles.activeMobileTab : ''}`}
        >
          <Tag size={18} />
          <span>{t.tabs.catalog}</span>
        </button>

        <button
          onClick={() => setActiveTab('portfolio')}
          className={`${styles.mobileNavBtn} ${activeTab === 'portfolio' ? styles.activeMobileTab : ''}`}
        >
          <ImageIcon size={18} />
          <span>{t.tabs.portfolio}</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`${styles.mobileNavBtn} ${activeTab === 'analytics' ? styles.activeMobileTab : ''}`}
        >
          <TrendingUp size={18} />
          <span>{t.tabs.analytics}</span>
        </button>
      </nav>

      {/* MODAL: ADD / EDIT CATALOG ITEM */}
      {itemModalOpen && editingItem && (
        <div className={styles.modalOverlay} onClick={() => setItemModalOpen(false)}>
          <div className={styles.modalWindow} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingItem.id ? t.catalog.modalTitleEdit : t.catalog.modalTitleAdd}
              </h3>
              <button onClick={() => setItemModalOpen(false)} className={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.catalog.categoryLabel}</label>
                <select
                  className={styles.formInput}
                  value={editingItem.categoryId}
                  onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value })}
                >
                  {catalog.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getLoc(c.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.catalog.titleRu}</label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder={t.catalog.titleRuPlaceholder}
                  value={editingItem.title?.ru || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      title: {
                        ru: e.target.value,
                        ro: editingItem.title?.ro || e.target.value,
                        en: editingItem.title?.en || e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.catalog.titleRo}</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder={t.catalog.titleRoPlaceholder}
                    value={editingItem.title?.ro || ''}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        title: {
                          ru: editingItem.title?.ru || '',
                          ro: e.target.value,
                          en: editingItem.title?.en || '',
                        },
                      })
                    }
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.catalog.titleEn}</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder={t.catalog.titleEnPlaceholder}
                    value={editingItem.title?.en || ''}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        title: {
                          ru: editingItem.title?.ru || '',
                          ro: editingItem.title?.ro || '',
                          en: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Price + Currency */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '0.8rem' }}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.catalog.priceLabel}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    className={styles.formInput}
                    placeholder={t.catalog.pricePlaceholder}
                    value={editingItem.price || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.catalog.currencyLabel}</label>
                  <div className={styles.currencyToggle} style={{ width: '100%' }}>
                    <button
                      type="button"
                      style={{ flex: 1 }}
                      onClick={() => setEditingItem({ ...editingItem, currency: 'EUR' })}
                      className={`${styles.currencyBtn} ${(editingItem.currency || 'EUR') === 'EUR' ? styles.activeCurrencyBtn : ''}`}
                    >
                      {t.catalog.currencyEur}
                    </button>
                    <button
                      type="button"
                      style={{ flex: 1 }}
                      onClick={() => setEditingItem({ ...editingItem, currency: 'MDL' })}
                      className={`${styles.currencyBtn} ${editingItem.currency === 'MDL' ? styles.activeCurrencyBtn : ''}`}
                    >
                      {t.catalog.currencyMdl}
                    </button>
                  </div>
                </div>
              </div>

              {/* "ОТ" / "de la" Toggle */}
              <div
                role="button"
                tabIndex={0}
                className={styles.priceToggleCard}
                onClick={() => setEditingItem({ ...editingItem, priceFrom: !editingItem.priceFrom })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setEditingItem({ ...editingItem, priceFrom: !editingItem.priceFrom });
                  }
                }}
              >
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.86rem' }}>
                    {t.catalog.priceFromLabel}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.18rem' }}>
                    {t.catalog.priceFromHint}
                  </div>
                </div>
                <div
                  className={`${styles.toggleSwitch} ${editingItem.priceFrom ? styles.toggleSwitchOn : ''}`}
                >
                  <div
                    className={`${styles.toggleKnob} ${editingItem.priceFrom ? styles.toggleKnobOn : ''}`}
                  />
                </div>
              </div>

              {editingItem.price && (
                <div className={styles.pricePreviewBox}>
                  <span>{t.catalog.pricePreviewLabel}</span>
                  <span className={styles.pricePreviewBadge}>
                    <span>
                      RU:{' '}
                      {formatPrice(
                        {
                          price: editingItem.price || '',
                          currency: editingItem.currency || 'EUR',
                          priceFrom: Boolean(editingItem.priceFrom),
                        },
                        'ru'
                      )}
                    </span>
                    <span style={{ opacity: 0.4 }}>|</span>
                    <span>
                      RO:{' '}
                      {formatPrice(
                        {
                          price: editingItem.price || '',
                          currency: editingItem.currency || 'EUR',
                          priceFrom: Boolean(editingItem.priceFrom),
                        },
                        'ro'
                      )}
                    </span>
                  </span>
                </div>
              )}

              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.catalog.badgeLabel}</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder={t.catalog.badgePlaceholder}
                  value={editingItem.badge || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                />
              </div>

              {/* Drag & Drop Image Upload */}
              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.catalog.imageLabel}</label>
                <label
                  className={`${styles.dropzone} ${itemDragActive ? styles.dropzoneActive : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setItemDragActive(true);
                  }}
                  onDragLeave={() => setItemDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setItemDragActive(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      optimizeFileToBase64(file, (b64) =>
                        setEditingItem((prev) => (prev ? { ...prev, image: b64 } : prev))
                      );
                    }
                  }}
                >
                  <Upload size={20} color="#e5c365" />
                  <span style={{ fontSize: '0.83rem', fontWeight: 600, color: '#f8fafc' }}>
                    {t.catalog.dropzoneTitle}
                  </span>
                  <span style={{ fontSize: '0.73rem', color: '#8492a6' }}>
                    {t.catalog.dropzoneSub}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        optimizeFileToBase64(file, (b64) =>
                          setEditingItem((prev) => (prev ? { ...prev, image: b64 } : prev))
                        );
                      }
                    }}
                  />
                </label>

                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder={t.catalog.imagePlaceholder}
                  value={editingItem.image || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  {editingItem.image?.startsWith('data:') ? t.catalog.base64Loaded : t.catalog.imageTip}
                </span>

                {editingItem.image && (
                  <div
                    style={{
                      marginTop: '0.6rem',
                      height: 135,
                      borderRadius: 10,
                      overflow: 'hidden',
                      background: '#090c13',
                      position: 'relative',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editingItem.image}
                      alt={t.catalog.previewAlt}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, image: '' })}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(0,0,0,0.75)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                      }}
                    >
                      {t.catalog.removePhoto}
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.catalog.descRuLabel}</label>
                <textarea
                  rows={2}
                  required
                  className={styles.formInput}
                  placeholder={t.catalog.descPlaceholder}
                  value={editingItem.description?.ru || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: {
                        ru: e.target.value,
                        ro: editingItem.description?.ro || e.target.value,
                        en: editingItem.description?.en || e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.catalog.descRoLabel}</label>
                <textarea
                  rows={2}
                  className={styles.formInput}
                  placeholder={t.catalog.descRoPlaceholder}
                  value={editingItem.description?.ro || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: {
                        ru: editingItem.description?.ru || '',
                        ro: e.target.value,
                        en: editingItem.description?.en || '',
                      },
                    })
                  }
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.catalog.featuresLabel}</label>
                <textarea
                  rows={3}
                  className={styles.formInput}
                  placeholder={t.catalog.featuresPlaceholder}
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.1rem' }}>
                <button type="submit" className={styles.primaryBtn}>
                  {t.catalog.saveBtn}
                </button>
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className={styles.actionBtn}
                >
                  {t.catalog.cancelBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CATEGORY MANAGEMENT (WITH INLINE RENAME) */}
      {categoryModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setCategoryModalOpen(false)}>
          <div
            className={styles.modalWindow}
            style={{ maxWidth: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t.catalog.categoriesModalTitle}</h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className={styles.modalCloseBtn}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {catalog.categories.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: '#0a0d14',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {editingCatId === c.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="RU"
                        value={editingCatDraft.ru}
                        onChange={(e) =>
                          setEditingCatDraft({ ...editingCatDraft, ru: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="RO"
                        value={editingCatDraft.ro}
                        onChange={(e) =>
                          setEditingCatDraft({ ...editingCatDraft, ro: e.target.value })
                        }
                      />
                      <div style={{ display: 'flex', gap: '0.45rem' }}>
                        <button
                          type="button"
                          onClick={() => handleSaveCategoryEdit(c.id)}
                          className={styles.primaryBtn}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                        >
                          {t.catalog.saveCatBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className={styles.actionBtn}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                        >
                          {t.catalog.cancelBtn}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.88rem' }}>
                          {getLoc(c.name)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          RU: {c.name.ru} · RO: {c.name.ro}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => startEditCategory(c)}
                          className={styles.iconBtnSmall}
                          title={t.catalog.editBtn}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(c.id)}
                          className={styles.deleteIconBtn}
                          title={t.catalog.deleteBtn}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleAddCategory}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.55rem' }}>
                {t.catalog.addCatTitle}
              </h4>
              <div className={styles.formField}>
                <input
                  type="text"
                  required
                  placeholder={t.catalog.catRu}
                  className={styles.formInput}
                  value={newCatName.ru}
                  onChange={(e) => setNewCatName({ ...newCatName, ru: e.target.value })}
                />
              </div>
              <div className={styles.formField}>
                <input
                  type="text"
                  placeholder={t.catalog.catRo}
                  className={styles.formInput}
                  value={newCatName.ro}
                  onChange={(e) => setNewCatName({ ...newCatName, ro: e.target.value })}
                />
              </div>
              <div className={styles.formField}>
                <input
                  type="text"
                  placeholder={t.catalog.catEn}
                  className={styles.formInput}
                  value={newCatName.en}
                  onChange={(e) => setNewCatName({ ...newCatName, en: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className={styles.primaryBtn}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {t.catalog.addCatBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PORTFOLIO ITEM */}
      {portfolioModalOpen && editingPortfolio && (
        <div className={styles.modalOverlay} onClick={() => setPortfolioModalOpen(false)}>
          <div className={styles.modalWindow} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingPortfolio.id ? t.portfolio.modalTitleEdit : t.portfolio.modalTitleAdd}
              </h3>
              <button
                onClick={() => setPortfolioModalOpen(false)}
                className={styles.modalCloseBtn}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePortfolio}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.portfolio.imageLabel}</label>
                <label
                  className={`${styles.dropzone} ${portDragActive ? styles.dropzoneActive : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setPortDragActive(true);
                  }}
                  onDragLeave={() => setPortDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setPortDragActive(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      optimizeFileToBase64(file, (b64) =>
                        setEditingPortfolio((prev) => (prev ? { ...prev, image: b64 } : prev))
                      );
                    }
                  }}
                >
                  <Upload size={20} color="#e5c365" />
                  <span style={{ fontSize: '0.83rem', fontWeight: 600, color: '#f8fafc' }}>
                    {t.catalog.dropzoneTitle}
                  </span>
                  <span style={{ fontSize: '0.73rem', color: '#8492a6' }}>
                    {t.catalog.dropzoneSub}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        optimizeFileToBase64(file, (b64) =>
                          setEditingPortfolio((prev) => (prev ? { ...prev, image: b64 } : prev))
                        );
                      }
                    }}
                  />
                </label>

                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder={t.portfolio.imagePlaceholder}
                  value={editingPortfolio.image || ''}
                  onChange={(e) =>
                    setEditingPortfolio({ ...editingPortfolio, image: e.target.value })
                  }
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  {editingPortfolio.image?.startsWith('data:')
                    ? t.portfolio.base64SavedHint
                    : t.portfolio.imageTip}
                </span>

                {editingPortfolio.image && (
                  <div
                    style={{
                      marginTop: '0.65rem',
                      height: 155,
                      borderRadius: 10,
                      overflow: 'hidden',
                      background: '#090c13',
                      position: 'relative',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editingPortfolio.image}
                      alt={t.catalog.previewAlt}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => setEditingPortfolio({ ...editingPortfolio, image: '' })}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(0,0,0,0.75)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                      }}
                    >
                      {t.portfolio.removePhoto}
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.portfolio.titleRu}</label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder={t.portfolio.titleRuPlaceholder}
                  value={editingPortfolio.title?.ru || ''}
                  onChange={(e) =>
                    setEditingPortfolio({
                      ...editingPortfolio,
                      title: {
                        ru: e.target.value,
                        ro: editingPortfolio.title?.ro || e.target.value,
                        en: editingPortfolio.title?.en || e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.portfolio.titleRo}</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder={t.portfolio.titleRoPlaceholder}
                    value={editingPortfolio.title?.ro || ''}
                    onChange={(e) =>
                      setEditingPortfolio({
                        ...editingPortfolio,
                        title: {
                          ru: editingPortfolio.title?.ru || '',
                          ro: e.target.value,
                          en: editingPortfolio.title?.en || '',
                        },
                      })
                    }
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.portfolio.titleEn}</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder={t.portfolio.titleEnPlaceholder}
                    value={editingPortfolio.title?.en || ''}
                    onChange={(e) =>
                      setEditingPortfolio({
                        ...editingPortfolio,
                        title: {
                          ru: editingPortfolio.title?.ru || '',
                          ro: editingPortfolio.title?.ro || '',
                          en: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.portfolio.categoryRu}</label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder={t.portfolio.categoryRuPlaceholder}
                  value={editingPortfolio.category?.ru || ''}
                  onChange={(e) =>
                    setEditingPortfolio({
                      ...editingPortfolio,
                      category: {
                        ru: e.target.value,
                        ro: editingPortfolio.category?.ro || e.target.value,
                        en: editingPortfolio.category?.en || e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.portfolio.categoryRo}</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder={t.portfolio.categoryRoPlaceholder}
                    value={editingPortfolio.category?.ro || ''}
                    onChange={(e) =>
                      setEditingPortfolio({
                        ...editingPortfolio,
                        category: {
                          ru: editingPortfolio.category?.ru || '',
                          ro: e.target.value,
                          en: editingPortfolio.category?.en || '',
                        },
                      })
                    }
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.portfolio.categoryEn}</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder={t.portfolio.categoryEnPlaceholder}
                    value={editingPortfolio.category?.en || ''}
                    onChange={(e) =>
                      setEditingPortfolio({
                        ...editingPortfolio,
                        category: {
                          ru: editingPortfolio.category?.ru || '',
                          ro: editingPortfolio.category?.ro || '',
                          en: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.portfolio.orderLabel}</label>
                <input
                  type="number"
                  min="1"
                  className={styles.formInput}
                  value={editingPortfolio.order ?? 1}
                  onChange={(e) =>
                    setEditingPortfolio({
                      ...editingPortfolio,
                      order: Number(e.target.value) || 1,
                    })
                  }
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.1rem' }}>
                <button type="submit" className={styles.primaryBtn}>
                  {t.portfolio.saveBtn}
                </button>
                <button
                  type="button"
                  onClick={() => setPortfolioModalOpen(false)}
                  className={styles.actionBtn}
                >
                  {t.portfolio.cancelBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CLIENT DOSSIER */}
      {clientModalOpen && editingClient && (
        <div className={styles.modalOverlay} onClick={() => setClientModalOpen(false)}>
          <div
            className={styles.modalWindow}
            style={{ maxWidth: '620px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingClient.id ? t.clients.modalTitleEdit : t.clients.modalTitleAdd}
              </h3>
              <button onClick={() => setClientModalOpen(false)} className={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveClient}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.clients.nameLabel}</label>
                  <input
                    type="text"
                    required
                    placeholder={t.clients.namePlaceholder}
                    className={styles.formInput}
                    value={editingClient.name || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.clients.phoneLabel}</label>
                  <input
                    type="tel"
                    required
                    placeholder={t.clients.phonePlaceholder}
                    className={styles.formInput}
                    value={editingClient.phone || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.clients.emailLabel}</label>
                  <input
                    type="email"
                    placeholder={t.clients.emailPlaceholder}
                    className={styles.formInput}
                    value={editingClient.email || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.clients.eventDateLabel}</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={editingClient.eventDate || ''}
                    onChange={(e) =>
                      setEditingClient({ ...editingClient, eventDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.clients.eventTypeLabel}</label>
                <input
                  type="text"
                  placeholder={t.clients.eventTypePlaceholder}
                  className={styles.formInput}
                  value={editingClient.eventType || ''}
                  onChange={(e) =>
                    setEditingClient({ ...editingClient, eventType: e.target.value })
                  }
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.clients.budgetAmountLabel}</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder={t.clients.budgetAmountPlaceholder}
                    className={styles.formInput}
                    value={editingClient.budgetAmount || ''}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        budgetAmount: e.target.value ? Number(e.target.value) : 0,
                      })
                    }
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.clients.currencyLabel}</label>
                  <div className={styles.currencyToggle} style={{ width: '100%' }}>
                    <button
                      type="button"
                      style={{ flex: 1 }}
                      onClick={() => setEditingClient({ ...editingClient, budgetCurrency: 'EUR' })}
                      className={`${styles.currencyBtn} ${(editingClient.budgetCurrency || 'EUR') === 'EUR' ? styles.activeCurrencyBtn : ''}`}
                    >
                      {t.catalog.currencyEur}
                    </button>
                    <button
                      type="button"
                      style={{ flex: 1 }}
                      onClick={() => setEditingClient({ ...editingClient, budgetCurrency: 'MDL' })}
                      className={`${styles.currencyBtn} ${editingClient.budgetCurrency === 'MDL' ? styles.activeCurrencyBtn : ''}`}
                    >
                      {t.catalog.currencyMdl}
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.clients.expensesLabel}</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder={t.clients.expensesPlaceholder}
                  className={styles.formInput}
                  value={editingClient.expensesAmount || ''}
                  onChange={(e) =>
                    setEditingClient({
                      ...editingClient,
                      expensesAmount: e.target.value ? Number(e.target.value) : 0,
                    })
                  }
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.clients.statusLabel}</label>
                <select
                  className={styles.formInput}
                  value={editingClient.status || 'lead'}
                  onChange={(e) =>
                    setEditingClient({ ...editingClient, status: e.target.value as any })
                  }
                >
                  <option value="lead">{t.clients.statusOptions.lead}</option>
                  <option value="in_discussion">{t.clients.statusOptions.in_discussion}</option>
                  <option value="contract">{t.clients.statusOptions.contract}</option>
                  <option value="paid">{t.clients.statusOptions.paid}</option>
                  <option value="completed">{t.clients.statusOptions.completed}</option>
                  <option value="archived">{t.clients.statusOptions.archived}</option>
                </select>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.clients.preferencesFieldLabel}</label>
                <textarea
                  rows={2}
                  placeholder={t.clients.preferencesPlaceholder}
                  className={styles.formInput}
                  value={editingClient.preferences || ''}
                  onChange={(e) =>
                    setEditingClient({ ...editingClient, preferences: e.target.value })
                  }
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.clients.notesFieldLabel}</label>
                <textarea
                  rows={3}
                  placeholder={t.clients.notesPlaceholder}
                  className={styles.formInput}
                  value={editingClient.notes || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.1rem' }}>
                <button type="submit" className={styles.primaryBtn}>
                  {t.clients.saveBtn}
                </button>
                <button
                  type="button"
                  onClick={() => setClientModalOpen(false)}
                  className={styles.actionBtn}
                >
                  {t.clients.cancelBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmState && (
        <div className={styles.modalOverlay} onClick={() => setConfirmState(null)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              {t.confirmModal.title}
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.55, marginBottom: '1.35rem' }}>
              {confirmState.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className={styles.actionBtn}
              >
                {t.confirmModal.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmState.onConfirm();
                  setConfirmState(null);
                }}
                className={styles.logoutBtn}
                style={{ background: '#ef4444', color: '#ffffff', borderColor: '#ef4444' }}
              >
                {t.confirmModal.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATIONS */}
      {toasts.length > 0 && (
        <div className={styles.toastStack}>
          {toasts.map((item) => (
            <div key={item.id} className={styles.toastItem}>
              <CheckCircle2 size={16} color="#e5c365" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
