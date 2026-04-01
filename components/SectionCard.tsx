'use client';

import React, { useState } from 'react';

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accentColor?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  id?: string;
}

export default function SectionCard({
  icon,
  title,
  subtitle,
  accentColor = '#c9a84c',
  defaultOpen = true,
  children,
  id,
}: SectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      id={id}
      className="section-card group"
      style={{ borderLeftColor: accentColor }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl opacity-80">{icon}</span>
          <div>
            <h3 className="text-lg font-heading font-semibold text-white tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-[#8896ab] mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-[#8896ab] transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-400 ease-in-out ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-5 pt-0">{children}</div>
      </div>
    </div>
  );
}
