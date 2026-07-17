/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MaterialMaster {
  partNumber: string;
  description: string;
  abcClass: 'A' | 'B' | 'C';
  unitPrice: number;
  leadTimeDays: number;
  isELControlled: boolean;
}

export interface InventoryStatus {
  partNumber: string;
  currentStock: number;
  safetyStock: number;
  location: string;
}

export interface PurchaseStatus {
  partNumber: string;
  purchaseOrderNumber: string;
  quantity: number;
  expectedDeliveryDate: string; // ISO string
  status: 'Pending' | 'In Transit' | 'Delayed';
}

export interface ExportLicense {
  partNumber: string;
  licenseNumber: string;
  expiryDate: string; // ISO string
  auditDurationDays: number;
  adminBufferDays: number;
}

export interface MergedPartData extends MaterialMaster {
  currentStock: number;
  safetyStock: number;
  pendingOrders: PurchaseStatus[];
  elInfo?: ExportLicense;
  stockStatus: 'Critical' | 'Warning' | 'Stable';
  daysToStockout?: number;
}

export interface ForecastData {
  date: string;
  projectedStock: number;
  safetyStock: number;
}
