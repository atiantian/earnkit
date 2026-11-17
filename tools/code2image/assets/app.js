// 代码截图美化工具 · 纯前端、离线可用、无外部依赖
// 付费点：默认带水印（免费），解锁后去水印 / 高清导出（演示用 unlock 模拟）

const KEYWORDS = {
  cpp: ["int","char","float","double","void","bool","auto","const","static","struct","class",
        "public","private","protected","return","if","else","for","while","do","switch","case",
        "break","continue","new","delete","using","namespace","std","include","template","typename",
        "nullptr","true","false","this","virtual","override","unsigned","long","short"],
  python: ["def","return","if","elif","else","for","while","import","from","as","class","try",
           "except","finally","with","lambda","yield","None","True","False","and","or","not","in",
           "is","pass","break","continue","global","nonlocal","assert","async","await"],
  js: ["function","return","if","else","for","while","var","let","const","class","new","import",
       "export","from","async","await","try","catch","finally","throw","typeof","instanceof",
       "this","null","undefined","true","false","switch","case","break","continue","of","in"],
  plain: []
};

const THEMES = {
  dracula: { bg:"#1e1e2e", title:"#282a36", lineNo:"#6272a4", dot:["#ff5f56","#ffbd2e","#27c93f"],
             comment:"#6272a4", string:"#f1fa8c", number:"#bd93f9", keyword:"#ff79c6",
             func:"#50fa7b", ident:"#f8f8f2", punct:"#ff79c6" },
  light: { bg:"#ffffff", title:"#f3f4f6", lineNo:"#bbbfc6", dot:["#ff5f56","#ffbd2e","#27c93f"],
           comment:"#6a737d", string:"#032f62", number:"#005cc5", keyword:"#d73a49",
           func:"#6f42c1", ident:"#24292e", punct:"#d73a49" }
};

const MONO = 'Consolas, Menlo, "Courier New", monospace';
const cv = document.getElementById("cv");
const ctx = cv.getContext("2d");
const input = document.getElementById("code");
// 默认不带水印：不引流时用户导出即为干净图片。
// 若日后想用工具做品牌曝光，把这里改成 true 即可（水印会重新出现）。
let watermarkOn = false;
let unlocked = false;

function tokenize(line, lang) {
  const kws = KEYWORDS[lang] || [];
  const kwRe = kws.length ? new RegExp("^(?:" + kws.join("|") + ")\\b", "i") : null;
  const tokens = [];
  let s = line;
  while (s.length) {
    let m, type;
    if ((m = s.match(/^(?:\/\/.*|#[^\n]*|\/\*[\s\S]*?\*\/)/))) type = "comment";
    else if ((m = s.match(/^"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/))) type = "string";
    else if ((m = s.match(/^\d+(?:\.\d+)?/))) type = "number";
    else if (kwRe && (m = s.match(kwRe))) type = "keyword";
    else if ((m = s.match(/^[A-Za-z_]\w*(?=\s*\()/))) type = "func";
    else if ((m = s.match(/^[A-Za-z_]\w*/))) type = "ident";
    else if ((m = s.match(/^\s+/))) type = "space";
    else if ((m = s.match(/^[^\\w\s]/))) type = "punct";
    else { m = [s[0]]; type = "ident"; }
    if (!m || m[0].length === 0) { m = [s[0]]; type = "ident"; } // 防御死循环
    tokens.push({ text: m[0], type });
    s = s.slice(m[0].length);
  }
  return tokens;
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function render() {
  const theme = THEMES[document.getElementById("theme").value];
  const lang = document.getElementById("lang").value;
  const fontSize = +document.getElementById("size").value;
  const lineH = Math.round(fontSize * 1.6);
  const titleH = 34, padX = 22, padY = 16, lineNoW = 34, dotR = 5;
  const code = input.value;
  const lines = code.split("\n");

  ctx.font = fontSize + "px " + MONO;
  let maxW = 0;
  for (const ln of lines) {
    const w = ctx.measureText(ln.length ? ln : " ").width;
    if (w > maxW) maxW = w;
  }
  const contentW = lineNoW + maxW + 24;
  const W = contentW + padX * 2;
  const H = titleH + lines.length * lineH + padY * 2;
  const dpr = window.devicePixelRatio || 2;
  cv.width = W * dpr; cv.height = H * dpr;
  cv.style.width = W + "px"; cv.style.height = H + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 背景 + 圆角
  roundRect(0, 0, W, H, 12);
  ctx.fillStyle = theme.bg; ctx.fill();
  // 标题栏
  ctx.save();
  roundRect(0, 0, W, titleH, 12); ctx.clip();
  ctx.fillStyle = theme.title; ctx.fillRect(0, 0, W, titleH);
  ctx.restore();
  // 三个圆点
  const dotY = titleH / 2;
  theme.dot.forEach((c, i) => {
    ctx.beginPath(); ctx.arc(padX + i * 18 + dotR, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = c; ctx.fill();
  });

  // 代码行
  ctx.font = fontSize + "px " + MONO;
  ctx.textBaseline = "alphabetic";
  lines.forEach((ln, i) => {
    const y = titleH + padY + i * lineH + fontSize;
    ctx.fillStyle = theme.lineNo;
    ctx.fillText(String(i + 1), padX, y);
    let x = padX + lineNoW;
    const tokens = tokenize(ln, lang);
    for (const t of tokens) {
      ctx.fillStyle = theme[t.type] || theme.ident;
      ctx.fillText(t.text, x, y);
      x += ctx.measureText(t.text).width;
    }
  });

  // 水印
  if (watermarkOn && !unlocked) {
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = theme.title === "#282a36" ? "#ffffff" : "#000000";
    ctx.font = "12px " + MONO;
    ctx.fillText("小赚工具箱 EarnKit", W - 150, H - 10);
    ctx.restore();
  }
}

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.add("hidden"), 1800);
}

// 水印开关联动：不引流（无水印）时隐藏"付费去水印"按钮，避免出现「没水印却要去水印」的矛盾
function syncBranding() {
  document.getElementById("unlock").style.display = watermarkOn ? "inline-block" : "none";
}
syncBranding();

// 事件
["input", "change"].forEach(ev => input.addEventListener(ev, render));
document.getElementById("lang").addEventListener("change", render);
document.getElementById("theme").addEventListener("change", render);
document.getElementById("size").addEventListener("change", render);
document.getElementById("watermark").addEventListener("change", e => {
  watermarkOn = e.target.checked;
  unlocked = false;
  syncBranding();
  render();
});

document.getElementById("unlock").addEventListener("click", () => {
  if (unlocked) { toast("已解锁，无水印导出"); return; }
  // 演示：真实部署时此处应跳转支付，支付成功回调后解锁
  unlocked = true;
  document.getElementById("watermark").checked = false;
  watermarkOn = false;
  syncBranding();
  render();
  toast("演示：已解锁高清无水印（正式版需支付 ¥9.9）");
});

document.getElementById("export").addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = "code-snippet.png";
  a.href = cv.toDataURL("image/png");
  a.click();
  toast("已导出 PNG");
});

render();
