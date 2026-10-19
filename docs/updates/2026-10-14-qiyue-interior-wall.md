# 2026-10-14 栖月楼二层室内瓦面修正

用户问二层中间为何出现屋檐。原因是此前将V3一层排练屋屋顶暴露到二层室内，造成露天院子的错误读法。本轮撤销该视觉结构，改成连续的室内后墙与青绿牡丹绣屏。

先更新V4负责文档；内置image_gen原生RGBA局部编辑，采用source/upper-interior-wall.png，旧upper.png保留并标未选用。前方挑空采样alpha=0，门口、栏杆、家具和角色尺寸不改；碰撞区ID由lower-roof改为rear-wall，不扩大可走区。

重建场景与分层预览，两视口真实键鼠回归各20条通过、错误0；作者查看新原图及1280实机。正式1090素材检查、地图文档22页5归档路由通过。更新generation与delivery证据。仍是独立候选，未提交、未推送、未线上发布。

预览：http://127.0.0.1:8792/review/qiyue-scenes-v4-20261014/design.html?rev=interior-wall-v4-2#upper
