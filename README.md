# Rivera Budget

[![Make.Fun Competition](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![Rank](https://make.fun/badge/best-household-budget-site-20261126-1457/joyrichh/makefun-best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![Reward](https://make.fun/badge/best-household-budget-site-20261126-1457/joyrichh/makefun-best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

A calmer home for the Rivera family’s everyday finances and someday dreams. Made for two adults, two kids, and one team, with a warm green-and-amber palette, original SVG illustrations, and a responsive layout.

Built for [Make the best household budget site](https://make.fun/bounty/best-household-budget-site-20261126-1457).

## A place for every dollar

- **Dashboard:** November 2026 income, spending, money remaining, category comparison chart, savings progress, recent activity, and upcoming bills.
- **Transactions:** the verified 28-entry household ledger; add, edit, delete, search, and combine type/category filters. A confirmed reset restores all sample data.
- **Budgets:** editable plans for ten categories, with live actual spending, progress, and over/under amounts.
- **Savings goals:** emergency fund, vacation, and down payment; add money and see contribution-based finish months update.
- **Bills:** ten recurring essentials, a working paid/unpaid checklist, and reconciled monthly totals.
- **Reports & insights:** a six-month spending chart, category share, and five suggestions grounded in the ledger.

Amounts use integer-cent arithmetic. Dashboard, budgets, and November reports share the same transactions. Earlier reports use the verified June–October category records. Savings balances and bill statuses are separate trackers, so updating them never creates a duplicate transaction. Projections assume monthly contributions from December 2026 and no interest.

## Run locally

Requires Node.js 22.18+ (or newer with native TypeScript support). No dependencies, installation, bundler, or build step.

```sh
node serve.ts
```

Open the local address printed by the server. Use `node serve.ts --port 8081` for another port. All six pages use hash routes. Scripts, CSS, charts, icons, and artwork are local; the served app has no external resources or runtime network calls. The live badges above belong only to this README, not the site.

Changes stay in this browser’s localStorage. If browser storage is blocked or full, the site explicitly switches to session-only mode. There is no account, analytics, remote backup, or bank connection. Use **Transactions → Reset to sample data** to start fresh.

## Package the entry

The operator supplies the four real captures listed in `shots.json` to `screenshots/`. No screenshot is generated or represented as captured by this source tree.

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies the static app and available screenshots, then calls the unmodified vendor’s `buildDossier` with the competition limits. Without `MAKEFUN_OUTPUT_DIR`, the destination is `/output`. Dossier creation intentionally refuses an empty screenshots directory; capture the planned views before the final package run. Inputs have no generated dates or randomness.

## Verify the implementation

```sh
node tests/verify.mjs
node tests/interactions.mjs
node --check app/main.js
```

The source tests reconcile the sample ledger, category budgets, bills, goals, historical totals, projections, persistence, escaped rendering, empty states, and chart purity. The interaction tests exercise delegated handlers using a minimal host stub; they are not a substitute for real browser DOM and layout checks. Screenshots and the competition kit check are operator steps.

## License

MIT · Copyright (c) 2026 joyrichh.
