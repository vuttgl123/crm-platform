import React from 'react';
import { 
  TrendingUp, 
  Briefcase, 
  Building2, 
  Zap, 
  Plus, 
  MoreHorizontal, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Calendar,
  PhoneCall
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const OverviewPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header / Control Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-500">VUM Enterprise Corp</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Executive Board</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Revenue &amp; Operations Cockpit</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 border border-slate-200/80 rounded-lg p-0.5 text-xs font-semibold">
            <button className="px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 transition-colors">30 Days</button>
            <button className="px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-2xs">Q3 2026</button>
            <button className="px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 transition-colors">Full Year</button>
          </div>
          <Button size="sm" className="bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-xs h-9 shadow-xs flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>New Opportunity</span>
          </Button>
        </div>
      </div>

      {/* 4 KPI Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Revenue */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#085AC0] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +18.4%
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Recognized Revenue</span>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">5.40B VND</div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Target: 4.80B</span>
            <span className="font-semibold text-emerald-600">112.5% Target</span>
          </div>
        </div>

        {/* KPI 2: Pipeline */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              Win Rate 68.2%
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Active Pipeline</span>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">48 Deals</div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Weighted: 18.60B VND</span>
            <span className="font-semibold text-blue-600">Avg Deal 385M</span>
          </div>
        </div>

        {/* KPI 3: Accounts */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +124 New
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Accounts</span>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">1,280 Accounts</div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Enterprise: 85</span>
            <span className="font-semibold text-slate-700">Churn &lt; 0.8%</span>
          </div>
        </div>

        {/* KPI 4: Sales Velocity */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              -3.2 Days
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Sales Cycle Velocity</span>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">18.5 Days</div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>SLA: 98.4%</span>
            <span className="font-semibold text-purple-600">Fast CPQ</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Revenue Trend Chart Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-base text-slate-900">Revenue Attainment &amp; Forecast</h3>
                <p className="text-xs text-slate-500">Actual revenue vs quota commitment over recent months</p>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Chart Area */}
            <div className="w-full relative border-l border-b border-slate-200 pt-4 pr-4 h-48">
              <div className="absolute -left-7 top-0 h-full flex flex-col justify-between text-[10px] font-mono text-slate-400 py-1">
                <span>6.0B</span>
                <span>4.0B</span>
                <span>2.0B</span>
                <span>0.0</span>
              </div>

              <div className="w-full h-full relative overflow-hidden">
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <path d="M0 80 Q 200 80 400 80 T 800 80" fill="none" opacity="0.6" stroke="#F59E0B" strokeDasharray="5,5" strokeWidth="2" />
                </svg>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="blueGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#085AC0" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#085AC0" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 160 Q 100 140 200 100 T 400 70 T 600 35 L 600 200 L 0 200 Z" fill="url(#blueGrad)" />
                  <path d="M0 160 Q 100 140 200 100 T 400 70 T 600 35" fill="none" stroke="#085AC0" strokeWidth="3" />
                </svg>
                <div className="absolute right-0 top-[35px] transform translate-x-1/2 -translate-y-1/2">
                  <div className="w-3.5 h-3.5 bg-white border-2 border-[#085AC0] rounded-full shadow-xs" />
                  <div className="absolute -top-7 -left-10 bg-[#07182B] text-white text-[10px] px-2 py-0.5 rounded font-bold shadow-xs whitespace-nowrap">
                    5.4B (Current)
                  </div>
                </div>
              </div>

              <div className="flex justify-between w-full text-[10px] font-semibold text-slate-400 mt-2 px-1">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span className="font-bold text-[#085AC0]">Aug</span>
              </div>
            </div>
          </div>

          {/* High Value Pipeline Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-slate-900">High-Value Commercial Pipeline</h3>
                <p className="text-xs text-slate-500">Top enterprise opportunities currently in progress</p>
              </div>
              <button className="text-xs font-semibold text-[#085AC0] hover:underline">View All Deals →</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3 border-b border-slate-100">Deal Name</th>
                    <th className="px-5 py-3 border-b border-slate-100">Value</th>
                    <th className="px-5 py-3 border-b border-slate-100">Stage</th>
                    <th className="px-5 py-3 border-b border-slate-100">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 font-semibold text-slate-900 py-3">Vinahome Enterprise 200 Users</td>
                    <td className="px-5 font-bold text-[#085AC0] py-3">750,000,000 ₫</td>
                    <td className="px-5 text-slate-600 py-3">Negotiation</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        In Progress
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 font-semibold text-slate-900 py-3">An Phat Logistics Core CRM</td>
                    <td className="px-5 font-bold text-[#085AC0] py-3">1,850,000,000 ₫</td>
                    <td className="px-5 text-slate-600 py-3">Contract Signing</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Won
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 font-semibold text-slate-900 py-3">FPT Software CPQ &amp; Sales Suite</td>
                    <td className="px-5 font-bold text-[#085AC0] py-3">1,200,000,000 ₫</td>
                    <td className="px-5 text-slate-600 py-3">Quotation Review</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Reviewing
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 font-semibold text-slate-900 py-3">Viettel Telecom Regional Expansion</td>
                    <td className="px-5 font-bold text-[#085AC0] py-3">2,100,000,000 ₫</td>
                    <td className="px-5 text-slate-600 py-3">Discovery</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Qualified
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Sales Funnel Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">Pipeline Funnel Conversion</h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Inbound Leads</span>
                  <span className="text-slate-900">142</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-slate-400 h-2 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Sales Qualified (SQL)</span>
                  <span className="text-slate-900">86 (60.5%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full w-[60%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Quotation / CPQ</span>
                  <span className="text-slate-900">48 (33.8%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-[#085AC0] h-2 rounded-full w-[34%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Negotiation</span>
                  <span className="text-slate-900">24 (16.9%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full w-[17%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-emerald-700">Closed Won</span>
                  <span className="text-emerald-700 font-bold">15 (10.5%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full w-[11%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-slate-900">Today's Priority Tasks</h3>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                4 Tasks
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-500 line-through">08:30 Send CPQ Proposal &amp; Terms</p>
                  <span className="text-[10px] text-slate-400">Vinahome Corp</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                <Calendar className="w-4 h-4 text-[#085AC0] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">09:00 Enterprise SLA &amp; Security Review</p>
                  <span className="text-[10px] font-bold text-[#085AC0] uppercase">In-Person Meeting</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                <PhoneCall className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">14:00 Product Architecture Demo</p>
                  <span className="text-[10px] font-bold text-amber-700 uppercase">Executive Call</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">16:00 Account Data Sync &amp; Audit Review</p>
                  <span className="text-[10px] text-slate-500">System Integration</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Leaderboard */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">Top Commercial Reps</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  #1
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">Alex Nguyen</p>
                  <p className="text-[11px] text-slate-500">2.85B VND closed</p>
                </div>
                <span className="text-emerald-600 font-bold">142%</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                  #2
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">Mai Tran</p>
                  <p className="text-[11px] text-slate-500">1.65B VND closed</p>
                </div>
                <span className="text-emerald-600 font-bold">110%</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-xs">
                  #3
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">Nam Le</p>
                  <p className="text-[11px] text-slate-500">1.20B VND closed</p>
                </div>
                <span className="text-emerald-600 font-bold">95%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
