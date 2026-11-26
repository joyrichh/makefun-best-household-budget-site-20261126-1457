const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const positive = value => Math.max(0, Number(value) || 0);
const coordinate = value => Number(value).toFixed(2);

export function barChart(categories) {
  const max = Math.max(1, ...categories.flatMap(category => [positive(category.actual), positive(category.budget)]));
  const rows = categories.map((category, index) => {
    const y = 16 + index * 27;
    const over = category.actual > category.budget;
    return `<g><title>${escape(category.name)}: ${escape(money(category.actual))} spent of ${escape(money(category.budget))}</title>
      <text x="0" y="${y + 4}" class="chart-label">${escape(category.name)}</text>
      <rect x="131" y="${y - 6}" width="${coordinate(positive(category.budget) / max * 280)}" height="12" rx="4" fill="#edf0e9"/>
      <rect x="131" y="${y - 6}" width="${coordinate(positive(category.actual) / max * 280)}" height="12" rx="4" fill="${over ? '#ce9a52' : escape(category.color)}"/>
      <text x="508" y="${y + 4}" class="chart-value${over ? ' chart-over' : ''}" text-anchor="end">${escape(money(category.actual))}</text>
    </g>`;
  }).join('');
  const mobileRows = categories.map((category, index) => {
    const y = 12 + index * 33;
    return `<g><text x="0" y="${y}" class="chart-label">${escape(category.name)}</text>
      <text x="320" y="${y}" class="chart-value${category.actual > category.budget ? ' chart-over' : ''}" text-anchor="end">${escape(money(category.actual))}</text>
      <rect x="0" y="${y + 7}" width="${coordinate(positive(category.budget) / max * 320)}" height="6" rx="3" fill="#edf0e9"/>
      <rect x="0" y="${y + 7}" width="${coordinate(positive(category.actual) / max * 320)}" height="6" rx="3" fill="${escape(category.color)}"/></g>`;
  }).join('');
  return `<svg class="category-chart chart-wide" viewBox="0 0 514 ${categories.length * 27 + 10}" role="img" aria-label="November spending by category compared with budgets. Bars start at zero.">${rows}</svg>
    <svg class="category-chart chart-narrow" viewBox="0 0 320 ${categories.length * 33}" role="img" aria-label="November spending by category compared with budgets. Bars start at zero.">${mobileRows}</svg>`;
}

export function trendChart(months) {
  const width = 660;
  const left = 58;
  const top = 38;
  const plotHeight = 205;
  const plotWidth = 580;
  const maximum = Math.max(2000, Math.ceil(Math.max(0, ...months.map(month => positive(month.total))) / 2000) * 2000);
  const step = plotWidth / Math.max(1, months.length);
  const ticks = Array.from({ length: 5 }, (_, index) => {
    const value = maximum * index / 4;
    const y = top + plotHeight - index * plotHeight / 4;
    return `<g><line x1="${left}" x2="${left + plotWidth}" y1="${y}" y2="${y}" stroke="#e6eae2" stroke-dasharray="3 5"/>
      <text x="45" y="${y + 4}" text-anchor="end" class="axis-label">$${escape((value / 1000).toFixed(value % 1000 === 0 ? 0 : 1))}k</text></g>`;
  }).join('');
  const bars = months.map((month, index) => {
    const x = left + index * step + (step - 47) / 2;
    const height = positive(month.total) / maximum * plotHeight;
    const y = top + plotHeight - height;
    const current = index === months.length - 1;
    return `<g><title>${escape(month.month)} 2026: ${escape(money(month.total))}</title>
      <rect x="${coordinate(x)}" y="${coordinate(y)}" width="47" height="${coordinate(height)}" rx="5" fill="${current ? '#315747' : '#d8e1d1'}"/>
      <text x="${coordinate(x + 23.5)}" y="${coordinate(y - 12)}" text-anchor="middle" class="chart-value">${escape(money(month.total))}</text>
      <text x="${coordinate(x + 23.5)}" y="269" text-anchor="middle" class="axis-label${current ? ' current-month' : ''}">${escape(month.month)}</text></g>`;
  }).join('');
  return `<svg class="trend-chart" viewBox="0 0 ${width} 286" role="img" aria-label="Monthly household spending, June to November 2026. Dollar axis begins at zero.">${ticks}${bars}</svg>`;
}

export function shareChart(categories) {
  const total = categories.reduce((amount, category) => amount + Math.round(positive(category.actual) * 100), 0);
  let offset = 0;
  const segments = categories.map(category => {
    const percent = total ? Math.round(positive(category.actual) * 100) / total * 100 : 0;
    const segment = `<circle cx="90" cy="90" r="66" fill="none" stroke="${escape(category.color)}" stroke-width="19" pathLength="100" stroke-dasharray="${coordinate(percent)} ${coordinate(100 - percent)}" stroke-dashoffset="${coordinate(-offset)}" transform="rotate(-90 90 90)"><title>${escape(category.name)}: ${escape(money(category.actual))}, ${percent.toFixed(1)}%</title></circle>`;
    offset += percent;
    return segment;
  }).join('');
  return `<svg class="share-chart" viewBox="0 0 180 180" role="img" aria-label="Share of November spending by category"><circle cx="90" cy="90" r="66" fill="none" stroke="#edf0e9" stroke-width="19"/>${segments}<text x="90" y="86" text-anchor="middle" class="donut-label">TOTAL SPENT</text><text x="90" y="108" text-anchor="middle" class="donut-value">${escape(money(total / 100))}</text></svg>`;
}
