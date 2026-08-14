/* ============================================================
   Draws the project cards at /contributions/, their filter bar, and keeps the
   figure that counts them true.

   Two jobs, one file, because they are the same fact stated twice: the page at
   /contributions/ is the list, and the landing page's "More than N
   contributions" is its length. Split across two scripts, they would be two
   places that can disagree about what the list holds.

   Either job is skipped when the page has nothing for it, so both pages load
   the same pair of scripts:

     <script src="/scripts/contributions.js"></script>        <- the records
     <script src="/scripts/render-contributions.js"></script> <- this

   The count follows the same contract as the year count in experience.js: the
   markup already holds the right number, so the figure is correct with
   JavaScript off and nothing reflows on load. This only keeps it true as the
   list grows.
   ============================================================ */
(function () {
  var data = window.CONTRIBUTIONS_DATA;

  // Missing or malformed data must leave the page as authored rather than
  // blank it — the count in the markup is a real number, and the page that
  // holds the list carries its own <noscript> fallback.
  if (!data || !Array.isArray(data.projects)) {
    console.error('CONTRIBUTIONS_DATA not found. Is scripts/contributions.js loaded?');
    return;
  }

  var projects = data.projects;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // ---- the count ---------------------------------------------------------
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-contributions-count]'),
    function (node) {
      node.textContent = String(projects.length);
    }
  );

  // ---- the list ----------------------------------------------------------
  var container = document.getElementById('contributions');
  if (!container) return;

  // The badge in a card's corner. Held here rather than in the data so the
  // wording stays consistent across seven cards; the data only picks a key.
  // An unknown key is drawn with its own text and the neutral tone, which is
  // wrong-looking rather than invisible — the right failure for a typo.
  var STATUS = {
    'live':        { label: 'Live',        tone: 'is-live' },
    'shipped':     { label: 'Shipped',     tone: 'is-shipped' },
    'open-source': { label: 'Open source', tone: 'is-open' }
  };

  /* ---------- the cover ----------
     A YouTube cover is the video's own thumbnail, not an embed: an iframe per
     card would load YouTube's player — and its cookies — seven times over for
     a page most readers scroll past. The player is fetched on click and only
     for the card that was clicked, from the no-cookie host.

     maxresdefault is the 16:9 master and the only size worth showing at card
     width, but it does not exist for every upload. hqdefault always does, so
     it is the fallback: it is 4:3 with the frame letterboxed inside it, and
     the card's 2:1 crop removes exactly those bars. If even that fails — an
     offline machine, a blocked host — the image is dropped and the media box
     is left as its own backdrop rather than showing a broken-image glyph. */
  function youtubeCover(id, alt) {
    var img = el('img', 'proj-cover');
    img.src = 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg';
    img.alt = alt || '';
    img.loading = 'lazy';
    img.width = 1280;
    img.height = 720;
    img.addEventListener('error', function () {
      if (img.getAttribute('data-fallback')) {
        img.remove();
        return;
      }
      img.setAttribute('data-fallback', '1');
      img.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
    });
    return img;
  }

  function imageCover(media) {
    var img = el('img', 'proj-cover');
    img.src = media.src;
    img.alt = media.alt || '';
    img.loading = 'lazy';
    if (media.width && media.height) {
      img.width = media.width;
      img.height = media.height;
    }
    // Covers are cropped to the card's 2:1 box. Centre is right for a frame of
    // gameplay; a banner with its logo at one end needs to be held to that end.
    if (media.position) img.style.objectPosition = media.position;
    return img;
  }

  /* ---------- the player ----------
     One dialog for the whole page, built on first use and reused after that.
     The player used to open inside the card, which is a 330px-wide box — the
     right size for a thumbnail and far too small to actually watch anything
     in. So it opens over the page instead, at whatever size the viewport
     allows.

     Native <dialog> rather than a hand-rolled overlay, the same as the contact
     popup: focus trapping, Esc, an inert page behind it and the ::backdrop are
     all free and behave the way the platform does.

     The iframe is created on open and destroyed on close. That is not
     housekeeping — an iframe merely hidden keeps playing, and audio from a
     video nobody can see is the worst failure this thing has available. */
  var player = (function () {
    var dialog, frame, caption, closeTimer;

    function build() {
      dialog = el('dialog', 'video-modal');
      dialog.setAttribute('aria-labelledby', 'video-modal-title');

      var head = el('div', 'video-modal-head');
      caption = el('p', 'video-modal-title mono');
      caption.id = 'video-modal-title';
      head.appendChild(caption);

      var close = el('button', 'video-close');
      close.type = 'button';
      close.setAttribute('aria-label', 'Close the video');
      close.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
        'stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
      close.addEventListener('click', hide);
      head.appendChild(close);
      dialog.appendChild(head);

      frame = el('div', 'video-frame');
      dialog.appendChild(frame);

      // Esc, twice over, because once was not enough.
      //
      // `cancel` is the platform's own Esc-on-a-modal event and it is what the
      // contact popup uses — but it was measured not firing here while a
      // trusted Escape keydown sailed past on its way to the document, which
      // left the popup open with a video still playing in it. So the key is
      // also watched directly. Both routes end in hide(), and hide() ignores a
      // second call while it is already closing, so a browser that fires both
      // closes the popup once.
      //
      // Neither reaches us once focus is inside the player: it is a
      // cross-origin iframe, and its key events are its own. That is the whole
      // reason the close button sits outside the frame rather than floating
      // over it, and why a click on the backdrop closes too.
      dialog.addEventListener('cancel', function (e) {
        e.preventDefault();
        hide();
      });
      // On the document rather than on the dialog: where an Esc keypress is
      // delivered turned out not to be something to bet on — it was seen
      // arriving at the document with the dialog nowhere in its path, which a
      // listener bound to the dialog would never have seen. The document is
      // the one node every key event in this page passes through.
      document.addEventListener('keydown', function (e) {
        if (!dialog.open) return;
        if (e.key === 'Escape' || e.key === 'Esc') {
          e.preventDefault();
          hide();
        }
      });
      // A click landing on the dialog itself is a click on the backdrop — the
      // player and its heading are both children.
      dialog.addEventListener('click', function (e) {
        if (e.target === dialog) hide();
      });

      document.body.appendChild(dialog);
    }

    function show(project) {
      if (!dialog) build();

      caption.textContent = project.title;

      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + project.media.youtube +
                   '?autoplay=1&rel=0&playsinline=1';
      iframe.title = project.title + ' — video';
      iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      frame.appendChild(iframe);

      // A reopen must never inherit the exit animation's final frame.
      dialog.classList.remove('is-closing');
      dialog.showModal();
      // Locks the page behind the popup. The class is the contact popup's —
      // it is a one-line rule in contact.css that every page already loads,
      // and two identical scroll locks would be one too many.
      document.body.classList.add('modal-open');
    }

    // The popup rises into place, so it sinks back out the same way — and the
    // player is only pulled once that has finished, or the video would vanish
    // a beat before the surface carrying it. Same shape as the contact popup:
    // .close() removes the element from the top layer immediately, so it
    // cannot be called first.
    function hide() {
      if (!dialog || !dialog.open) return;
      if (dialog.classList.contains('is-closing')) return;

      function finish() {
        clearTimeout(closeTimer);
        closeTimer = null;
        dialog.removeEventListener('animationend', onEnd);
        dialog.classList.remove('is-closing');
        // Killing the iframe is what stops the audio; everything else here is
        // presentation.
        while (frame.firstChild) frame.removeChild(frame.firstChild);
        if (dialog.open) dialog.close();
        document.body.classList.remove('modal-open');
      }
      function onEnd(e) {
        if (e.target === dialog) finish();
      }

      dialog.classList.add('is-closing');
      dialog.addEventListener('animationend', onEnd);
      // animationend never fires if the animation is suppressed — which is
      // exactly what prefers-reduced-motion does — so the popup must not be
      // able to get stuck open, with a video still playing, waiting for it.
      closeTimer = setTimeout(finish, 320);
    }

    return { show: show };
  })();

  /* A video cover is a button, not a link: it does something on this page. */
  function videoMedia(project) {
    var box = el('button', 'proj-media proj-media-video');
    box.type = 'button';
    box.setAttribute('aria-label', 'Play the video for ' + project.title);

    box.appendChild(youtubeCover(project.media.youtube, project.media.alt));

    var play = el('span', 'proj-play');
    play.setAttribute('aria-hidden', 'true');
    // Drawn rather than typed: a ▶ character is a different shape, weight and
    // baseline in every font the page might fall back to.
    play.innerHTML =
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" focusable="false">' +
      '<path d="M8 5.5v13l11-6.5z"/></svg>';
    box.appendChild(play);

    box.addEventListener('click', function () { player.show(project); });

    return box;
  }

  function renderMedia(project) {
    var media = project.media;
    if (!media) return null;
    if (media.youtube) return videoMedia(project);
    if (!media.src) return null;

    var box = el('div', 'proj-media');
    box.appendChild(imageCover(media));
    return box;
  }

  // ---- links -------------------------------------------------------------
  function renderLink(link) {
    if (!link || !link.url) return null;

    // Anything leaving the site opens in a new tab and says so with ↗; an
    // in-site path keeps the tab and gets →. Same arrow language as the
    // figures on the landing page.
    var external = /^https?:/i.test(link.url);

    var a = el('a', 'proj-link');
    a.href = link.url;
    // Only tints the link (see contributions.css). It is not a label, so a
    // type the stylesheet has never heard of just gets the default accent.
    if (link.type) a.setAttribute('data-type', link.type);
    if (external) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    a.appendChild(document.createTextNode(link.label || 'Open'));
    var arrow = el('span', 'proj-link-arrow', external ? '↗' : '→');
    arrow.setAttribute('aria-hidden', 'true');
    a.appendChild(arrow);
    return a;
  }

  // A row of them, or null when nothing in the list resolved — an entry whose
  // links all failed should read as an entry with no links, not as one with an
  // empty row of space where they would have been.
  function renderLinks(list, className) {
    if (!Array.isArray(list) || !list.length) return null;
    var row = el('div', className);
    var any = false;
    list.forEach(function (link) {
      var node = renderLink(link);
      if (!node) return;
      row.appendChild(node);
      any = true;
    });
    return any ? row : null;
  }

  // ---- one card ----------------------------------------------------------
  //
  // Where the links go depends on what the cover already does with a click.
  //
  // A video cover is spoken for: it plays. Its links stay in a row at the foot
  // of the card, because a "Watch on YouTube" button floating over a play
  // button is two controls for one intention, and the wrong one is bigger.
  //
  // A still cover does nothing on its own, so it carries the links instead —
  // revealed on hover, side by side over the image (see .proj-actions). That
  // buys back the row at the foot of the card, and it puts the destination
  // where the reader is already looking. Where there is no hover to reveal
  // them with, the stylesheet drops the same buttons below the image.
  function renderProject(project) {
    var card = el('article', 'proj');

    var media = renderMedia(project);
    var isVideo = !!(project.media && project.media.youtube);
    var links = renderLinks(project.links, isVideo ? 'proj-links' : 'proj-actions');

    if (media && links && !isVideo) {
      // The overlay is positioned against this wrapper rather than against the
      // media box itself: the media box is a fixed 2:1 frame that clips its
      // own overflow, and the buttons have to be able to leave it — which is
      // exactly what they do when they drop below the image.
      var shot = el('div', 'proj-shot');
      shot.appendChild(media);
      shot.appendChild(links);
      card.appendChild(shot);
      links = null;
    } else if (media) {
      card.appendChild(media);
    }

    var body = el('div', 'proj-body');

    var head = el('div', 'proj-head');
    head.appendChild(el('h3', 'proj-title', project.title || 'Untitled'));
    if (project.status) {
      var status = STATUS[project.status] || { label: project.status, tone: '' };
      head.appendChild(el('span', 'proj-status mono ' + status.tone, status.label));
    }
    body.appendChild(head);

    if (project.kind) body.appendChild(el('p', 'proj-kind', project.kind));
    if (project.stat) body.appendChild(el('p', 'proj-stat', project.stat));
    if (project.description) body.appendChild(el('p', 'proj-desc', project.description));
    if (project.role) body.appendChild(el('p', 'proj-role', project.role));

    // Platforms and tech in one list, drawn at two weights. They answer
    // different questions — "does it run where I need it" and "what is it
    // built on" — but they are one row of chips to the eye, and two separate
    // lists left short cards with two ragged half-empty rows.
    var platforms = Array.isArray(project.platforms) ? project.platforms : [];
    var tech = Array.isArray(project.tech) ? project.tech : [];
    if (platforms.length || tech.length) {
      var chips = el('ul', 'proj-chips');
      chips.setAttribute('role', 'list');
      platforms.forEach(function (name) {
        chips.appendChild(el('li', 'proj-chip', name));
      });
      tech.forEach(function (name) {
        chips.appendChild(el('li', 'proj-chip is-tech', name));
      });
      body.appendChild(chips);
    }

    // Only reached when the links did not go onto the cover above.
    if (links) body.appendChild(links);

    card.appendChild(body);
    return card;
  }

  // ---- the filters -------------------------------------------------------
  //
  // Every tag in the data becomes a button, in the order named by
  // `filterOrder`. A tag missing from that list is appended rather than
  // dropped: the order is a preference, and a stale preference must not be
  // able to hide a project behind a filter that was never drawn.
  var tags = [];
  function addTag(tag) {
    if (tag && tags.indexOf(tag) === -1) tags.push(tag);
  }
  (data.filterOrder || []).forEach(function (tag) {
    // Only if something actually carries it — an empty filter is a button that
    // hides the entire page and looks broken doing it.
    for (var i = 0; i < projects.length; i++) {
      if ((projects[i].tags || []).indexOf(tag) !== -1) { addTag(tag); return; }
    }
  });
  projects.forEach(function (project) {
    (project.tags || []).forEach(addTag);
  });

  var active = null; // the one tag switched on; null means "everything"
  var cards = [];    // { node, tags } in render order

  var toolbar = el('div', 'proj-toolbar');
  var bar = el('div', 'proj-filters');
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Filter projects by type');

  var count = el('p', 'proj-count mono');
  // Politely, and only the count: the cards themselves are still in the page
  // and can be read at leisure. Announcing seven titles on every toggle would
  // be unusable.
  count.setAttribute('aria-live', 'polite');
  count.setAttribute('aria-atomic', 'true');

  // One at a time. Picking a filter replaces whatever was on rather than
  // adding to it, so the bar always reads as a single answer to "what am I
  // looking at" — the state a reader can hold without checking the row.
  //
  // "All" is not a tag, it is that state cleared, which is why it cannot be
  // switched off by pressing it. Pressing the filter that is already on lands
  // in the same place: a second press on the thing you just pressed should
  // undo it, and the only place to undo to is everything.
  var allButton = el('button', 'proj-filter', 'All');
  allButton.type = 'button';
  allButton.addEventListener('click', function () {
    active = null;
    apply();
  });
  bar.appendChild(allButton);

  var buttons = [];
  tags.forEach(function (tag) {
    var button = el('button', 'proj-filter', tag);
    button.type = 'button';
    button.addEventListener('click', function () {
      active = (active === tag) ? null : tag;
      apply();
    });
    buttons.push({ tag: tag, node: button });
    bar.appendChild(button);
  });

  function matches(cardTags) {
    if (!active) return true;
    return cardTags.indexOf(active) !== -1;
  }

  function apply() {
    var shown = 0;
    cards.forEach(function (card) {
      var visible = matches(card.tags);
      if (visible) shown++;
      card.node.hidden = !visible;
    });

    allButton.setAttribute('aria-pressed', active ? 'false' : 'true');
    buttons.forEach(function (button) {
      button.node.setAttribute('aria-pressed', button.tag === active ? 'true' : 'false');
    });

    count.textContent = shown + (shown === 1 ? ' project' : ' projects');
  }

  toolbar.appendChild(bar);
  toolbar.appendChild(count);
  container.appendChild(toolbar);

  var grid = el('div', 'proj-grid');
  projects.forEach(function (project) {
    var node = renderProject(project);
    cards.push({ node: node, tags: project.tags || [] });
    grid.appendChild(node);
  });
  container.appendChild(grid);

  apply();
})();
