import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { supabase } from './supabase';
import { 
  Currency,
  Lead, 
  LeadStatus, 
  CatalogData, 
  CatalogCategory, 
  CatalogItem, 
  PortfolioItem,
  AnalyticsData, 
  VisitRecord,
  ClientDossier 
} from './types';
import { parsePriceFields, formatMoney } from './formatPrice';

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const CATALOG_FILE = path.join(DATA_DIR, 'catalog.json');
const PORTFOLIO_FILE = path.join(DATA_DIR, 'portfolio.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');

async function ensureDirectory(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Directory already exists
  }
}

// Initial seed catalog data
const DEFAULT_CATALOG: CatalogData = {
  categories: [
    {
      id: "photozones",
      name: { ru: "Фотозоны", ro: "Fotozone", en: "Photozones" },
      order: 1
    },
    {
      id: "decor",
      name: { ru: "Декор и Свет", ro: "Decor și Lumini", en: "Decor & Lights" },
      order: 2
    },
    {
      id: "candybar",
      name: { ru: "Candy Bar", ro: "Candy Bar", en: "Candy Bar" },
      order: 3
    },
    {
      id: "coordination",
      name: { ru: "Координация", ro: "Coordonare", en: "Coordination" },
      order: 4
    },
    {
      id: "turnkey",
      name: { ru: "Праздники под ключ", ro: "Evenimente la cheie", en: "Turnkey Events" },
      order: 5
    }
  ],
  items: [
    {
      id: "item_photo_1",
      categoryId: "photozones",
      title: {
        ru: "Глянцевая фотозона с неоном",
        ro: "Fotozonă lucioasă cu neon",
        en: "Glossy Photozone with Neon"
      },
      description: {
        ru: "Идеальная фотозона для стильного юбилея, корпоратива или дня рождения с индивидуальной надписью.",
        ro: "Fotozonă ideală pentru aniversare, eveniment corporativ sau zi de naștere cu inscripție personalizată.",
        en: "Designer photozone for luxury birthdays, corporate events, and galas with personalized typography."
      },
      price: "280",
      currency: "EUR",
      priceFrom: true,
      image: "/photozones/1f4ebfa4-34af-4cbd-8059-3186ce818cb0.jpg",
      badge: "Хит",
      features: [
        { ru: "Размер 2.5 x 3.0 м", ro: "Dimensiune 2.5 x 3.0 m", en: "Size 2.5 x 3.0 m" },
        { ru: "Индивидуальный неоновый слоган", ro: "Slogan neon personalizat", en: "Custom neon sign included" },
        { ru: "Профессиональная подсветка", ro: "Iluminare profesională", en: "Professional lighting setup" },
        { ru: "Монтаж и демонтаж", ro: "Montare și demontare", en: "Full delivery & installation" }
      ],
      order: 1,
      active: true
    },
    {
      id: "item_photo_2",
      categoryId: "photozones",
      title: {
        ru: "Цветочная арка и парящий декор",
        ro: "Arc floral și decor plutitor",
        en: "Floral Arch & Floating Decor"
      },
      description: {
        ru: "Объемная композиция из премиальных живых и шелковых цветов с золотыми стойками.",
        ro: "Compoziție voluminoasă din flori vii și de mătase premium cu suporturi aurii.",
        en: "Lush floral composition blending fresh blooms with luxury accents and gold pillars."
      },
      price: "350",
      currency: "EUR",
      priceFrom: true,
      image: "/photozones/469f67a3-025a-4daf-a1ab-1bd0d9ec4152.jpg",
      badge: "Премиум",
      features: [
        { ru: "Премиум флористика", ro: "Floristică premium", en: "Premium florals" },
        { ru: "3D визуализация перед монтажом", ro: "Randare 3D înainte de montare", en: "3D render mockup" },
        { ru: "Подиум и ковровая дорожка", ro: "Podium și covor", en: "Podium and runner included" }
      ],
      order: 2,
      active: true
    },
    {
      id: "item_candy_1",
      categoryId: "candybar",
      title: {
        ru: "Кэнди бар «Royal Sweet»",
        ro: "Candy bar «Royal Sweet»",
        en: "Royal Sweet Candy Bar"
      },
      description: {
        ru: "Элегантный сладкий стол с авторскими десертами, тематической сервировкой и индивидуальным оформлением.",
        ro: "Bufet dulce elegant cu deserturi de autor, veselă tematică și decor personalizat.",
        en: "Signature artisan dessert buffet with themed presentation, luxury glassware, and custom signage."
      },
      price: "200",
      currency: "EUR",
      priceFrom: true,
      image: "https://catering-muscat.ru/img/blog/blog_candy_6.jpg",
      badge: "Популярно",
      features: [
        { ru: "На 30–60 персон", ro: "Pentru 30–60 persoane", en: "Serves 30–60 guests" },
        { ru: "Макаронс, капкейки, кейк-попсы", ro: "Macarons, cupcakes, cake pops", en: "Macarons, cupcakes & cake pops" },
        { ru: "Аренда посуды и подставок", ro: "Chirie veselă și suporturi", en: "Glassware and stand rentals" },
        { ru: "Флористическое оформление", ro: "Decor floral integrat", en: "Floral integration" }
      ],
      order: 1,
      active: true
    },
    {
      id: "item_decor_1",
      categoryId: "decor",
      title: {
        ru: "Архитектурный свет и заливка зала",
        ro: "Lumină arhitecturală și atmosferică",
        en: "Architectural Lighting & Ambiance"
      },
      description: {
        ru: "Полное преображение банкетного зала с помощью беспроводных LED-прожекторов и световых голов.",
        ro: "Transformarea completă a sălii de evenimente cu reflectoare LED fără fir și capete mobile.",
        en: "Complete venue transformation using wireless ambient up-lights and moving heads."
      },
      price: "300",
      currency: "EUR",
      priceFrom: true,
      image: "/decor.png",
      badge: "Must have",
      features: [
        { ru: "До 24 беспроводных приборов", ro: "Până la 24 corpuri wireless", en: "Up to 24 wireless uplights" },
        { ru: "Художник по свету на все время", ro: "Inginer de lumini prezent", en: "Dedicated lighting technician" },
        { ru: "Управление сценариями света", ro: "Scenarii de lumină adaptate", en: "Dynamic light shows" }
      ],
      order: 1,
      active: true
    },
    {
      id: "item_turnkey_1",
      categoryId: "turnkey",
      title: {
        ru: "Организация праздника «Все Включено»",
        ro: "Organizare eveniment «All Inclusive»",
        en: "Turnkey Luxury Celebration"
      },
      description: {
        ru: "От концепции до финального салюта: подбор локации, декор, фотограф, кейтеринг, ведущий и шоу.",
        ro: "De la concept până la final: locație, decor, foto/video, catering, prezentator și program show.",
        en: "A-Z event production: venue booking, decor, vendor curation, host, catering, and on-site coordination."
      },
      price: "900",
      currency: "EUR",
      priceFrom: true,
      image: "/events.png",
      badge: "VIP",
      features: [
        { ru: "Личный координатор 24/7", ro: "Coordonator personal 24/7", en: "Personal event planner 24/7" },
        { ru: "Подбор и бронь локации", ro: "Selecție și rezervare locație", en: "Venue scouting & booking" },
        { ru: "Полный тайминг и режиссура", ro: "Timing complet și regie", en: "Master schedule & directing" },
        { ru: "Контроль подрядчиков", ro: "Control total contractori", en: "Vendor management" }
      ],
      order: 1,
      active: true
    }
  ]
};

const DEFAULT_ANALYTICS: AnalyticsData = {
  summary: {
    totalViews: 0,
    uniqueVisitors: 0
  },
  daily: {},
  sources: {},
  countries: {},
  devices: {},
  recentVisits: []
};

// --- LEADS ---
export async function getLeads(): Promise<Lead[]> {
  try {
    // Try querying Supabase
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map((l: any) => ({
        id: l.id,
        createdAt: l.created_at,
        name: l.name,
        phone: l.phone,
        email: l.email || '',
        message: l.message || '',
        service: l.service || '',
        status: (l.status as LeadStatus) || 'new',
        notes: l.notes || ''
      }));
    }
  } catch (err) {
    // Supabase error or table not ready, fallback to local file
  }

  // Fallback to local file
  await ensureDirectory();
  try {
    const raw = await fs.readFile(LEADS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function addLead(leadData: { 
  name: string; 
  phone: string; 
  email?: string; 
  message: string; 
  service?: string; 
}): Promise<Lead> {
  const newLead: Lead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    name: leadData.name.trim(),
    phone: leadData.phone.trim(),
    email: leadData.email?.trim() || '',
    message: leadData.message.trim(),
    service: leadData.service?.trim() || '',
    status: 'new',
    notes: ''
  };

  try {
    // Insert into Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: newLead.name,
        phone: newLead.phone,
        email: newLead.email,
        service: newLead.service,
        message: newLead.message,
        status: 'new',
        notes: ''
      })
      .select()
      .single();

    if (!error && data) {
      newLead.id = data.id;
      newLead.createdAt = data.created_at;
    }
  } catch {
    // Supabase insert failed, local fallback takes care
  }

  // Save to local backup
  await ensureDirectory();
  const leads = await getLeads();
  leads.unshift(newLead);
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8').catch(() => {});

  return newLead;
}

export async function updateLeadStatus(id: string, status: LeadStatus, notes?: string): Promise<Lead | null> {
  try {
    // Update in Supabase
    await supabase
      .from('leads')
      .update({ status, ...(notes !== undefined ? { notes } : {}) })
      .eq('id', id);
  } catch {
    // Ignore error
  }

  // Update in local file
  await ensureDirectory();
  const leads = await getLeads();
  const index = leads.findIndex(l => l.id === id);
  if (index !== -1) {
    leads[index].status = status;
    if (notes !== undefined) {
      leads[index].notes = notes;
    }
    await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8').catch(() => {});
    return leads[index];
  }

  return null;
}

export async function deleteLead(id: string): Promise<boolean> {
  try {
    await supabase.from('leads').delete().eq('id', id);
  } catch {
    // Ignore error
  }

  await ensureDirectory();
  const leads = await getLeads();
  const filtered = leads.filter(l => l.id !== id);
  await fs.writeFile(LEADS_FILE, JSON.stringify(filtered, null, 2), 'utf-8').catch(() => {});
  return true;
}

// --- CATALOG (PRICES & CATEGORIES) ---
export async function getCatalog(): Promise<CatalogData> {
  try {
    // Try querying Supabase
    const [catRes, itemRes] = await Promise.all([
      supabase.from('categories').select('*').order('order_index', { ascending: true }),
      supabase.from('catalog_items').select('*').order('order_index', { ascending: true })
    ]);

    if (!catRes.error && Array.isArray(catRes.data) && catRes.data.length > 0) {
      const categories: CatalogCategory[] = catRes.data.map((c: any) => ({
        id: c.id,
        name: { ru: c.name_ru || '', ro: c.name_ro || c.name_ru, en: c.name_en || c.name_ru },
        order: c.order_index || 0
      }));

      const items: CatalogItem[] = (!itemRes.error && Array.isArray(itemRes.data) ? itemRes.data : []).map((i: any) => {
        const parsed = parsePriceFields(i.price, i.currency, i.price_from);
        return {
          id: i.id,
          categoryId: i.category_id,
          title: { ru: i.title_ru || '', ro: i.title_ro || i.title_ru, en: i.title_en || i.title_ru },
          description: { ru: i.description_ru || '', ro: i.description_ro || i.description_ru, en: i.description_en || i.description_ru },
          price: parsed.amount || i.price || '',
          currency: parsed.currency,
          priceFrom: parsed.priceFrom,
          image: i.image, // Supports both Cloud URLs and Base64 strings!
          badge: i.badge || '',
          features: Array.isArray(i.features) ? i.features : [],
          order: i.order_index || 0,
          active: i.active !== false
        };
      });

      return { categories, items };
    }
  } catch {
    // Supabase not ready, fallback to local
  }

  await ensureDirectory();
  try {
    const raw = await fs.readFile(CATALOG_FILE, 'utf-8');
    const parsedCatalog = JSON.parse(raw) as CatalogData;
    parsedCatalog.items = (parsedCatalog.items || []).map((i: CatalogItem) => {
      const parsed = parsePriceFields(i.price, i.currency, i.priceFrom);
      return {
        ...i,
        price: parsed.amount || i.price || '',
        currency: parsed.currency,
        priceFrom: parsed.priceFrom
      };
    });
    return parsedCatalog;
  } catch {
    await fs.writeFile(CATALOG_FILE, JSON.stringify(DEFAULT_CATALOG, null, 2), 'utf-8');
    return DEFAULT_CATALOG;
  }
}

export async function saveCatalog(catalog: CatalogData): Promise<void> {
  await ensureDirectory();
  await fs.writeFile(CATALOG_FILE, JSON.stringify(catalog, null, 2), 'utf-8');
}

export async function addCatalogCategory(category: Omit<CatalogCategory, 'id'>): Promise<CatalogCategory> {
  const newId = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newCategory: CatalogCategory = {
    id: newId,
    ...category
  };

  try {
    await supabase.from('categories').insert({
      id: newId,
      name_ru: category.name.ru,
      name_ro: category.name.ro,
      name_en: category.name.en,
      order_index: category.order || 0
    });
  } catch {
    // Fallback
  }

  const catalog = await getCatalog();
  catalog.categories.push(newCategory);
  await saveCatalog(catalog);
  return newCategory;
}

export async function updateCatalogCategory(id: string, updates: Partial<CatalogCategory>): Promise<CatalogCategory | null> {
  try {
    await supabase.from('categories').update({
      ...(updates.name?.ru ? { name_ru: updates.name.ru } : {}),
      ...(updates.name?.ro ? { name_ro: updates.name.ro } : {}),
      ...(updates.name?.en ? { name_en: updates.name.en } : {}),
      ...(updates.order !== undefined ? { order_index: updates.order } : {})
    }).eq('id', id);
  } catch {
    // Fallback
  }

  const catalog = await getCatalog();
  const index = catalog.categories.findIndex(c => c.id === id);
  if (index === -1) return null;

  catalog.categories[index] = { ...catalog.categories[index], ...updates };
  await saveCatalog(catalog);
  return catalog.categories[index];
}

export async function deleteCatalogCategory(id: string): Promise<boolean> {
  try {
    await supabase.from('categories').delete().eq('id', id);
  } catch {
    // Fallback
  }

  const catalog = await getCatalog();
  catalog.categories = catalog.categories.filter(c => c.id !== id);
  catalog.items = catalog.items.filter(i => i.categoryId !== id);
  await saveCatalog(catalog);
  return true;
}

export async function addCatalogItem(item: Omit<CatalogItem, 'id'>): Promise<CatalogItem> {
  const newId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const parsed = parsePriceFields(item.price, item.currency, item.priceFrom);
  const normalizedCurrency: Currency = item.currency === 'MDL' ? 'MDL' : (item.currency === 'EUR' ? 'EUR' : parsed.currency);
  const normalizedPriceFrom = typeof item.priceFrom === 'boolean' ? item.priceFrom : parsed.priceFrom;
  const normalizedPrice = parsed.amount || String(item.price || '').trim();

  const newItem: CatalogItem = {
    id: newId,
    ...item,
    price: normalizedPrice,
    currency: normalizedCurrency,
    priceFrom: normalizedPriceFrom
  };

  try {
    // Insert into Supabase (image holds either Base64 text or Cloud URL)
    const { error } = await supabase.from('catalog_items').insert({
      id: newId,
      category_id: item.categoryId,
      title_ru: item.title.ru,
      title_ro: item.title.ro,
      title_en: item.title.en,
      description_ru: item.description.ru,
      description_ro: item.description.ro,
      description_en: item.description.en,
      price: normalizedPrice,
      currency: normalizedCurrency,
      price_from: normalizedPriceFrom,
      image: item.image,
      badge: item.badge || '',
      features: item.features || [],
      order_index: item.order || 0,
      active: item.active !== false
    });

    // Fallback if Supabase table hasn't been migrated with currency/price_from columns yet
    if (error) {
      const legacyPrice = `${normalizedPriceFrom ? 'от ' : ''}${normalizedPrice} ${normalizedCurrency === 'MDL' ? 'MDL' : '€'}`;
      await supabase.from('catalog_items').insert({
        id: newId,
        category_id: item.categoryId,
        title_ru: item.title.ru,
        title_ro: item.title.ro,
        title_en: item.title.en,
        description_ru: item.description.ru,
        description_ro: item.description.ro,
        description_en: item.description.en,
        price: legacyPrice,
        image: item.image,
        badge: item.badge || '',
        features: item.features || [],
        order_index: item.order || 0,
        active: item.active !== false
      });
    }
  } catch {
    // Fallback
  }

  const catalog = await getCatalog();
  if (!catalog.items.some(i => i.id === newItem.id)) {
    catalog.items.push(newItem);
  }
  await saveCatalog(catalog);
  return newItem;
}

export async function updateCatalogItem(id: string, updates: Partial<CatalogItem>): Promise<CatalogItem | null> {
  const hasPriceUpdate = updates.price !== undefined || updates.currency !== undefined || updates.priceFrom !== undefined;
  const parsed = hasPriceUpdate
    ? parsePriceFields(updates.price, updates.currency, updates.priceFrom)
    : null;

  const normalizedPrice = updates.price !== undefined ? (parsed?.amount || String(updates.price).trim()) : undefined;
  const normalizedCurrency: Currency | undefined = updates.currency
    ? (updates.currency === 'MDL' ? 'MDL' : 'EUR')
    : (parsed && updates.price !== undefined ? parsed.currency : undefined);
  const normalizedPriceFrom = typeof updates.priceFrom === 'boolean' ? updates.priceFrom : undefined;

  try {
    const { error } = await supabase.from('catalog_items').update({
      ...(updates.categoryId ? { category_id: updates.categoryId } : {}),
      ...(updates.title?.ru ? { title_ru: updates.title.ru } : {}),
      ...(updates.title?.ro ? { title_ro: updates.title.ro } : {}),
      ...(updates.title?.en ? { title_en: updates.title.en } : {}),
      ...(updates.description?.ru ? { description_ru: updates.description.ru } : {}),
      ...(updates.description?.ro ? { description_ro: updates.description.ro } : {}),
      ...(updates.description?.en ? { description_en: updates.description.en } : {}),
      ...(normalizedPrice !== undefined ? { price: normalizedPrice } : {}),
      ...(normalizedCurrency !== undefined ? { currency: normalizedCurrency } : {}),
      ...(normalizedPriceFrom !== undefined ? { price_from: normalizedPriceFrom } : {}),
      ...(updates.image ? { image: updates.image } : {}),
      ...(updates.badge !== undefined ? { badge: updates.badge } : {}),
      ...(updates.features ? { features: updates.features } : {}),
      ...(updates.active !== undefined ? { active: updates.active } : {})
    }).eq('id', id);

    // Fallback if Supabase table hasn't been migrated with currency/price_from columns yet
    if (error && (normalizedCurrency !== undefined || normalizedPriceFrom !== undefined)) {
      const legacyPrice = normalizedPrice !== undefined
        ? `${normalizedPriceFrom ? 'от ' : ''}${normalizedPrice} ${(normalizedCurrency || 'EUR') === 'MDL' ? 'MDL' : '€'}`
        : undefined;
      await supabase.from('catalog_items').update({
        ...(updates.categoryId ? { category_id: updates.categoryId } : {}),
        ...(updates.title?.ru ? { title_ru: updates.title.ru } : {}),
        ...(updates.title?.ro ? { title_ro: updates.title.ro } : {}),
        ...(updates.title?.en ? { title_en: updates.title.en } : {}),
        ...(updates.description?.ru ? { description_ru: updates.description.ru } : {}),
        ...(updates.description?.ro ? { description_ro: updates.description.ro } : {}),
        ...(updates.description?.en ? { description_en: updates.description.en } : {}),
        ...(legacyPrice !== undefined ? { price: legacyPrice } : {}),
        ...(updates.image ? { image: updates.image } : {}),
        ...(updates.badge !== undefined ? { badge: updates.badge } : {}),
        ...(updates.features ? { features: updates.features } : {}),
        ...(updates.active !== undefined ? { active: updates.active } : {})
      }).eq('id', id);
    }
  } catch {
    // Fallback
  }

  const catalog = await getCatalog();
  const index = catalog.items.findIndex(i => i.id === id);
  if (index === -1) return null;

  catalog.items[index] = {
    ...catalog.items[index],
    ...updates,
    ...(normalizedPrice !== undefined ? { price: normalizedPrice } : {}),
    ...(normalizedCurrency !== undefined ? { currency: normalizedCurrency } : {}),
    ...(normalizedPriceFrom !== undefined ? { priceFrom: normalizedPriceFrom } : {})
  };
  await saveCatalog(catalog);
  return catalog.items[index];
}

export async function deleteCatalogItem(id: string): Promise<boolean> {
  try {
    await supabase.from('catalog_items').delete().eq('id', id);
  } catch {
    // Fallback
  }

  const catalog = await getCatalog();
  const initialLength = catalog.items.length;
  catalog.items = catalog.items.filter(i => i.id !== id);
  if (catalog.items.length === initialLength) return false;
  await saveCatalog(catalog);
  return true;
}

// --- ANALYTICS ---
export async function getAnalytics(): Promise<AnalyticsData> {
  await ensureDirectory();
  try {
    const raw = await fs.readFile(ANALYTICS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(DEFAULT_ANALYTICS, null, 2), 'utf-8');
    return DEFAULT_ANALYTICS;
  }
}

export async function recordVisit(data: {
  path: string;
  referrer?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  ip?: string;
  isUnique?: boolean;
}): Promise<void> {
  const pathName = data.path || '/';
  const today = new Date().toISOString().split('T')[0];

  try {
    // Attempt saving to Supabase analytics_visits
    await supabase.from('analytics_visits').insert({
      path: pathName,
      referrer: data.referrer || 'Direct',
      country: data.country || 'Молдова (MD)',
      city: data.city || 'Chişinău',
      device: data.device || 'Desktop',
      browser: data.browser || 'Unknown',
      ip: data.ip ? data.ip.replace(/(\d+)\.(\d+)\.(\d+)\.(\d+)/, '$1.$2.***.***') : 'Localhost'
    });
  } catch {
    // Fallback
  }

  await ensureDirectory();
  const analytics = await getAnalytics();

  analytics.summary.totalViews = (analytics.summary.totalViews || 0) + 1;
  if (data.isUnique) {
    analytics.summary.uniqueVisitors = (analytics.summary.uniqueVisitors || 0) + 1;
  }

  if (!analytics.daily[today]) {
    analytics.daily[today] = { views: 0, unique: 0 };
  }
  analytics.daily[today].views += 1;
  if (data.isUnique) {
    analytics.daily[today].unique += 1;
  }

  let source = data.referrer ? data.referrer.toLowerCase() : 'direct';
  if (source.includes('instagram')) source = 'Instagram';
  else if (source.includes('google')) source = 'Google';
  else if (source.includes('facebook') || source.includes('fb.')) source = 'Facebook';
  else if (source.includes('telegram') || source.includes('t.me')) source = 'Telegram';
  else if (source.includes('tiktok')) source = 'TikTok';
  else if (source.includes('youtube')) source = 'YouTube';
  else if (source === 'direct' || !data.referrer) source = 'Прямой переход';
  else {
    try {
      const url = new URL(data.referrer);
      source = url.hostname.replace('www.', '');
    } catch {
      source = 'Другое';
    }
  }

  analytics.sources[source] = (analytics.sources[source] || 0) + 1;
  const country = data.country || 'Молдова (MD)';
  analytics.countries[country] = (analytics.countries[country] || 0) + 1;
  const device = data.device || 'Desktop';
  analytics.devices[device] = (analytics.devices[device] || 0) + 1;

  const visit: VisitRecord = {
    id: `vis_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    path: pathName,
    referrer: source,
    country: country,
    city: data.city || 'Chişinău',
    device: device,
    browser: data.browser || 'Unknown',
    ip: data.ip ? data.ip.replace(/(\d+)\.(\d+)\.(\d+)\.(\d+)/, '$1.$2.***.***') : 'Localhost'
  };

  analytics.recentVisits = [visit, ...(analytics.recentVisits || [])].slice(0, 100);
  await fs.writeFile(ANALYTICS_FILE, JSON.stringify(analytics, null, 2), 'utf-8').catch(() => {});
}

// --- CLIENT DOSSIER (CRM & NOTEBOOK) ---
export async function getClients(): Promise<ClientDossier[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map((c: any) => {
        const parsed = parsePriceFields(c.budget, c.budget_currency, false);
        const budgetCurrency: Currency = c.budget_currency === 'MDL' ? 'MDL' : (c.budget_currency === 'EUR' ? 'EUR' : parsed.currency);
        const budgetAmount = c.budget_amount !== undefined && c.budget_amount !== null && Number(c.budget_amount) > 0
          ? Number(c.budget_amount)
          : parsed.numericAmount;
        const expensesAmount = c.expenses_amount !== undefined && c.expenses_amount !== null
          ? Number(c.expenses_amount) || 0
          : 0;

        return {
          id: c.id,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          name: c.name,
          phone: c.phone,
          email: c.email || '',
          eventDate: c.event_date || '',
          eventType: c.event_type || '',
          budget: c.budget || (budgetAmount > 0 ? formatMoney(budgetAmount, budgetCurrency, 'ru') : ''),
          budgetAmount,
          budgetCurrency,
          expensesAmount,
          status: c.status || 'lead',
          tags: Array.isArray(c.tags) ? c.tags : [],
          notes: c.notes || '',
          preferences: c.preferences || ''
        };
      });
    }
  } catch {
    // Supabase error or table not yet created
  }

  await ensureDirectory();
  try {
    const raw = await fs.readFile(CLIENTS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function addClient(clientData: Omit<ClientDossier, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientDossier> {
  const parsed = parsePriceFields(clientData.budget, clientData.budgetCurrency, false);
  const budgetCurrency: Currency = clientData.budgetCurrency === 'MDL' ? 'MDL' : (clientData.budgetCurrency === 'EUR' ? 'EUR' : parsed.currency);
  const budgetAmount = typeof clientData.budgetAmount === 'number' && clientData.budgetAmount > 0
    ? clientData.budgetAmount
    : parsed.numericAmount;
  const expensesAmount = typeof clientData.expensesAmount === 'number' && clientData.expensesAmount > 0
    ? clientData.expensesAmount
    : 0;
  const budgetDisplay = budgetAmount > 0
    ? formatMoney(budgetAmount, budgetCurrency, 'ru')
    : (clientData.budget?.trim() || '');

  const newClient: ClientDossier = {
    id: `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: clientData.name.trim(),
    phone: clientData.phone.trim(),
    email: clientData.email?.trim() || '',
    eventDate: clientData.eventDate?.trim() || '',
    eventType: clientData.eventType?.trim() || '',
    budget: budgetDisplay,
    budgetAmount,
    budgetCurrency,
    expensesAmount,
    status: clientData.status || 'lead',
    tags: clientData.tags || [],
    notes: clientData.notes || '',
    preferences: clientData.preferences || ''
  };

  try {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        id: newClient.id,
        name: newClient.name,
        phone: newClient.phone,
        email: newClient.email,
        event_date: newClient.eventDate || null,
        event_type: newClient.eventType,
        budget: newClient.budget,
        budget_amount: newClient.budgetAmount,
        budget_currency: newClient.budgetCurrency,
        expenses_amount: newClient.expensesAmount,
        status: newClient.status,
        tags: newClient.tags,
        notes: newClient.notes,
        preferences: newClient.preferences
      })
      .select()
      .single();

    if (error) {
      // Fallback if clients table hasn't been migrated with financial columns yet
      const fallbackRes = await supabase
        .from('clients')
        .insert({
          id: newClient.id,
          name: newClient.name,
          phone: newClient.phone,
          email: newClient.email,
          event_date: newClient.eventDate || null,
          event_type: newClient.eventType,
          budget: newClient.budget,
          status: newClient.status,
          tags: newClient.tags,
          notes: newClient.notes,
          preferences: newClient.preferences
        })
        .select()
        .single();
      if (!fallbackRes.error && fallbackRes.data) {
        newClient.id = fallbackRes.data.id;
        newClient.createdAt = fallbackRes.data.created_at;
      }
    } else if (data) {
      newClient.id = data.id;
      newClient.createdAt = data.created_at;
    }
  } catch {
    // Local fallback
  }

  await ensureDirectory();
  const clients = await getClients();
  if (!clients.some(c => c.id === newClient.id)) {
    clients.unshift(newClient);
  }
  await fs.writeFile(CLIENTS_FILE, JSON.stringify(clients, null, 2), 'utf-8').catch(() => {});

  return newClient;
}

export async function updateClient(id: string, updates: Partial<ClientDossier>): Promise<ClientDossier | null> {
  const updatedAt = new Date().toISOString();
  const budgetCurrency: Currency | undefined = updates.budgetCurrency
    ? (updates.budgetCurrency === 'MDL' ? 'MDL' : 'EUR')
    : undefined;
  const budgetAmount = updates.budgetAmount !== undefined ? (Number(updates.budgetAmount) || 0) : undefined;
  const expensesAmount = updates.expensesAmount !== undefined ? (Number(updates.expensesAmount) || 0) : undefined;
  const budgetDisplay = budgetAmount !== undefined && budgetAmount > 0
    ? formatMoney(budgetAmount, budgetCurrency || 'EUR', 'ru')
    : updates.budget;

  try {
    const { error } = await supabase
      .from('clients')
      .update({
        ...(updates.name ? { name: updates.name.trim() } : {}),
        ...(updates.phone ? { phone: updates.phone.trim() } : {}),
        ...(updates.email !== undefined ? { email: updates.email.trim() } : {}),
        ...(updates.eventDate !== undefined ? { event_date: updates.eventDate || null } : {}),
        ...(updates.eventType !== undefined ? { event_type: updates.eventType } : {}),
        ...(budgetDisplay !== undefined ? { budget: budgetDisplay } : {}),
        ...(budgetAmount !== undefined ? { budget_amount: budgetAmount } : {}),
        ...(budgetCurrency !== undefined ? { budget_currency: budgetCurrency } : {}),
        ...(expensesAmount !== undefined ? { expenses_amount: expensesAmount } : {}),
        ...(updates.status ? { status: updates.status } : {}),
        ...(updates.tags ? { tags: updates.tags } : {}),
        ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
        ...(updates.preferences !== undefined ? { preferences: updates.preferences } : {}),
        updated_at: updatedAt
      })
      .eq('id', id);

    if (error && (budgetAmount !== undefined || budgetCurrency !== undefined || expensesAmount !== undefined)) {
      await supabase
        .from('clients')
        .update({
          ...(updates.name ? { name: updates.name.trim() } : {}),
          ...(updates.phone ? { phone: updates.phone.trim() } : {}),
          ...(updates.email !== undefined ? { email: updates.email.trim() } : {}),
          ...(updates.eventDate !== undefined ? { event_date: updates.eventDate || null } : {}),
          ...(updates.eventType !== undefined ? { event_type: updates.eventType } : {}),
          ...(budgetDisplay !== undefined ? { budget: budgetDisplay } : {}),
          ...(updates.status ? { status: updates.status } : {}),
          ...(updates.tags ? { tags: updates.tags } : {}),
          ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
          ...(updates.preferences !== undefined ? { preferences: updates.preferences } : {}),
          updated_at: updatedAt
        })
        .eq('id', id);
    }
  } catch {
    // Local fallback
  }

  await ensureDirectory();
  const clients = await getClients();
  const index = clients.findIndex(c => c.id === id);
  if (index !== -1) {
    clients[index] = {
      ...clients[index],
      ...updates,
      ...(budgetDisplay !== undefined ? { budget: budgetDisplay } : {}),
      ...(budgetAmount !== undefined ? { budgetAmount } : {}),
      ...(budgetCurrency !== undefined ? { budgetCurrency } : {}),
      ...(expensesAmount !== undefined ? { expensesAmount } : {}),
      updatedAt
    };
    await fs.writeFile(CLIENTS_FILE, JSON.stringify(clients, null, 2), 'utf-8').catch(() => {});
    return clients[index];
  }

  return null;
}

export async function deleteClient(id: string): Promise<boolean> {
  try {
    await supabase.from('clients').delete().eq('id', id);
  } catch {
    // Local fallback
  }

  await ensureDirectory();
  const clients = await getClients();
  const filtered = clients.filter(c => c.id !== id);
  await fs.writeFile(CLIENTS_FILE, JSON.stringify(filtered, null, 2), 'utf-8').catch(() => {});
  return true;
}

// --- PORTFOLIO (BASE64 & URL SUPPORT) ---
const DEFAULT_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'corporate',
    title: { ru: 'Корпоративные Мероприятия', ro: 'Evenimente Corporative', en: 'Corporate Events' },
    category: { ru: 'Корпоративы', ro: 'Corporate', en: 'Corporate' },
    image: 'https://static.tildacdn.com/tild3237-3161-4437-a361-383537333038/Screenshot_-_2025-10.png',
    order: 1,
    active: true,
  },
  {
    id: 'candybar',
    title: { ru: 'Кэнди Бары', ro: 'Candy Bars', en: 'Candy Bars' },
    category: { ru: 'Candy Bar', ro: 'Candy Bar', en: 'Candy Bar' },
    image: 'https://catering-muscat.ru/img/blog/blog_candy_6.jpg',
    order: 2,
    active: true,
  },
  {
    id: 'birthdays',
    title: { ru: 'Дни Рождения', ro: 'Zile de Naștere', en: 'Birthdays' },
    category: { ru: 'Частные события', ro: 'Privat', en: 'Private' },
    image: 'https://optim.tildacdn.com/tild3961-6363-4562-b862-356434613264/-/resize/824x/-/format/webp/DSC07101.jpg.webp',
    order: 3,
    active: true,
  },
  {
    id: 'decor',
    title: { ru: 'Эксклюзивный Декор', ro: 'Decor Exclusivist', en: 'Exclusive Decor' },
    category: { ru: 'Декор', ro: 'Decor', en: 'Decor' },
    image: 'https://img.freepik.com/free-photo/pink-chrysanthemums-hang-threads-from-ceiling-dinner-hall_1304-3325.jpg?semt=ais_related_payload_trends&w=740&q=80',
    order: 4,
    active: true,
  },
  {
    id: 'photozones',
    title: { ru: 'Эффектные Фотозоны', ro: 'Foto-zone Spectaculoase', en: 'Spectacular Photo Zones' },
    category: { ru: 'Инсталляции', ro: 'Instalații', en: 'Installations' },
    image: 'https://solaair.ru/upload/iblock/93b/i0dm3pdols5q3paylyrd4hmulhirxm82.JPG',
    order: 5,
    active: true,
  },
];

export async function getPortfolio(): Promise<PortfolioItem[]> {
  try {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('order_index', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((p: any) => ({
        id: p.id,
        title: {
          ru: p.title_ru || '',
          ro: p.title_ro || p.title_ru || '',
          en: p.title_en || p.title_ru || '',
        },
        category: {
          ru: p.category_ru || '',
          ro: p.category_ro || p.category_ru || '',
          en: p.category_en || p.category_ru || '',
        },
        image: p.image || '',
        order: p.order_index || 0,
        active: p.active !== false,
      }));
    }
  } catch {
    // Supabase table not ready, fallback to local file
  }

  await ensureDirectory();
  try {
    const raw = await fs.readFile(PORTFOLIO_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PORTFOLIO;
  } catch {
    await fs.writeFile(PORTFOLIO_FILE, JSON.stringify(DEFAULT_PORTFOLIO, null, 2), 'utf-8').catch(() => {});
    return DEFAULT_PORTFOLIO;
  }
}

export async function addPortfolioItem(item: Omit<PortfolioItem, 'id'>): Promise<PortfolioItem> {
  const newId = `port_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newItem: PortfolioItem = {
    id: newId,
    title: {
      ru: item.title.ru,
      ro: item.title.ro || item.title.ru,
      en: item.title.en || item.title.ru,
    },
    category: {
      ru: item.category.ru,
      ro: item.category.ro || item.category.ru,
      en: item.category.en || item.category.ru,
    },
    image: item.image,
    order: item.order || 0,
    active: item.active !== false,
  };

  try {
    await supabase.from('portfolio_items').insert({
      id: newId,
      title_ru: newItem.title.ru,
      title_ro: newItem.title.ro,
      title_en: newItem.title.en,
      category_ru: newItem.category.ru,
      category_ro: newItem.category.ro,
      category_en: newItem.category.en,
      image: newItem.image,
      order_index: newItem.order,
      active: newItem.active,
    });
  } catch {
    // Fallback to local
  }

  await ensureDirectory();
  const items = await getPortfolio();
  if (!items.some((p) => p.id === newItem.id)) {
    items.push(newItem);
  }
  await fs.writeFile(PORTFOLIO_FILE, JSON.stringify(items, null, 2), 'utf-8').catch(() => {});
  return newItem;
}

export async function updatePortfolioItem(
  id: string,
  updates: Partial<PortfolioItem>
): Promise<PortfolioItem | null> {
  try {
    await supabase
      .from('portfolio_items')
      .update({
        ...(updates.title?.ru !== undefined ? { title_ru: updates.title.ru } : {}),
        ...(updates.title?.ro !== undefined ? { title_ro: updates.title.ro } : {}),
        ...(updates.title?.en !== undefined ? { title_en: updates.title.en } : {}),
        ...(updates.category?.ru !== undefined ? { category_ru: updates.category.ru } : {}),
        ...(updates.category?.ro !== undefined ? { category_ro: updates.category.ro } : {}),
        ...(updates.category?.en !== undefined ? { category_en: updates.category.en } : {}),
        ...(updates.image !== undefined ? { image: updates.image } : {}),
        ...(updates.order !== undefined ? { order_index: updates.order } : {}),
        ...(updates.active !== undefined ? { active: updates.active } : {}),
      })
      .eq('id', id);
  } catch {
    // Fallback
  }

  await ensureDirectory();
  const items = await getPortfolio();
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  items[idx] = { ...items[idx], ...updates };
  await fs.writeFile(PORTFOLIO_FILE, JSON.stringify(items, null, 2), 'utf-8').catch(() => {});
  return items[idx];
}

export async function deletePortfolioItem(id: string): Promise<boolean> {
  try {
    await supabase.from('portfolio_items').delete().eq('id', id);
  } catch {
    // Fallback
  }

  await ensureDirectory();
  const items = await getPortfolio();
  const filtered = items.filter((p) => p.id !== id);
  await fs.writeFile(PORTFOLIO_FILE, JSON.stringify(filtered, null, 2), 'utf-8').catch(() => {});
  return true;
}

// --- ADMIN SESSION TOKENS ---
const SECRET_KEY = process.env.ADMIN_SECRET || 'lux_agency_secret_2026';

export function generateAdminToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`admin_session_${timestamp}`)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

export function verifyAdminToken(token?: string | null): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const timeNum = parseInt(timestamp, 10);
  if (isNaN(timeNum)) return false;

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - timeNum > SEVEN_DAYS_MS) return false;

  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`admin_session_${timestamp}`)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
