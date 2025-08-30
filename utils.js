export const rng = (seedStr = "chronocourier") => {
  // Mulberry32 from seed hash
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

export const choice = (r, arr) => arr[Math.floor(r() * arr.length)];

export function htmlEscape(s) {
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

export function titleCase(s){ return s.replace(/\b\w/g, c => c.toUpperCase()); }

export function shallowClone(obj){ return JSON.parse(JSON.stringify(obj)); }

export function slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
