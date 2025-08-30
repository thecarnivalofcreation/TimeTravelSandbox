// Core world data: eras, locations, items, and puzzle flags
export const ERAS = {
  "-10000": { name: "–10,000 BCE • Glacier Edge", key: "ice", spawn: "glacier-ridge" },
  "250":    { name: "250 BCE • Library of Alexandria", key: "library", spawn: "scroll-hall" },
  "1893":   { name: "1893 CE • Tesla’s Pavilion", key: "tesla", spawn: "dyno-lab" },
  "1985":   { name: "1985 CE • Starcade", key: "arcade", spawn: "neon-arcade" },
  "2200":   { name: "2200 CE • Orbital Haven", key: "orbital", spawn: "dock-ring" }
};

export const LOCATIONS = {
  // 2200
  "dock-ring": {
    era:"2200", name:"Dock Ring", exits:{east:"atrium"}, items:["chronokey"], npcs:["dock-ai"],
    desc:`A curved promenade overlooks Earth. A maintenance AI hums nearby.`
  },
  "atrium": {
    era:"2200", name:"Atrium", exits:{west:"dock-ring", north:"museum-vault"}, items:[],
    desc:`A living museum of time anomalies. A sealed vault sits to the north.`
  },
  "museum-vault": {
    era:"2200", name:"Museum Vault", exits:{south:"atrium"}, items:["lens-socket"], locked:true,
    desc:`A reinforced vault with a socket awaiting a fractured artifact.`
  },

  // 1985
  "neon-arcade": {
    era:"1985", name:"Neon Arcade", exits:{east:"back-alley"}, items:["token"], npcs:["clerk"],
    desc:`Rows of cabinets blare 8-bit music. A change clerk eyes you.`
  },
  "back-alley": {
    era:"1985", name:"Back Alley", exits:{west:"neon-arcade"}, items:["crated-gadget"],
    desc:`Garbage cans, neon mist, and a wooden crate stamped 'PROTOTYPE'.`
  },

  // 1893
  "dyno-lab": {
    era:"1893", name:"Dynamo Lab", exits:{east:"fairground"}, items:["tesla-coil"], npcs:["inventor"],
    desc:`Copper coils crackle. An inventor scribbles equations.`
  },
  "fairground": {
    era:"1893", name:"Fairground", exits:{west:"dyno-lab"}, items:["blueprint"],
    desc:`Ferris wheel lights twinkle. An unattended satchel lies here.`
  },

  // 250 BCE
  "scroll-hall": {
    era:"250", name:"Scroll Hall", exits:{east:"scriptorium"}, items:["burnt-scroll"], npcs:["librarian"],
    desc:`Shelves of papyrus. A calm librarian oversees the hall.`
  },
  "scriptorium": {
    era:"250", name:"Scriptorium", exits:{west:"scroll-hall"}, items:["gold-leaf"],
    desc:`Scribes whisper, gold leaf glitters for manuscript edging.`
  },

  // –10,000 BCE
  "glacier-ridge": {
    era:"-10000", name:"Glacier Ridge", exits:{south:"mammoth-steppe"}, items:["ice-crystal"],
    desc:`The wind howls over blue ice. Strange lights twitch beneath.`
  },
  "mammoth-steppe": {
    era:"-10000", name:"Mammoth Steppe", exits:{north:"glacier-ridge"}, items:["amber-gnat"],
    desc:`Grass ripples, distant trumpeting. A fossilized gnat glows in amber.`
  }
};

// Items & crafting
export const ITEMS = {
  "chronokey": { name:"ChronoKey", portable:true, desc:"Allows time travel once charged (use with an energy source)." },
  "lens-socket": { name:"Continuum Lens (Socket)", portable:false, desc:"A frame missing shards from different eras." },

  "token": { name:"Arcade Token", portable:true, desc:"Shiny token. Maybe buys favors in 1985." },
  "crated-gadget": { name:"Crated Gadget", portable:false, desc:"Crate stamped 'PROTOTYPE'. It rattles." },

  "tesla-coil": { name:"Tesla Coil", portable:false, desc:"Hums with potential. Could charge things." },
  "blueprint": { name:"Blueprint", portable:true, desc:"Notes on wave harmonics and charge modulation." },

  "burnt-scroll": { name:"Burnt Scroll", portable:true, desc:"Illegible history fragment." },
  "gold-leaf": { name:"Gold Leaf", portable:true, desc:"Thin foil; useful in restoration." },

  "ice-crystal": { name:"Prismatic Ice", portable:true, desc:"Frigid shard with inner light." },
  "amber-gnat": { name:"Amber Gnat", portable:true, desc:"Ancient insect in amber." },

  // Lens shards: crafted from cross-era combos
  "lens-shard-ancient": { name:"Lens Shard (Ancient)", portable:true, hidden:true, desc:"Restored from a burnt scroll with gold leaf." },
  "lens-shard-industrial": { name:"Lens Shard (Industrial)", portable:true, hidden:true, desc:"Charged via Tesla resonance calibrated by blueprint." },
  "lens-shard-primeval": { name:"Lens Shard (Primeval)", portable:true, hidden:true, desc:"Stabilized using prismatic ice around organic inclusion." }
};

// NPCs simple
export const NPCS = {
  "dock-ai": { name:"Dock AI", era:"2200", lines:[
    "Dock operations nominal.",
    "Temporal tourism is prohibited without authorization.",
    "Curious. Your ChronoKey profile shows… anomalies."
  ]},
  "clerk": { name:"Arcade Clerk", era:"1985", lines:[
    "Tokens or you’re window-shopping.",
    "Heard about a crate out back. Don’t look at me.",
    "Beat the high score and I might help you."
  ]},
  "inventor": { name:"Inventor", era:"1893", lines:[
    "Alternating currents of destiny!",
    "Your device—may I? Its harmonics are… peculiar.",
    "Return with a design and we shall attempt a charge."
  ]},
  "librarian": { name:"Librarian", era:"250", lines:[
    "Knowledge is a ship; time is the sea.",
    "We gild truth to make it endure.",
    "If only we could mend what fire has taken."
  ]}
};

// Win condition helpers
export const GOAL = {
  requiredShards: ["lens-shard-ancient","lens-shard-industrial","lens-shard-primeval"]
};
