import React from 'react';

export const Sidebar: React.FC = () => {

  return (
    <aside className="bg-surface-container-lowest text-secondary fixed left-0 top-0 h-screen border-r border-outline-variant flat no shadows font-body-md text-body-md font-label-md text-label-md flex flex-col h-full z-50 hidden md:flex pt-0 shadow-[1px_0_0_0_#DFE1E6] w-56">
<div className="h-[56px] border-b border-outline-variant flex items-center px-4 gap-3 bg-surface-container-lowest shadow-sm">
<div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-white font-bold">V</div>
<div>
<div className="font-bold text-on-surface text-sm">VUM CRM</div>
<div className="text-xs text-outline">Enterprise Admin</div>
</div>
</div>
<div className="p-4 border-b border-outline-variant">
<button className="w-full flex items-center justify-between text-sm font-medium text-on-surface bg-surface-container hover:bg-surface-container-high transition rounded px-3 py-2">
<div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary-container"></span> Workspace: IPA</div>
<span className="material-symbols-outlined text-sm">unfold_more</span>
</button>
</div>
<div className="flex-1 overflow-y-auto py-2">
<div className="px-4 py-2 text-xs font-bold text-outline uppercase tracking-wider">CRM</div>
<nav className="flex flex-col gap-1 mb-4">
<a className="flex items-center gap-3 px-4 py-2 text-primary-container font-medium border-l-[3px] border-primary-container bg-primary-container/10" href="#">
<span className="material-symbols-outlined">groups</span>
                        Khách hàng
                    </a>
<a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors border-l-[3px] border-transparent" href="#">
<span className="material-symbols-outlined">person</span>
                        Người liên hệ
                    </a>
<a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors border-l-[3px] border-transparent" href="#">
<span className="material-symbols-outlined">radar</span>
                        Leads
                    </a>
<a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors border-l-[3px] border-transparent" href="#">
<span className="material-symbols-outlined">emoji_objects</span>
                        Opportunities
                    </a>
<a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors border-l-[3px] border-transparent" href="#">
<span className="material-symbols-outlined">local_activity</span>
                        Activities
                    </a>
</nav>
<div className="px-4 py-2 text-xs font-bold text-outline uppercase tracking-wider mt-2">Sales</div>
<nav className="flex flex-col gap-1 mb-4">
<a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors border-l-[3px] border-transparent" href="#">
<span className="material-symbols-outlined">trending_up</span>
                        Forecast
                    </a>
<a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors border-l-[3px] border-transparent" href="#">
<span className="material-symbols-outlined">request_quote</span>
                        Quotes
                    </a>
<a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors border-l-[3px] border-transparent" href="#">
<span className="material-symbols-outlined">shopping_cart</span>
                        Orders
                    </a>
<a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors border-l-[3px] border-transparent" href="#">
<span className="material-symbols-outlined">contract</span>
                        Hợp đồng
                    </a>
</nav>
<div className="px-4 py-2 text-xs font-bold text-outline uppercase tracking-wider mt-2">System</div>
<nav className="flex flex-col gap-1">
<a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors border-l-[3px] border-transparent" href="#">
<span className="material-symbols-outlined">manage_accounts</span>
                        Users
                    </a>
<a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors border-l-[3px] border-transparent" href="#">
<span className="material-symbols-outlined">settings</span>
                        Settings
                    </a>
</nav>
</div>
<div className="p-4 border-t border-outline-variant bg-surface-container-lowest mt-auto">
<div className="flex items-center gap-3 cursor-pointer hover:bg-surface-container-low p-2 -m-2 rounded transition">
<div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-primary-fixed font-bold text-sm border border-outline-variant">VP</div>
<div className="flex-1 min-w-0">
<div className="text-sm font-medium text-on-surface truncate">Vũ Phạm Tuấn</div>
<div className="text-xs text-outline truncate">Admin</div>
</div>
</div>
</div>
</aside>
  );
};
