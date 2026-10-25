/** Explicit rendered policy. No values are inferred from usual.design.json. */
export interface RuntimePolicy {
  fonts: string[];
  fontSizes: number[];
  typeRules: { selector: string; sizes: number[] }[];
  minControlSize: number;
  controlSizeRules: {
    selector: string;
    minSize: number;
    minViewportWidth?: number;
    maxViewportWidth?: number;
  }[];
  minControlGap: number;
  minControlInset: number;
  controlContainers: string[];
  minLayoutGap: number;
  bannedCopy: string[];
  viewports: { width: number; height: number }[];
  colorSchemes: ('light' | 'dark')[];
  exceptions: { selector: string; rules: string[]; reason: string }[];
}

export interface RuntimeFinding {
  rule: string;
  selector: string;
  message: string;
  actual: string;
  expected: string;
  fix: string;
  status?: 'failed' | 'unresolved';
  relatedSelector?: string;
  phase?: string;
  sourceRule?: string;
  category?: string;
  /** Retain additional engine measurements, such as contrast ratios and colors. */
  [detail: string]: unknown;
}

export interface RuntimePageReport {
  findings: RuntimeFinding[];
  suppressed: { rule: string; selector: string; reason: string }[];
  accessibilityCoverage: { pageRules: string[]; interactionRules: string };
  elements: number;
  controls: number;
  insetControls: number;
  numericElements: number;
  alignmentGroups: number;
  radiusContracts: number;
}

export interface RuntimeSummary {
  problems: number;
  occurrences: number;
  failed: number;
  unresolved: number;
  groups: { finding: RuntimeFinding; occurrences: RuntimeFinding[] }[];
}

export interface FrameLocation {
  url: string;
  name: string;
  path: string;
}

export interface RuntimeAudit extends RuntimePageReport {
  version: 1;
  evidence: 'rendered';
  engine: 'lintapple';
  state: string;
  /** Caller-supplied theme label; colorScheme records the browser media preference. */
  theme: string;
  url: string;
  viewport: { width: number; height: number };
  colorScheme: 'light' | 'dark';
  policy: RuntimePolicy;
  frameCoverage: { checked: FrameLocation; omitted: FrameLocation[] };
  summary: RuntimeSummary;
}

export interface RuntimeOptions {
  policy: RuntimePolicy;
  state: string;
  theme: string;
}
