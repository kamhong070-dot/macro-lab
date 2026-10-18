/* ============================================================
   Macro Lab — content model
   Indicators, topic notes, glossary, essay bank, calculations.
   Written for Edexcel International A Level Economics (Units 2 & 4).
   ============================================================ */

window.MACRO_CONTENT = (function () {
  "use strict";

  /* ---------------------------------------------------------
     Indicators — World Bank WDI codes
     dir: up-good | down-good | neutral (controls delta colour)
     --------------------------------------------------------- */
  const indicators = [
    { code: "NY.GDP.MKTP.KD.ZG", label: "GDP growth", short: "GDP growth", unit: "%", dp: 1, group: "Output", dir: "up-good",
      use: "Evidence of the cycle: compare actual growth with potential to identify output gaps." },
    { code: "NY.GDP.MKTP.CD", label: "GDP (current US$)", short: "GDP", unit: "US$", dp: 0, group: "Output", dir: "neutral", format: "usd",
      use: "Size of the economy; useful for scale comparisons and global share arguments." },
    { code: "NY.GDP.PCAP.CD", label: "GDP per capita", short: "GDP per capita", unit: "US$", dp: 0, group: "Output", dir: "up-good", format: "usd",
      use: "Crude proxy for living standards; always pair with distribution and PPP caveats." },
    { code: "FP.CPI.TOTL.ZG", label: "Inflation (CPI)", short: "Inflation", unit: "%", dp: 1, group: "Prices", dir: "neutral",
      use: "Judge against the central bank target (2% in the UK and euro area) — deviation matters." },
    { code: "SL.UEM.TOTL.ZS", label: "Unemployment (ILO)", short: "Unemployment", unit: "%", dp: 1, group: "Labour", dir: "down-good",
      use: "ILO measure allows cross-country comparison; claimant count is a UK-only alternative." },
    { code: "SL.UEM.1524.ZS", label: "Youth unemployment", short: "Youth unemployment", unit: "%", dp: 1, group: "Labour", dir: "down-good",
      use: "A youth rate well above the adult rate signals hysteresis and long-term scarring." },
    { code: "BN.CAB.XOKA.GD.ZS", label: "Current account balance", short: "Current account", unit: "% GDP", dp: 1, group: "External", dir: "neutral",
      use: "A deficit is not automatically a failure: it may reflect strong investment or low saving." },
    { code: "NE.EXP.GNFS.ZS", label: "Exports of goods & services", short: "Exports", unit: "% GDP", dp: 1, group: "External", dir: "neutral",
      use: "Openness indicator; compare with the current account to discuss competitiveness." },
    { code: "GC.DOD.TOTL.GD.ZS", label: "Central government debt", short: "Government debt", unit: "% GDP", dp: 1, group: "Fiscal", dir: "down-good",
      use: "Sustainability depends on r versus g, not the level alone." },
    { code: "NE.GDI.TOTL.ZS", label: "Gross capital formation", short: "Investment", unit: "% GDP", dp: 1, group: "Output", dir: "up-good",
      use: "Investment share drives future LRAS; compare with the current account identity (S − I)." },
    { code: "SI.POV.GINI", label: "Gini index", short: "Gini", unit: "index", dp: 1, group: "Distribution", dir: "down-good",
      use: "0 = perfect equality, 100 = one person receives everything. Survey years vary." },
    { code: "SP.DYN.LE00.IN", label: "Life expectancy", short: "Life expectancy", unit: "years", dp: 1, group: "Development", dir: "up-good",
      use: "A non-income dimension of development; part of the HDI." },
    { code: "SP.POP.TOTL", label: "Population", short: "Population", unit: "people", dp: 0, group: "Development", dir: "neutral", format: "compact",
      use: "Population structure shapes the dependency ratio and long-run growth prospects." },
    { code: "BX.KLT.DINV.WD.GD.ZS", label: "FDI net inflows", short: "FDI inflows", unit: "% GDP", dp: 1, group: "External", dir: "up-good",
      use: "Evidence for MNC arguments in Unit 4; net inflows can be negative in divestment years." },
    { code: "SH.XPD.CHEX.GD.ZS", label: "Health spending", short: "Health spending", unit: "% GDP", dp: 1, group: "Development", dir: "neutral",
      use: "Human capital input; spending levels say little about outcomes on their own." },
    { code: "SE.XPD.TOTL.GD.ZS", label: "Education spending", short: "Education spending", unit: "% GDP", dp: 1, group: "Development", dir: "neutral",
      use: "Supply-side policy evidence — pair with outcomes such as enrolment or PISA scores." },
    { code: "IT.NET.USER.ZS", label: "Internet users", short: "Internet users", unit: "% pop.", dp: 1, group: "Development", dir: "up-good",
      use: "Digital infrastructure and access; a useful development gap indicator." },
    { code: "SP.POP.DPND.OLD", label: "Old-age dependency ratio", short: "Old-age dependency", unit: "per 100 workers", dp: 1, group: "Development", dir: "neutral",
      use: "Ageing pressure on public finances and the labour force (Japan, Germany, China)." }
  ];

  const indicatorMap = {};
  indicators.forEach(function (i) { indicatorMap[i.code] = i; });

  /* ---------------------------------------------------------
     Countries
     --------------------------------------------------------- */
  const presets = [
    { id: "GBR", name: "United Kingdom", flag: "🇬🇧" },
    { id: "USA", name: "United States", flag: "🇺🇸" },
    { id: "CHN", name: "China", flag: "🇨🇳" },
    { id: "IND", name: "India", flag: "🇮🇳" },
    { id: "DEU", name: "Germany", flag: "🇩🇪" },
    { id: "JPN", name: "Japan", flag: "🇯🇵" },
    { id: "BRA", name: "Brazil", flag: "🇧🇷" },
    { id: "NGA", name: "Nigeria", flag: "🇳🇬" },
    { id: "NOR", name: "Norway", flag: "🇳🇴" },
    { id: "VNM", name: "Viet Nam", flag: "🇻🇳" },
    { id: "SGP", name: "Singapore", flag: "🇸🇬" },
    { id: "ZAF", name: "South Africa", flag: "🇿🇦" },
    { id: "MEX", name: "Mexico", flag: "🇲🇽" },
    { id: "TUR", name: "Turkiye", flag: "🇹🇷" }
  ];

  /* ---------------------------------------------------------
     Topics
     --------------------------------------------------------- */
  const topics = [
    {
      id: "circular-flow", unit: 2, num: "2.1",
      title: "The circular flow and the multiplier",
      sub: "How an injection becomes national income, and why the total is larger than the first round.",
      concepts: [
        { t: "Injections", d: "Investment (I), government spending (G) and exports (X) add to the flow." },
        { t: "Withdrawals", d: "Savings (S), taxes (T) and imports (M) leak out of the flow." },
        { t: "MPC", d: "The fraction of extra income households spend domestically." },
        { t: "Multiplier", d: "The ratio of the change in equilibrium income to the initial injection." }
      ],
      formula: "k = 1 / (1 − MPC) = 1 / (MPS + MPT + MPM)",
      diagram: "circular",
      chain: [
        "An injection such as £10bn of infrastructure spending becomes income for construction firms and their workers.",
        "Households spend a fraction of that income (the MPC), creating a second round of income for other firms.",
        "Each round is smaller, because part of the income leaks into savings, taxes and imports.",
        "Total change in national income = k × injection. With MPC = 0.8, k = 5, so income rises by £50bn before crowding out."
      ],
      analysis: [
        "The multiplier is smaller in open economies with a high marginal propensity to import, and larger when tax rates are low.",
        "Spare capacity is decisive: with a large negative output gap most of the effect is real output; near capacity it is mostly prices.",
        "The same mechanism works downwards — falling investment in a recession can cascade, which is the paradox of thrift.",
        "Multipliers are larger when monetary policy is at the zero lower bound, because interest rates cannot offset the fiscal impulse."
      ],
      evaluation: [
        "Estimated multipliers vary widely (roughly 0.5 to 2), so the arithmetic is not a forecast.",
        "Crowding out: government borrowing may push up interest rates and displace private investment.",
        "Ricardian equivalence: if households expect future tax rises, they may save the transfer instead of spending it.",
        "Supply constraints — skills, planning permission, imported inputs — determine how much output actually rises."
      ],
      exam: "Explain how a rise in government spending can raise national income (8 marks). Name each round explicitly and use the MPC; examiners reward the mechanism, not a definition of the multiplier.",
      links: ["fiscal", "unemployment", "conflicts"]
    },
    {
      id: "ad-as", unit: 2, num: "2.2",
      title: "Aggregate demand, aggregate supply and equilibrium",
      sub: "The model that organises almost every macro answer you will write.",
      concepts: [
        { t: "Aggregate demand", d: "Total planned expenditure on domestic output at a given price level." },
        { t: "SRAS", d: "Output firms supply in the short run, when some costs are fixed." },
        { t: "LRAS", d: "Potential output given the quantity and productivity of factors of production." },
        { t: "Equilibrium", d: "The price level at which planned expenditure equals planned output." }
      ],
      formula: "AD = C + I + G + (X − M)",
      diagram: "adas",
      chain: [
        "A component of AD rises — for example, consumer confidence lifts consumption.",
        "Firms see inventories fall and expand output along the SRAS curve.",
        "As spare capacity is used up, wages and other factor costs rise, shifting SRAS to the left.",
        "The new equilibrium has a higher price level; whether real output is permanently higher depends on LRAS."
      ],
      analysis: [
        "AD slopes downwards because of the real balance effect, the interest rate effect and the trade effect.",
        "SRAS slopes upwards because wages and other costs are sticky and capacity is fixed in the short run.",
        "The shape of LRAS is contested: vertical in the classical model, L-shaped in the Keynesian model.",
        "A leftward shift of SRAS — an energy shock, for example — produces stagflation: rising prices with falling output."
      ],
      evaluation: [
        "The correct shape of LRAS depends on the time horizon and the amount of spare capacity.",
        "Expectations can shift AD faster than any policy response.",
        "Supply shocks may dominate demand management, making fine-tuning impossible.",
        "Policy acts with lags, so it targets yesterday's output gap, not today's."
      ],
      exam: "Always label both axes (price level, real output) and state which curve shifts and why. A diagram without a sentence of explanation earns little.",
      links: ["growth", "inflation", "fiscal", "monetary"]
    },
    {
      id: "growth", unit: 2, num: "2.3",
      title: "Economic growth and living standards",
      sub: "Actual versus potential growth, the cycle, and why GDP is a means rather than an end.",
      concepts: [
        { t: "Actual growth", d: "The percentage increase in real GDP over a period." },
        { t: "Potential growth", d: "The expansion of productive capacity — an outward shift of LRAS." },
        { t: "Output gap", d: "The difference between actual and potential output, as a percentage of potential." },
        { t: "Sustainable growth", d: "Growth that does not deplete the resource base for future generations." }
      ],
      diagram: "cycle",
      chain: [
        "Growth in the labour force, capital stock or productivity shifts LRAS to the right.",
        "Higher AD then uses spare capacity, so actual output rises towards potential.",
        "Higher output raises employment, incomes and tax revenue, improving public finances.",
        "But demand-led growth beyond capacity produces inflation, and growth may be unevenly distributed."
      ],
      analysis: [
        "Benefits: higher employment, higher tax revenue, poverty reduction and more fiscal space.",
        "Costs: inflation if demand outruns capacity, environmental damage, congestion and inequality.",
        "Composition matters — export-led, investment-led or commodity-led growth have different durability.",
        "Growth is necessary but not sufficient for development: distribution, health and freedom also matter."
      ],
      evaluation: [
        "GDP ignores home production, the informal economy, inequality and environmental damage.",
        "Diminishing returns to capital and the middle-income trap limit catch-up growth.",
        "Growth financed by borrowing or resource extraction is not sustainable.",
        "Distinguish short-run demand growth from long-run supply growth — they need different policies."
      ],
      exam: "If the question says living standards, do not answer with GDP alone. Bring in distribution, PPP, non-income dimensions and sustainability.",
      links: ["supply-side", "inequality", "poverty"]
    },
    {
      id: "inflation", unit: 2, num: "2.4",
      title: "Inflation, deflation and price stability",
      sub: "Causes, costs, measurement problems, and why the target is 2% rather than 0%.",
      concepts: [
        { t: "CPI", d: "A weighted basket of consumer goods; the UK and ECB target measure." },
        { t: "Demand-pull", d: "Inflation caused by AD rising faster than productive capacity." },
        { t: "Cost-push", d: "Inflation caused by rising costs shifting SRAS to the left." },
        { t: "Deflation", d: "A sustained fall in the general price level." }
      ],
      formula: "real interest rate ≈ nominal interest rate − inflation rate",
      diagram: "adas-shift",
      chain: [
        "Demand-pull: an increase in AD pushes output against capacity, so firms raise prices.",
        "Cost-push: higher wages, energy or import prices shift SRAS left, raising prices and lowering output.",
        "Expectations adjust: workers bargain for higher wages, producing a wage-price spiral.",
        "Monetary policy tightens, reducing AD — but the effect arrives 12–24 months later."
      ],
      analysis: [
        "Losers: savers, pensioners on fixed incomes, exporters priced out of foreign markets, lenders.",
        "Winners: borrowers (real debt falls), holders of real assets, governments with nominal debt.",
        "Costs: menu costs, shoe-leather costs, uncertainty that deters investment, arbitrary redistribution.",
        "Deflation is dangerous when it is malign: falling demand raises real debt, forcing asset sales and further falls."
      ],
      evaluation: [
        "The CPI basket may not match the experience of students or low-income households, especially housing costs.",
        "Cost-push inflation cannot be cured by demand policy without accepting higher unemployment.",
        "Imported inflation may be temporary, so tightening may be unnecessary.",
        "Targeting 2% rather than 0% gives room to cut real interest rates in a downturn."
      ],
      exam: "Do not just list causes: link each to a curve shift, then to who gains and loses. For evaluation, weigh the magnitude and duration of the price shock.",
      links: ["monetary", "phillips", "exchange-rates"]
    },
    {
      id: "unemployment", unit: 2, num: "2.5",
      title: "Unemployment: types, measures and costs",
      sub: "Diagnose the type before prescribing the policy — this is the classic evaluation point.",
      concepts: [
        { t: "ILO measure", d: "People without work, available to start within two weeks and actively seeking." },
        { t: "Claimant count", d: "The number claiming unemployment-related benefits — narrower and easier to manipulate." },
        { t: "Structural", d: "Mismatch between workers' skills or location and available jobs." },
        { t: "Cyclical", d: "Unemployment caused by a shortfall in aggregate demand." }
      ],
      diagram: "adas-shift",
      chain: [
        "A fall in AD — a recession, or a collapse in investment — reduces derived demand for labour.",
        "Firms cut hours and headcount, raising cyclical unemployment.",
        "Long spells out of work erode skills and employer perceptions, so the natural rate rises (hysteresis).",
        "Demand policy treats cyclical unemployment; supply-side policy is needed for structural unemployment."
      ],
      analysis: [
        "Costs: lost output, lower tax revenue, higher welfare spending, and social costs such as crime and poor health.",
        "The type of unemployment determines the correct policy — retraining versus stimulus.",
        "Youth unemployment scars careers and is usually double the adult rate.",
        "Regional and occupational immobility turn a local shock into a structural problem."
      ],
      evaluation: [
        "Measured unemployment understates slack: underemployment, zero-hours contracts and discouraged workers are excluded.",
        "The natural rate is unobservable and its estimates move, so policy targets are uncertain.",
        "Migration and participation change the labour force, so the rate can fall while the number rises.",
        "Supply-side policies work over years, while the unemployed need income now."
      ],
      exam: "If the data show unemployment of 4% but youth unemployment of 14%, that gap is your evaluation: the aggregate hides a structural problem.",
      links: ["fiscal", "supply-side", "phillips"]
    },
    {
      id: "phillips", unit: 2, num: "2.6",
      title: "The Phillips curve and the policy trade-off",
      sub: "Why the short-run trade-off exists, and why it disappeared in the 1970s.",
      concepts: [
        { t: "SRPC", d: "Short-run Phillips curve: the inverse relationship between inflation and unemployment." },
        { t: "NAIRU", d: "The non-accelerating inflation rate of unemployment — the natural rate in policy language." },
        { t: "Expectations-augmented", d: "The curve shifts when expected inflation changes." },
        { t: "Sacrifice ratio", d: "The output cost of reducing inflation by one percentage point." }
      ],
      diagram: "phillips",
      chain: [
        "Expansionary policy pushes unemployment below the natural rate.",
        "Tight labour markets give workers bargaining power, so wage growth accelerates.",
        "Workers and firms revise inflation expectations upward, shifting the SRPC to the right.",
        "In the long run unemployment returns to the NAIRU, but at a permanently higher inflation rate."
      ],
      analysis: [
        "The simple trade-off broke down in the 1970s when stagflation combined rising prices with rising unemployment.",
        "Credibility determines the cost of disinflation: a credible central bank shifts expectations quickly.",
        "Supply shocks shift the SRPC, so the same unemployment rate can coexist with very different inflation.",
        "The short-run trade-off still guides the timing of policy."
      ],
      evaluation: [
        "The NAIRU is estimated, not observed, and it moves with institutions and hysteresis.",
        "Expectations are hard to measure — adaptive and rational models give different predictions.",
        "Globalisation and technology may have flattened the curve since the 1990s.",
        "A deep recession can raise the NAIRU, so the 'natural' rate is partly a policy outcome."
      ],
      exam: "Use the Phillips curve only as a supporting model. The strongest answers combine it with AD/AS and name the expectations assumption.",
      links: ["inflation", "unemployment", "monetary"]
    },
    {
      id: "bop", unit: 2, num: "2.7",
      title: "The balance of payments and the current account",
      sub: "What a deficit really means, and why depreciation is not a quick fix.",
      concepts: [
        { t: "Current account", d: "Trade in goods and services plus primary and secondary income flows." },
        { t: "Financial account", d: "Flows of direct, portfolio and other investment, plus reserve changes." },
        { t: "Marshall-Lerner", d: "A depreciation improves the current account if the sum of export and import elasticities exceeds one." },
        { t: "J-curve", d: "The current account worsens before it improves after a depreciation." }
      ],
      chain: [
        "Strong domestic demand raises imports relative to exports, worsening the current account.",
        "A depreciation makes exports cheaper in foreign currency and imports dearer at home.",
        "If elasticities are high enough, export and import volumes adjust and the balance improves.",
        "But in the short run, the import bill rises before volumes fall — the J-curve."
      ],
      analysis: [
        "The current account equals (S − I) + (T − G): a deficit reflects low saving, high investment, or both.",
        "A deficit is not automatically a problem if it finances productive investment that raises future output.",
        "Surplus countries such as China and Germany export excess savings, which shows up as deficits elsewhere.",
        "Competitiveness depends on unit labour costs, productivity, quality and design, not only the exchange rate."
      ],
      evaluation: [
        "Elasticities are uncertain and often low in the short run, especially for essential imports such as energy.",
        "Depreciation raises import prices and therefore inflation, which may force tighter monetary policy.",
        "Global imbalances reflect reserve currency status and saving behaviour, not just price competitiveness.",
        "Services trade and income flows are poorly measured, so the data can be revised substantially."
      ],
      exam: "Never say a deficit is bad by definition. Ask what is financing it and whether the borrowing funds investment.",
      links: ["exchange-rates", "trade", "globalisation"]
    },
    {
      id: "fiscal", unit: 2, num: "2.8",
      title: "Fiscal policy",
      sub: "Automatic stabilisers, discretionary stimulus, crowding out and debt sustainability.",
      concepts: [
        { t: "Budget deficit", d: "Government spending minus tax revenue in a single year." },
        { t: "Structural deficit", d: "The deficit that would remain at full employment — the underlying position." },
        { t: "Automatic stabiliser", d: "Tax and benefit rules that dampen the cycle without a policy decision." },
        { t: "Crowding out", d: "Higher government borrowing displacing private investment." }
      ],
      formula: "Δ(debt/GDP) ≈ (r − g) × debt − primary balance",
      diagram: "adas-shift",
      chain: [
        "The government cuts taxes or raises spending, adding directly to AD.",
        "Multiplier effects raise incomes and therefore tax revenue, so part of the cost is recovered.",
        "Borrowing rises, which may push up bond yields if markets doubt sustainability.",
        "If the interest rate exceeds the growth rate, debt/GDP rises unless there is a primary surplus."
      ],
      analysis: [
        "Automatic stabilisers act immediately; discretionary policy suffers recognition, decision and implementation lags.",
        "Multipliers are larger in deep recessions and when interest rates are already near zero.",
        "Composition matters: infrastructure spending has a larger multiplier than a tax cut for high earners.",
        "Austerity can be self-defeating if spending cuts reduce growth faster than they reduce borrowing."
      ],
      evaluation: [
        "Crowding out depends on spare capacity and on whether monetary policy accommodates the fiscal expansion.",
        "Market confidence and credibility can matter more than the deficit itself.",
        "Debt sustainability depends on growth, interest rates, currency and maturity structure.",
        "Political economy: deficits are easier to create than to reverse."
      ],
      exam: "Distinguish the cyclical from the structural deficit. A deficit during a recession may be evidence of stabilisers working, not fiscal failure.",
      links: ["circular-flow", "monetary", "conflicts"]
    },
    {
      id: "monetary", unit: 2, num: "2.9",
      title: "Monetary policy",
      sub: "Transmission channels, quantitative easing, and the limits of interest rates.",
      concepts: [
        { t: "Policy rate", d: "The central bank's rate, which anchors market interest rates (Bank Rate in the UK)." },
        { t: "Transmission mechanism", d: "The chain from policy rate to spending, output and prices." },
        { t: "Quantitative easing", d: "Central bank purchases of assets to lower yields and inject liquidity." },
        { t: "Liquidity trap", d: "A situation where near-zero rates fail to stimulate spending." }
      ],
      chain: [
        "The central bank raises Bank Rate.",
        "Banks' funding costs rise, so mortgage, loan and credit card rates follow.",
        "Consumption and investment fall; asset prices fall, reducing wealth and confidence.",
        "AD falls and inflation eases — but only after a lag of roughly 12–24 months."
      ],
      analysis: [
        "Five channels: interest rate, credit, asset price, exchange rate and expectations.",
        "QE works through portfolio rebalancing: investors buy riskier assets, lowering yields and raising prices.",
        "Inflation targeting anchors expectations, which makes disinflation cheaper in output terms.",
        "The zero lower bound limits conventional policy, pushing central banks towards QE and forward guidance."
      ],
      evaluation: [
        "Long and variable lags mean policy can amplify the cycle if timed badly.",
        "Interest rates cannot fix cost-push inflation or structural unemployment without a large output cost.",
        "QE inflates asset prices, benefiting wealthy households and worsening inequality.",
        "Independence gives credibility but removes democratic control; coordination with fiscal policy is difficult."
      ],
      exam: "Link every rate change to a specific component of AD. 'Higher rates reduce spending' is assertion; 'higher mortgage costs cut disposable income and consumption' is analysis.",
      links: ["inflation", "phillips", "financial"]
    },
    {
      id: "supply-side", unit: 2, num: "2.10",
      title: "Supply-side policies",
      sub: "Shifting LRAS rather than pushing along it — slow, but the only route to non-inflationary growth.",
      concepts: [
        { t: "Market-based", d: "Deregulation, privatisation, tax cuts, flexible labour markets, trade liberalisation." },
        { t: "Interventionist", d: "Education, training, infrastructure, R&D and industrial policy." },
        { t: "LRAS", d: "Potential output; supply-side policy aims to shift it right." },
        { t: "Productivity", d: "Output per hour worked — the fundamental driver of long-run living standards." }
      ],
      diagram: "adas",
      chain: [
        "A policy improves incentives, competition or capacity — for example, better technical education.",
        "Investment and labour supply rise, or the same inputs produce more output.",
        "LRAS shifts right, so potential output rises and the economy can grow without inflation.",
        "The price level at any given level of AD is lower, improving the inflation–unemployment trade-off."
      ],
      analysis: [
        "Market-based measures rely on price signals and competition to allocate resources better.",
        "Interventionist measures correct market failures in training, R&D and infrastructure where returns are uncertain.",
        "Supply-side policy affects the trend rather than the cycle, so it cannot end a recession.",
        "It can lower the NAIRU, improving the short-run trade-off as well as long-run capacity."
      ],
      evaluation: [
        "Time lags of a decade or more make evaluation difficult and politically unattractive.",
        "Tax cuts may raise demand more than supply if they are not credible or permanent.",
        "Deregulation can raise inequality and reduce worker bargaining power.",
        "Infrastructure projects suffer cost overruns and political cycles."
      ],
      exam: "Always distinguish market-based from interventionist, and be explicit about the time horizon. 'In the long run' is the phrase that earns evaluation marks here.",
      links: ["growth", "unemployment", "inequality"]
    },
    {
      id: "conflicts", unit: 2, num: "2.11",
      title: "Policy objectives and conflicts",
      sub: "Four objectives, one instrument set: why governments cannot hit every target at once.",
      concepts: [
        { t: "Trade-off", d: "Achieving one objective makes another harder to achieve." },
        { t: "Policy mix", d: "Combining monetary, fiscal and supply-side instruments." },
        { t: "Tinbergen rule", d: "You need at least as many independent instruments as targets." },
        { t: "Impossible trinity", d: "A country cannot have a fixed exchange rate, free capital flows and independent monetary policy." }
      ],
      diagram: "phillips",
      chain: [
        "Expansionary policy raises growth and reduces unemployment.",
        "But it also raises inflation and worsens the current account through higher imports.",
        "Tightening later to control inflation may cause a hard landing and rising unemployment.",
        "A policy mix — fiscal, monetary and supply-side — can reduce the severity of the trade-off."
      ],
      analysis: [
        "Inflation versus unemployment: the short-run Phillips trade-off.",
        "Growth versus environment: negative externalities and resource depletion.",
        "Efficiency versus equity: redistribution may weaken incentives.",
        "Internal versus external balance: demand expansion worsens the current account."
      ],
      evaluation: [
        "Trade-offs are not fixed; supply-side policy can shift the frontier outwards.",
        "Priorities depend on the state of the cycle — inflation matters more near capacity.",
        "Lags mean policy must be forward-looking, using forecasts that are often wrong.",
        "Credibility can lower the output cost of disinflation, softening the trade-off."
      ],
      exam: "Structure answers around 'it depends on': the state of the cycle, the shape of LRAS, and the credibility of policy.",
      links: ["phillips", "fiscal", "monetary", "supply-side"]
    },
    {
      id: "inequality", unit: 2, num: "2.12",
      title: "Income and wealth distribution",
      sub: "Lorenz curves, Gini coefficients, and the efficiency cost of redistribution.",
      concepts: [
        { t: "Lorenz curve", d: "Cumulative share of income plotted against cumulative share of population." },
        { t: "Gini coefficient", d: "The area between the Lorenz curve and the 45° line, divided by the total area under the line." },
        { t: "Absolute poverty", d: "Income below a fixed threshold needed for basic needs." },
        { t: "Relative poverty", d: "Income far below the median in a given society." }
      ],
      diagram: "lorenz",
      chain: [
        "Unequal access to education, capital and bargaining power widens the dispersion of market incomes.",
        "The tax and benefit system may offset this — or reinforce it if it is regressive.",
        "High inequality reduces consumption, human capital investment and social mobility.",
        "Policy responses include progressive taxation, transfers, minimum wages and education spending."
      ],
      analysis: [
        "Gini 0 means perfect equality, 100 means one person receives all income; wealth is far more unequal than income.",
        "Inequality can incentivise effort and risk-taking, but entrenched inequality reduces growth.",
        "Global inequality between countries has fallen while within-country inequality has risen in many economies.",
        "Redistribution has efficiency costs through higher marginal tax rates, but the size is contested."
      ],
      evaluation: [
        "A single Gini hides the shape of the distribution — the top 1% versus the bottom 40%.",
        "Measurement matters: gross versus disposable income, and in-kind benefits such as health care.",
        "The Kuznets curve is an empirical pattern, not a law.",
        "The trade-off between equity and efficiency depends on the design of the tax and benefit system."
      ],
      exam: "Use the Gini as evidence, not as an argument. Explain what a change in the index means for the shape of the distribution.",
      links: ["poverty", "supply-side", "growth"]
    },

    /* ---------------- Unit 4 ---------------- */
    {
      id: "globalisation", unit: 4, num: "4.1",
      title: "Globalisation",
      sub: "Cheaper distance, global value chains, and who actually gains.",
      concepts: [
        { t: "Globalisation", d: "Growing integration of economies through trade, investment, migration and information flows." },
        { t: "Global value chain", d: "Production split across countries, with each stage located where costs are lowest." },
        { t: "MNC", d: "A firm that owns or controls production in more than one country." },
        { t: "Race to the bottom", d: "Competition to attract investment by lowering standards or taxes." }
      ],
      diagram: "none",
      chain: [
        "Falling transport and communication costs, plus trade liberalisation, expand the accessible market.",
        "Firms relocate stages of production to the lowest-cost locations, creating global value chains.",
        "Consumers gain from cheaper goods and greater variety; export-sector workers gain employment.",
        "But import-competing regions face structural unemployment, and shocks transmit faster across borders."
      ],
      analysis: [
        "Benefits: specialisation, economies of scale, technology transfer, competitive pressure on domestic firms.",
        "Costs: structural unemployment, pressure on labour and environmental standards, vulnerability to external shocks.",
        "Inequality between countries has fallen as China and India industrialised, while within-country inequality often rose.",
        "MNCs can exploit monopsony power, transfer-price profits and avoid tax."
      ],
      evaluation: [
        "Globalisation is uneven: services remain less tradable than manufactured goods.",
        "Gains depend on institutions, infrastructure and skills — openness alone is not enough.",
        "Since 2020, reshoring and 'de-risking' have slowed integration for strategic goods.",
        "Environmental costs are cross-border externalities that no single government can internalise."
      ],
      exam: "Be specific about which country and which group gains. 'Globalisation benefits everyone' is the sentence examiners deduct for.",
      links: ["trade", "emerging", "poverty"]
    },
    {
      id: "trade", unit: 4, num: "4.2",
      title: "Trade and protectionism",
      sub: "Comparative advantage, tariffs, quotas and the customs union calculus.",
      concepts: [
        { t: "Absolute advantage", d: "Producing more output with the same resources." },
        { t: "Comparative advantage", d: "Producing at a lower opportunity cost than a trading partner." },
        { t: "Tariff", d: "A tax on imports, raising the domestic price and generating revenue." },
        { t: "Customs union", d: "Free trade internally with a common external tariff." }
      ],
      diagram: "tariff",
      chain: [
        "Each country specialises where its opportunity cost is lower, then trades.",
        "Specialisation raises total output and lowers prices for consumers.",
        "A tariff raises the domestic price, cuts consumer surplus and creates deadweight loss.",
        "Retaliation can escalate into a trade war, reducing welfare for all participants."
      ],
      analysis: [
        "Winners from trade: consumers, exporters, efficient producers and workers in export sectors.",
        "Losers: import-competing producers and their workers, who face adjustment costs.",
        "Protectionist arguments: infant industry, strategic industries, employment, anti-dumping, food security.",
        "A customs union creates trade between members but may divert trade from more efficient outsiders."
      ],
      evaluation: [
        "Comparative advantage is dynamic and can be created by industrial policy or education.",
        "Distribution matters: compensation for losers may be needed to make liberalisation politically sustainable.",
        "Short-run protection may preserve jobs but raises costs for downstream firms and consumers.",
        "WTO rules constrain tariffs but enforcement is weak, and non-tariff barriers are rising."
      ],
      exam: "For a tariff question, draw the diagram and label consumer surplus, producer surplus, government revenue and deadweight loss. Then evaluate by magnitude.",
      links: ["globalisation", "exchange-rates", "emerging"]
    },
    {
      id: "exchange-rates", unit: 4, num: "4.3",
      title: "Exchange rates",
      sub: "Floating, fixed, and the J-curve that makes depreciation disappointing at first.",
      concepts: [
        { t: "Depreciation", d: "A fall in the value of a floating currency." },
        { t: "Devaluation", d: "A deliberate fall in a fixed exchange rate." },
        { t: "J-curve", d: "The current account worsens before improving after depreciation." },
        { t: "Impossible trinity", d: "Fixed rate, free capital movement and independent monetary policy: pick two." }
      ],
      diagram: "jcurve",
      chain: [
        "Higher domestic interest rates attract capital inflows, raising demand for the currency.",
        "The currency appreciates, making exports dearer and imports cheaper, so the current account worsens.",
        "A depreciation restores competitiveness, but raises import prices and therefore inflation.",
        "Volumes adjust slowly, so the current account first worsens then improves — the J-curve."
      ],
      analysis: [
        "Determinants: interest differentials, inflation differentials, the current account, speculation and intervention.",
        "A fixed rate provides certainty for trade and investment but requires reserves and sacrifices monetary independence.",
        "A floating rate absorbs shocks but creates volatility that deters long-term investment.",
        "Competitive devaluation is zero-sum: one country's gain is another's loss."
      ],
      evaluation: [
        "Whether depreciation helps depends on elasticities — the Marshall-Lerner condition.",
        "Pass-through to inflation depends on the import content of consumption and production.",
        "Credibility matters more than the level for a pegged currency.",
        "A currency union trades monetary autonomy for stability and lower transaction costs."
      ],
      exam: "Distinguish depreciation (floating) from devaluation (fixed). Then separate the short-run price effect from the long-run volume effect.",
      links: ["bop", "inflation", "trade"]
    },
    {
      id: "poverty", unit: 4, num: "4.4",
      title: "Poverty and development",
      sub: "Measuring deprivation, and why aid is neither villain nor saviour.",
      concepts: [
        { t: "Absolute poverty", d: "Income below the threshold needed for basic needs (World Bank: $2.15/day, 2017 PPP)." },
        { t: "Multidimensional Poverty Index", d: "Deprivation in health, education and living standards." },
        { t: "HDI", d: "A composite of income, life expectancy and schooling." },
        { t: "Poverty trap", d: "Low income leading to low saving and investment, which perpetuates low income." }
      ],
      diagram: "none",
      chain: [
        "Low productivity means low income, which limits saving and investment.",
        "Poor health and education reduce human capital, keeping productivity low — a poverty trap.",
        "Aid, FDI, debt relief and trade access can inject capital and knowledge to break the cycle.",
        "But weak institutions and corruption can absorb the gains, so the effect depends on governance."
      ],
      analysis: [
        "Measures: income poverty, MPI (health, education, living standards), HDI, Gini for distribution.",
        "Causes: geography, colonial legacy, conflict, weak institutions, terms of trade, debt overhang.",
        "Policies: targeted aid, FDI, microfinance, property rights, education, trade access, debt relief.",
        "Structural change: moving labour from low-productivity agriculture to higher-productivity sectors."
      ],
      evaluation: [
        "Aid effectiveness depends on governance and absorption capacity; there is a risk of dependency.",
        "FDI can crowd out domestic firms and repatriate profits, limiting the local gain.",
        "Growth may not reduce poverty if the gains accrue to a small elite.",
        "Data quality is poor: informal activity, subsistence farming and under-reporting distort the picture."
      ],
      exam: "Use both income and non-income measures. A country can grow while poverty stays high if distribution worsens.",
      links: ["inequality", "emerging", "globalisation"]
    },
    {
      id: "emerging", unit: 4, num: "4.5",
      title: "Emerging and developing economies",
      sub: "Export-led growth, FDI and the middle-income trap.",
      concepts: [
        { t: "Emerging economy", d: "A fast-growing middle-income economy undergoing industrialisation." },
        { t: "FDI", d: "Investment by a firm in productive capacity it controls in another country." },
        { t: "Middle-income trap", d: "Growth slowing when wages rise before productivity and skills catch up." },
        { t: "Dependency", d: "Reliance on primary exports or foreign capital that limits autonomous growth." }
      ],
      diagram: "none",
      chain: [
        "Low wages and abundant labour attract labour-intensive FDI and outsourced production.",
        "Export processing creates jobs, foreign exchange and links to global buyers.",
        "Rising wages erode cost advantage, so the country must move up the value chain.",
        "Skills, infrastructure and institutions determine whether it escapes the middle-income trap."
      ],
      analysis: [
        "Export-led growth in East Asia contrasted with import substitution in Latin America and Africa.",
        "MNCs bring capital, technology and management, but repatriate profits and may crowd out local firms.",
        "Commodity dependence creates volatility, the resource curse and Dutch disease.",
        "State-led industrial policy can pick winners, or waste resources through rent-seeking."
      ],
      evaluation: [
        "Successful cases such as Korea and Taiwan had strong states, land reform and geopolitics — hard to replicate.",
        "Dependency theory overstates passivity; global value chains do allow upgrading.",
        "The middle-income trap is a tendency, not a destiny.",
        "GDP understates the informal economy and overstates resource-extraction 'growth'."
      ],
      exam: "Anchor the answer in one or two named cases with numbers. Generic 'developing countries' answers score poorly on application.",
      links: ["poverty", "trade", "globalisation"]
    },
    {
      id: "financial", unit: 4, num: "4.6",
      title: "The financial sector and regulation",
      sub: "Maturity transformation, systemic risk and the 2008 template.",
      concepts: [
        { t: "Financial intermediation", d: "Pooling savings and channelling them to borrowers." },
        { t: "Maturity transformation", d: "Borrowing short-term and lending long-term, creating liquidity risk." },
        { t: "Systemic risk", d: "The risk that one institution's failure spreads through the system." },
        { t: "Moral hazard", d: "Taking more risk because the downside is borne by someone else." }
      ],
      diagram: "none",
      chain: [
        "Banks borrow short and lend long, so they are vulnerable to a loss of confidence.",
        "A shock — subprime mortgage losses — creates uncertainty about which banks are solvent.",
        "Interbank lending freezes, credit contracts and AD falls sharply.",
        "Governments recapitalise banks and central banks supply liquidity, creating moral hazard."
      ],
      analysis: [
        "Functions: pooling savings, maturity transformation, risk diversification, payments infrastructure.",
        "Market failures: asymmetric information, externalities from bank failure, and too-big-to-fail.",
        "Regulation: capital ratios (Basel III), stress tests, deposit insurance, ring-fencing.",
        "The 2008 crisis spread through securitisation, leverage and globally linked balance sheets."
      ],
      evaluation: [
        "Regulation reduces crisis risk but raises costs and can push activity into the shadow banking sector.",
        "Bailouts create moral hazard; allowing failure risks contagion.",
        "Macroprudential tools can target the cycle, but timing is difficult.",
        "There is a genuine trade-off between stability and financial innovation."
      ],
      exam: "Link financial failure to the real economy through credit and AD. That transmission is what earns the macro marks.",
      links: ["monetary", "conflicts", "globalisation"]
    },

    /* ---------------- bridge topics ---------------- */
    {
      id: "micro-tools", unit: 1, num: "1.x",
      title: "Micro tools that earn macro marks",
      sub: "Elasticity, incidence and externalities turn a general answer into an applied one.",
      concepts: [
        { t: "Price elasticity of demand", d: "Responsiveness of quantity demanded to a price change." },
        { t: "Tax incidence", d: "How the burden of a tax is shared between buyers and sellers." },
        { t: "Negative externality", d: "A cost imposed on third parties, causing over-production." },
        { t: "Government failure", d: "Intervention that makes outcomes worse than the market." }
      ],
      diagram: "tax",
      chain: [
        "A tax on a good shifts supply upwards by the amount of the tax.",
        "If demand is inelastic, the price rises by almost the full tax and consumers bear most of the burden.",
        "Quantity falls only slightly, so the policy raises revenue but changes behaviour little.",
        "A subsidy or regulation may be better if the aim is to change behaviour rather than raise revenue."
      ],
      analysis: [
        "Elasticity explains why fuel and cigarette taxes raise revenue but barely cut consumption.",
        "Externality diagrams justify intervention, but only if the marginal external cost is known.",
        "Indirect taxes correct output; they do not compensate the victims directly.",
        "Government failure — information gaps, unintended consequences — limits the case for intervention."
      ],
      evaluation: [
        "Estimates of elasticities and external costs are uncertain, so the optimal tax is uncertain.",
        "Regressive effects: indirect taxes hit lower incomes proportionally harder.",
        "Behavioural responses (smuggling, black markets) undermine the policy.",
        "Macro policy also has micro effects — always link back to incentives."
      ],
      exam: "Use one micro concept precisely rather than three loosely. A well-labelled elasticity argument can lift an application mark.",
      links: ["inflation", "supply-side"]
    },
    {
      id: "business", unit: 3, num: "3.x",
      title: "Business behaviour links",
      sub: "Costs, scale and market power shape the supply side of the economy.",
      concepts: [
        { t: "Economies of scale", d: "Falling long-run average cost as output rises." },
        { t: "Productivity", d: "Output per unit of input; the source of long-run growth." },
        { t: "Market power", d: "The ability of a firm to set price above marginal cost." },
        { t: "Derived demand", d: "Demand for labour that comes from demand for the product." }
      ],
      diagram: "none",
      chain: [
        "A firm grows and exploits economies of scale, lowering long-run average cost.",
        "Lower unit costs allow lower prices or higher margins, improving competitiveness.",
        "Higher profitability funds investment in capital and R&D, raising productivity.",
        "At the macro level, this is a rightward shift of LRAS — non-inflationary growth."
      ],
      analysis: [
        "Productivity growth is the main driver of real wages and living standards.",
        "Market power can fund innovation but also restrict output and raise prices.",
        "Investment depends on expected demand, interest rates and business confidence.",
        "Labour demand is derived, so weak product demand quickly becomes weak hiring."
      ],
      evaluation: [
        "Economies of scale may become diseconomies beyond a certain size.",
        "Market power may be temporary (contestable markets) or entrenched (barriers to entry).",
        "Profit does not automatically become investment — it may be distributed or held as cash.",
        "Macro policy cannot create productivity; it can only change incentives."
      ],
      exam: "Link firm-level efficiency to macro outcomes explicitly. That bridge is what distinguishes a top-band Unit 2 answer from a micro answer.",
      links: ["supply-side", "growth"]
    }
  ];

  /* ---------------------------------------------------------
     Glossary
     --------------------------------------------------------- */
  const glossary = [
    { t: "Aggregate demand (AD)", c: "macro", d: "Total planned expenditure on domestic output at a given price level: C + I + G + (X − M).", u: "A fall in AD raises cyclical unemployment." },
    { t: "Aggregate supply (AS)", c: "macro", d: "Total output firms are willing to supply at a given price level, in the short or long run.", u: "An energy shock shifts SRAS left." },
    { t: "Actual growth", c: "macro", d: "The annual percentage increase in real GDP, driven by demand or supply.", u: "Actual growth of 1.1% was below potential growth." },
    { t: "Potential growth", c: "macro", d: "The rate at which productive capacity grows — an outward shift of LRAS.", u: "Potential growth is limited by productivity." },
    { t: "Output gap", c: "macro", d: "The difference between actual and potential output, expressed as a percentage of potential.", u: "A negative output gap implies spare capacity." },
    { t: "Inflationary gap", c: "macro", d: "The amount by which actual output exceeds potential, generating upward pressure on prices.", u: "An inflationary gap calls for tightening." },
    { t: "Deflationary gap", c: "macro", d: "The shortfall of actual output below potential at full employment.", u: "A deflationary gap justifies fiscal stimulus." },
    { t: "Recession", c: "macro", d: "A fall in real GDP, conventionally for two consecutive quarters.", u: "The 2008–09 recession raised cyclical unemployment." },
    { t: "Business cycle", c: "macro", d: "The recurring pattern of boom, slowdown, recession and recovery in real GDP.", u: "The cycle reflects fluctuations in AD." },
    { t: "Multiplier", c: "macro", d: "The ratio of the change in equilibrium national income to the initial change in injections.", u: "With MPC 0.8 the multiplier is 5." },
    { t: "Marginal propensity to consume (MPC)", c: "macro", d: "The proportion of an extra unit of income that households spend.", u: "A higher MPC raises the multiplier." },
    { t: "Injections", c: "macro", d: "Spending that adds to the circular flow: investment, government spending and exports.", u: "An injection of investment raises national income." },
    { t: "Withdrawals", c: "macro", d: "Income that leaves the circular flow: saving, taxes and imports.", u: "Higher imports reduce the multiplier." },
    { t: "Stagflation", c: "macro", d: "Simultaneous rising inflation and rising unemployment, usually from a supply shock.", u: "The 1970s oil shocks caused stagflation." },
    { t: "Disinflation", c: "macro", d: "A fall in the rate of inflation — prices still rise, but more slowly.", u: "Disinflation cost output in the early 1980s." },
    { t: "Deflation", c: "macro", d: "A sustained fall in the general price level.", u: "Malign deflation raises real debt burdens." },
    { t: "Hyperinflation", c: "macro", d: "Very rapid and uncontrolled inflation, eroding the functions of money.", u: "Hyperinflation destroys confidence in the currency." },
    { t: "Consumer prices index (CPI)", c: "measurement", d: "A weighted basket of consumer goods used to measure inflation; the UK and ECB target measure.", u: "CPI inflation fell to 3.3% in 2024." },
    { t: "Demand-pull inflation", c: "macro", d: "Inflation caused by aggregate demand rising faster than productive capacity.", u: "Demand-pull inflation is associated with a positive output gap." },
    { t: "Cost-push inflation", c: "macro", d: "Inflation caused by rising costs of production shifting SRAS to the left.", u: "Higher energy prices produced cost-push inflation." },
    { t: "Wage-price spiral", c: "macro", d: "A self-reinforcing cycle in which wage claims and price rises feed each other.", u: "A wage-price spiral makes inflation persistent." },
    { t: "Unemployment", c: "macro", d: "The proportion of the labour force without work, available for work and actively seeking it.", u: "Unemployment rose during the recession." },
    { t: "Cyclical unemployment", c: "macro", d: "Unemployment caused by a deficiency of aggregate demand.", u: "Cyclical unemployment responds to stimulus." },
    { t: "Structural unemployment", c: "macro", d: "Unemployment caused by a mismatch between skills or location and available jobs.", u: "Deindustrialisation created structural unemployment." },
    { t: "Frictional unemployment", c: "macro", d: "Short-term unemployment while people move between jobs.", u: "Some frictional unemployment is unavoidable." },
    { t: "Seasonal unemployment", c: "macro", d: "Unemployment that follows regular seasonal patterns, such as tourism or agriculture.", u: "Seasonal unemployment rises in winter." },
    { t: "Real wage unemployment", c: "macro", d: "Unemployment caused by wages held above the market-clearing level.", u: "A high minimum wage can cause real wage unemployment." },
    { t: "Natural rate of unemployment", c: "macro", d: "The unemployment rate consistent with stable inflation in the long run.", u: "Supply-side policy aims to lower the natural rate." },
    { t: "NAIRU", c: "macro", d: "The non-accelerating inflation rate of unemployment — the natural rate in policy language.", u: "The NAIRU is estimated rather than observed." },
    { t: "Hysteresis", c: "macro", d: "The process by which a period of high unemployment raises the natural rate.", u: "Long-term unemployment causes hysteresis." },
    { t: "Phillips curve", c: "macro", d: "A curve showing the short-run inverse relationship between inflation and unemployment.", u: "The Phillips curve shifted in the 1970s." },
    { t: "Balance of payments", c: "global", d: "A record of a country's transactions with the rest of the world, comprising the current, capital and financial accounts.", u: "The balance of payments always balances in accounting terms." },
    { t: "Current account", c: "global", d: "Trade in goods and services plus primary income and secondary income flows.", u: "The UK runs a persistent current account deficit." },
    { t: "Financial account", c: "global", d: "Cross-border flows of direct, portfolio and other investment, plus reserve assets.", u: "A current account deficit is financed by a financial account surplus." },
    { t: "J-curve", c: "global", d: "The tendency of the current account to worsen before improving after a depreciation.", u: "The J-curve reflects slow volume adjustment." },
    { t: "Marshall-Lerner condition", c: "global", d: "A depreciation improves the current account if the sum of export and import price elasticities exceeds one.", u: "If elasticities are low, the Marshall-Lerner condition fails." },
    { t: "Exchange rate", c: "global", d: "The price of one currency expressed in another.", u: "A weaker exchange rate raises import prices." },
    { t: "Depreciation", c: "global", d: "A fall in the value of a currency determined by market forces.", u: "Sterling depreciated after the referendum." },
    { t: "Devaluation", c: "global", d: "A deliberate reduction in the value of a fixed exchange rate.", u: "Devaluation requires central bank action." },
    { t: "Purchasing power parity (PPP)", c: "measurement", d: "The exchange rate at which identical goods cost the same in two countries.", u: "PPP adjusts GDP for cost of living differences." },
    { t: "Competitiveness", c: "global", d: "The ability of domestic firms to sell abroad and at home against foreign rivals.", u: "Unit labour costs determine competitiveness." },
    { t: "Productivity", c: "macro", d: "Output per unit of input, usually per hour worked.", u: "Productivity growth raises potential output." },
    { t: "GDP", c: "measurement", d: "The total market value of goods and services produced within a country in a period.", u: "GDP measures output, not welfare." },
    { t: "GNI", c: "measurement", d: "GDP plus net income from abroad — the income accruing to residents.", u: "GNI better reflects income in countries with large remittances." },
    { t: "GDP per capita", c: "measurement", d: "GDP divided by population; a crude measure of average living standards.", u: "GDP per capita ignores distribution." },
    { t: "Fiscal policy", c: "policy", d: "The use of government spending and taxation to influence the economy.", u: "Fiscal policy was expansionary during the pandemic." },
    { t: "Monetary policy", c: "policy", d: "The use of interest rates and money supply measures by a central bank to influence the economy.", u: "Monetary policy tightened to control inflation." },
    { t: "Supply-side policy", c: "policy", d: "Policy designed to raise productive capacity by improving incentives, competition or skills.", u: "Supply-side policy shifts LRAS right." },
    { t: "Budget deficit", c: "policy", d: "Government expenditure exceeding revenue in a given year.", u: "The deficit widened during the recession." },
    { t: "National debt", c: "policy", d: "The accumulated stock of government borrowing, usually expressed as a percentage of GDP.", u: "Government debt reached 130% of GDP." },
    { t: "Automatic stabiliser", c: "policy", d: "A tax or benefit mechanism that dampens fluctuations without an explicit policy decision.", u: "Unemployment benefits act as automatic stabilisers." },
    { t: "Discretionary fiscal policy", c: "policy", d: "Deliberate changes in spending or tax rates by government.", u: "Discretionary policy suffers from lags." },
    { t: "Crowding out", c: "policy", d: "The reduction in private investment caused by government borrowing and higher interest rates.", u: "Crowding out weakens fiscal stimulus." },
    { t: "Quantitative easing", c: "policy", d: "Central bank purchases of assets to inject liquidity and lower long-term interest rates.", u: "QE was used when rates hit the zero bound." },
    { t: "Inflation target", c: "policy", d: "A stated inflation rate that a central bank is required to achieve.", u: "The UK target is 2% CPI." },
    { t: "Forward guidance", c: "policy", d: "Communication about the future path of policy to influence expectations.", u: "Forward guidance can lower long-term rates." },
    { t: "Austerity", c: "policy", d: "Fiscal consolidation through spending cuts or tax rises to reduce borrowing.", u: "Austerity reduced demand after 2010." },
    { t: "Laffer curve", c: "policy", d: "The relationship suggesting tax revenue may fall if rates are too high.", u: "The Laffer curve is used to argue for tax cuts." },
    { t: "Progressive tax", c: "policy", d: "A tax taking a larger proportion of income from higher earners.", u: "Income tax is progressive." },
    { t: "Regressive tax", c: "policy", d: "A tax taking a larger proportion of income from lower earners.", u: "VAT is regressive relative to income." },
    { t: "Structural deficit", c: "policy", d: "The deficit that remains even at full employment.", u: "A structural deficit requires fiscal consolidation." },
    { t: "Debt sustainability", c: "policy", d: "The ability to service debt without explosive growth in the debt ratio.", u: "Sustainability depends on r versus g." },
    { t: "Policy mix", c: "policy", d: "The combination of fiscal, monetary and supply-side instruments used together.", u: "A policy mix can reduce trade-offs." },
    { t: "Impossible trinity", c: "policy", d: "The impossibility of combining a fixed exchange rate, free capital flows and independent monetary policy.", u: "The euro area chooses fixed rates and free capital." },
    { t: "Globalisation", c: "global", d: "The growing integration of economies through trade, investment, migration and information.", u: "Globalisation increased competitive pressure." },
    { t: "Comparative advantage", c: "global", d: "The ability to produce a good at a lower opportunity cost than a trading partner.", u: "Comparative advantage justifies specialisation." },
    { t: "Terms of trade", c: "global", d: "The ratio of export prices to import prices, usually expressed as an index.", u: "A fall in the terms of trade raises import costs." },
    { t: "Tariff", c: "global", d: "A tax on imported goods.", u: "A tariff raises the domestic price." },
    { t: "Quota", c: "global", d: "A physical limit on the quantity of a good that may be imported.", u: "A quota restricts supply and raises price." },
    { t: "Protectionism", c: "global", d: "Policies restricting trade to shield domestic producers.", u: "Protectionism raises consumer prices." },
    { t: "Customs union", c: "global", d: "Free trade among members with a common external tariff.", u: "A customs union creates and diverts trade." },
    { t: "Trade creation", c: "global", d: "Replacing high-cost domestic production with cheaper imports from a partner.", u: "Trade creation raises welfare." },
    { t: "Trade diversion", c: "global", d: "Switching imports from a low-cost non-member to a higher-cost member.", u: "Trade diversion reduces welfare." },
    { t: "Foreign direct investment (FDI)", c: "global", d: "Investment in productive capacity in another country by a firm that controls it.", u: "FDI can transfer technology." },
    { t: "Multinational corporation (MNC)", c: "global", d: "A firm that owns or controls production in more than one country.", u: "MNCs can shift profits between jurisdictions." },
    { t: "Dependency theory", c: "global", d: "The view that developing economies are held back by their reliance on advanced economies.", u: "Dependency theory criticises primary-export specialisation." },
    { t: "Import substitution", c: "global", d: "Industrialisation strategy based on replacing imports with domestic production.", u: "Import substitution often produced inefficient firms." },
    { t: "Export-led growth", c: "global", d: "Growth driven by expanding exports and integration into world markets.", u: "East Asia pursued export-led growth." },
    { t: "Infant industry", c: "global", d: "A new domestic industry that may need temporary protection to reach scale.", u: "Infant-industry protection is hard to remove." },
    { t: "Dumping", c: "global", d: "Selling exports below cost or below the home-market price.", u: "Anti-dumping duties are a form of protection." },
    { t: "Foreign aid", c: "global", d: "Resource transfers from one country or institution to another to support development.", u: "Aid effectiveness depends on governance." },
    { t: "Microfinance", c: "global", d: "Small loans and financial services for people excluded from formal banking.", u: "Microfinance can support small enterprises." },
    { t: "Remittances", c: "global", d: "Money sent home by migrants working abroad.", u: "Remittances exceed aid in many economies." },
    { t: "Human Development Index (HDI)", c: "measurement", d: "A composite index of income, life expectancy and schooling.", u: "HDI captures non-income development." },
    { t: "Absolute poverty", c: "measurement", d: "Income below a fixed threshold needed for basic needs.", u: "The World Bank line is $2.15 a day." },
    { t: "Relative poverty", c: "measurement", d: "Income significantly below the median of the society concerned.", u: "Relative poverty can rise during growth." },
    { t: "Gini coefficient", c: "measurement", d: "A measure of inequality between 0 (perfect equality) and 100 (one person receives all income).", u: "A Gini of 41 indicates high inequality." },
    { t: "Lorenz curve", c: "measurement", d: "A curve showing cumulative income shares against cumulative population shares.", u: "The Lorenz curve bows further from the diagonal as inequality rises." },
    { t: "Kuznets curve", c: "measurement", d: "The hypothesis that inequality rises then falls as an economy develops.", u: "The Kuznets curve is not a law." },
    { t: "Resource curse", c: "global", d: "The tendency of resource-rich countries to grow slowly because of volatility, corruption or Dutch disease.", u: "Oil wealth has not guaranteed growth." },
    { t: "Dutch disease", c: "global", d: "A resource boom that raises the exchange rate and damages other tradable sectors.", u: "Dutch disease hit manufacturing after gas exports." },
    { t: "Middle-income trap", c: "global", d: "A situation where growth slows at middle income because wages rise before productivity does.", u: "Malaysia and Brazil risk the middle-income trap." },
    { t: "Sustainable development", c: "global", d: "Development that meets present needs without compromising future generations.", u: "Sustainable development requires decoupling growth from emissions." },
    { t: "Systemic risk", c: "global", d: "The risk that failure of one institution spreads through the financial system.", u: "Lehman's failure demonstrated systemic risk." },
    { t: "Moral hazard", c: "global", d: "Taking greater risks because the costs are borne by someone else.", u: "Deposit insurance can create moral hazard." }
  ];

  /* ---------------------------------------------------------
     Essay bank
     --------------------------------------------------------- */
  const essays = [
    {
      id: "e1", unit: 2, topicId: "unemployment", marks: 25, command: "Evaluate",
      q: "Evaluate the view that a sustained increase in aggregate demand is the most effective way to reduce unemployment in a developed economy.",
      hook: "Compare a country with low unemployment and low growth (e.g. Germany) with one where growth has not reduced youth unemployment.",
      plan: [
        { label: "Introduction", text: "Define unemployment and distinguish cyclical from structural. State the line: demand expansion works when the problem is cyclical, but the type of unemployment determines effectiveness." },
        { label: "Analysis", text: "Mechanism 1: higher AD raises derived demand for labour, firms expand output and hire; the multiplier reinforces the initial rise. Use a country with spare capacity and a negative output gap." },
        { label: "Analysis", text: "Mechanism 2: the size of the effect depends on the multiplier and on how much capacity exists. If the economy is near LRAS, extra demand mostly raises prices, not employment." },
        { label: "Evaluation", text: "If unemployment is structural, demand expansion creates inflation and labour shortages rather than jobs — retraining and mobility policy is needed. Evidence: youth unemployment far above the adult rate points to mismatch." },
        { label: "Evaluation", text: "Lags, crowding out and worsening of the current account limit demand policy. Supply-side policy works slowly but raises the sustainable level of employment." },
        { label: "Judgement", text: "Demand policy is most effective in a deep recession with spare capacity and low inflation. In a near-capacity economy with structural mismatch, supply-side measures dominate. The answer depends on the diagnosis, not on ideology." }
      ],
      model: "A sustained rise in AD raises the demand for labour because labour is a derived demand. If firms face a negative output gap, they can expand output without bidding up wages, so employment rises and measured unemployment falls. In the UK in 2020–21, fiscal support protected demand and unemployment peaked below earlier forecasts. However, the same expansion near full capacity raises costs and prices rather than employment, which is why the effectiveness of demand policy depends on how much spare capacity exists."
    },
    {
      id: "e2", unit: 2, topicId: "monetary", marks: 25, command: "Discuss",
      q: "Discuss whether monetary policy is more effective than fiscal policy in controlling inflation.",
      hook: "Use a country that tightened aggressively (UK 2022–24) against one using fiscal consolidation (euro area austerity).",
      plan: [
        { label: "Introduction", text: "Define both policies and the objective of price stability. Note that effectiveness depends on the cause of inflation and the state of the economy." },
        { label: "Analysis", text: "Monetary policy acts through interest rates on borrowing, asset prices and the exchange rate. It is flexible, decided quickly and insulated from political pressure — useful against demand-pull inflation." },
        { label: "Analysis", text: "Fiscal policy can be targeted: raising taxes or cutting spending reduces AD directly, and automatic stabilisers work without lags. It can also address specific price pressures, such as energy support." },
        { label: "Evaluation", text: "Monetary policy has long and variable lags (12–24 months) and cannot address cost-push inflation without a large output cost. High rates also raise mortgage costs, hitting homeowners unevenly." },
        { label: "Evaluation", text: "Fiscal consolidation is politically difficult, slow to implement and may be contractionary if timed badly. Fiscal policy also carries credibility risk if markets doubt debt sustainability." },
        { label: "Judgement", text: "Monetary policy is the primary tool for demand-pull inflation because it is timely and credible. Fiscal policy is better for targeted support and for supply shocks. Where inflation is cost-push, coordination matters more than the choice of instrument." }
      ],
      model: "Monetary policy is generally better suited to demand-pull inflation. Raising Bank Rate increases the cost of borrowing, reduces consumption and investment, and lowers AD, easing price pressure without a political decision each time. The UK's tightening cycle from 2022 shows the mechanism, but also its cost: mortgage repayments rose sharply while inflation fell only gradually, illustrating the long transmission lag."
    },
    {
      id: "e3", unit: 4, topicId: "exchange-rates", marks: 25, command: "Evaluate",
      q: "Evaluate the impact of a depreciation of a country's exchange rate on its macroeconomic performance.",
      hook: "Use a depreciation episode and check what happened to inflation and the current account in the following two years.",
      plan: [
        { label: "Introduction", text: "Define depreciation. Identify the channels: net exports, inflation, growth, and the value of external debt." },
        { label: "Analysis", text: "A depreciation lowers export prices in foreign currency and raises import prices at home. If elasticities satisfy Marshall-Lerner, export and import volumes adjust and net exports rise, supporting growth and employment." },
        { label: "Analysis", text: "Import prices rise, so CPI inflation increases and real incomes fall. The central bank may raise rates, offsetting the competitiveness gain." },
        { label: "Evaluation", text: "The J-curve means the current account may worsen first. Elasticities are lower in the short run, especially for essential imports such as energy and food." },
        { label: "Evaluation", text: "Effects differ by country: a commodity exporter benefits from higher export prices in domestic currency; a country with foreign-currency debt faces a rising debt burden." },
        { label: "Judgement", text: "Depreciation is a temporary competitiveness tool with an inflation cost. It works best when elasticities are high and the economy has spare capacity; it is least effective when import dependence is high." }
      ],
      model: "A depreciation improves competitiveness only if volumes respond. Exporters can cut foreign-currency prices, and importers face higher domestic prices, but the trade balance first deteriorates because the value of existing imports rises before quantities adjust. This J-curve pattern explains why a weaker currency often looks like a failure in the first year and a success in the third."
    },
    {
      id: "e4", unit: 2, topicId: "supply-side", marks: 25, command: "Assess",
      q: "Assess the view that supply-side policies are the best way to raise long-run living standards.",
      hook: "Compare a high-productivity economy with an emerging economy investing in education and infrastructure.",
      plan: [
        { label: "Introduction", text: "Define living standards and distinguish income from broader measures. Define market-based and interventionist supply-side policy." },
        { label: "Analysis", text: "Supply-side policy shifts LRAS right, raising potential output without inflation. Education and infrastructure raise human and physical capital, which is the only sustainable source of higher real wages." },
        { label: "Analysis", text: "Market-based reforms improve allocative efficiency: competition lowers prices, labour market flexibility reduces the natural rate of unemployment." },
        { label: "Evaluation", text: "Time lags are long, often a decade, and benefits are uncertain. Tax cuts may raise demand more than supply, and deregulation may worsen inequality and working conditions." },
        { label: "Evaluation", text: "Living standards also depend on distribution, public services and the environment. Growth in GDP per capita may coexist with stagnant median incomes." },
        { label: "Judgement", text: "Supply-side policy is the best route to sustainable living standards in the long run, but it is not sufficient: distribution, public goods and environmental quality require separate policy. Demand policy still matters for short-run stability." }
      ],
      model: "Supply-side policy is the only route to higher living standards that does not generate inflation. Investment in education raises the marginal product of labour, shifting LRAS right and allowing real wages to rise without price pressure. The difficulty is timing: the returns arrive after the political cycle, which is why governments often prefer demand measures with immediate, visible effects."
    },
    {
      id: "e5", unit: 2, topicId: "bop", marks: 25, command: "Evaluate",
      q: "Evaluate the extent to which a large current account deficit is a problem for an economy.",
      hook: "Compare the United States (persistent deficit, reserve currency) with a deficit country facing a currency crisis.",
      plan: [
        { label: "Introduction", text: "Define the current account and a deficit. State that the significance depends on its cause, its financing and the exchange rate regime." },
        { label: "Analysis", text: "A deficit means the country is absorbing more than it produces, financed by capital inflows. If those inflows fund investment, future capacity rises and the deficit is sustainable." },
        { label: "Analysis", text: "A deficit can signal weak competitiveness or low saving. Persistent deficits may require higher interest rates to attract financing, slowing growth." },
        { label: "Evaluation", text: "Reserve currency status allows the US to finance deficits in its own currency, so the constraint is weaker. Emerging economies borrowing in foreign currency face abrupt stops." },
        { label: "Evaluation", text: "Depreciation may correct the deficit only if elasticities are high; otherwise it imports inflation. Structural competitiveness requires supply-side improvement." },
        { label: "Judgement", text: "A deficit is a symptom, not a disease. The key questions are what finances it, whether it funds investment, and whether the currency and maturity structure create vulnerability." }
      ],
      model: "A current account deficit is not inherently a problem. It is the mirror image of a financial account surplus, and if the inflow finances productive investment, the country is borrowing to grow. The United States has run deficits for decades without a crisis because the dollar is the global reserve currency. The same deficit in a country borrowing in foreign currency can trigger a sudden stop."
    },
    {
      id: "e6", unit: 2, topicId: "growth", marks: 25, command: "Discuss",
      q: "Discuss whether economic growth always improves living standards.",
      hook: "Pick a fast-growing economy with rising inequality or environmental damage, and compare it with a slow-growing high-income economy.",
      plan: [
        { label: "Introduction", text: "Define living standards (material and non-material) and distinguish GDP growth from development." },
        { label: "Analysis", text: "Growth raises employment, incomes and tax revenue, funding public services. Cross-country evidence links higher GDP per capita with longer life expectancy and lower absolute poverty." },
        { label: "Analysis", text: "Growth can be unequally distributed. If the Gini rises, median incomes may stagnate even as GDP rises, so average living standards overstate typical experience." },
        { label: "Evaluation", text: "Negative externalities — pollution, congestion, resource depletion — reduce welfare and are not deducted from GDP. Growth may also be financed by unsustainable borrowing." },
        { label: "Evaluation", text: "Measurement problems: GDP excludes home production, the informal economy and leisure, and ignores PPP differences." },
        { label: "Judgement", text: "Growth is usually necessary but not sufficient. Whether it improves living standards depends on distribution, composition, sustainability and how welfare is measured." }
      ],
      model: "Growth tends to raise living standards through employment and tax revenue, but the link is conditional. China's rapid growth lifted hundreds of millions out of absolute poverty, yet within-country inequality rose sharply and environmental costs were severe. A country can therefore record strong GDP growth while median living standards improve much more slowly."
    },
    {
      id: "e7", unit: 2, topicId: "inequality", marks: 25, command: "Evaluate",
      q: "Evaluate the policies a government could use to reduce income inequality.",
      hook: "Use a Nordic economy with high taxes and transfers against a low-tax economy with high market inequality.",
      plan: [
        { label: "Introduction", text: "Distinguish income from wealth inequality, and market outcomes from post-tax outcomes. State that policy can act at each stage." },
        { label: "Analysis", text: "Progressive income tax and means-tested benefits reduce disposable income inequality directly. The Nordic model shows that high taxes and generous transfers can cut the Gini substantially." },
        { label: "Analysis", text: "Long-run policy targets market inequality: education, training, minimum wages and collective bargaining raise the earning power of low-income groups." },
        { label: "Evaluation", text: "Redistribution can reduce incentives to work and invest. High marginal rates may encourage tax avoidance and capital flight, shrinking the tax base." },
        { label: "Evaluation", text: "Minimum wages may raise unemployment if demand for labour is elastic, though evidence is mixed. Education policy works over a generation, not a parliament." },
        { label: "Judgement", text: "A combination is most effective: pre-distribution through education and wages, plus redistribution through tax and benefits. The optimal balance depends on the country's institutions and the efficiency cost of taxation." }
      ],
      model: "Redistribution through progressive taxation and transfers is the fastest way to reduce income inequality. Denmark combines high marginal tax rates with generous in-work benefits and achieves one of the lowest Gini coefficients in the OECD. The cost is a higher tax burden and potentially weaker incentives, which is why the design of the system matters more than its size."
    },
    {
      id: "e8", unit: 4, topicId: "globalisation", marks: 25, command: "Assess",
      q: "Assess the impact of globalisation on developing economies.",
      hook: "Contrast an Asian economy integrated into manufacturing value chains with an African economy dependent on primary exports.",
      plan: [
        { label: "Introduction", text: "Define globalisation and the channels: trade, FDI, migration, technology. Note that impact varies by country and by integration strategy." },
        { label: "Analysis", text: "Integration into global value chains creates employment, foreign exchange and technology transfer. East Asian economies used export-led growth to raise productivity and incomes." },
        { label: "Analysis", text: "Consumers gain from cheaper imports, and competition pressures domestic firms to improve efficiency." },
        { label: "Evaluation", text: "Primary-commodity exporters face volatility, the resource curse and declining terms of trade, so gains are smaller and less stable." },
        { label: "Evaluation", text: "Globalisation can worsen within-country inequality, expose workers to unsafe conditions, and transmit external shocks quickly." },
        { label: "Judgement", text: "Globalisation is an opportunity, not a guarantee. The outcome depends on institutions, infrastructure, skills and the terms of integration — which is why policy choices matter." }
      ],
      model: "Globalisation has been transformative where countries integrated into manufacturing value chains. Viet Nam's export-led model raised GDP per capita rapidly and reduced poverty, because FDI brought capital, technology and access to markets. The gains are less certain for economies exporting unprocessed commodities, where prices are volatile and linkages to the rest of the economy are weak."
    },
    {
      id: "e9", unit: 4, topicId: "trade", marks: 25, command: "Evaluate",
      q: "Evaluate the view that protectionism benefits an economy.",
      hook: "Use a tariff episode and its measured effects on consumers and downstream producers.",
      plan: [
        { label: "Introduction", text: "Define protectionism and its instruments: tariffs, quotas, subsidies, administrative barriers." },
        { label: "Analysis", text: "Protection can preserve domestic employment and output in the short run, and infant-industry protection may allow firms to reach scale." },
        { label: "Analysis", text: "The cost is borne by consumers and downstream firms: higher prices, reduced choice and deadweight loss, shown in the tariff diagram." },
        { label: "Evaluation", text: "Retaliation can escalate, and export sectors suffer more than protected sectors gain. WTO rules constrain but do not eliminate protection." },
        { label: "Evaluation", text: "Strategic arguments (food security, defence, supply-chain resilience) provide a stronger case than simple job protection." },
        { label: "Judgement", text: "Protection benefits specific groups at the expense of the wider economy. It can be justified temporarily for infant industries or strategic security, but the cost is usually higher than the benefit." }
      ],
      model: "A tariff raises the domestic price above the world price, transferring surplus from consumers to domestic producers and the government. The deadweight loss is the lost trades where domestic cost exceeds the world price. Employment may be preserved in the protected sector, but the cost per job saved is usually far above the wage, which is why economists are sceptical of protection as an employment policy."
    },
    {
      id: "e10", unit: 2, topicId: "fiscal", marks: 25, command: "Evaluate",
      q: "Evaluate the view that high levels of government debt limit a government's ability to manage the economy.",
      hook: "Compare a country with debt above 200% of GDP (Japan) with one facing a debt crisis at much lower levels.",
      plan: [
        { label: "Introduction", text: "Define national debt and the deficit. Note that sustainability depends on the interest rate relative to growth, not the level alone." },
        { label: "Analysis", text: "High debt raises interest payments, crowding out other spending and reducing fiscal space in a recession. Markets may demand a risk premium, raising borrowing costs." },
        { label: "Analysis", text: "If r > g, the debt ratio rises without a primary surplus, forcing austerity or inflation." },
        { label: "Evaluation", text: "Japan shows that high debt in domestic currency with a captive investor base can be sustained for decades. The US borrows in its own currency and retains reserve status." },
        { label: "Evaluation", text: "Debt issued to fund productive investment can raise growth and reduce the debt ratio. Austerity may be self-defeating if it cuts growth faster than spending." },
        { label: "Judgement", text: "Debt constrains policy mainly through interest costs, market confidence and currency exposure. The level matters less than the structure, the growth rate and the credibility of the framework." }
      ],
      model: "The constraint is not the debt level itself but the relationship between the interest rate and the growth rate. Japan has carried debt above 200% of GDP with low yields because the debt is in yen and held domestically. A country borrowing in foreign currency can face a crisis at far lower levels, because a depreciation raises the real burden."
    },
    {
      id: "e11", unit: 4, topicId: "poverty", marks: 25, command: "Assess",
      q: "Assess the effectiveness of foreign aid in promoting economic development.",
      hook: "Contrast a well-governed aid recipient with a case where aid was absorbed by corruption or dependency.",
      plan: [
        { label: "Introduction", text: "Define aid and distinguish humanitarian, bilateral, multilateral and tied aid. Development means more than income." },
        { label: "Analysis", text: "Aid can finance health, education and infrastructure that raise human capital and productivity. It can also provide foreign exchange for essential imports." },
        { label: "Analysis", text: "Targeted aid — vaccinations, school meals, cash transfers — has a strong evidence base and low leakage." },
        { label: "Evaluation", text: "Aid may be fungible: governments redirect their own spending, so the net effect is smaller. Weak institutions and corruption reduce effectiveness." },
        { label: "Evaluation", text: "Dependency and tied aid reduce the benefit. FDI and trade may be more powerful engines of growth than aid." },
        { label: "Judgement", text: "Aid is effective in specific, measurable interventions and where governance is reasonable. It is not a substitute for domestic institutions, trade access or investment." }
      ],
      model: "Aid works best when it is targeted and the recipient has functioning institutions. Vaccination programmes and cash transfers have measurable effects on health and consumption at low cost. General budget support is more uncertain because it is fungible: money is not labelled, so the net increase in spending may be small."
    },
    {
      id: "e12", unit: 4, topicId: "financial", marks: 25, command: "Discuss",
      q: "Discuss whether the financial sector requires more regulation.",
      hook: "Use the 2008 crisis and a later bank failure to show both the cost of under-regulation and of over-regulation.",
      plan: [
        { label: "Introduction", text: "Define financial regulation and the market failures it addresses: asymmetric information, externalities, systemic risk." },
        { label: "Analysis", text: "Banks are fragile because they transform short-term deposits into long-term loans. A failure creates externalities for the whole economy, as credit contracts and AD falls." },
        { label: "Analysis", text: "Capital requirements, stress tests and deposit insurance reduce the probability and cost of failure." },
        { label: "Evaluation", text: "Regulation raises costs, reduces lending and can push activity into the less-regulated shadow banking sector." },
        { label: "Evaluation", text: "Moral hazard: deposit insurance and bailouts encourage risk-taking. Too-big-to-fail institutions may be subsidised by implicit guarantees." },
        { label: "Judgement", text: "More regulation is justified where externalities are large, but the design matters more than the quantity. Macroprudential tools and resolution regimes are more efficient than blanket restrictions." }
      ],
      model: "Financial regulation addresses a genuine market failure: the failure of one bank imposes costs on the whole economy. The 2008 crisis showed how securitisation and leverage transmitted losses across borders within weeks. Higher capital requirements reduce that risk, but they also raise the cost of lending, which is why the optimal level of regulation is a trade-off rather than a maximum."
    },
    {
      id: "e13", unit: 2, topicId: "circular-flow", marks: 8, command: "Explain",
      q: "Explain how an increase in investment can raise national income through the multiplier process.",
      hook: "Use a specific injection figure and an MPC to compute the total effect.",
      plan: [
        { label: "Define", text: "The multiplier is the ratio of the change in equilibrium national income to the initial change in injections. MPC is the fraction of extra income spent." },
        { label: "Mechanism", text: "Investment spending becomes income for capital-goods firms and their workers. They spend part of it, creating income for other firms. Each round is smaller because of withdrawals (S, T, M)." },
        { label: "Calculation", text: "k = 1/(1 − MPC). If MPC = 0.8, k = 5, so a £10bn injection raises national income by up to £50bn, subject to spare capacity." },
        { label: "Application", text: "The effect is larger when there is spare capacity and when the marginal propensity to import is low." }
      ],
      model: "An increase in investment of £10bn becomes income for construction firms and their employees. If households spend 80% of any extra income, £8bn is respent, then £6.4bn, and so on. The total change in national income approaches £50bn, because the multiplier is 1/(1 − 0.8) = 5."
    },
    {
      id: "e14", unit: 2, topicId: "inflation", marks: 8, command: "Explain",
      q: "Explain the difference between demand-pull and cost-push inflation.",
      hook: "Use one country experiencing both in the same period.",
      plan: [
        { label: "Define", text: "Inflation is a sustained rise in the general price level. Demand-pull arises from AD; cost-push arises from SRAS." },
        { label: "Demand-pull", text: "AD shifts right against capacity, firms raise prices and output rises. Associated with a positive output gap and low unemployment." },
        { label: "Cost-push", text: "Rising input costs shift SRAS left, so prices rise and output falls. Associated with stagflation." },
        { label: "Contrast", text: "The policy implication differs: demand-pull responds to tighter policy; cost-push may require supply-side measures or accepting a temporary output loss." }
      ],
      model: "Demand-pull inflation occurs when aggregate demand grows faster than productive capacity, shifting the AD curve to the right along an upward-sloping SRAS curve. Cost-push inflation occurs when input costs such as energy or wages rise, shifting SRAS to the left, so output falls while prices rise — the stagflation pattern of 2022."
    }
  ];

  /* ---------------------------------------------------------
     Calculation drills
     --------------------------------------------------------- */
  const calculations = [
    { q: "MPC is 0.75. What is the value of the multiplier?", a: "4", explain: "k = 1/(1 − 0.75) = 1/0.25 = 4." },
    { q: "The multiplier is 2.5 and investment rises by $8bn. What is the change in national income?", a: "20", explain: "ΔY = k × ΔI = 2.5 × 8 = $20bn." },
    { q: "Nominal interest rate is 6% and inflation is 4.5%. What is the real interest rate?", a: "1.5", explain: "Real rate ≈ nominal − inflation = 6 − 4.5 = 1.5%." },
    { q: "GDP is $2.4tn and population is 60 million. What is GDP per capita in $?", a: "40000", explain: "2.4tn / 60m = $40,000." },
    { q: "Real GDP rises from $500bn to $530bn. What is the growth rate in %?", a: "6", explain: "(530 − 500)/500 × 100 = 6%." },
    { q: "A country's Gini coefficient rises from 34 to 41. By how many points did inequality rise?", a: "7", explain: "41 − 34 = 7 points; higher Gini means more unequal." },
    { q: "Government spending is 45% of GDP and tax revenue is 39% of GDP. What is the budget deficit as % of GDP?", a: "6", explain: "45 − 39 = 6% of GDP." },
    { q: "Export prices index is 120 and import prices index is 100. What is the terms of trade index?", a: "120", explain: "Terms of trade = (120/100) × 100 = 120." },
    { q: "An economy has 3 million unemployed and a labour force of 50 million. What is the unemployment rate in %?", a: "6", explain: "3/50 × 100 = 6%." },
    { q: "MPC is 0.6 and the government injects $15bn. What is the total rise in national income, in $bn?", a: "37.5", explain: "k = 1/(1 − 0.6) = 2.5; ΔY = 2.5 × 15 = $37.5bn." }
  ];

  return {
    indicators: indicators,
    indicatorMap: indicatorMap,
    presets: presets,
    topics: topics,
    glossary: glossary,
    essays: essays,
    calculations: calculations
  };
})();
