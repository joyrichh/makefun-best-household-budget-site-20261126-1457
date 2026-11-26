import assert from 'node:assert/strict';
import { createDefaultState, STORAGE_KEY, summary, categorySnapshot, billSummary, monthlyTrend, goalProjection, loadState } from '../app/data.js';
import { ROUTES } from '../app/views.js';

const documentListeners = new Map();
const windowListeners = new Map();
const records = new Map();
const makeClassList = () => ({ toggle() {}, add() {}, remove() {} });
const stubElement = () => ({ innerHTML: '', hidden: true, title: '', textContent: '', classList: makeClassList(), focus() {}, setSelectionRange() {}, isConnected: true });
const heading = stubElement();
const filterElements = Object.fromEntries(['search', 'type', 'category'].map(key => [key, stubElement()]));
const app = { ...stubElement(), querySelector(selector) { return selector.includes('data-filter') ? filterElements[selector.match(/data-filter="(.*?)"/)[1]] : heading; }, scrollIntoView() {} };
const anchors = ROUTES.map(route => ({ ...stubElement(), getAttribute: () => `#${route.path}`, setAttribute() {}, removeAttribute() {} }));
const navigation = { ...stubElement(), querySelectorAll: () => anchors };
const dialogListeners = new Map();
const dialog = { ...stubElement(), open: false, addEventListener: (type, listener) => dialogListeners.set(type, listener),
  showModal() { this.open = true; }, close() { this.open = false; dialogListeners.get('close')?.(); },
  querySelector: () => stubElement(), getBoundingClientRect: () => ({ left: 10, right: 500, top: 10, bottom: 500 }) };
const elements = { app, navigation, 'action-dialog': dialog, toast: stubElement(), 'storage-indicator': stubElement(), 'route-label': stubElement(), 'transaction-search': stubElement() };
const location = { hash: '#/' };

globalThis.document = { activeElement: stubElement(), getElementById: id => elements[id], addEventListener(type, listener) {
  documentListeners.set(type, [...(documentListeners.get(type) || []), listener]);
} };
globalThis.window = { addEventListener(type, listener) { windowListeners.set(type, [...(windowListeners.get(type) || []), listener]); }, scrollTo() {} };
globalThis.location = location;
globalThis.history = { replaceState(first, second, hash) { location.hash = hash; } };
globalThis.localStorage = { getItem: key => records.get(key) || null, setItem: (key, value) => records.set(key, value) };
globalThis.FormData = class { constructor(form) { this.values = form.values; } get(key) { return this.values[key] ?? null; } };
globalThis.setTimeout = () => 1;
globalThis.clearTimeout = () => {};

function fire(type, target) {
  for (const listener of documentListeners.get(type) || []) listener({ target, preventDefault() {} });
}

function click(action, id) {
  const control = { dataset: { action, id } };
  fire('click', { closest: selector => selector === '[data-action]' ? control : null });
}

function submit(kind, values = {}, id) {
  const error = stubElement();
  const form = { dataset: { form: kind, id }, values, reportValidity: () => true, querySelector: () => error };
  fire('submit', { closest: () => form });
  return error;
}

function route(path) {
  location.hash = `#${path}`;
  for (const listener of windowListeners.get('hashchange') || []) listener();
}

function filter(key, value) {
  const control = { dataset: { filter: key }, value, selectionStart: value.length,
    matches: selector => key === 'search' ? selector === '[data-filter="search"]' : selector === 'select[data-filter]' };
  fire(key === 'search' ? 'input' : 'change', control);
}

const saved = () => JSON.parse(records.get(STORAGE_KEY));
await import('../app/main.js');
assert.equal(window.__shotReady, true);
assert.ok(app.innerHTML.includes('$6,017.82'));
assert.deepEqual(saved(), createDefaultState());
console.log('PASS startup renders the dashboard and persists sample data');

for (const item of ROUTES) {
  route(item.path);
  assert.equal(elements['route-label'].textContent, item.label);
  assert.ok(app.innerHTML.includes('<h1'));
  assert.equal(window.__shotReady, true);
}
route('/missing');
assert.equal(location.hash, '#/');
console.log('PASS every nav route and unknown-hash fallback');

click('add-transaction');
assert.equal(dialog.open, true);
assert.ok(dialog.innerHTML.includes('data-form="transaction"'));
submit('transaction', { date: '2026-11-27', description: '<img src=x> · shopping', category: 'shopping', amount: '12.34', type: 'expense' });
assert.equal(dialog.open, false);
assert.equal(saved().transactions.length, 29);
assert.equal(summary(saved()).expenses, 6030.16);
assert.equal(categorySnapshot(saved()).find(item => item.id === 'shopping').actual, 298.79);
assert.equal(monthlyTrend(saved()).at(-1).total, 6030.16);
assert.ok(app.innerHTML.includes('&lt;img src=x&gt;'));
console.log('PASS add transaction: persisted row, escaped description, shared totals');

const addedId = saved().transactions.at(-1).id;
click('edit-transaction', addedId);
assert.equal(dialog.open, true);
assert.ok(dialog.innerHTML.includes('12.34'));
const categoryControl = { innerHTML: '' };
fire('change', { value: 'income', matches: selector => selector.includes('form[data-form="transaction"]'), form: { elements: { category: categoryControl } } });
assert.equal(categoryControl.innerHTML, '<option value="income">Income</option>');
submit('transaction', { date: '2026-11-27', description: 'Rivera family · refund', category: 'income', amount: '20.00', type: 'income' }, addedId);
assert.equal(summary(saved()).income, 9020);
assert.equal(summary(saved()).expenses, 6017.82);
assert.equal(saved().transactions.length, 29);
console.log('PASS edit transaction and change expense to income');

click('delete-transaction', addedId);
assert.ok(dialog.innerHTML.includes('Delete this transaction?'));
click('close-dialog');
assert.equal(saved().transactions.length, 29);
click('delete-transaction', addedId);
submit('delete', {}, addedId);
assert.deepEqual(saved(), createDefaultState());
console.log('PASS delete confirmation, cancellation, and deletion');

click('add-transaction');
let error = submit('transaction', { date: '2026-11-27', description: '   ', category: 'groceries', amount: '10', type: 'expense' });
assert.ok(error.textContent.includes('description'));
error = submit('transaction', { date: '2026-11-27', description: 'Fruit', category: 'groceries', amount: '1.111', type: 'expense' });
assert.ok(error.textContent.includes('two decimal'));
error = submit('transaction', { date: '2026-12-01', description: 'Fruit', category: 'groceries', amount: '1.11', type: 'expense' });
assert.ok(error.textContent.includes('November'));
error = submit('transaction', { date: '2026-11-27', description: 'Fruit', category: 'groceries', amount: '1.11', type: 'income' });
assert.ok(error.textContent.includes('category'));
assert.equal(saved().transactions.length, 28);
click('close-dialog');
console.log('PASS invalid descriptions, precision, dates, and type/category combinations');

route('/budgets');
submit('budget', { amount: '2800.00' }, 'housing');
assert.equal(saved().budgets.housing, 2800);
assert.equal(summary(saved()).budget, 6700);
assert.equal(summary(saved()).expenses, 6017.82);
assert.ok(app.innerHTML.includes('$6,700.00'));
submit('budget', { amount: '0' }, 'dining');
assert.equal(saved().budgets.dining, 0);
assert.equal(categorySnapshot(saved()).find(item => item.id === 'dining').percent, 100);
console.log('PASS budget saving, live totals, zero budget, and unchanged ledger');

route('/goals');
submit('goal', { amount: '500.00' }, 'emergency');
assert.equal(saved().goals[0].saved, 8900);
assert.equal(goalProjection(saved().goals[0]).finish, 'June 2027');
assert.ok(app.innerHTML.includes('$20,400.00'));
assert.equal(summary(saved()).expenses, 6017.82);
assert.equal(loadState(localStorage).goals[0].saved, 8900);
console.log('PASS add goal money, new finish month, persistence, no duplicate spending');

route('/bills');
click('toggle-bill', 'water');
assert.equal(saved().bills.find(item => item.id === 'water').paid, true);
assert.equal(billSummary(saved()).remaining, 89);
assert.ok(app.innerHTML.includes('$3,960.79'));
click('toggle-bill', 'water');
assert.equal(billSummary(saved()).remaining, 151);
assert.equal(summary(saved()).expenses, 6017.82);
console.log('PASS bill paid/unpaid toggle and reconciled checklist totals');

route('/transactions');
filter('search', 'Willow');
assert.ok(app.innerHTML.includes('Showing 2 of 28'));
filter('type', 'expense');
filter('category', 'groceries');
assert.ok(app.innerHTML.includes('Showing 2 of 28'));
filter('category', 'dining');
assert.ok(app.innerHTML.includes('Showing 0 of 28'));
assert.ok(app.innerHTML.includes('No matching transactions'));
click('clear-filters');
assert.ok(app.innerHTML.includes('Showing 28 of 28'));
console.log('PASS live search, combined type/category filters, empty state, clear filters');

click('reset');
assert.equal(dialog.open, true);
submit('reset');
assert.deepEqual(saved(), createDefaultState());
assert.ok(app.innerHTML.includes('Showing 28 of 28'));
assert.equal(window.__shotReady, true);
console.log('PASS reset restores transactions, budgets, goals, bills, and filters');

route('/bills');
const otherTabState = saved();
otherTabState.bills.at(-1).paid = true;
records.set(STORAGE_KEY, JSON.stringify(otherTabState));
for (const listener of windowListeners.get('storage') || []) listener({ key: STORAGE_KEY });
assert.ok(app.innerHTML.includes('$3,987.79'));
assert.ok(app.innerHTML.includes('$62.00'));
assert.ok(elements.toast.innerHTML.includes('another tab'));
console.log('PASS cross-tab refresh uses the same persisted state');

console.log('\nAll event-delegation interaction checks passed with a minimal host stub.');
console.log('This tests application handlers, not browser layout or real DOM behavior.');
