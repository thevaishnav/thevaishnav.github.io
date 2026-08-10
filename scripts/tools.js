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
        src: "/assets/img/pivot/cover.png",
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
        width: 1376,
        height: 768,
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
        width: 4951,
        height: 2476,
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
