/* ============================================================
   The document table of contents — marks the section you are reading.

   Used by every page built on the .doc layout: /tools/quick-access/,
   /tools/unity-cli/ and /tools/pivot/user-manual/. It was an inline <script>
   at the foot of each of those three, and the three copies were identical —
   byte for byte, forty lines each, three places for one behaviour to be fixed
   in one of and drift in the other two.

   It needs no configuration. The TOC's own links name the sections, so the
   page's markup is the whole input: any `.toc a[href^="#"]` pointing at an
   element on the page joins the list, in document order.

   A page without a TOC loads this and does nothing, which is why it can be a
   plain <script> beside the others rather than something each page decides to
   include.
   ============================================================ */
(function () {
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.toc a[href^="#"]')
  );
  if (!links.length) return;

  // Map each section id to its TOC link.
  var linkById = {};
  var sections = [];
  links.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var section = document.getElementById(id);
    if (section) {
      linkById[id] = link;
      sections.push(section);
    }
  });

  function setActive(id) {
    links.forEach(function (link) {
      link.classList.toggle('active', link === linkById[id]);
    });
  }

  // Where the highlight line sits: just under the sticky header, wherever that
  // is. It was a hard-coded 100 — correct against the desktop header's 76px
  // and 40px too low on a phone, where nav.css drops --nav-h to 60 and the
  // TOC marked a section as current while its heading was still well below the
  // line. Read once per call rather than cached, so a resize across the 620px
  // breakpoint is answered on the next scroll frame without a listener of its
  // own; the read is a single getComputedStyle on the root and the whole
  // function is already inside a rAF.
  function highlightLine() {
    var navH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
      10
    );
    return (isNaN(navH) ? 76 : navH) + 24;
  }

  // Pick the section whose top is closest to (but not far below) the
  // scroll offset, i.e. the last one that has passed the highlight line.
  function update() {
    var offset = highlightLine();
    var current = sections[0];
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top - offset <= 0) {
        current = sections[i];
      } else {
        break;
      }
    }
    // At the very bottom of the page, force-select the last section.
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
      current = sections[sections.length - 1];
    }
    if (current) setActive(current.id);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      update();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
