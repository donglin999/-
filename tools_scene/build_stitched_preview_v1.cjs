// User-requested assembly of generated tiles. No independent enhancement/upscaling pass.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),folder='art_sources/chapter1_preview_v3/quality-experiments/';
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
 const p=await b.newPage();await p.goto('http://127.0.0.1:8774/review/chapter1-preview-v3/quality-comparison.html',{waitUntil:'domcontentloaded'});
 const board=JSON.parse(fs.readFileSync(path.join(root,'art_sources/chapter1_preview_v3/authoring-board-stitch-v1.json'),'utf8'));
 const data=await p.evaluate(async ({folder,scene})=>{
  const names=['tile-left-exact','tile-right-exact','tile-south-left-exact','tile-south-right-exact','tile-inn-complete'];
  const imgs=await Promise.all(names.map(async n=>{const i=new Image();i.src='/'+folder+n+'.png';await i.decode();return i}));
  const c=document.createElement('canvas');c.width=3072;c.height=2048;
  const g=c.getContext('2d');g.scale(2,2);g.imageSmoothingEnabled=false;
  function draw(i,x,y,poly){g.save();g.beginPath();poly.forEach(([a,b],j)=>j?g.lineTo(a,b):g.moveTo(a,b));g.closePath();g.clip();g.drawImage(imgs[i],x,y,832,555);g.restore()}
  // No alpha crossfade on structures: each pixel has exactly one source owner.
  const v=[[806,0],[806,80],[812,110],[806,290],[812,355],[826,385],[826,540]];
  const h=[[0,554],[450,554],[485,540],[1536,540]];
  draw(0,0,0,[[0,0],...v,[485,540],[450,554],[0,554]]);
  draw(1,704,0,[...v,[1536,540],[1536,0]]);
  draw(2,0,469,[...h.slice(0,3),[830,540],[830,780],[820,860],[740,910],[740,1024],[0,1024]]);
  draw(3,704,469,[[830,540],[1536,540],[1536,1024],[740,1024],[740,910],[820,860],[830,780]]);
  // The inn straddles the row boundary: use one complete generated object instead.
  draw(4,704,350,[[900,380],[1536,380],[1536,730],[1400,730],[1400,695],[1155,695],[1155,716],[1030,716],[1030,685],[900,685]]);
  // Blend the ownership masks only on ground. Buildings, trunks, crowns and
  // walls retain one source, so overlapping generated geometry cannot ghost.
  const W=c.width,H=c.height,N=W*H,hard=g.getImageData(0,0,W,H);
  const polygons=[[[0,0],...v,[485,540],[450,554],[0,554]],
   [...v,[1536,540],[1536,0]],
   [...h.slice(0,3),[830,540],[830,780],[820,860],[740,910],[740,1024],[0,1024]],
   [[830,540],[1536,540],[1536,1024],[740,1024],[740,910],[820,860],[830,780]],
   [[900,380],[1536,380],[1536,730],[1400,730],[1400,695],[1155,695],[1155,716],[1030,716],[1030,685],[900,685]]];
  const mc=document.createElement('canvas');mc.width=W;mc.height=H;
  const mg=mc.getContext('2d',{willReadFrequently:true});
  const path=poly=>{mg.beginPath();poly.forEach(([x,y],j)=>j?mg.lineTo(x*2,y*2):mg.moveTo(x*2,y*2));mg.closePath()};
  const masks=polygons.map((poly,i)=>{
   mg.clearRect(0,0,W,H);mg.fillStyle='white';path(poly);mg.fill();
   // The complete inn replaces every lower ownership mask.
   if(i<4){mg.globalCompositeOperation='destination-out';path(polygons[4]);mg.fill();mg.globalCompositeOperation='source-over'}
   const a=mg.getImageData(0,0,W,H).data, m=new Float32Array(N);
   for(let j=0;j<N;j++)m[j]=a[j*4+3]/255;return m;
  });
  function blur(a,r){const t=new Float32Array(N),o=new Float32Array(N);
   for(let y=0;y<H;y++){let sum=0;for(let x=-r;x<=r;x++)sum+=a[y*W+Math.max(0,Math.min(W-1,x))];for(let x=0;x<W;x++){t[y*W+x]=sum/(2*r+1);sum+=a[y*W+Math.min(W-1,x+r+1)]-a[y*W+Math.max(0,x-r)]}}
   for(let x=0;x<W;x++){let sum=0;for(let y=-r;y<=r;y++)sum+=t[Math.max(0,Math.min(H-1,y))*W+x];for(let y=0;y<H;y++){o[y*W+x]=sum/(2*r+1);sum+=t[Math.min(H-1,y+r+1)*W+x]-t[Math.max(0,y-r)*W+x]}}return o;
  }
  const soft=masks.map(m=>blur(m,48));
  mg.clearRect(0,0,W,H);mg.fillStyle='white';mg.strokeStyle='white';mg.lineWidth=16;mg.lineJoin='round';
  // Short wall bounds can include bare soil in a generated variant. Protect
  // their masonry pixels, not the entire conservative collision rectangle.
  for(const o of [...scene.obstacles,...scene.foreground]){
   const ys=o.polygon.map(p=>p[1]);if(Math.max(...ys)-Math.min(...ys)>50)continue;
   mg.fillStyle=mg.strokeStyle='#00ff00';path(o.polygon);mg.fill();mg.stroke();
  }
  for(const o of [...scene.obstacles,...scene.foreground]){
   const ys=o.polygon.map(p=>p[1]);if(Math.max(...ys)-Math.min(...ys)<=50)continue;
   mg.fillStyle=mg.strokeStyle='#ff0000';path(o.polygon);mg.fill();mg.stroke();
  }
  const protectedPixels=mg.getImageData(0,0,W,H).data;
  const origins=[[0,0],[704,0],[0,469],[704,469],[704,350]];
  const pixels=imgs.map((im,i)=>{mg.clearRect(0,0,W,H);mg.drawImage(im,origins[i][0]*2,origins[i][1]*2,1664,1110);return mg.getImageData(0,0,W,H).data});
  const solid=(r,gg,b)=>(Math.max(r,gg,b)-Math.min(r,gg,b)<45&&r<175)||(r>gg*1.05&&gg<130&&b<100);
  function smallStructure(k){
   if(!solid(hard.data[k],hard.data[k+1],hard.data[k+2]))return false;
   let count=0;const j=k/4,x=j%W,y=Math.floor(j/W);
   for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
    if(x+dx<0||x+dx>=W||y+dy<0||y+dy>=H)continue;
    const n=((y+dy)*W+x+dx)*4;if(solid(hard.data[n],hard.data[n+1],hard.data[n+2]))count++;
   }
   // Reject isolated dark cut-line pixels instead of treating them as walls.
   return count>=13;
  }
  for(let j=0;j<N;j++){
   const k=j*4;
   if(protectedPixels[k]>128)continue;
   if(protectedPixels[k+1]>128){
    if(smallStructure(k))continue;
   }
   let sum=0,r=0,gg=0,b=0,contributors=0;
   for(let i=0;i<5;i++){const weight=soft[i][j]*(pixels[i][k+3]/255);if(weight>.002){sum+=weight;r+=pixels[i][k]*weight;gg+=pixels[i][k+1]*weight;b+=pixels[i][k+2]*weight;contributors++}}
   if(sum>.01&&contributors>1){hard.data[k]=r/sum;hard.data[k+1]=gg/sum;hard.data[k+2]=b/sum;}
  }
  // The central road was regenerated as one shared surface. Consume only
  // ground pixels; the original complete objects and gameplay bounds stay.
  const repair=new Image();repair.src='/'+folder+'seam-repaired-ground.png';await repair.decode();
  mg.clearRect(0,0,W,H);mg.drawImage(repair,1300,938,1110,1110);
  const repaired=mg.getImageData(0,0,W,H).data;
  for(let y=938;y<H;y++)for(let x=1300;x<2410;x++){
   const k=(y*W+x)*4;if(protectedPixels[k]>128)continue;
   if(protectedPixels[k+1]>128&&smallStructure(k))continue;
   const edge=Math.min(x-1300,2409-x,y-938,H-1-y);
   const t=Math.max(0,Math.min(1,edge/64)),a=t*t*(3-2*t);
   for(let channel=0;channel<3;channel++)hard.data[k+channel]=hard.data[k+channel]*(1-a)+repaired[k+channel]*a;
  }
  g.putImageData(hard,0,0);
  return c.toDataURL('image/png').split(',')[1];
 },{folder,scene:board.scenes.village});
 fs.writeFileSync(path.join(root,'art_sources/chapter1_preview_v3/village-stitched-v1.png'),Buffer.from(data,'base64'));await b.close();console.log('Assembled 4 tiles plus complete inn owner; 3072×2048 output, world bounds unchanged.');
})().catch(e=>{console.error(e);process.exitCode=1});
