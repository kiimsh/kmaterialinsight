/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, Calendar, Info, CheckCircle2 } from 'lucide-react';
import { MergedPartData } from '../types';
import { calculateELAlert, cn } from '../lib/utils';
import { format, parseISO } from 'date-fns';

export function ELManagement({ data }: { data: MergedPartData[] }) {
  const elItems = React.useMemo(() => data.filter(d => d.elInfo), [data]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between border-b border-slate-100 pb-6">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <div className="w-1 h-4 bg-red-500 mr-1 rounded-full"></div>
              수출통제(EL) 준수 갱신 일정
            </h3>
            <p className="text-slate-500 text-xs mt-1">방산 수출 허가(EL) 대상 부품의 갱신 일정을 모니터링합니다.</p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold uppercase tracking-wider">
            위험 지표 산식: 만료일 - (감사 기간 + 버퍼)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {elItems.map((item) => {
            if (!item.elInfo) return null;
            const { alert, daysRemaining, deadlineDate } = calculateELAlert(item.elInfo);
            const progress = Math.max(0, Math.min(100, 100 - (daysRemaining / 90) * 100));
            
            return (
              <div 
                key={item.partNumber}
                className={cn(
                  "p-5 rounded-xl border transition-all hover:shadow-md group",
                  alert ? "bg-red-50/30 border-red-200" : "bg-white border-slate-200"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">부품 번호</p>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{item.partNumber}</p>
                  </div>
                  {alert ? (
                    <span className="text-[9px] font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded uppercase">즉시 갱신</span>
                  ) : (
                    <span className="text-[9px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded uppercase">안전</span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">컴플라이언스 타임라인</span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase",
                        alert ? "text-red-600" : "text-orange-500"
                      )}>
                        {daysRemaining}일 남음
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-1000", alert ? "bg-red-500" : "bg-orange-500")}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[8px] text-slate-400 uppercase tracking-tighter font-bold">
                      <span>신청</span>
                      <span>심사</span>
                      <span>만료</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">갱신 마지노선</p>
                      <p className={cn("text-xs font-bold", alert ? "text-red-600" : "text-slate-700")}>
                        {format(deadlineDate, 'yyyy-MM-dd')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 uppercase font-bold">라이선스 만료일</p>
                      <p className="text-xs font-bold text-slate-700">
                        {format(parseISO(item.elInfo.expiryDate), 'yyyy-MM-dd')}
                      </p>
                    </div>
                  </div>
                </div>

                {alert && (
                  <button className="mt-5 w-full py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase rounded transition-colors shadow-sm shadow-red-900/20">
                    갱신 프로세스 시작
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {elItems.length === 0 && (
          <div className="text-center py-24 text-slate-300">
            <ShieldAlert size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm font-medium">현재 데이터셋에 EL 관리 품목이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
