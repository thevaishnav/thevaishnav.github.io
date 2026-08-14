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
  var now = new Date();

  // ---- the headline count: whole years since a start year ----------------
  //
  // Calendar years only. A start month is not recorded, so anything more
  // precise than this would be a made-up figure dressed as an exact one —
  // and the copy reads "More than N years", which is a floor, not a
  // measurement.
  var thisYear = now.getFullYear();

  Array.prototype.forEach.call(
    document.querySelectorAll('[data-years-since]'),
    function (node) {
      var start = parseInt(node.getAttribute('data-years-since'), 10);
      // A missing or malformed year must leave the markup's own text alone
      // rather than replace it with NaN.
      if (!start || start > thisYear) return;

      var years = thisYear - start;
      if (years < 1) return;

      node.textContent = String(years);
    }
  );

  // ---- the length of an ongoing stint ------------------------------------
  //
  // The timeline (/experience/) prints how long each role lasted beside its
  // dates. For the finished ones that is a fixed number written into the
  // markup; for the one still running it is a number that goes stale every
  // month, which is precisely the sort of figure a person forgets to revisit
  // — a resume claiming "1 yr 2 mos" two years on reads as neglect.
  //
  //   <span class="tl-len" data-duration-since="2024-10">1 yr 10 mos</span>
  //
  // A start month is recorded here, unlike above, so months are honest and
  // the output carries them. Same contract as the year count otherwise: the
  // element holds a correct value already, so the page is right without
  // JavaScript and nothing reflows on load.
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-duration-since]'),
    function (node) {
      var parts = String(node.getAttribute('data-duration-since')).split('-');
      var startYear = parseInt(parts[0], 10);
      var startMonth = parseInt(parts[1], 10); // 1-12, as written

      if (!startYear || !startMonth || startMonth < 1 || startMonth > 12) return;

      // Months elapsed, counting the start month as the first one — the way
      // a person counts a job they are still in. A role begun in October and
      // read in October is "1 mo", not "0 mos".
      var months =
        (thisYear - startYear) * 12 + (now.getMonth() + 1 - startMonth) + 1;
      if (months < 1) return; // a future start date: leave the markup alone

      var years = Math.floor(months / 12);
      var rest = months % 12;

      var text = [];
      if (years) text.push(years + (years === 1 ? ' yr' : ' yrs'));
      // A whole number of years reads better without a trailing "0 mos".
      if (rest || !years) text.push(rest + (rest === 1 ? ' mo' : ' mos'));

      node.textContent = text.join(' ');
    }
  );
})();
