/* ============================================================
   Site chrome — the header, the phone tab bar, the skip link and the footer.
   One set, identical on every page.

   Every page carries a placeholder plus this script, and nothing else:

     <div id="site-header"></div>
     <script src="/scripts/site-header.js"></script>

   Everything else this file draws is appended to <body> and needs no markup in
   the page at all, which is what keeps that promise true as the chrome grows.

   There is no per-page value. Every path on the site is written from the repo
   root ("/assets/…", "/tools/…"), which the site can do because it is served at
   the root of a domain — so a page works the same at whatever depth it lives.

   LINKS below is the whole site navigation, and all three renderings of it —
   the header row, the tab bar, the footer — are built from it. There is
   deliberately no per-page variation, so adding a page to the nav is one entry
   here and it appears in all three places at once.

   The script is loaded synchronously right where the header belongs, so the
   nav is in the DOM before the rest of the page paints — no flash, no shift.
   ============================================================ */
(function () {
  // "Scripts got this far", published on <html> the same way `is-scrolled` and
  // `has-cursor` are. Anything whose starting state is only safe when a script
  // is definitely going to change it hangs off this class — currently that is
  // scroll reveal, which may not begin an element at opacity:0 unless there is
  // something present to bring it back. Set before anything else in this file
  // so it is true from the first rule the page evaluates.
  document.documentElement.classList.add('has-js');

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

  // Everything the whole site gets, loaded from here rather than from a
  // <script> tag repeated in every page — the promise of this file is that a
  // page carries the header placeholder and nothing else. Dynamically created
  // scripts default to async, which would let a renderer run before its data;
  // async=false puts them back in document order.
  //
  // The contact popup is the original reason this list exists. The custom
  // pointer joined it because it is site-wide too and no-ops on anything
  // without a fine pointer.
  //
  // Scroll reveal used to be in this list and is not any more. Everything here
  // is injected, and an injected script cannot be relied on to run before the
  // page's own scripts at the foot of the body — measured, reveal.js started
  // nine milliseconds after the render scripts had already finished appending
  // their cards, so the scan() call they make was a no-op and the cards were
  // hidden and faded in only after they had been painted. It is a plain
  // <script> in each page's head now, which is the only placement that makes
  // "marked before it is ever painted" true. Nothing else in this list has an
  // ordering requirement, which is why nothing else moved.
  var SITE_SCRIPTS = [
    '/scripts/contact.js',
    '/scripts/render-contact.js',
    '/scripts/cursor.js'
  ];

  var LOGO_SRC = '/assets/img/logo-64.png';

  // The one address on the site a reader may want as a string rather than as a
  // dialog. Written here so the footer and the landing page's closing band
  // cannot drift; scripts/contact.js owns the same value for the popup.
  var EMAIL = 'thevaishnavchincholkar@gmail.com';

  // Every page begins with the same header, and a keyboard or screen-reader
  // visitor should not have to walk it to reach the page they came for. The
  // link is the first thing in the tab order and is invisible until it has
  // focus — see .skip-link in nav.css.
  //
  // Inserted now rather than on DOMContentLoaded because "first in the tab
  // order" is a claim about document order, and this script runs while the body
  // is still being parsed: <main id="top"> does not exist yet, so its presence
  // cannot be checked here. It is verified below instead, once the document is
  // complete — a skip link pointing at nothing is worse than none at all.
  var skip = document.createElement('a');
  skip.className = 'skip-link';
  skip.href = '#top';
  skip.textContent = 'Skip to content';
  document.body.insertBefore(skip, document.body.firstChild);

  var nav = document.createElement('div');
  nav.className = 'nav';

  var inner = document.createElement('div');
  inner.className = 'wrap wrap-wide nav-inner';

  var brand = document.createElement('a');
  brand.className = 'brand mono';
  brand.href = '/';
  // The name is wrapped rather than left as a bare text node so it has a box
  // of its own to clip in — see .brand-name in nav.css. On a phone the header
  // is brand-only and pinned to --nav-h, and a name that wraps instead of
  // shortening would make that pinned height a lie.
  // The file's real dimensions, so `height:auto` in nav.css has a ratio to work
  // from before the image arrives. It was the one <img> on the site without
  // them; inside a fixed 28px clip nothing visibly jumps, but the attributes
  // are what make that true rather than lucky.
  brand.innerHTML =
    '<span class="brand-mark"><img src="' + LOGO_SRC + '" width="64" height="64" alt=""></span>' +
    '<span class="brand-name">Vaishnav Chincholkar</span>';
  inner.appendChild(brand);

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

  // One list, rendered twice. The header row is what a pointer gets; the tab
  // bar at the foot of the screen is what a thumb gets — see the tab bar block
  // in nav.css for why the phone navigation moved to the bottom edge. They are
  // built by the same function from the same LINKS so a page added there still
  // appears in both places at once, which was the whole promise of this file.
  // Only one of the two is ever visible: CSS shows the row above 620px and the
  // bar below it.
  function buildLinks(containerClass, itemClass, label) {
    var list = document.createElement('nav');
    list.className = containerClass;
    list.setAttribute('aria-label', label);

    LINKS.forEach(function (link) {
      var a = document.createElement('a');
      a.className = itemClass;
      a.href = link.href;
      a.textContent = link.label;
      if (link.external) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      // A hash link resolves to the current page's own path, so it would match
      // `here` on every page — it opens a popup, not a page, and is never
      // current.
      if (link.href.charAt(0) === '#') {
        a.setAttribute('aria-haspopup', 'dialog');
        list.appendChild(a);
        return;
      }
      // Compare normalised paths so the file and directory forms both match.
      if (normalise(a.pathname) === here) {
        a.classList.add('is-current');
        a.setAttribute('aria-current', 'page');
      }
      list.appendChild(a);
    });

    return list;
  }

  inner.appendChild(buildLinks('nav-links', 'nav-link', 'Site'));
  nav.appendChild(inner);
  mount.parentNode.replaceChild(nav, mount);

  // The footer. Every page used to stop dead on whatever its last section
  // happened to be — a project card, a dashed "next tool" placeholder — with
  // no closing edge and nothing to do next. This is the page's bottom edge and
  // its second route to the same four destinations, for a reader who has
  // scrolled two thousand pixels away from the header.
  //
  // Built from LINKS like the other two, so the site still has one navigation.
  // On a phone the link row is dropped (see nav.css): the tab bar is fixed to
  // the bottom of the screen and is carrying those exact four links a few
  // pixels below, and printing them twice in the same corner is noise.
  function buildFooter() {
    var footer = document.createElement('footer');
    footer.className = 'site-footer';

    var row = document.createElement('div');
    row.className = 'wrap wrap-wide site-footer-inner';

    var identity = document.createElement('div');
    identity.className = 'site-footer-identity';
    identity.innerHTML =
      '<p class="site-footer-name">Vaishnav Chincholkar</p>' +
      '<p class="site-footer-role">Senior Unity Developer · Pune, India</p>' +
      '<a class="link is-address site-footer-mail" href="mailto:' + EMAIL + '">' + EMAIL + '</a>';
    row.appendChild(identity);

    row.appendChild(buildLinks('site-footer-links', 'site-footer-link', 'Site, footer'));

    footer.appendChild(row);
    return footer;
  }

  // Both of these go at the end of <body>, after the document has finished
  // parsing. The tab bar is fixed to the bottom of the viewport, so where it
  // sits in the document costs nothing visually — but it costs a screen reader
  // plenty: appended while the body was still being parsed it would land ahead
  // of <main> and hand a reader the same four links twice before any content.
  // Waiting until DOMContentLoaded puts both after the content, which is where
  // a footer and a bottom bar belong in the reading order. The three link lists
  // are labelled differently so a reader moving between landmarks can tell them
  // apart.
  function mountDeferred() {
    // A skip link whose target does not exist is a control that lies. The link
    // is in the DOM from parse time (above) because its position in the tab
    // order is the whole point; this is where that bet is settled.
    if (!document.getElementById('top')) skip.remove();

    document.body.appendChild(buildFooter());
    // Appended after the footer so the bar stays the last thing in the reading
    // order, which is where an element fixed to the bottom edge belongs.
    document.body.appendChild(buildLinks('tabbar', 'tab', 'Site, bottom bar'));
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountDeferred);
  } else {
    mountDeferred();
  }

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

  SITE_SCRIPTS.forEach(function (src) {
    var s = document.createElement('script');
    s.src = src;
    s.async = false;
    document.head.appendChild(s);
  });
})();
