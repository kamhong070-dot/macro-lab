/* ============================================================
   Macro Lab — application logic
   Vanilla JS, no build step. Data: World Bank Indicators API.
   ============================================================ */

(function () {
  "use strict";

  var C = window.MACRO_CONTENT;
  var IND = C.indicatorMap;
  var LS = {
    countries: "macrolab:countries:v2",
    country: "macrolab:c:v2:",
    selected: "macrolab:selected:v2",
    compare: "macrolab:compare:v2"
  };
  var YEAR_NOW = new Date().getFullYear();
  var MAX_AGE = 7 * 24 * 3600 * 1000;      // country data: 7 days
  var META_AGE = 30 * 24 * 3600 * 1000;    // country list: 30 days

  /* ---------------------------------------------------------
     Utilities
     --------------------------------------------------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function chunk(arr, n) {
    var out = [];
    for (var i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
    return out;
  }
  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }
  function store(key, value) {
    try {
      if (value === undefined) {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      }
      localStorage.setItem(key, JSON.stringify(value));
      return value;
    } catch (e) { return null; }
  }
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove("is-on"); }, 2400);
  }
  function setStatus(text, mode) {
    var dot = $(".topbar-status .pulse");
    $("#status-text").textContent = text;
    dot.classList.toggle("is-busy", mode === "busy");
    dot.classList.toggle("is-error", mode === "error");
  }
  function pool(items, limit, worker) {
    var i = 0, results = [];
    function next() {
      if (i >= items.length) return Promise.resolve();
      var index = i++;
      return Promise.resolve(worker(items[index], index))
        .then(function (r) { results[index] = r; })
        .catch(function (e) { results[index] = e; })
        .then(next);
    }
    var runners = [];
    for (var k = 0; k < Math.min(limit, items.length); k++) runners.push(next());
    return Promise.all(runners).then(function () { return results; });
  }

  /* ---------------------------------------------------------
     Formatting
     --------------------------------------------------------- */
  function fmtVal(v, ind) {
    if (v == null || isNaN(v)) return "—";
    if (ind.format === "usd") {
      if (Math.abs(v) >= 1e12) return "$" + (v / 1e12).toFixed(2) + "tn";
      if (Math.abs(v) >= 1e9) return "$" + (v / 1e9).toFixed(1) + "bn";
      if (Math.abs(v) >= 1e6) return "$" + (v / 1e6).toFixed(1) + "m";
      return "$" + Math.round(v).toLocaleString("en-GB");
    }
    if (ind.format === "compact") {
      if (v >= 1e9) return (v / 1e9).toFixed(2) + "bn";
      if (v >= 1e6) return (v / 1e6).toFixed(1) + "m";
      return Math.round(v).toLocaleString("en-GB");
    }
    var dp = ind.dp == null ? 1 : ind.dp;
    var s = Number(v).toFixed(dp);
    if (ind.unit === "%") return s + "%";
    if (ind.unit === "% GDP") return s + "%";
    return s;
  }
  function fmtPlain(v, dp) {
    if (v == null || isNaN(v)) return "—";
    return Number(v).toFixed(dp == null ? 1 : dp);
  }
  function flagEmoji(iso2) {
    if (!iso2 || iso2.length !== 2) return "🌐";
    try {
      return String.fromCodePoint.apply(null, iso2.toUpperCase().split("").map(function (c) {
        return 127397 + c.charCodeAt(0);
      }));
    } catch (e) { return "🌐"; }
  }
  function latest(series) {
    if (!series || !series.length) return null;
    for (var i = series.length - 1; i >= 0; i--) {
      if (series[i][1] != null && !isNaN(series[i][1])) return { v: series[i][1], y: series[i][0] };
    }
    return null;
  }
  function previous(series) {
    if (!series || series.length < 2) return null;
    var found = 0;
    for (var i = series.length - 1; i >= 0; i--) {
      if (series[i][1] != null && !isNaN(series[i][1])) {
        found++;
        if (found === 2) return { v: series[i][1], y: series[i][0] };
      }
    }
    return null;
  }
  function inRange(series, fromYear) {
    return (series || []).filter(function (p) { return p[0] >= fromYear && p[1] != null; });
  }

  /* ---------------------------------------------------------
     World Bank API
     --------------------------------------------------------- */
  var api = {
    json: function (url, retries) {
      retries = retries == null ? 2 : retries;
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, 22000);
      return fetch(url, { signal: controller.signal })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .catch(function (err) {
          if (retries > 0) {
            return new Promise(function (r) { setTimeout(r, 700); })
              .then(function () { return api.json(url, retries - 1); });
          }
          throw err;
        })
        .then(function (data) { clearTimeout(timer); return data; })
        .catch(function (e) { clearTimeout(timer); throw e; });
    },
    countries: function () {
      var cached = store(LS.countries);
      if (cached && Date.now() - cached.ts < META_AGE && cached.list && cached.list.length > 100) {
        return Promise.resolve(cached.list);
      }
      return api.json("https://api.worldbank.org/v2/country?format=json&per_page=400")
        .then(function (data) {
          if (!Array.isArray(data) || !Array.isArray(data[1])) return [];
          var list = data[1]
            .filter(function (c) { return c.region && c.region.id !== "NA"; })
            .map(function (c) {
              return {
                id: c.id,
                name: c.name,
                iso2: c.iso2Code,
                region: c.region.value.trim(),
                income: c.incomeLevel.value
              };
            })
            .sort(function (a, b) { return a.name.localeCompare(b.name); });
          store(LS.countries, { ts: Date.now(), list: list });
          return list;
        });
    },
    /* One request per indicator, all countries batched (max 20 per request). */
    indicator: function (code, ids) {
      var out = {};
      var groups = chunk(ids, 20);
      var chain = Promise.resolve();
      groups.forEach(function (group) {
        chain = chain.then(function () {
          return api.json("https://api.worldbank.org/v2/country/" + group.join(";") +
            "/indicator/" + code + "?format=json&per_page=1000&date=1990:" + YEAR_NOW)
            .then(function (data) {
              if (!Array.isArray(data) || !Array.isArray(data[1])) return;
              var pages = (data[0] && data[0].pages) || 1;
              var consume = function (rows) {
                rows.forEach(function (r) {
                  if (r.value == null) return;
                  var id = r.countryiso3code;
                  if (!id) return;
                  (out[id] || (out[id] = [])).push([Number(r.date), Number(r.value)]);
                });
              };
              consume(data[1]);
              var extra = [];
              for (var p = 2; p <= pages; p++) {
                extra.push(api.json("https://api.worldbank.org/v2/country/" + group.join(";") +
                  "/indicator/" + code + "?format=json&per_page=1000&page=" + p + "&date=1990:" + YEAR_NOW)
                  .then(function (d2) { if (Array.isArray(d2) && Array.isArray(d2[1])) consume(d2[1]); }));
              }
              return Promise.all(extra);
            });
        });
      });
      return chain.then(function () {
        Object.keys(out).forEach(function (k) {
          out[k].sort(function (a, b) { return a[0] - b[0]; });
        });
        return out;
      });
    }
  };

  /* ---------------------------------------------------------
     State
     --------------------------------------------------------- */
  var state = {
    countries: [],
    selected: ["GBR", "USA", "CHN", "IND"],
    data: new Map(),
    loading: new Set(),
    failed: false,
    view: "dashboard",
    compare: { ids: ["GBR", "USA", "CHN"], code: "NY.GDP.MKTP.KD.ZG", years: 20 },
    topic: null,
    unit: "all",
    essay: null,
    quiz: null,
    dataIndicators: ["NY.GDP.MKTP.KD.ZG", "FP.CPI.TOTL.ZG", "SL.UEM.TOTL.ZS", "BN.CAB.XOKA.GD.ZS", "GC.DOD.TOTL.GD.ZS", "SI.POV.GINI"]
  };
  var chart = null;

  function countryMeta(id) {
    for (var i = 0; i < state.countries.length; i++) if (state.countries[i].id === id) return state.countries[i];
    return { id: id, name: id, iso2: "", region: "", income: "" };
  }
  function cachedCountry(id) {
    if (state.data.has(id)) return state.data.get(id);
    var rec = store(LS.country + id);
    if (rec && rec.ts && Date.now() - rec.ts < MAX_AGE) {
      state.data.set(id, rec);
      return rec;
    }
    return null;
  }
  function seriesOf(id, code) {
    var rec = cachedCountry(id);
    return rec && rec.series ? rec.series[code] || [] : [];
  }

  function ensureCountries(ids, opts) {
    var missing = ids.filter(function (id) { return !cachedCountry(id); });
    if (!missing.length) return Promise.resolve();
    if (!opts || !opts.silent) setStatus("Loading " + missing.length + " economies…", "busy");
    var buckets = {};
    missing.forEach(function (id) { buckets[id] = {}; });
    var failures = 0;

    return pool(C.indicators, 4, function (ind) {
      return api.indicator(ind.code, missing)
        .then(function (map) {
          Object.keys(map).forEach(function (id) {
            if (buckets[id]) buckets[id][ind.code] = map[id];
          });
        })
        .catch(function () { failures++; state.failed = true; });
    }).then(function () {
      missing.forEach(function (id) {
        var rec = { ts: Date.now(), series: buckets[id] };
        state.data.set(id, rec);
        if (!failures) store(LS.country + id, rec);   // never cache a partial fetch
      });
      setStatus("World Bank · live", state.failed ? "error" : "ok");
      if (failures) {
        toast("Some World Bank series did not load — try refreshing in a moment.");
        state.failed = false;
      }
    });
  }

  /* Lighter fetch for the world snapshot: only the four indicators on the strip. */
  function ensureWorld() {
    if (cachedCountry("WLD")) return Promise.resolve();
    var codes = ["NY.GDP.MKTP.KD.ZG", "FP.CPI.TOTL.ZG", "SL.UEM.TOTL.ZS", "NY.GDP.MKTP.CD"];
    var series = {};
    return pool(codes, 4, function (code) {
      return api.indicator(code, ["WLD"]).then(function (map) {
        if (map.WLD) series[code] = map.WLD;
      }).catch(function () {});
    }).then(function () {
      var rec = { ts: Date.now(), series: series };
      state.data.set("WLD", rec);
      store(LS.country + "WLD", rec);
    });
  }

  /* ---------------------------------------------------------
     Routing
     --------------------------------------------------------- */
  var VIEWS = ["dashboard", "compare", "topics", "glossary", "essays", "data"];

  function showView(name, opts) {
    if (VIEWS.indexOf(name) < 0) name = "dashboard";
    state.view = name;
    VIEWS.forEach(function (v) {
      var section = $("#view-" + v);
      if (section) section.hidden = v !== name;
    });
    $$("#tabs a").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("data-view") === name);
    });
    if (!opts || !opts.keepScroll) window.scrollTo(0, 0);
    if (name === "compare") renderCompare();
    if (name === "data") renderDataTable();
    if (name === "topics") {
      if (!state.topic) {
        var first = C.topics.filter(function (t) { return t.unit === 2; })[0] || C.topics[0];
        state.topic = first.id;
      }
      openTopic(state.topic, true);
    }
    if (name === "glossary" && !state.quiz) startQuiz();
  }

  window.addEventListener("hashchange", function () {
    showView(location.hash.replace("#", "") || "dashboard");
  });

  /* ---------------------------------------------------------
     Dashboard
     --------------------------------------------------------- */
  var PRESET_IDS = C.presets.map(function (p) { return p.id; });

  function renderPresets() {
    var row = $("#preset-row");
    row.innerHTML = C.presets.map(function (p) {
      var on = state.selected.indexOf(p.id) >= 0;
      return '<button class="preset' + (on ? " is-on" : "") + '" data-id="' + p.id + '">' +
        p.flag + " " + esc(p.name) + "</button>";
    }).join("");
    $$(".preset", row).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-id");
        if (state.selected.indexOf(id) >= 0) removeCountry(id);
        else addCountry(id);
      });
    });
  }

  function addCountry(id) {
    if (state.selected.indexOf(id) >= 0) return;
    state.selected.push(id);
    store(LS.selected, state.selected);
    renderPresets();
    renderCards();
    ensureCountries([id]).then(function () {
      renderCards();
      if (state.view === "data") renderDataTable();
    });
  }

  function removeCountry(id) {
    state.selected = state.selected.filter(function (x) { return x !== id; });
    store(LS.selected, state.selected);
    renderPresets();
    renderCards();
    if (state.view === "data") renderDataTable();
  }

  function renderCards() {
    var grid = $("#country-cards");
    if (!state.selected.length) {
      grid.innerHTML = '<div class="card" style="text-align:center;color:var(--muted)">Pin at least one country to start building your case studies.</div>';
      return;
    }
    grid.innerHTML = state.selected.map(function (id) {
      var meta = countryMeta(id);
      var rec = cachedCountry(id);
      if (!rec) return '<div class="skeleton-card"></div>';
      return countryCard(id, meta, rec.series);
    }).join("");

    $$("#country-cards .hook").forEach(function (b) {
      b.addEventListener("click", function () { goTopic(b.getAttribute("data-topic")); });
    });
    $$("#country-cards .cc-remove").forEach(function (b) {
      b.addEventListener("click", function () { removeCountry(b.getAttribute("data-id")); });
    });
    $$("#country-cards .link-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        state.compare.ids = [b.getAttribute("data-id")];
        state.compare.code = "NY.GDP.MKTP.KD.ZG";
        location.hash = "compare";
      });
    });
  }

  function deltaHtml(series, ind) {
    if (["usd", "compact"].indexOf(ind.format) >= 0) return "";
    var last = latest(series), prev = previous(series);
    if (!last || !prev) return "";
    var diff = last.v - prev.v;
    if (Math.abs(diff) < 0.05) return '<span class="stat-delta delta-flat">flat</span>';
    var up = diff > 0;
    var good = ind.dir === "neutral" ? null : (ind.dir === "up-good" ? up : !up);
    var cls = good === null ? "delta-flat" : (good ? "delta-up" : "delta-down");
    return '<span class="stat-delta ' + cls + '">' + (up ? "▲" : "▼") + " " + Math.abs(diff).toFixed(1) + "</span>";
  }

  function sparkline(series) {
    var pts = inRange(series, YEAR_NOW - 20);
    if (pts.length < 2) return '<div class="spark"></div>';
    var vals = pts.map(function (p) { return p[1]; });
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var span = max - min || 1;
    var w = 300, h = 40, pad = 3;
    var step = w / (pts.length - 1);
    var d = pts.map(function (p, i) {
      var x = i * step;
      var y = h - pad - ((p[1] - min) / span) * (h - pad * 2);
      return (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1);
    }).join(" ");
    var area = d + " L" + w + " " + h + " L0 " + h + " Z";
    var up = vals[vals.length - 1] >= vals[0];
    var stroke = up ? "#2c6e4a" : "#a63a46";
    var fill = up ? "rgba(44,110,74,.09)" : "rgba(166,58,70,.08)";
    return '<div class="spark"><svg viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none">' +
      '<path d="' + area + '" fill="' + fill + '"/>' +
      '<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="1.6" vector-effect="non-scaling-stroke"/>' +
      "</svg></div>";
  }

  function hooksFor(series) {
    var out = [];
    function push(topic, text) { out.push({ topic: topic, text: text }); }

    var g = latest(series["NY.GDP.MKTP.KD.ZG"]);
    var i = latest(series["FP.CPI.TOTL.ZG"]);
    var u = latest(series["SL.UEM.TOTL.ZS"]);
    var y = latest(series["SL.UEM.1524.ZS"]);
    var ca = latest(series["BN.CAB.XOKA.GD.ZS"]);
    var debt = latest(series["GC.DOD.TOTL.GD.ZS"]);
    var gini = latest(series["SI.POV.GINI"]);
    var fdi = latest(series["BX.KLT.DINV.WD.GD.ZS"]);

    if (i && i.v > 5) push("inflation", "Inflation " + i.v.toFixed(1) + "% — demand-pull or cost-push?");
    if (i && i.v < 1 && i.v >= 0) push("inflation", "Inflation under 1% — deflation risk");
    if (g && g.v < 0) push("growth", "Negative growth — output gap and the multiplier");
    if (u && u.v > 8) push("unemployment", "Unemployment " + u.v.toFixed(1) + "% — structural or cyclical?");
    if (y && u && y.v > u.v * 2) push("unemployment", "Youth rate more than twice the adult rate");
    if (ca && ca.v < -4) push("bop", "Current account " + ca.v.toFixed(1) + "% of GDP — J-curve");
    if (debt && debt.v > 90) push("fiscal", "Debt above 90% of GDP — compare r with g");
    if (gini && gini.v > 40) push("inequality", "Gini above 40 — distribution and policy");
    if (fdi && fdi.v > 5) push("emerging", "FDI above 5% of GDP — MNC argument");
    if (g && i && g.v > 2 && i.v > 4) push("conflicts", "Growth with high inflation — policy conflict");
    return out.slice(0, 3);
  }

  function countryCard(id, meta, series) {
    var stats = [
      ["NY.GDP.MKTP.KD.ZG", "GDP growth"],
      ["FP.CPI.TOTL.ZG", "Inflation (CPI)"],
      ["SL.UEM.TOTL.ZS", "Unemployment"],
      ["BN.CAB.XOKA.GD.ZS", "Current account"],
      ["GC.DOD.TOTL.GD.ZS", "Government debt"],
      ["NY.GDP.PCAP.CD", "GDP per capita"]
    ];
    var rows = stats.map(function (pair) {
      var ind = IND[pair[0]];
      var s = series[pair[0]] || [];
      var l = latest(s);
      return '<div class="stat-row" title="' + esc(ind.use) + '">' +
        '<span class="stat-label">' + pair[1] + "</span>" +
        '<span class="stat-value">' + (l ? fmtVal(l.v, ind) : "—") + "</span>" +
        deltaHtml(s, ind) +
        '<span class="stat-year">' + (l ? l.y : "") + "</span>" +
        "</div>";
    }).join("");

    var hooks = hooksFor(series);
    var hookHtml = hooks.length
      ? '<div class="hooks">' + hooks.map(function (h) {
        return '<button class="hook" data-topic="' + h.topic + '">' + esc(h.text) + "</button>";
      }).join("") + "</div>"
      : '<div class="hooks"><span style="font-size:11.5px;color:var(--muted)">No red flags in the latest data.</span></div>';

    var latestYear = null;
    Object.keys(series).forEach(function (k) {
      var l = latest(series[k]);
      if (l && (!latestYear || l.y > latestYear)) latestYear = l.y;
    });

    return '<article class="country-card">' +
      '<div class="cc-head">' +
        '<span class="flag">' + flagEmoji(meta.iso2) + "</span>" +
        "<div><div class=\"cc-name\">" + esc(meta.name) + "</div>" +
        '<div class="cc-meta">' + esc(meta.income || "") + (meta.region ? " · " + esc(meta.region) : "") + "</div></div>" +
        '<button class="cc-remove" data-id="' + id + '" title="Remove">×</button>' +
      "</div>" +
      '<div class="spark-wrap"><div class="spark-label">GDP growth, 20 years</div>' +
        sparkline(series["NY.GDP.MKTP.KD.ZG"] || []) + "</div>" +
      '<div class="cc-body">' + rows + "</div>" +
      hookHtml +
      '<div class="cc-foot"><small>' + (latestYear ? "Latest observation " + latestYear : "No data") + "</small>" +
        '<button class="link-btn" data-id="' + id + '">Compare →</button></div>' +
      "</article>";
  }

  function renderWorld() {
    var wrap = $("#world-strip");
    var series = (cachedCountry("WLD") || {}).series || {};
    var tiles = [
      ["NY.GDP.MKTP.KD.ZG", "World GDP growth"],
      ["FP.CPI.TOTL.ZG", "World inflation"],
      ["SL.UEM.TOTL.ZS", "World unemployment"],
      ["NY.GDP.MKTP.CD", "World GDP"]
    ];
    var html = tiles.map(function (t) {
      var ind = IND[t[0]];
      var l = latest(series[t[0]] || []);
      return '<div class="world-cell"><span class="k">' + t[1] + "</span>" +
        '<span class="v">' + (l ? fmtVal(l.v, ind) : "—") + "</span>" +
        '<span class="y">' + (l ? l.y : "") + "</span></div>";
    }).join("");
    wrap.innerHTML = html;
    var l = latest(series["NY.GDP.MKTP.KD.ZG"] || []);
    $("#world-foot").textContent = l
      ? "World aggregate, latest available year " + l.y + ". Source: World Bank WDI."
      : "Source: World Bank, World Development Indicators.";
  }

  async function initDashboard() {
    renderPresets();
    renderCards();
    var stored = store(LS.selected);
    if (Array.isArray(stored) && stored.length) state.selected = stored.filter(function (x) { return typeof x === "string"; });
    renderPresets();
    renderCards();

    await Promise.all([
      ensureWorld().then(renderWorld).catch(function () {}),
      ensureCountries(state.selected.slice()).then(renderCards)
    ]);
  }

  /* ---------------------------------------------------------
     Compare
     --------------------------------------------------------- */
  function renderCompareChips() {
    var box = $("#compare-countries");
    var list = C.presets.filter(function (p) { return state.selected.indexOf(p.id) >= 0; });
    C.presets.forEach(function (p) {
      if (list.indexOf(p) < 0 && state.compare.ids.indexOf(p.id) >= 0) list.push(p);
    });
    box.innerHTML = list.map(function (p) {
      var on = state.compare.ids.indexOf(p.id) >= 0;
      return '<button class="chip' + (on ? " is-on" : "") + '" data-id="' + p.id + '">' +
        '<span class="flag-mini">' + p.flag + "</span>" + esc(p.name) + "</button>";
    }).join("");
    $$(".chip", box).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-id");
        var idx = state.compare.ids.indexOf(id);
        if (idx >= 0) {
          if (state.compare.ids.length === 1) { toast("Keep at least one country."); return; }
          state.compare.ids.splice(idx, 1);
        } else {
          if (state.compare.ids.length >= 4) { toast("Four countries is the maximum for a readable chart."); return; }
          state.compare.ids.push(id);
        }
        store(LS.compare, state.compare);
        renderCompareChips();
        renderCompare();
      });
    });
  }

  function initCompareSelects() {
    var sel = $("#compare-indicator");
    var groups = {};
    C.indicators.forEach(function (i) {
      (groups[i.group] = groups[i.group] || []).push(i);
    });
    sel.innerHTML = Object.keys(groups).map(function (g) {
      return '<optgroup label="' + g + '">' + groups[g].map(function (i) {
        return '<option value="' + i.code + '">' + esc(i.label) + (i.unit === "%" || i.unit === "% GDP" ? " (%)" : "") + "</option>";
      }).join("") + "</optgroup>";
    }).join("");
    sel.value = state.compare.code;
    sel.addEventListener("change", function () {
      state.compare.code = sel.value;
      store(LS.compare, state.compare);
      renderCompare();
    });
    $("#compare-range").value = String(state.compare.years || 20);
    $("#compare-range").addEventListener("change", function () {
      state.compare.years = Number(this.value);
      store(LS.compare, state.compare);
      renderCompare();
    });
    $("#compare-csv").addEventListener("click", exportCompareCSV);
  }

  var COLORS = ["#1b3a5c", "#b5751a", "#0e6f63", "#a63a46"];

  async function renderCompare() {
    var ids = state.compare.ids.slice();
    var ind = IND[state.compare.code];
    var fromYear = YEAR_NOW - (state.compare.years || 20);
    $("#compare-title").textContent = ind.label + (ind.unit === "%" || ind.unit === "% GDP" ? " (%" + (ind.unit === "% GDP" ? " of GDP)" : ")") : "");
    $("#compare-sub").textContent = "Loading series…";

    await ensureCountries(ids, { silent: true });

    var datasets = [];
    var allYears = [];
    var stats = [];

    ids.forEach(function (id, n) {
      var meta = countryMeta(id);
      var series = inRange(seriesOf(id, ind.code), fromYear).map(function (p) { return { x: p[0], y: p[1] }; });
      stats.push({ id: id, meta: meta, points: series });
      series.forEach(function (p) { if (allYears.indexOf(p.x) < 0) allYears.push(p.x); });
      datasets.push({
        label: meta.name,
        data: series,
        borderColor: COLORS[n % COLORS.length],
        backgroundColor: COLORS[n % COLORS.length],
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.25,
        spanGaps: true
      });
    });

    allYears.sort(function (a, b) { return a - b; });
    $("#compare-sub").textContent = allYears.length
      ? allYears[0] + "–" + allYears[allYears.length - 1] + " · " + ind.label + " · World Bank"
      : "No observations in this window.";

    if (chart) { chart.destroy(); chart = null; }
    if (window.Chart && allYears.length) {
      chart = new window.Chart($("#compare-chart").getContext("2d"), {
        type: "line",
        data: { datasets: datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "nearest", intersect: false },
          plugins: {
            legend: {
              position: "bottom",
              labels: { color: "#414957", boxWidth: 10, boxHeight: 10, usePointStyle: true, pointStyle: "circle", font: { size: 12 } }
            },
            tooltip: {
              backgroundColor: "#112539",
              padding: 10,
              titleFont: { size: 12 },
              bodyFont: { size: 12 },
              callbacks: {
                title: function (items) { return "Year " + items[0].parsed.x; },
                label: function (ctx) {
                  var v = ctx.parsed.y;
                  return ctx.dataset.label + ": " + (v == null ? "—" : fmtPlain(v, ind.dp) + (ind.unit === "%" || ind.unit === "% GDP" ? "%" : ""));
                }
              }
            }
          },
          scales: {
            x: {
              type: "linear",
              grid: { color: "rgba(23,27,34,.05)" },
              ticks: { color: "#767e8d", font: { size: 11 }, stepSize: 2, callback: function (v) { return String(v); } },
              title: { display: true, text: "Year", color: "#767e8d", font: { size: 11 } }
            },
            y: {
              grid: { color: "rgba(23,27,34,.07)" },
              ticks: {
                color: "#767e8d", font: { size: 11 },
                callback: function (v) { return ind.unit === "%" || ind.unit === "% GDP" ? v + "%" : v; }
              },
              title: { display: true, text: ind.short + (ind.unit && ind.unit !== "index" ? " (" + ind.unit + ")" : ""), color: "#767e8d", font: { size: 11 } }
            }
          }
        }
      });
    }

    renderCompareStats(stats, ind);
    $("#compare-note").innerHTML = noteFor(ind, stats);
  }

  function renderCompareStats(stats, ind) {
    var body = $("#compare-stats tbody");
    var rows = stats.map(function (s) {
      var vals = s.points.map(function (p) { return p.y; });
      if (!vals.length) {
        return "<tr><td>" + esc(s.meta.name) + "</td><td colspan=\"5\" style=\"color:var(--muted)\">No data</td></tr>";
      }
      var last = s.points[s.points.length - 1];
      var avg = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
      var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
      var change = last.y - vals[0];
      var unit = (ind.unit === "%" || ind.unit === "% GDP") ? "%" : "";
      return "<tr><td>" + flagEmoji(s.meta.iso2) + " " + esc(s.meta.name) + "</td>" +
        '<td class="num"><strong>' + fmtPlain(last.y, ind.dp) + unit + "</strong></td>" +
        '<td class="num">' + last.x + "</td>" +
        '<td class="num">' + fmtPlain(avg, ind.dp) + unit + "</td>" +
        '<td class="num">' + fmtPlain(min, ind.dp) + " to " + fmtPlain(max, ind.dp) + unit + "</td>" +
        '<td class="num">' + (change >= 0 ? "+" : "") + fmtPlain(change, ind.dp) + unit + "</td></tr>";
    }).join("");
    body.innerHTML = rows;
    var years = [];
    stats.forEach(function (s) { if (s.points.length) years.push(s.points[s.points.length - 1].x); });
    $("#compare-year-badge").textContent = years.length ? "Latest " + Math.max.apply(null, years) : "—";
  }

  function noteFor(ind, stats) {
    var usable = stats.filter(function (s) { return s.points.length; });
    if (usable.length < 1) return "No observations available for this indicator and period.";

    var unit = (ind.unit === "%" || ind.unit === "% GDP") ? "%" : "";
    var ranked = usable.slice().sort(function (a, b) {
      return b.points[b.points.length - 1].y - a.points[a.points.length - 1].y;
    });
    var high = ranked[0], low = ranked[ranked.length - 1];
    var parts = [];

    if (ranked.length > 1) {
      parts.push("<strong>" + esc(high.meta.name) + "</strong> recorded the highest latest value at " +
        fmtPlain(high.points[high.points.length - 1].y, ind.dp) + unit + " (" + high.points[high.points.length - 1].x + "), against " +
        fmtPlain(low.points[low.points.length - 1].y, ind.dp) + unit + " in <strong>" + esc(low.meta.name) + "</strong>.");
    } else {
      parts.push("<strong>" + esc(high.meta.name) + "</strong> latest value: " +
        fmtPlain(high.points[high.points.length - 1].y, ind.dp) + unit + " (" + high.points[high.points.length - 1].x + ").");
    }

    var swings = usable.map(function (s) {
      var vals = s.points.map(function (p) { return p.y; });
      return { name: s.meta.name, range: Math.max.apply(null, vals) - Math.min.apply(null, vals) };
    }).sort(function (a, b) { return b.range - a.range; });
    if (swings.length > 1) {
      parts.push("The most volatile path belongs to <strong>" + esc(swings[0].name) + "</strong>, with a range of " +
        fmtPlain(swings[0].range, ind.dp) + unit + " points.");
    }

    var hints = {
      Output: "Ask whether the divergence reflects different potential growth, the policy stance, or exposure to external shocks.",
      Prices: "Judge each value against the 2% target: a sustained gap points to demand pressure or a supply shock, and the policy response differs.",
      Labour: "Identify the type of unemployment before recommending policy — demand stimulus will not fix a skills mismatch.",
      External: "A deficit is not automatically a weakness: ask what finances it and whether it funds investment.",
      Fiscal: "Sustainability depends on the interest rate relative to growth, not on the debt level alone.",
      Distribution: "A single Gini hides the shape of the distribution; refer to deciles or the top 1% share if you can.",
      Development: "Income measures miss health, education and distribution — pair this with the HDI or MPI."
    };
    if (hints[ind.group]) parts.push(hints[ind.group]);
    return parts.join(" ");
  }

  function exportCompareCSV() {
    var ind = IND[state.compare.code];
    var fromYear = YEAR_NOW - (state.compare.years || 20);
    var rows = [["Country", "ISO3", "Year", ind.label + " (" + ind.unit + ")"]];
    state.compare.ids.forEach(function (id) {
      var meta = countryMeta(id);
      inRange(seriesOf(id, ind.code), fromYear).forEach(function (p) {
        rows.push([meta.name, id, p[0], p[1]]);
      });
    });
    downloadCSV("macrolab-" + ind.code.toLowerCase() + ".csv", rows);
  }

  function downloadCSV(filename, rows) {
    var csv = rows.map(function (r) {
      return r.map(function (cell) {
        var s = String(cell == null ? "" : cell);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(",");
    }).join("\n");
    var blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast("CSV downloaded — " + filename);
  }

  /* ---------------------------------------------------------
     Topics
     --------------------------------------------------------- */
  function renderTopicList() {
    var list = $("#topic-list");
    var items = C.topics.filter(function (t) { return state.unit === "all" || String(t.unit) === state.unit; });
    list.innerHTML = items.map(function (t) {
      return '<button class="topic-item' + (state.topic === t.id ? " is-active" : "") + '" data-id="' + t.id + '">' +
        '<span class="ti-num">' + t.num + "</span>" +
        '<span><span class="ti-title">' + esc(t.title) + "</span>" +
        '<span class="ti-unit">Unit ' + t.unit + "</span></span></button>";
    }).join("");
    $$(".topic-item", list).forEach(function (b) {
      b.addEventListener("click", function () { openTopic(b.getAttribute("data-id")); });
    });
  }

  function openTopic(id, silent) {
    var t = null;
    C.topics.forEach(function (x) { if (x.id === id) t = x; });
    if (!t) return;
    state.topic = id;
    renderTopicList();

    var concepts = t.concepts.map(function (c) {
      return '<div class="concept"><dt>' + esc(c.t) + "</dt><dd>" + esc(c.d) + "</dd></div>";
    }).join("");

    var links = (t.links || []).map(function (lid) {
      var lt = null;
      C.topics.forEach(function (x) { if (x.id === lid) lt = x; });
      return lt ? '<button class="hook" data-topic="' + lid + '">→ ' + esc(lt.title) + "</button>" : "";
    }).join("");

    var html =
      '<div class="td-eyebrow">Unit ' + t.unit + " · " + t.num + '</div>' +
      '<h2 class="td-title">' + esc(t.title) + "</h2>" +
      '<p class="td-sub">' + esc(t.sub) + "</p>" +
      '<div class="td-section"><h4>Key concepts</h4><dl class="concept-grid">' + concepts + "</dl>" +
        (t.formula ? '<div class="formula">' + esc(t.formula) + "</div>" : "") + "</div>" +
      (t.diagram && t.diagram !== "none"
        ? '<div class="td-section"><h4>Diagram</h4><figure class="diagram">' + diagram(t.diagram) + "<figcaption>" + diagramCaption(t.diagram) + "</figcaption></figure></div>"
        : "") +
      '<div class="td-section"><h4>Chain of reasoning</h4><ol class="chain">' +
        t.chain.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol></div>" +
      '<div class="td-section"><h4>Analysis</h4><ul class="bullets">' +
        t.analysis.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="td-section"><h4>Evaluation</h4><ul class="bullets eval">' +
        t.evaluation.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="exam-box"><span class="exam-label">Exam focus</span>' + esc(t.exam) + "</div>" +
      (links ? '<div class="td-links">' + links + "</div>" : "");

    $("#topic-detail").innerHTML = html;
    $$("#topic-detail .hook").forEach(function (b) {
      b.addEventListener("click", function () { goTopic(b.getAttribute("data-topic")); });
    });
    if (!silent) $("#topic-detail").scrollTop = 0;
  }

  function goTopic(id) {
    state.topic = id;
    if (location.hash === "#topics") openTopic(id);
    else location.hash = "topics";
  }

  function diagramCaption(kind) {
    return {
      circular: "Figure: the circular flow with injections and withdrawals.",
      adas: "Figure: AD, SRAS and LRAS in equilibrium.",
      "adas-shift": "Figure: a rightward shift of AD raises the price level and output.",
      cycle: "Figure: the business cycle around a rising trend.",
      phillips: "Figure: short-run trade-off and the vertical long-run curve.",
      lorenz: "Figure: Lorenz curve and the Gini area.",
      jcurve: "Figure: the J-curve path of the current account after depreciation.",
      tariff: "Figure: the welfare effects of a tariff.",
      tax: "Figure: incidence of an indirect tax with inelastic demand."
    }[kind] || "";
  }

  function svgFrame(xLabel, yLabel) {
    return '<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
      '<path d="M0 0 L10 5 L0 10 z" fill="#414957"/></marker></defs>' +
      '<line x1="58" y1="252" x2="436" y2="252" stroke="#414957" stroke-width="1.4" marker-end="url(#ah)"/>' +
      '<line x1="58" y1="252" x2="58" y2="24" stroke="#414957" stroke-width="1.4" marker-end="url(#ah)"/>' +
      '<text x="247" y="284" text-anchor="middle" font-size="11.5" fill="#767e8d" font-family="Inter,sans-serif">' + xLabel + "</text>" +
      '<text x="20" y="138" text-anchor="middle" font-size="11.5" fill="#767e8d" font-family="Inter,sans-serif" transform="rotate(-90 20 138)">' + yLabel + "</text>";
  }
  function lab(x, y, text, color, size, anchor) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 11.5) + '" fill="' + (color || "#414957") +
      '" font-family="Inter,sans-serif" text-anchor="' + (anchor || "start") + '">' + text + "</text>";
  }
  function dot(x, y, color) {
    return '<circle cx="' + x + '" cy="' + y + '" r="3.6" fill="' + (color || "#1b3a5c") + '" stroke="#fffdf9" stroke-width="1.5"/>';
  }

  function diagram(kind) {
    var navy = "#1b3a5c", amber = "#b5751a", teal = "#0e6f63", ink = "#414957", soft = "#9aa2af";
    var s = '<svg viewBox="0 0 460 300" role="img" aria-label="Economics diagram">';
    var body = "";

    if (kind === "adas") {
      body += svgFrame("Real output (Y)", "Price level (PL)");
      body += '<path d="M84 58 C 190 120, 300 186, 414 224" fill="none" stroke="' + navy + '" stroke-width="2.2"/>';
      body += '<path d="M84 232 C 175 188, 290 96, 410 48" fill="none" stroke="' + amber + '" stroke-width="2.2"/>';
      body += '<line x1="316" y1="38" x2="316" y2="252" stroke="' + teal + '" stroke-width="2" stroke-dasharray="6 4"/>';
      body += lab(422, 220, "AD", navy);
      body += lab(414, 44, "SRAS", amber);
      body += lab(322, 50, "LRAS", teal);
      body += '<line x1="58" y1="142" x2="243" y2="142" stroke="' + soft + '" stroke-width="1" stroke-dasharray="3 3"/>';
      body += '<line x1="243" y1="142" x2="243" y2="252" stroke="' + soft + '" stroke-width="1" stroke-dasharray="3 3"/>';
      body += dot(243, 142);
      body += lab(250, 136, "E", ink, 11);
    }

    if (kind === "adas-shift") {
      body += svgFrame("Real output (Y)", "Price level (PL)");
      body += '<path d="M84 66 C 180 124, 280 184, 400 220" fill="none" stroke="' + soft + '" stroke-width="1.6" stroke-dasharray="5 4"/>';
      body += '<path d="M120 44 C 220 104, 320 168, 436 208" fill="none" stroke="' + navy + '" stroke-width="2.2"/>';
      body += '<path d="M84 234 C 175 190, 290 96, 410 48" fill="none" stroke="' + amber + '" stroke-width="2.2"/>';
      body += '<line x1="348" y1="40" x2="348" y2="252" stroke="' + teal + '" stroke-width="1.8" stroke-dasharray="6 4"/>';
      body += lab(300, 236, "AD", soft, 11);
      body += lab(430, 200, "AD₁", navy);
      body += lab(414, 44, "SRAS", amber);
      body += lab(354, 54, "LRAS", teal);
      body += '<line x1="243" y1="142" x2="243" y2="252" stroke="' + soft + '" stroke-width="1" stroke-dasharray="3 3"/>';
      body += dot(243, 142, soft);
      body += '<line x1="318" y1="118" x2="318" y2="252" stroke="' + soft + '" stroke-width="1" stroke-dasharray="3 3"/>';
      body += dot(318, 118, navy);
      body += '<path d="M258 120 Q 285 108 306 114" fill="none" stroke="' + navy + '" stroke-width="1.4" marker-end="url(#ah)"/>';
      body += lab(226, 134, "E₁", soft, 11, "end");
      body += lab(326, 112, "E₂", navy, 11);
    }

    if (kind === "cycle") {
      body += svgFrame("Time", "Real GDP");
      body += '<line x1="64" y1="238" x2="430" y2="62" stroke="' + teal + '" stroke-width="1.6" stroke-dasharray="6 4"/>';
      body += '<path d="M70 206 C 104 168, 132 148, 160 160 C 190 172, 208 208, 236 198 C 264 188, 286 136, 314 124 C 344 111, 372 96, 420 78" fill="none" stroke="' + navy + '" stroke-width="2.4"/>';
      body += lab(386, 54, "trend", teal, 11);
      body += lab(176, 140, "boom", amber, 10.5, "middle");
      body += lab(214, 226, "recession", ink, 10.5, "middle");
      body += lab(322, 112, "recovery", ink, 10.5, "middle");
    }

    if (kind === "phillips") {
      body += svgFrame("Unemployment rate (%)", "Inflation rate (%)");
      body += '<path d="M96 60 C 160 128, 260 196, 414 224" fill="none" stroke="' + navy + '" stroke-width="2.2"/>';
      body += '<path d="M170 58 C 232 128, 320 196, 434 216" fill="none" stroke="' + soft + '" stroke-width="1.6" stroke-dasharray="5 4"/>';
      body += '<line x1="300" y1="34" x2="300" y2="252" stroke="' + teal + '" stroke-width="2" stroke-dasharray="6 4"/>';
      body += lab(112, 52, "SRPC₁", navy);
      body += lab(380, 200, "SRPC₂", soft, 11);
      body += lab(306, 46, "LRPC (NAIRU)", teal);
      body += dot(228, 158);
      body += lab(236, 152, "A", ink, 11);
      body += dot(330, 170, soft);
      body += lab(338, 164, "B", soft, 11);
    }

    if (kind === "lorenz") {
      body += '<line x1="96" y1="252" x2="404" y2="252" stroke="#414957" stroke-width="1.4" marker-end="url(#ah)"/>';
      body += '<line x1="96" y1="252" x2="96" y2="24" stroke="#414957" stroke-width="1.4" marker-end="url(#ah)"/>';
      body += '<text x="250" y="284" text-anchor="middle" font-size="11.5" fill="#767e8d" font-family="Inter,sans-serif">Cumulative % of population</text>';
      body += '<text x="26" y="140" text-anchor="middle" font-size="11.5" fill="#767e8d" font-family="Inter,sans-serif" transform="rotate(-90 26 140)">Cumulative % of income</text>';
      body += '<rect x="96" y="24" width="308" height="228" fill="none" stroke="#e4ded1"/>';
      body += '<path d="M96 252 L404 24" stroke="' + soft + '" stroke-width="1.6" stroke-dasharray="5 4"/>';
      body += '<path d="M96 252 C 176 250, 244 234, 296 196 C 338 164, 368 100, 404 24 L96 252 Z" fill="rgba(27,58,92,.09)"/>';
      body += '<path d="M96 252 C 176 250, 244 234, 296 196 C 338 164, 368 100, 404 24" fill="none" stroke="' + navy + '" stroke-width="2.2"/>';
      body += lab(352, 60, "line of equality", soft, 10.5, "end");
      body += lab(300, 180, "Lorenz curve", navy, 11);
      body += lab(196, 238, "Gini area A", ink, 10.5, "middle");
    }

    if (kind === "jcurve") {
      body += svgFrame("Time", "Current account balance");
      body += '<line x1="58" y1="150" x2="436" y2="150" stroke="' + soft + '" stroke-width="1.2" stroke-dasharray="5 4"/>';
      body += lab(64, 144, "0", soft, 10);
      body += '<path d="M70 150 C 104 166, 132 190, 172 194 C 214 198, 256 172, 296 140 C 338 106, 384 92, 428 88" fill="none" stroke="' + navy + '" stroke-width="2.4"/>';
      body += '<circle cx="172" cy="194" r="3.4" fill="' + amber + '"/>';
      body += lab(160, 214, "worse before better", amber, 10.5, "middle");
      body += lab(330, 104, "improvement", teal, 10.5, "middle");
      body += lab(96, 136, "depreciation", ink, 10.5);
    }

    if (kind === "tariff") {
      body += svgFrame("Quantity", "Price");
      body += '<path d="M92 62 L412 232" fill="none" stroke="' + navy + '" stroke-width="2.2"/>';
      body += '<path d="M92 232 L412 66" fill="none" stroke="' + amber + '" stroke-width="2.2"/>';
      body += '<line x1="92" y1="186" x2="412" y2="186" stroke="' + teal + '" stroke-width="1.8"/>';
      body += '<line x1="92" y1="152" x2="412" y2="152" stroke="' + teal + '" stroke-width="1.8" stroke-dasharray="5 4"/>';
      body += '<rect x="214" y="152" width="62" height="34" fill="rgba(181,117,26,.16)" stroke="' + amber + '" stroke-dasharray="3 3"/>';
      body += lab(420, 228, "D", navy);
      body += lab(420, 62, "S", amber);
      body += lab(352, 146, "Pw + tariff", teal, 10.5);
      body += lab(352, 202, "Pw", teal, 10.5);
      body += lab(244, 173, "revenue", amber, 9.5, "middle");
      body += lab(140, 106, "consumer surplus falls", ink, 10);
    }

    if (kind === "tax") {
      body += svgFrame("Quantity", "Price");
      body += '<path d="M92 66 L412 230" fill="none" stroke="' + navy + '" stroke-width="2.2"/>';
      body += '<path d="M92 230 L412 70" fill="none" stroke="' + soft + '" stroke-width="1.6" stroke-dasharray="5 4"/>';
      body += '<path d="M92 210 L392 58" fill="none" stroke="' + amber + '" stroke-width="2"/>';
      body += '<line x1="92" y1="160" x2="300" y2="160" stroke="' + teal + '" stroke-width="1" stroke-dasharray="3 3"/>';
      body += '<rect x="150" y="118" width="46" height="92" fill="rgba(14,111,99,.1)" stroke="' + teal + '" stroke-dasharray="3 3"/>';
      body += lab(418, 226, "D", navy);
      body += lab(300, 56, "S + tax", amber);
      body += lab(96, 118, "consumer burden", teal, 10);
      body += lab(96, 178, "producer burden", teal, 10);
    }

    if (kind === "circular") {
      body += '<rect x="52" y="62" width="118" height="56" rx="8" fill="#f1ece1" stroke="#d2c9b8"/>' + lab(111, 86, "Households", ink, 12, "middle") + lab(111, 104, "spend, save, pay tax", soft, 10, "middle");
      body += '<rect x="296" y="62" width="118" height="56" rx="8" fill="#f1ece1" stroke="#d2c9b8"/>' + lab(355, 86, "Firms", ink, 12, "middle") + lab(355, 104, "produce, invest", soft, 10, "middle");
      body += '<rect x="174" y="196" width="118" height="56" rx="8" fill="rgba(27,58,92,.06)" stroke="#1b3a5c"/>' + lab(233, 220, "Banks · Government", navy, 12, "middle") + lab(233, 238, "· Rest of world", navy, 10, "middle");
      body += '<path d="M172 82 L292 82" stroke="#1b3a5c" stroke-width="1.6" marker-end="url(#ah)"/>' + lab(232, 74, "spending", navy, 10, "middle");
      body += '<path d="M292 104 L172 104" stroke="#b5751a" stroke-width="1.6" marker-end="url(#ah)"/>' + lab(232, 120, "income", amber, 10, "middle");
      body += '<path d="M110 122 C 110 180, 170 200, 186 206" fill="none" stroke="#0e6f63" stroke-width="1.6" marker-end="url(#ah)"/>' + lab(96, 168, "S, T, M", teal, 10);
      body += '<path d="M233 192 C 233 160, 330 150, 352 122" fill="none" stroke="#0e6f63" stroke-width="1.6" marker-end="url(#ah)"/>' + lab(286, 158, "I, G, X", teal, 10);
    }

    s += body + "</svg>";
    return s;
  }

  /* ---------------------------------------------------------
     Glossary + quiz
     --------------------------------------------------------- */
  function renderGlossary(query, cat) {
    var q = (query || "").toLowerCase().trim();
    var items = C.glossary.filter(function (g) {
      var okCat = !cat || cat === "all" || g.c === cat;
      var okQ = !q || g.t.toLowerCase().indexOf(q) >= 0 || g.d.toLowerCase().indexOf(q) >= 0;
      return okCat && okQ;
    });
    var grid = $("#glossary-grid");
    if (!items.length) {
      grid.innerHTML = '<div class="card" style="color:var(--muted);text-align:center">No terms match that search.</div>';
      return;
    }
    grid.innerHTML = items.map(function (g) {
      return '<div class="term"><div class="term-head"><h3>' + esc(g.t) + '</h3><span class="term-cat">' + g.c + "</span></div>" +
        "<p>" + esc(g.d) + "</p>" + (g.u ? '<p class="term-use">Use it: ' + esc(g.u) + "</p>" : "") + "</div>";
    }).join("");
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pickDefQuestion(used) {
    var pool = C.glossary.filter(function (g) { return used.indexOf(g.t) < 0; });
    if (!pool.length) return null;
    var term = pool[Math.floor(Math.random() * pool.length)];
    var sameCat = C.glossary.filter(function (g) { return g.c === term.c && g.t !== term.t; });
    var others = shuffle(sameCat.length >= 3 ? sameCat : C.glossary.filter(function (g) { return g.t !== term.t; })).slice(0, 3);
    var options = shuffle([{ text: term.d, ok: true }].concat(others.map(function (o) { return { text: o.d, ok: false }; })));
    return {
      kind: "definition",
      topic: term.c,
      text: 'Which definition matches <strong>' + esc(term.t) + "</strong>?",
      options: options,
      explain: "<strong>" + esc(term.t) + ":</strong> " + esc(term.d) + (term.u ? " <em>" + esc(term.u) + "</em>" : ""),
      key: term.t
    };
  }

  var DATA_QUESTION_INDICATORS = [
    "NY.GDP.MKTP.KD.ZG", "FP.CPI.TOTL.ZG", "SL.UEM.TOTL.ZS",
    "BN.CAB.XOKA.GD.ZS", "GC.DOD.TOTL.GD.ZS", "SP.DYN.LE00.IN", "SI.POV.GINI"
  ];

  function pickDataQuestion() {
    var ids = state.selected.filter(function (id) { return cachedCountry(id); });
    if (ids.length < 3) return null;
    var code = DATA_QUESTION_INDICATORS[Math.floor(Math.random() * DATA_QUESTION_INDICATORS.length)];
    var ind = IND[code];
    var rows = ids.map(function (id) {
      var l = latest(seriesOf(id, code));
      return l ? { id: id, name: countryMeta(id).name, v: l.v, y: l.y } : null;
    }).filter(Boolean);
    if (rows.length < 3) return null;
    rows.sort(function (a, b) { return b.v - a.v; });
    var wantHigh = Math.random() > 0.4;
    var truth = wantHigh ? rows[0] : rows[rows.length - 1];
    var choices = shuffle(rows).slice(0, 4);
    if (!choices.some(function (r) { return r.id === truth.id; })) choices[3] = truth;
    var unit = (ind.unit === "%" || ind.unit === "% GDP") ? "%" : "";
    return {
      kind: "data",
      topic: "World Bank data",
      text: "Which of these economies had the <strong>" + (wantHigh ? "highest" : "lowest") + "</strong> " + esc(ind.label.toLowerCase()) + " in its latest year?",
      options: shuffle(choices.map(function (r) {
        return { text: esc(r.name), ok: r.id === truth.id };
      })),
      explain: rows.map(function (r) {
        return esc(r.name) + ": " + fmtPlain(r.v, ind.dp) + unit + " (" + r.y + ")";
      }).join(" · "),
      key: truth.id
    };
  }

  function pickCalcQuestion() {
    var c = C.calculations[Math.floor(Math.random() * C.calculations.length)];
    var wrongs = C.calculations.filter(function (x) { return x !== c; }).map(function (x) { return x.a; });
    var opts = shuffle([c.a].concat(shuffle(wrongs).slice(0, 3)));
    return {
      kind: "calc",
      topic: "Calculation",
      text: esc(c.q),
      options: opts.map(function (o) { return { text: o, ok: o === c.a }; }),
      explain: "<strong>Answer: " + esc(c.a) + ".</strong> " + esc(c.explain),
      key: c.a
    };
  }

  function startQuiz() {
    var items = [], used = [];
    for (var i = 0; i < 7; i++) {
      var q = pickDefQuestion(used);
      if (q) { items.push(q); used.push(q.key); }
    }
    for (var j = 0; j < 2; j++) {
      var d = pickDataQuestion();
      if (d) items.push(d);
    }
    for (var k = 0; k < 1; k++) items.push(pickCalcQuestion());
    state.quiz = { items: shuffle(items).slice(0, 10), index: 0, score: 0, answered: false };
    renderQuiz();
  }

  function renderQuiz() {
    var q = state.quiz;
    var body = $("#quiz-body");
    var foot = $("#quiz-foot");
    $("#quiz-sub").textContent = (q.items.length) + " questions · definitions, data and calculation";

    if (q.index >= q.items.length) {
      var pct = Math.round((q.score / q.items.length) * 100);
      body.innerHTML = '<div class="quiz-done"><h3>' + q.score + " / " + q.items.length + "</h3>" +
        "<p>" + (pct >= 80 ? "Exam-ready. Try the definition round again tomorrow." :
          pct >= 50 ? "Solid base — revisit the terms you missed." :
            "Go back through the glossary, then retake.") + "</p>" +
        '<button class="btn btn-primary" id="quiz-again">New round</button></div>';
      foot.innerHTML = '<span class="quiz-score">' + pct + "%</span><span>accuracy</span>";
      $("#quiz-again").addEventListener("click", startQuiz);
      return;
    }

    var item = q.items[q.index];
    var html = '<div class="quiz-progress"><span style="width:' + ((q.index / q.items.length) * 100) + '%"></span></div>' +
      '<div class="q-text"><span class="q-topic">' + esc(item.topic) + "</span>" + item.text + "</div>" +
      '<div class="options">' + item.options.map(function (o, i) {
        return '<button class="option" data-i="' + i + '">' + o.text + "</button>";
      }).join("") + "</div>" +
      '<div id="quiz-feedback"></div>';

    body.innerHTML = html;
    foot.innerHTML = "<span>Question " + (q.index + 1) + " of " + q.items.length + "</span><span>Score " + q.score + "</span>";

    $$("#quiz-body .option").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (state.quiz.answered) return;
        state.quiz.answered = true;
        var choice = Number(btn.getAttribute("data-i"));
        $$("#quiz-body .option").forEach(function (b, i) {
          b.disabled = true;
          if (item.options[i].ok) b.classList.add("is-correct");
          else if (i === choice) b.classList.add("is-wrong");
        });
        if (item.options[choice].ok) state.quiz.score++;
        var fb = $("#quiz-feedback");
        fb.innerHTML = '<div class="q-explain">' + item.explain + "</div>" +
          '<div style="margin-top:10px;text-align:right"><button class="btn btn-primary btn-small" id="quiz-next">' +
          (q.index === q.items.length - 1 ? "See result" : "Next question") + "</button></div>";
        $("#quiz-next").addEventListener("click", function () {
          state.quiz.index++;
          state.quiz.answered = false;
          renderQuiz();
        });
        foot.innerHTML = "<span>Question " + (q.index + 1) + " of " + q.items.length + "</span><span>Score " + state.quiz.score + "</span>";
      });
    });
  }

  /* ---------------------------------------------------------
     Essays
     --------------------------------------------------------- */
  function initEssaySelects() {
    var countrySel = $("#builder-country");
    var list = state.countries.length ? state.countries.slice() : C.presets.map(function (p) {
      return { id: p.id, name: p.name };
    });
    list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    countrySel.innerHTML = list.map(function (c) {
      return '<option value="' + c.id + '">' + esc(c.name) + "</option>";
    }).join("");
    countrySel.value = state.selected[0] || "GBR";

    var topicSel = $("#builder-topic");
    topicSel.innerHTML = C.topics.filter(function (t) { return t.unit !== 1 && t.unit !== 3; }).map(function (t) {
      return '<option value="' + t.id + '">' + t.num + " · " + esc(t.title) + "</option>";
    }).join("");

    $("#builder-run").addEventListener("click", buildOutline);
    $("#builder-copy").addEventListener("click", function () {
      var text = $("#builder-text").textContent;
      navigator.clipboard.writeText(text).then(function () { toast("Outline copied."); })
        .catch(function () { toast("Select the text to copy manually."); });
    });
  }

  function dataSentence(meta, series) {
    var bits = [];
    function add(code, name, unit) {
      var l = latest(series[code] || []);
      if (l) bits.push(name + " " + fmtVal(l.v, IND[code]) + (unit || "") + " (" + l.y + ")");
    }
    add("NY.GDP.MKTP.KD.ZG", "GDP growth");
    add("FP.CPI.TOTL.ZG", "inflation");
    add("SL.UEM.TOTL.ZS", "unemployment");
    add("BN.CAB.XOKA.GD.ZS", "the current account");
    add("GC.DOD.TOTL.GD.ZS", "government debt");
    if (!bits.length) return meta.name + " has limited recent World Bank data, so the argument must rely on qualitative evidence.";
    return "For " + meta.name + ", the latest World Bank data show " + bits.join(", ") + ".";
  }

  function topicById(id) {
    var t = null;
    C.topics.forEach(function (x) { if (x.id === id) t = x; });
    return t;
  }

  async function buildOutline() {
    var id = $("#builder-country").value;
    var topic = topicById($("#builder-topic").value);
    var type = $("#builder-type").value;
    var meta = countryMeta(id);
    var btn = $("#builder-run");
    btn.disabled = true;
    btn.textContent = "Building…";
    await ensureCountries([id], { silent: true });
    var series = (cachedCountry(id) || { series: {} }).series || {};
    btn.disabled = false;
    btn.textContent = "Build outline";

    var data = dataSentence(meta, series);
    var headings = [];
    var lines = [];

    var question = {
      evaluate: "Evaluate the view that " + topic.title.toLowerCase() + " is the most important influence on a country's macroeconomic performance. (25)",
      explain: "Explain " + topic.title.toLowerCase() + ". (8)",
      assess: "Assess the causes of " + topic.title.toLowerCase() + ". (12)"
    }[type];

    lines.push("QUESTION");
    lines.push("  " + question);
    lines.push("");
    lines.push("CONTEXT");
    lines.push("  " + meta.name + (meta.income ? " — " + meta.income + " economy" : "") + (meta.region ? ", " + meta.region : "") + ".");
    lines.push("  " + data);
    lines.push("");

    if (type === "explain") {
      lines.push("DEFINITION (1–2 sentences)");
      lines.push("  " + topic.concepts[0].t + ": " + topic.concepts[0].d);
      lines.push("");
      lines.push("MECHANISM (three linked steps)");
      topic.chain.slice(0, 3).forEach(function (s, i) { lines.push("  " + (i + 1) + ". " + s); });
      lines.push("");
      lines.push("APPLICATION");
      lines.push("  Apply the mechanism to " + meta.name + " using the data above. Name the group affected and the size of the effect.");
      lines.push("");
      lines.push("EXAM FOCUS");
      lines.push("  " + topic.exam);
    } else if (type === "assess") {
      lines.push("DEFINITION");
      lines.push("  " + topic.concepts[0].t + ": " + topic.concepts[0].d);
      lines.push("");
      lines.push("CAUSES — develop each with a mechanism");
      topic.analysis.forEach(function (s, i) { lines.push("  " + (i + 1) + ". " + s); });
      lines.push("");
      lines.push("RELATIVE IMPORTANCE");
      lines.push("  Which cause dominates in " + meta.name + ", and why? Use the data as evidence, then state what would change your mind.");
      lines.push("");
      lines.push("JUDGEMENT");
      lines.push("  " + topic.evaluation[0]);
    } else {
      lines.push("INTRODUCTION");
      lines.push("  Define " + topic.concepts[0].t.toLowerCase() + ": " + topic.concepts[0].d);
      lines.push("  Set the context: " + data);
      lines.push("  Signal the line of argument — which mechanism matters most and why.");
      lines.push("");
      lines.push("ANALYSIS 1 — mechanism");
      topic.chain.slice(0, 2).forEach(function (s, i) { lines.push("  " + (i + 1) + ". " + s); });
      lines.push("");
      lines.push("ANALYSIS 2 — extend");
      topic.chain.slice(2).forEach(function (s, i) { lines.push("  " + (i + 1) + ". " + s); });
      topic.analysis.slice(0, 2).forEach(function (s) { lines.push("  • " + s); });
      lines.push("");
      lines.push("EVALUATION — at least two, ideally three");
      topic.evaluation.slice(0, 3).forEach(function (s, i) { lines.push("  " + (i + 1) + ". " + s); });
      lines.push("");
      lines.push("JUDGEMENT");
      lines.push("  Weigh the analysis against the evaluation. State the condition under which your conclusion holds:");
      lines.push("  " + topic.evaluation[topic.evaluation.length - 1]);
      lines.push("");
      lines.push("EXAM FOCUS");
      lines.push("  " + topic.exam);
    }

    lines.push("");
    lines.push("USEFUL PHRASES");
    [
      "This matters because the effect operates through…",
      "The magnitude of the effect depends on…",
      "However, this assumes that…",
      "In the short run… whereas in the long run…",
      "On balance, the evidence suggests…"
    ].forEach(function (p) { lines.push("  · " + p); });

    $("#builder-title").textContent = topic.title + " · " + meta.name;
    $("#builder-text").textContent = lines.join("\n");
    $("#builder-output").hidden = false;
    $("#builder-output").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderEssayBank() {
    var grid = $("#essay-bank");
    grid.innerHTML = C.essays.map(function (e) {
      return '<article class="essay-card" data-id="' + e.id + '">' +
        '<div class="essay-meta"><span>Unit ' + e.unit + "</span><span>·</span><span>" + esc(e.command) + "</span>" +
        '<span class="marks">' + e.marks + " marks</span></div>" +
        '<div class="essay-q">' + esc(e.q) + "</div>" +
        '<div class="essay-open">Open the plan →</div></article>';
    }).join("");

    $$(".essay-card").forEach(function (card) {
      card.addEventListener("click", function () { openEssay(card.getAttribute("data-id")); });
    });
  }

  function openEssay(id) {
    var e = null;
    C.essays.forEach(function (x) { if (x.id === id) e = x; });
    if (!e) return;
    var existing = $(".essay-detail");
    if (existing) existing.remove();
    if (state.essay === id) { state.essay = null; return; }
    state.essay = id;

    var detail = document.createElement("div");
    detail.className = "essay-detail";
    detail.innerHTML = '<div class="essay-meta"><span>Unit ' + e.unit + "</span><span>·</span><span>" + esc(e.command) + "</span>" +
      '<span class="marks">' + e.marks + " marks</span></div>" +
      "<h3>" + esc(e.q) + "</h3>" +
      '<p class="ed-sub">Data hook: ' + esc(e.hook) + "</p>" +
      "<dl>" + e.plan.map(function (p) {
        return '<div class="plan-step"><dt>' + esc(p.label) + "</dt><dd>" + esc(p.text) + "</dd></div>";
      }).join("") + "</dl>" +
      '<div class="model-para"><span class="mp-label">Model paragraph</span>' + esc(e.model) + "</div>";
    $("#essay-bank").prepend(detail);
    detail.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------------------------------------------------------
     Data table
     --------------------------------------------------------- */
  function renderDataChips() {
    var box = $("#data-indicators");
    box.innerHTML = C.indicators.map(function (i) {
      var on = state.dataIndicators.indexOf(i.code) >= 0;
      return '<button class="chip' + (on ? " is-on" : "") + '" data-code="' + i.code + '">' + esc(i.short) + "</button>";
    }).join("");
    $$(".chip", box).forEach(function (b) {
      b.addEventListener("click", function () {
        var code = b.getAttribute("data-code");
        var idx = state.dataIndicators.indexOf(code);
        if (idx >= 0) {
          if (state.dataIndicators.length === 1) { toast("Keep at least one indicator."); return; }
          state.dataIndicators.splice(idx, 1);
        } else {
          state.dataIndicators.push(code);
        }
        renderDataChips();
        renderDataTable(true);
      });
    });
  }

  async function renderDataTable(skipEnsure) {
    renderDataChips();
    var ids = state.selected.slice();
    if (!skipEnsure) await ensureCountries(ids, { silent: true });
    var codes = state.dataIndicators;
    var table = $("#data-table");
    var head = "<tr><th>Country</th>" + codes.map(function (c) {
      var i = IND[c];
      return '<th class="num">' + esc(i.short) + (i.unit && i.unit !== "%" ? " (" + i.unit + ")" : "") + "</th>";
    }).join("") + "</tr>";
    table.querySelector("thead").innerHTML = head;

    var body = ids.map(function (id) {
      var meta = countryMeta(id);
      var cells = codes.map(function (c) {
        var l = latest(seriesOf(id, c));
        return '<td class="num" title="' + (l ? "Year " + l.y : "No data") + '">' + (l ? fmtVal(l.v, IND[c]) : "—") + "</td>";
      }).join("");
      return "<tr><td>" + flagEmoji(meta.iso2) + " " + esc(meta.name) + "</td>" + cells + "</tr>";
    }).join("");
    table.querySelector("tbody").innerHTML = body;
    $("#data-count").textContent = ids.length + " countries · " + codes.length + " indicators";
  }

  function exportDataCSV() {
    var codes = state.dataIndicators;
    var rows = [["Country", "ISO3"].concat(codes.map(function (c) { return IND[c].label + " (" + IND[c].unit + ")"; }))
      .concat(codes.map(function (c) { return IND[c].short + " year"; }))];
    state.selected.forEach(function (id) {
      var meta = countryMeta(id);
      var line = [meta.name, id];
      codes.forEach(function (c) {
        var l = latest(seriesOf(id, c));
        line.push(l ? l.v : "");
      });
      codes.forEach(function (c) {
        var l = latest(seriesOf(id, c));
        line.push(l ? l.y : "");
      });
      rows.push(line);
    });
    downloadCSV("macrolab-data.csv", rows);
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  async function boot() {
    showView(location.hash.replace("#", "") || "dashboard");

    var stored = store(LS.selected);
    if (Array.isArray(stored) && stored.length) state.selected = stored;
    var storedCompare = store(LS.compare);
    if (storedCompare && storedCompare.ids) state.compare = storedCompare;

    renderTopicList();
    renderPresets();
    renderCards();
    renderEssayBank();
    renderGlossary();

    $("#glossary-search").addEventListener("input", debounce(function (e) {
      renderGlossary(e.target.value, $(".segmented button.is-active", $("#glossary-cats")).getAttribute("data-cat"));
    }, 140));

    $$("#glossary-cats button").forEach(function (b) {
      b.addEventListener("click", function () {
        $$("#glossary-cats button").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        renderGlossary($("#glossary-search").value, b.getAttribute("data-cat"));
      });
    });

    $$("#unit-filter button").forEach(function (b) {
      b.addEventListener("click", function () {
        $$("#unit-filter button").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        state.unit = b.getAttribute("data-unit");
        renderTopicList();
        var first = C.topics.filter(function (t) { return state.unit === "all" || String(t.unit) === state.unit; })[0];
        if (first) openTopic(first.id, true);
      });
    });

    $("#quiz-restart").addEventListener("click", startQuiz);
    $("#data-csv").addEventListener("click", exportDataCSV);

    $("#add-country").addEventListener("click", function () {
      var input = $("#country-search");
      var value = input.value.trim();
      if (!value) return;
      var found = null;
      state.countries.forEach(function (c) {
        if (!found && c.name.toLowerCase() === value.toLowerCase()) found = c;
      });
      if (!found) {
        state.countries.forEach(function (c) {
          if (!found && c.name.toLowerCase().indexOf(value.toLowerCase()) === 0) found = c;
        });
      }
      if (!found) { toast("Country not found. Try the full English name."); return; }
      addCountry(found.id);
      input.value = "";
    });

    $("#country-search").addEventListener("keydown", function (e) {
      if (e.key === "Enter") $("#add-country").click();
    });

    try {
      state.countries = await api.countries();
      var dl = $("#countries-list");
      dl.innerHTML = state.countries.map(function (c) {
        return '<option value="' + esc(c.name) + '" data-id="' + c.id + '"></option>';
      }).join("");
      renderEssayBank();
      initEssaySelects();
      initCompareSelects();
      renderCompareChips();
      $("#builder-country").value = state.selected[0] || "GBR";
    } catch (e) {
      setStatus("Country list unavailable", "error");
      var dl2 = $("#countries-list");
      dl2.innerHTML = C.presets.map(function (p) {
        return '<option value="' + esc(p.name) + '" data-id="' + p.id + '"></option>';
      }).join("");
      initEssaySelects();
      initCompareSelects();
      renderCompareChips();
    }

    await initDashboard();
    renderCompareChips();
    if (state.view === "compare") renderCompare();
    if (state.view === "data") renderDataTable();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
