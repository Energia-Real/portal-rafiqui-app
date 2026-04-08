export type UserRole = 'GUEST' | 'DONOR' | 'COLLECTOR' | 'INSPECTOR' | 'REFURBISHER' | 'ARTIST' | 'BUYER' | 'ADMIN' | 'PARTNER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CollectionRequest {
  id: string;
  address: string;
  panelCount: number;
  type: 'residential' | 'industrial';
  status: 'pending' | 'approved' | 'collected' | 'processed';
  createdAt: Date;
}

export interface Material {
  id: string;
  name: string;
  type: 'aluminum' | 'glass' | 'silicon' | 'copper';
  quantity: number; // Toneladas
  pricePerTon: number;
  available: boolean;
  image: string;
}

export interface ArtPiece {
  id: string;
  title: string;
  artist: string;
  description: string;
  price: number;
  image: string;
  category: 'nft' | 'sculpture' | 'installation';
  isAvailable: boolean;
}

export interface ESGMetrics {
  co2Saved: number; // kg
  treesEquivalent: number;
  energySaved: number; // kWh
  waterSaved: number; // Litros
  panelsRecycled: number;
}

export interface AIStory {
  id: string;
  title: string;
  content: string;
  generatedAt: Date;
  panelOrigin: string;
}
