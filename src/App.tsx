/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Package, 
  TrendingDown, 
  FileUp, 
  LayoutDashboard, 
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { MergedPartData } from './types';
import { mergeDatasets, parseExcelFile, cn } from './lib/utils';
import { ABCAnalysis } from './components/ABCAnalysis';
import { InventoryStatusTable } from './components/InventoryStatusTable';
import { ELManagement } from './components/ELManagement';
import { ForecastSection } from './components/ForecastSection';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'el' | 'forecast'>('dashboard');
  const [isUploading, setIsUploading] = useState(false);
  const [data, setData] = useState<MergedPartData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const results = await Promise.all(Array.from(files).map((f: File) => parseExcelFile<any>(f)));
      const merged = mergeDatasets(results[0] || [], results[1] || [], results[2] || [], results[3] || []);
      setData(merged);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(p => 
      p.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: data.length,
      critical: data.filter(d => d.stockStatus === 'Critical').length,
      elPending: data.filter(d => d.elInfo).length,
      classA: data.filter(d => d.abcClass === 'A').length,
    };
  }, [data]);

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            K-Material <span className="text-orange-400">Insight</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">방산 부품 수급 관리 시스템 v1.0</p>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-6">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">모니터링</p>
            <div className="space-y-1">
              <NavButton 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')} 
                icon={<LayoutDashboard size={18} />} 
                label="종합 대시보드"
              />
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">전문 관리 도구</p>
            <div className="space-y-1">
              <NavButton 
                active={activeTab === 'el'} 
                onClick={() => setActiveTab('el')} 
                icon={<ShieldAlert size={18} />} 
                label="수출통제(EL) 관리"
              />
              <NavButton 
                active={activeTab === 'forecast'} 
                onClick={() => setActiveTab('forecast')} 
                icon={<TrendingDown size={18} />} 
                label="수요 예측 및 발주 권고"
              />
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-orange-900/20">LS</div>
            <div>
              <p className="text-xs font-medium text-white">LS사업부 자재관리팀</p>
              <p className="text-[10px] text-slate-500">담당자 (Junior Manager)</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-slate-600">시스템 상태:</span>
              <span className="flex items-center text-green-600 text-xs font-medium bg-green-50 px-3 py-1 rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2 animate-pulse"></span>
                {data.length > 0 ? '데이터 동기화 완료' : '데이터 업로드 대기 중'}
              </span>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="부품 번호 또는 품명 검색..." 
                className="bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 w-80 transition-all placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 uppercase tracking-wide">
              <FileUp size={14} />
              <span>{isUploading ? '처리 중...' : 'SAP 엑셀 업로드'}</span>
              <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 space-y-6 overflow-auto">
          {data.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                <Package className="text-slate-300 w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">데이터 통합 준비 완료</h2>
              <p className="text-slate-500 text-sm mt-2">
                SAP에서 내보낸 엑셀 파일(자재 마스터, 재고 현황, 구매 진행 현황)을 
                업로드하여 실시간 수급 모니터링 시스템을 시작하십시오.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-10 w-full text-left">
                <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">1</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">SAP 데이터 추출</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">재고 및 구매 오더 리포트를 엑셀로 다운로드합니다.</p>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">2</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">일괄 업로드</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">파일을 선택하여 부품 번호 기준으로 데이터를 자동 병합합니다.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Global Stats Bar */}
                <div className="grid grid-cols-4 gap-4">
                  <StatCard label="총 관리 부품" value={stats.total} icon={<Package size={18} />} />
                  <StatCard label="수급 위기 (Critical)" value={stats.critical} color="red" badge="즉시 조치" icon={<AlertTriangle size={18} />} />
                  <StatCard label="EL 관리 대상" value={stats.elPending} color="amber" badge="기한 임박" icon={<ShieldAlert size={18} />} />
                  <StatCard label="A급 핵심 부품 (Long-lead)" value={stats.classA} color="orange" icon={<CheckCircle2 size={18} />} />
                </div>

                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <ABCAnalysis data={data} />
                    <InventoryStatusTable data={filteredData} />
                  </div>
                )}

                {activeTab === 'el' && (
                  <ELManagement data={filteredData} />
                )}

                {activeTab === 'forecast' && (
                  <ForecastSection data={filteredData} />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
        active 
          ? "bg-slate-800 text-white shadow-sm" 
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      )}
    >
      <div className={cn(
        "w-5 h-5 mr-3 flex items-center justify-center transition-colors",
        active ? "text-orange-400" : "text-slate-600"
      )}>
        {icon}
      </div>
      {label}
      {active && (
        <div className="ml-auto w-1 h-4 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
      )}
    </button>
  );
}

function StatCard({ label, value, icon, color = 'orange', badge }: { label: string; value: number | string; icon: React.ReactNode; color?: 'orange' | 'red' | 'amber'; badge?: string }) {
  const badgeStyles = {
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <div className={cn("p-1.5 rounded-lg bg-slate-50 border border-slate-100", "text-slate-400")}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <h2 className={cn("text-2xl font-bold tracking-tight", color === 'orange' && value.toString().includes('$') ? 'text-orange-600' : 'text-slate-900')}>
          {typeof value === 'number' && value < 10 && value > 0 ? `0${value}` : value}
        </h2>
        {badge && (
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter", badgeStyles[color])}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
