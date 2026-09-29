# Regenerate: python3 tools_audio/gen_audio.py [slug ...]   (needs env elevenlabs_APIKEY; skips existing files unless slug given)
import os,sys,json,urllib.request
K=os.environ['elevenlabs_APIKEY'];OUT=os.path.join(os.path.dirname(__file__),'..','assets','audio')
FMT='?output_format=mp3_44100_64'
SFX={
 'amb_street':('Bustling ancient Chinese town market ambience, gentle crowd murmur, distant vendors calling, occasional wooden cart wheels on stone, songbirds, no music, seamless loop',22),
 'forge':('Blacksmith hammer striking hot iron on anvil, three metallic clanks, slight ring, outdoor',2.5),
 'kettle':('Pouring hot tea from a kettle into a ceramic cup, short',2.2),
 'step1':('Single soft footstep of cloth shoe on stone pavement, dry, very short',0.5),
 'step2':('Single light footstep on flagstone, cloth shoe, very short',0.5),
 'step3':('One quiet footstep on stone street, soft sole, very short',0.5),
 'blip':('Tiny soft wooden tick, very short UI text blip',0.5),
 'advance':('Soft paper page tap, subtle UI click, short',0.5),
 'select':('Soft wooden block knock, UI select sound, short',0.5),
 'menu_open':('Unrolling a paper scroll, short soft swish',0.8),
 'menu_close':('Rolling up a paper scroll, short soft swish',0.7),
 'chime':('Small bright bronze bell chime, pleasant item obtained jingle, short',1.2),
 'whoosh':('Soft airy whoosh transition, gentle wind swipe',1.0),
 'coin':('A few copper coins clinking into a hand, short',0.8),
}
MUSIC={'bgm_street':('Calm gentle traditional Chinese town theme, guzheng, dizi bamboo flute and pipa, peaceful ancient market town daytime, soft, slow tempo, instrumental, loopable',75000)}
def post(url,body):
  r=urllib.request.Request(url,json.dumps(body).encode(),{'xi-api-key':K,'Content-Type':'application/json'})
  return urllib.request.urlopen(r,timeout=300).read()
want=sys.argv[1:]
for s,(t,d) in SFX.items():
  f=f'{OUT}/{s}.mp3'
  if (want and s not in want) or (not want and os.path.exists(f)):continue
  open(f,'wb').write(post('https://api.elevenlabs.io/v1/sound-generation'+FMT,{'text':t,'duration_seconds':d,'prompt_influence':0.5}));print('ok',s)
for s,(t,ms) in MUSIC.items():
  f=f'{OUT}/{s}.mp3'
  if (want and s not in want) or (not want and os.path.exists(f)):continue
  try:open(f,'wb').write(post('https://api.elevenlabs.io/v1/music'+FMT,{'prompt':t,'music_length_ms':ms}));print('ok music',s)
  except Exception as e:
    print('music failed',e,getattr(e,'read',lambda:b'')()[:300]);open(f,'wb').write(post('https://api.elevenlabs.io/v1/sound-generation'+FMT,{'text':t,'duration_seconds':22,'prompt_influence':0.5}));print('fallback sfx',s)
