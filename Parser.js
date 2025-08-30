// Simple intent parser with synonyms and targets
import { LOCATIONS, NPCS, ITEMS, ERAS } from "./world.js";

const synonyms = {
  look:["look","l","examine","x","inspect"],
  go:["go","walk","run","move","enter","north","south","east","west","n","s","e","w"],
  take:["take","grab","pick","get"],
  drop:["drop","discard","leave"],
  use:["use","apply","activate","charge","combine","craft"],
  talk:["talk","speak","chat"],
  time:["time","travel","jump"],
  inv:["inventory","i","bag"],
  help:["help","?"]
};

function matchKeyword(input, list){
  const t = input.trim().toLowerCase();
  return list.find(k => t === k || t.startsWith(k+" "));
}

export function parse(input){
  const raw = input.trim();
  const lower = raw.toLowerCase();

  const key =
    matchKeyword(lower, synonyms.look) ? "look" :
    matchKeyword(lower, synonyms.go) ? "go" :
    matchKeyword(lower, synonyms.take) ? "take" :
    matchKeyword(lower, synonyms.drop) ? "drop" :
    matchKeyword(lower, synonyms.use) ? "use" :
    matchKeyword(lower, synonyms.talk) ? "talk" :
    matchKeyword(lower, synonyms.time) ? "time" :
    matchKeyword(lower, synonyms.inv) ? "inventory" :
    matchKeyword(lower, synonyms.help) ? "help" :
    "unknown";

  const rest = lower.replace(/^(look|l|examine|x|inspect|go|walk|run|move|enter|north|south|east|west|n|s|e|w|take|grab|pick|get|drop|discard|leave|use|apply|activate|charge|combine|craft|talk|speak|chat|time|travel|jump|inventory|i|bag|help|\?)(\s+|$)/, "").trim();

  const dirMap = {n:"north", s:"south", e:"east", w:"west"};
  if (["north","south","east","west","n","s","e","w"].includes(lower)){
    return {intent:"go", arg:dirMap[lower] || lower};
  }

  // Resolve potential NPC, item, era or location slugs
  const resolveNpc = () => {
    const found = Object.keys(NPCS).find(id => rest.includes(NPCS[id].name.toLowerCase().split(" ")[0]));
    return found || null;
  };
  const resolveItem = () => {
    const found = Object.keys(ITEMS).find(id => rest.includes(ITEMS[id].name.toLowerCase().split(" ")[0]));
    return found || null;
  };
  const resolveEra = () => {
    const all = Object.keys(ERAS);
    const byCode = all.find(e => rest.includes(e));
    if (byCode) return byCode;
    // by words like "ancient", "industrial", etc. (not strictly needed)
    if (/\bancient\b/.test(rest)) return "250";
    if (/\bindustrial\b/.test(rest)) return "1893";
    if (/\bprimeval|ice|glacier\b/.test(rest)) return "-10000";
    if (/\barcade|eighties|1985\b/.test(rest)) return "1985";
    if (/\borbital|future|2200\b/.test(rest)) return "2200";
    return null;
  };

  return { intent:key, arg:rest, npc:resolveNpc(), item:resolveItem(), era:resolveEra(), raw };
}
