#!/usr/bin/env python3
"""Deterministic scene action foley: 22050 Hz mono PCM16, seed 930.
No speech, provider API or external sample; short band-limited cloth/paper/wood cues.
"""
import math, random, struct, wave
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/'assets'/'audio'
CONFIG={'inquire':(.76,160,.22),'persuade':(.85,210,.26),'steal':(.90,115,.20),'inspect':(.90,320,.25),'spar':(.82,135,.28),'success':(.38,480,.20),'fail':(.36,110,.19)}
def generate():
    ROOT.mkdir(exist_ok=True)
    for index,(name,(duration,freq,gain)) in enumerate(CONFIG.items()):
        rng=random.Random(930+index);samples=[];low=0
        for i in range(round(duration*22050)):
            t=i/22050;k=t/duration
            low=.84*low+.16*rng.uniform(-1,1)
            envelope=math.sin(math.pi*k)**2
            pulses=.35+.65*math.sin(math.pi*k*3)**2
            tone=math.sin(2*math.pi*freq*t)*math.exp(-t*14)
            value=gain*envelope*(low*pulses*.85+tone*.15)
            samples.append(round(max(-1,min(1,value))*32767))
        with wave.open(str(ROOT/('arts_'+name+'.wav')),'wb') as f:
            f.setnchannels(1);f.setsampwidth(2);f.setframerate(22050)
            f.writeframes(struct.pack('<'+'h'*len(samples),*samples))
        print(name,len(samples)/22050,max(abs(x) for x in samples))
if __name__=='__main__':generate()
