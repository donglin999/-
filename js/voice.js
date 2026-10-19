'use strict';
// Static, confirmed dialogue only. No runtime provider or voice-admin dependency.
(function(){
const characters=window.GAME_VOICES?.characters||{}, aliases={};
for(const [id,ch] of Object.entries(characters))for(const name of ch.aliases||[])aliases[name]=id;
let current=null,serial=0,interaction=null;
const lastPlayed=new Map(),cooldown=20000;
function resolve(who,text,sp){
  const sprite=String(sp||'').replace(/^c_/,'').split(':')[0];
  if(sprite==='hero'||who==='萧白'||!who)return null;
  const cid=characters[sprite]?sprite:aliases[who],ch=characters[cid];
  if(!ch)return null;
  const line=ch.lines.find(l=>l.text===String(text));
  return line?{cid,ch,line}:null;
}
function stop(token){
  if(token!==undefined&&token!==current?.token)return;
  if(current){const previous=current;current=null;previous.audio.pause();previous.audio.onended=null;previous.audio.onerror=null;previous.audio.onplaying=null;previous.audio.remove();previous.finish?.();window.__audio?.voice(false)}
}
function begin(who,text,sp){
  stop();const found=resolve(who,text,sp),handle={matched:!!found,token:++serial,finished:Promise.resolve()};
  if(!found||document.hidden||!window.__audio?.started||window.__audio.muted)return handle;
  const {cid,ch,line}=found,now=performance.now();
  if(ch.voice_mode==='single'&&((interaction?.has(cid))||(lastPlayed.has(line.id)&&now-lastPlayed.get(line.id)<cooldown)))return handle;
  window.BattleVoice?.stop();
  const audio=new Audio(line.url);audio.hidden=true;audio.dataset.voiceLine=line.id;document.getElementById('game')?.appendChild(audio);window.__audio?.voice(true);audio.preload='auto';audio.volume=.85;audio.playbackRate=1;audio.preservesPitch=true;
  let settle;handle.finished=new Promise(resolve=>{settle=resolve});
  current={audio,token:handle.token,line_id:line.id,cid,finish:settle};
  audio.onplaying=()=>document.dispatchEvent(new CustomEvent('character-voice-start',{detail:{cid,line_id:line.id,url:line.url,volume:audio.volume,rate:audio.playbackRate,time:performance.now()}}));
  const finish=()=>stop(handle.token);
  audio.onended=finish;audio.onerror=finish;
  const play=audio.play();
  if(ch.voice_mode==='single'){lastPlayed.set(line.id,now);interaction?.add(cid)}
  play?.catch(()=>{finish();if(ch.voice_mode==='single'){lastPlayed.delete(line.id);interaction?.delete(cid)}});
  return handle;
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
window.CharacterVoice={begin,stop,resolve,beginInteraction(){stop();interaction=new Set()},endInteraction(){stop();interaction=null},
  get playing(){return !!current},get current(){return current?{cid:current.cid,line_id:current.line_id}:null},cooldown};
})();
