import { rng, choice, shallowClone } from "./utils.js";
import { ERAS, LOCATIONS, ITEMS, NPCS, GOAL } from "./world.js";
import { AIResponder } from "./ai.js";
import { parse } from "./parser.js";
import { save, load, exportSave, importSave } from "./storage.js";
import { UI } from "./ui.js";

const outEl = document.getElementById("output");
const invEl = document.getElementById("inventoryList");
const statusEl = document.getElementById("statusText");
const inputEl = document.getElementById("cmdInput");
const ui = new UI({outEl, invEl, statusEl, inputEl});

const defaultState = () => ({
  seed: "chronocourier",
  era: "2200",
  location: ERAS["2200"].spawn,
  inventory: [],
  flags: { chronoCharged:false, vaultOpened:false, craftedAncient:false, craftedIndustrial:false, craftedPrimeval:false },
  mood: "neutral",
  difficulty: "adventure",
  history: []
});

let state = load() || defaultState();
let ai = new AIResponder(state);

// UI wiring
document.getElementById("btnHelp").addEventListener("click", ()=> helpDialog.showModal());
document.getElementById("btnSettings").addEventListener("click", ()=> settingsDialog.showModal());
document.getElementById("btnTheme").addEventListener("click", ()=> {
  const theme = document.body.getAttribute("data-theme")==="light" ? null : "light";
  if (theme) document.body.setAttribute("data-theme","light"); else document.body.removeAttribute("data-theme");
});

document.getElementById("btnSave").addEventListener("click", ()=> { save(state); ui.system("Game saved."); });
document.getElementById("btnLoad").addEventListener("click", ()=> {
  const s = load(); if (s){ state = s; ai = new AIResponder(state); renderAll(); ui.system("Game loaded."); }
  else ui.warn("No save found.");
});
document.getElementById("btnExport").addEventListener("click", ()=> exportSave(state));
document.getElementById("btnImport").addEventListener("click", ()=> fileImport.click());
document.getElementById("fileImport").addEventListener("change", async (e)=> {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const s = await importSave(file);
    state = s; ai = new AIResponder(state); renderAll(); ui.system("Save imported.");
  } catch(err){
    ui.warn("Invalid save file.");
  }
});

document.getElementById("selDifficulty").addEventListener("change", e => { state.difficulty = e.target.value; ai.setDifficulty(state.difficulty); });
document.getElementById("selMood").addEventListener("change", e => { state.mood = e.target.value; ai.setMood(state.mood); });

document.getElementById("cmdForm").addEventListener("submit", (e)=>{
  e.preventDefault();
  const txt = inputEl.value.trim();
  if (!txt) return;
  handleCommand(txt);
  inputEl.value = "";
  ui.focus();
});

// Initial render
if (!load()){
  ui.system("Welcome, Courier. Your mission: reforge the Continuum Lens. Type 'help' for commands.");
  ui.print(ai.respond("look"));
}
renderAll();

// Core Game Loop
function handleCommand(raw){
  state.history.push(raw);
  const { intent, arg, npc, item, era } = parse(raw);

  // high level routing
  switch(intent){
    case "look": doLook(); break;
    case "go": doMove(arg); break;
    case "take": doTake(item || arg); break;
    case "drop": doDrop(item || arg); break;
    case "use": doUse(arg); break;
    case "talk": doTalk(npc || arg); break;
    case "time": doTime(era || arg); break;
    case "inventory": ui.system(`Inventory: ${state.inventory.map(id=>ITEMS[id].name).join(", ")||"empty"}`); break;
    case "help": showHelp(); break;
    default: ui.print(ai.respond("unknown"));
  }

  checkWin();
  renderAll();
  save(state); // autosave
}

/* Intent handlers */

function doLook(){
  ui.print(ai.respond("look"));
}

function doMove(arg){
  const dir = (arg||"").split(/\s+/)[0];
  const here = LOCATIONS[state.location];
  const dest = here.exits?.[dir];
  if (!dest){ ui.print(ai.respond("move", {dir}, {blocked:true})); return; }
  // Check lock
  const L = LOCATIONS[dest];
  if (L.locked && !state.flags.vaultOpened){ ui.warn("The vault is sealed tight."); return; }

  state.location = dest;
  ui.print(ai.respond("move", {dir}));
  // environmental flavor
  if (Math.random() < 0.25) ui.system(choice(Math.random, [
    "Somewhere, a clockwork gull laughs.",
    "A draft carries whispers that don't belong to this era.",
    "Your ChronoKey vibrates faintly."
  ]));
}

function doTake(arg){
  const id = resolveItemId(arg);
  if (!id){ ui.warn("Take what?"); return; }
  const here = LOCATIONS[state.location];
  if (!here.items?.includes(id)){ ui.warn("You don't see that here."); return; }
  if (!ITEMS[id].portable){ ui.warn("It's fixed in place."); return; }
  // take
  here.items = here.items.filter(x=>x!==id);
  state.inventory.push(id);
  ui.print(ai.respond("take",{itemId:id}));
}

function doDrop(arg){
  const id = resolveItemId(arg);
  if (!id){ ui.warn("Drop what?"); return; }
  if (!state.inventory.includes(id)){ ui.warn("You don't have that."); return; }
  state.inventory = state.inventory.filter(x=>x!==id);
  LOCATIONS[state.location].items.push(id);
  ui.print(ai.respond("drop",{itemId:id}));
}

function doTalk(arg){
  const npcId = resolveNpcId(arg);
  if (!npcId){ ui.warn("No reply."); return; }
  const here = LOCATIONS[state.location];
  if (!here.npcs?.includes(npcId)){ ui.warn("They're not here."); return; }
  ui.print(ai.respond("talk",{npcId}));
}

function doTime(arg){
  const target = String(arg||"").match(/-?\d{1,5}/)?.[0];
  if (!target || !ERAS[target]) { ui.warn("Unknown era. Try numbers like 2200, 1985, 1893, 250, -10000."); return; }
  if (!state.inventory.includes("chronokey")){ ui.warn("You need the ChronoKey to time travel."); return; }
  if (!state.flags.chronoCharged && target !== "1893"){ ui.warn("The ChronoKey is uncharged. 1893 might help."); return; }
  // travel
  state.era = target;
  state.location = ERAS[target].spawn;
  ui.print(ai.respond("time"));
}

function doUse(arg){
  const text = (arg||"").trim();
  if (!text){ ui.warn("Use what?"); return; }

  // Popular combos:
  // 1) Charge ChronoKey via Tesla Coil + Blueprint present => chronoCharged
  if (/use\s+blueprint|use\s+tesla|charge|activate/.test("use "+text)){
    if (state.era==="1893" && state.location==="dyno-lab" &&
        state.inventory.includes("blueprint") && !state.flags.chronoCharged){
      state.flags.chronoCharged = true;
      ui.print(ai.respond("use", null, {message:"The inventor tunes the coil per the blueprint. Your ChronoKey thrums—charged!"}));
      return;
    }
  }

  // 2) Craft Ancient shard: burnt-scroll + gold-leaf anywhere in 250 BCE
  if (state.era==="250" && state.inventory.includes("burnt-scroll") && state.inventory.includes("gold-leaf") && !state.flags.craftedAncient){
    state.flags.craftedAncient = true;
    give("lens-shard-ancient");
    ui.print(ai.respond("use", null, {message:"You delicately apply gold leaf to stabilize the burnt fragment—an Ancient shard coheres."}));
    return;
  }

  // 3) Craft Industrial shard: blueprint + tesla-coil (in 1893, dyno-lab)
  if (state.era==="1893" && state.location==="dyno-lab" && state.inventory.includes("blueprint") && !state.flags.craftedIndustrial){
    state.flags.craftedIndustrial = true;
    give("lens-shard-industrial");
    ui.print(ai.respond("use", null, {message:"Resonance climbs; a shard precipitates in the air, latticing into the Industrial fragment."}));
    return;
  }

  // 4) Craft Primeval shard: ice-crystal + amber-gnat in –10,000
  if (state.era==="-10000" && state.inventory.includes("ice-crystal") && state.inventory.includes("amber-gnat") && !state.flags.craftedPrimeval){
    state.flags.craftedPrimeval = true;
    give("lens-shard-primeval");
    ui.print(ai.respond("use", null, {message:"You encase organic memory in prismatic ice—the Primeval shard forms, cold and bright."}));
    return;
  }

  // 5) Open vault with 3 shards in 2200
  if (state.era==="2200" && state.location==="museum-vault"){
    const haveAll = GOAL.requiredShards.every(id => state.inventory.includes(id));
    if (haveAll && !state.flags.vaultOpened){
      state.flags.vaultOpened = true;
      // remove shards, finish lens
      for (const id of GOAL.requiredShards) takeFromInv(id);
      give("lens-socket"); // ensure present
      ui.print(ai.respond("use", null, {message:"You fit the shards into the socket. The Lens fuses with a clear tone—the vault recognizes completion."}));
      ui.print(ai.respond("win"));
      return;
    }
  }

  ui.print(ai.respond("use"));
}

/* Helpers */

function resolveItemId(str){
  if (!str) return null;
  const s = String(str).toLowerCase();
  return Object.keys(ITEMS).find(id => ITEMS[id].name.toLowerCase().includes(s) || id===s) || null;
}
function resolveNpcId(str){
  if (!str) return null;
  const s = String(str).toLowerCase();
  return Object.keys(NPCS).find(id => NPCS[id].name.toLowerCase().includes(s) || id===s) || null;
}

function give(id){
  if (!state.inventory.includes(id)) state.inventory.push(id);
}
function takeFromInv(id){
  state.inventory = state.inventory.filter(x=>x!==id);
}

function showHelp(){
  document.getElementById("helpDialog").showModal();
}

function renderAll(){
  ui.renderInventory(state.inventory, ITEMS);
  ui.renderStatus(state);
}

function checkWin(){
  if (state.flags.vaultOpened) return true;
  const atVault = state.era==="2200" && state.location==="museum-vault";
  const shards = GOAL.requiredShards;
  if (atVault && shards.every(id=>state.inventory.includes(id))){
    // Remind player to use
    ui.system("The socket waits. Maybe try: use lens.");
  }
  return false;
}

// Start-of-game flavor event
(function intro(){
  if (state.history?.length) return;
  setTimeout(()=>{
    ui.system("A maintenance AI blips: “Courier detected. Mind the paradoxes.”");
  }, 600);
})();
