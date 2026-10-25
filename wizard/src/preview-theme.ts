import {
  chosenPreview,
  previewSlots,
  type OnboardingChoices,
  type OnboardingProposal,
  type PreviewSlot,
  type PreviewValues,
} from '../../src/onboarding-types';
import type { ShowcaseTheme } from '../../src/showcase-protocol';
import { categories, type Category } from '../../src/types';
import { previewStyles } from './preview-styles';

export type PreviewThemes = Record<ShowcaseTheme, PreviewValues>;
export interface PreviewHistory {
  past: PreviewThemes[];
  present: PreviewThemes;
  future: PreviewThemes[];
}
export type PreviewThemeAction =
  | {
      type: 'edit';
      theme: ShowcaseTheme;
      slot: PreviewSlot;
      value: string;
      base: PreviewValues;
      deferred: readonly Category[];
    }
  | { type: 'reset'; theme: ShowcaseTheme }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'rebase'; categories: readonly Category[] };

export const previewColorSlots = previewSlots.colors;
export const previewFontFamilies = ['system-ui', 'sans-serif', 'serif', 'monospace'] as const;
export const previewSlotLabels: Record<PreviewSlot, string> = {
  primary: 'Primary action',
  onPrimary: 'On primary',
  surface: 'Surface',
  onSurface: 'On surface',
  muted: 'Muted text',
  border: 'Border',
  focus: 'Focus ring',
  bodySize: 'Body size',
  headingSize: 'Heading size',
  lineHeight: 'Line height',
  fontFamily: 'Font family',
  gap: 'Component gap',
  padding: 'Content padding',
  controlRadius: 'Control radius',
  cardRadius: 'Card radius',
};

export function previewSlotCategory(slot: PreviewSlot): Category {
  return categories.find((category) =>
    (previewSlots[category] as readonly string[]).includes(slot),
  )!;
}

export function validPreviewValue(slot: PreviewSlot, value: string): boolean {
  if (!(Object.values(previewSlots).flat() as string[]).includes(slot)) return false;
  return Object.hasOwn(previewStyles({ [slot]: value }).style, `--sample-${slot}`);
}

/** Only explicit, supported base values may be explored. A deferred category stays absent. */
export function effectivePreview(
  base: PreviewValues,
  overrides: PreviewValues,
  deferred: readonly Category[] = [],
): PreviewValues {
  const result: PreviewValues = {};
  for (const slot of Object.values(previewSlots).flat()) {
    const value = base[slot];
    if (deferred.includes(previewSlotCategory(slot)) || !value || !validPreviewValue(slot, value))
      continue;
    const override = overrides[slot];
    result[slot] = override && validPreviewValue(slot, override) ? override : value;
  }
  return result;
}

export function createPreviewHistory(): PreviewHistory {
  return { past: [], present: { light: {}, dark: {} }, future: [] };
}

function remember(state: PreviewHistory, present: PreviewThemes): PreviewHistory {
  return { past: [...state.past, state.present].slice(-40), present, future: [] };
}

export function previewThemeReducer(
  state: PreviewHistory,
  action: PreviewThemeAction,
): PreviewHistory {
  if (action.type === 'undo') {
    const present = state.past.at(-1);
    return present
      ? { past: state.past.slice(0, -1), present, future: [state.present, ...state.future] }
      : state;
  }
  if (action.type === 'redo') {
    const present = state.future[0];
    return present
      ? { past: [...state.past, state.present], present, future: state.future.slice(1) }
      : state;
  }
  if (action.type === 'rebase') {
    if (!action.categories.length) return state;
    const keep = (values: PreviewValues): PreviewValues =>
      Object.fromEntries(
        Object.entries(values).filter(
          ([slot]) => !action.categories.includes(previewSlotCategory(slot as PreviewSlot)),
        ),
      );
    // Actual policy choices begin a new exploration history. Undo cannot revive old values.
    return {
      past: [],
      present: { light: keep(state.present.light), dark: keep(state.present.dark) },
      future: [],
    };
  }
  if (action.type === 'reset') {
    if (!Object.keys(state.present[action.theme]).length) return state;
    return remember(state, { ...state.present, [action.theme]: {} });
  }
  const { theme, slot, value, base, deferred } = action;
  if (
    deferred.includes(previewSlotCategory(slot)) ||
    !base[slot] ||
    !validPreviewValue(slot, base[slot]) ||
    !validPreviewValue(slot, value)
  )
    return state;
  const current = state.present[theme][slot] ?? base[slot];
  if (current === value) return state;
  const next = { ...state.present[theme] };
  if (value === base[slot]) delete next[slot];
  else next[slot] = value;
  return remember(state, { ...state.present, [theme]: next });
}

/** Choice identity matters even when two proposed options share the same preview value. */
export function changedPreviewCategories(
  proposal: OnboardingProposal,
  before: OnboardingChoices,
  after: OnboardingChoices,
): Category[] {
  return categories.filter(
    (category) =>
      before.deferred.includes(category) !== after.deferred.includes(category) ||
      proposal.decisions.some(
        (decision) =>
          decision.category === category &&
          before.selections[decision.id] !== after.selections[decision.id],
      ),
  );
}

export function exportPreviewCss(
  bases: PreviewThemes,
  overrides: PreviewThemes,
  deferred: readonly Category[] = [],
): string {
  return [
    '/* Reference preview values only. Map these to project tokens before use. */',
    '/* Missing and deferred values are omitted. This does not change lint policy. */',
    ...(['light', 'dark'] as const).map((theme) => {
      const values = effectivePreview(bases[theme], overrides[theme], deferred);
      const properties = Object.entries(previewStyles(values).style)
        .map(([name, value]) => `  ${name}: ${value};`)
        .join('\n');
      return `.design-sample.${theme} {\n${properties}\n}`;
    }),
  ].join('\n\n');
}

export function exportPreviewRequest(
  proposal: OnboardingProposal,
  choices: OnboardingChoices,
  overrides: PreviewThemes,
): string {
  const bases: PreviewThemes = {
    light: chosenPreview(proposal, choices, 'light'),
    dark: chosenPreview(proposal, choices, 'dark'),
  };
  const changes = Object.fromEntries(
    (['light', 'dark'] as const).map((theme) => {
      const effective = effectivePreview(bases[theme], overrides[theme], choices.deferred);
      return [
        theme,
        Object.fromEntries(
          Object.entries(effective).filter(
            ([slot, value]) => value !== bases[theme][slot as PreviewSlot],
          ),
        ),
      ];
    }),
  );
  const selections = proposal.decisions.map((decision) => {
    const option = decision.options.find((item) => item.id === choices.selections[decision.id]);
    return {
      decision: decision.id,
      category: decision.category,
      option: option?.id ?? null,
      label: option?.label ?? null,
    };
  });
  return [
    `Design change request for ${proposal.title}`,
    '',
    'These are temporary reference-preview explorations, not approved policy or applied project changes.',
    'Inspect the existing project tokens, components, and source evidence. Translate the requested values into explicit proposal options and matching enforceable rules. Preserve deferred categories. Refresh onboarding preparation and return the proposal for review before saving policy. Do not activate categories or modify application sources as part of this request.',
    '',
    JSON.stringify({ selections, deferred: choices.deferred, overrides: changes }, null, 2),
  ].join('\n');
}
