/* ============================================================
   Scroll reveal — which blocks get an entrance, and when.

   The styling lives in assets/css/reveal.css; this file decides what
   is a "block" and watches for it arriving. The split is deliberate:
   the list below is the only place that needs editing when a section
   is added, and it is a list of selectors rather than markup so no
   page has to carry a data attribute in seven files.

   Two things about the way this is wired are load-bearing:

   1. This script marks the elements. The CSS only hides what carries
      the attribute, so if this file never runs, nothing was ever
      hidden. The alternative — hiding by selector in CSS and having
      the script un-hide — fails to a blank page, which is not a
      failure mode worth the frame it saves.

   2. Elements built by the render scripts do not exist when this
      first runs, so `window.reveal.scan()` is public and those
      scripts call it in the same task in which they append. Same
      task means no paint in between, which means the card is marked
      before it has ever been drawn visible.
   ============================================================ */
(function () {
  var root = document.documentElement;

  // Nothing here is required for the page to work, and every branch below
  // wants the same answer to "should there be an entrance at all".
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) return;

  /* What gets an entrance.

     Containers, not their contents. A card that fades in while its own
     heading, paragraph and buttons each fade in separately is four
     animations describing one arrival, and it reads as the page loading
     slowly rather than as the card appearing. The exceptions are the two
     openers — the landing intro and each subpage's page-hero — where the
     lines genuinely are the content and reading them in order is the point.

     `.highlight` is the section and not `.card-featured` inside it, and that
     is not arbitrary: the featured card's rotating glow is a ::before at
     z-index:-1, which only paints behind the card while the card has no
     stacking context of its own. Animating opacity or transform on the card
     would give it one and hide the glow for the length of the entrance. The
     section around it can carry the movement without that cost. */
  var TARGETS = [
    /* landing — the opener, read as a sentence */
    '.intro-copy > .eyebrow',
    '.intro-title',
    '.intro-lead',
    '.intro-cards > li',
    '.intro-mark',
    /* landing — the tools band */
    '.hero > *',
    '.highlight',
    '.tools > *',
    /* every subpage's opener */
    '.page-hero > *',
    /* experience */
    '.tl-glance li',
    '.tl-item',
    '.tl-aside',
    /* contributions */
    '.proj-toolbar',
    '.proj',
    /* the closing band, on whichever page carries one */
    '.cta-band'
  ].join(',');

  /* 55ms between neighbours, and never more than five steps of it.

     The gap is the smallest one that still reads as a sequence rather than as
     a group; below about 40ms the eye merges them. The cap is what keeps a
     long list honest — the contributions grid is fourteen cards, and an
     uncapped stagger would put the last one three quarters of a second behind
     the first, which is no longer a cascade, it is a queue. Five steps is
     enough to establish the direction; after that everything arrives together
     and the reader is not kept waiting for a decoration. */
  var STEP = 55;
  var MAX_STEPS = 5;

  var observer = new IntersectionObserver(function (entries) {
    /* Sorted by where they are on screen, not by the order the observer
       happened to hand them over. On a normal scroll the batch is one or two
       elements and this changes nothing; on first load it is everything above
       the fold, and then it is the difference between the page reading itself
       top to bottom and the page arriving in whatever order the DOM was walked. */
    var arriving = [];
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) arriving.push(entries[i].target);
    }
    if (!arriving.length) return;

    arriving.sort(function (a, b) {
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return (ra.top - rb.top) || (ra.left - rb.left);
    });

    arriving.forEach(function (node, index) {
      observer.unobserve(node);
      var delay = Math.min(index, MAX_STEPS) * STEP;
      if (delay) node.style.setProperty('--reveal-delay', delay + 'ms');
      node.classList.add('is-revealed');
      /* Clean up after itself — see the note at the foot of reveal.css. The
         listener is one-shot, and `both` on the animation means the element
         stays visible even if this never fires. */
      node.addEventListener('animationend', function done(e) {
        if (e.target !== node || e.animationName !== 'reveal-rise') return;
        node.removeEventListener('animationend', done);
        node.removeAttribute('data-reveal');
        node.classList.remove('is-revealed');
        node.style.removeProperty('--reveal-delay');
      });
    });
  }, {
    /* Slightly inside the viewport rather than exactly at its edge. An element
       that starts moving the instant its first pixel crosses the fold is
       animating in a place the reader is not looking yet, and has finished by
       the time they get there — which is a reveal nobody sees. */
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.01
  });

  /* Every element this has ever touched, so scan() can be called as often as
     anything likes and never do the same element twice.

     The attribute cannot be the record, which is the subtle part: an element
     that has finished arriving has had its attribute removed — that is the
     whole cleanup step — so by the time the next scan runs it looks exactly
     like an element that has never been seen. scan() runs at least three times
     on the landing page (here, from render-tools.js, and again at
     DOMContentLoaded), and the observer is free to fire in between, so without
     this a block that arrived early would be marked hidden a second time and
     fade in again in front of a reader who had already started reading it.

     A WeakSet rather than a marker attribute so nothing is left behind in the
     DOM and the entries go when the nodes do. */
  var seen = new WeakSet();

  /* Whether anything has been on screen yet.

     While this is false, scan() may hide whatever it likes: nothing has been
     drawn, so a block starting at opacity 0 is a block that was never seen at
     any other value. Once the first frame is up, the one thing this file must
     not do is hide a block the reader is already looking at — that is not an
     entrance, it is a blink. So from that point on only blocks below the fold
     are marked, which is where an entrance was going to be read anyway.

     This is a safety net rather than the mechanism. The ordering is what
     actually keeps blocks unpainted at scan time — reveal.js is a plain
     <script> in each page's head, ahead of the render scripts that call
     scan() — and this catches the case where that ordering is broken again
     by a later edit, or by a script that arrives from cache in a different
     order than expected.

     Two frames rather than one: the first requestAnimationFrame callback runs
     before its own frame is composited, so it is the second that can say
     something has actually reached the screen. */
  var painted = false;
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { painted = true; });
  });

  function scan() {
    var nodes = document.querySelectorAll(TARGETS);
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (seen.has(node)) continue;
      seen.add(node);
      // Below the fold is the only safe place to start something at zero once
      // the page is on screen. Recorded as seen either way: a block that was
      // already visible when it was first offered has had its moment, and
      // giving it one later — when a filter reflows the list, say — would be
      // an animation the reader did not ask for.
      if (painted && node.getBoundingClientRect().top < window.innerHeight) continue;
      node.setAttribute('data-reveal', '');
      observer.observe(node);
    }
  }

  // Public so the render scripts can mark what they have just built, in the
  // same task in which they built it — see the note at the head of this file.
  window.reveal = { scan: scan };

  scan();
  /* The render scripts call scan() themselves, so this is the safety net for
     anything drawn by something that does not — and for the case where this
     file finished loading before the page had finished parsing. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  }
})();
