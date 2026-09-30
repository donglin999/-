const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../js/scene.js'),'utf8');
const rendering=source.slice(source.indexOf('function charBounds('),source.indexOf('// 角色调色：'));

function fixture(extraRows=3,extraWidth=4){
  const im={naturalWidth:30,naturalHeight:60,data:new Uint8ClampedArray(30*60*4)};
  for(let y=3;y<49;y++)for(let x=5;x<25;x++)im.data[(y*30+x)*4+3]=255;
  for(let y=57;y<57+extraRows;y++)for(let x=10;x<10+extraWidth;x++)im.data[(y*30+x)*4+3]=160;
  return im;
}
function renderer(im){
  const calls=[];const g={beginPath(){},ellipse(){},fill(){},save(){},restore(){},translate(){},scale(){},fillRect(){},drawImage(...args){calls.push(args)}};
  const context={window:{ART:{frames:{ye:4}}},g,IMG:{},RUN:{},WALK:{},IDLE:{},OPT_CHARS:[],CHAR_GRADE_OK:false,BRIGHT:true,spKey:s=>s,charH:()=>92,charImg:()=>im,ok:x=>!!x,
    document:{createElement:()=>({getContext:()=>({drawImage(){},getImageData:()=>({data:im.data})})})}};
  context.ART=context.window.ART;vm.createContext(context);vm.runInContext(rendering,context);
  return {context,calls};
}

test('body feet align with shadow despite a small detached fragment below them',()=>{
  const im=fixture(),{context,calls}=renderer(im);
  context.drawChar('ye',0,0,'r',20,0,{moving:true});
  const [image,sx,sy,sw,sh,dx,dy,dw,dh]=calls.at(-1);
  assert.equal(image,im);assert.equal(sh,49,'detached fragment must be clipped');
  assert.ok(Math.abs(dy+dh)<1e-9,'visible body must end at world foot anchor');
  assert.ok(Math.abs((49-3)*dh/sh-92)<1e-9,'body keeps adult visible height');
});

test('substantial detached lower shapes remain part of the sprite',()=>{
  const im=fixture(3,20),{context}=renderer(im);
  const box=context.charBounds(im);
  assert.equal(box.bottom,60);assert.equal(box.trimBottom,false);
});

test('ordinary transparent padding does not force a source crop',()=>{
  const im=fixture(0),{context,calls}=renderer(im);
  context.drawChar('ye',0,0,'l',0,0,{moving:false});
  assert.equal(context.charBounds(im).bottom,49);
  assert.equal(calls.at(-1).length,5);
});
