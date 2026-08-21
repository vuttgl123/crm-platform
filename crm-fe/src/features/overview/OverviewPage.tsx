import React from 'react';

export const OverviewPage: React.FC = () => {
  return (
    <div className="max-w-container-max mx-auto">
{/* Header / Control Toolbar */}
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
<div>
<div className="flex items-center gap-2 mb-1">
<span className="flex h-2 w-2 relative">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
</span>
<span className="text-xs font-semibold text-outline">Tập đoàn IPA</span>
<span className="text-xs text-outline">•</span>
<span className="text-xs text-outline">Ban Giám Đốc</span>
</div>
<h1 className="text-manrope font-bold text-2xl text-on-surface">Bảng Quản trị Điều hành Kinh doanh</h1>
</div>
<div className="flex items-center gap-3">
<div className="flex bg-surface-container-lowest border border-outline-variant rounded p-0.5 text-sm">
<button className="px-3 py-1.5 rounded text-on-surface-variant hover:bg-surface-container-low transition">30 ngày</button>
<button className="px-3 py-1.5 rounded bg-surface-container-high font-medium text-on-surface shadow-sm">Quý 3/2026</button>
<button className="px-3 py-1.5 rounded text-on-surface-variant hover:bg-surface-container-low transition">Cả năm</button>
</div>
<button className="bg-primary-container text-white px-4 py-2 h-[40px] rounded font-medium hover:bg-primary-container/90 transition shadow-sm flex items-center gap-2 text-sm whitespace-nowrap">
<span className="material-symbols-outlined text-sm">add</span> Thêm Cơ hội Mới
                        </button>
</div>
</div>
{/* 4 KPI Bento Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
{/* KPI 1 */}
<div className="bg-white rounded-card card-shadow border border-[#DFE1E6] flex flex-col relative overflow-hidden p-4">
<div className="absolute top-0 right-0 p-4 opacity-10">
<span className="material-symbols-outlined text-6xl text-primary-container">monetization_on</span>
</div>
<div className="flex items-center gap-2 mb-3">
<div className="w-8 h-8 rounded bg-primary-container/10 flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined text-sm">monetization_on</span>
</div>
<span className="text-sm font-semibold text-on-surface-variant">Revenue</span>
</div>
<div className="text-manrope font-bold text-2xl text-on-surface mb-1">5.4 Tỷ VNĐ</div>
<div className="flex items-center justify-between text-xs mt-auto">
<span className="text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">trending_up</span> +18.4% vs KPI</span>
<span className="text-outline">Mục tiêu 4.8 Tỷ</span>
</div>
</div>
{/* KPI 2 */}
<div className="bg-white rounded-card card-shadow border border-[#DFE1E6] flex flex-col relative overflow-hidden p-4">
<div className="absolute top-0 right-0 p-4 opacity-10">
<span className="material-symbols-outlined text-6xl text-amber-500">work</span>
</div>
<div className="flex items-center gap-2 mb-3">
<div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center text-amber-600">
<span className="material-symbols-outlined text-sm">work</span>
</div>
<span className="text-sm font-semibold text-on-surface-variant">Pipeline</span>
</div>
<div className="text-manrope font-bold text-2xl text-on-surface mb-1">48 Deals</div>
<div className="flex items-center justify-between text-xs mt-auto">
<span className="text-on-surface font-medium">18.6 Tỷ VNĐ</span>
<span className="text-outline">Win Rate 68.2%</span>
</div>
</div>
{/* KPI 3 */}
<div className="bg-white rounded-card card-shadow border border-[#DFE1E6] flex flex-col relative overflow-hidden p-4">
<div className="absolute top-0 right-0 p-4 opacity-10">
<span className="material-symbols-outlined text-6xl text-emerald-500">domain</span>
</div>
<div className="flex items-center gap-2 mb-3">
<div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-600">
<span className="material-symbols-outlined text-sm">domain</span>
</div>
<span className="text-sm font-semibold text-on-surface-variant">Accounts</span>
</div>
<div className="text-manrope font-bold text-2xl text-on-surface mb-1">1,280 KH</div>
<div className="flex items-center justify-between text-xs mt-auto">
<span className="text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">+124 KH mới</span>
<span className="text-outline">VIP 85</span>
</div>
</div>
{/* KPI 4 */}
<div className="bg-white rounded-card card-shadow border border-[#DFE1E6] flex flex-col relative overflow-hidden p-4">
<div className="absolute top-0 right-0 p-4 opacity-10">
<span className="material-symbols-outlined text-6xl text-purple-500">bolt</span>
</div>
<div className="flex items-center gap-2 mb-3">
<div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center text-purple-600">
<span className="material-symbols-outlined text-sm">bolt</span>
</div>
<span className="text-sm font-semibold text-on-surface-variant">Sales Velocity</span>
</div>
<div className="text-manrope font-bold text-2xl text-on-surface mb-1">18.5 Ngày</div>
<div className="flex items-center justify-between text-xs mt-auto">
<span className="text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1">-3.2 ngày</span>
<span className="text-outline">SLA 98.4%</span>
</div>
</div>
</div>
{/* Grid Layout for Main Content */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
{/* Left Column (approx 720px equivalent in grid) */}
<div className="lg:col-span-8 flex flex-col gap-6">
{/* Chart Card */}
<div className="bg-white rounded-card p-6 card-shadow border border-[#DFE1E6]">
<div className="flex justify-between items-center mb-6">
<h3 className="text-manrope font-bold text-lg text-on-surface">Revenue Trend</h3>
<button className="text-outline hover:text-on-surface"><span className="material-symbols-outlined">more_horiz</span></button>
</div>
{/* Simulated Chart Area */}
<div className="w-full relative border-l border-b border-outline-variant/50 pt-4 pr-4 h-48">
{/* Y Axis Labels */}
<div className="absolute left-[-30px] top-0 h-full flex flex-col justify-between text-[10px] text-outline py-2">
<span className="">6T</span>
<span className="">4T</span>
<span className="">2T</span>
<span className="">0</span>
</div>
{/* Chart Lines/Gradient placeholder (Using CSS for visuals) */}
<div className="w-full h-full relative overflow-hidden">
{/* Target Dashed Line */}
<svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
<path d="M0 80 Q 200 80 400 80 T 800 80" fill="none" opacity="0.6" stroke="#FF8B00" strokeDasharray="5,5" strokeWidth="2"></path>
</svg>
{/* Actual Area/Line */}
<svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
<defs>
<linearGradient id="blueGrad" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stopColor="#0C66E4" stopOpacity="0.2"></stop>
<stop offset="100%" stopColor="#0C66E4" stopOpacity="0"></stop>
</linearGradient>
</defs>
<path d="M0 200 Q 100 180 200 120 T 400 90 T 600 40 L 600 250 L 0 250 Z" fill="url(#blueGrad)"></path>
<path d="M0 200 Q 100 180 200 120 T 400 90 T 600 40" fill="none" stroke="#0C66E4" strokeWidth="3"></path>
</svg>
{/* T8 Marker */}
<div className="absolute right-0 top-[40px] transform translate-x-1/2 -translate-y-1/2">
<div className="w-3 h-3 bg-white border-2 border-primary-container rounded-full shadow"></div>
<div className="absolute -top-8 -left-8 bg-surface-container-highest text-primary-fixed text-xs px-2 py-1 rounded font-bold shadow-sm whitespace-nowrap">5.4T (T8)</div>
</div>
</div>
{/* X Axis Labels */}
<div className="flex justify-between w-full text-[10px] text-outline mt-2 px-2">
<span className="">T1</span><span className="">T2</span><span className="">T3</span><span className="">T4</span><span className="">T5</span><span className="">T6</span><span className="">T7</span><span className="font-bold text-on-surface">T8</span>
</div>
</div>
</div>
{/* Table Card */}
<div className="bg-white rounded-card p-0 card-shadow border border-[#DFE1E6] overflow-hidden">
<div className="p-5 border-b border-[#DFE1E6] flex justify-between items-center">
<h3 className="text-manrope font-bold text-lg text-on-surface">High-Value Pipeline</h3>
<button className="text-sm font-medium text-primary-container hover:underline">View All</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-sm text-left">
<thead className="bg-[#FAFBFC] text-outline text-xs uppercase font-semibold">
<tr>
<th className="px-5 py-3 border-b border-[#DFE1E6]">Deal Name</th>
<th className="px-5 py-3 border-b border-[#DFE1E6]">Value</th>
<th className="px-5 py-3 border-b border-[#DFE1E6]">Stage</th>
<th className="px-5 py-3 border-b border-[#DFE1E6]">Status</th>
</tr>
</thead>
<tbody className="divide-y divide-[#DFE1E6]">
<tr className="hover:bg-surface-container-low transition">
<td className="px-5 font-medium text-on-surface py-2.5">Hợp đồng ERP Oracle</td>
<td className="px-5 py-2.5">3.5 Tỷ</td>
<td className="px-5 text-on-surface-variant py-2.5">Đàm phán</td>
<td className="px-5 py-2.5">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">In Progress</span>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition">
<td className="px-5 font-medium text-on-surface py-2.5">Dự án B2B Viettel</td>
<td className="px-5 py-2.5">2.1 Tỷ</td>
<td className="px-5 text-on-surface-variant py-2.5">Đóng HĐ</td>
<td className="px-5 py-2.5">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">Won</span>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition">
<td className="px-5 font-medium text-on-surface py-2.5">SmartCRM FPT</td>
<td className="px-5 py-2.5">1.8 Tỷ</td>
<td className="px-5 text-on-surface-variant py-2.5">Báo giá</td>
<td className="px-5 py-2.5">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">At Risk</span>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition">
<td className="px-5 font-medium text-on-surface py-2.5">License Cloud Vinamilk</td>
<td className="px-5 py-2.5">1.2 Tỷ</td>
<td className="px-5 text-on-surface-variant py-2.5">Đàm phán</td>
<td className="px-5 py-2.5">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Review</span>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
{/* Right Column (approx 400px equivalent) */}
<div className="lg:col-span-4 flex flex-col gap-6">
{/* Funnel Card */}
<div className="bg-white rounded-card p-6 card-shadow border border-[#DFE1E6]">
<h3 className="text-manrope font-bold text-lg text-on-surface mb-4">Sales Funnel</h3>
<div className="flex flex-col gap-2">
<div className="flex items-center justify-between text-sm">
<span className="text-on-surface-variant">Leads (142)</span>
<div className="w-1/2 bg-surface-container rounded overflow-hidden h-4">
<div className="h-full bg-slate-300 w-full"></div>
</div>
</div>
<div className="flex items-center justify-between text-sm">
<span className="text-on-surface-variant">SQL (86)</span>
<div className="w-1/2 bg-surface-container rounded overflow-hidden flex justify-center h-4">
<div className="h-full bg-blue-300 w-4/5"></div>
</div>
</div>
<div className="flex items-center justify-between text-sm">
<span className="text-on-surface-variant">Báo giá (48)</span>
<div className="w-1/2 bg-surface-container rounded overflow-hidden flex justify-center h-4">
<div className="h-full bg-primary-fixed-dim w-3/5"></div>
</div>
</div>
<div className="flex items-center justify-between text-sm">
<span className="text-on-surface-variant">Đàm phán (24)</span>
<div className="w-1/2 bg-surface-container rounded overflow-hidden flex justify-center h-4">
<div className="h-full bg-primary-container w-2/5 opacity-80"></div>
</div>
</div>
<div className="flex items-center justify-between text-sm">
<span className="font-medium text-on-surface">Won (15)</span>
<div className="w-1/2 bg-surface-container rounded overflow-hidden flex justify-center h-4">
<div className="h-full bg-green-500 w-1/4"></div>
</div>
</div>
</div>
</div>
{/* Activities Card */}
<div className="bg-white rounded-card p-6 card-shadow border border-[#DFE1E6]">
<div className="flex justify-between items-center mb-4">
<h3 className="text-manrope font-bold text-lg text-on-surface">Today's Activity</h3>
<span className="bg-[#EBECF0] text-xs font-bold px-2 py-1 rounded-full text-on-surface-variant">4 Tasks</span>
</div>
<ul className="space-y-3">
<li className="flex items-start gap-3">
<input defaultChecked className="mt-1 border-outline-variant text-primary-container rounded-sm focus:ring-primary-container" type="checkbox" />
<div>
<p className="text-sm font-medium line-through text-outline">08:30 Gửi báo giá</p>
</div>
</li>
<li className="flex items-start gap-3 bg-surface-container-low -mx-2 p-2 rounded">
<input className="mt-1 border-outline-variant text-primary-container rounded-sm focus:ring-primary-container" type="checkbox" />
<div>
<p className="text-sm font-medium text-on-surface">09:00 Họp SLA</p>
<span className="text-[10px] font-bold text-primary-container bg-primary-container/10 px-1.5 py-0.5 rounded uppercase mt-1 inline-block">HỌP TRỰC TIẾP</span>
</div>
</li>
<li className="flex items-start gap-3">
<input className="mt-1 border-outline-variant text-primary-container rounded-sm focus:ring-primary-container" type="checkbox" />
<div>
<p className="text-sm font-medium text-on-surface">14:00 Demo</p>
<span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase mt-1 inline-block">CUỘC GỌI</span>
</div>
</li>
<li className="flex items-start gap-3">
<input className="mt-1 border-outline-variant text-primary-container rounded-sm focus:ring-primary-container" type="checkbox" />
<div>
<p className="text-sm font-medium text-on-surface">16:00 Import</p>
</div>
</li>
</ul>
</div>
{/* Leaderboard Card */}
<div className="bg-white rounded-card p-6 card-shadow border border-[#DFE1E6]">
<h3 className="text-manrope font-bold text-lg text-on-surface mb-4">Performance</h3>
<div className="space-y-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center font-bold text-yellow-700 text-sm">#1</div>
<div className="flex-1">
<div className="text-sm font-medium">Phạm Tuấn Vũ</div>
<div className="text-xs text-outline">2.85 Tỷ VNĐ</div>
</div>
<span className="material-symbols-outlined text-green-500 text-sm">arrow_upward</span>
</div>
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">#2</div>
<div className="flex-1">
<div className="text-sm font-medium">Trần Thị Mai</div>
<div className="text-xs text-outline">1.65 Tỷ VNĐ</div>
</div>
<span className="material-symbols-outlined text-outline text-sm">remove</span>
</div>
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-700 text-sm">#3</div>
<div className="flex-1">
<div className="text-sm font-medium">Lê Hoàng Nam</div>
<div className="text-xs text-outline">1.20 Tỷ VNĐ</div>
</div>
<span className="material-symbols-outlined text-green-500 text-sm">arrow_upward</span>
</div>
</div>
</div>
</div>
</div>
</div>
  );
};
