/* ============================================================
   Code blocks — adds the header bar (language + copy button) to
   every <pre class="code"> on the page.

     <pre class="code" data-lang="powershell"><code>...</code></pre>
     <script src="/scripts/code-blocks.js"></script>

   `data-lang` is the label shown on the left of the bar; it defaults
   to "shell" when absent. Nothing else is per-block.

   This is an enhancement, not a requirement: the bare <pre> is styled
   as a finished card on its own, so with the script absent or blocked
   the blocks still look right — they just lose the bar. That is also
   why the markup is built here rather than written into every page:
   the copy button is useless without JS, and shipping a dead button in
   the HTML would be worse than not shipping one.
   ============================================================ */
(function () {
  var blocks = document.querySelectorAll('pre.code');
  if (!blocks.length) return;

  // Clipboard needs a secure context. On file:// and plain http:// it is
  // absent, and a button that silently does nothing is worse than no
  // button — so decide once, up front, whether to offer copying at all.
  var canCopy = !!(navigator.clipboard && navigator.clipboard.writeText);

  Array.prototype.forEach.call(blocks, function (pre) {
    var wrap = document.createElement('div');
    wrap.className = 'code-block';
    pre.parentNode.insertBefore(wrap, pre);

    var head = document.createElement('div');
    head.className = 'code-head';

    var lang = document.createElement('span');
    lang.className = 'code-lang';
    lang.textContent = pre.getAttribute('data-lang') || 'shell';
    head.appendChild(lang);

    if (canCopy) head.appendChild(makeCopyButton(pre));

    wrap.appendChild(head);
    wrap.appendChild(pre);
  });

  // ---------- which blocks actually scroll ----------
  // On a touch screen there is no scrollbar at rest, so a block wider than its
  // column looks like a line that has been cut off rather than one that can be
  // dragged. content.css answers that with a fade at the trailing edge — but a
  // fade drawn on a block that fits is dimming the last few characters of a
  // line for no reason, and CSS has no way to ask whether an element overflows.
  // So the fact is published here as an attribute and the fade hangs off it.
  //
  // It is re-measured on resize because the answer changes with the column: the
  // same block scrolls on a phone and fits on a laptop, and a rotation crosses
  // that line in one frame.
  function syncOverflow() {
    Array.prototype.forEach.call(blocks, function (pre) {
      // 1px of slack: sub-pixel column widths otherwise report a block as
      // scrollable by a fraction of a character nobody can see or reach.
      if (pre.scrollWidth - pre.clientWidth > 1) {
        pre.setAttribute('data-overflows', '');
      } else {
        pre.removeAttribute('data-overflows');
      }
    });
  }
  syncOverflow();
  // Fonts arrive after this script runs and change every measurement with them.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncOverflow);
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncOverflow, 120);
  });

  function makeCopyButton(pre) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    btn.textContent = 'Copy';
    // The label changes to report the result, so it can't also be the
    // accessible name — that would make the button rename itself under a
    // screen reader mid-interaction.
    btn.setAttribute('aria-label', 'Copy code to clipboard');

    var resetTimer;
    btn.addEventListener('click', function () {
      var code = pre.querySelector('code');
      navigator.clipboard.writeText(code ? code.textContent : pre.textContent)
        .then(function () { report('Copied', 'done'); })
        .catch(function () {
          // Permission denied or no clipboard write. Select the block so the
          // hint is actionable — Ctrl+C then copies the right thing.
          selectNode(code || pre);
          report('Ctrl+C', 'fail');
        });
    });

    function report(text, state) {
      btn.textContent = text;
      btn.setAttribute('data-state', state);
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () {
        btn.textContent = 'Copy';
        btn.removeAttribute('data-state');
      }, 1800);
    }

    return btn;
  }

  function selectNode(node) {
    var range = document.createRange();
    range.selectNodeContents(node);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
})();
