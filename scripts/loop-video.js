/* ============================================================
   Silent looping clips — the thing a product GIF was always trying to be.

   A clip is authored as a plain, complete <video> with the attributes that
   make it work with no script at all:

     <video data-loop autoplay muted loop playsinline preload="metadata"
            poster="…" width="…" height="…" aria-label="…">
       <source src="…​.webm" type="video/webm">
       <source src="…​.mp4"  type="video/mp4">
     </video>

   Everything this file does is a *downgrade* of that starting point, which is
   the only arrangement where the no-JS version is the working one:

     - prefers-reduced-motion: the clip stops being a clip. Autoplay and loop
       come off, it is left showing its poster, and it gains controls — the
       setting asks for motion not to start on its own, not for the content to
       become unreachable. This is the one case that cannot be expressed in
       CSS: no stylesheet can pause a video.

     - offscreen: paused, and rewound. A clip here is eleven seconds with a
       beginning — a pivot is switched on, a slider moves, a door swings — and
       a reader who arrives at second six has been handed the middle of a
       sentence and no way to tell that is what happened. So the rule is not
       "keep it warm", it is "it starts when you get there": nothing plays
       until it is properly on screen, and every arrival starts at frame zero.
       Pausing offscreen also stops a decode costing battery and a core for
       something nobody can see — Chrome throttles offscreen autoplay already,
       Firefox and Safari do not.

   `scan()` is published for the same reason reveal.js publishes one: cards on
   the landing page are appended by a render script after this file has run, so
   that script re-scans in the same task it appends. Elements already taken are
   skipped, so calling it twice costs nothing.
   ============================================================ */
(function () {
  var reduced = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* How much of the clip has to be on screen before it runs, and how little
     before it stops. Two numbers rather than one because a single gate is a
     video that stutters on and off while the reader rests at exactly that
     scroll position; between these the clip is left alone, whichever state it
     is in. START is deliberately high — the point is that the reader is
     looking at the thing before it begins, not that it is technically within
     the viewport by a sliver.

     Measured against `min(clip height, viewport height)`, not against the
     clip's own height. A clip taller than the window can never be 60% visible
     and would never start; against the smaller of the two, "60% of as much of
     it as could possibly be shown" means the same thing on a phone as on a
     desktop. */
  var START = 0.6;
  var STOP = 0.25;

  /* A ratio computed from `intersectionRatio` alone would have the same bug as
     the height above, so the thresholds are only there to make the callback
     fire often enough; the decision is made from the rectangles. */
  var STEPS = [];
  for (var i = 0; i <= 20; i++) STEPS.push(i / 20);

  var player = ('IntersectionObserver' in window)
    ? new IntersectionObserver(onView, { threshold: STEPS })
    : null;

  /* A second observer, doing nothing but getting the bytes in early. Without
     it "starts at frame zero when you arrive" is true and useless: the file is
     only requested once the clip is already on screen, so what the reader
     actually sees is the poster, a pause, and then the beginning. This one
     reaches 400px ahead and flips `preload`, which starts the download while
     the clip is still below the fold. It is one-shot — once a clip is warm
     there is nothing left to do to it. */
  var warmer = ('IntersectionObserver' in window)
    ? new IntersectionObserver(onNear, { rootMargin: '400px 0px' })
    : null;

  function onNear(entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.preload = 'auto';
      warmer.unobserve(entry.target);
    });
  }

  function onView(entries) {
    entries.forEach(function (entry) {
      var video = entry.target;
      // rootBounds is null in a few cross-origin cases; the window is the root
      // here, so its own height is the same answer.
      var rootH = (entry.rootBounds && entry.rootBounds.height) || window.innerHeight;
      var boxH = entry.boundingClientRect.height;
      var most = Math.min(boxH, rootH);
      var shown = most > 0 ? entry.intersectionRect.height / most : 0;

      if (shown >= START) {
        if (!video.paused) return; // already running: leave it alone
        // The whole point of the rewind. A clip the reader has scrolled away
        // from and come back to starts again rather than resuming, so it is
        // never joined halfway through. Guarded because seeking before any
        // metadata has arrived throws in Safari — and a video that has never
        // played is already at zero, so there is nothing lost when it does.
        try { video.currentTime = 0; } catch (e) {}
        // play() rejects rather than throws when the browser declines — a data
        // saver setting, a battery mode, a policy this page cannot see. The clip
        // is decoration in every place it is used, so a refusal is a non-event
        // and must not reach the console as an unhandled rejection.
        var played = video.play();
        if (played && played.catch) played.catch(function () {});
        return;
      }

      if (shown <= STOP) video.pause();
    });
  }

  function take(video) {
    if (video.dataset.loopBound) return;
    video.dataset.loopBound = '1';

    // Belt and braces: `muted` as an attribute is what the parser reads, but
    // the property is what the autoplay policy checks, and an element built by
    // a script has only whichever one was set.
    video.muted = true;

    if (reduced) {
      video.autoplay = false;
      video.loop = false;
      video.controls = true;
      video.pause();
      return;
    }

    if (!player) return; // no observer: the markup's own autoplay stands

    /* The markup's `autoplay` is what makes the clip work with no script at
       all, which means by the time this runs the browser may already have
       started it — offscreen, at the top of a page the reader has not scrolled
       yet. Taking the attribute off does not stop something already playing,
       so it is stopped and wound back here, and from now on the observer above
       is the only thing that ever starts it. */
    video.autoplay = false;
    video.pause();
    try { video.currentTime = 0; } catch (e) {}

    player.observe(video);
    if (warmer) warmer.observe(video);
  }

  function scan(root) {
    var list = (root || document).querySelectorAll('video[data-loop]');
    Array.prototype.forEach.call(list, take);
  }

  window.loopVideo = { scan: scan };

  // The clips written into a page's own markup are claimed as soon as the
  // document has them. Anything appended later is its renderer's job to
  // announce — see the scan() call at the foot of render-tools.js.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { scan(); });
  } else {
    scan();
  }
})();
