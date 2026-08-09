/* ============================================================
   The custom pointer.

   Everything visual lives in assets/css/cursor.css. This file only
   decides three things and writes them where CSS can see them:

     - where the dot is        (every frame, exact, no smoothing)
     - where the ring is       (every frame, eased toward the dot)
     - what the ring is over   (a class, plus a size when it snaps)

   Why the ring eases and the dot does not: the dot is a claim about
   the pointer's position and must be true; the ring is a claim about
   what is under it, which is allowed to arrive a few frames late and
   reads better when it does.

   The whole thing is opt-in per device. It only runs where there is a
   real pointer to replace — a touch screen keeps its native behaviour
   and never loads a frame of this.
   ============================================================ */
(function () {
  var root = document.documentElement;

  // (pointer: fine) is the actual question — "is the primary input something
  // that can hit a 6px dot". Not screen width, not a UA string. A tablet with
  // a trackpad attached correctly answers yes; a 4K phone correctly answers no.
  var fine = window.matchMedia('(pointer: fine)');
  if (!fine.matches) return;

  // Reduced motion does not switch the cursor off — a dot and a ring are not
  // what the setting is about. It switches off the *lag*, which is: the ring
  // stops trailing and sits exactly on the pointer.
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Anything where letting go does something. Kept in sync with the press-
  // feedback list in motion.css by intent: if it answers a press, the ring
  // should already have told you it would.
  var HIT = 'a[href], button, [role="button"], summary, label[for], ' +
            '.card, .contact-card, .scroll-cue, .code-copy, .toc a';

  // Where a caret is the more useful cursor. Deliberately narrow: a heading is
  // a target as often as it is text, and turning the dot into a bar over every
  // <h2> makes the page feel like a document rather than a site.
  var TEXT = 'p, li, pre, code, blockquote, td, th, input, textarea';

  var dot = document.createElement('div');
  dot.className = 'cursor-dot';
  var ring = document.createElement('div');
  ring.className = 'cursor-ring';
  dot.setAttribute('aria-hidden', 'true');
  ring.setAttribute('aria-hidden', 'true');

  // Pointer position, and the ring's own lagging copy of it. Seeded off-screen
  // so nothing paints at 0,0 before the first move.
  var px = -100, py = -100;
  var rx = px, ry = py;
  var seen = false;      // has the pointer moved at least once
  var snap = null;       // the element the ring is currently wrapped around
  var frame = 0;

  // The ring's target box. When free it is the base 30px circle; when snapped
  // it is the target's own box, so the ring *is* the outline of what you are
  // about to press.
  var BASE = 30;
  var w = BASE, h = BASE, r = BASE / 2;

  function setRingBox(nw, nh, nr) {
    if (nw === w && nh === h && nr === r) return;   // don't touch style every frame
    w = nw; h = nh; r = nr;
    ring.style.width = w + 'px';
    ring.style.height = h + 'px';
    ring.style.borderRadius = r + 'px';
  }

  function unsnap() {
    snap = null;
    ring.classList.remove('is-snapped');
    dot.classList.remove('is-snapped');
    setRingBox(BASE, BASE, BASE / 2);
  }

  function clear() {
    unsnap();
    ring.classList.remove('is-over');
  }

  function snapTo(el) {
    var box = el.getBoundingClientRect();
    // A ring bigger than this has stopped being a cursor and become a border
    // around the page. The target still gets acknowledged — see .is-over —
    // but with colour rather than geometry.
    if (box.width > window.innerWidth * 0.9 || box.height > window.innerHeight * 0.7) {
      unsnap();
      return false;
    }
    snap = el;
    var radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 6;
    ring.classList.add('is-snapped');
    dot.classList.add('is-snapped');
    // +6px so the ring reads as an outline around the target rather than a
    // second border sitting exactly on its own.
    setRingBox(box.width + 6, box.height + 6, radius + 3);
    return true;
  }

  function onMove(e) {
    px = e.clientX;
    py = e.clientY;
    if (!seen) {
      seen = true;
      rx = px; ry = py;          // first frame: no flight in from off-screen
      root.classList.add('cursor-ready');
    }
    root.classList.remove('cursor-out');

    var el = e.target;
    var hit = el && el.closest ? el.closest(HIT) : null;

    if (hit) {
      dot.classList.remove('is-text');
      ring.classList.remove('is-text');
      if (hit !== snap) snapTo(hit);
      // After snapTo, not before: an oversized target unsnaps, and unsnap
      // clears the dot's tint. The tint applies either way — the target is
      // pressable whether or not the ring could wrap it.
      ring.classList.add('is-over');
      dot.classList.add('is-snapped');
      return;
    }
    clear();
    var text = el && el.closest ? el.closest(TEXT) : null;
    dot.classList.toggle('is-text', !!text);
    ring.classList.toggle('is-text', !!text);
  }

  function tick() {
    frame = requestAnimationFrame(tick);

    // The ring's target is the pointer, unless it is snapped — then it is the
    // centre of the thing it is wrapped around, which is what lets it sit
    // still on a card while the pointer keeps moving inside it.
    var tx = px, ty = py;
    if (snap) {
      var box = snap.getBoundingClientRect();
      // The element scrolled away or was removed while we were on it.
      if (!box.width && !box.height) {
        unsnap();
      } else {
        tx = box.left + box.width / 2;
        ty = box.top + box.height / 2;
        // Re-read the size too: a card that grows on hover should take the
        // ring with it rather than leave it outlining the old box.
        setRingBox(box.width + 6, box.height + 6, r);
      }
    }

    // Exponential ease toward the target. 1 means "arrive this frame", which
    // is what reduced motion asks for; 0.18 is roughly a 5-frame settle, slow
    // enough to be visible as weight and fast enough never to feel detached.
    //
    // The snapped constant is deliberately the slower of the two, and much
    // slower than the free one. Free-flight lag is felt, not watched — too much
    // of it and the pointer feels broken. The glide onto a target is the part
    // meant to be seen, and it is paced to match the ring's reshape (--dur-snap
    // in tokens.css) so the travel and the change of shape finish together
    // rather than the ring arriving and then squaring up.
    var k = calm.matches ? 1 : (snap ? 0.09 : 0.18);
    rx += (tx - rx) * k;
    ry += (ty - ry) * k;

    dot.style.transform = 'translate(' + px + 'px,' + py + 'px)';
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
  }

  // ---------- the top layer ----------
  // A <dialog> opened with showModal() is promoted to the browser's top layer,
  // which paints above the entire normal DOM. No z-index reaches it — z-index
  // only orders things within a layer — so the cursor disappears under the
  // contact popup. The only fix is to be in the same layer: move the two
  // elements inside the open dialog, and move them back when it closes.
  // Both are position:fixed, so their coordinates are unaffected by the reparent.
  var host = document.body;
  function reparent() {
    var open = document.querySelector('dialog[open]');
    var next = open || document.body;
    if (next === host) return;
    host = next;
    host.appendChild(ring);
    host.appendChild(dot);
    // The dialog's own box was never a snap target and the element the ring was
    // wrapped around is now behind a modal. Start clean in the new layer.
    clear();
  }
  // `open` is a real attribute on <dialog>, so opening and closing are both
  // observable without the popup having to announce anything — this stays
  // correct for any dialog the site adds later, not just the contact one.
  new MutationObserver(reparent).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['open']
  });

  function leave() {
    root.classList.add('cursor-out');
    clear();
  }

  document.addEventListener('pointermove', onMove, { passive: true });
  // pointerdown carries the press through to the ring even when the target
  // handles the event itself and stops it bubbling further up.
  document.addEventListener('pointerdown', function () {
    ring.classList.add('is-down');
    dot.classList.add('is-down');
  }, { passive: true, capture: true });
  document.addEventListener('pointerup', function () {
    ring.classList.remove('is-down');
    dot.classList.remove('is-down');
  }, { passive: true, capture: true });

  // Leaving the window, and the two cases that look like leaving: a native
  // dialog or a tab switch taking the pointer away without a leave event.
  document.addEventListener('pointerleave', leave);
  window.addEventListener('blur', leave);
  // A snapped ring is anchored to a box that scrolling moves. The rAF loop
  // re-reads that box anyway, so scrolling needs no handler — but a scroll
  // that moves the *page* under a still pointer does change what is under it,
  // and only a move event would notice. Cheap correction: on scroll end, drop
  // the snap and let the next move re-establish it.
  window.addEventListener('scroll', function () {
    if (snap && !snap.isConnected) unsnap();
  }, { passive: true });

  // A device can gain or lose a fine pointer mid-session (a tablet docking to
  // a keyboard). Tear the whole thing down rather than leave a dot stranded.
  function sync() {
    if (fine.matches) return;
    cancelAnimationFrame(frame);
    root.classList.remove('has-cursor', 'cursor-ready');
    dot.remove();
    ring.remove();
  }
  if (fine.addEventListener) fine.addEventListener('change', sync);

  root.classList.add('has-cursor');
  document.body.appendChild(ring);
  document.body.appendChild(dot);
  frame = requestAnimationFrame(tick);
})();
