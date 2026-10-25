import { twMerge } from 'tailwind-merge';
import type { StyleCategory } from './types.js';
export const styleCategories: StyleCategory[] = ['colors', 'typography', 'spacing', 'shape'];
export function splitClass(input: string): { variants: string[]; base: string } {
  const pieces: string[] = [];
  let depth = 0,
    start = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '[' || c === '(') depth++;
    if (c === ']' || c === ')') depth--;
    if (c === ':' && depth === 0) {
      pieces.push(input.slice(start, i));
      start = i + 1;
    }
  }
  pieces.push(input.slice(start));
  return {
    variants: pieces.slice(0, -1),
    base: pieces.at(-1)!.replace(/^!|!$/g, ''),
  };
}
export function propertyCategory(property: string): StyleCategory | undefined {
  const p = property.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  if (
    /^(color|background|background-color|background-image|border.*color|outline-color|fill|stroke|accent-color|caret-color|text-decoration-color)$/.test(
      p,
    )
  )
    return 'colors';
  if (
    /^(font.*|line-height|letter-spacing|text-align|text-transform|text-decoration|text-wrap)$/.test(
      p,
    )
  )
    return 'typography';
  if (
    /^(margin.*|padding.*|gap|row-gap|column-gap|width|height|min-width|max-width|min-height|max-height|inset.*|top|left|right|bottom|display|position|align.*|justify.*|flex.*|grid.*)$/.test(
      p,
    )
  )
    return 'spacing';
  if (/^(border.*|box-shadow|opacity|filter|backdrop-filter|outline.*)$/.test(p)) return 'shape';
  return undefined;
}
export function classCategory(
  candidate: string,
  themeTokens: ReadonlySet<string> = new Set(),
): StyleCategory | undefined {
  const b = splitClass(candidate).base.replace(/^-/, '');
  const prop = b.match(/^\[([\w-]+):/);
  if (prop) return propertyCategory(prop[1]);
  if (/^(bg|from|via|to|fill|stroke|accent|caret|decoration)-/.test(b)) return 'colors';
  if (b.startsWith('text-') && themeTokens.has(`--text-${b.slice(5).split('/')[0]}`))
    return 'typography';
  if (/^text-/.test(b))
    return /^text-(xs|sm|base|lg|[2-9]?xl|left|right|center|justify|start|end|wrap|nowrap|balance|pretty)(\/.*)?$/.test(
      b,
    ) || /^text-(\[length:|\(length:)/.test(b)
      ? 'typography'
      : /^text-\[(\d|\.)/.test(b)
        ? 'typography'
        : 'colors';
  if (
    /^(font|leading|tracking|line-clamp)-/.test(b) ||
    /^(uppercase|lowercase|capitalize|normal-case|italic|not-italic|underline|no-underline|antialiased|truncate|normal-nums|ordinal|slashed-zero|lining-nums|oldstyle-nums|proportional-nums|tabular-nums|diagonal-fractions|stacked-fractions)$/.test(
      b,
    )
  )
    return 'typography';
  if (
    /^(p[xysetblr]?|m[xysetblr]?|gap(-[xy])?|space-[xy]|w|h|size|min-w|max-w|min-h|max-h|inset(-[xy])?|top|bottom|left|right|start|end|flex|grid|col|row|items|justify|content|self|place-items|basis|grow|shrink|order)-/.test(
      b,
    ) ||
    /^(block|inline|inline-block|flex|inline-flex|grid|inline-grid|hidden|relative|absolute|fixed|sticky|static)$/.test(
      b,
    )
  )
    return 'spacing';
  if (/^(border|outline|ring)(-|$)/.test(b))
    return /^(border|outline|ring)(-[xysetblr])?(-\d+|-[0-9.]+|-(solid|dashed|dotted|double|none|hidden|inset))?$/.test(
      b,
    )
      ? 'shape'
      : 'colors';
  if (/^(rounded|shadow|opacity|blur|brightness|contrast|grayscale|saturate|backdrop)(-|$)/.test(b))
    return 'shape';
  return undefined;
}
export function wildcardMatch(value: string, pattern: string): boolean {
  if (!pattern.includes('*')) return value === pattern;
  return new RegExp(
    '^' +
      pattern
        .split('*')
        .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*') +
      '$',
  ).test(value);
}
export function variables(value: string): string[] {
  return [...value.matchAll(/--[a-zA-Z_][\w-]*/g)].map((m) => m[0]);
}

export function directVariableReference(value: string, approved: string[]): boolean {
  let inner = value.trim();
  if (inner.startsWith('-')) return false;
  // Extract a variable-bearing utility operand, not arbitrary surrounding expressions.
  const arbitrary = inner.match(/^[\w-]*-\[(.*)\]$/) || inner.match(/^\[(.*)\]$/);
  if (arbitrary) inner = arbitrary[1].replace(/^[a-zA-Z-]+:/, '');
  const shorthand = inner.match(/^[\w-]*-\((--[\w-]+)\)$/);
  if (shorthand) return approved.includes(shorthand[1]);
  const direct = inner.match(/^var\(\s*(--[\w-]+)\s*\)$/);
  return !!direct && approved.includes(direct[1]);
}
export function utilityFamily(
  candidate: string,
  themeTokens: ReadonlySet<string> = new Set(),
): string | undefined {
  const { base, variants } = splitClass(candidate);
  const category = classCategory(candidate, themeTokens);
  if (!category) return undefined;
  const normalized = base.replace(/^-/, '');
  const prefix = normalized.startsWith('text-')
    ? category === 'typography'
      ? /^text-(left|right|center|justify|start|end)$/.test(normalized)
        ? 'text-align'
        : /^text-(wrap|nowrap|balance|pretty)$/.test(normalized)
          ? 'text-wrap'
          : 'font-size'
      : 'text-color'
    : normalized.match(/^[a-z]+/)?.[0];
  return variants.join(':') + '|' + category + '|' + prefix;
}

function fontOperand(base: string, themeTokens: ReadonlySet<string>): string | undefined {
  const name = base.match(/^font-([\w-]+)$/)?.[1];
  if (!name || /^(stretch|features)-/.test(name)) return base;
  // Tailwind resolves a named family before a named weight when both exist.
  if (themeTokens.has(`--font-${name}`)) return `font-[family-name:var(--font-${name})]`;
  if (themeTokens.has(`--font-weight-${name}`)) return `font-[weight:var(--font-weight-${name})]`;
  if (
    /^(sans|serif|mono|thin|extralight|light|normal|medium|semibold|bold|extrabold|black|\d+)$/.test(
      name,
    )
  )
    return base;
  // An approved name alone does not establish whether it sets family or weight.
  return undefined;
}

export function utilitiesConflict(
  first: string,
  second: string,
  themeTokens: ReadonlySet<string> = new Set(),
): boolean {
  const a = splitClass(first),
    b = splitClass(second);
  const category = classCategory(first, themeTokens);
  if (
    !category ||
    category !== classCategory(second, themeTokens) ||
    a.variants.join(':') !== b.variants.join(':') ||
    a.base === b.base
  )
    return false;
  // Project-defined text sizes are known from the source token inventory. Keep
  // size, alignment and wrapping independent, including custom text-* sizes.
  if (category !== 'typography' || a.base.startsWith('text-') || b.base.startsWith('text-'))
    return utilityFamily(first, themeTokens) === utilityFamily(second, themeTokens);
  // Numeric features have independent groups plus normal-nums, which resets all
  // of them. The installed Tailwind merger also distinguishes font weight/style/family.
  const firstOperand = fontOperand(a.base, themeTokens),
    secondOperand = fontOperand(b.base, themeTokens);
  if (firstOperand === undefined || secondOperand === undefined)
    return [a.base, b.base].every((base) => /^font-(?!stretch-|features-)/.test(base));
  return (
    twMerge(firstOperand, secondOperand) !== `${firstOperand} ${secondOperand}` ||
    twMerge(secondOperand, firstOperand) !== `${secondOperand} ${firstOperand}`
  );
}
