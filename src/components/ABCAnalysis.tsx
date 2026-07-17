/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChevronRight } from 'lucide-react';
import { MergedPartData } from '../types';

export function ABCAnalysis({ data }: { data: MergedPartData[] }) {
  const abcStats = React.useMemo(() => {
    const counts = { A: 0, B: 0, C: 0 };
    
    data.forEach(p => {
      counts[p.abcClass]++;
    });

    return [
      { name: 'Class A', value: counts.A, color: '#f97316', description: 'Long-lead / 고가 부품' },
      { name: 'Class B', value: counts.B, color: '#fb923c', description: '중단기 소요 부품' },
      { name: 'Class C', value: counts.C, color: '#fdba74', description: '일반 재고 부품' },
    ];
  }, [data]);

  const leadTimeStats = React.useMemo(() => {
    const ranges = [
      { name: '30일 이하', count: 0 },
      { name: '31-90일', count: 0 },
      { name: '91-180일', count: 0 },
      { name: '180일 이상', count: 0 },
    ];

    data.forEach(p => {
      if (p.leadTimeDays <= 30) ranges[0].count++;
      else if (p.leadTimeDays <= 90) ranges[1].count++;
      else if (p.leadTimeDays <= 180) ranges[2].count++;
      else ranges[3].count++;
    });

    return ranges;
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ABC Distribution */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold mb-6 flex items-center">
          <div className="w-1 h-4 bg-orange-500 mr-2 rounded-full"></div>
          ABC 자재 분석 (수량 기준)
        </h3>
        <div className="flex flex-col items-center gap-6">
          <div className="w-32 h-32 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={abcStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {abcStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-lg font-bold text-slate-900">{Math.round((abcStats[0].value / (data.length || 1)) * 100)}%</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Class A</span>
            </div>
          </div>
          <div className="w-full space-y-3">
            {abcStats.map((stat) => (
              <div key={stat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: stat.color }} />
                  <span className="text-xs text-slate-500 font-medium">{stat.name} ({stat.description})</span>
                </div>
                <span className="text-xs font-bold text-slate-900">{stat.value}개</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Time Monitoring */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold mb-6 flex items-center">
          <div className="w-1 h-4 bg-slate-300 mr-2 rounded-full"></div>
          부품별 리드타임(Lead-time) 분포
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leadTimeStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={10} 
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
                cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-slate-400 border-t border-slate-50 pt-4">
          <span>집중 관리 대상: {data.filter(p => p.leadTimeDays > 90).length}개 품목 (90일 초과)</span>
          <span className="text-orange-500 hover:underline cursor-pointer flex items-center gap-1">상세 보기 <ChevronRight size={12} /></span>
        </div>
      </div>
    </div>
  );
}
