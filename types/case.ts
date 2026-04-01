// ============================================================
// Case Interview Coach — Type Definitions
// ============================================================

// ---- Phase 1: Context Extraction ----

export interface ClarifyingQuestion {
  question: string;
  why_important: string;
  category: 'market' | 'financials' | 'operations' | 'competition' | 'customer' | 'strategy';
}

export interface Phase1Result {
  case_title: string;
  client_name: string;
  industry: string;
  geography: string;
  case_type: 'problem' | 'opportunity' | 'market_entry' | 'pricing' | 'feasibility' | 'merger';
  core_objective: string;
  key_facts: string[];
  revenue_model: string;
  value_chain_summary: string;
  exhibits_present: boolean;
  exhibit_descriptions: string[];
  information_already_given: string[];
  missing_context: string[];
  clarifying_questions: ClarifyingQuestion[];
  initial_hypotheses: string[];
}

// ---- Phase 2: Full Solution ----

export interface DriverTree {
  root_metric: string;
  level_1: string[];
  level_2: Record<string, string[]>;
  level_3: Record<string, string[]>;
  pinpointed_issue: string;
}

export interface RootCause {
  cause: string;
  evidence_from_case: string;
  driver_tree_node: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface Calculation {
  what: string;
  formula: string;
  result: string;
}

export interface ExhibitAnalysis {
  exhibit_id: string;
  qualitative_observations: string[];
  quantitative_insights: string[];
  hypothesis_confirmed: string;
  calculations_performed: Calculation[];
}

export interface StrategicPillar {
  pillar_name: string;
  description: string;
  specific_actions: string[];
  example: string;
  expected_impact: string;
  timeframe: 'short-term (0-6mo)' | 'medium-term (6-18mo)' | 'long-term (18mo+)';
}

export interface RiskMitigation {
  risk: string;
  mitigation: string;
}

export interface KeyCalculation {
  label: string;
  formula: string;
  working: string;
  answer: string;
}

export interface Phase2Solution {
  case_summary: string;
  case_type_rationale: string;
  framework_selected: {
    name: string;
    why_chosen: string;
    alternatives_considered: string[];
  };
  driver_tree: DriverTree;
  root_cause_analysis: {
    primary_causes: RootCause[];
    secondary_causes: string[];
    ruled_out: string[];
  };
  exhibit_analysis: ExhibitAnalysis[];
  solution: {
    headline_recommendation: string;
    strategic_pillars: StrategicPillar[];
    quick_wins: string[];
    risks_and_mitigations: RiskMitigation[];
  };
  quantitative_summary: {
    key_calculations: KeyCalculation[];
    sanity_checks: string[];
  };
  closing_recommendation: {
    three_key_points: string[];
    next_steps: string[];
    open_questions: string[];
  };
}

// ---- Session ----

export interface ClarifyingAnswer {
  question: string;
  answer: string;
}

export type SessionStatus = 'pending' | 'clarifying' | 'solved';

export interface CaseSession {
  id: string;
  created_at: string;
  file_name: string;
  file_url: string;
  case_type: string;
  raw_context: Phase1Result | null;
  clarifying_questions: ClarifyingQuestion[] | null;
  solution: Phase2Solution | null;
  status: SessionStatus;
}
