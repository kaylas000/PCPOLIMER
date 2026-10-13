/* Pcpolimer — боевой сайт PRJ-01. Ноль зависимостей, ноль сторонних запросов.
   Движение: motion/recipes/{oven-telemetry,conveyor-hooks,counter-tick}
   Кривые: motion/easing-curves.json (ceh-brake, ceh-snap, ceh-drag). */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---------- кинозаставка первого визита (SK-06 · cinema-intro) ---------- */
  var INTRO_KEY = "pcpolimer-intro-seen";
  var intro = document.getElementById("intro");
  var introSeen = false;
  try { introSeen = sessionStorage.getItem(INTRO_KEY) === "1"; } catch (e) { introSeen = false; }
  var introActive = !!(intro && !reduced && !introSeen);
  var introTimers = [];
  var introCallbacks = [];
  /* сценарий страницы стартует с открытием шторок — печь греется на глазах, а не за занавесом */
  function afterIntro(fn) { if (introActive) { introCallbacks.push(fn); } else { fn(); } }
  function runIntroCallbacks() {
    var fns = introCallbacks; introCallbacks = [];
    fns.forEach(function (fn) { fn(); });
  }
  function dropIntro() {
    try { sessionStorage.setItem(INTRO_KEY, "1"); } catch (e) { /* приватный режим */ }
    if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
    document.removeEventListener("keydown", onIntroEsc);
    introTimers.forEach(clearTimeout);
  }
  function finishIntro() {
    if (intro) intro.classList.add("is-done");
    runIntroCallbacks();
    introTimers.push(window.setTimeout(dropIntro, 900));
  }
  function skipIntro() {
    if (!intro) return;
    introTimers.forEach(clearTimeout);
    finishIntro();
  }
  function onIntroEsc(ev) { if (ev.key === "Escape") skipIntro(); }
  if (introActive) {
    document.addEventListener("keydown", onIntroEsc);
    var introSkip = intro.querySelector("[data-intro-skip]");
    if (introSkip) introSkip.addEventListener("click", skipIntro);
    introTimers.push(window.setTimeout(finishIntro, 2900));
  } else {
    dropIntro();
  }
  /* явный реплей заставки (SK-06, правило 2) */
  $$("[data-replay-intro]").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      try { sessionStorage.removeItem(INTRO_KEY); } catch (e) { /* ок */ }
      window.location.reload();
    });
  });

  /* ---------- данные (единый источник с боевой версией: src/data/company.ts) ---------- */
  var RAL = [
    { code: "RAL 9016", name: "Белый транспортный", hex: "#f1f0ea" },
    { code: "RAL 9006", name: "Алюминий белый", hex: "#a5a5a5" },
    { code: "RAL 1013", name: "Устрично-белый", hex: "#e3d9c6" },
    { code: "RAL 1023", name: "Жёлтый транспортный", hex: "#f7c500" },
    { code: "RAL 2004", name: "Оранжевый чистый", hex: "#e25303" },
    { code: "RAL 3020", name: "Красный транспортный", hex: "#c1121c" },
    { code: "RAL 3004", name: "Пурпурно-красный", hex: "#701f29" },
    { code: "RAL 4010", name: "Маджента телекоммуникац.", hex: "#cf3476" },
    { code: "RAL 5015", name: "Голубой небесный", hex: "#2271b3" },
    { code: "RAL 5021", name: "Синий водяной", hex: "#07737a" },
    { code: "RAL 5002", name: "Синий ультрамариновый", hex: "#20214f" },
    { code: "RAL 6018", name: "Зелёный жёлто-зелёный", hex: "#57a639" },
    { code: "RAL 6029", name: "Зелёный мятный", hex: "#006f3d" },
    { code: "RAL 6002", name: "Зелёный лиственный", hex: "#2d572c" },
    { code: "RAL 8017", name: "Коричневый шоколадный", hex: "#45322e" },
    { code: "RAL 7016", name: "Антрацитовый серый", hex: "#383e42" },
    { code: "RAL 7024", name: "Серый графитовый", hex: "#474a51" },
    { code: "RAL 7035", name: "Серый светлый", hex: "#d7d7d7" },
    { code: "RAL 9005", name: "Чёрный янтарный", hex: "#0a0a0a" },
    { code: "RAL 9007", name: "Алюминий серый", hex: "#8f8f8f" }
  ];

  var SERVICES = [
    { id: "profile", title: "Металлические профили", price: "100 ₽/м", unit: "m", base: 100, note: "погонный метр · любой RAL · мат и глянец", tag: "позиция 01" },
    { id: "metalwork", title: "Металлоконструкции", price: "200 ₽/м", unit: "m", base: 200, note: "балки, фермы, колонны · стойко к коррозии", tag: "позиция 02" },
    { id: "facade", title: "Фасадные панели", price: "500 ₽/м²", unit: "m2", base: 500, note: "включая перфорированные и кассетные панели", tag: "позиция 03" },
    { id: "fence", title: "Заборы", price: "4 000 ₽/м", unit: "m", base: 4000, note: "секции, лаги, столбы · антрацит 7016 — хит", tag: "позиция 04" },
    { id: "gate", title: "Ворота", price: "6 000 ₽/шт", unit: "pc", base: 6000, note: "распашные, откатные, секционные · с фурнитурой", tag: "позиция 05" },
    { id: "auto", title: "Авто-, мото- и велозапчасти", price: "3 000 ₽/шт", unit: "pc", base: 3000, note: "диски, рамы, кронштейны, суппорты", tag: "позиция 06" },
    { id: "pipe", title: "Трубы", price: "100 ₽/м", unit: "m", base: 100, note: "круглые и профильные · стойкость к реагентам", tag: "позиция 07" },
    { id: "railing", title: "Перила", price: "1 000 ₽/м", unit: "m", base: 1000, note: "лестничные и балконные ограждения", tag: "позиция 08" },
    { id: "radiator", title: "Радиаторы", price: "4 000 ₽/шт", unit: "pc", base: 4000, note: "чугунные и стальные · термостойкое покрытие", tag: "позиция 09" },
    { id: "furniture", title: "Мебель", price: "500 ₽/шт", unit: "pc", base: 500, note: "каркасы, стеллажи, садовая мебель", tag: "позиция 10" },
    { id: "multicolor", title: "Два-три цвета с маскировкой", price: "8 000 ₽/шт", unit: "pc", base: 8000, note: "комбинированная окраска · послойная маскировка", tag: "позиция 11" },
    { id: "sandblast", title: "Пескоструйная обработка", price: "500 ₽/м²", unit: "m2", base: 500, note: "очистка до Sa 2.5 перед покраской", tag: "позиция 12" }
  ];

  var GALLERY = [
    { img: "img/qc.webp", caption: "Метизы и профили после камеры", ral: "разные RAL", hex: "#8f8f8f" },
    { img: "img/bike.webp", caption: "Велорама, глянец", ral: "RAL 2004", hex: "#e25303" },
    { img: "img/spray.webp", caption: "Напыление в камере", ral: "RAL 5015", hex: "#2271b3" },
    { img: "img/cure.webp", caption: "Полимеризация, 200 °C", ral: "режим ПЕЧЬ", hex: "#e25303" },
    { img: "img/prep.webp", caption: "Секция ворот, шагрень мелкая", ral: "RAL 7016", hex: "#383e42" },
    { img: "img/ral-fan.webp", caption: "Веер выкрасов RAL", ral: "1000+ цветов", hex: "#ff6a2b" }
  ];

  /* станции технологии — один параметр на шаг (STRUCTURE, акт 04) */
  var P_DATA = [
    { n: "01", title: "Подготовка поверхности", param: "Sa 2.5", paramLabel: "степень очистки" },
    { n: "02", title: "Нанесение порошка", param: "60–120 мкм", paramLabel: "слой покрытия" },
    { n: "03", title: "Полимеризация", param: "200 °C", paramLabel: "температура камеры" },
    { n: "04", title: "Контроль качества", param: "0 баллов", paramLabel: "адгезия по решётке" }
  ];

  var UNIT_LABEL = { pc: "шт", m: "пог. м", m2: "м²" };
  var PRESETS = { m: [10, 25, 50], m2: [12, 24, 46], pc: [1, 2, 4] };
  var money = new Intl.NumberFormat("ru-RU");

  function fmt(v) { return money.format(Math.round(v)) + " ₽"; }
  function lum(hex) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h.replace(/./g, function (c) { return c + c; });
    var n = parseInt(h, 16), v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    var a = v.map(function (x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  /* ---------- easing из реестра (motion/easing-curves.json) ---------- */
  function bezier(x1, y1, x2, y2) {
    function A(a1, a2) { return 1 - 3 * a2 + 3 * a1; }
    function B(a1, a2) { return 3 * a2 - 6 * a1; }
    function C(a1) { return 3 * a1; }
    function calc(t, a1, a2) { return ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t; }
    function slope(t, a1, a2) { return 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1); }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x;
      for (var i = 0; i < 8; i++) {
        var s = slope(t, x1, x2);
        if (s === 0) break;
        var e = calc(t, x1, x2) - x;
        t -= e / s;
      }
      return calc(t, y1, y2);
    };
  }
  var BRAKE = bezier(0.16, 1, 0.3, 1);   /* ceh-brake */
  var SNAP = bezier(0.34, 1.56, 0.64, 1); /* ceh-snap  */
  var DRAG = bezier(0.65, 0, 0.15, 1);    /* ceh-drag  */

  /* ---------- counter-tick: механический пересчёт ---------- */
  function countTo(target, dur, set) {
    if (reduced) { set(target); return; }
    var t0 = performance.now();
    (function frame(now) {
      var p = Math.min(1, (now - t0) / dur);
      set(target * BRAKE(p));
      if (p < 1) requestAnimationFrame(frame);
    })(t0);
  }
  function inView(el, cb, th) {
    if (!("IntersectionObserver" in window)) { cb(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { cb(e.target); io.unobserve(e.target); } });
    }, { threshold: th || 0.3 });
    io.observe(el);
  }

  /* ---------- появление секций (маска-reveal, ceh-brake) ---------- */
  var rvTargets = $$(".h2-big, .sec-text, .pick, .otk-rating, .gl-item, .tk-card, .ct-phones, .map, .fm, .ca, .st-panel");
  if (!reduced && "IntersectionObserver" in window) {
    rvTargets.forEach(function (el) { el.classList.add("reveal"); });
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); rio.unobserve(e.target); } });
    }, { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });
    rvTargets.forEach(function (el) { rio.observe(el); });
  }

  /* ---------- палитра RAL ---------- */
  var state = { color: RAL[4] };
  var rvGrid = $("#rv-grid");
  if (rvGrid) {
    rvGrid.innerHTML = RAL.map(function (c) {
      var ink = lum(c.hex) > 0.42 ? "#1a1b1f" : "#f1f1ea";
      return '<button class="rv" type="button" data-code="' + c.code + '" data-hex="' + c.hex + '" data-name="' + c.name + '" ' +
        'aria-label="' + c.code + ", " + c.name + '" style="background:' + c.hex + '">' +
        '<span class="rv-code" style="color:' + ink + '">' + c.code.replace("RAL ", "") + "</span></button>";
    }).join("");
    rvGrid.addEventListener("click", function (e) {
      var b = e.target.closest(".rv");
      if (!b) return;
      setColor({ code: b.dataset.code, name: b.dataset.name, hex: b.dataset.hex });
    });
  }

  function setColor(c) {
    state.color = c;
    var pickSwat = $("#pick-swat"), pickCode = $("#pick-code"), pickName = $("#pick-name");
    if (pickSwat) pickSwat.style.background = c.hex;
    if (pickCode) pickCode.textContent = c.code;
    if (pickName) pickName.textContent = c.name;
    var ovSwat = $("#ov-swat"), ovNow = $("#ov-now");
    if (ovSwat) ovSwat.style.background = c.hex;
    if (ovNow) ovNow.innerHTML = '<i id="ov-swat" style="background:' + c.hex + '"></i>' + c.code + " · " + c.name;
    var caSwat = $("#ca-swat"), caColor = $("#ca-color");
    if (caSwat) caSwat.style.background = c.hex;
    if (caColor) caColor.innerHTML = '<i id="ca-swat" style="background:' + c.hex + '"></i>цвет: ' + c.code + (calc.metallic ? " — металлик" : " — стандарт");
    $$("#rv-grid .rv").forEach(function (b) { b.classList.toggle("is-on", b.dataset.code === c.code); });
    paintBelt();
  }

  /* ---------- конвейер с крюками (conveyor-hooks) ---------- */
  var BASE = ["#383e42", "#f7c500", "#2271b3", "#c1121c", "#8f8f8f", "#006f3d", "#45322e", "#20214f", "#d7d7d7", "#a5a5a5"];
  function hookSvg(kind, color) {
    var shape;
    if (kind === 0) shape = '<rect x="-26" y="34" width="52" height="12" rx="2" fill="' + color + '"></rect>';
    else if (kind === 1) shape = '<path d="M -22 34 h 30 v 12 h -18 v 16 h -12 z" fill="' + color + '"></path>';
    else if (kind === 2) shape = '<circle cx="0" cy="46" r="11" fill="none" stroke="' + color + '" stroke-width="7"></circle>';
    else shape = '<path d="M -24 34 l 12 10 l -12 10 h 48 l -12 -10 l 12 -10 z" fill="' + color + '"></path>';
    return '<svg class="hook" width="56" height="82" viewBox="-28 -4 56 82" aria-hidden="true" style="animation-delay:' + ((kind % 4) * 0.35).toFixed(2) + 's">' +
      '<line x1="0" y1="0" x2="0" y2="26" stroke="#8f96a3" stroke-width="2.5"></line>' +
      '<path d="M -5 26 h 10 l -3 8 h -4 z" fill="#8f96a3"></path>' + shape + "</svg>";
  }
  var cv = $("#cv-track");
  function paintBelt() {
    if (!cv) return;
    var colors = [state.color.hex].concat(BASE);
    var out = "";
    for (var i = 0; i < 16; i++) out += hookSvg(i % 4, colors[i % colors.length]);
    cv.innerHTML = out;
  }

  /* ---------- маркиза выкрасов RAL ---------- */
  var rs = $("#rs-track");
  if (rs) {
    var strip = RAL.map(function (c) {
      return '<span class="rs-item"><i style="background:' + c.hex + '"></i>' + c.code + " " + c.name + "</span>";
    }).join("");
    rs.innerHTML = strip + strip;
  }

  /* ---------- лента и маркиза: ровный ход на requestAnimationFrame ---------- */
  var drifts = [];
  function drift(el, speed) {
    if (!el) return;
    var half = el.scrollWidth / 2;
    if (half <= 0) return;
    drifts.push({ el: el, speed: speed, half: half, x: 0 });
  }
  function runDrift() {
    if (reduced || !drifts.length) return;
    var last = performance.now();
    (function frame(now) {
      var dt = Math.min(48, now - last) / 1000;
      last = now;
      for (var i = 0; i < drifts.length; i++) {
        var d = drifts[i];
        d.x -= d.speed * dt;
        if (d.x <= -d.half) d.x += d.half;
        d.el.style.transform = "translate3d(" + d.x.toFixed(2) + "px,0,0)";
      }
      requestAnimationFrame(frame);
    })(last);
  }

  /* ---------- печь: телеметрия (oven-telemetry) ---------- */
  var arc = $("#ov-arc");
  var arcLen = arc ? arc.getTotalLength() : 0;
  var tempEl = $("#ov-temp"), stateEl = $("#ov-state"), timerEl = $("#ov-timer");
  if (arc) arc.style.strokeDasharray = arcLen;
  function setTemp(p) {
    if (arc) arc.style.strokeDashoffset = arcLen * (1 - p);
    if (tempEl) tempEl.textContent = Math.round(200 * p);
    if (stateEl && p >= 0.95) stateEl.innerHTML = '<span class="led" aria-hidden="true"></span> полимеризация';
  }
  if (timerEl && !reduced) {
    var left = 14 * 60 + 32;
    setInterval(function () {
      left = left > 0 ? left - 1 : 14 * 60 + 32;
      var m = Math.floor(left / 60), s = left % 60;
      timerEl.textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
    }, 1000);
  }

  /* ---------- прайс-реестр ---------- */
  var pxList = $("#px-list");
  if (pxList) {
    var foot = $(".px-foot", pxList);
    var rows = SERVICES.map(function (s) {
      return '<article class="px"><span class="px-n">' + s.tag.replace("позиция ", "") + "</span>" +
        '<div class="px-body"><h3>' + s.title + "</h3><p>" + s.note + "</p></div>" +
        '<div class="px-val"><b>' + s.price + '</b><span>фикс по наряду</span></div>' +
        '<span class="px-tag">' + s.tag + "</span></article>";
    });
    rows.reverse().forEach(function (html) { if (foot) foot.insertAdjacentHTML("beforebegin", html); else pxList.insertAdjacentHTML("beforeend", html); });
  }

  /* ---------- калькулятор (counter-tick) ---------- */
  var calc = { svc: SERVICES[0], qty: 25, metallic: false, busy: false, started: false, sent: false };
  var caTerms = $("#ca-terms"), caPresets = $("#ca-presets"), caInput = $("#ca-qty");
  var caPrice = $("#ca-price"), caUnit = $("#ca-unit"), caSum = $("#ca-sum"), caFormula = $("#ca-formula");

  function bulk(s, q) { if (s.unit === "m2") return q > 20; if (s.unit === "m") return q > 50; return q > 5; }
  function totalOf() {
    var q = Math.max(1, calc.qty), v = calc.svc.base * q;
    if (calc.metallic) v *= 1.15;
    if (bulk(calc.svc, q)) v *= calc.svc.unit === "pc" ? 0.95 : 0.9;
    return Math.round(v / 10) * 10;
  }
  function renderTerms() {
    if (!caTerms) return;
    caTerms.innerHTML = SERVICES.map(function (s) {
      return '<button class="ca-term' + (s.id === calc.svc.id ? " is-on" : "") + '" type="button" data-id="' + s.id + '">' + s.title + "</button>";
    }).join("");
  }
  function renderPresets() {
    if (!caPresets) return;
    caPresets.innerHTML = (PRESETS[calc.svc.unit] || []).map(function (n) {
      return '<button class="ca-preset" type="button" data-q="' + n + '">' + n + '</button>';
    }).join("");
  }
  function renderTotal(tick) {
    var q = Math.max(1, calc.qty), total = totalOf();
    var parts = [calc.svc.base + " ₽", q + " " + UNIT_LABEL[calc.svc.unit]];
    var note = parts.join(" × ");
    if (calc.metallic) note += " · металлик +15%";
    if (bulk(calc.svc, q)) note += " · скидка партии";
    if (caFormula) caFormula.textContent = note;
    if (!caSum) return;
    if (tick) countTo(total, 900, function (v) { caSum.textContent = fmt(v); });
    else caSum.textContent = fmt(total);
  }
  function setLed(text, heat) {
    var head = $(".ca-led");
    if (!head) return;
    head.innerHTML = '<span class="led' + (heat ? "" : " led-amber") + '" aria-hidden="true"></span> ' + text;
  }
  function recompute(tick) {
    if (caPrice) caPrice.textContent = calc.svc.price;
    if (caUnit) caUnit.textContent = UNIT_LABEL[calc.svc.unit];
    renderTerms(); renderPresets(); renderTotal(tick);
    var caSwat = $("#ca-swat"), caColor = $("#ca-color");
    if (caColor) caColor.innerHTML = '<i id="ca-swat" style="background:' + state.color.hex + '"></i>цвет: ' + state.color.code + (calc.metallic ? " — металлик" : " — стандарт");
  }
  function readQty() {
    var raw = caInput.value.trim();
    if (raw === "") {
      caInput.classList.remove("is-bad");
      if (caSum) caSum.textContent = "—";
      if (caFormula) caFormula.textContent = "введите объём";
      return null;
    }
    var n = Number(raw.replace(",", "."));
    if (!isFinite(n) || n < 1) {
      caInput.classList.add("is-bad");
      if (caSum) caSum.textContent = "—";
      if (caFormula) caFormula.textContent = "объём — целое число от 1";
      return null;
    }
    caInput.classList.remove("is-bad");
    return Math.floor(n);
  }

  if (caTerms) {
    recompute(false);
    caTerms.addEventListener("click", function (e) {
      var b = e.target.closest(".ca-term"); if (!b) return;
      var s = SERVICES.filter(function (x) { return x.id === b.dataset.id; })[0];
      if (!s) return;
      calc.svc = s; calc.qty = (PRESETS[s.unit] || [1])[1] || 1;
      if (caInput) caInput.value = calc.qty;
      recompute(true);
    });
    caPresets.addEventListener("click", function (e) {
      var b = e.target.closest(".ca-preset"); if (!b) return;
      calc.qty = Number(b.dataset.q); if (caInput) caInput.value = calc.qty;
      recompute(true);
    });
    caInput.addEventListener("input", function () {
      var q = readQty();
      if (q === null) return;
      calc.qty = q; recompute(false);
    });
    var std = $("#ca-std"), met = $("#ca-met");
    if (std && met) {
      std.addEventListener("click", function () {
        calc.metallic = false; std.classList.add("is-on"); met.classList.remove("is-on"); recompute(true);
      });
      met.addEventListener("click", function () {
        calc.metallic = true; met.classList.add("is-on"); std.classList.remove("is-on"); recompute(true);
      });
    }
    var kalk = $("#kalkulator");
    inView(kalk || caTerms, function () {
      if (calc.started) return; calc.started = true;
      if (reduced) return;
      if (caSum) countTo(totalOf(), 1200, function (v) { caSum.textContent = fmt(v); });
    }, 0.35);
  }

  /* ---------- счётчики ОТК ---------- */
  $$("[data-tick]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-tick"));
    if (!isFinite(target)) return;
    inView(el, function () {
      countTo(target, 1400, function (v) {
        el.textContent = Math.round(v) + "+";
      });
    }, 0.4);
  });

  /* ---------- sticky-станции: один параметр на шаг ---------- */
  var steps = $$(".st-step");
  var progress = $("#st-progress");
  if (steps.length) {
    var stN = $("#st-n"), stTitle = $("#st-title"), stParam = $("#st-param"), stParamLabel = $("#st-param-label");
    var active = -1;
    progress.innerHTML = steps.map(function (_, i) { return '<button type="button" data-i="' + i + '" aria-label="Станция 0' + (i + 1) + '"></button>'; }).join("");
    function activate(i) {
      if (i === active) return; active = i;
      var s = P_DATA[i];
      if (stN) stN.textContent = s.n;
      if (stTitle) stTitle.textContent = s.title;
      if (stParam) stParam.textContent = s.param;
      if (stParamLabel) stParamLabel.textContent = s.paramLabel;
      steps.forEach(function (el, k) { el.classList.toggle("is-on", k === i); });
      $$("#st-progress button").forEach(function (b, k) { b.classList.toggle("is-on", k <= i); });
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) activate(Number(e.target.dataset.step)); });
    }, { threshold: 0.5 });
    steps.forEach(function (el) { io.observe(el); });
    progress.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      steps[Number(b.dataset.i)].scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    });
    activate(0);
  }

  /* ---------- мобильное меню ---------- */
  var burger = $("#pg-burger"), menu = $("#pg-menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) { menu.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- форма: отклик без ложного «отправлено» ---------- */
  var form = $("#order"), btn = $("#fm-btn"), stateMsg = $("#fm-state"), phone = $("#fm-phone");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (calc.sent) { window.location.href = "tel:+79253338666"; return; }
      var digits = (phone.value.match(/\d/g) || []).length;
      if (digits < 10) {
        phone.classList.add("is-bad");
        stateMsg.textContent = "проверьте номер — нужно 10–11 цифр";
        stateMsg.className = "fm-note is-bad";
        phone.focus();
        return;
      }
      phone.classList.remove("is-bad");
      btn.disabled = true; btn.textContent = "Собираем заявку…";
      stateMsg.className = "fm-note"; stateMsg.textContent = "передаём данные инженеру…";
      setTimeout(function () {
        calc.sent = true;
        btn.disabled = false; btn.textContent = "Позвонить в цех";
        stateMsg.className = "fm-note is-ok";
        stateMsg.innerHTML = "Онлайн-приём пока не подключён — инженер примет заявку по телефону: " +
          '<a href="tel:+79253338666">+7 (925) 333-86-66</a> или <a href="tel:+79363338666">+7 (936) 333-86-66</a>. Номер записан.';
      }, 700);
    });
  }

  /* ---------- картинки: мягкий фолбэк, если архив недоступен ---------- */
  $$(".ph img").forEach(function (img) {
    img.addEventListener("error", function () { img.style.display = "none"; img.closest(".ph").classList.add("noimg"); });
  });

  /* ---------- галерея ---------- */
  var gl = $("#gl");
  if (gl) {
    gl.innerHTML = GALLERY.map(function (g, i) {
      return '<figure class="gl-item">' +
        '<div class="ph"><img src="' + g.img + '" width="1200" height="900" alt="' + g.caption + '" loading="lazy"><i class="ph-tag" style="background:' + g.hex + '">' + g.ral + "</i></div>" +
        "<figcaption><h3>" + g.caption + '</h3><span class="gl-tag"><i style="background:' + g.hex + '"></i>смена 2 · проба №' + String(i + 1).padStart(3, "0") + "</span></figcaption></figure>";
    }).join("");
    $$(".gl .ph img").forEach(function (img) {
      img.addEventListener("error", function () { img.style.display = "none"; img.closest(".ph").classList.add("noimg"); });
    });
  }

  /* ---------- кнопка «наверх» ---------- */
  var toTop = $("#to-top");
  if (toTop) {
    var onScroll = function () {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      toTop.classList.toggle("is-on", y > window.innerHeight * 0.9);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
    toTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      var brand = $(".pg-brand");
      if (brand) brand.focus({ preventScroll: true });
    });
  }

  /* ---------- старт лент ---------- */
  paintBelt();
  drift(cv, 24);
  drift(rs, 42);
  runDrift();

  /* печь: нагрев при появлении */
  if (arc) {
    inView($("#oven"), function () { afterIntro(function () { countTo(1, 2600, setTemp); }); }, 0.3);
  }
})();
