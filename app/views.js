import { CATEGORIES, MONTH_LABEL, AS_OF, summary, categorySnapshot, monthlyTrend, billSummary, goalSummary, goalProjection, filterTransactions, sum, subtract, percentage } from './data.js';
import { barChart, trendChart, shareChart } from './charts.js';

export const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
export const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const percent = value => `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)}%`;
const bounded = value => Math.max(0, Math.min(100, value));
const dateLabel = value => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));

export const ROUTES = [
  { path: '/', label: 'Dashboard', icon: 'grid' },
  { path: '/transactions', label: 'Transactions', icon: 'exchange' },
  { path: '/budgets', label: 'Budgets', icon: 'wallet' },
  { path: '/goals', label: 'Savings goals', icon: 'target' },
  { path: '/bills', label: 'Bills & payments', icon: 'receipt' },
  { path: '/reports', label: 'Reports & insights', icon: 'chart' },
];

export function icon(name, className = '') {
  const paths = {
    home: '<path d="m3 10 9-7 9 7M6 9v12h12V9M10 21v-8h4v8"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    exchange: '<path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4"/>',
    wallet: '<path d="M20 8V5a2 2 0 0 0-2-2L5 6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h15V8H5M20 12h-5v5h5"/><path d="M17 14.5h.01"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    receipt: '<path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3ZM9 7h6M9 11h6M9 15h3"/>',
    chart: '<path d="M4 3v17h17M8 15v-4m5 4V6m5 9V9"/>',
    basket: '<path d="m5 9 4-6m10 6-4-6M3 9h18l-2 11H5L3 9Zm6 4v3m6-3v3"/>',
    bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>',
    car: '<path d="m5 7 2-4h10l2 4 2 3v8H3v-8l2-3Zm0 0h14M3 11h18M6 18v3m12-3v3M6 14h2m8 0h2"/>',
    dining: '<path d="M5 3v6a3 3 0 0 0 6 0V3M8 3v18m12 0V3c-4 1-5 9 0 9"/>',
    family: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-4a6 6 0 0 1 12 0v4m1-17a3 3 0 0 1 0 6m3 11v-4a6 6 0 0 0-2-4"/>',
    shield: '<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z"/><path d="m8 12 3 3 5-6"/>',
    bag: '<path d="M4 7h16l-1 14H5L4 7Zm4 0V6a4 4 0 0 1 8 0v1"/>',
    heart: '<path d="M12 21S2 15 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 7-10 13-10 13Z"/>',
    play: '<rect x="2" y="4" width="20" height="16" rx="4"/><path d="m10 8 6 4-6 4V8Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    up: '<path d="m6 15 6-6 6 6M12 9v11"/>',
    down: '<path d="m6 9 6 6 6-6M12 15V4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6m10-6v6M3 11h18"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    edit: '<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14v6Z"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    leaf: '<path d="M20 3C6 1 0 10 7 17s16 1 13-14ZM5 20 16 9"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
    reset: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 4v3"/>',
    spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"/>',
  };
  return `<svg class="icon ${escape(className)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.wallet}</svg>`;
}

function heading(eyebrow, title, description, action = '') {
  return `<section class="page-heading"><div><p class="eyebrow">${escape(eyebrow)}</p><h1 tabindex="-1">${escape(title)}</h1><p class="page-description">${escape(description)}</p></div>${action}</section>`;
}

const addButton = () => `<button class="button button-primary" data-action="add-transaction">${icon('plus')}<span>Add transaction</span></button>`;
const link = (path, label) => `<a class="text-link" href="#${escape(path)}">${escape(label)}${icon('arrow')}</a>`;
const progress = (value, label, extra = '') => `<div class="progress ${escape(extra)}" role="progressbar" aria-label="${escape(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${bounded(value).toFixed(1)}"><span style="width:${bounded(value).toFixed(2)}%"></span></div>`;

function metric(label, value, note, symbol, className = '') {
  return `<article class="metric-card ${escape(className)}"><div class="metric-top"><span>${escape(label)}</span><span class="metric-icon">${icon(symbol)}</span></div><strong class="metric-value">${escape(money(value))}</strong><div class="metric-note">${note}</div></article>`;
}

function categoryPill(id) {
  const category = CATEGORIES.find(item => item.id === id);
  return `<span class="category-pill"><i style="background:${escape(category?.color || '#315747')}"></i>${escape(category?.name || 'Income')}</span>`;
}

function transactionRows(transactions, editable = false) {
  return transactions.map(transaction => {
    const category = CATEGORIES.find(item => item.id === transaction.category);
    const [merchant, ...detail] = transaction.description.split(' · ');
    return `<tr><td><div class="merchant"><span class="merchant-icon ${transaction.type === 'income' ? 'income-icon' : ''}" style="--category-color:${escape(category?.color || '#315747')}">${icon(category?.icon || 'down')}</span><span><strong>${escape(merchant)}</strong>${detail.length ? `<small>${escape(detail.join(' · '))}</small>` : ''}</span></div></td>
      <td><time datetime="${escape(transaction.date)}">${escape(dateLabel(transaction.date))}</time></td><td>${categoryPill(transaction.category)}</td>
      ${editable ? `<td><span class="type-label ${escape(transaction.type)}">${escape(transaction.type === 'income' ? 'Income' : 'Expense')}</span></td>` : ''}
      <td class="amount ${transaction.type === 'income' ? 'income-amount' : ''}">${transaction.type === 'income' ? '+' : '−'}${escape(money(transaction.amount))}</td>
      ${editable ? `<td><div class="row-actions"><button class="icon-button" data-action="edit-transaction" data-id="${escape(transaction.id)}" aria-label="Edit ${escape(transaction.description)}" title="Edit transaction">${icon('edit')}</button><button class="icon-button delete-button" data-action="delete-transaction" data-id="${escape(transaction.id)}" aria-label="Delete ${escape(transaction.description)}" title="Delete transaction">${icon('trash')}</button></div></td>` : ''}</tr>`;
  }).join('');
}

function table(transactions, editable = false) {
  return `<div class="table-scroll" role="region" aria-label="${editable ? 'All' : 'Recent'} transactions" tabindex="0"><table><caption class="sr-only">${escape(MONTH_LABEL)} household transactions</caption><thead><tr><th scope="col">Description</th><th scope="col">Date</th><th scope="col">Category</th>${editable ? '<th scope="col">Type</th>' : ''}<th class="amount" scope="col">Amount</th>${editable ? '<th class="actions-heading" scope="col">Actions</th>' : ''}</tr></thead><tbody>${transactions.length ? transactionRows(transactions, editable) : `<tr><td colspan="${editable ? 6 : 4}"><div class="empty-state">${icon('search')}<strong>No matching transactions</strong><p>Try another search, clear your filters, or add a transaction.</p></div></td></tr>`}</tbody></table></div>`;
}

function miniBill(bill) {
  return `<div class="mini-bill"><span class="date-tile"><small>NOV</small><strong>${escape(bill.day)}</strong></span><div><strong>${escape(bill.name)}</strong><small>${escape(bill.autopay ? 'Autopay' : 'Manual payment')}</small></div><b>${escape(money(bill.amount))}</b></div>`;
}

export function dashboard(state) {
  const totals = summary(state);
  const categories = categorySnapshot(state);
  const goals = goalSummary(state);
  const trend = monthlyTrend(state);
  const lastMonth = trend[trend.length - 2].total;
  const change = subtract(lastMonth, totals.expenses);
  const unpaid = state.bills.filter(bill => !bill.paid).sort((first, second) => first.day - second.day);
  const top = [...categories].sort((first, second) => second.actual - first.actual).slice(0, 3);
  const over = categories.filter(category => category.remaining < 0);
  const overTotal = sum(over.map(category => Math.abs(category.remaining)));
  return `${heading('THE RIVERA FAMILY', 'Your month, looking good.', 'A little clarity for the life you’re building together.', addButton())}
    <section class="metrics" aria-label="November cash flow">
      ${metric('Household income', totals.income, `${icon('family')}<span>Our family’s combined income</span>`, 'down')}
      ${metric('Total spending', totals.expenses, `${icon(change >= 0 ? 'down' : 'up')}<span>${escape(money(Math.abs(change)))} ${change >= 0 ? 'less' : 'more'} than October</span>`, 'up')}
      ${metric('Money remaining', totals.remaining, `${icon(totals.remaining >= 0 ? 'check' : 'info')}<span>${totals.income > 0 && totals.remaining >= 0 ? `${escape(percent(100 - totals.spentPercent))} of income still with you` : totals.remaining < 0 ? 'Spending is above this month’s income' : 'Add income to start planning your month'}</span>`, 'wallet', 'metric-highlight')}
    </section>
    <div class="dashboard-middle">
      <section class="card spending-card"><div class="card-heading"><div><h2>Where your money goes</h2><p>A place for every dollar.</p></div>${link('/budgets', 'View budgets')}</div><div class="chart-legend"><span><i class="legend-dot green-dot"></i>Actual spending</span><span><i class="legend-dot pale-dot"></i>Category budget</span></div>${barChart(categories)}<div class="card-bottom"><span>${icon(over.length ? 'info' : 'check')}${over.length ? `${escape(over.length)} ${over.length === 1 ? 'category needs' : 'categories need'} a little care` : 'Every category is within budget'}</span><strong>${escape(money(Math.abs(totals.budgetRemaining)))} ${totals.budgetRemaining >= 0 ? 'under budget' : 'over budget'}</strong></div></section>
      <div class="dashboard-side"><section class="savings-card"><div class="savings-top"><span class="eyebrow">SMALL STEPS. BIG DREAMS.</span>${icon('leaf')}</div><h2>Your future is<br>taking shape.</h2><div class="savings-total">${escape(money(goals.saved))}<span>saved toward our goals</span></div>${progress(goals.percent, 'Combined savings goals', 'light-progress')}<div class="savings-caption"><span>${escape(percent(goals.percent))} of ${escape(money(goals.target))}</span><span>${escape(state.goals.length)} family goals</span></div><a href="#/goals" class="savings-link">Keep the good going ${icon('arrow')}</a><svg class="savings-decoration" viewBox="0 0 150 150" fill="none" aria-hidden="true"><path d="M80 145V55M80 108C18 99 25 54 25 54c49-2 61 31 55 54ZM81 83c52-4 53-47 53-47-42-1-58 23-53 47ZM80 59C41 50 46 17 46 17c31 0 39 19 34 42Z" stroke="currentColor" stroke-width="1.3"/></svg></section>
      <aside class="gentle-note"><span class="note-icon">${icon(over.length ? 'dining' : 'spark')}</span><div><strong>${over.length ? 'A little food for thought' : 'Room to breathe'}</strong><p>${over.length ? `${escape(over.map(category => category.name).join(', '))} ${over.length === 1 ? 'is' : 'are'} ${escape(money(overTotal))} over plan. A small adjustment can bring things back into balance.` : `You’re ${escape(money(Math.abs(totals.budgetRemaining)))} within your monthly plan. Every mindful choice adds up.`}</p>${link('/reports', 'See your insights')}</div></aside></div>
    </div>
    <div class="dashboard-bottom"><section class="card recent-card"><div class="card-heading"><div><h2>The latest little things</h2><p>Recent transactions · ${escape(MONTH_LABEL)}</p></div>${link('/transactions', 'View all')}</div>${table(filterTransactions(state).slice(0, 4))}</section>
    <section class="card upcoming-card"><div class="card-heading"><div><h2>Coming up next</h2><p>${escape(unpaid.length)} unpaid ${unpaid.length === 1 ? 'bill' : 'bills'} this month</p></div>${icon('calendar')}</div>${unpaid.length ? unpaid.slice(0, 2).map(miniBill).join('') : '<div class="all-clear">All paid. That’s one less thing to think about.</div>'}<div class="upcoming-footer">${link('/bills', 'Manage bills')}</div></section></div>
    <section class="top-categories" aria-label="Top spending categories"><span>THE BIG PICTURE</span>${top.map(category => `<div><i style="background:${escape(category.color)}"></i>${escape(category.name)}<strong>${escape(money(category.actual))}</strong></div>`).join('')}</section>`;
}

export function transactions(state, filters) {
  const filtered = filterTransactions(state, filters);
  const total = summary(state);
  const filteredIncome = sum(filtered.filter(transaction => transaction.type === 'income').map(transaction => transaction.amount));
  const filteredExpense = sum(filtered.filter(transaction => transaction.type === 'expense').map(transaction => transaction.amount));
  return `${heading('THE EVERYDAY DETAILS', 'Every dollar has a story.', 'All your ins and outs, in one calm place.', addButton())}
    <section class="transaction-summary"><div><span>Money in</span><strong class="income-amount">${escape(money(total.income))}</strong></div><div><span>Money out</span><strong>${escape(money(total.expenses))}</strong></div><div><span>Net for November</span><strong>${escape(money(total.remaining))}</strong></div><span class="summary-note">${icon('lock')}Only saved on this device</span></section>
    <section class="card transaction-card"><div class="card-heading"><div><h2>All transactions <span class="count-badge">${escape(state.transactions.length)}</span></h2><p>${escape(MONTH_LABEL)} · Your household ledger</p></div><button class="button button-quiet reset-link" data-action="reset">${icon('reset')}<span>Reset to sample data</span></button></div>
      <div class="filter-bar"><label class="search-field">${icon('search')}<span class="sr-only">Search transactions</span><input id="transaction-search" name="search" type="search" data-filter="search" value="${escape(filters.search || '')}" placeholder="Search your transactions…" autocomplete="off"></label><label class="select-field"><span class="sr-only">Filter by type</span><select data-filter="type" aria-label="Filter by type"><option value="">All types</option><option value="income" ${filters.type === 'income' ? 'selected' : ''}>Income</option><option value="expense" ${filters.type === 'expense' ? 'selected' : ''}>Expense</option></select></label><label class="select-field"><span class="sr-only">Filter by category</span><select data-filter="category" aria-label="Filter by category"><option value="">All categories</option>${categoryOptions(filters.category, true)}</select></label><button class="button button-quiet clear-filters" data-action="clear-filters">Clear filters</button></div>
      <div class="filter-result" aria-live="polite">Showing ${escape(filtered.length)} of ${escape(state.transactions.length)} transactions <span>Filtered in: ${escape(money(filteredIncome))} · out: ${escape(money(filteredExpense))}</span></div>${table(filtered, true)}
      <div class="table-footnote">${icon('info')}All transactions are for November 2026. Changes update your dashboard, budgets, and reports.</div></section>`;
}

export function budgets(state) {
  const totals = summary(state);
  const categories = categorySnapshot(state);
  const over = categories.filter(category => category.remaining < 0);
  return `${heading('GIVE YOUR MONEY A LITTLE DIRECTION', 'A plan that fits your family.', 'Not about spending less on everything. Just more on what matters.')}
    <section class="metrics">${metric('Monthly spending plan', totals.budget, `${icon('wallet')}<span>${escape(categories.length)} thoughtfully planned categories</span>`, 'wallet')}${metric('Spent so far', totals.expenses, `${icon('chart')}<span>${escape(percent(percentage(totals.expenses, totals.budget)))} of the monthly plan</span>`, 'up')}${metric(totals.budgetRemaining >= 0 ? 'Left in your budget' : 'Over your budget', Math.abs(totals.budgetRemaining), `${icon(over.length ? 'info' : 'check')}<span>${escape(over.length)} ${over.length === 1 ? 'category' : 'categories'} over plan</span>`, 'leaf', 'metric-highlight')}</section>
    <div class="section-label"><h2>Your category budgets</h2><span>Adjust the plan as life happens.</span></div><div class="budget-grid">${categories.map(category => `<article class="card budget-card ${category.remaining < 0 ? 'over-budget' : ''}"><div class="budget-top"><span class="category-icon" style="--category-color:${escape(category.color)}">${icon(category.icon)}</span><h3>${escape(category.name)}</h3><span class="budget-status">${category.remaining < 0 ? 'Over plan' : 'On track'}</span></div><div class="budget-spent"><strong>${escape(money(category.actual))}</strong><span>of ${escape(money(category.budget))}</span></div>${progress(category.percent, `${category.name} budget used`)}<div class="budget-remaining"><span>${escape(money(Math.abs(category.remaining)))} ${category.remaining < 0 ? 'over budget' : 'remaining'}</span><span>${escape(percent(category.percent))} used</span></div><form data-form="budget" data-id="${escape(category.id)}" class="inline-money-form"><label for="budget-${escape(category.id)}">Monthly budget</label><div><span class="input-prefix">$</span><input id="budget-${escape(category.id)}" name="amount" type="number" min="0" max="10000000" step="0.01" value="${escape(category.budget.toFixed(2))}" required aria-label="${escape(category.name)} monthly budget"><button class="button button-small" type="submit">Save<span class="sr-only"> ${escape(category.name)} budget</span></button></div></form></article>`).join('')}</div><p class="help-note">${icon('info')}Actual spending comes directly from your November transactions. Saving a budget changes your plan, not your transactions.</p>`;
}

function goalArt(kind) {
  const drawings = {
    emergency: '<ellipse cx="150" cy="124" rx="76" ry="8" fill="#d8e1cf"/><path d="M150 48v68a9 9 0 0 0 18 0" fill="none" stroke="#315747" stroke-width="4" stroke-linecap="round"/><path d="M82 76a68 68 0 0 1 136 0c-10-9-23-9-34 0-10-9-23-9-34 0-10-9-23-9-34 0-11-9-24-9-34 0Z" fill="#819879" stroke="#315747" stroke-width="1.5"/><path d="M150 8c-20 20-34 43-34 68m34-68c20 20 34 43 34 68" fill="none" stroke="#315747" stroke-width="1.3"/><path d="m67 32-5 12m175-10-5 12M99 9l-4 10m116 87-4 10" stroke="#8f9e83" stroke-width="2.5" stroke-linecap="round"/><path d="m55 105 5-8 5 8-5 8-5-8Z" fill="#d1a15d"/>',
    vacation: '<circle cx="211" cy="36" r="22" fill="#e8be79"/><path d="M28 121c52-22 96 20 150 0s80-11 98-4" fill="none" stroke="#8daba1" stroke-width="2"/><path d="M54 137c57-18 84 14 139-1" fill="none" stroke="#bdcfc2" stroke-width="2"/><path d="m148 117 9-61" stroke="#8c7352" stroke-width="7" stroke-linecap="round"/><path d="M157 57c-35 9-48-6-48-6 18-18 39-14 48 6Z" fill="#7d9678"/><path d="M157 57c-16-27-3-48-3-48 23 15 23 34 3 48Z" fill="#5c7c62"/><path d="M157 57c27-26 46-14 46-14-8 22-24 26-46 14Z" fill="#78926b"/><path d="M157 57c-22 4-27 25-27 25 27 7 36-9 27-25Z" fill="#9aab80"/><path d="m95 116 19-21 18 23" fill="#e4b87c"/><path d="m54 47 7-4 7 4m13-10 7-4 7 4" fill="none" stroke="#a59a7a" stroke-width="1.5" stroke-linecap="round"/>',
    house: '<ellipse cx="150" cy="133" rx="89" ry="7" fill="#dddccf"/><path d="M99 69v60h100V69l-50-38-50 38Z" fill="#ece4d3" stroke="#7b896a" stroke-width="1.5"/><path d="m85 73 64-49 64 49" fill="none" stroke="#315747" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M168 39V23h15v28" fill="#aab48f"/><path d="M137 129V89h25v40" fill="#728c70"/><rect x="111" y="80" width="17" height="20" rx="1" fill="#c2ceb0"/><rect x="171" y="80" width="17" height="20" rx="1" fill="#c2ceb0"/><path d="M119 80v20m-8-10h17m51-10v20m-8-10h17" stroke="#f8f7ef" stroke-width="1.5"/><circle cx="156" cy="110" r="1.6" fill="#e8be79"/><path d="M70 129V89m0 23c-25-6-22-27-22-27 23-1 25 17 22 27Zm0-13c23-3 23-22 23-22-20 0-25 13-23 22Z" fill="#8da17e" stroke="#6d8869" stroke-width="1.4"/><path d="M223 129v-16" stroke="#7d916f" stroke-width="2"/><circle cx="223" cy="108" r="12" fill="#b2bf97"/>',
  };
  return `<svg class="goal-art" viewBox="0 0 300 150" fill="none" aria-hidden="true">${drawings[kind]}</svg>`;
}

export function goals(state) {
  const totals = goalSummary(state);
  const month = summary(state);
  return `${heading('FOR THE THINGS THAT MATTER', 'Big dreams. Small, steady steps.', 'A rainy-day cushion, a sunny escape, and a place to call ours.')}
    <section class="goal-overview"><div class="goal-overview-icon">${icon('leaf')}</div><div><span>Our future, so far</span><strong>${escape(money(totals.saved))}<small>of ${escape(money(totals.target))}</small></strong></div><div class="goal-overview-progress"><div><span>Every little bit counts.</span><strong>${escape(percent(totals.percent))}</strong></div>${progress(totals.percent, 'All savings goals')}</div><div class="monthly-contribution"><span>Growing by</span><strong>${escape(money(totals.contribution))}<small>/ month</small></strong></div></section>
    <div class="goals-grid">${state.goals.map(goal => {
      const projection = goalProjection(goal);
      const goalPercent = percentage(goal.saved, goal.target);
      return `<article class="card goal-card goal-${escape(goal.id)}"><div class="goal-art-wrap">${goalArt(goal.id)}<span class="goal-percent">${escape(percent(goalPercent))} saved</span></div><div class="goal-card-body"><h2>${escape(goal.name)}</h2><p>${escape(goal.description)}</p><div class="goal-amount"><strong>${escape(money(goal.saved))}</strong><span>of ${escape(money(goal.target))}</span></div>${progress(goalPercent, `${goal.name} saved`)}<div class="goal-details"><div><span>Monthly contribution</span><strong>${escape(money(goal.contribution))}</strong></div><div><span>${projection.months ? 'On track for' : 'You did it'}</span><strong>${escape(projection.finish)}</strong></div></div><form data-form="goal" data-id="${escape(goal.id)}" class="inline-money-form"><label for="goal-${escape(goal.id)}">Give this goal a little boost</label><div><span class="input-prefix">$</span><input id="goal-${escape(goal.id)}" name="amount" type="number" min="0.01" max="${escape(Math.max(0, 10000000 - goal.saved).toFixed(2))}" step="0.01" required placeholder="0.00" aria-label="Add money to ${escape(goal.name)}"><button class="button button-small" type="submit">${icon('plus')}Add money</button></div></form></div></article>`;
    }).join('')}</div>
    <section class="card savings-plan"><span class="plan-icon">${icon('spark')}</span><div><h2>A little consistency goes a long way.</h2><p>Your monthly plan puts ${escape(money(totals.contribution))} toward these dreams. With ${escape(money(month.remaining))} left after spending, that leaves ${escape(money(month.afterSavings))} ${month.afterSavings >= 0 ? 'of breathing room' : 'to find for your savings plan'}.</p></div><a class="button button-secondary" href="#/budgets">See our budget${icon('arrow')}</a></section><p class="help-note">${icon('info')}Projections start with December 2026 contributions, rounded up to full months; no interest assumed. Goal balances are separate savings snapshots. Adding money here does not add a transaction.</p>`;
}

export function bills(state) {
  const totals = billSummary(state);
  return `${heading('ONE LESS THING TO REMEMBER', 'Home life, handled.', 'Your recurring bills for November. A little order, a lot of peace of mind.')}
    <section class="metrics">${metric('Total bills this month', totals.total, `${icon('receipt')}<span>${escape(state.bills.length)} recurring household bills</span>`, 'receipt')}${metric('Already taken care of', totals.paid, `${icon('check')}<span>${escape(totals.paidCount)} of ${escape(state.bills.length)} bills paid</span>`, 'shield')}${metric('Still to pay', totals.remaining, `${icon('calendar')}<span>${escape(state.bills.length - totals.paidCount)} ${state.bills.length - totals.paidCount === 1 ? 'bill' : 'bills'} remaining this month</span>`, 'clock', 'metric-highlight')}</section>
    <section class="card bills-card"><div class="card-heading"><div><h2>The monthly essentials</h2><p>Listed by due date · ${escape(MONTH_LABEL)}</p></div><span class="status-badge">${escape(percent(percentage(totals.paid, totals.total)))} paid</span></div>${progress(percentage(totals.paid, totals.total), 'Bills paid', 'bill-progress')}<div class="table-scroll" role="region" aria-label="Recurring bills" tabindex="0"><table><caption class="sr-only">November 2026 recurring bill checklist</caption><thead><tr><th scope="col">Bill &amp; provider</th><th scope="col">Due date</th><th scope="col">Payment</th><th class="amount" scope="col">Amount</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead><tbody>${[...state.bills].sort((first, second) => first.day - second.day).map(bill => {
      const category = CATEGORIES.find(item => item.id === bill.category);
      return `<tr class="${!bill.paid ? 'unpaid-row' : ''}"><td><div class="merchant"><span class="merchant-icon" style="--category-color:${escape(category.color)}">${icon(category.icon)}</span><span><strong>${escape(bill.name)}</strong><small>${escape(bill.provider)}</small></span></div></td><td><span class="bill-date">Nov ${escape(bill.day)}</span>${!bill.paid && bill.day < Number(AS_OF.slice(-2)) ? '<small class="overdue-label">Overdue</small>' : ''}</td><td><span class="payment-method">${icon(bill.autopay ? 'exchange' : 'wallet')}${bill.autopay ? 'Autopay' : 'Manual'}</span></td><td class="amount">${escape(money(bill.amount))}</td><td><span class="bill-status ${bill.paid ? 'is-paid' : 'is-unpaid'}">${icon(bill.paid ? 'check' : 'clock')}${bill.paid ? 'Paid' : 'Unpaid'}</span></td><td><button class="button button-small ${bill.paid ? 'button-quiet' : 'button-secondary'}" data-action="toggle-bill" data-id="${escape(bill.id)}">Mark ${bill.paid ? 'unpaid' : 'paid'}<span class="sr-only">: ${escape(bill.name)}</span></button></td></tr>`;
    }).join('')}</tbody></table></div></section><p class="help-note">${icon('info')}A checklist, not a second charge. Marking a bill paid does not create a transaction or change your spending totals. Status is for November 2026.</p>`;
}

function insights(state) {
  const categories = categorySnapshot(state);
  const find = id => categories.find(category => category.id === id);
  const dining = find('dining');
  const groceries = find('groceries');
  const subscriptions = find('subscriptions');
  const transport = find('transport');
  const trend = monthlyTrend(state);
  const change = subtract(trend[trend.length - 2].total, trend[trend.length - 1].total);
  const fuel = sum(state.transactions.filter(transaction => transaction.category === 'transport' && /fuel/i.test(transaction.description)).map(transaction => transaction.amount));
  const diningCount = state.transactions.filter(transaction => transaction.category === 'dining' && transaction.type === 'expense').length;
  return [
    { icon: 'dining', title: dining.remaining < 0 ? 'Make room for a night in.' : 'Keep dining intentional.', text: `Dining out is ${money(dining.actual)} ${dining.remaining < 0 ? `— ${money(Math.abs(dining.remaining))} above` : `— ${money(dining.remaining)} below`} your ${money(dining.budget)} plan. ${diningCount ? `Across ${diningCount} visits, that’s ${money(Math.round(dining.actual / diningCount * 100) / 100)} per visit. Replacing one outing with a meal at home can help.` : 'Plan your next meal out before you spend.'}` },
    { icon: 'basket', title: 'Let the grocery list do the work.', text: `Groceries total ${money(groceries.actual)}, compared with ${money(dining.actual)} eating out. ${groceries.remaining >= 0 ? `You have ${money(groceries.remaining)} left in the grocery plan. Build a few dinners around what’s already in the pantry.` : `Groceries are ${money(Math.abs(groceries.remaining))} over plan. A shared shopping list can keep the next trip focused.`}` },
    { icon: 'play', title: 'Small subscriptions add up.', text: `Your subscriptions cost ${money(subscriptions.actual)} this month. At that pace, that’s ${money(Math.round(subscriptions.actual * 1200) / 100)} a year. Check which ones your family still uses before the next renewal.` },
    { icon: 'car', title: 'A little less running around.', text: `Transport is ${money(transport.actual)}, including ${money(fuel)} at fuel stops. Combining errands into one trip could make your ${money(transport.budget)} transport plan go further.` },
    { icon: 'leaf', title: change >= 0 ? 'Keep the good momentum.' : 'A fresh chance to rebalance.', text: `November spending is ${money(Math.abs(change))} ${change >= 0 ? 'lower' : 'higher'} than October’s ${money(trend[trend.length - 2].total)}. ${change >= 0 ? 'Consider moving a little of the difference to a savings goal.' : 'Look at the categories that changed most before setting next month’s plan.'}` },
  ];
}

export function reports(state) {
  const trend = monthlyTrend(state);
  const categories = categorySnapshot(state).sort((first, second) => second.actual - first.actual);
  const total = summary(state);
  const average = sum(trend.map(month => month.total)) / trend.length;
  const change = subtract(trend[trend.length - 2].total, total.expenses);
  return `${heading('ZOOM OUT. FEEL MORE IN CONTROL.', 'A little perspective pays off.', 'See the patterns, celebrate the progress, and find your next small win.')}
    <section class="metrics">${metric('November spending', total.expenses, `${icon('calendar')}<span>From your November transactions</span>`, 'wallet')}${metric('Six-month average', Math.round(average * 100) / 100, `${icon('chart')}<span>June through November 2026</span>`, 'chart')}${metric(change >= 0 ? 'Less than last month' : 'More than last month', Math.abs(change), `${icon(change >= 0 ? 'down' : 'up')}<span>${escape(percent(percentage(Math.abs(change), trend[trend.length - 2].total)))} ${change >= 0 ? 'decrease' : 'increase'} from October</span>`, 'leaf', 'metric-highlight')}</section>
    <div class="report-charts"><section class="card trend-card"><div class="card-heading"><div><h2>The bigger picture</h2><p>Household spending · Jun–Nov 2026</p></div><span class="chart-period">6 months</span></div><div class="trend-scroll" tabindex="0" role="region" aria-label="Six month spending chart">${trendChart(trend)}</div><div class="trend-note">${icon('info')}November updates with your transactions. Earlier months are category-level records.</div></section><section class="card share-card"><div class="card-heading"><div><h2>A slice of the month</h2><p>November spending by category</p></div></div>${shareChart(categories)}<ul class="share-legend">${categories.map(category => `<li><i style="background:${escape(category.color)}"></i><span>${escape(category.name)}</span><strong>${escape(percent(percentage(category.actual, total.expenses)))}</strong><span class="share-amount">${escape(money(category.actual))}</span></li>`).join('')}</ul></section></div>
    <div class="section-label insights-heading"><div><p class="eyebrow">LESS GUESSWORK, MORE GOOD HABITS</p><h2>Little changes, real possibilities.</h2></div><span>From your actual numbers</span></div><div class="insights-grid">${insights(state).map(tip => `<article class="card insight-card"><span class="insight-icon">${icon(tip.icon)}</span><div><h3>${escape(tip.title)}</h3><p>${escape(tip.text)}</p></div></article>`).join('')}</div>`;
}

export function categoryOptions(selected = '', includeIncome = false) {
  return `${includeIncome ? `<option value="income" ${selected === 'income' ? 'selected' : ''}>Income</option>` : ''}${CATEGORIES.map(category => `<option value="${escape(category.id)}" ${selected === category.id ? 'selected' : ''}>${escape(category.name)}</option>`).join('')}`;
}

export function transactionForm(transaction = null) {
  const isIncome = transaction?.type === 'income';
  return `<form data-form="transaction" ${transaction ? `data-id="${escape(transaction.id)}"` : ''}><div class="dialog-heading"><div><p class="eyebrow">THE EVERYDAY DETAILS</p><h2 id="dialog-title">${transaction ? 'Edit transaction' : 'Add a little detail.'}</h2></div><button type="button" class="icon-button" data-action="close-dialog" aria-label="Close dialog">${icon('close')}</button></div><p class="dialog-description">${transaction ? 'Make it right. Your totals will update automatically.' : 'Record money in or out. We’ll take care of the totals.'}</p><div class="form-grid"><label>Type<select name="type"><option value="expense" ${!isIncome ? 'selected' : ''}>Expense</option><option value="income" ${isIncome ? 'selected' : ''}>Income</option></select></label><label>Date<input type="date" name="date" value="${escape(transaction?.date || AS_OF)}" min="2026-11-01" max="2026-11-30" required></label><label class="full-width">Description<input name="description" maxlength="120" value="${escape(transaction?.description || '')}" placeholder="e.g. Willow Market · weekly groceries" required autocomplete="off"></label><label>Category<select name="category">${isIncome ? '<option value="income">Income</option>' : categoryOptions(transaction?.category || 'groceries')}</select></label><label>Amount (USD)<input type="number" name="amount" value="${transaction ? escape(transaction.amount.toFixed(2)) : ''}" placeholder="0.00" min="0.01" max="10000000" step="0.01" required></label></div><p class="form-error" id="form-error" role="alert" hidden></p><div class="dialog-footer"><button class="button button-secondary" type="button" data-action="close-dialog">Cancel</button><button class="button button-primary" type="submit">${icon('check')}${transaction ? 'Save changes' : 'Add transaction'}</button></div></form>`;
}

export function confirmDialog(kind, transaction) {
  const resetting = kind === 'reset';
  return `<form data-form="${resetting ? 'reset' : 'delete'}" ${!resetting ? `data-id="${escape(transaction.id)}"` : ''}><div class="dialog-heading"><h2 id="dialog-title">${resetting ? 'A fresh start?' : 'Delete this transaction?'}</h2><button class="icon-button" type="button" data-action="close-dialog" aria-label="Close dialog">${icon('close')}</button></div><p class="dialog-description">${resetting ? 'This restores all sample transactions, budgets, savings goals, and bill statuses. Your changes on this device will be lost.' : `${escape(transaction.description)} · ${escape(money(transaction.amount))}. This removes it from your ledger and updates all spending totals. This cannot be undone.`}</p><div class="dialog-footer"><button class="button button-secondary" data-action="close-dialog" type="button">Keep ${resetting ? 'my changes' : 'transaction'}</button><button class="button ${resetting ? 'button-primary' : 'button-danger'}" type="submit">${resetting ? 'Reset to sample data' : 'Delete transaction'}</button></div></form>`;
}
