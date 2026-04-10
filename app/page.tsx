'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Star,
  TrendingUp,
  ListChecks,
  Bot,
  ChevronDown,
  ChevronUp,
  Building2,
  Users,
  DollarSign,
  Globe,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const MODULE_CARDS = [
  {
    href: '/reviews',
    icon: Star,
    title: 'Feature Analyst',
    description: 'Análisis de reviews de apps bancarias con clasificación automática de problemas y health status.',
    color: '#0033A0',
    tags: ['BCI', 'Tenpo', 'Itaú'],
  },
  {
    href: '/trends',
    icon: TrendingUp,
    title: 'Trends Analyst',
    description: 'Tendencias de búsqueda en Chile, noticias fintech y oportunidades de producto derivadas.',
    color: '#6366F1',
    tags: ['Google Trends', 'Noticias', 'Oportunidades'],
  },
  {
    href: '/backlog',
    icon: ListChecks,
    title: 'Backlog Priorizado',
    description: 'User stories con criterios de aceptación y priorización RICE en vista Kanban exportable.',
    color: '#059669',
    tags: ['RICE', 'Kanban', 'CSV Export'],
  },
  {
    href: '/agentes',
    icon: Bot,
    title: 'Flujos Agénticos',
    description: 'Arquitectura completa de sistemas multi-agente con diagrama Mermaid y especificación técnica.',
    color: '#7C3AED',
    tags: ['Multi-Agente', 'Mermaid', 'Markdown'],
  },
];

const BCI_CONTEXT = [
  {
    icon: Users,
    label: 'Usuarios App Personas',
    value: '748K+',
    detail: 'usuarios activos en app BCI Personas',
  },
  {
    icon: DollarSign,
    label: 'Inversión Digital',
    value: 'US$200M',
    detail: 'en transformación digital 2024-2026',
  },
  {
    icon: Globe,
    label: 'Objetivo de Clientes',
    value: '10M',
    detail: 'clientes objetivo para el ecosistema BCI',
  },
  {
    icon: Building2,
    label: 'Market Share',
    value: '#1',
    detail: 'en préstamos y depósitos (20.48% / 23.36%)',
  },
];

export default function HomePage() {
  const [bciContextOpen, setBciContextOpen] = useState(false);
  const today = new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-[#4D8EFF]" />
            <span className="text-[#4D8EFF] text-sm font-medium">Copiloto BCI</span>
          </div>
          <h1 className="text-3xl font-bold text-white leading-tight">
            Inteligencia de Producto
          </h1>
          <p className="text-gray-500 mt-1 text-sm capitalize">{today}</p>
        </div>
        <div className="text-right text-xs text-gray-600">
          <div>Gerencia Canales Digitales</div>
          <div className="text-[#4D8EFF]">BCI Chile</div>
        </div>
      </div>

      {/* Module Cards */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Módulos de Análisis
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {MODULE_CARDS.map(({ href, icon: Icon, title, description, color, tags }) => (
            <Link
              key={href}
              href={href}
              className="group bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5 hover:border-[#2A2A3E] hover:bg-[#14141E] transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <ArrowRight
                  size={16}
                  className="text-gray-600 group-hover:text-gray-400 group-hover:translate-x-1 transition-all"
                />
              </div>
              <h3 className="text-white font-semibold mb-1">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-3">{description}</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${color}15`, color: `${color}CC` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Metrics Row */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Contexto BCI
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {BCI_CONTEXT.map(({ icon: Icon, label, value, detail }) => (
            <div key={label} className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-4">
              <Icon size={16} className="text-[#4D8EFF] mb-2" />
              <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
              <div className="text-xs text-gray-500 leading-snug">{detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BCI Context Collapsible */}
      <section className="bg-[#12121A] border border-[#1E1E2E] rounded-xl overflow-hidden">
        <button
          onClick={() => setBciContextOpen(!bciContextOpen)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#14141E] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#4D8EFF]" />
            <span className="text-white font-medium text-sm">Contexto Estratégico BCI</span>
          </div>
          {bciContextOpen ? (
            <ChevronUp size={16} className="text-gray-500" />
          ) : (
            <ChevronDown size={16} className="text-gray-500" />
          )}
        </button>

        {bciContextOpen && (
          <div className="px-5 pb-5 border-t border-[#1E1E2E] pt-4 grid grid-cols-2 gap-6 animate-fade-in">
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Ecosistema Digital
              </h4>
              <ul className="space-y-2">
                {[
                  'App BCI Personas — 748K+ usuarios',
                  'MACHBANK — 2.8M+ clientes (ex-MACH)',
                  'App BCI Pyme — Factoring 100% digital',
                  'BCI Seguros — Productos vida y generales',
                  'OpenSky Rewards — Programa de beneficios',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-gray-400">
                    <span className="text-[#4D8EFF] mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Competencia
              </h4>
              <ul className="space-y-2">
                {[
                  'Banco de Chile — Principal competidor',
                  'Santander Chile — Fuerte en digital',
                  'BancoEstado — Mayor base (estatal)',
                  'Tenpo — Neobank disruptivo',
                  'Itaú Chile — Presencia creciente',
                  'Falabella (CMR/Fpay) — Ecosistema retail',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-gray-400">
                    <span className="text-purple-400 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Regulación
              </h4>
              <ul className="space-y-2">
                {[
                  'CMF — Comisión para el Mercado Financiero',
                  'Ley Fintech 21521 — Vigente desde feb 2023',
                  'SERNAC — Protección al consumidor',
                  'Open Finance — En implementación 2025',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-gray-400">
                    <span className="text-amber-400 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Estrategia 2025-2026
              </h4>
              <ul className="space-y-2">
                {[
                  'US$200M en transformación digital',
                  'Objetivo: 10M clientes',
                  'Foco en IA y personalización',
                  'Nuevo CIO con background BBVA',
                  '#1 en préstamos y depósitos (20.48%)',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-gray-400">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Acciones Rápidas
        </h2>
        <div className="flex gap-3 flex-wrap">
          {MODULE_CARDS.map(({ href, title, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1E1E2E] hover:bg-[#1A1A2E] transition-colors text-sm text-gray-300 hover:text-white"
            >
              <Icon size={14} style={{ color }} />
              Ir a {title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
