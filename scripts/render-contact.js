(function () {
  var HASH = '#contact';
  var ICONS = {
    email:
      '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/>' +
      '<path d="m3.6 6.9 7.5 5.2a1.6 1.6 0 0 0 1.8 0l7.5-5.2"/>',
    linkedin:
      '<path fill="currentColor" stroke="none" d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M3 9.5h4V21H3zm6.5 0h3.8v1.6h.05a4.2 4.2 0 0 1 3.77-2c4.03 0 4.78 2.5 4.78 5.9V21h-4v-5.2c0-1.24-.02-2.84-1.8-2.84-1.8 0-2.08 1.35-2.08 2.75V21h-4z"/>',
    phone:
      '<path d="M8.2 3.5h-2A2.2 2.2 0 0 0 4 5.9C4 13.7 10.3 20 18.1 20a2.2 2.2 0 0 0 2.4-2.2v-2a1 1 0 0 0-.77-.97l-3.4-.8a1 1 0 0 0-1.05.4l-.9 1.25a12.6 12.6 0 0 1-5.1-5.1l1.26-.9a1 1 0 0 0 .39-1.05l-.79-3.4a1 1 0 0 0-.97-.77z"/>',
    'asset-store':
      '<path d="M12 3.2 20 7.6v8.8L12 20.8 4 16.4V7.6z"/>' +
      '<path d="M12 12.4 20 7.9M12 12.4 4 7.9M12 12.4v8.2"/>',
    fallback: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2"/>'
  };

  function svgIcon(id) {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICONS[id] || ICONS.fallback) +
      '</svg>'
    );
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // ---------- channel cards ----------

  function buildCard(channel) {
    // The whole card is the link — a contact card with a separate small link
    // inside it just makes people aim.
    var card = el('a', 'contact-card');
    card.href = channel.href;
    if (channel.accent) card.setAttribute('data-accent', channel.accent);
    if (channel.external) {
      card.target = '_blank';
      card.rel = 'noopener';
    }

    var head = el('div', 'contact-head');

    var icon = el('span', 'contact-icon');
    icon.innerHTML = svgIcon(channel.id);
    head.appendChild(icon);

    head.appendChild(el('p', 'contact-label', channel.label));
    // Every channel hands you off somewhere else — a browser tab, a mail
    // client, a dialler — so they all get the same diagonal arrow.
    head.appendChild(el('span', 'contact-arrow', '↗'));
    card.appendChild(head);

    card.appendChild(el('p', 'contact-value mono', channel.value));
    if (channel.note) card.appendChild(el('p', 'contact-note', channel.note));

    return card;
  }

  // ---------- the dialog ----------

  function buildDialog(data) {
    var dialog = el('dialog', 'contact-modal');
    dialog.id = 'contact-modal';
    dialog.setAttribute('aria-labelledby', 'contact-modal-title');

    var head = el('div', 'contact-modal-head');
    var heading = el('div', 'contact-modal-heading');
    heading.appendChild(el('p', 'eyebrow mono', 'Get in touch'));
    var title = el('h2', null, 'Say hello');
    title.id = 'contact-modal-title';
    heading.appendChild(title);
    head.appendChild(heading);

    var close = el('button', 'contact-close');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close');
    close.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
    head.appendChild(close);
    dialog.appendChild(head);

    var body = el('div', 'contact-modal-body');

    body.appendChild(el('p', 'lead',
      'Questions about a tool, a bug you have hit, a feature you want, or work you would like to talk about: any of these is welcome. Pick whichever channel suits you.'));

    body.appendChild(buildClock());

    var grid = el('section', 'contact-grid');
    grid.setAttribute('aria-label', 'Contact channels');
    data.channels.forEach(function (channel) {
      grid.appendChild(buildCard(channel));
    });
    body.appendChild(grid);

    body.appendChild(buildExtra());
    dialog.appendChild(body);

    return dialog;
  }

  /* The clock is not decoration: three of the four channels reach a person in
     one timezone, and knowing it is the middle of the night here explains a
     slow reply better than any promise about response times. */
  function buildClock() {
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (e) {
      // No IANA timezone support — a wrong local time is worse than none.
      return document.createDocumentFragment();
    }

    var row = el('p', 'contact-status');
    var time = el('span', 'contact-clock mono');
    row.appendChild(time);
    row.appendChild(el('span', 'contact-status-note', 'my local time · IST, UTC+5:30'));

    function tick() { time.textContent = fmt.format(new Date()); }
    tick();
    setInterval(tick, 20000);
    return row;
  }

  function buildExtra() {
    var extra = el('section', 'contact-extra');

    var a = el('div', 'contact-extra-cell');
    a.appendChild(el('p', 'contact-extra-title mono', 'Response time'));
    a.appendChild(el('p', null,
      'Email is the surest way to reach me, and it usually gets a reply within ' +
      'a couple of days.'));
    extra.appendChild(a);

    var b = el('div', 'contact-extra-cell');
    b.appendChild(el('p', 'contact-extra-title mono', 'Reporting a bug? Include'));
    var list = el('ul', 'contact-checklist');
    [
      'The tool, and which version of it',
      'Your Unity version and platform',
      'What you did, and what happened instead'
    ].forEach(function (item) { list.appendChild(el('li', null, item)); });
    b.appendChild(list);
    extra.appendChild(b);

    return extra;
  }

  // ---------- open / close, wired to the URL hash ----------

  function init() {
    var data = window.CONTACT_DATA;
    if (!data || !Array.isArray(data.channels)) {
      console.error('CONTACT_DATA not found. Is scripts/contact.js loaded?');
      return;
    }

    var dialog = buildDialog(data);
    document.body.appendChild(dialog);

    // True when the popup was opened by a hash change during this visit, which
    // means there is a previous history entry to go back to. False when the
    // page was loaded straight at #contact — going back from there leaves the
    // site entirely, so that case rewrites the URL instead.
    var openedViaPush = false;

    function isContactHash() { return location.hash === HASH; }

    function open(viaPush) {
      if (dialog.open) return;
      openedViaPush = !!viaPush;
      // A reopen must never inherit the exit animation's final frame.
      dialog.classList.remove('is-closing');
      dialog.showModal();
      // The page behind a modal must not scroll — <html> already reserves the
      // scrollbar's width, so hiding it here shifts nothing.
      document.body.classList.add('modal-open');
    }

    // Closes the dialog and nothing else. Everything that closes the popup ends
    // up here; what differs is whether the URL is dealt with on the way in.
    //
    // The popup rises into place when it opens, so it has to sink back out the
    // same way. A dialog that animates in and then vanishes on close reads as a
    // glitch rather than a dismissal: the eye is told where the surface came
    // from and then never sees it return there. `.is-closing` runs the mirrored
    // keyframes (contact.css), and only then is the dialog actually closed —
    // .close() removes the element from the top layer immediately, so it can't
    // be called first.
    var closeTimer = null;
    function close() {
      if (!dialog.open) {
        document.body.classList.remove('modal-open');
        return;
      }
      // Already on its way out — don't restart the animation.
      if (dialog.classList.contains('is-closing')) return;

      function finish() {
        clearTimeout(closeTimer);
        closeTimer = null;
        dialog.removeEventListener('animationend', onEnd);
        dialog.classList.remove('is-closing');
        if (dialog.open) dialog.close();
        document.body.classList.remove('modal-open');
      }
      function onEnd(e) {
        // Children animate too; only the dialog's own exit ends the close.
        if (e.target === dialog) finish();
      }

      dialog.classList.add('is-closing');
      dialog.addEventListener('animationend', onEnd);
      // animationend never fires if the animation is suppressed — which is
      // exactly what prefers-reduced-motion does — so the popup must not be
      // able to get stuck open waiting for it.
      closeTimer = setTimeout(finish, 320);
    }

    // The user asking to close — take #contact back out of the URL too, or the
    // popup cannot be reopened from the same link and Back lands on a URL that
    // says the popup is open when it is not.
    function requestClose() {
      if (isContactHash()) {
        if (openedViaPush) {
          openedViaPush = false;
          // Pops the entry the hash link pushed, so Back/Forward stay honest.
          history.back();
        } else {
          history.replaceState(null, '', location.pathname + location.search);
        }
      }
      close();
    }

    // Every close route is wired explicitly rather than through the dialog's
    // own `close` event: that event is the one part of <dialog> that cannot be
    // relied on to fire everywhere, and the URL would silently drift if it did
    // not. `cancel` is Esc, which we take over so it closes the same way.
    dialog.querySelector('.contact-close').addEventListener('click', requestClose);
    dialog.addEventListener('cancel', function (e) {
      e.preventDefault();
      requestClose();
    });
    // A click landing on the dialog element itself is a click on the backdrop —
    // the content all sits in child elements.
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) requestClose();
    });

    window.addEventListener('hashchange', function () {
      if (isContactHash()) open(true);
      else close();
    });

    if (isContactHash()) open(false);
  }

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
