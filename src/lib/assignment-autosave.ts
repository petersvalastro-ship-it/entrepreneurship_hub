// Script injected into every assignment page. It does three things:
//  1. Autosave — stores every answer in this browser every 30 seconds (and about
//     2 seconds after a student stops typing), restores them on reload, and shows
//     a small floating "Save now" button with the last-saved time.
//  2. Uniform actions — adds the same two buttons to every assignment, at the top
//     and bottom of the page: "Submit to Pietro" and "Print / Save as PDF".
//  3. Hides each assignment's own submit/print buttons so students always see the
//     same controls, and keeps both bars out of the printed PDF.
export function withAutosave(html: string, key: string, title = 'Assignment', readOnlyAnswers?: Record<string, unknown>): string {
  if (readOnlyAnswers) return html.replace('</body>', readOnlyScript(readOnlyAnswers) + '</body>');
  const script =
    '<script>(function(){' +
    'var K="neia_autosave_' + key + '";' +
    'var TITLE=' + JSON.stringify(title) + ';' +
    'function fields(){return Array.prototype.slice.call(document.querySelectorAll("input,textarea,select")).filter(function(el){return el.type!=="submit"&&el.type!=="button"&&el.type!=="file"&&(el.name||el.id);});}' +
    'function id(el,i){return (el.name||el.id)+(el.type==="radio"?"::"+el.value:"")+"#"+(el.name||el.id?"":i);}' +
    'function save(manual){try{var d={};fields().forEach(function(el,i){d[id(el,i)]=(el.type==="checkbox"||el.type==="radio")?el.checked:el.value;});localStorage.setItem(K,JSON.stringify({t:Date.now(),d:d}));show("Saved "+new Date().toLocaleTimeString([], {hour:"numeric",minute:"2-digit",second:"2-digit"})+(manual?" \u2713":""));}catch(e){show("Could not save");}}' +
    'function restore(){try{var s=JSON.parse(localStorage.getItem(K)||"null");if(!s)return;var n=0;fields().forEach(function(el,i){var v=s.d[id(el,i)];if(v===undefined)return;if(el.type==="checkbox"||el.type==="radio")el.checked=v;else{el.value=v;if(v)n++;}});if(n)show("Restored your saved work");}catch(e){}}' +
    // ---- uniform action buttons ----
    'var CSS=""' +
    '+"#submit-button,#print-button,#retry-button,#download,#print,.print-btn,.submit,"' +
    '+"[data-template-id=\\"submit-button\\"],[data-template-id=\\"print-button\\"],[data-template-id=\\"retry-button\\"],[data-template-id=\\"download-button\\"]{display:none!important}"' +
    '+"[data-neia-actions]{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:center;max-width:780px;margin:22px auto;padding:18px 16px;border:1px solid #e6dcef;border-radius:14px;background:#fbf8fe;font-family:\'DM Sans\',sans-serif}"' +
    '+"[data-neia-actions] .cap{width:100%;margin:0 0 4px;text-align:center;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#61249a}"' +
    '+"[data-neia-actions] button{border:0;border-radius:8px;padding:15px 28px;font-family:\'DM Sans\',sans-serif;font-size:16px;font-weight:700;line-height:1;cursor:pointer}"' +
    '+"[data-neia-actions] .dl{background:#61249a;color:#fff}"' +
    '+"[data-neia-actions] .pr{background:#f5e9fa;color:#61249a}"' +
    '+"[data-neia-actions] .sb{background:#C51C63;color:#fff}"' +
    '+"[data-neia-actions] .st{width:100%;margin:2px 0 0;text-align:center;font-size:14px;font-weight:700;color:#61249a;min-height:1em}"' +
    '+"[data-neia-actions] button:hover{filter:brightness(.95)}"' +
    '+"@media print{[data-neia-actions],[data-autosave]{display:none!important}}";' +
    'function labelFor(el){' +
    'try{if(el.id){var l=document.querySelector("label[for=\'"+el.id+"\']");if(l&&l.textContent.trim())return l.textContent.trim();}}catch(e){}' +
    'if(el.closest){var w=el.closest("label");if(w&&w.textContent.trim())return w.textContent.trim();}' +
    'var p=el.previousElementSibling;if(p&&p.textContent.trim())return p.textContent.trim();' +
    'return el.name||el.id||"Answer";}' +
    'function bar(){' +
    'var w=document.createElement("div");w.setAttribute("data-neia-actions","");' +
    'var c=document.createElement("p");c.className="cap";c.textContent="Turn in your work";w.appendChild(c);' +
    'var p=document.createElement("button");p.type="button";p.className="pr";p.textContent="Print / Save as PDF";p.onclick=function(){window.print();};' +
    'var sb=document.createElement("button");sb.type="button";sb.className="sb";sb.textContent="Submit to Pietro";sb.onclick=submit;' +
    'w.appendChild(sb);w.appendChild(p);var st=document.createElement("p");st.className="st";st.setAttribute("data-neia-status","");w.appendChild(st);return w;}' +
    'function collect(){var d={};fields().forEach(function(el,i){d[id(el,i)]=(el.type==="checkbox"||el.type==="radio")?el.checked:el.value;});return d;}' +
    'function setStatus(t){Array.prototype.forEach.call(document.querySelectorAll("[data-neia-status]"),function(e){e.textContent=t;});}' +
    'function submit(){save(false);setStatus("Submitting\u2026");parent.postMessage({type:"neia-submit",key:' + JSON.stringify(key) + ',answers:collect()},"*");}' +
    'window.addEventListener("message",function(e){if(e.data&&e.data.type==="neia-submit-status")setStatus(e.data.text);});' +
    'function place(){' +
    'var a=document.querySelector("header");' +
    'if(!a){var t=document.querySelector("h1");if(t&&t.closest){var c=t.closest("section,div");if(c)a=c;}}' +
    'if(a&&a.parentNode)a.parentNode.insertBefore(bar(),a.nextSibling);else document.body.insertBefore(bar(),document.body.firstChild);' +
    'document.body.appendChild(bar());}' +
    // ---- save-now bubble ----
    'var box=document.createElement("div");box.setAttribute("data-autosave","");box.style.cssText="position:fixed;right:14px;bottom:14px;z-index:99999;display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #ddd;border-radius:999px;padding:6px 6px 6px 14px;box-shadow:0 6px 20px rgba(0,0,0,.15);font:600 13px system-ui,sans-serif;color:#414042";' +
    'var lbl=document.createElement("span");lbl.textContent="Autosave on";var b=document.createElement("button");b.type="button";b.textContent="Save now";b.style.cssText="background:#C51C63;color:#fff;border:0;border-radius:999px;padding:7px 14px;font:700 13px system-ui,sans-serif;cursor:pointer";b.onclick=function(){save(true);};box.appendChild(lbl);box.appendChild(b);' +
    'function show(t){lbl.textContent=t;}' +
    'function start(){' +
    'document.head.insertAdjacentHTML("beforeend","<style>"+CSS+"</style>");' +
    'document.body.appendChild(box);restore();place();' +
    'setInterval(function(){save(false);},30000);' +
    'var tm;document.addEventListener("input",function(){clearTimeout(tm);tm=setTimeout(function(){save(false);},2000);});' +
    'document.addEventListener("change",function(){save(false);});' +
    'window.addEventListener("beforeunload",function(){save(false);});' +
    'document.addEventListener("visibilitychange",function(){if(document.hidden)save(false);});' +
    '}' +
    'if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();' +
    '})();</script>';
  return html.replace('</body>', script + '</body>');
}

// Read-only viewer used by the Teacher Dashboard inbox: fills in a student's
// submitted answers, then locks every field and hides the student controls.
function readOnlyScript(answers: Record<string, unknown>): string {
  return '<script>(function(){var A=' + JSON.stringify(answers).replace(/</g, '\\u003c') + ';' +
    'function go(){var els=Array.prototype.slice.call(document.querySelectorAll("input,textarea,select")).filter(function(el){return el.type!=="submit"&&el.type!=="button"&&el.type!=="file"&&(el.name||el.id);});' +
    'els.forEach(function(el,i){var k=(el.name||el.id)+(el.type==="radio"?"::"+el.value:"")+"#"+(el.name||el.id?"":i);var v=A[k];' +
    'if(v!==undefined){if(el.type==="checkbox"||el.type==="radio")el.checked=!!v;else el.value=v;}' +
    'el.setAttribute("readonly","");if(el.type==="checkbox"||el.type==="radio"||el.tagName==="SELECT")el.disabled=true;});' +
    'document.head.insertAdjacentHTML("beforeend","<style>#submit-button,#print-button,#retry-button,#download,#print,.print-btn,.submit,[data-template-id=\\"submit-button\\"],[data-template-id=\\"print-button\\"],[data-template-id=\\"retry-button\\"],[data-template-id=\\"download-button\\"]{display:none!important}textarea[readonly],input[readonly]{background:#fbf8fe!important}</style>");}' +
    'if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",go);else go();})();</script>';
}
