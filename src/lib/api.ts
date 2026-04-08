const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rafiqui-back.onrender.com';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode: number;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.message || 'Error en la solicitud',
        statusCode: response.status,
      };
    }

    return {
      data,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      error: 'Error de conexión con el servidor',
      statusCode: 500,
    };
  }
}

// Auth API
export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: 'DONOR' | 'COLLECTOR' | 'INSPECTOR' | 'REFURBISHER' | 'ARTIST' | 'BUYER' | 'ADMIN';
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// Collection Requests API
export interface PanelEntry {
  quantity: number;
  brand: string;
  model: string;
  catalogId?: string;
  isCustom: boolean;
  customBrand?: string;
  customModel?: string;
}

export interface CreateCollectionRequestDto {
  donorId?: string;
  pickupAddress: string;
  street: string;
  exteriorNumber: string;
  interiorNumber?: string;
  colonia: string;
  municipio: string;
  estado: string;
  city: string;
  postalCode: string;
  estimatedCount: number;
  panelType: 'residential' | 'industrial';
  panels: PanelEntry[];
  partnerId?: string;
  wantsToBePartner?: boolean;
  contactName: string;
  contactPhone: string;
  notes?: string;
}

export interface CollectionRequestPanel {
  id: string;
  quantity: number;
  brand: string;
  model: string;
  isCustom: boolean;
}

export interface CollectionRequest {
  id: string;
  pickupAddress: string;
  estimatedCount: number;
  status: string;
  createdAt: string;
  contactName?: string;
  contactPhone?: string;
  wantsToBePartner?: boolean;
  partnerId?: string;
  panelType?: 'residential' | 'industrial';
  panels?: CollectionRequestPanel[];
  partner?: {
    id: string;
    name: string;
  };
  donor?: {
    id: string;
    name: string;
    email: string;
  };
}

export const collectionRequestsApi = {
  create: (data: CreateCollectionRequestDto) =>
    apiRequest<CollectionRequest>('/collection-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: (id: string, token?: string) =>
    apiRequest<CollectionRequest>(`/collection-requests/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  getAll: (token?: string) =>
    apiRequest<CollectionRequest[]>('/collection-requests', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  updateStatus: (id: string, status: string, token: string) =>
    apiRequest<CollectionRequest>(`/collection-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// Solar Panel Catalog API
export interface SolarPanelModel {
  id: string;
  model: string;
  technology: string;
  powerWp: number;
  efficiencyPercent: number;
  application: string;
}

export interface SolarPanelCatalog extends SolarPanelModel {
  brand: string;
  vocV: number | null;
  iscA: number | null;
  vmppV: number | null;
  imppA: number | null;
  lengthMm: number | null;
  widthMm: number | null;
  thicknessMm: number | null;
  weightKg: number | null;
  cellCount: number | null;
  tempCoefPmax: number | null;
  operatingTempMin: number | null;
  operatingTempMax: number | null;
  productWarrantyYears: number | null;
  performanceWarrantyYears: number | null;
  performanceWarrantyPercent: number | null;
  fireClass: string | null;
  certifications: string | null;
  country: string;
  tier: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const solarPanelCatalogApi = {
  getBrands: () =>
    apiRequest<string[]>('/solar-panels/brands'),

  getModelsByBrand: (brand: string) =>
    apiRequest<SolarPanelModel[]>(`/solar-panels/models/${encodeURIComponent(brand)}`),

  getAll: () =>
    apiRequest<SolarPanelCatalog[]>('/solar-panels'),

  getById: (id: string) =>
    apiRequest<SolarPanelCatalog>(`/solar-panels/${id}`),
};

// Partners API
export interface Partner {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  website: string | null;
  logoUrl: string | null;
  description: string | null;
  isActive: boolean;
}

export const partnersApi = {
  getAll: () =>
    apiRequest<Partner[]>('/partners'),
};

// Market API Types
export interface MarketAsset {
  id: string;
  nfcTagId: string;
  brand: string;
  model: string;
  status: string;
  inspectionResult: string;
  measuredVoltage: number;
  measuredAmps: number;
  photoUrl: string;
  createdAt: string;
}

export interface MaterialStock {
  type: string;
  name: string;
  totalKg: number;
  availableKg: number;
  pricePerKg: number;
}

export interface BackendArtPiece {
  id: string;
  title: string;
  artist: string;
  description: string;
  price: number;
  currency: string;
  category: 'NFT' | 'SCULPTURE' | 'INSTALLATION';
  imageUrl: string | null;
  isAvailable: boolean;
  tokenId: string | null;
  sourceAssetId: string | null;
  createdAt: string;
}

// Market API
export const marketApi = {
  getAssets: () =>
    apiRequest<MarketAsset[]>('/statistics/market/assets'),

  getMaterials: () =>
    apiRequest<MaterialStock[]>('/recycle/materials'),

  getArt: () =>
    apiRequest<BackendArtPiece[]>('/statistics/market/art'),
};

// Statistics API Types
export interface ESGMetrics {
  co2Saved: number;
  treesEquivalent: number;
  energySaved: number;
  waterSaved: number;
  panelsRecycled: number;
  panelsReused: number;
  panelsRecycledMaterial: number;
}

export interface MonthlyData {
  month: string;
  co2: number;
  panels: number;
  energy: number;
}

export interface MaterialDistribution {
  name: string;
  value: number;
  color: string;
}

export interface DashboardStats {
  esgMetrics: ESGMetrics;
  monthlyData: MonthlyData[];
  materialDistribution: MaterialDistribution[];
}

export interface CollectionStats {
  total: number;
  pending: number;
  completed: number;
  inProgress: number;
}

// Statistics API
export const statisticsApi = {
  getDashboard: () =>
    apiRequest<DashboardStats>('/statistics/dashboard'),

  getESGMetrics: () =>
    apiRequest<ESGMetrics>('/statistics/esg'),

  getMonthlyData: () =>
    apiRequest<MonthlyData[]>('/statistics/monthly'),

  getMaterialDistribution: () =>
    apiRequest<MaterialDistribution[]>('/statistics/materials'),

  getCollectionStats: () =>
    apiRequest<CollectionStats>('/statistics/collections'),
};

export interface MarketplaceGroup {
  groupId: string;
  brand: string;
  model: string;
  powerRange: string;
  avgPower: number;
  avgVoltage: number;
  healthGrade: 'A' | 'B' | 'C';
  avgHealthPercentage: number;
  dimensions: string;
  availableCount: number;
  panelIds: string[];
  suggestedPrice?: number;
  imageUrl?: string;
}

export interface MarketplaceFiltersParams {
  brands?: string;
  minPower?: number;
  maxPower?: number;
  powerRange?: 'LOW' | 'MEDIUM' | 'HIGH';
  healthGrade?: 'A' | 'B' | 'C';
  page?: number;
  limit?: number;
}

export interface MarketplaceResponse {
  groups: MarketplaceGroup[];
  totalPanels: number;
  totalGroups: number;
  page: number;
  limit: number;
  totalPages: number;
  availableFilters: {
    brands: string[];
    powerRanges: { min: number; max: number };
    voltageRanges: { min: number; max: number };
    healthGrades: ('A' | 'B' | 'C')[];
  };
}

export const marketplaceApi = {
  getGroups: (filters?: MarketplaceFiltersParams) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return apiRequest<MarketplaceResponse>(`/marketplace/listings${queryString ? `?${queryString}` : ''}`);
  },

  getFilters: () =>
    apiRequest<MarketplaceResponse['availableFilters']>('/marketplace/filters'),

  getStats: () =>
    apiRequest<{
      totalPanels: number;
      totalPower: number;
      avgHealthPercentage: number;
      byGrade: { grade: string; count: number }[];
      byBrand: { brand: string; count: number }[];
    }>('/marketplace/stats'),
};

// Materials Marketplace API
export interface MaterialAvailability {
  type: string;
  name: string;
  availableKg: number;
  availableTokens: number;
  pricePerKg: number;
  totalValue: number;
}

export enum MaterialDestination {
  MANUFACTURING = 'MANUFACTURING',
  CONSTRUCTION = 'CONSTRUCTION',
  RESEARCH = 'RESEARCH',
  RECYCLING_CENTER = 'RECYCLING_CENTER',
  OTHER = 'OTHER',
}

export const MaterialDestinationLabels: Record<MaterialDestination, string> = {
  [MaterialDestination.MANUFACTURING]: 'Manufactura Industrial',
  [MaterialDestination.CONSTRUCTION]: 'Construcción',
  [MaterialDestination.RESEARCH]: 'Investigación',
  [MaterialDestination.RECYCLING_CENTER]: 'Centro de Reciclaje',
  [MaterialDestination.OTHER]: 'Otro',
};

export interface CreateMaterialOrder {
  buyerId: string;
  materialType: string;
  quantityKg: number;
  buyerWallet: string;
  destination: MaterialDestination;
  destinationNotes?: string;
}

export interface MaterialOrderResponse {
  success: boolean;
  message: string;
  order: {
    id: string;
    materialType: string;
    quantityKg: number;
    totalPrice: number;
    status: string;
    blockchainTxHash: string | null;
    tokensTransferred: number;
  };
}

export const materialsMarketplaceApi = {
  getAvailability: () =>
    apiRequest<MaterialAvailability[]>('/marketplace/materials/availability'),

  createOrder: (data: CreateMaterialOrder) =>
    apiRequest<MaterialOrderResponse>('/marketplace/materials/order', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getOrdersByBuyer: (buyerId: string) =>
    apiRequest<any[]>(`/marketplace/materials/orders/buyer/${buyerId}`),

  getOrderById: (orderId: string) =>
    apiRequest<any>(`/marketplace/materials/orders/${orderId}`),
};

// Panels Marketplace API
export enum PanelPurchaseDestination {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  RESEARCH = 'RESEARCH',
  RESALE = 'RESALE',
  OTHER = 'OTHER',
}

export const PanelDestinationLabels: Record<PanelPurchaseDestination, string> = {
  [PanelPurchaseDestination.RESIDENTIAL]: 'Uso Residencial',
  [PanelPurchaseDestination.COMMERCIAL]: 'Uso Comercial',
  [PanelPurchaseDestination.INDUSTRIAL]: 'Uso Industrial',
  [PanelPurchaseDestination.RESEARCH]: 'Investigación',
  [PanelPurchaseDestination.RESALE]: 'Reventa',
  [PanelPurchaseDestination.OTHER]: 'Otro',
};

export interface CreatePanelOrder {
  assetId: string;
  buyerWallet: string;
  destination: PanelPurchaseDestination;
  destinationNotes?: string;
  buyerId?: string;
}

export interface PanelOrderResponse {
  success: boolean;
  message: string;
  order: {
    id: string;
    assetId: string;
    tokenId: string;
    price: number;
    blockchainTxHash: string | null;
  };
}

export const panelsMarketplaceApi = {
  getAvailablePanels: () =>
    apiRequest<any[]>('/marketplace/panels/available'),

  purchasePanel: (data: CreatePanelOrder) =>
    apiRequest<PanelOrderResponse>('/marketplace/panels/purchase', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPanelDetails: (assetId: string) =>
    apiRequest<any>(`/marketplace/panels/${assetId}`),

  getOrderHistory: (buyerId?: string) =>
    apiRequest<any[]>(`/marketplace/panels/orders${buyerId ? `?buyerId=${buyerId}` : ''}`),

  getStats: () =>
    apiRequest<any>('/marketplace/panels/stats'),
};

// Art Marketplace API
export interface CreateArtOrder {
  artPieceId: string;
  buyerWallet: string;
  buyerId?: string;
  messageToArtist?: string;
}

export interface ArtOrderResponse {
  success: boolean;
  message: string;
  order: {
    id: string;
    artPieceId: string;
    tokenId: string;
    title: string;
    artist: string;
    price: number;
    blockchainTxHash: string | null;
  };
}

export const artMarketplaceApi = {
  getAvailableArt: () =>
    apiRequest<any[]>('/marketplace/art/available'),

  purchaseArt: (data: CreateArtOrder) =>
    apiRequest<ArtOrderResponse>('/marketplace/art/purchase', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getArtDetails: (artPieceId: string) =>
    apiRequest<any>(`/marketplace/art/${artPieceId}`),

  getOrderHistory: (buyerId?: string) =>
    apiRequest<any[]>(`/marketplace/art/orders${buyerId ? `?buyerId=${buyerId}` : ''}`),

  getStats: () =>
    apiRequest<any>('/marketplace/art/stats'),
};

// Dashboard API
export interface DashboardMetrics {
  co2Saved: {
    value: number;
    unit: string;
    breakdown: {
      fromEnergy: number;
      fromRecycling: number;
    };
  };
  treesEquivalent: {
    value: number;
    description: string;
  };
  energyRecovered: {
    value: number;
    unit: string;
    homesPerYear: number;
  };
  waterSaved: {
    value: number;
    unit: string;
    breakdown: {
      fromEnergy: number;
      fromRecycling: number;
    };
  };
  panelsProcessed: {
    total: number;
    reused: number;
    recycled: number;
    art: number;
  };
}

// Dashboard Charts API
export interface ChartDataPoint {
  month: string;
  value: number;
}

export interface MaterialDistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface DashboardCharts {
  co2ByMonth: ChartDataPoint[];
  materialDistribution: MaterialDistributionItem[];
  panelsByMonth: ChartDataPoint[];
  energyByMonth: ChartDataPoint[];
}

export const dashboardApi = {
  getMetrics: () =>
    apiRequest<DashboardMetrics>('/dashboard/metrics'),
  
  getCharts: () =>
    apiRequest<DashboardCharts>('/dashboard/charts'),
};

// Certificate API Response Type
interface CertificateResponse {
  certificateId: string;
  issuedAt: string;
  partnerName: string;
  pdfBase64: string;
  fileSizeBytes: number;
}

// Full Report API Response Type
interface FullReportResponse {
  reportId: string;
  generatedAt: string;
  pdfBase64: string;
  fileSizeBytes: number;
  pageCount: number;
}

// Certificate API
export const certificateApi = {
  downloadESGCertificate: async (userId?: string): Promise<void> => {
    try {
      const params = userId ? `?userId=${userId}` : '';
      const response = await fetch(`${API_BASE_URL}/dashboard/esg-certificate${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al generar el certificado');
      }

      const data: CertificateResponse = await response.json();
      
      // Convert base64 to blob
      const byteCharacters = atob(data.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificado-esg-rafiqui-${new Date().toISOString().split('T')[0]}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      throw error;
    }
  },

  downloadFullReport: async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/full-report`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al generar el reporte');
      }

      const data: FullReportResponse = await response.json();
      
      // Convert base64 to blob
      const byteCharacters = atob(data.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-esg-completo-rafiqui-${new Date().toISOString().split('T')[0]}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading full report:', error);
      throw error;
    }
  },
};
