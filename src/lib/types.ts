/** Domain model types shared across the app. Mirrors the Firestore schema. */

export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric' | 'Plug-in Hybrid';
export type Transmission = 'Automatic' | 'Manual';
export type BodyType = 'Hatchback' | 'Saloon' | 'SUV' | 'Estate' | 'Coupe' | 'MPV' | 'Convertible' | 'Van';
export type ImportOrigin = 'UK' | 'Japan' | 'Irish';
export type VehicleStatus = 'available' | 'reserved' | 'sold';

export interface VehicleImage {
  /** Storage path in Firebase Storage (not a full URL). */
  storagePath: string;
  /** Public download URL (cached after first resolve). */
  url: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Vehicle {
  id: string;
  slug: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  price: number; // EUR
  weeklyPrice: number | null; // EUR/week, optional
  mileageKm: number;
  fuelType: FuelType;
  transmission: Transmission;
  engineSize: string; // e.g. "1.8L"
  bodyType: BodyType;
  doors: number;
  seats: number;
  colour: string;
  previousOwners: number;
  nctExpiry: string | null; // ISO date or null
  taxBand: string;
  importOrigin: ImportOrigin;
  stockRef: string;
  description: string;
  status: VehicleStatus;
  featured: boolean;
  images: VehicleImage[];
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

export type EnquiryType = 'general' | 'vehicle' | 'valuation' | 'sourcing' | 'finance';

export interface Enquiry {
  id: string;
  vehicleId: string | null;
  type: EnquiryType;
  name: string;
  email: string;
  phone: string;
  message: string;
  /** Type-specific extra fields (valuation reg, sourcing budget, etc.). */
  payload: Record<string, unknown>;
  isRead: boolean;
  isActioned: boolean;
  createdAt: number;
}

export interface SiteSettings {
  phoneDisplay: string;
  phoneTel: string;
  whatsapp: string;
  email: string;
  facebookUrl: string;
  tiktokUrl: string;
  addressLine1: string;
  addressLine2: string;
  eircode: string;
  openingHours: { day: string; hours: string }[];
  heroImageUrl: string;
  updatedAt: number;
}

export interface Review {
  author: string;
  rating: number; // 1-5
  text: string;
  date: string; // ISO
  source: 'google' | 'facebook' | 'manual';
}
