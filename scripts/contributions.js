/* ============================================================
   The contributions list — the data behind /contributions/, and behind the
   "More than N contributions" figure on the landing page.

   This file holds records and nothing else; scripts/render-contributions.js
   draws them. Adding a project here is the whole edit: a card appears, any new
   tag it carries becomes a filter, and the figure on the landing page counts
   one higher.

   ---- a record ----------------------------------------------------------
     title        what it is called
     kind         the one-line "what is this", shown under the title
     status       "live" | "shipped" | "open-source" — drawn as the badge in
                  the card's top corner. Each one has to be provable by a link
                  on the same card: live means you can install it right now,
                  open-source means you can read it. A badge nobody can check
                  is decoration.
     media        the cover. Either { youtube: "<video id>" }, which becomes
                  the video's own thumbnail and plays in place when clicked,
                  or { src: "/assets/img/…" }. `position` is the CSS
                  object-position used when the cover is cropped to the card's
                  2:1 box — "left" keeps a banner's logo end in frame.
                  `width`/`height` are the file's real pixel dimensions and are
                  what reserves the card's space before the image arrives, so
                  they have to be measured rather than guessed. `small` is
                  optional and names an 800px-wide copy of the same picture;
                  give it and a phone downloads that instead of the full file.
     stat         the one figure worth reading from across the room. Left out
                  rather than padded when a project has no honest number.
     role         what I did on it, and where.
     description  one or two sentences: what was built, not what it was.
     tags         the filter facets. Every tag becomes a filter button, so a
                  tag used once is a button that filters to a single card —
                  reuse an existing one wherever it fits.
     platforms    where it runs. Drawn brighter than `tech` because it is what
                  a reader is checking for.
     tech         how it was built.
     links        where to go, drawn across the cover. `type` (apple / github /
                  page) only tints the link; `label` has to stand on its own,
                  and it is read on a panel half the width of the image, so
                  two or three words is the ceiling.
                  A project whose cover is a video has none: that cover is
                  already a control, and it plays the very thing a "watch"
                  button would have linked to.

   Every claim below is one the timeline at /experience/ already makes — the
   two pages describe the same work from different ends, and they must not
   drift apart.
   ============================================================ */
window.CONTRIBUTIONS_DATA = {

  /* The order the filter buttons appear in. Grouped by what a reader filters
     for first — the kind of thing it is, then what is interesting about it.
     Any tag used in `projects` but missing here is appended rather than
     dropped, so this list going stale costs an ordering, not a filter. */
  filterOrder: [
    "PC Game",
    "Mobile Game",
    "Editor Tool",
    "Multiplayer",
    "Physics",
    "Open Source"
  ],

  projects: [
    {
      title: "Battle Royale & E-Sports",
      kind: "Multiplayer PC Game · Sinverse",
      status: "shipped",
      media: {
        youtube: "v1rGRSIFQwE",
        alt: "Video: the Sinverse Battle Royale mode in play."
      },
      stat: "Up to 20 players per lobby",
      role: "Unity 3D Developer · EDIIIE",
      description: "A full Battle Royale mode built end to end — matchmaking, team formation, KDA tracking and disconnect recovery.",
      tags: ["PC Game", "Multiplayer"],
      platforms: ["PC"],
      tech: ["Unity3D", "Netcode", "Matchmaking"]
      // No links: the cover is the video, and it plays where it sits.
    },
    {
      title: "Virtual Estate System",
      kind: "Building System · Sinverse",
      status: "shipped",
      media: {
        youtube: "E3lFW_aCI2U",
        alt: "Video: building and editing a property with the virtual estate system."
      },
      stat: "81,521 physics props in one scene",
      role: "Unity 3D Developer · EDIIIE",
      description: "Buy and sell land, then build on it — houses, bases and businesses up to fourteen stories, held in a single multiplayer scene by object pooling and distance-based culling.",
      tags: ["PC Game", "Multiplayer", "Physics"],
      platforms: ["PC"],
      tech: ["Unity3D", "Object pooling", "Distance culling"]
      // No links: the cover is the video. The LinkedIn write-up on the 81,521
      // props is still reachable from the landing page and from the timeline
      // entry that makes the claim — it does not need a third door.
    },
    {
      title: "Character Customization",
      kind: "Character System · Sinverse",
      status: "shipped",
      media: {
        youtube: "bnCh2lrQdDk",
        alt: "Video: the character customization screen, changing body, clothing and accessories."
      },
      stat: "Sinverse · 14,000+ registered players",
      role: "Unity 3D Developer · EDIIIE",
      description: "DNA-based body variation, clothing and accessories, previewed in real time and persisted per player on the backend.",
      tags: ["PC Game"],
      platforms: ["PC"],
      tech: ["Unity3D", "Backend persistence"]
      // No links: the cover is the video, and it plays where it sits.
    },
    {
      title: "Free The Girl",
      kind: "Hyper-casual Mobile Game",
      status: "live",
      media: {
        src: "/assets/img/FreeTheGirl.jpg",
        width: 712,
        height: 285,
        alt: "The Free the Girl! listing on the App Store, showing the game's icon.",
        position: "left"
      },
      stat: "Rope physics written from scratch",
      role: "Sole developer · Frolic Frog",
      description: "Shipped from empty project to store listing, including a custom rope simulation and the overlap detection the puzzles are scored on.",
      tags: ["Mobile Game", "Physics"],
      platforms: ["iOS", "Android"],
      tech: ["Unity3D", "Rope physics"],
      links: [
        { label: "App Store", url: "https://apps.apple.com/us/app/free-the-girl/id1581317624", type: "apple" }
      ]
    },
    {
      title: "Balls To Cup",
      kind: "Hyper-casual Mobile Game",
      status: "live",
      media: {
        src: "/assets/img/BallsToCup.jpg",
        width: 714,
        height: 285,
        alt: "The Balls to Cup listing on the App Store, showing the game's icon.",
        position: "left"
      },
      stat: "1,500+ simultaneous physics objects",
      role: "Sole developer · Frolic Frog",
      description: "Shipped from empty project to store listing, with object pooling and physics tuning holding the frame rate on mid-range phones.",
      tags: ["Mobile Game", "Physics"],
      platforms: ["iOS", "Android"],
      tech: ["Unity3D", "Object pooling"],
      links: [
        { label: "App Store", url: "https://apps.apple.com/us/app/balls-to-cup/id1616477125", type: "apple" }
      ]
    },
    {
      title: "Quick Access",
      kind: "Unity Editor Tool",
      status: "open-source",
      media: {
        src: "/assets/img/QuickAccessBanner.jpg",
        small: "/assets/img/QuickAccessBanner-800.jpg",
        width: 1737,
        height: 905,
        alt: "The Quick Access editor window, annotated: ping an asset, open a scene, unpin, and the Scene Objects list."
      },
      stat: "Free and open source",
      role: "Solo project",
      description: "Every project has a handful of things you open twenty times a day. Drag them into one editor window and they stay a single click away — assets, scenes and in-scene objects alike.",
      tags: ["Editor Tool", "Open Source"],
      platforms: ["Unity 2022.3+"],
      tech: ["Unity3D", "C#", "Editor UI"],
      links: [
        { label: "More info", url: "/tools/quick-access/", type: "page" },
        { label: "GitHub", url: "https://github.com/itsdevlogger/quick-access-window", type: "github" }
      ]
    },
    {
      title: "Unity CLI Skill",
      kind: "Claude Skill · Unity CLI",
      status: "open-source",
      media: {
        src: "/assets/img/unity-cli-cover.jpg",
        small: "/assets/img/unity-cli-cover-800.jpg",
        width: 1509,
        height: 704,
        alt: "Diagram: Claude and a shared command library feed the Unity CLI, which drives the Unity Editor, with a return arrow labelled \"gets better with use\"."
      },
      stat: "A command library that grows with use",
      role: "Solo project",
      description: "A Claude skill for the Unity CLI. It ships with a command library shared by every Unity project on the machine, and when Claude catches itself rewriting the same code it turns that into a new command.",
      tags: ["Editor Tool", "Open Source"],
      platforms: ["Unity 6.0+", "Windows"],
      tech: ["Claude", "Unity3D", "CLI"],
      links: [
        { label: "More info", url: "/tools/unity-cli/", type: "page" },
        { label: "GitHub", url: "https://github.com/itsdevlogger/unity-cli-skill", type: "github" }
      ]
    }
  ]
};
