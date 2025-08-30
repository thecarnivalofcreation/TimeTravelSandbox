const KEY = "chronocourier:save";

export function save(state){
  localStorage.setItem(KEY, JSON.stringify(state));
  return true;
}
export function load(){
  const s = localStorage.getItem(KEY);
  if (!s) return null;
  try { return JSON.parse(s); } catch { return null; }
}
export function exportSave(state){
  const blob = new Blob([JSON.stringify(state,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "chronocourier-save.json";
  a.click();
  URL.revokeObjectURL(url);
}
export function importSave(file){
  return new Promise((resolve,reject)=>{
    const r = new FileReader();
    r.onerror = reject;
    r.onload = ()=> {
      try { resolve(JSON.parse(r.result)); } catch(e){ reject(e); }
    };
    r.readAsText(file);
  });
}
