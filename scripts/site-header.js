/* ============================================================
   Site header — one header, identical on every page.

   Every page carries a placeholder plus this script, and nothing else:

     <div id="site-header"></div>
     <script src="/scripts/site-header.js"></script>

   There is no per-page value. Every path on the site is written from the repo
   root ("/assets/…", "/tools/…"), which the site can do because it is served at
   the root of a domain — so a page works the same at whatever depth it lives.

   LINKS below is the whole site navigation. There is deliberately no per-page
   variation — every page shows the same brand, the same links, in the same
   order, so adding a page to the nav is one entry here and it appears
   everywhere at once.

   The script is loaded synchronously right where the header belongs, so the
   nav is in the DOM before the rest of the page paints — no flash, no shift.
   ============================================================ */
(function () {
  var mount = document.getElementById('site-header');
  if (!mount) return;

  var LINKS = [
    { label: 'All tools', href: '/' },
    // The landing page's "4 years" figure links here too. Both routes exist on
    // purpose: someone skimming the intro finds it in the sentence it belongs
    // to, and someone who has scrolled past finds it where site sections live.
    { label: 'Experience', href: '/experience/' },
    // Same arrangement as Experience above: the landing page's "N contributions"
    // figure links here, and the nav carries it too for anyone who has scrolled
    // past the intro.
    { label: 'Contributions', href: '/contributions/' },
    // Not a page: #contact opens the contact popup, which scripts/render-contact.js
    // builds on every page. A plain hash link rather than a button so the URL
    // carries the open state and Back closes it.
    { label: 'Contact', href: '#contact' }
  ];

  // The contact popup is site-wide, so it loads from here rather than from a
  // <script> tag repeated in every page — the promise of this file is that a
  // page carries the header placeholder and nothing else. Dynamically created
  // scripts default to async, which would let the renderer run before its data;
  // async=false puts them back in document order.
  // The custom pointer is site-wide for the same reason, and loads from the
  // same place. It no-ops on anything without a fine pointer.
  var CONTACT_SCRIPTS = ['/scripts/contact.js', '/scripts/render-contact.js', '/scripts/cursor.js'];

  var LOGO_SRC = '/assets/img/logo-64.png';

  var nav = document.createElement('div');
  nav.className = 'nav';

  var inner = document.createElement('div');
  inner.className = 'wrap wrap-wide nav-inner';

  var brand = document.createElement('a');
  brand.className = 'brand mono';
  brand.href = '/';
  brand.innerHTML =
    '<span class="brand-mark"><img src="' + LOGO_SRC + '" alt=""></span>' +
    'Vaishnav Chincholkar';
  inner.appendChild(brand);

  var links = document.createElement('nav');
  links.className = 'nav-links';

  // The link to the page you are already on is marked, not removed — the nav
  // keeps the same shape everywhere, which is the whole point of it.
  // Directory URLs are the real ones ("/tools/unity-cli/"), but a page can also
  // be reached at its file ("/tools/unity-cli/index.html") — locally, or by an
  // old link. Both name the same page, so both normalise to the directory form
  // before being compared.
  function normalise(path) {
    return path.replace(/index\.html$/, '').replace(/\/?$/, '/');
  }
  var here = normalise(location.pathname);

  LINKS.forEach(function (link) {
    var a = document.createElement('a');
    a.className = 'nav-link';
    a.href = link.href;
    a.textContent = link.label;
    if (link.external) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    // A hash link resolves to the current page's own path, so it would match
    // `here` on every page — it opens a popup, not a page, and is never current.
    if (link.href.charAt(0) === '#') {
      a.setAttribute('aria-haspopup', 'dialog');
      links.appendChild(a);
      return;
    }
    // Compare normalised paths so the file and directory forms both match.
    if (normalise(a.pathname) === here) {
      a.classList.add('is-current');
      a.setAttribute('aria-current', 'page');
    }
    links.appendChild(a);
  });

  inner.appendChild(links);
  nav.appendChild(inner);
  mount.parentNode.replaceChild(nav, mount);

  // "The page has been scrolled" as a single fact, published on <html> where
  // anything can read it. The header uses it for its scroll edge (.nav::after
  // in nav.css) and the landing page's scroll cue uses it to retire itself
  // (intro.css) — two unrelated components reacting to one state rather than
  // each attaching its own scroll listener and drifting out of step by a frame.
  //
  // The header only needs to separate itself from content once content is
  // actually underneath it, so its divider is a state rather than a permanent
  // border.
  //
  // The threshold is 4px, not 0: a page resting at the very top can report 1-2px
  // from momentum bounce or a restored scroll position, and toggling a visible
  // edge on that would flicker. The listener is passive so it can never delay a
  // scroll frame, and the work per event is one comparison — the class is only
  // touched when the state actually changes, so no style recalc happens on the
  // vast majority of scroll events.
  var scrolled = false;
  function syncEdge() {
    var next = (window.scrollY || document.documentElement.scrollTop) > 4;
    if (next === scrolled) return;
    scrolled = next;
    document.documentElement.classList.toggle('is-scrolled', next);
  }
  syncEdge(); // a page loaded at an anchor already starts scrolled
  window.addEventListener('scroll', syncEdge, { passive: true });

  CONTACT_SCRIPTS.forEach(function (src) {
    var s = document.createElement('script');
    s.src = src;
    s.async = false;
    document.head.appendChild(s);
  });
})();
