/* ============================================================
   Years of experience, counted rather than typed.

   A hand-written "4+ years" is correct for a few months and then quietly
   wrong for the rest of the year — and it is exactly the kind of number
   nobody remembers to revisit. This counts it from a fixed start year
   held in the markup:

     <span data-years-since="2022">4</span> years

   The element holds the bare count and nothing else — the word "years",
   and any lead-in like "More than", stay in the markup around it. That
   split is what lets the same script serve a line that reads "More than
   4 years" without it having to know that a "4+" there would be saying
   "more than" twice.

   The element keeps a real number in the HTML rather than being left
   empty for the script to fill. That is deliberate: the text is correct
   with JavaScript disabled, it is correct for anything reading the page
   without running scripts, and the line does not reflow on load because
   the placeholder is already the right width. The script's whole job is
   to keep it true after the year turns over.
   ============================================================ */
(function () {
  var nodes = document.querySelectorAll('[data-years-since]');
  if (!nodes.length) return;

  // Calendar years only. A start month is not recorded, so anything more
  // precise than this would be a made-up figure dressed as an exact one —
  // and the copy reads "More than N years", which is a floor, not a
  // measurement.
  var thisYear = new Date().getFullYear();

  Array.prototype.forEach.call(nodes, function (node) {
    var start = parseInt(node.getAttribute('data-years-since'), 10);
    // A missing or malformed year must leave the markup's own text alone
    // rather than replace it with NaN.
    if (!start || start > thisYear) return;

    var years = thisYear - start;
    if (years < 1) return;

    node.textContent = String(years);
  });
})();
