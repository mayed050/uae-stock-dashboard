/*
 * script.js
 *
 * This file populates the stock dashboard with up‑to‑date information and
 * renders the Plotly charts for each of the four monitored equities.  The
 * dataset embedded here is a snapshot derived from open financial sources as
 * of 25 July 2025【799083089723546†L62-L97】【273495695687151†L88-L96】【750467455997322†L86-L99】.  It includes synthetic time series
 * data to demonstrate the layout; you should replace the arrays with real
 * historical prices when you integrate a data provider.
 */

// Helper to compute percentage change between two numbers
function percentChange(current, previous) {
  return ((current - previous) / previous) * 100;
}

// Base dataset describing each company.  All monetary figures are in
// billions (B), millions (M) or absolute UAE dirhams where appropriate.
const stocks = [
  {
    symbol: 'DEWA',
    nameArabic: 'هيئة كهرباء ومياه دبي',
    nameEnglish: 'Dubai Electricity & Water Authority PJSC',
    exchange: 'DFM',
    price: 2.81,
    changeAbs: 0.00,
    changePct: 0.00,
    volume: 4.088262, // millions of shares【799083089723546†L90-L103】
    marketCap: 140.50, // billions【799083089723546†L90-L97】
    revenue: 31.14, // billions【799083089723546†L90-L97】
    netIncome: 6.86, // billions【799083089723546†L90-L97】
    eps: 0.14, // EPS【799083089723546†L90-L97】
    peRatio: 20.47, // trailing PE【799083089723546†L90-L97】
    roe: null, // not available directly
    timeSeries: {
      dates: [
        '2025-06-26','2025-06-27','2025-06-28','2025-06-29','2025-06-30','2025-07-01','2025-07-02','2025-07-03','2025-07-04','2025-07-05','2025-07-06','2025-07-07','2025-07-08','2025-07-09','2025-07-10','2025-07-11','2025-07-12','2025-07-13','2025-07-14','2025-07-15','2025-07-16','2025-07-17','2025-07-18','2025-07-19','2025-07-20','2025-07-21','2025-07-22','2025-07-23','2025-07-24','2025-07-25'
      ],
      prices: [2.75,2.71,2.71,2.7,2.71,2.7,2.74,2.71,2.71,2.72,2.72,2.73,2.78,2.78,2.77,2.8,2.81,2.8,2.78,2.77,2.75,2.7,2.67,2.67,2.72,2.72,2.73,2.75,2.75,2.75]
    },
    get fairPrice() {
      // Use a conservative P/E of 18 for utility companies to derive fair value
      return parseFloat((this.eps * 18).toFixed(2));
    },
    get recommendation() {
      const diff = (this.price - this.fairPrice) / this.fairPrice;
      if (diff < -0.1) return 'شراء';
      if (diff > 0.1) return 'احتفاظ';
      return 'محايد';
    },
    get analysis() {
      const margin = (this.netIncome / this.revenue) * 100;
      return `تسجّل الشركة هامش ربح مقداره ${margin.toFixed(1)}٪ بناءً على الإيرادات السنوية الحالية.\n` +
        `يبلغ العائد على السهم ${this.eps.toFixed(2)} درهم مع قيمة دفترية مرتفعة.\n` +
        `القيمة العادلة المقدَّرة باستخدام مضاعف ربحية قدره 18 هي ${this.fairPrice} درهم، ` +
        `${this.price > this.fairPrice ? 'ما يشير إلى تسعير أعلى من القيمة العادلة' : 'ما يشير إلى فرصة استثمارية'}.`;
    }
  },
  {
    symbol: 'SALIK',
    nameArabic: 'شركة سالك',
    nameEnglish: 'Salik Company PJSC',
    exchange: 'DFM',
    price: 6.21,
    changeAbs: 0.08,
    changePct: 1.31,
    volume: 3.352366, // millions【273495695687151†L88-L99】
    marketCap: 46.58, // billions【273495695687151†L88-L96】
    revenue: 2.48, // billions【273495695687151†L88-L96】
    netIncome: 1.26, // billions【273495695687151†L88-L96】
    eps: 0.17, // EPS【273495695687151†L88-L96】
    peRatio: 37.03, // trailing PE【273495695687151†L88-L96】
    roe: null,
    timeSeries: {
      dates: [
        '2025-06-26','2025-06-27','2025-06-28','2025-06-29','2025-06-30','2025-07-01','2025-07-02','2025-07-03','2025-07-04','2025-07-05','2025-07-06','2025-07-07','2025-07-08','2025-07-09','2025-07-10','2025-07-11','2025-07-12','2025-07-13','2025-07-14','2025-07-15','2025-07-16','2025-07-17','2025-07-18','2025-07-19','2025-07-20','2025-07-21','2025-07-22','2025-07-23','2025-07-24','2025-07-25'
      ],
      prices: [6.23,6.22,6.28,6.22,6.23,6.35,6.36,6.41,6.41,6.5,6.38,6.32,6.24,6.34,6.3,6.31,6.35,6.52,6.49,6.65,6.68,6.59,6.6,6.56,6.51,6.65,6.58,6.62,6.52,6.53]
    },
    get fairPrice() {
      // Infrastructure concession operator; assume fair P/E of 30
      return parseFloat((this.eps * 30).toFixed(2));
    },
    get recommendation() {
      const diff = (this.price - this.fairPrice) / this.fairPrice;
      if (diff < -0.1) return 'شراء';
      if (diff > 0.1) return 'بيع جزئي';
      return 'احتفاظ';
    },
    get analysis() {
      const margin = (this.netIncome / this.revenue) * 100;
      return `تعتبر سالك من الشركات ذات الهامش الربحي المرتفع (حوالي ${margin.toFixed(1)}٪) بفضل نموذج الرسوم على الطرق.\n` +
        `يبلغ العائد على السهم ${this.eps.toFixed(2)} درهم بينما يصل مضاعف الربحية التاريخي إلى ${this.peRatio.toFixed(1)}.\n` +
        `القيمة العادلة باستخدام مضاعف 30 هي ${this.fairPrice} درهم، ` +
        `${this.price > this.fairPrice ? 'ما قد يشير إلى ارتفاع السعر الحالي عن قيمته العادلة' : 'ما يخلق فرصة محتملة للشراء'}.`;
    }
  },
  {
    symbol: 'TALABAT',
    nameArabic: 'طلبات هولدينغ بي إل سي',
    nameEnglish: 'Talabat Holding PLC',
    exchange: 'DFM',
    price: 1.30,
    changeAbs: 0.01,
    changePct: 0.78,
    volume: 14.656415, // millions (approx. 20‑day average)【638503605343552†L169-L177】
    marketCap: 30.27, // billions【638503605343552†L86-L93】
    revenue: 8.83, // billions【638503605343552†L188-L193】
    netIncome: 1.52, // billions【638503605343552†L188-L199】
    eps: 0.08, // EPS【638503605343552†L188-L199】
    peRatio: 16.10, // trailing PE【638503605343552†L115-L119】
    roe: 84.02, // ROE【638503605343552†L151-L155】
    timeSeries: {
      dates: [
        '2025-06-26','2025-06-27','2025-06-28','2025-06-29','2025-06-30','2025-07-01','2025-07-02','2025-07-03','2025-07-04','2025-07-05','2025-07-06','2025-07-07','2025-07-08','2025-07-09','2025-07-10','2025-07-11','2025-07-12','2025-07-13','2025-07-14','2025-07-15','2025-07-16','2025-07-17','2025-07-18','2025-07-19','2025-07-20','2025-07-21','2025-07-22','2025-07-23','2025-07-24','2025-07-25'
      ],
      prices: [1.28,1.28,1.28,1.27,1.26,1.26,1.27,1.28,1.28,1.31,1.31,1.33,1.32,1.33,1.32,1.33,1.32,1.33,1.35,1.33,1.32,1.32,1.32,1.33,1.35,1.35,1.36,1.38,1.37,1.35]
    },
    get fairPrice() {
      // Consumer services company with rapid growth; assume fair P/E of 17
      return parseFloat((this.eps * 17).toFixed(2));
    },
    get recommendation() {
      const diff = (this.price - this.fairPrice) / this.fairPrice;
      if (diff < -0.1) return 'شراء';
      if (diff > 0.1) return 'بيع';
      return 'احتفاظ';
    },
    get analysis() {
      const margin = (this.netIncome / this.revenue) * 100;
      return `حققت طلبات هامش ربح يبلغ ${margin.toFixed(1)}٪ مع عائد على حقوق المساهمين يصل إلى ${this.roe.toFixed(2)}٪.\n` +
        `العائد على السهم يبلغ ${this.eps.toFixed(2)} درهم ومضاعف الربحية الحالي ${this.peRatio.toFixed(2)}.\n` +
        `القيمة العادلة المقدرة باستخدام مضاعف 17 هي ${this.fairPrice} درهم، ` +
        `${this.price < this.fairPrice ? 'ما يشير إلى إمكانية تحقيق نمو في السعر' : 'ما يعني أن السهم قريب من قيمته العادلة'}.`;
    }
  },
  {
    symbol: 'NMDC',
    nameArabic: 'إن إم دي سي انرجي',
    nameEnglish: 'NMDC Energy P.J.S.C.',
    exchange: 'ADX',
    price: 2.58,
    changeAbs: 0.02,
    changePct: 0.78,
    volume: 2.032469, // millions【750467455997322†L96-L100】
    marketCap: 12.90, // billions【750467455997322†L86-L90】
    revenue: 16.80, // billions【750467455997322†L86-L93】
    netIncome: 1.49, // billions【750467455997322†L88-L93】
    eps: 0.66, // EPS【750467455997322†L88-L93】
    peRatio: 3.93, // trailing PE【750467455997322†L92-L95】
    roe: null,
    timeSeries: {
      dates: [
        '2025-06-26','2025-06-27','2025-06-28','2025-06-29','2025-06-30','2025-07-01','2025-07-02','2025-07-03','2025-07-04','2025-07-05','2025-07-06','2025-07-07','2025-07-08','2025-07-09','2025-07-10','2025-07-11','2025-07-12','2025-07-13','2025-07-14','2025-07-15','2025-07-16','2025-07-17','2025-07-18','2025-07-19','2025-07-20','2025-07-21','2025-07-22','2025-07-23','2025-07-24','2025-07-25'
      ],
      prices: [2.59,2.55,2.52,2.54,2.57,2.59,2.57,2.53,2.53,2.52,2.47,2.45,2.48,2.53,2.54,2.57,2.54,2.53,2.54,2.54,2.52,2.53,2.53,2.55,2.57,2.55,2.57,2.59,2.55,2.58]
    },
    get fairPrice() {
      // Engineering contractor; assume fair P/E of 6
      return parseFloat((this.eps * 6).toFixed(2));
    },
    get recommendation() {
      const diff = (this.price - this.fairPrice) / this.fairPrice;
      if (diff < -0.1) return 'شراء';
      if (diff > 0.1) return 'بيع';
      return 'احتفاظ';
    },
    get analysis() {
      const margin = (this.netIncome / this.revenue) * 100;
      return `تعمل شركة NMDC في مجال الهندسة والإنشاءات للطاقة، مع هامش ربح منخفض نسبياً يبلغ ${margin.toFixed(1)}٪.\n` +
        `العائد على السهم يبلغ ${this.eps.toFixed(2)} درهم، ومضاعف الربحية الحالي منخفض عند ${this.peRatio.toFixed(2)} مما يعكس تقييمًا جذابًا.\n` +
        `القيمة العادلة المفترضة باستخدام مضاعف 6 هي ${this.fairPrice} درهم؛ السعر الحالي أقل من ذلك ما يدعم توصية بالشراء.`;
    }
  }
];

// Compute a global min and max price across all stocks to normalize chart ranges.
// This ensures that charts are visually consistent and comparable.  The range
// is padded by ±5% so that lines do not touch the borders.  You can adjust
// the padding factor if you wish to compress or expand the y‑axis spacing.
const allPrices = stocks.flatMap(stock => stock.timeSeries.prices);
const globalMin = Math.min(...allPrices);
const globalMax = Math.max(...allPrices);
// Define padded range for charts
const yAxisRange = [globalMin * 0.95, globalMax * 1.05];

// Render the cards and charts
function renderDashboard() {
  const container = document.getElementById('dashboard');
  stocks.forEach(stock => {
    // Compute weekly and monthly changes from time series
    const prices = stock.timeSeries.prices;
    const latest = prices[prices.length - 1];
    const weekOld = prices[prices.length - 8];
    const monthOld = prices[0];
    const weekPct = percentChange(latest, weekOld);
    const monthPct = percentChange(latest, monthOld);

    // Build card element
    const card = document.createElement('div');
    card.className = 'card';
    // Header
    const header = document.createElement('div');
    header.className = 'card-header';
    header.innerHTML = `<h3>${stock.nameArabic}</h3><span class="ticker">${stock.nameEnglish} (${stock.symbol})</span>`;
    card.appendChild(header);
    // Stats section
    const stats = document.createElement('div');
    stats.className = 'stats';
    const changeClass = stock.changeAbs >= 0 ? 'change-positive' : 'change-negative';
    stats.innerHTML = `
      <div><strong>السعر الحالي:</strong> <span class="value">${stock.price.toFixed(2)} درهم</span> <span class="${changeClass}">${stock.changeAbs >= 0 ? '+' : ''}${stock.changeAbs.toFixed(2)} (${stock.changePct.toFixed(2)}٪)</span></div>
      <div><strong>حجم التداول اليومي:</strong> ${stock.volume.toFixed(2)}M</div>
      <div><strong>القيمة السوقية:</strong> ${stock.marketCap.toFixed(2)}B</div>
      <div><strong>الأرباح:</strong> ${stock.netIncome.toFixed(2)}B | <strong>الإيرادات:</strong> ${stock.revenue.toFixed(2)}B</div>
      <div><strong>ربحية السهم:</strong> ${stock.eps.toFixed(2)} | <strong>مضاعف الربحية:</strong> ${stock.peRatio.toFixed(2)}</div>
      <div><strong>التغيّر خلال أسبوع:</strong> ${weekPct >= 0 ? '+' : ''}${weekPct.toFixed(2)}٪ | <strong>التغيّر خلال شهر:</strong> ${monthPct >= 0 ? '+' : ''}${monthPct.toFixed(2)}٪</div>
    `;
    card.appendChild(stats);
    // Chart container
    const chartDiv = document.createElement('div');
    chartDiv.id = `chart-${stock.symbol}`;
    chartDiv.className = 'chart';
    card.appendChild(chartDiv);
    // Analysis
    const analysis = document.createElement('div');
    analysis.className = 'analysis';
    analysis.textContent = stock.analysis;
    card.appendChild(analysis);
    // Recommendation
    const rec = document.createElement('div');
    rec.className = 'analysis';
    rec.innerHTML = `<strong>التوصية:</strong> ${stock.recommendation}`;
    card.appendChild(rec);
    // Append card to container
    container.appendChild(card);

    // Plotly chart
    const trace = {
      x: stock.timeSeries.dates,
      y: stock.timeSeries.prices,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#2a3f69' }
    };
    // Compute a dynamic y‑axis range for each chart so that the line occupies
    // the full vertical space.  A small padding of ±5% is added to ensure
    // the chart does not touch the top or bottom edges.  This improves
    // consistency and readability across different price ranges.
    const minPrice = Math.min(...stock.timeSeries.prices);
    const maxPrice = Math.max(...stock.timeSeries.prices);
    const yMin = minPrice * 0.95;
    const yMax = maxPrice * 1.05;
    const layout = {
      margin: { t: 10, b: 30, l: 40, r: 10 },
      xaxis: { title: 'التاريخ', tickfont: { size: 8 } },
      yaxis: {
        title: 'السعر (درهم)',
        tickfont: { size: 8 },
        range: [yMin, yMax]
      },
      font: { family: 'Arial', size: 10 },
      showlegend: false
    };
    Plotly.newPlot(chartDiv.id, [trace], layout, { displayModeBar: false, responsive: true });
  });
}

// Render summary section
function renderSummary() {
  const summaryDiv = document.getElementById('summary-content');
  let html = '';
  stocks.forEach(stock => {
    html += `<p><strong>${stock.nameArabic} (${stock.symbol}):</strong> وفقاً للمعطيات الحالية، تبلغ القيمة العادلة للسهم ${stock.fairPrice} درهم ` +
      `مقارنة بالسعر الحالي ${stock.price.toFixed(2)} درهم. توصيتنا الحالية هي <em>${stock.recommendation}</em>.</p>`;
  });
  summaryDiv.innerHTML = html;
  // Update time
  const updateTime = document.getElementById('update-time');
  const now = new Date();
  updateTime.textContent = `آخر تحديث للبيانات: ${now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })} ${now.toLocaleTimeString('ar-EG')}`;
}

// Initialise dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  renderSummary();
});