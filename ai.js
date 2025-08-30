import { choice, rng } from "./utils.js";
import { ERAS, LOCATIONS, ITEMS, NPCS, GOAL } from "./world.js";

/**
 * Lightweight AI-ish responder.
 * - Intent scoring (look/move/take/use/talk/time/any)
 * - Narrative templates w/ tone ("mood")
 * - Dynamic hints based on world state and difficulty
 */
export class AIResponder {
  constructor(state){
    this.state = state;
    this.rand = rng(state.seed || "chronocourier");
  }

  setMood(mood){ this.state.mood = mood; }
  setDifficulty(d){ this.state.difficulty = d; }

  describeLocation(loc){
    const L = LOCATIONS[loc];
    const items = (L.items||[]).filter(id => !ITEMS[id].hidden);
    const exits = Object.keys(L.exits||{});
    const npcs = (L.npcs||[]).map(id => NPCS[id].name);
    const bits = [];
    bits.push(`${L.name} — ${L.desc}`);
    if (items.length) bits.push(`You see: ${items.map(i=>ITEMS[i].name).join(", ")}.`);
    if (npcs.length) bits.push(`Nearby: ${npcs.join(", ")}.`);
    if (exits.length) bits.push(`Exits: ${exits.join(", ")}.`);
    if (L.locked) bits.push(`A secure lock bars further access.`);
    return bits.join(" ");
  }

  moodWrap(text){
    const m = this.state.mood || "neutral";
    const variants = {
      neutral: text,
      curious: `${text} Curiosity prickles at the edges.`,
      wry: `${text} The universe smirks, as if it knows a spoiler.`,
      ominous: `${text} Somewhere, a clock ticks with bad intentions.`
    };
    return variants[m] || text;
  }

  hint(){
    if (this.state.difficulty === "hard") return null;
    const s = this.state;
    const has = (id)=> s.inventory.includes(id);
    const shardCount = GOAL.requiredShards.filter(id=>has(id)).length;

    // Contextual hint ladder
    if (!has("chronokey")) return "Find the ChronoKey in 2200 to travel through time.";
    if (!s.flags.chronoCharged) return "Charge the ChronoKey—someone in 1893 might help.";
    if (shardCount === 0) return "Ancient, Industrial, and Primeval shards are hidden across eras.";
    if (!has("lens-shard-ancient")) return "Gold leaf can mend a burnt fragment—perhaps in 250 BCE.";
    if (!has("lens-shard-industrial")) return "A blueprint could tune a Tesla coil’s resonance in 1893.";
    if (!has("lens-shard-primeval")) return "Organic primeval matter with prismatic ice could stabilize a shard.";
    if (!s.flags.vaultOpened) return "Return the shards to the vault in 2200.";
    return null;
  }

  narrator(line){
    const add = this.hint();
    return this.moodWrap(add ? `${line} Hint: ${add}` : line);
  }

  // Core response entry
  respond(intention, payload, extra={}) {
    const s = this.state;
    switch(intention){
      case "look": {
        return this.narrator(this.describeLocation(s.location));
      }
      case "talk": {
        const npcId = payload?.npcId;
        if (!npcId) return "Talk to whom?";
        const npc = NPCS[npcId];
        if (!npc) return "You hear only your own echo.";
        return this.narrator(choice(this.rand, npc.lines));
      }
      case "move": {
        if (extra?.blocked) return "That way is blocked.";
        return this.narrator(`You head ${payload?.dir || "onward"} to ${LOCATIONS[s.location].name}.`);
      }
      case "take": {
        return this.narrator(`Taken: ${ITEMS[payload.itemId].name}.`);
      }
      case "drop": {
        return this.narrator(`Dropped: ${ITEMS[payload.itemId].name}.`);
      }
      case "use": {
        return this.narrator(extra?.message || "You try, and something subtle changes in the timelines.");
      }
      case "time": {
        const era = ERAS[s.era]?.name || s.era;
        return this.narrator(`Time skews. You arrive in ${era}.`);
      }
      case "win": {
        return "As the shards fuse, light bends and history exhales. The Continuum Lens hums—balance restored. You win! ✔️";
      }
      default:
        return this.moodWrap(choice(this.rand, [
          "The timeline wobbles, unimpressed.",
          "Not sure that computes—try another phrasing.",
          "Time listens, but offers no answer."
        ]));
    }
  }
}
