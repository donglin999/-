#!/usr/bin/env python3
"""秘籍投放表 v1：每本秘籍在哪里、以什么途径拿到（docs/design/secret-manuals.md §5，2026-10-08 用户要求“完成”）。

规则：
- 本门途径：沿用 martial-systems.json 的 obtain（导师传授时赐书；个人功法随人物篇）。
- 外派途径：按功法传承 §3.2 的外派规则——丁、丙走门派公开渠道；乙需合作许可（门派支线完成）；甲需人物篇或深交；绝不外传。
- 门派特例：归烬堂丁、丙可从交手的堂众身上缴获；清徽阁只收女弟子，男子只能在乐坊旁听入门课（丁；乐坊所在地 2026-10-19 起待安排）；归云谷是主角本门。
- 江湖散学：按候选来源投放（书铺、武馆、市井、战后领悟）。
- 内功：运行时 12 门旧原型门派心法按其门派投放；吐故纳新篇（运行 id tuna，即 v3 的 xf_tuna）培养开始时人人自得，书铺也有售。
- v3 内功（js/martial-hearts-runtime.js，2026-10-08 接入）：本门途径为拜入或传授时赐书；外派按品阶同外功——丙公开渠道、乙合作许可、甲人物篇或深交、绝不外传；
  个人技能（叶蘅家传《归藏息经》）只能请教，不出秘籍。
- 个人技能（个人篇功法）只能向本人请教获得，不出秘籍（2026-10-08 用户确认）：表中 manual=false、途径为“请教”。
具体日期、导师在场与失败出口仍按事件排期系统逐条登记；本表只定“在哪、什么途径、什么条件”。
输出：docs/design/martial-review/manual-placement.json、docs/design/manual-placement.md、js/martial-manual-sources.js（道具说明里的“来源”）。
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/design'
SYS = json.loads((DOC / 'martial-review/martial-systems.json').read_text())

# 门派公开渠道（丁、丙外派）与驻地（方位以门派文档为准，精确地点留给事件排期）
SECT = {
    'guiyun': ('归云谷', '归云谷', None),
    'white-heron': ('白鹇谷', '白鹇谷诊所与外出行医点', '随白鹇谷义诊协助三次后，医案执事赠书'),
    'zhaochuan': ('照川剑派', '荆襄周边照川山门', '照川公开试艺通过后赠书'),
    'hechuan': ('合川拳门', '河运城镇拳馆', '在合川拳馆交学费习满一月后赠书'),
    'songfeng': ('松风观', '松风山观与沿途客舍', '在观中挂单、随早课一旬后赠书'),
    'guijintang': ('玄烛会·归烬堂', '归烬堂各处堂口', '击败持书的归烬堂堂众后缴获'),
    'patrol': ('巡江司', '巡检衙署与巡查站', '协助巡江司差务三次后，教头赠书'),
    'alliance': ('正道盟', '待安排', '正道盟联络院公开讲习后领取（地点待安排）'),
    'qinghui': ('清徽阁', '岘山南麓清徽阁', '在乐坊旁听清徽阁入门课后，经阁中同意抄得（只限丁级；乐坊所在地待安排）'),
}
COOP = {  # 乙级外派：合作许可
    'white-heron': '完成白鹇谷合作支线、取得医案执事许可', 'zhaochuan': '完成照川剑派合作支线、取得掌门许可', 'hechuan': '完成合川拳门合作支线、取得门主许可',
    'songfeng': '完成松风观合作支线、取得观主许可', 'guijintang': '完成归烬堂合作支线、取得堂主许可', 'patrol': '取得巡江司差务协同资格',
    'alliance': '以正道盟协同身份完成一件盟务', 'qinghui': '清徽阁不对男子外传乙级以上功法；女同伴可经阁主许可学习',
}
FRIEND = {  # 甲级外派：人物篇或深交
    'white-heron': '苏芷个人篇或深交', 'zhaochuan': '唐照雪个人篇或深交', 'hechuan': '段明棠或石长庚个人篇', 'songfeng': '闻疏桐个人篇或深交',
    'guijintang': '岑霜或戚铮个人篇', 'patrol': '沈雁回个人篇或深交', 'alliance': '徐令仪个人篇', 'qinghui': '不对男子外传；柳含烟相关篇章另定',
}
JIANGHU_PLACE = {'art_jh_fuhu': ('待安排', '切磋', '在武馆或镖局切磋连胜三场后获赠'),
                 'art_jh_liuye': ('待安排', '购买', '书铺有售'),
                 'art_jh_lianhua': ('待安排', '传授', '帮乞儿与说唱艺人解围后获赠'),
                 'art_jh_shuaibei': ('待安排', '传授', '市井乞儿传授时赠书'),
                 'art_jh_bianfa': ('山村', '传授', '山村牧人传授时赠书'),
                 'art_jh_guafeng': ('待安排', '战后领悟', '原为击败旧襄阳演示红冠将军后从其遗物中得到，获取方式待安排')}
INNER_SECT = {'yuquan': ('玉泉寺', '玉泉寺'), 'gaibang': ('丐帮', '待安排'), 'lumen': ('鹿门书院', '鹿门山书院'),
              'taihe': ('太和观', '太和观'), 'yiyong': ('京湖义勇', '义勇营'), 'baixian': ('白鹇谷', '白鹇谷')}
INNER = [  # (id, 名称, 门派, 主修/辅修)
    ('tuna', '吐故纳新篇', None, 'main'), ('yq_xin', '玉泉心经', 'yuquan', 'main'), ('yq_shi', '石佛功', 'yuquan', 'sub'),
    ('gb_xin', '百衲功', 'gaibang', 'main'), ('gb_shi', '市井身', 'gaibang', 'sub'), ('lm_xin', '浩然诀', 'lumen', 'main'),
    ('lm_bo', '博闻', 'lumen', 'sub'), ('th_xin', '太和玄功', 'taihe', 'main'), ('th_zuo', '坐忘', 'taihe', 'sub'),
    ('yy_xin', '军中吐纳', 'yiyong', 'main'), ('yy_zhen', '行伍阵', 'yiyong', 'sub'), ('bx_xin', '本草经', 'baixian', 'main'), ('bx_du', '毒经', 'baixian', 'sub')]


def ext_rows():
    out = []
    for a in [s for s in SYS['systems'] if s.get('category') == 'external']:
        g = a['group']
        if g == 'jianghu':   # 攻击招式扩充 v1 的江湖散学：单门功法，人人可得，取得方式见 attack-expansion-v1.md §7（待事件排期）
            pl = a['placement']
            out.append({'item': 'mj_' + a['id'], 'art': a['id'], 'name': a['name'], 'kind': '外功', 'grade': a['grade'], 'sect': '江湖散学', 'manual': True,
                        'primary': {'type': pl['type'], 'where': pl['where'], 'how': pl['how']}, 'outsider': {'type': '同左', 'how': '人人可得'}})
            continue
        sect, place, public = SECT[g]
        personal = a.get('access') == 'personal'
        ob = a.get('obtain', '')
        primary = {'type': '领悟' if '领悟' in ob else '人物篇' if personal else '师门传授', 'where': place,
                   'how': ob + ('；领悟后自录成书' if '领悟' in ob else '' if personal else '；传授时赐书')}
        grade = a['grade']
        if personal:
            out.append({'item': None, 'art': a['id'], 'name': a['name'], 'kind': '外功', 'grade': grade, 'sect': sect, 'manual': False,
                        'primary': {'type': '请教', 'where': place, 'how': ob.replace('（个人）', '') + '；只能向本人请教，不出秘籍'}, 'outsider': {'type': '请教', 'how': '同左'}})
            continue
        if g == 'guiyun':
            outsider = {'type': '—', 'how': '主角本门；同伴可借读主角的书'}
        elif grade == '绝':
            outsider = {'type': '不外传', 'how': '只随本门或人物篇取得'}
        elif grade in '丁丙':
            if g == 'qinghui' and grade == '丙':
                outsider = {'type': '不外传', 'how': '清徽阁只对男子开放丁级旁听'}
            else:
                outsider = {'type': '缴获' if g == 'guijintang' else '公开渠道', 'how': public}
        elif grade == '乙':
            outsider = {'type': '合作许可', 'how': COOP[g]}
        else:
            outsider = {'type': '人物篇或深交', 'how': FRIEND[g]}
        out.append({'item': 'mj_' + a['id'], 'art': a['id'], 'name': a['name'], 'kind': '外功', 'grade': grade, 'sect': sect,
                    'manual': True, 'primary': primary, 'outsider': outsider})
    for j in SYS['jianghu_candidates']:
        where, typ, how = JIANGHU_PLACE[j['id']]
        out.append({'item': 'mj_' + j['id'], 'art': j['id'], 'name': j['name'], 'kind': '外功', 'grade': j['grade'], 'sect': '江湖散学',
                    'manual': True, 'primary': {'type': typ, 'where': where, 'how': how}, 'outsider': {'type': '同左', 'how': '人人可得'}})
    return out


def inner_rows():
    out = []
    for iid, name, sect, slot in INNER:
        if not sect:
            out.append({'item': 'mj_xf_' + iid, 'art': iid, 'name': name, 'kind': '内功', 'grade': '丁', 'sect': '通用', 'manual': True,
                        'primary': {'type': '自得', 'where': '—', 'how': '培养开始时人人自得；书铺也有售（地点待安排）'}, 'outsider': {'type': '同左', 'how': '人人可得'}})
            continue
        sn, place = INNER_SECT[sect]
        out.append({'item': 'mj_xf_' + iid, 'art': iid, 'name': name, 'kind': '内功', 'grade': '丙' if slot == 'main' else '丁', 'sect': sn, 'manual': True,
                    'primary': {'type': '师门传授', 'where': place, 'how': f'拜入{sn}或与其弟子深交后赐书' if slot == 'main' else f'{sn}弟子随手相授'},
                    'outsider': {'type': '交情' if slot == 'main' else '公开渠道', 'how': f'{sn}好感达到“相熟”后赠书' if slot == 'main' else (f'在{place}帮一次忙后获赠' if place != '待安排' else f'在{sn}分舵帮一次忙后获赠（地点待安排）')}})
    return out


# v3 内功的本门途径（地点沿用 SECT；取得描述来自 catalog.json 的 obtain，清徽阁两门另写）
V3_HOW = {'xf_qinghui': '入清徽阁后随琴课传授', 'xf_xisheng': '清徽阁弟子习满琴笛基础后由阁中传授'}
V3_PLACE = {'independent': ('通用', '江湖各处'), 'ye': ('叶蘅家传', '叶蘅身边')}


def v3_inner_rows():
    cat = json.loads((DOC / 'martial-review/catalog.json').read_text())['hearts']
    lin = json.loads((DOC / 'martial-review/lineage-v3-moves.json').read_text())['hearts']
    out = []
    for h in cat + lin:
        if h['id'] == 'xf_tuna':  # 即运行中的 tuna，已在旧表
            continue
        g, grade, ob = h['group'], h['grade'], h.get('obtain') or V3_HOW.get(h['id'], '')
        sect, place, public = SECT[g] if g in SECT else (*V3_PLACE[g], None)
        base = {'item': 'mj_xf_' + h['id'], 'art': h['id'], 'name': h['name'], 'kind': '内功', 'grade': grade, 'sect': sect, 'v3': True}
        if g == 'ye':  # 家传个人技能：只能请教
            out.append({**base, 'item': None, 'manual': False, 'primary': {'type': '请教', 'where': place, 'how': ob + '；只能向叶蘅请教，不出秘籍'}, 'outsider': {'type': '请教', 'how': '同左'}})
            continue
        if g == 'independent':
            primary = {'type': '传授', 'where': place, 'how': ob + '；共同练习时抄录成书'}
        elif g in ('alliance', 'patrol'):
            primary = {'type': '协同传授', 'where': place, 'how': ob + '；传授时赐书'}
        else:
            primary = {'type': '师门传授', 'where': place, 'how': f'拜入{sect}或受传授时赐书（{ob}）'}
        if g == 'guiyun':
            outsider = {'type': '—', 'how': '主角本门；同伴可借读主角的书'}
        elif g == 'independent':
            outsider = {'type': '同左', 'how': '散人同伴各自传授'}
        elif grade == '绝':
            outsider = {'type': '不外传', 'how': '只随本门或人物篇取得'}
        elif grade in '丁丙':
            if g == 'qinghui':
                outsider = {'type': '不外传', 'how': '清徽阁只对男子开放丁级旁听'}
            else:
                outsider = {'type': '缴获' if g == 'guijintang' else '公开渠道', 'how': public}
        elif grade == '乙':
            outsider = {'type': '合作许可', 'how': COOP[g]}
        else:
            outsider = {'type': '人物篇或深交', 'how': FRIEND[g]}
        out.append({**base, 'manual': True, 'primary': primary, 'outsider': outsider})
    return out


def main():
    rows = ext_rows() + inner_rows() + v3_inner_rows()
    books = [r for r in rows if r['manual']]
    (DOC / 'martial-review/manual-placement.json').write_text(json.dumps({'version': 'MANUAL-PLACEMENT-1', 'date': '2026-10-08', 'count': len(books), 'manuals': rows}, ensure_ascii=False, indent=2) + '\n')
    src = {r['item']: ('；'.join(x for x in [f"{r['primary']['type']}·{r['primary']['where']}：{r['primary']['how']}" if r['primary']['where'] != '—' else f"{r['primary']['type']}：{r['primary']['how']}",
                                            '' if r['outsider']['type'] in ('同左', '—') else f"外派：{r['outsider']['how']}"] if x)) for r in books}
    (ROOT / 'js/martial-manual-sources.js').write_text('/* 由 tools_docs/build_manual_placement.py 生成，勿手改。秘籍来源（道具说明显示）。 */\nwindow.MartialManualSources=' + json.dumps(src, ensure_ascii=False, indent=0) + ';\n')
    L = ['# 秘籍投放表 v1', '', '状态：现行　最后核对：2026-10-19（原记：**设计定稿，2026-10-08**（用户要求“完成”秘籍投放）。由 `tools_docs/build_manual_placement.py` 生成，数据在 `martial-review/manual-placement.json`；运行时道具说明的“来源”取自 `js/martial-manual-sources.js`。规则见[秘籍](secret-manuals.md)。）', '',
         '## 投放原则', '',
         '- **本门途径**：门派功法在导师传授时赐书（沿用功法数据的取得描述）；个人功法随对应人物篇。',
         '- **外派途径**按品阶：丁、丙走门派公开渠道（试艺、讲习、义诊协助、拳馆学费等）；乙要完成该门派合作支线取得许可；甲要对应同伴的人物篇或深交；绝不外传。',
         '- **门派特例**：归烬堂的丁、丙可以从交手的堂众身上缴获；清徽阁只收女弟子，男子只能在乐坊旁听入门课抄得丁级（乐坊所在地待安排），乙级以上不对男子外传；归云谷是主角本门。',
         '- **江湖散学**：书铺、武馆镖局、市井、战后遗物，人人可得。',
         '- **内功**：旧原型 12 门门派心法按门派投放；《吐故纳新篇》（运行 id `tuna`）培养开始时人人自得。v3 心法（2026-10-08 接入运行时，见[内功接入运行时](martial-review/hearts-runtime.md)）本门途径为拜入或传授时赐书，外派按品阶同外功：丙公开渠道、乙合作许可、甲人物篇或深交、绝不外传；叶蘅家传《归藏息经》只能请教。',
         '- **个人技能**（个人篇功法）只能向本人请教获得，不出秘籍；表中途径写“请教”，秘籍一栏为“—”。',
         '- 拿到秘籍仍要满足前置重数与属性门槛才能学会；具体日期、导师在场与失败出口按[事件排期](event-scheduling-system.md)逐条登记，不能用离场 NPC 堵死唯一来源——每本门派秘籍都同时列出本门与外派两条途径（不外传的除外）。', '']
    for kind in ['外功', '内功']:
        L += [f'## {kind}', '', '| 功法 | 门派 | 品阶 | 秘籍 | 本门途径 | 地点 | 外派途径 |', '| --- | --- | --- | --- | --- | --- | --- |']
        for r in [r for r in rows if r['kind'] == kind]:
            o = r['outsider']
            L.append(f"| 《{r['name']}》 | {r['sect']} | {r['grade']} | {'有' if r['manual'] else '—'} | {r['primary']['type']}：{r['primary']['how']} | {r['primary']['where']} | {o['type']}{'：' + o['how'] if o['how'] and o['type'] not in ('同左',) else ''} |")
        L.append('')
    (DOC / 'manual-placement.md').write_text('\n'.join(L))
    print(json.dumps({'秘籍': len(books), '只能请教': len(rows) - len(books), '外功': sum(r['kind'] == '外功' for r in rows), '内功': sum(r['kind'] == '内功' for r in rows)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
