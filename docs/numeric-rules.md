# Numeric typography with explicit intent

Mark numeric table cells when the project requires aligned numbers. Usual can
require the approved classes on those cells without guessing from their text.
This uses the existing semantic-rule format; it adds no global numeric policy.

Merge the following choices into your project's manifest after review. This
minimal example starts with typography inactive, like normal onboarding:

```json
{
  "version": 1,
  "include": ["src/**/*.{jsx,tsx}"],
  "active": [],
  "allowed": {
    "typography": {
      "classes": ["text-sm", "text-left", "text-right", "tabular-nums", "proportional-nums"]
    }
  },
  "semantics": [
    {
      "id": "numeric-table-cell",
      "target": { "element": "td", "props": { "data-ui-number": "true" } },
      "requireClasses": ["tabular-nums", "text-right"]
    }
  ]
}
```

`proportional-nums` and `text-left` are allowed for ordinary content, while marked
numeric cells must use `tabular-nums` and `text-right`. The attribute value is the
literal string `"true"`; use the same value in JSX. An unmarked cell does not
match this rule.

Before, the cell is allowed by the global typography palette but violates both
contextual requirements:

```jsx
<td data-ui-number="true" className="text-sm text-left proportional-nums">
  1,234.50
</td>
```

After:

```jsx
<td data-ui-number="true" className="text-sm text-right tabular-nums">
  1,234.50
</td>
```

Run `usual-ui audit --save`, review and repair the typography findings, then
run `usual-ui activate --categories typography --write`. Activation performs
a fresh audit before enabling enforcement. Subsequent `usual-ui check` runs
enforce the active typography category. Add the other policies your project
needs through its usual review process.

Font size, text alignment, and wrapping are independent: `text-sm text-right
text-nowrap` can coexist when all three are approved. `tabular-nums` may also
coexist with independent numeric features such as `lining-nums` or `slashed-zero`
when the project approves them. Conflicting spacing (`proportional-nums`) or a
numeric reset (`normal-nums`) cannot satisfy the tabular-number requirement by
appearing alongside it.

Required classes are exact source tokens: `md:text-right` does not satisfy
`text-right`. To require only a particular variant, explicitly use that variant
in `requireClasses`. Each finite branch must satisfy the applicable requirement;
dynamic class values or dynamic matching attributes remain unresolved coverage
when typography is active. Unknown utilities remain unresolved even if their
names are allowlisted.

These are source-level requirements. They do not establish the rendered font's
digit widths, the final alignment after other CSS, or accessibility. Rendered
verification belongs in an explicitly invoked runtime test using the project's
chosen font and prepared page.
