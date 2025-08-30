import { htmlEscape } from "./utils.js";

export class UI {
  constructor({outEl, invEl, statusEl, inputEl}){
    this.outEl = outEl; this.invEl = invEl; this.statusEl = statusEl; this.inputEl = inputEl;
  }
  print(text, cls="ai"){
    const p = document.createElement("p");
    p.className = cls;
    p.innerHTML = htmlEscape(text);
    this.outEl.appendChild(p);
    this.outEl.scrollTop = this.outEl.scrollHeight;
  }
  system(text){ this.print(text, "system"); }
  warn(text){ this.print(text, "warn"); }

  renderInventory(items, itemDefs){
    this.invEl.innerHTML = "";
    if (!items.length){
      this.invEl.innerHTML = `<li class="muted">Empty</li>`;
      return;
    }
    for (const id of items){
      const li = document.createElement("li");
      li.textContent = itemDefs[id]?.name || id;
      this.invEl.appendChild(li);
    }
  }
  renderStatus(state){
    const lines = [
      `Era: ${state.era}`,
      `Location: ${state.location}`,
      `ChronoKey: ${state.flags.chronoCharged ? "Charged" : "Uncharged"}`,
      `Shards: ${state.inventory.filter(x=>x.startsWith("lens-shard")).length}/3`
    ];
    this.statusEl.textContent = lines.join("\n");
  }
  focus(){ this.inputEl.focus(); }
}
