"""Apply wardrobe contracts without confusing a story group with membership."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
P = ROOT / 'docs/design'
BASE = ROOT / 'art_sources/story_atlas_portraits_v5'


def contracts():
    return json.loads((P / 'faction-attire.json').read_text()), json.loads((P / 'character-face-identity.json').read_text())


def apply_attire(data):
    policy, faces = contracts()
    profiles = policy['profiles']
    for faction in data['factions']:
        faction['attire'] = profiles[faction['id']]
    visitors = {'guiyun-visitor', 'ambient-white-heron-2', 'ambient-songfeng-2', 'ambient-hechuan-2', 'ambient-patrol-2', 'ambient-zhaochuan-2'}
    commissioned = {'shen-yanhui', 'ambient-patrol-0'}
    custom = {
        'qin-feiyuan': ('半透明舞者绛红纱固定肩点与衣侧、连续稍遮胸部，规则斜褶与绣边', '合体不透明舞衣、前后统一半透明红纱裹裙、连贯腰间褶线及不透明腰胯短衬；花扇，无门派徽记'),
        'ruan-qingque': ('短款交领系扣上衣与明确双裤腿的高腰布热裤', '分段工具腰带、短靴与贴身布囊；无门派徽记'),
        'ye-heng': ('朴素米麻灰色便衣与轻巧束袖', '针具、布带和药袋；无门派标记'),
        'duan-mingtang': ('赭红卷袖短褂、炭灰高腰双裤口合体热裤与赤色窄包边', '层叠布绑手、结实工具腰带、缝补布囊和缠布短靴；保留拳门劳动体态'),
        'xiao-bai': ('当前现代／乡村借衣，随剧情换阶段', '培养第一年一月正式入门后才使用归云谷练衣'),
        'qiao-xingzhou': ('卷袖短青绿工作衫与半围布', '素皮工具套、木刨；无散人统一徽记'),
        'yan-xiaolou': ('杏黄A字短裙、单一下摆和隐藏安全短裤', '象牙交领上衣、收腰带与短披帛；戏本、发带，无门派徽记'),
        'liu-hanyan': ('莲粉烟青演出长衣与演出袖', '琵琶与珍珠小饰；无散人统一徽记'),
        'wen-shutong': ('双肩完整接袖的墨黑细织薄纱短外衣、铜米金低领不透明内搭', '前后同质黑纱开衩长裙与哑黑安全短裤、铜金几何袖缘、薄平刘海低侧辫、图册与皮带固定图筒'),
        'pei-zhigu': ('古式细铜圆椭圆眼镜、低松双辫、燕麦白随意短衫与茶金承托内搭', '栗褐不透明裹式短裙与安全内衬、书签折拓和系腰布囊；无门派徽记'),
    }
    for c in data['characters'] + data['ambient']:
        cid, fid = c['id'], c['faction']
        profile = fid
        membership, allowed = ('本派成员；职级只按已确认职务配置', True)
        if cid in {'ye-heng', 'xiao-bai'}:
            profile, allowed = 'independent', False
            membership = '同行／第一年暂住，尚未拜师' if cid == 'ye-heng' else '当前开篇借衣阶段；培养第一年一月正式入门'
        elif cid in visitors:
            profile, membership, allowed = 'independent', '访客／患者／民间工作者；驻地不代表入门', False
        elif cid == 'ambient-alliance-2':
            profile, membership, allowed = 'independent', '各派来客；保留本人门派衣装，未授凭证不加公议牌', False
        elif cid in commissioned:
            membership = '民间委办／协办；允许素木凭牌，禁止官帽、补子与官阶'
        elif fid == 'alliance':
            membership = '正道盟本部办事者；组织身份，不是门派换籍'
        elif fid == 'patrol':
            membership = '巡江司办事者；差务衣按已确认职务，禁止虚构官阶'
        elif fid == 'independent':
            membership, allowed = '按本人职业着装；散人不是统一门派', False
        elif cid == 'ambient-white-heron-0' or cid == 'ambient-hechuan-0':
            membership, allowed = '本地职业服务者；门派成员身份未明确，不配职级徽记', False
        features = list(custom.get(cid, (profiles[profile]['silhouette'], profiles[profile]['collar_sleeves'])))
        if cid in visitors or cid == 'ambient-alliance-2':
            features = [c['appearance'].split(' 当前图')[0], '保留职业实用衣装与工具；不使用所在场景的成员／职级标记']
        rf = BASE / 'records' / f'{cid}.json'
        rec = json.loads(rf.read_text()) if rf.exists() else {}
        if rec.get('new_character'):
            status = '新角色职业衣装参考已作画面检查，待用户确认'
            features = rec['noncolor_features']
        elif rec.get('attire_revision'):
            status = '衣装修订参考已作画面检查，待用户确认'
            features = rec['noncolor_features']
        elif cid in policy['protected_current_portraits']:
            status = '沿用户指定／恢复的既有基准'
        else:
            status = '衣装规则已补齐；现有图尚未按本次合同逐图复验'
        c['attire'] = dict(profile=profile, profile_name=profiles[profile]['name'], membership_label=membership,
                          identifier_allowed=allowed, required_features=features, art_status=status,
                          source='faction-attire.md', reference_stage=c.get('portraitStage') or c.get('time') or '当前首次出场阶段')
        if cid in faces['profiles']:
            c['faceIdentity'] = faces['profiles'][cid] | dict(source=faces['source'],
                art_status='新角色独立五官参考已检查，待用户确认' if rec.get('new_character') else '面部修订参考已检查，待用户确认' if rec.get('face_revision') else '沿当前图的区分基准；不自动确认新稿')
        if cid in policy['revision_targets'] or cid in faces['revision_targets']:
            face = faces['profiles'].get(cid, {})
            face_text = '；'.join(face.get(k, '') for k in ['face_shape', 'brows', 'eyes', 'nose', 'mouth', 'expression'])
            hair_props = {
                'su-zhi':'原发髻与碧玉簪；近膝月白医袍、束腕窄袖、药青双缘与分格针囊；医师阶段（定妆来自已撤除的襄阳演示）',
                'wen-shutong':'乌黑肩下直发、齐眉薄平刘海、低侧细辫和素木横簪；双肩完整接袖的墨黑细织薄纱短外衣、铜米金不透明低领承托内搭、铜金几何短袖方缘、窄铜褐腰绦、前后同质墨黑开衩长纱裙与哑黑双裤腿安全短裤、灰褐软短靴；自然双腿，硬板图册、短笔、测距坠与宽皮肩带连接两端的图筒',
                'xu-lingyi':'原素簪发髻；绛青对襟长背心、米白窄袖内衫；文夹、文袋和可拆公议圆牌',
                'shen-yanhui':'黑色高马尾与灰蓝发带；靛蓝短勤衣、贴腿长裤、直护腕、案袋素木委办牌；长棍、江桥回身与柳岸柔光',
                'qiao-xingzhou':'原长辫与青发带；卷袖青绿短工衫、半围布、素皮工具套；舟舷侧坐回望、木刨与开阔河面',
                'liu-hanyan':'原黑发与珍珠小饰；莲粉烟青长袖演出衣与琵琶；驻楼演出阶段',
            }
            c['appearance'] = face_text + '；' + hair_props[cid] + '。'
    return data
