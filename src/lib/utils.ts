/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as XLSX from 'xlsx';
import { addDays, differenceInDays, parseISO } from 'date-fns';
import { MergedPartData, MaterialMaster, InventoryStatus, PurchaseStatus, ExportLicense } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function parseExcelFile<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as T[];
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function mergeDatasets(
  masters: any[],
  inventories: any[],
  purchases: any[],
  licenses: any[]
): MergedPartData[] {
  // Mapping logic assuming Excel headers match or are handled
  // In a real app, we'd have header mapping UI
  const masterMap = new Map<string, MaterialMaster>();
  masters.forEach(m => {
    const pn = String(m['Part Number'] || m.partNumber || '');
    if (pn) {
      masterMap.set(pn, {
        partNumber: pn,
        description: String(m['Description'] || m.description || 'N/A'),
        abcClass: (m['ABC'] || m.abcClass || 'C') as 'A' | 'B' | 'C',
        unitPrice: Number(m['Price'] || m.unitPrice || 0),
        leadTimeDays: Number(m['Lead Time'] || m.leadTimeDays || 30),
        isELControlled: !!(m['EL'] || m.isELControlled),
      });
    }
  });

  const merged: MergedPartData[] = [];

  masterMap.forEach((master, pn) => {
    const inv = inventories.find(i => String(i['Part Number'] || i.partNumber) === pn);
    const purs = purchases.filter(p => String(p['Part Number'] || p.partNumber) === pn);
    const lic = licenses.find(l => String(l['Part Number'] || l.partNumber) === pn);

    const currentStock = Number(inv?.['Stock'] || inv?.currentStock || 0);
    const safetyStock = Number(inv?.['Safety Stock'] || inv?.safetyStock || 0);

    let stockStatus: 'Critical' | 'Warning' | 'Stable' = 'Stable';
    if (currentStock <= safetyStock * 0.5) {
      stockStatus = 'Critical';
    } else if (currentStock <= safetyStock) {
      stockStatus = 'Warning';
    }

    merged.push({
      ...master,
      currentStock,
      safetyStock,
      pendingOrders: purs.map(p => ({
        partNumber: pn,
        purchaseOrderNumber: String(p['PO'] || p.purchaseOrderNumber || 'N/A'),
        quantity: Number(p['Quantity'] || p.quantity || 0),
        expectedDeliveryDate: String(p['Delivery Date'] || p.expectedDeliveryDate || ''),
        status: (p['Status'] || p.status || 'Pending') as any,
      })),
      elInfo: lic ? {
        partNumber: pn,
        licenseNumber: String(lic['License No'] || lic.licenseNumber || ''),
        expiryDate: String(lic['Expiry Date'] || lic.expiryDate || ''),
        auditDurationDays: Number(lic['Audit Days'] || lic.auditDurationDays || 60),
        adminBufferDays: Number(lic['Buffer Days'] || lic.adminBufferDays || 14),
      } : undefined,
      stockStatus,
    });
  });

  return merged;
}

export function calculateELAlert(license: ExportLicense): { alert: boolean; daysRemaining: number; deadlineDate: Date } {
  const expiry = parseISO(license.expiryDate);
  const today = new Date();
  const leadTime = license.auditDurationDays + license.adminBufferDays;
  const deadlineDate = addDays(expiry, -leadTime);
  const daysRemaining = differenceInDays(deadlineDate, today);

  return {
    alert: daysRemaining <= 30, // Alert if within 30 days of the renewal deadline
    daysRemaining,
    deadlineDate,
  };
}

// Simple Moving Average Forecast for MVP
export function generateForecast(
  currentStock: number,
  safetyStock: number,
  avgDailyDemand: number,
  pendingOrders: PurchaseStatus[]
): { date: string; projectedStock: number; safetyStock: number }[] {
  const forecast = [];
  let runningStock = currentStock;
  const today = new Date();

  for (let i = 0; i < 90; i++) { // 90 days forecast
    const forecastDate = addDays(today, i);
    const dateStr = forecastDate.toISOString().split('T')[0];
    
    // Deduct demand
    runningStock -= avgDailyDemand;

    // Add incoming orders
    pendingOrders.forEach(po => {
      if (po.expectedDeliveryDate === dateStr) {
        runningStock += po.quantity;
      }
    });

    forecast.push({
      date: dateStr,
      projectedStock: Math.max(0, Math.round(runningStock)),
      safetyStock,
    });
  }

  return forecast;
}
