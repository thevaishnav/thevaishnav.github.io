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

   The ring's *shape* is eased here too, not in CSS. Travelling onto a
   target and growing into its outline are one movement, and a movement
   split across two engines is a movement with two curves and two
   durations — the ring lands and then squares up, which is the exact
   thing that reads as jerky. One loop, one easing constant, one
   arrival.

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
  var out = false;       // is the pointer currently off the window
  var snap = null;       // the element the ring is currently wrapped around
  var frame = 0;
  var last = 0;          // timestamp of the previous frame

  // The ring's box, in three copies: where it is going, where it currently is,
  // and what was last written to the DOM. The third exists so a settled ring
  // costs nothing — no style writes, no layout, no paint.
  var BASE = 30;
  var PAD = 6;           // the ring sits this far outside a target's own box
  var tw = BASE, th = BASE, tr = BASE / 2;   // target
  var cw = BASE, ch = BASE, cr = BASE / 2;   // current
  var ww = 0, wh = 0, wr = 0;                // written
  var wdot = '', wring = '';                 // last transforms written

  /* The two time constants, in milliseconds to cover 63% of the remaining
     distance — so roughly 3x these numbers is the movement you actually see.

     They are time, not per-frame fractions, which is the other half of the
     jerk fix: a fixed fraction per frame means the ring moves at one speed on
     a 60Hz panel and nearly twice that on a 120Hz one, and stutters visibly
     whenever a frame is dropped. Expressed against elapsed time, a dropped
     frame costs a larger step rather than a pause.

     Free flight is the faster of the two. Its lag is felt rather than watched,
     and too much of it makes the pointer feel broken. The glide onto a target
     is the part meant to be seen, so it is slower — but only slightly. The old
     pairing (a ~180ms position ease against a 660ms CSS reshape) spent most of
     its length finishing a movement the eye had already stopped following. */
  var TAU_FREE = 38;
  var TAU_SNAP = 65;

  // Hit testing is owed once per frame at most, not once per pointer event.
  // `hover` is the element the last move reported; null means "ask the page
  // where the pointer is", which is how a scroll under a still pointer gets
  // noticed at all.
  var pending = false;
  var hover = null;

  function setTargetBox(nw, nh, nr) {
    tw = nw; th = nh; tr = nr;
  }

  function unsnap() {
    snap = null;
    ring.classList.remove('is-snapped');
    dot.classList.remove('is-snapped');
    setTargetBox(BASE, BASE, BASE / 2);
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
    // +PAD so the ring reads as an outline around the target rather than a
    // second border sitting exactly on its own.
    setTargetBox(box.width + PAD, box.height + PAD, radius + PAD / 2);
    return true;
  }

  // What is under the pointer, and what that makes the cursor. Runs inside the
  // frame rather than inside the event, so every read it does (a rect, a
  // computed style) happens alongside the loop's own reads and before any of
  // the loop's writes — one layout pass per frame instead of a read/write
  // interleave across two callbacks.
  function hitTest() {
    pending = false;

    var el = hover;
    // No element from a move, or one that has since been removed: ask the page
    // directly. This is the scroll case — the pointer never moved, but what is
    // beneath it did.
    if (!el || !el.isConnected) el = document.elementFromPoint(px, py);

    var target = el && el.closest ? el.closest(HIT) : null;

    if (target) {
      dot.classList.remove('is-text');
      ring.classList.remove('is-text');
      if (target !== snap) snapTo(target);
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

  function onMove(e) {
    px = e.clientX;
    py = e.clientY;
    hover = e.target;
    pending = true;
    if (!seen) {
      seen = true;
      rx = px; ry = py;          // first frame: no flight in from off-screen
      root.classList.add('cursor-ready');
    }
    if (out) {
      out = false;
      root.classList.remove('cursor-out');
    }
  }

  function tick(now) {
    frame = requestAnimationFrame(tick);

    // Elapsed time drives the easing. Clamped because a backgrounded tab or a
    // long main-thread stall hands back a gap of seconds, and the ring should
    // simply be where it belongs by then rather than sail across the screen.
    var dt = last ? now - last : 16.7;
    last = now;
    if (dt > 100) dt = 100;

    // ---- reads ----
    if (pending) hitTest();

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
        tw = box.width + PAD;
        th = box.height + PAD;
      }
    }

    // ---- ease ----
    // One constant for the whole ring. Position and shape are the same
    // movement, so they share a curve and land on the same frame.
    var k = calm.matches ? 1 : 1 - Math.exp(-dt / (snap ? TAU_SNAP : TAU_FREE));

    rx += (tx - rx) * k;
    ry += (ty - ry) * k;
    cw += (tw - cw) * k;
    ch += (th - ch) * k;
    cr += (tr - cr) * k;

    // An exponential ease approaches forever. Half a pixel out is close enough
    // to call arrived, and calling it lets the writes below go quiet. Position
    // gets a finer threshold than the box because it is written at tenths and
    // the box at whole pixels — each stops at the point its own output can no
    // longer show the difference.
    if (Math.abs(tx - rx) < 0.05) rx = tx;
    if (Math.abs(ty - ry) < 0.05) ry = ty;
    if (Math.abs(tw - cw) < 0.5) cw = tw;
    if (Math.abs(th - ch) < 0.5) ch = th;
    if (Math.abs(tr - cr) < 0.5) cr = tr;

    // ---- writes ----
    // Guarded, all of them. A still pointer over nothing should not be
    // laying out and painting sixty times a second.
    var s = 'translate3d(' + px + 'px,' + py + 'px,0)';
    if (s !== wdot) { dot.style.transform = wdot = s; }
    s = 'translate3d(' + Math.round(rx * 10) / 10 + 'px,' + Math.round(ry * 10) / 10 + 'px,0)';
    if (s !== wring) { ring.style.transform = wring = s; }

    // Whole pixels for the box. A 1px border on a fractional width is a
    // blurred border, and at this size the rounding is invisible as movement
    // but very visible as sharpness.
    var n = Math.round(cw);
    if (n !== ww) { ring.style.width = (ww = n) + 'px'; }
    n = Math.round(ch);
    if (n !== wh) { ring.style.height = (wh = n) + 'px'; }
    n = Math.round(cr);
    if (n !== wr) { ring.style.borderRadius = (wr = n) + 'px'; }
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
    hover = null;
    pending = true;
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
    out = true;
    root.classList.add('cursor-out');
    clear();
    hover = null;
    pending = false;
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

  // A scroll under a still pointer changes what is beneath it without any
  // move event to say so — the ring would stay wrapped around a card that has
  // since slid away. Clearing `hover` makes the next frame's hit test ask the
  // page where the pointer actually is, which costs one elementFromPoint per
  // frame and only while the page is moving.
  window.addEventListener('scroll', function () {
    if (!seen || out) return;
    hover = null;
    pending = true;
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
