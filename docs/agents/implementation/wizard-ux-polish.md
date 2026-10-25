# Wizard UX and visual polish

Implemented locally on 2026-10-22 following the user's request to run an example
wizard, capture screenshots, review each page, and improve the experience.
This request explicitly authorized browser inspection for the wizard. Changes
are unreleased and preserve the earlier lintapple implementation in this checkout.

## Design direction

The baseline had a cramped decision rail, dense technical detail before the main
task, and weak separation between choosing rules, saving policy, and preparing
repairs. The updated layout gives decisions more space, puts numbered steps above
both panes, and uses consistent rounded surfaces, quieter borders, and a clear
primary action. The existing Manrope font and restrained iris accent remain.

Mobbin references informed the hierarchy, choice presentation, and progressive
disclosure:

- [Asana onboarding](https://mobbin.com/flows/73a984d4-1481-4fad-a417-ae1c988624d3).
- [Supabase onboarding](https://mobbin.com/flows/9fcac236-9dce-4991-8786-bc4a6a0502bd).
- [Linear onboarding](https://mobbin.com/flows/cbaf58a9-fd84-4afe-b214-e65b24484013).

These are design references; no product assets or component implementations were
copied. The wizard's chrome remains separate from the project's own preview.

## Page-by-page changes

| Page         | Baseline issue                                                                              | Implemented improvement                                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Your project | Detailed paths and setup text competed with the starting action.                            | Lead with the project summary and decision/category counts. Keep exact included paths, exclusions, token sources, and destination in a disclosure. Name the next step in the continue button.                     |
| Colors       | Small option labels and raw values made palette choices harder to compare.                  | Make the option's explanation and safe swatches part of the selectable card. Distinguish the selected and recommended options. Keep source evidence separately expandable.                                        |
| Typography   | Type choices lacked an immediate specimen beside their explanation.                         | Show safe type specimens and source values on each option; bring the typography section into view in the reference pane.                                                                                          |
| Spacing      | Numeric values alone gave little sense of the resulting rhythm.                             | Add gap/padding specimens to choice cards and show the spacing reference when entering the step.                                                                                                                  |
| Shape        | Corner choices were difficult to assess from values alone.                                  | Add button/card radius specimens with their values and show the relevant reference section.                                                                                                                       |
| Components   | Dense choice content obscured what the user was selecting.                                  | Use the shared option hierarchy and explanation-wide selection target, retain evidence/rules access, and bring the reference component examples into view.                                                        |
| Review       | Category counts did not identify the actual selected alternatives.                          | Summarize selected option names by category, label deferred groups, and add direct edit actions. Keep the exact manifest and lint-impact preview available. Place explicit approval beside the final save action. |
| Discover     | Token inventories and observed values occupied the page before users chose to inspect them. | Put shared tokens and observed styles in clearly labeled disclosures. Preserve warnings, source locations, examples, and draft-only approval behavior.                                                            |
| Policy       | The full editor and controls dominated the saved-contract state.                            | Present a concise saved-policy summary with expandable allowed-value controls and JSON. Keep unsaved-draft, validation, preview, rationale, and approval behavior.                                                |
| Audit        | Empty categories competed with findings and selection guidance filled the main path.        | Show categories with findings first, reduce the weight of empty groups, and disclose grouping help. Keep diagnostic counts, evidence, individual/group selection, and a visible repair-batch action.              |
| Repair       | Confirmation, agent handoff, and verification read as one block.                            | Separate review/save, agent instruction, and recheck into a visible sequence. Clarify that a saved or copied plan is not proof of completed repairs.                                                              |

## Interaction and safety

- Continue, Back, and step navigation save progress; status distinguishes saved
  progress from approved policy. Changing a choice clears prior approval and
  impact preview. Unsaved choices trigger the browser's unload protection.
- Failed saves keep choices available. If policy saves but the first audit
  fails, the wizard reports that distinction and refreshes project state rather
  than presenting the contract as unsaved.
- Navigation focuses the destination after it renders. Option controls have
  explicit accessible names and descriptions; source disclosures remain separate
  from the selectable label. The current onboarding step stays visible in the
  horizontal navigation when the step or viewport changes.
- On desktop, the reference pane scrolls to the current category without moving
  the whole page. Narrow layouts stack decisions and preview. The reference
  remains labeled as illustrative when no project showcase is connected.
- Policy remains project-owned. All categories start inactive, deferral adds no
  policy for that category, and activation still requires current clean evidence.
  Existing source/session freshness checks and selected repair-plan boundaries
  are unchanged.
- Vite emits bundled fonts as same-origin files so the existing wizard CSP can
  load them. No remote font request or CSP relaxation was introduced.
- Labels and counts use consistent wording and singular/plural forms across the
  onboarding, audit, and repair flow.

## Verification and screenshots

The integrated non-browser checks passed:

- `npm test`: 196 tests, comprising 167 core, 26 wizard, and 3 site tests.
- `npm run typecheck` and the full production build.
- `npm run format:check` and clean-package installation smoke.

After the final copy and navigation fixes, all 26 wizard tests, type checking,
the full production build, and formatting checks passed again.

Browser verification used the example project's reference showcase and covered
all seven onboarding pages, persisted choices after saving, category deferral,
lint-impact preview, and explicit approval before saving the manifest. Desktop
(1440 × 1000), laptop (1280 × 800), and mobile (390 × 844) layouts were inspected.

Workshop browser verification also passed:

- Expanded and collapsed observed-style inventory and policy controls.
- Confirmed the nonempty Components group appears before empty audit groups.
- Selected a finding group, opened repair review, returned to selection with
  focus on `#audit-selection`, and confirmed the saved plan contains exactly the
  selected finding ID.
- Selected the saved agent instruction, then ran a fresh audit. It reported
  zero resolved, zero new, and one remaining finding, and focused the audit.
- Checked the saved manifest still has `active: []` and the fixture's source
  bytes are unchanged on disk. Preparing a repair plan did not perform repairs
  or activate a category.
- Confirmed the mobile repair page at 390 × 844 has no horizontal overflow.

No browser console errors or warnings were observed across the verified flows.

The local [before/after screenshot gallery](../../../output/playwright/wizard-polish/index.html)
collects images from [`output/playwright/wizard-polish/`](../../../output/playwright/wizard-polish/):

- `before/01-project.png` through `before/07-review.png`: seven onboarding pages.
- `before/08-discover.png` through `before/12-repair-review.png`: workshop baseline.
- `after/01-project.png` through `after/07-review.png`: revised onboarding.
- `after/08-discover.png` through `after/12-repair-review.png`: revised workshop.
- `after/13-dark-choice.png`, `after/14-mobile-colors.png`,
  `after/15-mobile-review.png`, and `after/16-laptop-review.png`: theme and viewport
  checks.
- `after/17-repair-saved.png`, `after/18-discover-expanded.png`,
  `after/19-policy-expanded.png`, and `after/20-mobile-repair.png`: completed
  handoff, disclosures, and mobile repair layout.

Screenshot artifacts are local review evidence, not published product assets.
The connected project showcase remains outside this browser acceptance pass;
the fixture used the built-in reference showcase. This wizard review also does
not establish browser acceptance for the separate lintapple runtime adapter or
its consumer examples.

## Running and release requirements

Use the existing dependencies and commands: `npm ci`, `npm run build`, and the
CLI's wizard command for the prepared example or target project. Restart an
already-running wizard after rebuilding to load the new assets.

No new dependency, environment variable, database migration, or manifest-schema
migration is required. No deployment or package publication was performed.
