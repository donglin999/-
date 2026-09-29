# 角色音色候选：python3 tools_audio/gen_voice_pick.py [char ...] [--force]
# 读 .env 或环境变量 MiniMax_APIKEY。已存在的 mp3 跳过；--force 重生成所指定角色。
# 输出 assets/audio/voice_pick/{char}/{cand}_{n}.mp3 + assets/audio/voice_pick/manifest.js（review/voice_pick.html 用）
# 新增角色：在 CHARS 里加一条（cands 用 V() 描述：系统 voice_id + 可选 pitch/speed 微调），再跑本脚本。
# 注：当前 Token Plan 不支持 /v1/voice_design（音色设计）与自定义音色合成；需按量余额后才能加"定制"候选。
import os,sys,json,re,time,urllib.request
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
def key():
  k=os.environ.get('MiniMax_APIKEY')
  if k:return k
  m=re.search(r'^MiniMax_APIKEY=(.+)$',open(os.path.join(ROOT,'.env')).read(),re.M);return m.group(1).strip()
K=key();API='https://api.minimaxi.com/v1';MODEL='speech-2.8-hd'
BASE=os.path.join(ROOT,'assets','audio','voice_pick')

def V(slug,vid,name,pitch=0,speed=1.0):return {'slug':slug,'voice_id':vid,'name':name,'pitch':pitch,'speed':speed}
M='Chinese (Mandarin)_'
# 常用候选组
F_YOUNG=[V('danya','danya_xuejie','淡雅学姐'),V('yujie','female-yujie-jingpin','御姐'),V('shaonv','female-shaonv-jingpin','少女'),
  V('chengshu','female-chengshu-jingpin','成熟女性'),V('gentle_senior',M+'Gentle_Senior','温柔学姐'),V('crisp_girl',M+'Crisp_Girl','清脆少女'),
  V('mature_woman',M+'Mature_Woman','傲娇御姐'),V('warm_bestie',M+'Warm_Bestie','温暖闺蜜'),V('warm_girl',M+'Warm_Girl','温暖少女'),
  V('soft_girl',M+'Soft_Girl','软软女孩'),V('arrogant_miss','Arrogant_Miss','嚣张小姐'),V('wise_women',M+'Wise_Women','阅历姐姐')]
OLD=[V('elder',M+'Humorous_Elder','搞笑大爷'),V('elder_slow',M+'Humorous_Elder','搞笑大爷·沉',-2,0.9),
  V('exec_old',M+'Reliable_Executive','沉稳高管·老',-3,0.88),V('announcer_old',M+'Male_Announcer','播报男声·老',-4,0.88),
  V('gentleman_old',M+'Gentleman','温润男声·老',-4,0.85),V('radio_old',M+'Radio_Host','电台男主播·老',-3,0.9)]
ROUGH=[V('badao','male-qn-badao-jingpin','霸道青年'),V('badao_low','male-qn-badao-jingpin','霸道青年·粗',-3,1.0),
  V('unrestrained',M+'Unrestrained_Young_Man','不羁青年'),V('stubborn',M+'Stubborn_Friend','嘴硬竹马',-2,1.0),
  V('exec',M+'Reliable_Executive','沉稳高管'),V('announcer_low',M+'Male_Announcer','播报男声·粗',-3,1.05),V('southern',M+'Southern_Young_Man','南方小哥',-2,1.0)]

CHARS=[
 {'id':'suzhi','name':'苏芷','por':'p_suzhi','group':'同伴',
  'persona':'二十岁左右的游方女医，白鹇谷出走的弟子。话极短，不解释、不诉苦，冷幽默。',
  'lines':[('按住肩。别松。','急救'),('收的。我没让。','冷幽默'),('……他们明天还会收钱。','不屑'),('这瓶子，是我师门的东西。','沉'),
           ('针只能压半日。解药，得找下毒的人要。','交代'),('我叫苏芷。你若肯帮，就去问问——他是谁，得罪了谁。','初见')],
  'cands':F_YOUNG},
 {'id':'hero','name':'主角（萧白）','por':'p_hero','group':'同伴',
  'persona':'十七八岁少年，被老僧收留，好奇、有侠气。白衣劲装，背负长剑。',
  'lines':[('那是什么毒？','发问'),('老营的弟兄，给个实在价？','讨价'),('……又梦见那条青色的龙了。','独白'),('他说：初一的船，照旧。江上多了三条生面孔的快船。','传话')],
  'cands':[V('qingse','male-qn-qingse-jingpin','青涩青年'),V('daxuesheng','male-qn-daxuesheng-jingpin','青年大学生'),V('chunzhen','chunzhen_xuedi','纯真学弟'),
           V('junlang','junlang_nanyou','俊朗男友'),V('straight',M+'Straightforward_Boy','率真弟弟'),V('pure',M+'Pure-hearted_Boy','清澈邻家弟弟'),
           V('gentle_youth',M+'Gentle_Youth','温润青年'),V('lengdan','lengdan_xiongzhang','冷淡学长')]},
 {'id':'monk','name':'老僧（默庵）','por':'p_monk','group':'第一章',
  'persona':'年迈守庙僧，早年是水军部下。慈和而有分量，身中慢性毒多年。',
  'lines':[('老衲年轻时也算半个江湖人。今日便看看你的筋骨，来，与老衲过两招。','邀战'),('阿弥陀佛。还有什么事？','问候'),
           ('老毛病了。早年在军中挨过一箭，箭头取出来了，病根没取出来。','旧伤'),('你若要闯荡江湖，就从那里开始吧。记住——拳脚是用来护人的，不是用来欺人的。','叮嘱')],
  'cands':OLD},
 {'id':'oldman','name':'说书老伯','por':'p_oldman','group':'第一章',
  'persona':'街市说书人，读过书，惜才，讲襄阳旧事。',
  'lines':[('呵呵，年轻人，多读书总没坏处。今儿讲的是岘山的故事，坐下听听？','招呼'),
           ('老汉给你讲个古：南方有种虫叫青蚨，母子分不开。拿母虫的血涂了钱花出去，那钱夜里自己会飞回来。','讲古'),
           ('羊公守襄阳，从不夜里偷营。他说，仗打得赢打不赢是一回事，人心收得住收不住是另一回事。','感慨'),
           ('那是羊公的兵法心诀，没写全。剩下的半截，听说埋在岘山上。——那是往后的事喽。','卖关子')],
  'cands':OLD},
 {'id':'boatman','name':'汤老舵','por':'p_boatman','group':'第一章',
  'persona':'东津渡老船夫，撑了四十年船。胆小怕事，被逼急了也豁得出去。',
  'lines':[('恩公头一回过江吧？这汉水看着平，底下的暗流能把人卷到樊城去。','闲话'),('是黑风寨的水匪！……坐稳了！','惊'),
           ('老汉在这渡口撑了四十年船……二十年前，也是这么个起风的天，载过一个后生。','回忆'),
           ('披着蓑衣，腰里别着短刀，一路上一句话也不说。那双眼睛——像刀子，看你一眼，你心里就发毛。','讲述')],
  'cands':OLD+[V('southern_old',M+'Southern_Young_Man','南方小哥·老',-4,0.88)]},
 {'id':'beggar','name':'吴长老（丐帮）','por':'p_beggar','group':'第一章',
  'persona':'丐帮荆襄分舵长老，装作讨饭的老叫化。嬉皮笑脸，眼神精光。',
  'lines':[('讨口饭吃哟～好心人赏几个铜板？','讨饭'),('哈哈哈，好小子，有胆色！','赞'),
           ('哎哟哟，老骨头要散了！这招「莲花落」教给你，算老叫化认栽。','认输'),('这话老叫化今晚就递给城防营。往后碰见拿竹片的，报荆襄分舵吴某的名号。','正色')],
  'cands':OLD},
 {'id':'soldier','name':'守门军士','por':'p_soldier','group':'第一章',
  'persona':'三十岁上下的城防营军士，盘查探子，粗声公事公办，心里敬重老僧。',
  'lines':[('站住！蒙古探子最近混进城里好几个，进城都得盘查。','盘查'),('……你是来消遣我的？','不耐'),
           ('羊太傅庙那个老和尚？他当年在城头救过不少弟兄。进去吧。','放行'),('……你这小子说话倒有几分道理。守城靠的是上下一心。','服气')],
  'cands':ROUGH},
 {'id':'gossip','name':'包打听（侯七）','por':'p_gossip','group':'第一章',
  'persona':'四十岁精瘦的消息贩子，眯眼笑，油滑市井，但有底线。',
  'lines':[('哟，小兄弟面生得很，第一次进城？','搭话'),('这消息可只卖给你一个人，嘘——','神秘'),
           ('耳目最灵的侯七，街坊都叫我「包打听」。江湖上的消息，只要你给得起价钱……','自夸'),('不买？那就回头再来，消息可不等人。','送客')],
  'cands':[V('unrestrained',M+'Unrestrained_Young_Man','不羁青年'),V('stubborn',M+'Stubborn_Friend','嘴硬竹马'),V('jingying','male-qn-jingying-jingpin','精英青年'),
           V('southern',M+'Southern_Young_Man','南方小哥'),V('elder',M+'Humorous_Elder','搞笑大爷',2,1.05),V('badao_shaoye','badao_shaoye','霸道少爷')]},
 {'id':'smith','name':'石铁匠','por':'p_smith','group':'第一章',
  'persona':'打铁三十年的铁匠，络腮胡赤膊，嗓门大，豪爽直肠子，自称「俺」。',
  'lines':[('不买也来看看，俺这炉火不收钱。','招揽'),('好眼力！这口剑俺淬了七遍火，出去可别给俺丢人。','夸'),
           ('铁臂帮？哼，那帮孙子上月来俺这儿打了四副铁护臂，到今儿还欠着账！','骂'),('你要去找他们麻烦？好！俺这儿的东西，今天给你便宜——啊不，价钱照旧，但俺在心里给你喝彩！','豪爽')],
  'cands':ROUGH+[V('elder',M+'Humorous_Elder','搞笑大爷')]},
 {'id':'lady','name':'柳三娘','por':'p_lady','group':'第一章',
  'persona':'中年茶摊老板娘，爱对对子，泼辣热络，叉腰挑眉。',
  'lines':[('瞧你眉清目秀的，读过书没有？','打量'),('三娘出四副上联，你都对得上，这笼羊肉馒头就送你！','出题'),
           ('哎哟，才子又来啦？三娘这儿的馒头管够！','热络'),('前天疤脸刘还放话：「不给钱，就给命。」——你说巧不巧？','嚼舌')],
  'cands':[V('antie',M+'Kind-hearted_Antie','热心大婶'),V('wise_women',M+'Wise_Women','阅历姐姐'),V('mature_woman',M+'Mature_Woman','傲娇御姐'),
           V('chengshu','female-chengshu-jingpin','成熟女性'),V('wumei','wumei_yujie','妩媚御姐'),V('arrogant_miss','Arrogant_Miss','嚣张小姐'),V('hk',M+'HK_Flight_Attendant','港普空姐')]},
 {'id':'liu','name':'疤脸刘','por':'p_bandit','group':'反派',
  'persona':'铁臂帮小头目，管街市收例钱。流氓腔，欺软怕硬，被打服就求饶。',
  'lines':[('哎，别用那眼神看我。这叫「例钱」，不叫抢。抢是黑风寨干的——我们铁臂帮，正经帮派！','狡辩'),
           ('嘿，是个愣头青。正好，爷爷手痒！','挑衅'),('废物！看爷爷的铁臂功！','战斗'),('好汉饶命！毒……毒是上头给的，我就是个跑腿的！','求饶')],
  'cands':ROUGH+[V('badao_shaoye','badao_shaoye','霸道少爷')]},
 {'id':'langli','name':'浪里鳅','por':'p_bandit','group':'反派',
  'persona':'黑风寨东岸暗桩头目，贪杯，认牌子不认人。醉醺醺的江湖腔。',
  'lines':[('站住！哪条道上的？这芦苇荡不是你来的地方。','喝止'),('哈！寨里的新兄弟？……牌子是真的。','打量'),
           ('「风起云涌」。记住喽，光报暗号不顶用，还得亮令牌——寨门那帮狗东西，只认牌子。','交代'),('令牌？嘿……老子那块挂在棚里，谁敢偷……呼……','醉')],
  'cands':ROUGH},
 {'id':'chief','name':'独眼阎罗（屠洪）','por':'p_chief','group':'反派',
  'persona':'黑风寨寨主，独眼虬髯，提鬼头大刀。凶悍粗豪，第一章 Boss。',
  'lines':[('哼，哪里来的小崽子，敢闯我黑风寨？','喝问'),('哈哈哈！好兄弟！先喝了这碗酒！','豪笑'),
           ('不知死活！老子这把鬼头刀，今天又要见血了！','战斗'),('你……你到底是什么人……','败')],
  'cands':[V('badao_low','male-qn-badao-jingpin','霸道青年·粗',-4,0.95),V('exec_low',M+'Reliable_Executive','沉稳高管·粗',-3,1.0),
           V('announcer_low',M+'Male_Announcer','播报男声·粗',-4,0.95),V('robot_low','Robot_Armor','机械战甲·粗',-3,1.0),
           V('unrestrained_low',M+'Unrestrained_Young_Man','不羁青年·粗',-4,0.95),V('elder_low',M+'Humorous_Elder','搞笑大爷·粗',-3,1.0)]},
]

def post(path,body,tries=6):
  r=urllib.request.Request(API+path,json.dumps(body).encode(),{'Authorization':'Bearer '+K,'Content-Type':'application/json'})
  for n in range(tries):
    try:d=json.loads(urllib.request.urlopen(r,timeout=180).read())
    except OSError as e:
      if n==tries-1:raise
      print('retry',path,e);time.sleep(2+3*n);continue
    c=d.get('base_resp',{}).get('status_code')
    if c in (1002,1039) and n<tries-1:print('rate limit, wait');time.sleep(20);continue
    if c:raise RuntimeError(f"{path} {d['base_resp']}")
    return d

def tts(c,text,f):
  d=post('/t2a_v2',{'model':MODEL,'text':text,'stream':False,
    'voice_setting':{'voice_id':c['voice_id'],'speed':c['speed'],'vol':1,'pitch':c['pitch']},
    'audio_setting':{'sample_rate':32000,'bitrate':128000,'format':'mp3','channel':1}})
  open(f,'wb').write(bytes.fromhex(d['data']['audio']))

args=[a for a in sys.argv[1:] if not a.startswith('--')];force='--force' in sys.argv
man={'model':MODEL,'chars':[]}
for ch in CHARS:
  out=f"{BASE}/{ch['id']}";os.makedirs(out,exist_ok=True)
  if not args or ch['id'] in args:
    for c in ch['cands']:
      for i,(t,_) in enumerate(ch['lines']):
        f=f"{out}/{c['slug']}_{i}.mp3"
        if os.path.exists(f) and not force:continue
        try:tts(c,t,f);print('ok',ch['id'],c['slug'],i,flush=True)
        except Exception as e:print('FAIL',ch['id'],c['slug'],i,e,flush=True)
  ok=[c for c in ch['cands'] if all(os.path.exists(f"{out}/{c['slug']}_{i}.mp3") for i in range(len(ch['lines'])))]
  man['chars'].append({**{k:ch[k] for k in ('id','name','por','group','persona')},
    'lines':[{'text':t,'tag':g} for t,g in ch['lines']],'cands':ok})
open(f'{BASE}/manifest.js','w').write('window.PICK='+json.dumps(man,ensure_ascii=False,indent=1)+';\n')
print('manifest',sum(len(c['cands']) for c in man['chars']),'cands')
