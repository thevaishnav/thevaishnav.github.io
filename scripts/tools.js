/* The landing page's tool cards.

   `image.width` / `image.height` are the file's real pixel dimensions, not a
   display size and not an estimate: they are what the browser reserves the
   card's space with before the picture arrives, so a wrong ratio here is a
   layout that jumps under the reader as each card decodes. Two of the three
   entries below carried the dimensions of files that had since been re-exported
   smaller, which is exactly how that goes unnoticed — nothing looks wrong until
   the network is slow enough to see it.

   `image.small` is optional and names an 800px-wide copy of the same picture;
   with it, a phone downloads that file instead of the full one.

   An entry may carry `video` instead of `image`, and then the card's cover is a
   silent looping clip rather than a still. Same three required facts — the
   file's real `width`/`height`, and a description — plus `poster`, the frame
   shown until the clip has decoded, and one or both of `webm` / `mp4`.
   render-tools.js builds the element; scripts/loop-video.js owns its
   behaviour, including standing it down under reduced motion. A clip belongs
   to a tool whose whole pitch is a movement — a pivot swinging — and nothing
   else. */
window.TOOLS_DATA = {
  // The one tool shown in the Highlight band at the top of the page.
  // Must match exactly one tool `id` below. It is skipped in the Tools list,
  // so it never appears twice. Set to null to hide the band entirely.
  //
  // Pivot++ holds the band because it is the newest thing and the only one
  // that is a released Asset Store package; the badge says which of those two
  // is the reason. When the next tool ships, this is the one line that moves.
  highlight: {
    id: "pivot",
    label: "New · On the Asset Store"
  },
  tools: [
    {
      id: "pivot",
      video: {
        // 1090x820 of a 1920x1032 recording: cropped to the door and the
        // panel, because a full-width crop left the panel near 120px on screen
        // and unreadable at card size. Trimmed to the slider drag and the
        // rotation that follows — the recording's first half demonstrates the
        // default centre pivot, which is the problem rather than the pitch.
        // The recording masters live in the Pivot++ release folder, not here.
        webm: "/tools/pivot/media/door-hinge.webm",
        mp4: "/tools/pivot/media/door-hinge.mp4",
        poster: "/tools/pivot/media/door-hinge-poster.jpg",
        width: 1090,
        height: 820,
        alt: "A door in Unity's Scene view. The Pivot++ sliders are dragged and the rotate handle travels across the door in real time to its hinge edge, and the door then swings open around that hinge instead of around its centre."
      },
      tag: "Editor tool · Unity 2021.2+",
      title: "Pivot++",
      desc: "Want to rotate a door from its hinge? Scale a lamp post from its base? Normally you can't. At least not without re-exporting the mesh or adding an empty parent.\n\nPivot++ is a simple solution.\nSelect an object, drag a slider, and the pivot moves in real time.",
      actions: [
        { label: "Get it on the Asset Store ↗", href: "https://assetstore.unity.com/packages/tools/utilities/pivot-393670", style: "primary", external: true },
        { label: "Showcase", href: "/tools/pivot/", style: "secondary" },
        { label: "Read the manual", href: "/tools/pivot/user-manual/", style: "secondary" }
      ]
    },
    {
      id: "unity-cli",
      image: {
        src: "/tools/unity-cli/media/unity-cli-cover.jpg",
        small: "/tools/unity-cli/media/unity-cli-cover-800.jpg",
        width: 1509,
        height: 704,
        alt: "Diagram: Claude plus a shared Command Library feed the Unity CLI, which drives the Unity Editor — and a return arrow labelled \"gets better with use\" loops back into the library."
      },
      tag: "Claude skill · Unity 6.0+ · Windows",
      title: "Unity CLI skill for Claude",
      desc: "A Claude skill for the Unity CLI that gets better the more you use it.\nIt comes with a command library, shared by every Unity project on your PC. Claude uses those commands while it works and when it catches itself rewriting the same code, it turns that into a new command.",
      actions: [
        { label: "More Info", href: "/tools/unity-cli/", style: "primary" },
        { label: "GitHub ↗", href: "https://github.com/itsdevlogger/unity-cli-skill", style: "secondary", external: true }
      ]
    },
    {
      id: "quick-access",
      image: {
        src: "/tools/quick-access/media/QuickAccessBanner.jpg",
        small: "/tools/quick-access/media/QuickAccessBanner-800.jpg",
        width: 1737,
        height: 905,
        alt: "The Quick Access Editor window, annotated: ping an asset, open an asset or scene, unpin, play from a scene, and the Scene Objects list."
      },
      tag: "Editor tool · Unity 2022.3+",
      title: "Quick Access",
      desc: "Every project has a handful of things you open twenty times a day: the player prefab, the boot scene, the settings asset buried five folders deep.\n\nDrag them into one Editor window and they stay a single click away — assets, scenes, and in-scene objects alike.",
      actions: [
        { label: "More Info", href: "/tools/quick-access/", style: "primary" },
        { label: "GitHub ↗", href: "https://github.com/itsdevlogger/quick-access-window", style: "secondary", external: true }
      ]
    }
  ],
  ghost: {
    label: "Next tool in progress.",
    note: "TBA"
  }
};
