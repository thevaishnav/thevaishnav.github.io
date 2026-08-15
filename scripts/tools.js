/* The landing page's tool cards.

   `image.width` / `image.height` are the file's real pixel dimensions, not a
   display size and not an estimate: they are what the browser reserves the
   card's space with before the picture arrives, so a wrong ratio here is a
   layout that jumps under the reader as each card decodes. Two of the three
   entries below carried the dimensions of files that had since been re-exported
   smaller, which is exactly how that goes unnoticed — nothing looks wrong until
   the network is slow enough to see it.

   `image.small` is optional and names an 800px-wide copy of the same picture;
   with it, a phone downloads that file instead of the full one. */
window.TOOLS_DATA = {
  // The one tool shown in the Highlight band at the top of the page.
  // Must match exactly one tool `id` below. It is skipped in the Tools list,
  // so it never appears twice. Set to null to hide the band entirely.
  highlight: {
    id: "quick-access",
    label: "Free & open source"
  },
  tools: [
    /*{
      id: "pivot-plus-plus",
      image: {
        // cover.png is the same picture at 1.1MB — a PNG carrying a photographic
        // render, which is the one thing PNG is bad at. This JPEG is 79KB and
        // indistinguishable at card size. The PNG is still in the repo if the
        // master is ever needed; nothing links it.
        src: "/assets/img/pivot/cover.jpg",
        width: 1537,
        height: 796,
        alt: "Side-by-side comparison of a door rotating around Unity's default centre pivot versus around its hinge using Pivot++."
      },
      tag: "Editor tool · Unity 2022.3+",
      title: "Pivot++",
      desc: "Want to rotate a door from its hinge? Scale a lamp post from its base? Normally you can't. At least not without re-exporting the mesh or adding an empty parent.\n\nPivot++ is a simple solution.\nSelect an object, drag a slider, and the pivot moves in real time.",
      actions: [
        { label: "Showcase", href: "/tools/pivot/", style: "primary" },
        { label: "Asset Store ↗", href: "https://assetstore.unity.com/packages/packages/393670", style: "secondary", external: true },
        { label: "Read the manual", href: "/tools/pivot/user-manual/", style: "secondary" }
      ]
    },*/
    {
      id: "unity-cli",
      image: {
        src: "/assets/img/unity-cli-cover.jpg",
        small: "/assets/img/unity-cli-cover-800.jpg",
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
        src: "/assets/img/QuickAccessBanner.jpg",
        small: "/assets/img/QuickAccessBanner-800.jpg",
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
