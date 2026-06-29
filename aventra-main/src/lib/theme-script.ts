/** Inline blocking script — runs before paint to avoid theme flash (FOUC). */
export const THEME_INIT_SCRIPT = `(function(){
  var attribute="class";
  var storageKey="aventra-theme";
  var defaultTheme="system";
  var themes=["light","dark"];
  var enableSystem=true;
  var enableColorScheme=true;
  var doc=document.documentElement;
  function apply(resolved){
    doc.classList.remove("light","dark");
    doc.classList.add(resolved);
    if(enableColorScheme) doc.style.colorScheme=resolved;
  }
  function systemTheme(){
    return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
  }
  try{
    var stored=localStorage.getItem(storageKey)||defaultTheme;
    var resolved=enableSystem&&stored==="system"?systemTheme():stored;
    if(themes.indexOf(resolved)!==-1||resolved==="dark"||resolved==="light") apply(resolved);
  }catch(e){}
})();`;
