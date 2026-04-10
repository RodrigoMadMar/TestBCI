'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Star,
  TrendingUp,
  ListChecks,
  Bot,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reviews', label: 'Feature Analyst', icon: Star },
  { href: '/trends', label: 'Trends Analyst', icon: TrendingUp },
  { href: '/backlog', label: 'Backlog Priorizado', icon: ListChecks },
  { href: '/agentes', label: 'Flujos Agénticos', icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex flex-col bg-[#07070E] border-r border-[#1E1E2E] transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      } min-h-screen`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-[#1A1A2E] border border-[#2A2A3E] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-[#1E1E2E] ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-[#0033A0] flex items-center justify-center flex-shrink-0">
          <BrainCircuit size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-semibold text-sm leading-tight">Copiloto BCI</div>
            <div className="text-[#6B7280] text-xs">Inteligencia de Producto</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                isActive
                  ? 'bg-[#0033A0]/20 text-[#4D8EFF] border border-[#0033A0]/30'
                  : 'text-[#9CA3AF] hover:bg-[#1A1A2E] hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-[#4D8EFF]' : ''}`} />
              {!collapsed && (
                <span className="text-sm font-medium">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-[#1E1E2E]">
          <div className="text-[#4B5563] text-xs text-center">
            Powered by Claude Sonnet 4.6
          </div>
        </div>
      )}
    </aside>
  );
}
