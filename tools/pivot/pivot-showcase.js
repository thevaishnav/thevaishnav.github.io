(function () {
  "use strict";

  var panel = document.getElementById("pvPanel");
  var stepEls = Array.prototype.slice.call(document.querySelectorAll(".pv-step"));
  if (!panel || !stepEls.length) return;

  // Pair each step with its card once. The card element never changes, so the
  // scroll handler can measure positions without re-querying the DOM per frame.
  var steps = stepEls.map(function (step) {
    return { step: step, card: step.querySelector(".pv-card") || step };
  });

  var current = null;

  function activate(step) {
    if (step === current) return;
    current = step;

    var mode = step.dataset.mode || "bounded";     // bounded | unbounded
    var objseg = step.dataset.objseg || "default"; // default | edit
    var box = step.dataset.box;                    // box element id to keep bright
    var target = step.dataset.target;              // control id to ring

    // panel mode (swaps sliders <-> fields, shows/hides Use Object Scale)
    panel.dataset.mode = mode;
    // object-pivots segment selection (Default vs Edit Pivots)
    panel.dataset.objseg = objseg;
    panel.classList.add("focusing");

    // dim every box except the active one
    panel.querySelectorAll(".pv-box").forEach(function (b) {
      b.classList.toggle("active-box", b.id === box);
    });

    // move the highlight ring
    panel.querySelectorAll(".pv-lit").forEach(function (el) {
      el.classList.remove("pv-lit");
    });
    var t = target && document.getElementById(target);
    if (t) t.classList.add("pv-lit");

    // active step styling
    steps.forEach(function (s) {
      s.step.classList.toggle("is-active", s.step === step);
    });
  }

  // Where on the screen the "current" card sits.
  // Desktop: the sticky overlay is centred, so the reading line is the
  // middle of the viewport. Mobile: the overlay is pinned to the top ~56%,
  // so the reading line drops into the visible band underneath it.
  var mq = window.matchMedia("(max-width:860px)");
  function readingLine() {
    return window.innerHeight * (mq.matches ? 0.74 : 0.5);
  }

  // Pick the step whose card centre is nearest the reading line and light it.
  function pick() {
    var line = readingLine();
    var best = null;
    var bestDist = Infinity;
    for (var i = 0; i < steps.length; i++) {
      var r = steps[i].card.getBoundingClientRect();
      var centre = r.top + r.height / 2;
      var dist = Math.abs(centre - line);
      if (dist < bestDist) {
        bestDist = dist;
        best = steps[i].step;
      }
    }
    if (best) activate(best);
  }

  // rAF-throttle scroll so we only measure once per frame.
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      pick();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  // Late layout shifts (web fonts, images) move the cards after our first
  // measurement, so re-pick once everything has settled.
  window.addEventListener("load", onScroll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pick);
  // Rebuild reading line when crossing the breakpoint (addListener for older engines).
  if (mq.addEventListener) mq.addEventListener("change", onScroll);
  else if (mq.addListener) mq.addListener(onScroll);

  // Sensible starting state.
  pick();
})();
