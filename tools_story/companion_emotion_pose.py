"""Explicit emotion and body-language pairings for dialogue portraits."""
COMMON_POSES = {'smile': 'greet', 'worry': 'listen', 'firm': 'boundary', 'surprise': 'listen', 'hurt': 'listen'}
PERSONAL_POSES = {
 'ye-heng':'listen','su-zhi':'reflect','tang-zhaoxue':'reflect',
 'duan-mingtang':'listen','wen-shutong':'reflect','cen-shuang':'greet',
 'xu-lingyi':'listen','shen-yanhui':'listen','yan-xiaolou':'greet',
 'qiao-xingzhou':'greet','liu-hanyan':'listen','qin-feiyuan':'greet',
 'ruan-qingque':'reflect','shi-changgeng':'greet','qi-zheng':'reflect',
 'lu-heng':'reflect','huo-zhuchen':'reflect'}
INTENTS = {
 'smile':'开心认可：开放迎人、自然接话，允许邀请或问候手势。',
 'worry':'伤心担忧：双手收拢、肩略沉、目光低垂，禁止挥手欢迎或张臂邀约。',
 'firm':'愤怒不悦：设限、示停、挡护、护住重要物品，禁止欢迎或开心手势。',
 'surprise':'惊讶发现：安静聆听后注意到变化，身体收势，禁止欢快招呼。',
 'hurt':'痛楚疲弱：收拢防护、肩略内收、承受不适，禁止挥手欢迎、摊臂邀请或兴高采烈。'}
def pose_for(cid,key):
 return COMMON_POSES.get(key,PERSONAL_POSES[cid])
def dependency(cid,key):
 pose=pose_for(cid,key)
 slots=['greet','listen','craft','boundary','reflect']
 return f'{cid}/pose-{slots.index(pose)+1:02}-{pose}'
def intent_for(cid,key):
 return INTENTS.get(key,f'本人专属情绪与{pose_for(cid,key)}动作一致；表情和身体不能传达相反态度。')
