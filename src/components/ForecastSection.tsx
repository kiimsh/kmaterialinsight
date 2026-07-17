/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown, AlertCircle, ShoppingCart, ArrowRight } from 'lucide-react';
import { MergedPartData } from '../types';
import { generateForecast, cn } from '../lib/utils';
import { format, parseISO } from 'date-fns';

export function ForecastSection({ data }: { data: MergedPartData[] }) {
  const [selectedPart, setSelectedPart] = useState<MergedPartData | null>(data[0] || null);
  const [avgDemand, setAvgDemand] = useState(5); 

  const forecastData = React.useMemo(() => {
    if (!selectedPart) return [];
    return generateForecast(selectedPart.currentStock, selectedPart.safetyStock, avgDemand, selectedPart.pendingOrders);
  }, [selectedPart, avgDemand]);

  const stockoutInfo = React.useMemo(() => {
    const stockout = forecastData.find(d => d.projectedStock <= d.safetyStock);
    if (!stockout) return null;
    return {
      date: stockout.date,
      daysRemaining: forecastData.indexOf(stockout)
    };
  }, [forecastData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Selector Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 h-[600px] flex flex-col shadow-sm">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-orange-500 mr-1 rounded-full"></div>
            핵심 관리 품목 선택
          </h3>
          <p className="text-[10px] text-slate-400 mb-6 uppercase tracking-widest font-bold">Class A & B 집중 모니터링</p>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
            {data.filter(d => d.abcClass === 'A' || d.abcClass === 'B').map((item) => (
              <button
                key={item.partNumber}
                onClick={() => setSelectedPart(item)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all group",
                  selectedPart?.partNumber === item.partNumber 
                    ? "bg-slate-900 border-slate-800 text-white shadow-md" 
                    : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={cn(
                    "font-bold text-[10px] uppercase tracking-tighter",
                    selectedPart?.partNumber === item.partNumber ? "text-orange-400" : "text-orange-600"
                  )}>
                    {item.partNumber}
                  </span>
                  <span className={cn(
                    "text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase",
                    selectedPart?.partNumber === item.partNumber 
                      ? "bg-white/10 text-white" 
                      : "bg-slate-100 text-slate-500"
                  )}>
                    등급 {item.abcClass}
                  </span>
                </div>
                <p className={cn(
                  "text-[10px] truncate font-medium",
                  selectedPart?.partNumber === item.partNumber ? "text-slate-400" : "text-slate-400"
                )}>
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Forecast Detail Area */}
      <div className="lg:col-span-2 space-y-6">
        {selectedPart ? (
          <>
            {/* Strategy Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-8 flex items-start justify-between shadow-sm">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">수급 시뮬레이션</h4>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">{selectedPart.partNumber}</h2>
                
                <div className="flex items-center gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">현재 재고</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedPart.currentStock}</p>
                  </div>
                  <div className="space-y-1 border-l border-slate-100 pl-8">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">안전 재고</p>
                    <p className="text-2xl font-bold text-slate-300">{selectedPart.safetyStock}</p>
                  </div>
                  <div className="space-y-1 border-l border-slate-100 pl-8">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">일일 평균 수요</p>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={avgDemand} 
                        onChange={(e) => setAvgDemand(Number(e.target.value))}
                        className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-orange-600 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                      <span className="text-[10px] font-bold text-slate-400">개/일</span>
                    </div>
                  </div>
                </div>
              </div>

              {stockoutInfo && (
                <div className="p-6 rounded-xl bg-orange-50 border border-orange-100 text-right">
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-2">발주 권고 (AI 추천)</p>
                  <p className="text-sm text-slate-600 font-medium">
                    재고 소진 예상일: <span className="text-orange-600 font-bold">{format(parseISO(stockoutInfo.date), 'yyyy년 MM월 dd일')}</span>
                  </p>
                  <div className="mt-4 flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <ShoppingCart size={16} className="text-orange-600" />
                      <span>{Math.max(0, stockoutInfo.daysRemaining - selectedPart.leadTimeDays)}일 내 구매요청(PR) 필요</span>
                    </div>
                    <p className="text-[10px] text-slate-400">리드타임 반영: {selectedPart.leadTimeDays}일</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chart Area */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-[400px] shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickFormatter={(str) => format(parseISO(str), 'MM/dd')}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <ReferenceLine y={selectedPart.safetyStock} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Safety', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                  <Area 
                    type="monotone" 
                    dataKey="projectedStock" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorStock)" 
                    name="예상 재고 추이"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-white border border-slate-200 border-dashed rounded-xl text-slate-400 shadow-sm">
            <TrendingDown size={48} className="mb-4 opacity-10" />
            <p className="text-sm font-medium">분석할 부품을 왼쪽 리스트에서 선택하십시오.</p>
          </div>
        )}
      </div>
    </div>
  );
}
