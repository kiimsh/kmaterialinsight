/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Clock, MoreHorizontal } from 'lucide-react';
import { MergedPartData } from '../types';
import { cn } from '../lib/utils';

export function InventoryStatusTable({ data }: { data: MergedPartData[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-sm font-bold">중점 관리 대상 부품 (Long-lead)</h3>
        <div className="flex space-x-2">
          <span className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-500">리드타임순 정렬</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 bg-white">
              <th className="px-6 py-3">부품 번호 / 품명</th>
              <th className="px-6 py-3">ABC 등급</th>
              <th className="px-6 py-3">리드타임</th>
              <th className="px-6 py-3 text-right">현재 재고</th>
              <th className="px-6 py-3">수급 위험도</th>
              <th className="px-6 py-3">작업</th>
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-slate-100">
            {data.map((item) => (
              <tr key={item.partNumber} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-3 font-medium text-slate-700">
                  <span className="font-bold text-orange-600 block mb-0.5">{item.partNumber}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{item.description}</span>
                </td>
                <td className="px-6 py-3">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full font-bold",
                    item.abcClass === 'A' ? "bg-orange-50 text-orange-700" :
                    item.abcClass === 'B' ? "bg-amber-50 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  )}>
                    {item.abcClass}
                  </span>
                </td>
                <td className="px-6 py-3 text-slate-600">
                  {item.leadTimeDays}일
                </td>
                <td className={cn(
                  "px-6 py-3 text-right font-bold",
                  item.stockStatus === 'Critical' ? "text-red-600" : 
                  item.stockStatus === 'Warning' ? "text-orange-600" : 
                  "text-green-600"
                )}>
                  {item.currentStock.toLocaleString()} EA
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.stockStatus} />
                  </div>
                </td>
                <td className="px-6 py-3">
                  <button className="text-orange-600 font-bold hover:underline transition-all">구매요청(PR)</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="p-12 text-center text-slate-400 italic text-sm">
          표시할 재고 데이터가 없습니다.
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: 'Critical' | 'Warning' | 'Stable' }) {
  const styles = {
    Critical: "text-red-500 font-medium",
    Warning: "text-orange-500 font-medium",
    Stable: "text-green-600 font-medium",
  };

  const labels = {
    Critical: "재고 부족 (위험)",
    Warning: "안전재고 하회",
    Stable: "정상",
  };

  return (
    <span className={styles[status]}>
      {labels[status]}
    </span>
  );
}
