import React, { useState } from 'react';
import {
  Cloud,
  Layers,
  Cpu,
  ShieldCheck,
  Database,
  CreditCard,
  Radio,
  BarChart3,
  Building,
} from 'lucide-react';

// Specialized brand configurations for verified companies
const BRAND_MAP = {
  technova: {
    name: 'TechNova Cloud Solutions',
    initials: 'TN',
    gradient: 'from-cyan-500 via-sky-600 to-blue-700',
    border: 'border-sky-500/40',
    iconColor: 'text-cyan-200',
    glow: 'rgba(14, 165, 233, 0.35)',
    Icon: Cloud,
  },
  cloudscale: {
    name: 'CloudScale Dynamics',
    initials: 'CS',
    gradient: 'from-emerald-500 via-teal-600 to-teal-800',
    border: 'border-emerald-500/40',
    iconColor: 'text-emerald-200',
    glow: 'rgba(16, 185, 129, 0.35)',
    Icon: BarChart3,
  },
  apex: {
    name: 'Apex Design Labs',
    initials: 'AD',
    gradient: 'from-violet-500 via-purple-600 to-fuchsia-700',
    border: 'border-purple-500/40',
    iconColor: 'text-purple-200',
    glow: 'rgba(168, 85, 247, 0.35)',
    Icon: Layers,
  },
  quantum: {
    name: 'QuantumLeap AI',
    initials: 'QL',
    gradient: 'from-amber-400 via-amber-500 to-yellow-600',
    border: 'border-amber-400/50',
    iconColor: 'text-slate-950',
    glow: 'rgba(245, 158, 11, 0.4)',
    Icon: Cpu,
  },
  cyber: {
    name: 'CyberShield Defense',
    initials: 'CD',
    gradient: 'from-rose-500 via-red-600 to-rose-800',
    border: 'border-rose-500/40',
    iconColor: 'text-rose-100',
    glow: 'rgba(244, 63, 94, 0.35)',
    Icon: ShieldCheck,
  },
  datastream: {
    name: 'DataStream Technologies',
    initials: 'DS',
    gradient: 'from-blue-500 via-indigo-600 to-indigo-800',
    border: 'border-indigo-500/40',
    iconColor: 'text-indigo-100',
    glow: 'rgba(99, 102, 241, 0.35)',
    Icon: Database,
  },
  vectorpay: {
    name: 'VectorPay Networks',
    initials: 'VP',
    gradient: 'from-teal-500 via-emerald-600 to-amber-600',
    border: 'border-emerald-500/40',
    iconColor: 'text-emerald-100',
    glow: 'rgba(16, 185, 129, 0.35)',
    Icon: CreditCard,
  },
  pulse: {
    name: 'Pulse Interactive Media',
    initials: 'PI',
    gradient: 'from-pink-500 via-rose-600 to-purple-700',
    border: 'border-pink-500/40',
    iconColor: 'text-pink-100',
    glow: 'rgba(236, 72, 153, 0.35)',
    Icon: Radio,
  },
};

const GENERIC_GRADIENTS = [
  { gradient: 'from-blue-600 to-indigo-800', border: 'border-blue-500/40' },
  { gradient: 'from-emerald-600 to-teal-800', border: 'border-emerald-500/40' },
  { gradient: 'from-amber-500 to-orange-700', border: 'border-amber-500/40' },
  { gradient: 'from-purple-600 to-pink-800', border: 'border-purple-500/40' },
  { gradient: 'from-cyan-600 to-blue-800', border: 'border-cyan-500/40' },
  { gradient: 'from-rose-600 to-red-800', border: 'border-rose-500/40' },
];

function getBrandConfig(companyName = '') {
  if (!companyName) return null;
  const lower = companyName.toLowerCase();
  for (const [key, config] of Object.entries(BRAND_MAP)) {
    if (lower.includes(key)) {
      return config;
    }
  }
  return null;
}

function getInitials(name = '') {
  if (!name) return 'CO';
  const clean = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return 'CO';
}

function hashString(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function CompanyLogo({
  src,
  name = 'Company',
  className = 'w-12 h-12 rounded-xl',
  showInitial = false,
}) {
  const [imgError, setImgError] = useState(false);

  // Filter out flaky/blocked external stock photo URLs (Unsplash)
  const isBlockedSource =
    !src ||
    src.includes('images.unsplash.com') ||
    src.includes('unsplash.com') ||
    imgError;

  const brand = getBrandConfig(name);
  const initials = getInitials(name);

  // If a valid custom logo URL is present and not from a blocked provider
  if (src && !isBlockedSource) {
    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center bg-[#0d162d] border border-blue-500/20 shadow-sm flex-shrink-0 ${className}`}
      >
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // If matched to one of our verified curated tech brands
  if (brand) {
    const { gradient, border, iconColor, Icon, glow } = brand;
    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-br ${gradient} ${border} border shadow-md flex-shrink-0 group select-none ${className}`}
        style={{
          boxShadow: `0 4px 14px -2px ${glow}`,
        }}
        title={name}
      >
        {/* Subtle geometric background grid pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px]" />
        
        {/* Floating brand icon + initials */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <Icon className={`w-5 h-5 ${iconColor} drop-shadow-sm`} />
          <span className={`text-[9px] font-black tracking-tight leading-none mt-0.5 ${iconColor} opacity-90`}>
            {brand.initials}
          </span>
        </div>
      </div>
    );
  }

  // Generic fallback with deterministic gradient and bold initials
  const hash = hashString(name);
  const { gradient, border } = GENERIC_GRADIENTS[hash % GENERIC_GRADIENTS.length];

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-br ${gradient} ${border} border shadow-md flex-shrink-0 select-none ${className}`}
      title={name}
    >
      <div className="relative z-10 flex flex-col items-center justify-center text-white">
        <Building className="w-4 h-4 opacity-75 mb-0.5" />
        <span className="text-[10px] font-black tracking-wider leading-none">
          {initials}
        </span>
      </div>
    </div>
  );
}
