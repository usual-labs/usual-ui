---
title: "Design decisions that survive the next prompt"
description: "A small workflow for keeping project conventions visible to a coding agent."
date: "2026-10-23"
draft: true
---

A project often has a preferred button component, spacing scale, and set of
colors. A coding agent can miss those decisions when they live only in a past
conversation.

## Keep the decision with the project

Usual UI stores a project's design contract in `usual.design.json`. An audit
can report drafted categories; a check enforces the categories that have been
explicitly activated. These are different steps.

Start by inspecting the project's existing conventions. Review the proposed
contract, repair the chosen scope, then activate only the categories you have
verified. Passing a source check does not prove that the interface looks or
behaves correctly in a browser.

Read the [local setup and coverage documentation](/ui/docs/) before choosing
a rule set. The contract should describe your project, not a generic aesthetic.
