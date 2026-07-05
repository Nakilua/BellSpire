// The Portrait Forge: paints raster character portraits with code.
// A canvas painter (layered underpainting -> form masses -> thousands of
// flow-following brush strokes -> deliberate key/rim light -> glaze, vignette,
// canvas grain) rendered in headless Chromium and saved as a PNG asset.
// Deterministic seed so the shipped portrait is reproducible.
// Usage: node scripts/forge-portrait.mjs [outPath] [seed]
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright-core";

const outPath = resolve(process.argv[2] ?? "src/assets/portraits/bulwark-default.png");
const seed = Number(process.argv[3] ?? 77);

const page_html = `<!doctype html><meta charset="utf-8"><canvas id="c" width="512" height="512"></canvas><script>
const SEED = ${seed};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const rnd = mulberry32(SEED);
const R = (lo,hi)=>lo+rnd()*(hi-lo);
const cv = document.getElementById("c");
const x = cv.getContext("2d");
const W=512,H=512;

// --- 1. ground -------------------------------------------------------
let g = x.createLinearGradient(0,0,0,H);
g.addColorStop(0,"#140e13"); g.addColorStop(0.6,"#181019"); g.addColorStop(1,"#0b0709");
x.fillStyle=g; x.fillRect(0,0,W,H);

// warm underpainting: candleglow from below-left
g = x.createRadialGradient(190,470,20,190,470,430);
g.addColorStop(0,"rgba(233,170,92,0.34)");
g.addColorStop(0.5,"rgba(160,96,52,0.16)");
g.addColorStop(1,"rgba(120,60,40,0)");
x.fillStyle=g; x.fillRect(0,0,W,H);

// --- helpers ---------------------------------------------------------
function soft(fn, color, blur){ x.save(); x.filter = "blur("+blur+"px)"; x.fillStyle=color; x.beginPath(); fn(); x.fill(); x.restore(); }

// --- 2. form masses --------------------------------------------------
const CX=256, HEADY=225;

// shoulders / cloak
soft(()=>{ x.moveTo(40,512); x.bezierCurveTo(70,360,150,318,256,314); x.bezierCurveTo(362,318,442,360,472,512); x.closePath(); },"#241722",7);
// shield rim rising over the left shoulder (viewer left)
soft(()=>{ x.moveTo(56,512); x.bezierCurveTo(58,380,96,330,166,332); x.bezierCurveTo(150,360,140,420,146,512); x.closePath(); },"#2e2117",5);
x.save(); x.strokeStyle="rgba(215,167,86,0.55)"; x.lineWidth=7; x.filter="blur(1.5px)";
x.beginPath(); x.moveTo(62,500); x.bezierCurveTo(64,392,100,340,168,338); x.stroke(); x.restore();

// hood outer mass
soft(()=>{ x.ellipse(CX,HEADY,150,168,0,0,7); },"#2c1e29",8);
soft(()=>{ x.ellipse(CX,HEADY-40,138,130,0,Math.PI,2*Math.PI); },"#342433",9);
// hood cavity
soft(()=>{ x.ellipse(CX,HEADY+18,96,116,0,0,7); },"#181014",7);

// --- face planes, candle-lit from below-left -------------------------
// jaw and chin (brightest)
soft(()=>{ x.ellipse(CX-4,HEADY+34,46,62,-0.04,0,7); },"rgba(196,140,100,0.8)",8);
soft(()=>{ x.ellipse(CX-6,HEADY+62,42,34,-0.1,0,7); },"rgba(222,166,116,0.95)",6);
soft(()=>{ x.ellipse(CX-14,HEADY+84,30,17,-0.1,0,7); },"rgba(236,186,128,0.9)",4);
soft(()=>{ x.ellipse(CX-6,HEADY+92,24,12,-0.05,0,7); },"rgba(226,172,118,0.85)",5);
// cheek planes
soft(()=>{ x.ellipse(CX-36,HEADY+34,18,28,0.25,0,7); },"rgba(186,130,88,0.8)",7);
soft(()=>{ x.ellipse(CX+28,HEADY+38,16,26,-0.25,0,7); },"rgba(150,100,70,0.62)",8);
// nose column + underlit tip
soft(()=>{ x.ellipse(CX-4,HEADY+30,10,26,0,0,7); },"rgba(198,140,96,0.85)",4);
soft(()=>{ x.ellipse(CX-5,HEADY+48,11,8,0,0,7); },"rgba(240,192,132,0.95)",3);
// forehead, softly lit
soft(()=>{ x.ellipse(CX-4,HEADY-6,40,26,0,0,7); },"rgba(178,126,92,0.75)",7);
// gentle hood shadow only at the very crown
soft(()=>{ x.ellipse(CX,HEADY-34,66,22,0,0,7); },"rgba(16,10,13,0.85)",9);
// soft eye shading (human, not hollow)
soft(()=>{ x.ellipse(CX-26,HEADY+8,14,7,0.08,0,7); },"rgba(96,62,52,0.55)",4);
soft(()=>{ x.ellipse(CX+20,HEADY+8,13,7,-0.08,0,7); },"rgba(88,58,50,0.5)",4);
// mouth line shadow
soft(()=>{ x.ellipse(CX-6,HEADY+72,16,2.6,-0.04,0,7); },"rgba(94,52,44,0.7)",2);
// neck shadow under jaw
soft(()=>{ x.ellipse(CX-4,HEADY+104,44,20,0,0,7); },"rgba(12,7,10,0.9)",6);

// --- 3. brushify: strokes that follow the form -----------------------
const base = x.getImageData(0,0,W,H).data;
function sample(px,py){ const i=((py|0)*W+(px|0))*4; return [base[i],base[i+1],base[i+2]]; }
function flowAngle(px,py){
  const dx=px-CX, dy=py-HEADY, d=Math.hypot(dx,dy);
  if (py>340) return 0.06 + R(-0.15,0.15);                       // shoulders: horizontal
  if (d>108) return Math.atan2(dy,dx)+Math.PI/2 + R(-0.2,0.2);   // hood: circular
  return -0.5 + R(-0.35,0.35);                                    // face: diagonal planes
}
for(let i=0;i<11000;i++){
  // bias sampling toward the head
  let px,py;
  if (rnd()<0.62){ const a=R(0,6.283), rr=Math.pow(rnd(),0.7)*190; px=CX+Math.cos(a)*rr; py=HEADY+Math.sin(a)*rr*1.12; }
  else { px=R(0,W); py=R(120,H); }
  if(px<2||px>W-2||py<2||py>H-2) continue;
  const c=sample(px,py);
  const jit=R(-14,14);
  const ang=flowAngle(px,py);
  const len=R(5,16), w=R(1.2,4.6);
  x.strokeStyle="rgba("+(c[0]+jit|0)+","+(c[1]+jit*0.8|0)+","+(c[2]+jit*0.6|0)+","+R(0.10,0.30)+")";
  x.lineWidth=w; x.lineCap="round";
  x.beginPath();
  x.moveTo(px-Math.cos(ang)*len/2, py-Math.sin(ang)*len/2);
  x.quadraticCurveTo(px+R(-3,3), py+R(-3,3), px+Math.cos(ang)*len/2, py+Math.sin(ang)*len/2);
  x.stroke();
}

// --- 4. deliberate light ---------------------------------------------
// cold rim along the hood, upper right
x.save(); x.strokeStyle="rgba(168,186,214,0.5)"; x.lineCap="round"; x.filter="blur(1.2px)";
x.lineWidth=4; x.beginPath(); x.ellipse(CX,HEADY,100,112,0, -1.25, -0.3); x.stroke();
x.lineWidth=2; x.strokeStyle="rgba(190,205,228,0.6)"; x.beginPath(); x.ellipse(CX,HEADY,101,113,0, -1.1, -0.45); x.stroke();
x.restore();
// warm candle reflection on the hood's lower-left inner edge
x.save(); x.strokeStyle="rgba(226,164,96,0.35)"; x.lineCap="round"; x.filter="blur(2.5px)";
x.lineWidth=5; x.beginPath(); x.ellipse(CX,HEADY+16,92,110,0, 1.9, 2.75); x.stroke(); x.restore();
// human eyes: soft lids, dark iris, one warm candle catchlight each
function eye(ex,ey,w){
  x.save(); x.filter="blur(0.7px)";
  x.fillStyle="rgba(226,196,164,0.88)";
  x.beginPath(); x.ellipse(ex,ey,w,w*0.46,0,0,7); x.fill();
  x.fillStyle="rgba(46,30,26,0.95)";
  x.beginPath(); x.arc(ex,ey+0.3,w*0.38,0,7); x.fill();
  x.fillStyle="rgba(20,12,12,0.95)";
  x.beginPath(); x.arc(ex,ey+0.3,w*0.18,0,7); x.fill();
  x.strokeStyle="rgba(60,38,32,0.8)"; x.lineWidth=1.6; x.lineCap="round";
  x.beginPath(); x.ellipse(ex,ey-w*0.18,w*1.02,w*0.5,0, Math.PI*1.05, Math.PI*1.95); x.stroke();
  // relaxed upper lid: shade the top third of the eye
  x.fillStyle="rgba(120,82,64,0.85)";
  x.beginPath(); x.ellipse(ex,ey-w*0.3,w*1.0,w*0.28,0,Math.PI,2*Math.PI); x.fill();
  x.restore();
  x.fillStyle="rgba(255,232,186,0.95)";
  x.beginPath(); x.arc(ex-w*0.22,ey-w*0.1,1.1,0,7); x.fill();
}
eye(CX-25,HEADY+8,7.6);
eye(CX+20,HEADY+8,7.2);
// brows, calm not grim
x.save(); x.filter="blur(1px)"; x.strokeStyle="rgba(58,38,32,0.75)"; x.lineWidth=3; x.lineCap="round";
x.beginPath(); x.moveTo(CX-33,HEADY-2); x.quadraticCurveTo(CX-24,HEADY-6,CX-15,HEADY-3); x.stroke();
x.beginPath(); x.moveTo(CX+11,HEADY-3); x.quadraticCurveTo(CX+20,HEADY-6,CX+28,HEADY-2); x.stroke();
x.restore();
// candle key accents: nose tip, lower lip, jaw line
x.save(); x.filter="blur(2.2px)"; x.strokeStyle="rgba(248,206,148,0.4)"; x.lineCap="round";
x.lineWidth=3; x.beginPath(); x.moveTo(CX-11,HEADY+56); x.quadraticCurveTo(CX-4,HEADY+59,CX+1,HEADY+56); x.stroke();
x.lineWidth=2.2; x.beginPath(); x.moveTo(CX-14,HEADY+79); x.quadraticCurveTo(CX-7,HEADY+82,CX-1,HEADY+79); x.stroke();
x.restore();
// collar fold catching candlelight
soft(()=>{ x.ellipse(CX-2,HEADY+140,58,22,0,0,7); },"rgba(64,44,52,0.85)",6);
soft(()=>{ x.ellipse(CX-14,HEADY+136,30,10,-0.15,0,7); },"rgba(120,84,66,0.5)",5);
// wax-gold embroidery hinting along the hood hem (the Bulwark trim)
x.save(); x.strokeStyle="rgba(215,167,86,0.28)"; x.lineCap="round"; x.filter="blur(0.8px)";
x.lineWidth=2; x.setLineDash([7,9]);
x.beginPath(); x.ellipse(CX,HEADY+8,99,114,0, 0.6, 2.55); x.stroke();
x.setLineDash([]); x.restore();
// gold clasp at the collar
x.save(); x.translate(CX-2,HEADY+142);
x.fillStyle="rgba(20,13,10,1)"; x.beginPath(); x.arc(0,0,13,0,7); x.fill();
x.strokeStyle="rgba(215,167,86,0.9)"; x.lineWidth=2.4; x.beginPath(); x.arc(0,0,11,0,7); x.stroke();
x.strokeStyle="rgba(233,188,106,0.9)"; x.lineWidth=1.6;
x.beginPath(); x.moveTo(0,-6); x.quadraticCurveTo(5,0,0,6); x.quadraticCurveTo(-5,0,0,-6); x.stroke();
x.restore();

// --- 5. glaze, vignette, grain ---------------------------------------
x.globalCompositeOperation="overlay";
g = x.createRadialGradient(200,430,40,200,430,420);
g.addColorStop(0,"rgba(255,190,110,0.28)"); g.addColorStop(1,"rgba(0,0,0,0)");
x.fillStyle=g; x.fillRect(0,0,W,H);
x.globalCompositeOperation="multiply";
g = x.createLinearGradient(0,0,0,H);
g.addColorStop(0,"rgba(142,146,170,0.9)"); g.addColorStop(0.45,"rgba(255,255,255,1)"); g.addColorStop(1,"rgba(214,190,170,1)");
x.fillStyle=g; x.fillRect(0,0,W,H);
x.globalCompositeOperation="source-over";
g = x.createRadialGradient(CX,250,150,CX,250,380);
g.addColorStop(0,"rgba(0,0,0,0)"); g.addColorStop(1,"rgba(4,2,5,0.5)");
x.fillStyle=g; x.fillRect(0,0,W,H);
// canvas tooth
for(let i=0;i<4200;i++){
  const px=R(0,W), py=R(0,H), v=R(0,1);
  x.fillStyle = v>0.5 ? "rgba(240,228,208,"+R(0.008,0.03)+")" : "rgba(0,0,0,"+R(0.01,0.04)+")";
  x.fillRect(px,py,R(0.6,1.8),R(0.6,1.8));
}
window.__done = cv.toDataURL("image/png");
</script>`;

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM ?? "/opt/pw-browsers/chromium" });
const page = await browser.newPage();
await page.setContent(page_html, { waitUntil: "load" });
await page.waitForFunction(() => window.__done);
const dataUrl = await page.evaluate(() => window.__done);
await browser.close();

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, Buffer.from(dataUrl.split(",")[1], "base64"));
console.log(`[forge] painted ${outPath} (seed ${seed})`);
