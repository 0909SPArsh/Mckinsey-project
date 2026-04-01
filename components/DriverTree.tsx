'use client';

import React, { useState } from 'react';
import type { DriverTree as DriverTreeType } from '@/types/case';

/** Safely coerce a value into an array */
function safeArray(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim()) return [val];
  return [];
}

interface DriverTreeProps {
  tree: DriverTreeType;
}

function TreeNode({
  label,
  isPinpointed,
  children,
  level,
}: {
  label: string;
  isPinpointed: boolean;
  children?: React.ReactNode;
  level: number;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const bgColors = [
    'bg-[#c9a84c]/20 border-[#c9a84c]/40',
    'bg-blue-500/10 border-blue-500/30',
    'bg-purple-500/10 border-purple-500/30',
    'bg-emerald-500/10 border-emerald-500/30',
  ];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative px-4 py-2.5 rounded-lg border text-sm font-medium text-white text-center
          transition-all duration-300 cursor-default min-w-[120px] max-w-[200px]
          ${isPinpointed
            ? 'bg-red-500/15 border-red-500/50 ring-2 ring-red-500/30 ring-offset-2 ring-offset-[#0a0f1e] shadow-lg shadow-red-500/10'
            : bgColors[level] || bgColors[3]
          }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="block truncate">{label}</span>
        {isPinpointed && (
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">!</span>
          </span>
        )}
        {showTooltip && (
          <div className="absolute z-10 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1a2235] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#8896ab] whitespace-nowrap shadow-xl">
            {isPinpointed ? '⚠️ Root Cause / Opportunity' : label}
          </div>
        )}
      </div>
      {children && (
        <>
          <div className="w-px h-6 bg-white/10" />
          {children}
        </>
      )}
    </div>
  );
}

export default function DriverTree({ tree }: DriverTreeProps) {
  const pinpointed = tree.pinpointed_issue?.toLowerCase() || '';

  const isNodePinpointed = (name: string) => {
    const lower = name.toLowerCase();
    return (
      pinpointed.includes(lower) ||
      lower.includes(pinpointed) ||
      pinpointed === lower
    );
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex flex-col items-center min-w-fit mx-auto gap-0">
        {/* Root */}
        <TreeNode label={tree.root_metric} isPinpointed={isNodePinpointed(tree.root_metric)} level={0} />

        {/* Connector line */}
        <div className="w-px h-6 bg-white/10" />

        {/* Level 1 */}
        <div className="relative">
          {/* Horizontal connector */}
          {safeArray(tree.level_1).length > 1 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-white/10" style={{
              width: `${(safeArray(tree.level_1).length - 1) * 180}px`,
            }} />
          )}
          <div className="flex gap-6 items-start">
            {safeArray(tree.level_1).map((driver, i) => {
              const subDrivers = safeArray(tree.level_2?.[driver as keyof typeof tree.level_2]);
              return (
                <div key={i} className="flex flex-col items-center">
                  {/* Vertical connector from horizontal line */}
                  <div className="w-px h-4 bg-white/10" />
                  <TreeNode label={driver} isPinpointed={isNodePinpointed(driver)} level={1}>
                    {subDrivers.length > 0 && (
                      <div className="relative">
                        {subDrivers.length > 1 && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-white/10" style={{
                            width: `${(subDrivers.length - 1) * 160}px`,
                          }} />
                        )}
                        <div className="flex gap-4 items-start">
                          {subDrivers.map((sub, j) => {
                            const leafDrivers = tree.level_3?.[sub] || [];
                            return (
                              <div key={j} className="flex flex-col items-center">
                                <div className="w-px h-4 bg-white/10" />
                                <TreeNode label={sub} isPinpointed={isNodePinpointed(sub)} level={2}>
                                  {leafDrivers.length > 0 && (
                                    <div className="flex gap-3 items-start flex-wrap justify-center">
                                      {leafDrivers.map((leaf, k) => (
                                        <div key={k} className="flex flex-col items-center">
                                          <div className="w-px h-4 bg-white/10" />
                                          <TreeNode label={leaf} isPinpointed={isNodePinpointed(leaf)} level={3} />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </TreeNode>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </TreeNode>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pinpointed issue callout */}
        {tree.pinpointed_issue && (
          <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            <span className="text-red-400 text-sm">⚠️</span>
            <span className="text-sm text-red-300">
              <span className="font-medium">Root Cause:</span> {tree.pinpointed_issue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
