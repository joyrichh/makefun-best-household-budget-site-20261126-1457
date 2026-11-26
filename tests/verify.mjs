import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { CATEGORIES, DEFAULT_STATE, HISTORY, STORAGE_KEY, createDefaultState, cents, sum, subtract, categorySnapshot, summary, monthlyTrend, billSummary, goalSummary, goalProjection, filterTransactions, loadState, saveState, resetState } from '../app/data.js';
import { barChart, trendChart, shareChart } from '../app/charts.js';
import { dashboard, transactions, budgets, goals, bills, reports, escape, transactionForm, confirmDialog } from '../app/views.js';

let checks = 0;
function check(name, test) {
  test();
  checks += 1;
  console.log(`PASS ${name}`);
}

const defaults = createDefaultState();
const totals = summary(defaults);
const actuals = { housing: 2500, groceries: 854.60, utilities: 361.80, transport: 695.40, dining: 412.60, family: 398, insurance: 360, shopping: 286.45, health: 100, subscriptions: 48.97 };

check('28 verified November transactions; two payroll deposits', () => {
  assert.equal(defaults.transactions.length, 28);
  assert.equal(defaults.transactions.filter(transaction => transaction.type === 'income').length, 2);
  assert.equal(new Set(defaults.transactions.map(transaction => transaction.id)).size, 28);
  assert.ok(defaults.transactions.every(transaction => transaction.date.startsWith('2026-11-')));
  assert.deepEqual(defaults.transactions.filter(transaction => transaction.type === 'income').map(transaction => transaction.amount), [4850, 4150]);
});

check('income, spending, remaining, budgets, and after-savings reconcile exactly', () => {
  assert.equal(cents(totals.income), 900000);
  assert.equal(cents(totals.expenses), 601782);
  assert.equal(cents(totals.remaining), 298218);
  assert.equal(sum(Object.values(defaults.budgets)), 6500);
  assert.equal(cents(totals.budgetRemaining), 48218);
  assert.equal(cents(totals.afterSavings), 178218);
  assert.equal(sum([0.1, 0.2]), 0.3);
  assert.equal(subtract(100, 1.01), 98.99);
});

check('every category matches prep-note actuals and dining is the only overage', () => {
  const snapshot = categorySnapshot(defaults);
  assert.deepEqual(Object.fromEntries(snapshot.map(category => [category.id, category.actual])), actuals);
  assert.deepEqual(snapshot.filter(category => category.remaining < 0).map(category => [category.id, category.remaining]), [['dining', -62.6]]);
  assert.equal(sum(snapshot.map(category => category.actual)), totals.expenses);
});

check('all six historical totals reconcile; November is live, not hard-coded', () => {
  const trend = monthlyTrend(defaults);
  assert.deepEqual(trend.map(month => month.total), [6115.47, 6486.12, 6361.77, 5903.27, 6092.22, 6017.82]);
  assert.equal(trend.at(-1).total, totals.expenses);
  assert.deepEqual(trend.at(-1).categories, actuals);
  assert.equal(HISTORY.length, 5);
});

check('10 bills: $4,049.79 total, $3,898.79 paid, $151.00 remaining', () => {
  assert.equal(defaults.bills.length, 10);
  assert.deepEqual(billSummary(defaults), { total: 4049.79, paid: 3898.79, remaining: 151, paidCount: 8 });
  assert.deepEqual(defaults.bills.filter(bill => !bill.paid).map(bill => [bill.name, bill.amount, bill.day]), [['Water & sewer', 62, 29], ['Gym membership', 89, 30]]);
});

check('three goals, combined balances, monthly contributions, and projections', () => {
  const goalsTotal = goalSummary(defaults);
  assert.equal(goalsTotal.saved, 19900);
  assert.equal(goalsTotal.target, 40500);
  assert.equal(goalsTotal.contribution, 1200);
  assert.deepEqual(defaults.goals.map(goal => [goal.saved, goal.target, goal.contribution]), [[8400, 12000, 500], [1750, 3500, 250], [9750, 25000, 450]]);
  assert.deepEqual(defaults.goals.map(goal => goalProjection(goal).finish), ['July 2027', 'June 2027', 'September 2029']);
  const goal = { ...defaults.goals[0], saved: 12000 };
  assert.deepEqual(goalProjection(goal), { months: 0, finish: 'Goal reached!' });
});

check('search, category, type, and combined filters return real results', () => {
  assert.equal(filterTransactions(defaults, { search: 'Willow' }).length, 2);
  assert.equal(filterTransactions(defaults, { type: 'income' }).length, 2);
  assert.equal(filterTransactions(defaults, { category: 'dining' }).length, 4);
  assert.equal(filterTransactions(defaults, { search: 'FRESHMART', type: 'expense', category: 'groceries' }).length, 2);
  assert.equal(filterTransactions(defaults, { type: 'income', category: 'groceries' }).length, 0);
  assert.equal(filterTransactions(defaults)[0].date, '2026-11-26');
});

check('add, edit, and delete arithmetic flows through every summary', () => {
  const state = createDefaultState();
  state.transactions.push({ id: 'tx-29', date: '2026-11-27', description: 'Willow Market · fruit', category: 'groceries', amount: 12.34, type: 'expense' });
  assert.equal(summary(state).expenses, 6030.16);
  assert.equal(categorySnapshot(state).find(category => category.id === 'groceries').actual, 866.94);
  assert.equal(monthlyTrend(state).at(-1).total, 6030.16);
  state.transactions.at(-1).amount = 20;
  assert.equal(summary(state).expenses, 6037.82);
  state.transactions.pop();
  assert.equal(summary(state).expenses, totals.expenses);
});

check('localStorage round-trip and reset preserve independent defaults', () => {
  const records = new Map();
  const storage = { getItem: key => records.get(key) || null, setItem: (key, value) => records.set(key, value) };
  assert.deepEqual(loadState(storage), defaults);
  const state = createDefaultState();
  state.budgets.groceries = 1000;
  state.goals[0].saved = 8500;
  state.bills.at(-1).paid = true;
  state.transactions[0].amount = 2501.01;
  assert.equal(saveState(state, storage), true);
  assert.deepEqual(loadState(storage), state);
  assert.deepEqual(DEFAULT_STATE, defaults);
  assert.deepEqual(resetState(storage), defaults);
  assert.deepEqual(loadState(storage), defaults);
  records.set(STORAGE_KEY, '{broken');
  assert.deepEqual(loadState(storage), defaults);
  records.set(STORAGE_KEY, JSON.stringify({ ...state, transactions: [{ ...state.transactions[0], amount: -50 }] }));
  assert.deepEqual(loadState(storage), defaults);
  state.transactions.push({ ...state.transactions[0] });
  records.set(STORAGE_KEY, JSON.stringify(state));
  assert.deepEqual(loadState(storage), defaults);
});

check('storage outages are safe; immutable sample metadata cannot be overwritten', () => {
  const unavailable = { getItem() { throw Error('blocked'); }, setItem() { throw Error('full'); } };
  assert.deepEqual(loadState(unavailable), defaults);
  assert.equal(saveState(defaults, unavailable), false);
  assert.deepEqual(resetState(unavailable), defaults);
  assert.equal(saveState(defaults, null), false);
  const tampered = createDefaultState();
  tampered.goals[0].target = 1;
  tampered.bills[0].amount = 1;
  const loaded = loadState({ getItem: () => JSON.stringify(tampered) });
  assert.equal(loaded.goals[0].target, 12000);
  assert.equal(loaded.bills[0].amount, 2500);
});

check('every view renders real content, all rows, and all required controls', () => {
  const filters = { search: '', type: '', category: '' };
  for (const renderer of [dashboard, transactions, budgets, goals, bills, reports]) {
    const markup = renderer(defaults, filters);
    assert.ok(markup.includes('<h1'));
    assert.ok(markup.length > 1000);
    assert.ok(!/NaN|undefined|Infinity|lorem ipsum/i.test(markup));
  }
  const ledger = transactions(defaults, filters);
  assert.equal((ledger.match(/data-action="edit-transaction"/g) || []).length, 28);
  assert.equal((ledger.match(/data-action="delete-transaction"/g) || []).length, 28);
  assert.equal((budgets(defaults).match(/data-form="budget"/g) || []).length, 10);
  assert.equal((goals(defaults).match(/data-form="goal"/g) || []).length, 3);
  assert.equal((bills(defaults).match(/data-action="toggle-bill"/g) || []).length, 10);
  assert.ok(reports(defaults).includes('$62.60'));
  assert.ok(reports(defaults).includes('$854.60'));
  assert.ok(transactionForm().includes('min="2026-11-01"'));
  assert.ok(confirmDialog('delete', defaults.transactions[0]).includes('data-form="delete"'));
});

check('user-provided text is escaped in tables, dialogs, and chart strings', () => {
  const state = createDefaultState();
  const attack = '<img src=x onerror="alert(1)"> & \' <script>';
  state.transactions[0].description = attack;
  for (const markup of [transactions(state, {}), transactionForm(state.transactions[0]), confirmDialog('delete', state.transactions[0])]) {
    assert.ok(!markup.includes('<img'));
    assert.ok(!markup.includes('<script>'));
    assert.ok(markup.includes('&lt;img'));
  }
  assert.equal(escape('&<>"\''), '&amp;&lt;&gt;&quot;&#39;');
  const chart = barChart([{ name: attack, color: '" onload="bad', actual: 1, budget: 2 }]);
  assert.ok(!chart.includes('<img'));
  assert.ok(!chart.includes('fill="" onload='));
});

check('empty ledgers, zero budgets, completed goals, and all-paid bills stay valid', () => {
  const state = createDefaultState();
  state.budgets.dining = 0;
  assert.equal(categorySnapshot(state).find(category => category.id === 'dining').percent, 100);
  state.transactions = [];
  state.bills.forEach(bill => { bill.paid = true; });
  state.goals.forEach(goal => { goal.saved = goal.target; });
  for (const renderer of [dashboard, transactions, budgets, goals, bills, reports]) {
    assert.ok(!/NaN|undefined|Infinity/.test(renderer(state, {})));
  }
  assert.equal(billSummary(state).remaining, 0);
  assert.ok(goals(state).includes('Goal reached!'));
  assert.ok(dashboard(state).includes('All paid.'));
});

check('SVG renderers are deterministic, pure, and handle empty inputs', () => {
  const categories = categorySnapshot(defaults);
  const trend = monthlyTrend(defaults);
  const before = JSON.stringify({ categories, trend });
  for (const [renderer, input] of [[barChart, categories], [trendChart, trend], [shareChart, categories]]) {
    assert.equal(renderer(input), renderer(input));
    assert.ok(renderer(input).includes('role="img"'));
    assert.ok(!/NaN|undefined|Infinity/.test(renderer([])));
  }
  assert.equal(JSON.stringify({ categories, trend }), before);
});

check('all app resources are local and source fits the competition limits', () => {
  const files = readdirSync(new URL('../app/', import.meta.url));
  assert.equal(files.length, 6);
  let bytes = 0;
  for (const name of files) {
    const path = new URL(`../app/${name}`, import.meta.url);
    bytes += statSync(path).size;
    const source = readFileSync(path, 'utf8');
    assert.ok(!/https?:\/\/|\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(source), name);
  }
  assert.ok(bytes < 16777216);
  assert.ok(statSync(new URL('../app/index.html', import.meta.url)).size < 1048576);
  const html = readFileSync(new URL('../app/index.html', import.meta.url), 'utf8');
  assert.ok(html.includes("connect-src 'none'"));
  assert.ok(html.includes('<main id="app"'));
  assert.ok(html.includes('<title>Rivera Family Budget — Household Budget</title>'));
  assert.ok(html.includes('name="viewport"'));
});

check('entry metadata, exact prompt, owner, license, badges, and shot plan', () => {
  const read = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
  assert.equal(read('prompt.txt'), 'garap bounty ini sampai jadi yang terbaik\n');
  assert.equal(read('.makefun/owner.json'), '{"wallet":"3jcYvH5x8TXgGK4W4Qpx7FHrjYJJAEUn7uCw775hWMmx"}');
  assert.equal(read('.gitignore'), 'out/\nout1/\nout2/\n');
  assert.ok(read('LICENSE').startsWith('SPDX-License-Identifier: MIT\n'));
  assert.ok(read('LICENSE').includes('Copyright (c) 2026 joyrichh'));
  assert.equal((read('README.md').match(/\[!\[/g) || []).length, 3);
  const shots = JSON.parse(read('shots.json'));
  assert.equal(shots.length, 4);
  assert.deepEqual(shots.map(shot => [shot.file, shot.route, shot.width, shot.height]), [
    ['1-dashboard.jpg', '#/', 1280, 900], ['2-transactions.jpg', '#/transactions', 1280, 900],
    ['3-goals.jpg', '#/goals', 1280, 900], ['4-phone.jpg', '#/', 390, 844],
  ]);
});

console.log('\nVERIFIED ARITHMETIC');
console.log(JSON.stringify({ income: totals.income, expenses: totals.expenses, remaining: totals.remaining, budgets: totals.budget,
  actuals, novemberTrend: monthlyTrend(defaults).at(-1).total, bills: billSummary(defaults), goals: goalSummary(defaults) }, null, 2));
console.log(`\n${checks} source and arithmetic checks passed. These are not rendered-browser checks.`);
