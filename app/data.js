export const MONTH = '2026-11';
export const MONTH_LABEL = 'November 2026';
export const AS_OF = '2026-11-26';
export const STORAGE_KEY = 'rivera-household-budget:v1';

export const CATEGORIES = [
  { id: 'housing', name: 'Home & mortgage', icon: 'home', color: '#315747', budget: 2600 },
  { id: 'groceries', name: 'Groceries', icon: 'basket', color: '#7f9774', budget: 950 },
  { id: 'utilities', name: 'Utilities', icon: 'bolt', color: '#b1bd94', budget: 400 },
  { id: 'transport', name: 'Transport', icon: 'car', color: '#799394', budget: 750 },
  { id: 'dining', name: 'Dining out', icon: 'dining', color: '#ce9a52', budget: 350 },
  { id: 'family', name: 'Kids & family', icon: 'family', color: '#b4a387', budget: 450 },
  { id: 'insurance', name: 'Insurance', icon: 'shield', color: '#5f8271', budget: 400 },
  { id: 'shopping', name: 'Shopping', icon: 'bag', color: '#b89182', budget: 350 },
  { id: 'health', name: 'Health & fitness', icon: 'heart', color: '#a7b783', budget: 150 },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'play', color: '#9d9aaf', budget: 100 },
];

const transactionRows = [
  ['01', 'Maple Street · mortgage', 'housing', 2500],
  ['02', 'Maya Rivera · Northstar Design · payroll', 'income', 4850],
  ['02', 'Jordan Rivera · Oakwood School · payroll', 'income', 4150],
  ['03', 'FreshMart · weekly groceries', 'groceries', 248.65],
  ['04', 'Oakwood School · lunch plan', 'family', 190],
  ['05', 'Fiber Home · internet', 'utilities', 75],
  ['05', 'Family Music · subscription', 'subscriptions', 16.99],
  ['06', 'Highway Fuel · fill-up', 'transport', 104.60],
  ['07', 'Cedar Table · family dinner', 'dining', 83.40],
  ['08', 'City Energy · electricity', 'utilities', 146.80],
  ['09', 'FreshMart · weekly groceries', 'groceries', 287.40],
  ['10', 'Oakwood Soccer · kids club', 'family', 128],
  ['11', 'Home & More · home essentials', 'shopping', 146.45],
  ['12', 'Maple Dental · copay', 'health', 65.80],
  ['13', 'Luna Taco · Friday takeout', 'dining', 65.80],
  ['14', 'Willow Market · groceries', 'groceries', 196.80],
  ['15', 'Connect Mobile · family plan', 'utilities', 140],
  ['16', 'Highway Fuel · fill-up', 'transport', 125.80],
  ['17', 'Oakwood School · art supplies', 'family', 80],
  ['18', 'Evergreen · family insurance', 'insurance', 360],
  ['19', 'The Green Fork · dinner', 'dining', 112.90],
  ['20', 'Community Credit · car payment', 'transport', 465],
  ['21', 'Trail & Co. · kids winter jackets', 'shopping', 140],
  ['22', 'Neighborhood Pharmacy', 'health', 34.20],
  ['23', 'Family Cloud · storage', 'subscriptions', 9.99],
  ['24', 'Stream Together · family plan', 'subscriptions', 21.99],
  ['25', 'Sunday Table · family celebration', 'dining', 150.50],
  ['26', 'Willow Market · Thanksgiving shop', 'groceries', 121.75],
];

const historyRows = [
  ['Jun', '2026-06', [2400, 817.20, 352.40, 728.50, 485.60, 460, 360, 342.80, 120, 48.97]],
  ['Jul', '2026-07', [2400, 922.45, 390.20, 754.10, 531.30, 525, 360, 408.60, 145.50, 48.97]],
  ['Aug', '2026-08', [2400, 888.60, 421.30, 706.20, 448.80, 612.50, 360, 295.40, 180, 48.97]],
  ['Sep', '2026-09', [2400, 838.20, 375.60, 681.40, 395.20, 430, 360, 258.90, 115, 48.97]],
  ['Oct', '2026-10', [2400, 902.80, 364.50, 720.80, 458.90, 375, 360, 366.25, 95, 48.97]],
];

export const HISTORY = historyRows.map(([month, date, amounts]) => ({
  month, date, categories: Object.fromEntries(CATEGORIES.map((category, index) => [category.id, amounts[index]])),
}));

export const DEFAULT_STATE = {
  transactions: transactionRows.map(([day, description, category, amount], index) => ({
    id: `tx-${index + 1}`, date: `${MONTH}-${day}`, description, category, amount,
    type: category === 'income' ? 'income' : 'expense',
  })),
  budgets: Object.fromEntries(CATEGORIES.map(category => [category.id, category.budget])),
  goals: [
    { id: 'emergency', name: 'Emergency Fund', target: 12000, saved: 8400, contribution: 500, icon: 'shield', description: 'Peace of mind, whatever comes our way.' },
    { id: 'vacation', name: 'Family Vacation', target: 3500, saved: 1750, contribution: 250, icon: 'sun', description: 'A little adventure. A lot of memories.' },
    { id: 'house', name: 'House Down Payment', target: 25000, saved: 9750, contribution: 450, icon: 'home', description: 'A place for our next chapter.' },
  ],
  bills: [
    { id: 'mortgage', name: 'Home mortgage', provider: 'Maple Street', amount: 2500, day: 1, autopay: true, paid: true, category: 'housing' },
    { id: 'lunch', name: 'School lunch', provider: 'Oakwood School', amount: 190, day: 4, autopay: false, paid: true, category: 'family' },
    { id: 'internet', name: 'Internet', provider: 'Fiber Home', amount: 75, day: 5, autopay: true, paid: true, category: 'utilities' },
    { id: 'electricity', name: 'Electricity', provider: 'City Energy', amount: 146.80, day: 8, autopay: true, paid: true, category: 'utilities' },
    { id: 'phone', name: 'Family phone plan', provider: 'Connect Mobile', amount: 140, day: 15, autopay: true, paid: true, category: 'utilities' },
    { id: 'insurance', name: 'Family insurance', provider: 'Evergreen', amount: 360, day: 18, autopay: true, paid: true, category: 'insurance' },
    { id: 'car', name: 'Car payment', provider: 'Community Credit', amount: 465, day: 20, autopay: true, paid: true, category: 'transport' },
    { id: 'streaming', name: 'Streaming', provider: 'Stream Together', amount: 21.99, day: 24, autopay: true, paid: true, category: 'subscriptions' },
    { id: 'water', name: 'Water & sewer', provider: 'City Water', amount: 62, day: 29, autopay: false, paid: false, category: 'utilities' },
    { id: 'gym', name: 'Gym membership', provider: 'Neighborhood Fitness', amount: 89, day: 30, autopay: false, paid: false, category: 'health' },
  ],
};

export const cents = amount => Math.round(Number(amount) * 100);
export const sum = amounts => amounts.reduce((total, amount) => total + cents(amount), 0) / 100;
export const subtract = (first, second) => (cents(first) - cents(second)) / 100;
export const percentage = (part, whole) => whole > 0 ? part / whole * 100 : 0;
export const createDefaultState = () => structuredClone(DEFAULT_STATE);

export function categorySnapshot(state) {
  return CATEGORIES.map(category => {
    const actual = sum(state.transactions.filter(transaction => transaction.type === 'expense' && transaction.category === category.id).map(transaction => transaction.amount));
    const budget = state.budgets[category.id];
    return { ...category, actual, budget, remaining: subtract(budget, actual), percent: budget === 0 && actual > 0 ? 100 : percentage(actual, budget) };
  });
}

export function summary(state) {
  const income = sum(state.transactions.filter(transaction => transaction.type === 'income').map(transaction => transaction.amount));
  const expenses = sum(state.transactions.filter(transaction => transaction.type === 'expense').map(transaction => transaction.amount));
  const budget = sum(Object.values(state.budgets));
  const contribution = sum(state.goals.map(goal => goal.contribution));
  return { income, expenses, remaining: subtract(income, expenses), budget,
    budgetRemaining: subtract(budget, expenses), contribution, afterSavings: subtract(subtract(income, expenses), contribution),
    spentPercent: percentage(expenses, income) };
}

export function monthlyTrend(state) {
  return [...HISTORY.map(month => ({ ...month, total: sum(Object.values(month.categories)) })),
    { month: 'Nov', date: MONTH, total: summary(state).expenses,
      categories: Object.fromEntries(categorySnapshot(state).map(category => [category.id, category.actual])) }];
}

export function billSummary(state) {
  const total = sum(state.bills.map(bill => bill.amount));
  const paid = sum(state.bills.filter(bill => bill.paid).map(bill => bill.amount));
  return { total, paid, remaining: subtract(total, paid), paidCount: state.bills.filter(bill => bill.paid).length };
}

export function goalSummary(state) {
  const saved = sum(state.goals.map(goal => goal.saved));
  const target = sum(state.goals.map(goal => goal.target));
  return { saved, target, remaining: Math.max(0, subtract(target, saved)), percent: percentage(saved, target),
    contribution: sum(state.goals.map(goal => goal.contribution)) };
}

export function goalProjection(goal) {
  const months = Math.ceil(Math.max(0, cents(goal.target) - cents(goal.saved)) / cents(goal.contribution));
  return { months, finish: months === 0 ? 'Goal reached!' : new Intl.DateTimeFormat('en-US', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(Date.UTC(2026, 10 + months, 1))) };
}

export function filterTransactions(state, filters = {}) {
  const query = (filters.search || '').trim().toLowerCase();
  return state.transactions.filter(transaction => {
    const category = CATEGORIES.find(item => item.id === transaction.category)?.name || 'Income';
    return (!filters.type || transaction.type === filters.type)
      && (!filters.category || transaction.category === filters.category)
      && (!query || `${transaction.description} ${category} ${transaction.date} ${transaction.amount}`.toLowerCase().includes(query));
  }).sort((first, second) => second.date.localeCompare(first.date) || Number(second.id.slice(3)) - Number(first.id.slice(3)));
}

function browserStorage() {
  try { return globalThis.localStorage; } catch { return null; }
}

const validMoney = amount => typeof amount === 'number' && Number.isFinite(amount) && amount >= 0 && amount <= 10000000 && Math.abs(amount * 100 - Math.round(amount * 100)) < 0.00001;

function validState(candidate) {
  if (!candidate || !Array.isArray(candidate.transactions) || candidate.transactions.length > 10000 || !candidate.budgets
    || !Array.isArray(candidate.goals) || !Array.isArray(candidate.bills)) return false;
  const ids = new Set();
  const transactionsValid = candidate.transactions.every(transaction => {
    if (!transaction || typeof transaction.id !== 'string' || !/^tx-\d{1,9}$/.test(transaction.id) || ids.has(transaction.id)) return false;
    ids.add(transaction.id);
    return typeof transaction.date === 'string' && /^2026-11-(0[1-9]|[12]\d|30)$/.test(transaction.date)
      && typeof transaction.description === 'string' && transaction.description.trim().length > 0 && transaction.description.length <= 120
      && validMoney(transaction.amount) && transaction.amount > 0
      && ((transaction.type === 'income' && transaction.category === 'income')
        || (transaction.type === 'expense' && CATEGORIES.some(category => category.id === transaction.category)));
  });
  return transactionsValid && CATEGORIES.every(category => validMoney(candidate.budgets[category.id]))
    && candidate.goals.length === DEFAULT_STATE.goals.length
    && DEFAULT_STATE.goals.every(goal => candidate.goals.filter(item => item?.id === goal.id && validMoney(item.saved)).length === 1)
    && candidate.bills.length === DEFAULT_STATE.bills.length
    && DEFAULT_STATE.bills.every(bill => candidate.bills.filter(item => item?.id === bill.id && typeof item.paid === 'boolean').length === 1);
}

export function loadState(storage = browserStorage()) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const candidate = JSON.parse(raw);
    if (!validState(candidate)) return createDefaultState();
    const state = createDefaultState();
    state.transactions = candidate.transactions.map(({ id, date, description, category, amount, type }) => ({ id, date, description, category, amount, type }));
    state.budgets = Object.fromEntries(CATEGORIES.map(category => [category.id, candidate.budgets[category.id]]));
    state.goals.forEach(goal => { goal.saved = candidate.goals.find(item => item.id === goal.id).saved; });
    state.bills.forEach(bill => { bill.paid = candidate.bills.find(item => item.id === bill.id).paid; });
    return state;
  } catch { return createDefaultState(); }
}

export function saveState(state, storage = browserStorage()) {
  try {
    if (!storage) return false;
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch { return false; }
}

export function resetState(storage = browserStorage()) {
  const state = createDefaultState();
  saveState(state, storage);
  return state;
}
