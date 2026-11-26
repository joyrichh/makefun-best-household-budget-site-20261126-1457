import { AS_OF, CATEGORIES, cents, loadState, saveState, resetState, STORAGE_KEY } from './data.js';
import { ROUTES, icon, escape, money, dashboard, transactions, budgets, goals, bills, reports, transactionForm, confirmDialog, categoryOptions } from './views.js';

const app = document.getElementById('app');
const dialog = document.getElementById('action-dialog');
const toastElement = document.getElementById('toast');
const indicator = document.getElementById('storage-indicator');
let state = loadState();
let filters = { search: '', type: '', category: '' };
let toastTimer;
let dialogTrigger;
let persistent = saveState(state);

const navigation = document.getElementById('navigation');
navigation.innerHTML = ROUTES.map((route, index) => `${index === 5 ? '<div class="nav-divider" aria-hidden="true"></div>' : ''}<a class="nav-link" href="#${escape(route.path)}">${icon(route.icon)}<span>${escape(route.label)}</span></a>`).join('');

function currentRoute() {
  const path = location.hash.slice(1) || '/';
  return ROUTES.find(route => route.path === path) || ROUTES[0];
}

function storageIndicator() {
  indicator.innerHTML = `<i></i>${persistent ? 'Saved on this device' : 'This session only'}`;
  indicator.classList.toggle('session-only', !persistent);
  indicator.title = persistent ? 'Your changes stay in this browser. No data is sent anywhere.' : 'Browser storage is unavailable. Your changes last until this page is closed.';
}

export function render() {
  window.__shotReady = false;
  const route = currentRoute();
  const renderers = { '/': dashboard, '/transactions': transactions, '/budgets': budgets, '/goals': goals, '/bills': bills, '/reports': reports };
  app.innerHTML = renderers[route.path](state, filters);
  document.getElementById('route-label').textContent = route.label;
  navigation.querySelectorAll('a').forEach(anchor => {
    const active = anchor.getAttribute('href') === `#${route.path}`;
    anchor.classList.toggle('active', active);
    if (active) anchor.setAttribute('aria-current', 'page');
    else anchor.removeAttribute('aria-current');
  });
  storageIndicator();
  window.__shotReady = true;
}

function toast(message, warning = false) {
  clearTimeout(toastTimer);
  toastElement.innerHTML = `${icon(warning ? 'info' : 'check')}<span>${escape(message)}</span>`;
  toastElement.hidden = false;
  toastTimer = setTimeout(() => { toastElement.hidden = true; }, warning ? 7000 : 3500);
}

function commit(message) {
  persistent = saveState(state);
  render();
  toast(persistent ? message : `${message} Storage unavailable — kept for this session only.`, !persistent);
}

function openDialog(content) {
  dialogTrigger = document.activeElement;
  dialog.innerHTML = content;
  dialog.showModal();
  const description = dialog.querySelector('[name="description"]');
  if (description) description.focus();
}

function closeDialog() {
  dialog.close();
}

dialog.addEventListener('close', () => {
  dialog.innerHTML = '';
  if (dialogTrigger?.isConnected) dialogTrigger.focus({ preventScroll: true });
  else app.querySelector('h1')?.focus({ preventScroll: true });
});

dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog();
});

document.addEventListener('click', event => {
  const skip = event.target.closest('[data-skip]');
  if (skip) {
    event.preventDefault();
    app.focus();
    app.scrollIntoView({ block: 'start' });
    return;
  }
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const action = control.dataset.action;
  const id = control.dataset.id;
  if (action === 'add-transaction') openDialog(transactionForm());
  if (action === 'edit-transaction' || action === 'delete-transaction') {
    const transaction = state.transactions.find(item => item.id === id);
    if (!transaction) return;
    openDialog(action === 'edit-transaction' ? transactionForm(transaction) : confirmDialog('delete', transaction));
  }
  if (action === 'close-dialog') closeDialog();
  if (action === 'reset') openDialog(confirmDialog('reset'));
  if (action === 'clear-filters') {
    filters = { search: '', type: '', category: '' };
    render();
    document.getElementById('transaction-search')?.focus({ preventScroll: true });
  }
  if (action === 'toggle-bill') {
    const bill = state.bills.find(item => item.id === id);
    if (!bill) return;
    bill.paid = !bill.paid;
    commit(`${bill.name} marked ${bill.paid ? 'paid' : 'unpaid'}.`);
    app.querySelector(`[data-action="toggle-bill"][data-id="${id}"]`)?.focus({ preventScroll: true });
  }
});

function updateFilter(control) {
  const key = control.dataset.filter;
  if (!Object.hasOwn(filters, key)) return;
  const caret = key === 'search' ? control.selectionStart : null;
  filters[key] = control.value;
  render();
  const replacement = app.querySelector(`[data-filter="${key}"]`);
  replacement?.focus({ preventScroll: true });
  if (key === 'search' && caret !== null) replacement?.setSelectionRange(caret, caret);
}

document.addEventListener('input', event => {
  if (event.target.matches('[data-filter="search"]')) updateFilter(event.target);
});

document.addEventListener('change', event => {
  const control = event.target;
  if (control.matches('select[data-filter]')) updateFilter(control);
  if (control.matches('form[data-form="transaction"] [name="type"]')) {
    const category = control.form.elements.category;
    category.innerHTML = control.value === 'income' ? '<option value="income">Income</option>' : categoryOptions('groceries');
  }
});

function validAmount(value, allowZero = false) {
  if (String(value).trim() === '') return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < (allowZero ? 0 : 0.01) || amount > 10000000
    || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.00001) return null;
  return cents(amount) / 100;
}

function formError(form, message) {
  const error = form.querySelector('.form-error');
  if (error) {
    error.textContent = message;
    error.hidden = false;
  } else toast(message, true);
}

document.addEventListener('submit', event => {
  const form = event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();
  if (!form.reportValidity()) return;
  const kind = form.dataset.form;
  const id = form.dataset.id;
  const values = new FormData(form);
  if (kind === 'transaction') {
    const amount = validAmount(values.get('amount'));
    const description = String(values.get('description') || '').trim();
    const date = String(values.get('date') || AS_OF);
    const type = values.get('type');
    const category = values.get('category');
    if (!description || description.length > 120) return formError(form, 'Add a description between 1 and 120 characters.');
    if (amount === null) return formError(form, 'Enter a positive amount with at most two decimal places.');
    if (!/^2026-11-(0[1-9]|[12]\d|30)$/.test(date)) return formError(form, 'Choose a date in November 2026.');
    if (!((type === 'income' && category === 'income') || (type === 'expense' && CATEGORIES.some(item => item.id === category)))) return formError(form, 'Choose a category that matches this transaction type.');
    const existingIndex = id ? state.transactions.findIndex(transaction => transaction.id === id) : -1;
    if (id && existingIndex === -1) return formError(form, 'That transaction is no longer available. Close this form and try again.');
    if (!id && state.transactions.length >= 10000) return formError(form, 'Your ledger is full. Remove an old entry before adding another.');
    const nextId = `tx-${Math.max(0, ...state.transactions.map(transaction => Number(transaction.id.slice(3)))) + 1}`;
    const transaction = { id: id || nextId, date, description, category, amount, type };
    if (existingIndex >= 0) state.transactions[existingIndex] = transaction;
    else state.transactions.push(transaction);
    closeDialog();
    commit(id ? 'Transaction updated. Everything is in sync.' : 'Transaction added. Every little detail counts.');
  }
  if (kind === 'delete') {
    state.transactions = state.transactions.filter(transaction => transaction.id !== id);
    closeDialog();
    commit('Transaction deleted. Your totals are up to date.');
  }
  if (kind === 'reset') {
    state = resetState();
    filters = { search: '', type: '', category: '' };
    closeDialog();
    commit('A fresh start. All sample data restored.');
  }
  if (kind === 'budget') {
    const amount = validAmount(values.get('amount'), true);
    if (amount === null) return formError(form, 'Enter a budget of $0.00 or more, with at most two decimals.');
    const category = CATEGORIES.find(item => item.id === id);
    if (!category) return;
    state.budgets[id] = amount;
    commit(`${category.name} budget saved at ${money(amount)}.`);
    app.querySelector(`#budget-${id}`)?.focus({ preventScroll: true });
  }
  if (kind === 'goal') {
    const amount = validAmount(values.get('amount'));
    const goal = state.goals.find(item => item.id === id);
    if (amount === null || !goal) return formError(form, 'Enter a positive amount with at most two decimal places.');
    const saved = (cents(goal.saved) + cents(amount)) / 100;
    if (saved > 10000000) return formError(form, 'The saved balance must be $10,000,000.00 or less.');
    goal.saved = saved;
    commit(`${money(amount)} closer to ${goal.name.toLowerCase()}. Nicely done!`);
    app.querySelector(`#goal-${id}`)?.focus({ preventScroll: true });
  }
});

window.addEventListener('hashchange', () => {
  if (dialog.open) closeDialog();
  if (!ROUTES.some(route => `#${route.path}` === location.hash)) history.replaceState(null, '', '#/');
  render();
  window.scrollTo(0, 0);
  app.querySelector('h1')?.focus({ preventScroll: true });
});

window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  if (dialog.open) closeDialog();
  state = loadState();
  render();
  toast('Your household budget was updated in another tab.');
});

if (!ROUTES.some(route => `#${route.path}` === location.hash)) history.replaceState(null, '', '#/');
render();
if (!persistent) toast('Storage is unavailable. Changes will last for this session only.', true);
