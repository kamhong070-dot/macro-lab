const DEFAULT_COUNTRIES = [
  { id: "USA", name: "United States" },
  { id: "CHN", name: "China" },
  { id: "GBR", name: "United Kingdom" },
  { id: "NOR", name: "Norway" },
  { id: "IND", name: "India" },
];

const ECONOMIC_DESCRIPTIONS = {
  USA: "<strong>World's largest economy</strong> with a high-tech service sector and advanced manufacturing. <em>Strengths:</em> Global reserve currency, innovation, and diverse markets. <em>Weaknesses:</em> <strong>High national debt</strong>, political polarization, and income inequality.",
  CHN: "<strong>Global manufacturing hub</strong> transitioning to a service and high-tech economy. <em>Strengths:</em> Infrastructure, massive scale, and state-led investment. <em>Weaknesses:</em> Aging population, <strong>high real estate debt</strong>, and slowing growth rates.",
  GBR: "<strong>Mature service-based economy</strong> with a global financial hub in London. <em>Strengths:</em> Legal framework, education, and life sciences. <em>Weaknesses:</em> Low productivity growth, post-Brexit trade adjustments, and <strong>recent interest rate volatility</strong>.",
  NOR: "<strong>Resource-rich, high-income economy</strong> known for its social welfare model. <em>Strengths:</em> Sovereign wealth fund, energy exports, and <strong>low public debt</strong>. <em>Weaknesses:</em> High labor costs and dependency on fossil fuel markets.",
  IND: "<strong>Fastest-growing major economy</strong> with a massive young workforce. <em>Strengths:</em> Digital public infrastructure, demographics, and booming tech services. <em>Weaknesses:</em> Infrastructure gaps, <strong>fiscal deficit challenges</strong>, and youth unemployment.",
  JPN: "<strong>Advanced industrial economy</strong> with a focus on technology and precision engineering. <em>Strengths:</em> Global leadership in robotics, high R&D investment, and strong exports. <em>Weaknesses:</em> Aging population, persistent deflationary risks, and high public debt.",
  DEU: "<strong>Europe's economic powerhouse</strong> and a global leader in automotive and manufacturing exports. <em>Strengths:</em> Strong industrial base, highly skilled workforce, and fiscal discipline. <em>Weaknesses:</em> Energy transition challenges and an aging workforce.",
  BRA: "<strong>Resource-rich emerging economy</strong> with a strong agricultural and mining sector. <em>Strengths:</em> Abundant natural resources, large domestic market, and strong agribusiness. <em>Weaknesses:</em> Political instability, infrastructure bottlenecks, and high interest rates.",
  NGA: "<strong>Africa's largest economy</strong> with a significant oil and gas sector and a growing tech hub. <em>Strengths:</em> Young population, abundant natural resources, and a booming creative industry. <em>Weaknesses:</em> Dependency on oil exports, high inflation, and infrastructure gaps.",
};

const POLICY_IMPACTS = {
  USA: "<strong>Monetary:</strong> Federal Reserve using high interest rates to combat post-pandemic inflation. <strong>Fiscal:</strong> Expansionary spending on infrastructure and green energy (IRA).",
  CHN: "<strong>Monetary:</strong> Loosening rates to support the property sector. <strong>Fiscal:</strong> Massive state investment in high-tech manufacturing to offset slowing exports.",
  GBR: "<strong>Monetary:</strong> Tightening to control inflation. <strong>Fiscal:</strong> Focus on 'fiscal responsibility' and reducing debt-to-GDP ratio after energy price shocks.",
  NOR: "<strong>Fiscal:</strong> Counter-cyclical policy managed via the GPFG (Sovereign Wealth Fund) to maintain stability regardless of oil prices.",
  IND: "<strong>Fiscal:</strong> Massive capital expenditure (CapEx) on rail and road infrastructure to drive supply-side growth.",
  JPN: "<strong>Monetary:</strong> Gradually shifting away from ultra-loose policy (YCC) to manage rising global rates. <strong>Fiscal:</strong> Balancing debt management with social security spending for an aging population.",
  DEU: "<strong>Fiscal:</strong> Balancing the 'debt brake' with the need for massive investments in green energy and defense. <strong>Monetary:</strong> Guided by ECB's focus on Eurozone inflation.",
  BRA: "<strong>Monetary:</strong> High benchmark interest rates (Selic) to curb inflation. <strong>Fiscal:</strong> Implementing a new fiscal framework to stabilize the debt-to-GDP ratio.",
  NGA: "<strong>Monetary:</strong> Raising interest rates to curb high inflation. <strong>Fiscal:</strong> Removing fuel subsidies to free up capital for infrastructure and education.",
};

const INDICATORS = [
  { key: "GDP rate", code: "NY.GDP.MKTP.KD.ZG", fmt: (v) => fmtPct(v), tooltip: "Annual percentage growth rate of GDP at market prices based on constant local currency." },
  { key: "GDP", code: "NY.GDP.MKTP.CD", fmt: (v) => fmtUSD(v), tooltip: "The sum of gross value added by all resident producers in the economy plus any product taxes." },
  { key: "inflation rate", code: "FP.CPI.TOTL.ZG", fmt: (v) => fmtPct(v), tooltip: "Measured by the consumer price index, it reflects the annual percentage change in the cost to the average consumer." },
  { key: "unemployment", code: "SL.UEM.TOTL.ZS", fmt: (v) => fmtPct(v), tooltip: "The share of the labor force that is without work but available for and seeking employment." },
  { key: "balance of payment", code: "BN.CAB.XOKA.GD.ZS", fmt: (v) => fmtPct(v), tooltip: "Current account balance is the sum of net exports of goods and services, net primary income, and net secondary income." },
  { key: "gini index", code: "SI.POV.GINI", fmt: (v) => fmtNumber(v), tooltip: "Measures the extent to which the distribution of income among individuals or households within an economy deviates from a perfectly equal distribution." },
  { key: "literacy rate", code: "SE.ADT.LITR.ZS", fmt: (v) => fmtPct(v), tooltip: "Percentage of people ages 15 and above who can both read and write with understanding a short simple statement." },
  { key: "life expectancy", code: "SP.DYN.LE00.IN", fmt: (v) => fmtNumber(v), tooltip: "The number of years a newborn infant would live if prevailing patterns of mortality at the time of its birth were to stay the same throughout its life." },
  { key: "national debt", code: "GC.DOD.TOTL.GD.ZS", fmt: (v) => fmtPct(v), tooltip: "Total central government debt (including internal and external) as a percentage of GDP." },
  { key: "interest rate", code: "FR.INR.RINR", fmt: (v) => fmtPct(v), tooltip: "Real interest rate is the lending interest rate adjusted for inflation as measured by the GDP deflator." },
];

const api = {
  async countryList() {
    const url = "https://api.worldbank.org/v2/country?format=json&per_page=300";
    const res = await fetch(url);
    const data = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[1])) return [];
    return data[1]
      .filter((c) => c.region && c.region.id !== "NA")
      .map((c) => ({ id: c.id, name: c.name }));
  },
  async countryMeta(id) {
    const url = `https://api.worldbank.org/v2/country/${id}?format=json`;
    const res = await fetch(url);
    const data = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[1]) || !data[1][0]) return { id, name: id };
    const c = data[1][0];
    return { id: c.id, name: c.name, region: c.region.value, incomeLevel: c.incomeLevel.value };
  },
  async indicatorHistory(id, code) {
    if (!code) return [];
    const url = `https://api.worldbank.org/v2/country/${id}/indicator/${code}?format=json&per_page=15`;
    const res = await fetch(url);
    const data = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[1])) return [];
    return data[1].filter((d) => d.value != null).sort((a, b) => Number(a.date) - Number(b.date));
  },
};

function fmtPct(v) {
  if (v == null) return "N/A";
  const n = Number(v);
  if (Number.isNaN(n)) return "N/A";
  return `${n.toFixed(2)}%`;
}
function fmtUSD(v) {
  if (v == null) return "N/A";
  const n = Number(v);
  if (Number.isNaN(n)) return "N/A";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}
function fmtNumber(v) {
  if (v == null) return "N/A";
  const n = Number(v);
  if (Number.isNaN(n)) return "N/A";
  return `${n.toFixed(2)}`;
}

const cardsEl = document.getElementById("cards");
const searchInput = document.getElementById("country-search");
const addBtn = document.getElementById("add-country");
const listEl = document.getElementById("countries-list");
const toggleCompareBtn = document.getElementById("toggle-compare");
const compareSection = document.getElementById("compare-section");
const runCompareBtn = document.getElementById("run-compare");
const compare1Select = document.getElementById("compare-1");
const compare2Select = document.getElementById("compare-2");
const compareIndicatorSelect = document.getElementById("compare-indicator");

// AI Assistant Elements
const openAiBtn = document.getElementById("open-ai");
const closeAiBtn = document.getElementById("close-ai");
const aiPanel = document.getElementById("ai-assistant");
const aiCountrySelect = document.getElementById("ai-country");
const aiPromptInput = document.getElementById("ai-prompt");
const generateEssayBtn = document.getElementById("generate-essay");
const essayOutput = document.getElementById("essay-output");
const essayText = document.getElementById("essay-text");
const copyEssayBtn = document.getElementById("copy-essay");

let allCountries = [];
let shown = new Set();
let countryDataMap = new Map(); // Store fetched data for AI use
let compareChart = null;

async function init() {
  setLoading(true);
  try {
    allCountries = await api.countryList();
    populateDatalist(allCountries);
    populateCompareSelects(allCountries);
    populateAiCountrySelect(allCountries);
    for (const c of DEFAULT_COUNTRIES) {
      await renderCountry(c.id);
    }
  } finally {
    setLoading(false);
  }
}

function populateAiCountrySelect(list) {
  aiCountrySelect.innerHTML = list.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}

// AI Panel Event Listeners
openAiBtn.addEventListener("click", () => aiPanel.classList.remove("hidden"));
closeAiBtn.addEventListener("click", () => aiPanel.classList.add("hidden"));

generateEssayBtn.addEventListener("click", () => {
  const countryId = aiCountrySelect.value;
  const prompt = aiPromptInput.value.trim();

  if (!prompt) {
    alert("Please enter a question or essay prompt for the AI assistant.");
    return;
  }

  if (!shown.has(countryId)) {
    alert("Please add this country to the dashboard first to fetch its latest data.");
    return;
  }

  const data = countryDataMap.get(countryId);
  if (!data) {
    alert("Country data is still loading. Please try again in a moment.");
    return;
  }

  const response = generateAIResponse(data, prompt);

  essayText.textContent = response;
  essayOutput.classList.remove("hidden");
});

copyEssayBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(essayText.textContent);
  copyEssayBtn.textContent = "Copied!";
  setTimeout(() => copyEssayBtn.textContent = "Copy to Clipboard", 2000);
});

function generateAIResponse(data, prompt) {
  const { meta, results } = data;
  const countryName = meta.name;
  const normalizedPrompt = prompt.toLowerCase();

  const getVal = (key) => results.find(r => r.key === key)?.value || "N/A";
  const gdpGrowth = getVal("GDP rate");
  const inflation = getVal("inflation rate");
  const unemployment = getVal("unemployment");
  const debt = getVal("national debt");
  const gini = getVal("gini index");
  const interestRate = getVal("interest rate");
  const bop = getVal("balance of payment");
  const lifeExpectancy = getVal("life expectancy");

  const intro = `Prompt: ${prompt}\n\n${countryName} is a ${meta.incomeLevel.toLowerCase()} economy in ${meta.region}. Latest World Bank data shows GDP growth of ${gdpGrowth}, inflation of ${inflation}, unemployment of ${unemployment}, national debt of ${debt}, and an interest rate of ${interestRate}.\n\n`;

  if (normalizedPrompt.includes("inflation") || normalizedPrompt.includes("price")) {
    return intro + `Inflation is a central issue for ${countryName}. At ${inflation}, price pressures can reduce real incomes and weaken consumer confidence. Policymakers may keep interest rates relatively tight to restore price stability, but that can also slow GDP growth and worsen unemployment. A balanced evaluation should consider whether inflation is demand-pull, cost-push, or imported, and whether tighter policy could damage growth prospects.`;
  }

  if (normalizedPrompt.includes("inequality") || normalizedPrompt.includes("gini") || normalizedPrompt.includes("poverty")) {
    return intro + `Income inequality remains important in ${countryName}, with a Gini index of ${gini}. High inequality can limit equality of opportunity and reduce social mobility. Governments may respond with progressive taxation, education spending, healthcare access, and targeted welfare support. The strongest evaluation weighs the gains in equity against possible costs to incentives, public finances, and long-run efficiency.`;
  }

  if (normalizedPrompt.includes("debt") || normalizedPrompt.includes("fiscal") || normalizedPrompt.includes("budget")) {
    return intro + `Public debt in ${countryName} stands at ${debt} of GDP. High debt can reduce fiscal flexibility, raise borrowing costs, and create concerns about sustainability, especially if growth weakens or rates stay high. However, debt is not always harmful if borrowing finances productive investment that raises future output. Good evaluation compares the debt burden with growth, interest rates, and the government's ability to service liabilities.`;
  }

  if (normalizedPrompt.includes("growth") || normalizedPrompt.includes("gdp") || normalizedPrompt.includes("development")) {
    return intro + `Economic growth in ${countryName} is currently ${gdpGrowth}. Strong growth can raise employment, tax revenue, and living standards, but quality matters as well as speed. If unemployment remains at ${unemployment} or inequality remains high, growth may not be inclusive. Strong essays should evaluate whether growth is sustainable, export-led, consumption-led, or driven by government intervention.`;
  }

  return intro + `A strong response on ${countryName} should connect multiple indicators rather than relying on one statistic. GDP growth is ${gdpGrowth}, inflation is ${inflation}, unemployment is ${unemployment}, the balance of payments position is ${bop}, national debt is ${debt}, and life expectancy is ${lifeExpectancy}. For A-Level Economics, the best analysis explains trade-offs between growth, inflation, unemployment, equity, and macroeconomic stability, then judges which issue matters most in context.`;
}

function populateDatalist(list) {
  listEl.innerHTML = "";
  for (const c of list) {
    const opt = document.createElement("option");
    opt.value = c.name;
    opt.dataset.id = c.id;
    listEl.appendChild(opt);
  }
}

function populateCompareSelects(list) {
  [compare1Select, compare2Select].forEach(select => {
    select.innerHTML = list.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  });
  compare1Select.value = "USA";
  compare2Select.value = "CHN";
}

toggleCompareBtn.addEventListener("click", () => {
  compareSection.classList.toggle("hidden");
  toggleCompareBtn.textContent = compareSection.classList.contains("hidden") 
    ? "Enable Comparison Mode" 
    : "Disable Comparison Mode";
});

runCompareBtn.addEventListener("click", updateCompareChart);

async function updateCompareChart() {
  const id1 = compare1Select.value;
  const id2 = compare2Select.value;
  const code = compareIndicatorSelect.value;
  const label = compareIndicatorSelect.options[compareIndicatorSelect.selectedIndex].text;

  runCompareBtn.textContent = "Loading...";
  runCompareBtn.disabled = true;

  try {
    const [h1, h2] = await Promise.all([
      api.indicatorHistory(id1, code),
      api.indicatorHistory(id2, code)
    ]);

    const years = [...new Set([...h1.map(d => d.date), ...h2.map(d => d.date)])].sort();
    
    const d1 = years.map(y => h1.find(d => d.date === y)?.value || null);
    const d2 = years.map(y => h2.find(d => d.date === y)?.value || null);

    if (compareChart) compareChart.destroy();

    const ctx = document.getElementById('main-compare-chart').getContext('2d');
    compareChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: compare1Select.options[compare1Select.selectedIndex].text,
            data: d1,
            borderColor: '#E040FB',
            backgroundColor: 'transparent',
            tension: 0.3,
            borderWidth: 3
          },
          {
            label: compare2Select.options[compare2Select.selectedIndex].text,
            data: d2,
            borderColor: '#00E5FF',
            backgroundColor: 'transparent',
            tension: 0.3,
            borderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#F0F0F0' } },
          title: { display: true, text: label, color: '#F0F0F0' }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#B0B0B0' } },
          y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#B0B0B0' } }
        }
      }
    });
  } finally {
    runCompareBtn.textContent = "Update Chart";
    runCompareBtn.disabled = false;
  }
}

addBtn.addEventListener("click", async () => {
  const name = searchInput.value.trim();
  if (!name) return;
  const found = allCountries.find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (!found) return;
  await renderCountry(found.id);
  searchInput.value = "";
});

function generateDynamicSummary(meta, results) {
  const gdpGrowth = results[0].history.length ? results[0].history[results[0].history.length - 1].value : null;
  const inflation = results[2].history.length ? results[2].history[results[2].history.length - 1].value : null;
  const debt = results[8].history.length ? results[8].history[results[8].history.length - 1].value : null;
  const unemployment = results[3].history.length ? results[3].history[results[3].history.length - 1].value : null;

  let description = `<strong>${meta.name}</strong> is a <strong>${meta.incomeLevel}</strong> economy located in <strong>${meta.region}</strong>. `;
  
  if (gdpGrowth > 3) {
    description += "The nation is currently experiencing <em>robust economic growth</em>, indicating strong consumer demand and industrial output. ";
  } else if (gdpGrowth > 0) {
    description += "The economy is showing <em>sluggish growth</em>, which may reflect global headwinds or domestic structural challenges. ";
  } else if (gdpGrowth != null) {
    description += "The economy is in a <em>period of contraction</em>, posing significant challenges for employment and fiscal stability. ";
  }

  if (unemployment > 10) {
    description += "A high unemployment rate remains a key <em>structural weakness</em>, requiring labor market reforms. ";
  }

  let policy = "<strong>Monetary:</strong> ";
  if (inflation > 5) {
    policy += "Central banks are likely maintaining <em>tight monetary policy</em> (high interest rates) to curb inflationary pressures. ";
  } else if (inflation < 2 && inflation != null) {
    policy += "Monetary policy may be <em>accommodative</em> to stimulate demand in a low-inflation environment. ";
  } else {
    policy += "Focusing on <em>price stability</em> while supporting sustainable growth. ";
  }

  policy += "<strong>Fiscal:</strong> ";
  if (debt > 80) {
    policy += "High public debt levels may limit the government's ability to use expansionary fiscal policy, potentially leading to <em>austerity measures</em> or debt restructuring focus. ";
  } else if (debt != null) {
    policy += "The government maintains a <em>manageable debt level</em>, allowing for strategic investments in infrastructure and social services. ";
  } else {
    policy += "Focusing on <em>revenue mobilization</em> and efficient resource allocation to support development goals.";
  }

  return { description, policy };
}

async function renderCountry(id) {
  if (shown.has(id)) return;
  shown.add(id);

  const isDefault = DEFAULT_COUNTRIES.some(c => c.id === id);

  const card = document.createElement("div");
  card.className = "card";
  card.id = `card-${id}`;
  card.innerHTML = `
    <div class="card-header">
      <div class="title-group">
        <div class="name">${id}</div>
        <div class="year"></div>
      </div>
      ${!isDefault ? `<button class="remove-btn" title="Remove country">×</button>` : ""}
    </div>
    <div class="description"></div>
    <div class="policy-impact"></div>
    <div class="chart-container">
      <canvas id="chart-${id}"></canvas>
    </div>
    <div class="indicators"></div>
  `;
  cardsEl.appendChild(card);

  if (!isDefault) {
    card.querySelector(".remove-btn").onclick = () => {
      card.remove();
      shown.delete(id);
    };
  }

  const nameEl = card.querySelector(".name");
  const yearEl = card.querySelector(".year");
  const descEl = card.querySelector(".description");
  const policyEl = card.querySelector(".policy-impact");
  const gridEl = card.querySelector(".indicators");

  const meta = await api.countryMeta(id);
  nameEl.textContent = meta.name;

  // Fetch data for all indicators
  const results = await Promise.all(
    INDICATORS.map(async (ind) => {
      const history = await api.indicatorHistory(id, ind.code);
      const latest = history.length ? history[history.length - 1] : { value: null, date: null };
      return { key: ind.key, value: ind.fmt(latest.value), year: latest.date, history, tooltip: ind.tooltip };
    })
  );

  // Store data for AI essay generation
  countryDataMap.set(id, { meta, results });

  const years = results.map((r) => Number(r.year)).filter((y) => !Number.isNaN(y));
  yearEl.textContent = years.length ? `Latest: ${Math.max(...years)}` : "";

  // Set description and policy
  if (ECONOMIC_DESCRIPTIONS[id]) {
    descEl.innerHTML = ECONOMIC_DESCRIPTIONS[id];
    policyEl.innerHTML = `<h4>Current Policy Context</h4>${POLICY_IMPACTS[id] || "<em>Policy data coming soon.</em>"}`;
  } else {
    const dynamic = generateDynamicSummary(meta, results);
    descEl.innerHTML = dynamic.description;
    policyEl.innerHTML = `<h4>Current Policy Context</h4>${dynamic.policy}`;
  }
  
  if (!policyEl.innerHTML.includes("Policy Context")) {
     policyEl.style.display = "none";
  } else {
     policyEl.style.display = "block";
  }

  gridEl.innerHTML = results
    .map(
      (r) => `
      <div class="row" data-tooltip="${r.tooltip}">
        <div class="label">${r.key}</div>
        <div class="value">${r.value}</div>
      </div>`
    )
    .join("");

  // Create Chart for GDP Growth Rate (Index 0)
  const gdpHistory = results[0].history;
  if (gdpHistory.length) {
    new Chart(document.getElementById(`chart-${id}`), {
      type: 'line',
      data: {
        labels: gdpHistory.map(h => h.date),
        datasets: [{
          label: 'GDP Growth Rate (%)',
          data: gdpHistory.map(h => h.value),
          borderColor: '#FFAB40',
          backgroundColor: 'rgba(255, 171, 64, 0.1)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#B0B0B0', font: { size: 10 } } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#B0B0B0', font: { size: 10 } } }
        }
      }
    });
  }
}

function setLoading(on) {
  if (on) {
    cardsEl.innerHTML = `<div class="loading-spinner">Fetching data from World Bank…</div>`;
  } else {
    if (!cardsEl.children.length) cardsEl.innerHTML = "";
  }
}

init();
