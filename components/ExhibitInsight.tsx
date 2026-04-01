'use client';

import React from 'react';
import type { ExhibitAnalysis as ExhibitAnalysisType } from '@/types/case';

interface ExhibitInsightProps {
  exhibit: ExhibitAnalysisType;
}

export default function ExhibitInsight({ exhibit }: ExhibitInsightProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h5 className="text-white font-medium">{exhibit.exhibit_id}</h5>
      </div>

      {/* Qualitative Observations */}
      {exhibit.qualitative_observations?.length > 0 && (
        <div>
          <p className="text-xs font-mono text-[#c9a84c] uppercase tracking-wider mb-2">Qualitative Observations</p>
          <ul className="space-y-1.5">
            {exhibit.qualitative_observations.map((obs, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#b8c4d6]">
                <span className="text-[#c9a84c] mt-1 flex-shrink-0">•</span>
                <span>{obs}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quantitative Insights */}
      {exhibit.quantitative_insights?.length > 0 && (
        <div>
          <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">Quantitative Insights</p>
          <ul className="space-y-1.5">
            {exhibit.quantitative_insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#b8c4d6]">
                <span className="text-emerald-400 mt-1 flex-shrink-0">▸</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hypothesis confirmed */}
      {exhibit.hypothesis_confirmed && (
        <div className="px-3 py-2 bg-blue-500/5 border border-blue-500/10 rounded-lg">
          <p className="text-xs text-blue-400 font-mono mb-1">Hypothesis Impact</p>
          <p className="text-sm text-[#b8c4d6]">{exhibit.hypothesis_confirmed}</p>
        </div>
      )}

      {/* Calculations */}
      {exhibit.calculations_performed?.length > 0 && (
        <div>
          <p className="text-xs font-mono text-purple-400 uppercase tracking-wider mb-2">Calculations</p>
          <div className="space-y-3">
            {exhibit.calculations_performed.map((calc, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                <p className="text-sm text-white font-medium mb-1">{calc.what}</p>
                <p className="text-xs font-mono text-[#8896ab]">{calc.formula}</p>
                <p className="text-sm font-mono text-[#c9a84c] mt-1">= {calc.result}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
