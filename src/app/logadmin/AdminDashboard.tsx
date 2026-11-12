'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
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
  Mail, 
  Eye, 
  Globe, 
  Smartphone, 
  X,
  Sparkles,
  Layers,
  Copy,
  Check,
  MessageSquare,
  Upload,
  BookOpen,
  Calendar,
  Send
} from 'lucide-react';
import { Lead, LeadStatus, CatalogData, CatalogItem, AnalyticsData, ClientDossier } from '@/lib/types';
import { adminDict, AdminLang } from '@/lib/adminDict';
import styles from './admin.module.css';

interface AdminDashboardProps {
  onLogout: () => void;
  lang: AdminLang;
  onLangChange: (l: AdminLang) => void;
}

export function AdminDashboard({ onLogout, lang, onLangChange }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'leads' | 'clients' | 'catalog' | 'analytics'>('leads');
  
  // Data states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<ClientDossier[]>([]);
  const [catalog, setCatalog] = useState<CatalogData>({ categories: [], items: [] });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Client Modal State
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<ClientDossier> | null>(null);

  // Sync state
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Catalog Item Edit / Add Modal
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<CatalogItem> | null>(null);
  const [featuresInput, setFeaturesInput] = useState('');

  // Category Add Modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState({ ru: '', ro: '', en: '' });

  const t = adminDict[lang] || adminDict.ru;

  const getLoc = (obj: any): string => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj['ru'] || obj['ro'] || obj['en'] || '';
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [leadsRes, clientsRes, catRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/leads'),
        fetch('/api/admin/clients'),
        fetch('/api/admin/catalog'),
        fetch('/api/admin/analytics')
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

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    onLogout();
  };

  // --- LEADS ACTIONS ---
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    try {
      await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus })
      });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm(t.leads.confirmDelete)) return;
    setLeads(prev => prev.filter(l => l.id !== leadId));
    try {
      await fetch(`/api/admin/leads?id=${leadId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete lead', err);
    }
  };

  // --- CLIENT ACTIONS (CRM) ---
  const openAddClientModal = () => {
    setEditingClient({
      name: '',
      phone: '',
      email: '',
      eventDate: '',
      eventType: 'Свадьба / Юбилей',
      budget: 'от 500 €',
      status: 'lead',
      notes: '',
      preferences: ''
    });
    setClientModalOpen(true);
  };

  const openEditClientModal = (c: ClientDossier) => {
    setEditingClient({ ...c });
    setClientModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editingClient.name || !editingClient.phone) return;

    try {
      if (editingClient.id) {
        // Update
        const res = await fetch('/api/admin/clients', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingClient)
        });
        if (res.ok) {
          const { client } = await res.json();
          setClients(prev => prev.map(c => c.id === client.id ? client : c));
        }
      } else {
        // Create
        const res = await fetch('/api/admin/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingClient)
        });
        if (res.ok) {
          const { client } = await res.json();
          setClients(prev => [client, ...prev]);
        }
      }
      setClientModalOpen(false);
      setEditingClient(null);
    } catch (err) {
      console.error('Failed to save client', err);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Удалить этого клиента из базы?')) return;
    setClients(prev => prev.filter(c => c.id !== id));
    try {
      await fetch(`/api/admin/clients?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete client', err);
    }
  };

  // --- CATALOG ACTIONS ---
  const openAddItemModal = () => {
    setEditingItem({
      categoryId: catalog.categories[0]?.id || 'photozones',
      title: { ru: '', ro: '', en: '' },
      description: { ru: '', ro: '', en: '' },
      price: 'от 150 €',
      image: '',
      badge: 'Новинка',
      active: true,
      order: (catalog.items?.length || 0) + 1
    });
    setFeaturesInput('');
    setItemModalOpen(true);
  };

  const openEditItemModal = (item: CatalogItem) => {
    setEditingItem(item);
    const featStr = (item.features || [])
      .map(f => (typeof f === 'string' ? f : f[lang] || f.ru || f.ro || f.en))
      .join('\n');
    setFeaturesInput(featStr);
    setItemModalOpen(true);
  };

  // Base64 file upload handler
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      if (base64String && editingItem) {
        setEditingItem(prev => ({
          ...prev,
          image: base64String
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const parsedFeatures = featuresInput
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean)
      .map(f => ({ ru: f, ro: f, en: f }));

    const itemPayload = {
      ...editingItem,
      features: parsedFeatures
    };

    try {
      if (editingItem.id) {
        const res = await fetch('/api/admin/catalog', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'item',
            id: editingItem.id,
            updates: itemPayload
          })
        });
        if (res.ok) {
          const { item } = await res.json();
          setCatalog(prev => ({
            ...prev,
            items: prev.items.map(i => i.id === item.id ? item : i)
          }));
        }
      } else {
        const res = await fetch('/api/admin/catalog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'item',
            data: itemPayload
          })
        });
        if (res.ok) {
          const { item } = await res.json();
          setCatalog(prev => ({
            ...prev,
            items: [...prev.items, item]
          }));
        }
      }
      setItemModalOpen(false);
    } catch (err) {
      console.error('Failed to save catalog item', err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm(t.catalog.confirmDelete)) return;
    setCatalog(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== itemId)
    }));
    try {
      await fetch(`/api/admin/catalog?type=item&id=${itemId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete item', err);
    }
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
              en: newCatName.en || newCatName.ru
            },
            order: (catalog.categories?.length || 0) + 1
          }
        })
      });

      if (res.ok) {
        const { category } = await res.json();
        setCatalog(prev => ({
          ...prev,
          categories: [...prev.categories, category]
        }));
        setNewCatName({ ru: '', ro: '', en: '' });
        setCategoryModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to add category', err);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm(t.catalog.confirmDeleteCat)) return;
    setCatalog(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== catId),
      items: prev.items.filter(i => i.categoryId !== catId)
    }));
    try {
      await fetch(`/api/admin/catalog?type=category&id=${catId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete category', err);
    }
  };

  // Sync to Supabase handler
  const handleSyncSupabase = async () => {
    setSyncLoading(true);
    setSyncMessage('');
    try {
      const res = await fetch('/api/admin/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSyncMessage('✓ ' + data.message);
      fetchData();
    } catch (err: any) {
      setSyncMessage('✗ ' + (err.message || 'Ошибка синхронизации'));
    } finally {
      setSyncLoading(false);
    }
  };

  const createTestLead = async () => {
    const testNames = ['Анастасия Руссу', 'Mihail Cebanu', 'Victoria Moraru', 'Alexander Popov'];
    const testServices = ['Глянцевая фотозона с неоном (от 280 €)', 'Кэнди бар «Royal Sweet»', 'Организация под ключ'];
    const randomName = testNames[Math.floor(Math.random() * testNames.length)];
    const randomService = testServices[Math.floor(Math.random() * testServices.length)];

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: randomName,
        phone: '+37368' + Math.floor(100000 + Math.random() * 900000),
        email: 'client@gmail.com',
        message: 'Добрый день! Хотим забронировать оформление для праздника.',
        service: randomService
      })
    });

    if (res.ok) {
      const data = await res.json();
      setLeads(prev => [data.lead, ...prev]);
    }
  };

  const newLeadsCount = leads.filter(l => l.status === 'new').length;
  const filteredLeads = leads.filter(l => {
    const matchesStatus = leadStatusFilter === 'all' || l.status === leadStatusFilter;
    const matchesSearch = !leadSearch || 
      l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.phone.toLowerCase().includes(leadSearch.toLowerCase()) ||
      (l.service && l.service.toLowerCase().includes(leadSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const filteredClients = clients.filter(c => {
    const matchesStatus = clientStatusFilter === 'all' || c.status === clientStatusFilter;
    const matchesSearch = !clientSearch ||
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone.toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.eventType && c.eventType.toLowerCase().includes(clientSearch.toLowerCase())) ||
      (c.notes && c.notes.toLowerCase().includes(clientSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const cleanPhone = (phone: string) => phone.replace(/[^\d]/g, '');

  return (
    <div className={styles.dashboard}>
      {/* Top Navbar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandLogo}>LUXE AGENCY</span>
          <span className={styles.brandBadge}>{t.top.adminBadge}</span>
        </div>

        <nav className={styles.navTabs}>
          <button
            onClick={() => setActiveTab('leads')}
            className={`${styles.navTab} ${activeTab === 'leads' ? styles.activeNavTab : ''}`}
          >
            <Users size={16} />
            <span>{t.tabs.leads}</span>
            {newLeadsCount > 0 && <span className={styles.badgePill}>{newLeadsCount}</span>}
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`${styles.navTab} ${activeTab === 'clients' ? styles.activeNavTab : ''}`}
          >
            <BookOpen size={16} />
            <span>{t.tabs.clients}</span>
            {clients.length > 0 && <span className={styles.badgePill} style={{ background: '#3b82f6' }}>{clients.length}</span>}
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`${styles.navTab} ${activeTab === 'catalog' ? styles.activeNavTab : ''}`}
          >
            <Tag size={16} />
            <span>{t.tabs.catalog}</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`${styles.navTab} ${activeTab === 'analytics' ? styles.activeNavTab : ''}`}
          >
            <TrendingUp size={16} />
            <span>{t.tabs.analytics}</span>
          </button>
        </nav>

        <div className={styles.topActions}>
          {/* Admin Language Switcher */}
          <div className={styles.langSwitchWrap}>
            {(['ru', 'ro', 'en'] as AdminLang[]).map((l) => (
              <button
                key={l}
                onClick={() => onLangChange(l)}
                className={`${styles.langBtn} ${lang === l ? styles.activeLangBtn : ''}`}
              >
                {l}
              </button>
            ))}
          </div>

          <button onClick={fetchData} className={styles.actionBtn} title={t.top.refresh}>
            <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} />
            <span>{t.top.refresh}</span>
          </button>

          <Link href={`/${lang}`} target="_blank" className={styles.actionBtn}>
            <span>{t.top.site}</span>
            <ExternalLink size={14} />
          </Link>

          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={14} />
            <span>{t.top.logout}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* TAB 1: LEADS / APPLICATIONS */}
        {activeTab === 'leads' && (
          <div>
            {/* Metric counters */}
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ background: 'rgba(255, 255, 255, 0.06)' }}>
                  <Users size={22} color="#ffffff" />
                </div>
                <div>
                  <div className={styles.metricValue}>{leads.length}</div>
                  <div className={styles.metricLabel}>{t.leads.total}</div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
                  <AlertCircle size={22} color="#f59e0b" />
                </div>
                <div>
                  <div className={styles.metricValue} style={{ color: '#f59e0b' }}>{newLeadsCount}</div>
                  <div className={styles.metricLabel}>{t.leads.new}</div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
                  <Clock size={22} color="#3b82f6" />
                </div>
                <div>
                  <div className={styles.metricValue}>
                    {leads.filter(l => l.status === 'in_progress').length}
                  </div>
                  <div className={styles.metricLabel}>{t.leads.inProgress}</div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                  <CheckCircle2 size={22} color="#10b981" />
                </div>
                <div>
                  <div className={styles.metricValue}>
                    {leads.filter(l => l.status === 'completed').length}
                  </div>
                  <div className={styles.metricLabel}>{t.leads.completed}</div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className={styles.leadsControls}>
              <div className={styles.searchBox}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder={t.leads.searchPlaceholder}
                  className={styles.searchInput}
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                />
              </div>

              <div className={styles.filterPills}>
                <button
                  onClick={() => setLeadStatusFilter('all')}
                  className={`${styles.filterPill} ${leadStatusFilter === 'all' ? styles.activeFilterPill : ''}`}
                >
                  {t.leads.allFilter} ({leads.length})
                </button>
                <button
                  onClick={() => setLeadStatusFilter('new')}
                  className={`${styles.filterPill} ${leadStatusFilter === 'new' ? styles.activeFilterPill : ''}`}
                >
                  {t.leads.newFilter} ({newLeadsCount})
                </button>
                <button
                  onClick={() => setLeadStatusFilter('in_progress')}
                  className={`${styles.filterPill} ${leadStatusFilter === 'in_progress' ? styles.activeFilterPill : ''}`}
                >
                  {t.leads.inProgressFilter} ({leads.filter(l => l.status === 'in_progress').length})
                </button>
                <button
                  onClick={() => setLeadStatusFilter('completed')}
                  className={`${styles.filterPill} ${leadStatusFilter === 'completed' ? styles.activeFilterPill : ''}`}
                >
                  {t.leads.completedFilter} ({leads.filter(l => l.status === 'completed').length})
                </button>
                <button
                  onClick={() => setLeadStatusFilter('cancelled')}
                  className={`${styles.filterPill} ${leadStatusFilter === 'cancelled' ? styles.activeFilterPill : ''}`}
                >
                  {t.leads.cancelledFilter} ({leads.filter(l => l.status === 'cancelled').length})
                </button>
              </div>
            </div>

            {/* Leads List */}
            {filteredLeads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
                <Users size={44} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <h3 style={{ color: '#cbd5e1' }}>{t.leads.emptyTitle}</h3>
                <p style={{ marginTop: '0.4rem', fontSize: '0.88rem' }}>
                  {leads.length === 0 ? t.leads.emptyDesc : t.leads.emptyFilterDesc}
                </p>
                {leads.length === 0 && (
                  <button onClick={createTestLead} className={styles.primaryBtn} style={{ margin: '1.4rem auto 0' }}>
                    <Plus size={16} />
                    <span>{t.leads.createTest}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.leadsList}>
                {filteredLeads.map((lead) => {
                  const dateStr = new Date(lead.createdAt).toLocaleString(lang === 'en' ? 'en-US' : (lang === 'ro' ? 'ro-RO' : 'ru-RU'), {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  const statusColors: Record<LeadStatus, { bg: string; dot: string; text: string }> = {
                    new: { bg: 'rgba(245, 158, 11, 0.12)', dot: '#f59e0b', text: '#f59e0b' },
                    in_progress: { bg: 'rgba(59, 130, 246, 0.12)', dot: '#3b82f6', text: '#93c5fd' },
                    completed: { bg: 'rgba(16, 185, 129, 0.12)', dot: '#10b981', text: '#6ee7b7' },
                    cancelled: { bg: 'rgba(100, 116, 139, 0.12)', dot: '#64748b', text: '#94a3b8' }
                  };
                  const currStatus = statusColors[lead.status] || statusColors.new;

                  return (
                    <div key={lead.id} className={styles.leadCard}>
                      <div className={styles.leadCardTop}>
                        <div className={styles.clientName}>
                          <span>{lead.name}</span>
                          <span 
                            className={styles.statusBadge}
                            style={{ background: currStatus.bg, color: currStatus.text }}
                          >
                            <span className={styles.statusDot} style={{ background: currStatus.dot }}></span>
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
                              title="Скопировать"
                            >
                              {copiedId === `phone_${lead.id}` ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
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
                                title="Скопировать"
                              >
                                {copiedId === `email_${lead.id}` ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className={styles.infoCol}>
                          <span className={styles.infoLabel}>{t.leads.service}</span>
                          <span className={styles.infoValue} style={{ color: '#ffffff', fontWeight: 500 }}>
                            {lead.service || 'Общая заявка'}
                          </span>
                        </div>
                      </div>

                      {lead.message && (
                        <div className={styles.leadMessage}>
                          <strong>{t.leads.message}</strong> {lead.message}
                        </div>
                      )}

                      <div className={styles.leadBottomBar}>
                        <div className={styles.leadQuickButtons}>
                          <a href={`tel:${lead.phone}`} className={`${styles.contactBtn} ${styles.callBtn}`}>
                            <Phone size={14} />
                            <span>Позвонить</span>
                          </a>

                          <a 
                            href={`https://wa.me/${cleanPhone(lead.phone)}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`${styles.contactBtn} ${styles.waBtn}`}
                          >
                            <MessageSquare size={14} />
                            <span>WhatsApp</span>
                          </a>

                          <a 
                            href={`viber://chat?number=${cleanPhone(lead.phone)}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`${styles.contactBtn} ${styles.viberBtn}`}
                          >
                            <Phone size={14} />
                            <span>Viber</span>
                          </a>

                          <a 
                            href={`https://t.me/+${cleanPhone(lead.phone)}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`${styles.contactBtn} ${styles.tgBtn}`}
                          >
                            <Send size={14} />
                            <span>Telegram</span>
                          </a>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
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

        {/* TAB: CLIENTS (CRM & NOTEBOOK) */}
        {activeTab === 'clients' && (
          <div>
            <div className={styles.catalogHeader}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.2rem' }}>
                  База клиентов
                </h2>
                <p style={{ color: '#8e9bb0', fontSize: '0.86rem' }}>
                  Внутренний блокнот агентства: сохраняйте даты мероприятий, бюджеты, предпочтения и личные заметки по каждому клиенту.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
                <button onClick={openAddClientModal} className={styles.primaryBtn}>
                  <Plus size={16} />
                  <span>Добавить клиента</span>
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
                  <Users size={22} color="#3b82f6" />
                </div>
                <div>
                  <div className={styles.metricValue}>{clients.length}</div>
                  <div className={styles.metricLabel}>Всего клиентов</div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
                  <Calendar size={22} color="#f59e0b" />
                </div>
                <div>
                  <div className={styles.metricValue}>
                    {clients.filter(c => c.status === 'contract' || c.status === 'in_discussion').length}
                  </div>
                  <div className={styles.metricLabel}>В работе / Согласование</div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                  <CheckCircle2 size={22} color="#10b981" />
                </div>
                <div>
                  <div className={styles.metricValue}>
                    {clients.filter(c => c.status === 'paid' || c.status === 'completed').length}
                  </div>
                  <div className={styles.metricLabel}>Оплачены / Завершены</div>
                </div>
              </div>
            </div>

            {/* Search & Status Filters */}
            <div className={styles.leadsControls}>
              <div className={styles.searchBox}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Поиск по имени, телефону, типу события или заметкам..."
                  className={styles.searchInput}
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                />
              </div>

              <div className={styles.filterPills}>
                <button
                  onClick={() => setClientStatusFilter('all')}
                  className={`${styles.filterPill} ${clientStatusFilter === 'all' ? styles.activeFilterPill : ''}`}
                >
                  Все ({clients.length})
                </button>
                <button
                  onClick={() => setClientStatusFilter('lead')}
                  className={`${styles.filterPill} ${clientStatusFilter === 'lead' ? styles.activeFilterPill : ''}`}
                >
                  Лиды ({clients.filter(c => c.status === 'lead').length})
                </button>
                <button
                  onClick={() => setClientStatusFilter('in_discussion')}
                  className={`${styles.filterPill} ${clientStatusFilter === 'in_discussion' ? styles.activeFilterPill : ''}`}
                >
                  Обсуждение ({clients.filter(c => c.status === 'in_discussion').length})
                </button>
                <button
                  onClick={() => setClientStatusFilter('contract')}
                  className={`${styles.filterPill} ${clientStatusFilter === 'contract' ? styles.activeFilterPill : ''}`}
                >
                  Договор ({clients.filter(c => c.status === 'contract').length})
                </button>
                <button
                  onClick={() => setClientStatusFilter('paid')}
                  className={`${styles.filterPill} ${clientStatusFilter === 'paid' ? styles.activeFilterPill : ''}`}
                >
                  Оплачен ({clients.filter(c => c.status === 'paid').length})
                </button>
                <button
                  onClick={() => setClientStatusFilter('completed')}
                  className={`${styles.filterPill} ${clientStatusFilter === 'completed' ? styles.activeFilterPill : ''}`}
                >
                  Завершен ({clients.filter(c => c.status === 'completed').length})
                </button>
              </div>
            </div>

            {/* Clients List */}
            {filteredClients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
                <BookOpen size={44} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <h3 style={{ color: '#cbd5e1' }}>Клиентов не найдено</h3>
                <p style={{ marginTop: '0.4rem', fontSize: '0.88rem' }}>
                  {clients.length === 0 ? 'Вы пока не добавили ни одного клиента в базу.' : 'По выбранным фильтрам ничего не найдено.'}
                </p>
                {clients.length === 0 && (
                  <button onClick={openAddClientModal} className={styles.primaryBtn} style={{ margin: '1.4rem auto 0' }}>
                    <Plus size={16} />
                    <span>Добавить первого клиента</span>
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.leadsList}>
                {filteredClients.map((client) => {
                  const clientStatuses: Record<string, { label: string; bg: string; dot: string; text: string }> = {
                    lead: { label: 'Новый контакт', bg: 'rgba(148, 163, 184, 0.12)', dot: '#94a3b8', text: '#cbd5e1' },
                    in_discussion: { label: 'Обсуждение', bg: 'rgba(59, 130, 246, 0.12)', dot: '#3b82f6', text: '#93c5fd' },
                    contract: { label: 'Договор / Бронь', bg: 'rgba(245, 158, 11, 0.12)', dot: '#f59e0b', text: '#fcd34d' },
                    paid: { label: 'Оплачен', bg: 'rgba(16, 185, 129, 0.12)', dot: '#10b981', text: '#6ee7b7' },
                    completed: { label: 'Завершен успешно', bg: 'rgba(99, 102, 241, 0.12)', dot: '#6366f1', text: '#a5b4fc' },
                    archived: { label: 'В архиве', bg: 'rgba(100, 116, 139, 0.12)', dot: '#64748b', text: '#94a3b8' }
                  };
                  const statusInfo = clientStatuses[client.status] || clientStatuses.lead;

                  return (
                    <div key={client.id} className={styles.leadCard}>
                      <div className={styles.leadCardTop}>
                        <div className={styles.clientName}>
                          <span>{client.name}</span>
                          <span 
                            className={styles.statusBadge}
                            style={{ background: statusInfo.bg, color: statusInfo.text }}
                          >
                            <span className={styles.statusDot} style={{ background: statusInfo.dot }}></span>
                            {statusInfo.label}
                          </span>
                        </div>
                        <span className={styles.leadTime}>
                          {client.eventDate ? `Дата события: ${client.eventDate}` : 'Дата не назначена'}
                        </span>
                      </div>

                      <div className={styles.leadInfoGrid}>
                        <div className={styles.infoCol}>
                          <span className={styles.infoLabel}>Телефон</span>
                          <div className={styles.infoValue}>
                            <span>{client.phone}</span>
                            <button
                              onClick={() => copyToClipboard(client.phone, `client_phone_${client.id}`)}
                              className={styles.copyBtn}
                              title="Скопировать"
                            >
                              {copiedId === `client_phone_${client.id}` ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        {client.email && (
                          <div className={styles.infoCol}>
                            <span className={styles.infoLabel}>Email</span>
                            <div className={styles.infoValue}>
                              <span>{client.email}</span>
                            </div>
                          </div>
                        )}

                        <div className={styles.infoCol}>
                          <span className={styles.infoLabel}>Тип события</span>
                          <span className={styles.infoValue} style={{ color: '#ffffff', fontWeight: 500 }}>
                            {client.eventType || 'Не указан'}
                          </span>
                        </div>

                        <div className={styles.infoCol}>
                          <span className={styles.infoLabel}>Бюджет</span>
                          <span className={styles.infoValue} style={{ color: '#e5c365', fontWeight: 600 }}>
                            {client.budget || '—'}
                          </span>
                        </div>
                      </div>

                      {client.preferences && (
                        <div style={{
                          background: 'rgba(212, 175, 55, 0.08)',
                          borderLeft: '3px solid #d4af37',
                          padding: '0.85rem 1.15rem',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          color: '#fef08a'
                        }}>
                          <strong>Пожелания клиента:</strong> {client.preferences}
                        </div>
                      )}

                      {client.notes && (
                        <div className={styles.leadMessage}>
                          <strong>Личные заметки (блокнот):</strong> {client.notes}
                        </div>
                      )}

                      <div className={styles.leadBottomBar}>
                        <div className={styles.leadQuickButtons}>
                          <a href={`tel:${client.phone}`} className={`${styles.contactBtn} ${styles.callBtn}`}>
                            <Phone size={14} />
                            <span>Позвонить</span>
                          </a>

                          <a 
                            href={`https://wa.me/${cleanPhone(client.phone)}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`${styles.contactBtn} ${styles.waBtn}`}
                          >
                            <MessageSquare size={14} />
                            <span>WhatsApp</span>
                          </a>

                          <a 
                            href={`viber://chat?number=${cleanPhone(client.phone)}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`${styles.contactBtn} ${styles.viberBtn}`}
                          >
                            <Phone size={14} />
                            <span>Viber</span>
                          </a>

                          <a 
                            href={`https://t.me/+${cleanPhone(client.phone)}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`${styles.contactBtn} ${styles.tgBtn}`}
                          >
                            <Send size={14} />
                            <span>Telegram</span>
                          </a>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <button
                            onClick={() => openEditClientModal(client)}
                            className={styles.actionBtn}
                            title="Редактировать данные клиента"
                          >
                            <Edit3 size={14} />
                            <span>Изменить</span>
                          </button>

                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className={styles.deleteIconBtn}
                            title="Удалить клиента"
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

        {/* TAB 2: CATALOG & PRICING */}
        {activeTab === 'catalog' && (
          <div>
            <div className={styles.catalogHeader}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.2rem' }}>
                  {t.catalog.title}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  {t.catalog.desc}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button onClick={() => setCategoryModalOpen(true)} className={styles.actionBtn}>
                  <Layers size={15} />
                  <span>{t.catalog.categoriesBtn} ({catalog.categories?.length || 0})</span>
                </button>
                <button onClick={openAddItemModal} className={styles.primaryBtn}>
                  <Plus size={16} />
                  <span>{t.catalog.addPositionBtn}</span>
                </button>
              </div>
            </div>

            {/* List of Catalog Items */}
            <div className={styles.catalogGrid}>
              {(catalog.items || []).map((item) => {
                const cat = catalog.categories.find(c => c.id === item.categoryId);
                const titleStr = getLoc(item.title);
                const descStr = getLoc(item.description);

                return (
                  <div key={item.id} className={styles.catalogCard}>
                    <div className={styles.catalogThumb}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image || '/photozones/1f4ebfa4-34af-4cbd-8059-3186ce818cb0.jpg'}
                        alt={titleStr}
                        className={styles.catalogImg}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/photozones/1f4ebfa4-34af-4cbd-8059-3186ce818cb0.jpg';
                        }}
                      />
                      {item.badge && (
                        <span style={{ position: 'absolute', top: 10, left: 10, padding: '3px 8px', background: '#000000', color: '#ffffff', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}>
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <div className={styles.catalogBody}>
                      <span className={styles.catalogCategory}>
                        {getLoc(cat?.name)}
                      </span>
                      <h4 className={styles.catalogTitle}>
                        {titleStr}
                      </h4>
                      <div className={styles.catalogPrice}>{item.price}</div>
                      <p className={styles.catalogDesc}>
                        {descStr}
                      </p>

                      <div className={styles.catalogActions}>
                        <button onClick={() => openEditItemModal(item)} className={styles.actionBtn}>
                          <Edit3 size={14} />
                          <span>{t.catalog.editBtn}</span>
                        </button>
                        <button onClick={() => handleDeleteItem(item.id)} className={styles.deleteIconBtn}>
                          <Trash2 size={14} />
                          <span>{t.catalog.deleteBtn}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* TAB 3: ANALYTICS & VISITORS */}
        {activeTab === 'analytics' && analytics && (
          <div>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>
                  <Eye size={22} color="#ffffff" />
                </div>
                <div>
                  <div className={styles.metricValue}>{analytics.summary.totalViews || 0}</div>
                  <div className={styles.metricLabel}>{t.analytics.totalViews}</div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
                  <Users size={22} color="#3b82f6" />
                </div>
                <div>
                  <div className={styles.metricValue}>{analytics.summary.uniqueVisitors || 0}</div>
                  <div className={styles.metricLabel}>{t.analytics.uniqueVisitors}</div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon} style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                  <TrendingUp size={22} color="#10b981" />
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
                  <Globe size={22} color="#ffffff" />
                </div>
                <div>
                  <div className={styles.metricValue} style={{ fontSize: '1.25rem' }}>
                    {Object.keys(analytics.sources)[0] || 'Direct'}
                  </div>
                  <div className={styles.metricLabel}>{t.analytics.topSource}</div>
                </div>
              </div>
            </div>

            {/* Daily Visits Chart */}
            <div className={styles.chartContainer}>
              <div className={styles.chartTop}>
                <h3 className={styles.chartTitle}>{t.analytics.chartTitle}</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.analytics.chartSubtitle}</span>
              </div>

              <div className={styles.barChart}>
                {(() => {
                  const days: string[] = [];
                  for (let i = 13; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    days.push(d.toISOString().split('T')[0]);
                  }
                  const maxViews = Math.max(1, ...days.map(d => analytics.daily[d]?.views || 0));

                  return days.map(d => {
                    const dayData = analytics.daily[d] || { views: 0, unique: 0 };
                    const heightPercent = Math.max(6, (dayData.views / maxViews) * 100);
                    const formattedDate = d.slice(5).replace('-', '.');

                    return (
                      <div key={d} className={styles.barCol} title={`${d}: ${dayData.views} views, ${dayData.unique} unique`}>
                        <div className={styles.barTrack}>
                          <div className={styles.barFill} style={{ height: `${heightPercent}%` }}></div>
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
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{t.analytics.noData}</p>
                ) : (
                  Object.entries(analytics.sources).map(([src, count]) => {
                    const total = analytics.summary.totalViews || 1;
                    const percent = Math.round((count / total) * 100);
                    return (
                      <div key={src} className={styles.breakdownRow}>
                        <div className={styles.breakdownHeader}>
                          <span>{src}</span>
                          <span style={{ fontWeight: 600 }}>{count} ({percent}%)</span>
                        </div>
                        <div className={styles.progressTrack}>
                          <div className={styles.progressFill} style={{ width: `${percent}%` }}></div>
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
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{t.analytics.noData}</p>
                ) : (
                  Object.entries(analytics.countries).map(([country, count]) => {
                    const total = analytics.summary.totalViews || 1;
                    const percent = Math.round((count / total) * 100);
                    return (
                      <div key={country} className={styles.breakdownRow}>
                        <div className={styles.breakdownHeader}>
                          <span>{country}</span>
                          <span style={{ fontWeight: 600 }}>{count} ({percent}%)</span>
                        </div>
                        <div className={styles.progressTrack}>
                          <div className={styles.progressFill} style={{ width: `${percent}%`, background: '#10b981' }}></div>
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
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{t.analytics.noData}</p>
                ) : (
                  Object.entries(analytics.devices).map(([dev, count]) => {
                    const total = analytics.summary.totalViews || 1;
                    const percent = Math.round((count / total) * 100);
                    return (
                      <div key={dev} className={styles.breakdownRow}>
                        <div className={styles.breakdownHeader}>
                          <span>{dev}</span>
                          <span style={{ fontWeight: 600 }}>{count} ({percent}%)</span>
                        </div>
                        <div className={styles.progressTrack}>
                          <div className={styles.progressFill} style={{ width: `${percent}%`, background: '#f59e0b' }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Live Activity Table */}
            <div className={styles.activityCard}>
              <h4 className={styles.breakdownTitle} style={{ marginBottom: '1rem' }}>
                <Clock size={16} color="#ffffff" />
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
                        {new Date(v.timestamp).toLocaleTimeString(lang === 'en' ? 'en-US' : (lang === 'ro' ? 'ro-RO' : 'ru-RU'), { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td>
                        <span style={{ background: '#1e2433', padding: '2px 6px', borderRadius: '4px', fontSize: '0.78rem' }}>{v.path}</span>
                      </td>
                      <td style={{ color: '#ffffff', fontWeight: 500 }}>{v.referrer}</td>
                      <td>{v.country} ({v.city})</td>
                      <td>{v.device} • {v.browser}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748b' }}>{v.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


      </main>

      {/* MODAL: ADD / EDIT CATALOG ITEM (Supports Base64 & Cloud URLs) */}
      {itemModalOpen && editingItem && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalWindow}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingItem.id ? t.catalog.modalTitleEdit : t.catalog.modalTitleAdd}
              </h3>
              <button onClick={() => setItemModalOpen(false)} className={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveItem}>
              {/* Category */}
              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.catalog.categoryLabel}</label>
                <select
                  className={styles.formInput}
                  value={editingItem.categoryId}
                  onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value })}
                >
                  {catalog.categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {getLoc(c.name)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.catalog.titleRu}</label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder="Премиум Фотозона с неоном"
                  value={editingItem.title?.ru || ''}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    title: {
                      ru: e.target.value,
                      ro: editingItem.title?.ro || e.target.value,
                      en: editingItem.title?.en || e.target.value
                    }
                  })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.catalog.titleRo}</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Fotozonă Premium"
                    value={editingItem.title?.ro || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      title: { ...editingItem.title!, ro: e.target.value }
                    })}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.catalog.titleEn}</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Premium Photozone"
                    value={editingItem.title?.en || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      title: { ...editingItem.title!, en: e.target.value }
                    })}
                  />
                </div>
              </div>

              {/* Price & Badge */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.catalog.priceLabel}</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    placeholder="от 250 € / $300"
                    value={editingItem.price || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t.catalog.badgeLabel}</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Хит / Премиум / Новинка"
                    value={editingItem.badge || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                  />
                </div>
              </div>

              {/* Image URL & Base64 Upload */}
              <div className={styles.formField}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className={styles.formLabel} style={{ marginBottom: 0 }}>
                    {t.catalog.imageLabel}
                  </label>
                  
                  {/* File Upload Trigger for Base64 */}
                  <label style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.35rem', 
                    padding: '0.25rem 0.65rem', 
                    background: '#1e2636', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem', 
                    color: '#93c5fd', 
                    cursor: 'pointer',
                    border: '1px solid #2d3850'
                  }}>
                    <Upload size={13} />
                    <span>Загрузить с устройства (Base64)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={handleImageFileUpload}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder="https://... или data:image/...;base64,..."
                  value={editingItem.image || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  {editingItem.image?.startsWith('data:') 
                    ? '✓ Фото загружено как Base64 текст (сохраняется прямо в базу Supabase)' 
                    : t.catalog.imageTip}
                </span>

                {editingItem.image && (
                  <div style={{ marginTop: '0.6rem', height: 120, borderRadius: 8, overflow: 'hidden', background: '#0e1117', position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editingItem.image}
                      alt="Предпросмотр"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).alt = 'Image link error';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, image: '' })}
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        background: 'rgba(0,0,0,0.7)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '4px',
                        padding: '3px 6px',
                        fontSize: '0.7rem',
                        cursor: 'pointer'
                      }}
                    >
                      Удалить фото
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.catalog.descLabel}</label>
                <textarea
                  rows={2}
                  required
                  className={styles.formInput}
                  placeholder="Краткое описание услуги..."
                  value={editingItem.description?.ru || ''}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    description: {
                      ru: e.target.value,
                      ro: editingItem.description?.ro || e.target.value,
                      en: editingItem.description?.en || e.target.value
                    }
                  })}
                />
              </div>

              {/* Features */}
              <div className={styles.formField}>
                <label className={styles.formLabel}>{t.catalog.featuresLabel}</label>
                <textarea
                  rows={3}
                  className={styles.formInput}
                  placeholder="Монтаж и демонтаж включены&#10;Индивидуальная неоновая надпись"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem' }}>
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

      {/* MODAL: CATEGORY MANAGEMENT */}
      {categoryModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalWindow} style={{ maxWidth: '480px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t.catalog.categoriesModalTitle}</h3>
              <button onClick={() => setCategoryModalOpen(false)} className={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>

            {/* List existing */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {catalog.categories.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0e1117', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #1e2433' }}>
                  <span style={{ fontWeight: 500, color: '#ffffff', fontSize: '0.9rem' }}>{getLoc(c.name)}</span>
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className={styles.deleteIconBtn}
                    title={t.catalog.deleteBtn}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Form to add new */}
            <form onSubmit={handleAddCategory}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.6rem' }}>{t.catalog.addCatTitle}</h4>
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

              <button type="submit" className={styles.primaryBtn} style={{ marginTop: '0.4rem', width: '100%', justifyContent: 'center' }}>
                {t.catalog.addCatBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CLIENT DOSSIER (CRM) */}
      {clientModalOpen && editingClient && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalWindow} style={{ maxWidth: '640px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingClient.id ? 'Редактировать данные клиента' : 'Новый клиент в базу'}
              </h3>
              <button onClick={() => setClientModalOpen(false)} className={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveClient}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>ФИО / Имя клиента *</label>
                  <input
                    type="text"
                    required
                    placeholder="Виктория Смирнова"
                    className={styles.formInput}
                    value={editingClient.name || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Телефон *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+373 69 123 456"
                    className={styles.formInput}
                    value={editingClient.phone || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Email</label>
                  <input
                    type="email"
                    placeholder="client@mail.com"
                    className={styles.formInput}
                    value={editingClient.email || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Дата мероприятия</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={editingClient.eventDate || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, eventDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Тип события</label>
                  <input
                    type="text"
                    placeholder="Свадьба, Юбилей, Корпоратив..."
                    className={styles.formInput}
                    value={editingClient.eventType || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, eventType: e.target.value })}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Ориентировочный бюджет</label>
                  <input
                    type="text"
                    placeholder="800 € / 15,000 MDL"
                    className={styles.formInput}
                    value={editingClient.budget || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, budget: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Статус работы с клиентом</label>
                <select
                  className={styles.formInput}
                  value={editingClient.status || 'lead'}
                  onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value as any })}
                >
                  <option value="lead">Новый контакт (Лид)</option>
                  <option value="in_discussion">В процессе обсуждения</option>
                  <option value="contract">Подписан договор / Внесена предоплата</option>
                  <option value="paid">Полностью оплачен</option>
                  <option value="completed">Мероприятие завершено</option>
                  <option value="archived">В архиве</option>
                </select>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Пожелания и стиль (цветовая гамма, концепт)</label>
                <textarea
                  rows={2}
                  placeholder="Любят пудровые и золотые оттенки, живые пионы, неон с инициалами..."
                  className={styles.formInput}
                  value={editingClient.preferences || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, preferences: e.target.value })}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Внутренние заметки (блокнот команды)</label>
                <textarea
                  rows={3}
                  placeholder="Звонить после 18:00. Локация: ресторан Mi Piace. Контактный декоратор от них..."
                  className={styles.formInput}
                  value={editingClient.notes || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem' }}>
                <button type="submit" className={styles.primaryBtn}>
                  Сохранить в базу
                </button>
                <button
                  type="button"
                  onClick={() => setClientModalOpen(false)}
                  className={styles.actionBtn}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
