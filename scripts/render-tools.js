(function () {
  var container = document.getElementById('tools');
  var highlightSection = document.getElementById('highlight');
  if (!container) return;

  // See the note beside its use in renderCard. Kept here rather than inline so
  // the card's media column is described in one place if the grid ever changes.
  var MEDIA_SIZES = '(max-width: 1079px) calc(100vw - 40px), 42vw';

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function renderCard(tool, isHighlight) {
    var card = el('article', isHighlight ? 'card card-featured' : 'card');
    var hasMedia = !!(tool.image && tool.image.src);
    if (hasMedia) card.className += ' card-with-media';

    if (hasMedia) {
      var media = el('div', 'card-media');
      var img = el('img');
      img.src = tool.image.src;
      img.alt = tool.image.alt || '';
      img.loading = 'lazy';
      if (tool.image.width && tool.image.height) {
        img.width = tool.image.width;
        img.height = tool.image.height;
      }
      /* The media column is the full card below 1080px and roughly its left
         two fifths above that, which is what SIZES describes. Offered only when
         the full file's real width is known — that width is the descriptor, and
         a wrong one sends the browser after the wrong file. */
      if (tool.image.small && tool.image.width) {
        img.srcset = tool.image.small + ' 800w, ' + tool.image.src + ' ' + tool.image.width + 'w';
        img.sizes = MEDIA_SIZES;
      }
      // Wide cinematic covers bleed edge to edge. Small UI screenshots would go
      // soft and blow the card's height doing that, so they sit contained on the
      // media backdrop instead — see .card-media-contain.
      if (tool.image.fit === 'contain') {
        media.className += ' card-media-contain';
        // The gutters are filled by the same file blown up and blurred, so the
        // backdrop always carries the screenshot's own colours. A real element
        // rather than a background on the media box: it stacks predictably and
        // the browser can lazy-load and decode it like any other image.
        var bg = el('img', 'card-media-bg');
        // The small copy whenever there is one: this element is blown up and
        // blurred past the point where any of the full file's detail survives,
        // so fetching it would be paying for pixels that get destroyed.
        bg.src = tool.image.small || tool.image.src;
        bg.alt = '';
        bg.setAttribute('aria-hidden', 'true');
        bg.loading = 'lazy';
        media.appendChild(bg);
      }
      media.appendChild(img);
      card.appendChild(media);
    }

    // Everything that isn't the screenshot lives in one wrapper, so wide screens
    // can put the copy beside the media with a plain two-column grid instead of
    // asking each child to span the right rows.
    var body = el('div', 'card-body');

    if (tool.tag) {
      var tag = el('p', 'card-tag');
      tag.appendChild(el('span', 'dot'));
      tag.appendChild(document.createTextNode(tool.tag));
      body.appendChild(tag);
    }

    if (tool.title) body.appendChild(el('h3', null, tool.title));
    if (tool.desc) body.appendChild(el('p', 'desc', tool.desc));

    if (Array.isArray(tool.actions) && tool.actions.length) {
      var actions = el('div', 'actions');
      tool.actions.forEach(function (action) {
        var a = el('a', 'btn btn-' + (action.style === 'primary' ? 'primary' : 'secondary'), action.label);
        a.href = action.href;
        if (action.external) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
        actions.appendChild(a);
      });
      body.appendChild(actions);
    }

    card.appendChild(body);
    return card;
  }

  function renderGhost(ghost) {
    var node = el('div', 'card-ghost');
    node.appendChild(el('span', null, ghost.label || 'Next tool in progress.'));
    node.appendChild(el('span', 'mono', ghost.note || 'TBA'));
    return node;
  }

  var data = window.TOOLS_DATA;
  if (!data) {
    console.error('TOOLS_DATA not found. Is scripts/tools.js loaded?');
    container.appendChild(el('p', 'desc', 'Tools could not be loaded.'));
    return;
  }

  var tools = data.tools || [];

  // The highlight band shows exactly one tool, pulled out of the list below.
  var featured = null;
  if (data.highlight && data.highlight.id) {
    for (var i = 0; i < tools.length; i++) {
      if (tools[i].id === data.highlight.id) { featured = tools[i]; break; }
    }
    if (!featured) {
      console.error('Highlighted tool "' + data.highlight.id + '" not found in TOOLS_DATA.tools.');
    }
  }

  if (featured && highlightSection) {
    var head = el('div', 'highlight-head');
    highlightSection.appendChild(head);

    var card = renderCard(featured, true);
    if (data.highlight.label) {
      var badge = el('span', 'highlight-badge mono', data.highlight.label);
      // Inside .card-body so the wide two-column layout can give it a real cell.
      // It still floats over the card corner elsewhere — .card-featured is the
      // positioned ancestor, so the absolute placement works from here too.
      var body = card.querySelector('.card-body');
      body.insertBefore(badge, body.firstChild);
    }
    highlightSection.appendChild(card);
  } else if (highlightSection) {
    highlightSection.hidden = true;
  }

  tools.forEach(function (tool) {
    if (tool === featured) return;
    container.appendChild(renderCard(tool));
  });
  if (data.ghost) container.appendChild(renderGhost(data.ghost));

  // In the same task as the appends above, so the cards are marked for their
  // entrance before the browser has had a chance to paint them at full opacity.
  // Guarded because scroll reveal is optional — it bows out entirely on a
  // reduced-motion setting, and this file must not care either way.
  if (window.reveal) window.reveal.scan();
})();
