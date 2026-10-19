# 当前版本正式素材清单

状态：现行　最后核对：2026-10-20

基准：用户确认四向通行栖河村。工作区为 `xiaojianghu-legacy-prologue`，本地入口端口 8792。

**地图唯一基准：正式 ID `m_qh_central`，具体采用文件及参考原件以下表与 JSON 的 map_acceptance 为准。** 封闭版 `m_qihe_trial_v1` 已退出正式加载。另一工作区的 opening-v4 村落及错误 4K 试验不属于本版本。

## 使用与入库规则

- 运行图片从 `assets/production/<系统>/` 加载；UI 当前版本独立保留在 `assets/ui/jianghu-v4/`。来源原件保留在原路径，仅用于追溯，禁止据文件名直接选用。
- 新素材先放 `art_sources/<批次>/`，记录参考原图、提示词、模型与实际尺寸。经核对后更新正式清单、独立目录和运行映射；不得覆盖旧版本原件。
- 正式清单表示程序当前登记使用；不代表每份图片已通过人工风格验收。候选/历史/未证实动态引用在 inventory.json 单独列出，不自动删除或转为正式。
- 修改素材后运行 `python3 tools_assets/organize_assets.py --adopt-reviewed` 和 `python3 tools_assets/check_production.py`。

## 按系统记录

### audio

| ID | 正式路径 | 原件来源 | SHA256（前12位） |
| --- | --- | --- | --- |
| advance | `assets/audio/advance.mp3` | `assets/audio/advance.mp3` | 2e58a547d01f |
| battle.chief.hurt.01 | `assets/audio/battle-voices/chief-416d656e1ea9b61074f0.mp3` | `assets/audio/battle-voices/chief-416d656e1ea9b61074f0.mp3` | 416d656e1ea9 |
| battle.chief.attack.02 | `assets/audio/battle-voices/chief-4f5b7a952f4a2c86dfdd.mp3` | `assets/audio/battle-voices/chief-4f5b7a952f4a2c86dfdd.mp3` | 4f5b7a952f4a |
| battle.chief.turn.01 | `assets/audio/battle-voices/chief-76b9126b2d117b2207b6.mp3` | `assets/audio/battle-voices/chief-76b9126b2d117b2207b6.mp3` | 76b9126b2d11 |
| battle.chief.down.01 | `assets/audio/battle-voices/chief-7b8bcefec5c917c2f515.mp3` | `assets/audio/battle-voices/chief-7b8bcefec5c917c2f515.mp3` | 7b8bcefec5c9 |
| battle.chief.attack.01 | `assets/audio/battle-voices/chief-a1b5f1daaa6975fd2065.mp3` | `assets/audio/battle-voices/chief-a1b5f1daaa6975fd2065.mp3` | a1b5f1daaa69 |
| battle.chief.down.02 | `assets/audio/battle-voices/chief-ac906f216660fe18c1b2.mp3` | `assets/audio/battle-voices/chief-ac906f216660fe18c1b2.mp3` | ac906f216660 |
| battle.chief.turn.02 | `assets/audio/battle-voices/chief-c25e6fd2d2c143d2835e.mp3` | `assets/audio/battle-voices/chief-c25e6fd2d2c143d2835e.mp3` | c25e6fd2d2c1 |
| battle.chief.hurt.02 | `assets/audio/battle-voices/chief-f585442f5c3d7c32445e.mp3` | `assets/audio/battle-voices/chief-f585442f5c3d7c32445e.mp3` | f585442f5c3d |
| battle.langli.hurt.02 | `assets/audio/battle-voices/langli-0895e0a17484aca189ed.mp3` | `assets/audio/battle-voices/langli-0895e0a17484aca189ed.mp3` | 0895e0a17484 |
| battle.langli.attack.01 | `assets/audio/battle-voices/langli-0bd244cbf6decdbe1b44.mp3` | `assets/audio/battle-voices/langli-0bd244cbf6decdbe1b44.mp3` | 0bd244cbf6de |
| battle.langli.turn.02 | `assets/audio/battle-voices/langli-23ed74ccce97d04c6f55.mp3` | `assets/audio/battle-voices/langli-23ed74ccce97d04c6f55.mp3` | 23ed74ccce97 |
| battle.langli.turn.01 | `assets/audio/battle-voices/langli-7e2f139f718af0c6f5fe.mp3` | `assets/audio/battle-voices/langli-7e2f139f718af0c6f5fe.mp3` | 7e2f139f718a |
| battle.langli.down.02 | `assets/audio/battle-voices/langli-8dd161666f8d1dc91abd.mp3` | `assets/audio/battle-voices/langli-8dd161666f8d1dc91abd.mp3` | 8dd161666f8d |
| battle.langli.down.01 | `assets/audio/battle-voices/langli-a3171644b36d49c8d388.mp3` | `assets/audio/battle-voices/langli-a3171644b36d49c8d388.mp3` | a3171644b36d |
| battle.langli.attack.02 | `assets/audio/battle-voices/langli-de3845de943e51e73264.mp3` | `assets/audio/battle-voices/langli-de3845de943e51e73264.mp3` | de3845de943e |
| battle.langli.hurt.01 | `assets/audio/battle-voices/langli-f6ae08813226e098cdb1.mp3` | `assets/audio/battle-voices/langli-f6ae08813226e098cdb1.mp3` | f6ae08813226 |
| battle.liu.turn.01 | `assets/audio/battle-voices/liu-0cd80a7c248f28df4317.mp3` | `assets/audio/battle-voices/liu-0cd80a7c248f28df4317.mp3` | 0cd80a7c248f |
| battle.liu.hurt.01 | `assets/audio/battle-voices/liu-216b1a6765cb246d8b7e.mp3` | `assets/audio/battle-voices/liu-216b1a6765cb246d8b7e.mp3` | 216b1a6765cb |
| battle.liu.down.01 | `assets/audio/battle-voices/liu-385ffda4e05f2fa7e8c3.mp3` | `assets/audio/battle-voices/liu-385ffda4e05f2fa7e8c3.mp3` | 385ffda4e05f |
| battle.liu.hurt.02 | `assets/audio/battle-voices/liu-8f4090def99294d54bb4.mp3` | `assets/audio/battle-voices/liu-8f4090def99294d54bb4.mp3` | 8f4090def992 |
| battle.liu.attack.01 | `assets/audio/battle-voices/liu-b96d638bf5d68b5a7e26.mp3` | `assets/audio/battle-voices/liu-b96d638bf5d68b5a7e26.mp3` | b96d638bf5d6 |
| battle.liu.attack.02 | `assets/audio/battle-voices/liu-c31baf3b6d9e8ba8de2d.mp3` | `assets/audio/battle-voices/liu-c31baf3b6d9e8ba8de2d.mp3` | c31baf3b6d9e |
| battle.liu.down.02 | `assets/audio/battle-voices/liu-de6d19369b2333807556.mp3` | `assets/audio/battle-voices/liu-de6d19369b2333807556.mp3` | de6d19369b23 |
| battle.liu.turn.02 | `assets/audio/battle-voices/liu-e27b414c03dec23ef072.mp3` | `assets/audio/battle-voices/liu-e27b414c03dec23ef072.mp3` | e27b414c03de |
| battle.liu-hanyan.turn.02 | `assets/audio/battle-voices/liu-hanyan-17f800bee16a8845c685.mp3` | `assets/audio/battle-voices/liu-hanyan-17f800bee16a8845c685.mp3` | 17f800bee16a |
| battle.liu-hanyan.attack.01 | `assets/audio/battle-voices/liu-hanyan-1ce19128d26102d1cde4.mp3` | `assets/audio/battle-voices/liu-hanyan-1ce19128d26102d1cde4.mp3` | 1ce19128d261 |
| battle.liu-hanyan.support.01 | `assets/audio/battle-voices/liu-hanyan-3e7deaa6e00e4d2f9ccd.mp3` | `assets/audio/battle-voices/liu-hanyan-3e7deaa6e00e4d2f9ccd.mp3` | 3e7deaa6e00e |
| battle.liu-hanyan.down.01 | `assets/audio/battle-voices/liu-hanyan-4e6e72aaa4a075487d7d.mp3` | `assets/audio/battle-voices/liu-hanyan-4e6e72aaa4a075487d7d.mp3` | 4e6e72aaa4a0 |
| battle.liu-hanyan.hurt.02 | `assets/audio/battle-voices/liu-hanyan-798003abb25406623699.mp3` | `assets/audio/battle-voices/liu-hanyan-798003abb25406623699.mp3` | 798003abb254 |
| battle.liu-hanyan.turn.01 | `assets/audio/battle-voices/liu-hanyan-8a629c3bae53d262bee7.mp3` | `assets/audio/battle-voices/liu-hanyan-8a629c3bae53d262bee7.mp3` | 8a629c3bae53 |
| battle.liu-hanyan.attack.02 | `assets/audio/battle-voices/liu-hanyan-be3a720480529f01adfa.mp3` | `assets/audio/battle-voices/liu-hanyan-be3a720480529f01adfa.mp3` | be3a72048052 |
| battle.liu-hanyan.hurt.01 | `assets/audio/battle-voices/liu-hanyan-ff4f4e9ee0eaa1df3af8.mp3` | `assets/audio/battle-voices/liu-hanyan-ff4f4e9ee0eaa1df3af8.mp3` | ff4f4e9ee0ea |
| battle.pei-zhigu.down.01 | `assets/audio/battle-voices/pei-zhigu-0ddf6c1e25556bde345d.mp3` | `assets/audio/battle-voices/pei-zhigu-0ddf6c1e25556bde345d.mp3` | 0ddf6c1e2555 |
| battle.pei-zhigu.hurt.02 | `assets/audio/battle-voices/pei-zhigu-345e8028d9ddf856392b.mp3` | `assets/audio/battle-voices/pei-zhigu-345e8028d9ddf856392b.mp3` | 345e8028d9dd |
| battle.pei-zhigu.support.01 | `assets/audio/battle-voices/pei-zhigu-ae4000b935b9f9b199a5.mp3` | `assets/audio/battle-voices/pei-zhigu-ae4000b935b9f9b199a5.mp3` | ae4000b935b9 |
| battle.pei-zhigu.hurt.01 | `assets/audio/battle-voices/pei-zhigu-d05c6b293642e6c9aeb3.mp3` | `assets/audio/battle-voices/pei-zhigu-d05c6b293642e6c9aeb3.mp3` | d05c6b293642 |
| battle.pei-zhigu.turn.02 | `assets/audio/battle-voices/pei-zhigu-d9e411e0a83b5e604c0a.mp3` | `assets/audio/battle-voices/pei-zhigu-d9e411e0a83b5e604c0a.mp3` | d9e411e0a83b |
| battle.pei-zhigu.attack.02 | `assets/audio/battle-voices/pei-zhigu-dcbb97e0d5471528dde2.mp3` | `assets/audio/battle-voices/pei-zhigu-dcbb97e0d5471528dde2.mp3` | dcbb97e0d547 |
| battle.pei-zhigu.turn.01 | `assets/audio/battle-voices/pei-zhigu-ef48ed4713a0a20fc208.mp3` | `assets/audio/battle-voices/pei-zhigu-ef48ed4713a0a20fc208.mp3` | ef48ed4713a0 |
| battle.pei-zhigu.attack.01 | `assets/audio/battle-voices/pei-zhigu-f7f6a83b85dfb0b70372.mp3` | `assets/audio/battle-voices/pei-zhigu-f7f6a83b85dfb0b70372.mp3` | f7f6a83b85df |
| battle.pipi.turn.02 | `assets/audio/battle-voices/pipi-1256af7e5183d63b7149.mp3` | `assets/audio/battle-voices/pipi-1256af7e5183d63b7149.mp3` | 1256af7e5183 |
| battle.pipi.attack.02 | `assets/audio/battle-voices/pipi-26456ead31b8f949306e.mp3` | `assets/audio/battle-voices/pipi-26456ead31b8f949306e.mp3` | 26456ead31b8 |
| battle.pipi.down.01 | `assets/audio/battle-voices/pipi-54b936ec51bc694b7d70.mp3` | `assets/audio/battle-voices/pipi-54b936ec51bc694b7d70.mp3` | 54b936ec51bc |
| battle.pipi.turn.01 | `assets/audio/battle-voices/pipi-bcb4df3cc822b43232f6.mp3` | `assets/audio/battle-voices/pipi-bcb4df3cc822b43232f6.mp3` | bcb4df3cc822 |
| battle.pipi.hurt.02 | `assets/audio/battle-voices/pipi-c231e8a6d0ab5053ffdd.mp3` | `assets/audio/battle-voices/pipi-c231e8a6d0ab5053ffdd.mp3` | c231e8a6d0ab |
| battle.pipi.hurt.01 | `assets/audio/battle-voices/pipi-c81b8fcac01d63bbf9f5.mp3` | `assets/audio/battle-voices/pipi-c81b8fcac01d63bbf9f5.mp3` | c81b8fcac01d |
| battle.pipi.down.02 | `assets/audio/battle-voices/pipi-ca337261a07d7ae22d78.mp3` | `assets/audio/battle-voices/pipi-ca337261a07d7ae22d78.mp3` | ca337261a07d |
| battle.pipi.attack.01 | `assets/audio/battle-voices/pipi-e244e70ed509a75baf95.mp3` | `assets/audio/battle-voices/pipi-e244e70ed509a75baf95.mp3` | e244e70ed509 |
| battle.qin-feiyuan.attack.01 | `assets/audio/battle-voices/qin-feiyuan-42210e330daff55dcaf7.mp3` | `assets/audio/battle-voices/qin-feiyuan-42210e330daff55dcaf7.mp3` | 42210e330daf |
| battle.qin-feiyuan.hurt.01 | `assets/audio/battle-voices/qin-feiyuan-4dd33b2ebf30c307dda1.mp3` | `assets/audio/battle-voices/qin-feiyuan-4dd33b2ebf30c307dda1.mp3` | 4dd33b2ebf30 |
| battle.qin-feiyuan.support.01 | `assets/audio/battle-voices/qin-feiyuan-7d6802f929c86ad28bae.mp3` | `assets/audio/battle-voices/qin-feiyuan-7d6802f929c86ad28bae.mp3` | 7d6802f929c8 |
| battle.qin-feiyuan.hurt.02 | `assets/audio/battle-voices/qin-feiyuan-8f961a64f057504a43a6.mp3` | `assets/audio/battle-voices/qin-feiyuan-8f961a64f057504a43a6.mp3` | 8f961a64f057 |
| battle.qin-feiyuan.attack.02 | `assets/audio/battle-voices/qin-feiyuan-a0d5cddf5e2e03b7ba5e.mp3` | `assets/audio/battle-voices/qin-feiyuan-a0d5cddf5e2e03b7ba5e.mp3` | a0d5cddf5e2e |
| battle.qin-feiyuan.turn.02 | `assets/audio/battle-voices/qin-feiyuan-a6538b5b527974705cf9.mp3` | `assets/audio/battle-voices/qin-feiyuan-a6538b5b527974705cf9.mp3` | a6538b5b5279 |
| battle.qin-feiyuan.turn.01 | `assets/audio/battle-voices/qin-feiyuan-b34e54de2c8e200b0b67.mp3` | `assets/audio/battle-voices/qin-feiyuan-b34e54de2c8e200b0b67.mp3` | b34e54de2c8e |
| battle.qin-feiyuan.down.01 | `assets/audio/battle-voices/qin-feiyuan-ce862821b689210fbb4f.mp3` | `assets/audio/battle-voices/qin-feiyuan-ce862821b689210fbb4f.mp3` | ce862821b689 |
| battle.ruan-qingque.attack.02 | `assets/audio/battle-voices/ruan-qingque-0b84650e263062daca93.mp3` | `assets/audio/battle-voices/ruan-qingque-0b84650e263062daca93.mp3` | 0b84650e2630 |
| battle.ruan-qingque.hurt.02 | `assets/audio/battle-voices/ruan-qingque-1483a4dadd9e77c68c47.mp3` | `assets/audio/battle-voices/ruan-qingque-1483a4dadd9e77c68c47.mp3` | 1483a4dadd9e |
| battle.ruan-qingque.turn.02 | `assets/audio/battle-voices/ruan-qingque-78bb7b81df9f87ca79e1.mp3` | `assets/audio/battle-voices/ruan-qingque-78bb7b81df9f87ca79e1.mp3` | 78bb7b81df9f |
| battle.ruan-qingque.support.01 | `assets/audio/battle-voices/ruan-qingque-9e89b8ae47afd68bd43d.mp3` | `assets/audio/battle-voices/ruan-qingque-9e89b8ae47afd68bd43d.mp3` | 9e89b8ae47af |
| battle.ruan-qingque.attack.01 | `assets/audio/battle-voices/ruan-qingque-a57ed40fd153296cccf2.mp3` | `assets/audio/battle-voices/ruan-qingque-a57ed40fd153296cccf2.mp3` | a57ed40fd153 |
| battle.ruan-qingque.hurt.01 | `assets/audio/battle-voices/ruan-qingque-c1d89c34bca5ba425463.mp3` | `assets/audio/battle-voices/ruan-qingque-c1d89c34bca5ba425463.mp3` | c1d89c34bca5 |
| battle.ruan-qingque.turn.01 | `assets/audio/battle-voices/ruan-qingque-d23bd3f375b37e269e33.mp3` | `assets/audio/battle-voices/ruan-qingque-d23bd3f375b37e269e33.mp3` | d23bd3f375b3 |
| battle.ruan-qingque.down.01 | `assets/audio/battle-voices/ruan-qingque-e4f922c0d3e1cf81affa.mp3` | `assets/audio/battle-voices/ruan-qingque-e4f922c0d3e1cf81affa.mp3` | e4f922c0d3e1 |
| battle.suzhi.attack.02 | `assets/audio/battle-voices/suzhi-4351d0d5ef63ec48c65c.mp3` | `assets/audio/battle-voices/suzhi-4351d0d5ef63ec48c65c.mp3` | 4351d0d5ef63 |
| battle.suzhi.turn.01 | `assets/audio/battle-voices/suzhi-47b3659461674f873aeb.mp3` | `assets/audio/battle-voices/suzhi-47b3659461674f873aeb.mp3` | 47b365946167 |
| battle.suzhi.hurt.01 | `assets/audio/battle-voices/suzhi-739ad3eff22d6e79a146.mp3` | `assets/audio/battle-voices/suzhi-739ad3eff22d6e79a146.mp3` | 739ad3eff22d |
| battle.suzhi.hurt.02 | `assets/audio/battle-voices/suzhi-9254c6b2d4de878c646f.mp3` | `assets/audio/battle-voices/suzhi-9254c6b2d4de878c646f.mp3` | 9254c6b2d4de |
| battle.suzhi.turn.02 | `assets/audio/battle-voices/suzhi-9d68e9b1a26dc2a7f47f.mp3` | `assets/audio/battle-voices/suzhi-9d68e9b1a26dc2a7f47f.mp3` | 9d68e9b1a26d |
| battle.suzhi.support.01 | `assets/audio/battle-voices/suzhi-b3be0684c1966e901746.mp3` | `assets/audio/battle-voices/suzhi-b3be0684c1966e901746.mp3` | b3be0684c196 |
| battle.suzhi.down.01 | `assets/audio/battle-voices/suzhi-dcfa4b72cd2d06166258.mp3` | `assets/audio/battle-voices/suzhi-dcfa4b72cd2d06166258.mp3` | dcfa4b72cd2d |
| battle.suzhi.attack.01 | `assets/audio/battle-voices/suzhi-e8441757f92d38690b64.mp3` | `assets/audio/battle-voices/suzhi-e8441757f92d38690b64.mp3` | e8441757f92d |
| battle.ye.turn.01 | `assets/audio/battle-voices/ye-1a76377e3fc41e1654c1.mp3` | `assets/audio/battle-voices/ye-1a76377e3fc41e1654c1.mp3` | 1a76377e3fc4 |
| battle.ye.turn.02 | `assets/audio/battle-voices/ye-1b8a64d723e0d680fe32.mp3` | `assets/audio/battle-voices/ye-1b8a64d723e0d680fe32.mp3` | 1b8a64d723e0 |
| battle.ye.attack.02 | `assets/audio/battle-voices/ye-20238c4e5a569519185a.mp3` | `assets/audio/battle-voices/ye-20238c4e5a569519185a.mp3` | 20238c4e5a56 |
| battle.ye.support.01 | `assets/audio/battle-voices/ye-30c02ee6352aac980423.mp3` | `assets/audio/battle-voices/ye-30c02ee6352aac980423.mp3` | 30c02ee6352a |
| battle.ye.hurt.02 | `assets/audio/battle-voices/ye-431dc246522112428edc.mp3` | `assets/audio/battle-voices/ye-431dc246522112428edc.mp3` | 431dc2465221 |
| battle.ye.down.01 | `assets/audio/battle-voices/ye-9965d412d79b2256e9ca.mp3` | `assets/audio/battle-voices/ye-9965d412d79b2256e9ca.mp3` | 9965d412d79b |
| battle.ye.hurt.01 | `assets/audio/battle-voices/ye-9ba8c322a08250270af5.mp3` | `assets/audio/battle-voices/ye-9ba8c322a08250270af5.mp3` | 9ba8c322a082 |
| battle.ye.attack.01 | `assets/audio/battle-voices/ye-b724b0491d2920351c9e.mp3` | `assets/audio/battle-voices/ye-b724b0491d2920351c9e.mp3` | b724b0491d29 |
| bgm_qh_battle_v2 | `assets/audio/bgm_qh_battle_v2.mp3` | `assets/audio/bgm_qh_battle_v2.mp3` | 098a64ff97b7 |
| bgm_qh_cultivation_v5_short | `assets/audio/bgm_qh_cultivation_v5_short.wav` | `assets/audio/bgm_qh_cultivation_v5_short.wav` | fa57f7cd7c73 |
| bgm_qh_daily_v2 | `assets/audio/bgm_qh_daily_v2.mp3` | `assets/audio/bgm_qh_daily_v2.mp3` | 4c0359a66d54 |
| blip | `assets/audio/blip.mp3` | `assets/audio/blip.mp3` | a044d668be11 |
| chime | `assets/audio/chime.mp3` | `assets/audio/chime.mp3` | 1509de25a4a6 |
| coin | `assets/audio/coin.mp3` | `assets/audio/coin.mp3` | fd0586078b7c |
| menu_close | `assets/audio/menu_close.mp3` | `assets/audio/menu_close.mp3` | 960ddd94b693 |
| menu_open | `assets/audio/menu_open.mp3` | `assets/audio/menu_open.mp3` | bd24d619836c |
| select | `assets/audio/select.mp3` | `assets/audio/select.mp3` | 97a9b06f10ca |
| step1 | `assets/audio/step1.mp3` | `assets/audio/step1.mp3` | 59ec232f45b6 |
| step2 | `assets/audio/step2.mp3` | `assets/audio/step2.mp3` | ad2b42fdbb8d |
| step3 | `assets/audio/step3.mp3` | `assets/audio/step3.mp3` | ad2b42fdbb8d |
| whoosh | `assets/audio/whoosh.mp3` | `assets/audio/whoosh.mp3` | 4eb5cfd3f23c |
| battle.tang-zhaoxue.turn.01 | `assets/audio/battle-voices/tang-zhaoxue-e46b80f41c335d9e9bcd.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/tang-zhaoxue-e46b80f41c335d9e9bcd.mp3` | e46b80f41c33 |
| battle.tang-zhaoxue.turn.02 | `assets/audio/battle-voices/tang-zhaoxue-a921235d60a39d4841cd.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/tang-zhaoxue-a921235d60a39d4841cd.mp3` | a921235d60a3 |
| battle.tang-zhaoxue.attack.01 | `assets/audio/battle-voices/tang-zhaoxue-a68f21ed84909fa86bcd.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/tang-zhaoxue-a68f21ed84909fa86bcd.mp3` | a68f21ed8490 |
| battle.tang-zhaoxue.attack.02 | `assets/audio/battle-voices/tang-zhaoxue-60376dd2d67029dff7dd.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/tang-zhaoxue-60376dd2d67029dff7dd.mp3` | 60376dd2d670 |
| battle.tang-zhaoxue.hurt.01 | `assets/audio/battle-voices/tang-zhaoxue-e8659154741c97d16633.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/tang-zhaoxue-e8659154741c97d16633.mp3` | e8659154741c |
| battle.tang-zhaoxue.hurt.02 | `assets/audio/battle-voices/tang-zhaoxue-d99379d6e13f99ad6bf6.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/tang-zhaoxue-d99379d6e13f99ad6bf6.mp3` | d99379d6e13f |
| battle.tang-zhaoxue.down.01 | `assets/audio/battle-voices/tang-zhaoxue-4baeac19cb041c36dad5.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/tang-zhaoxue-4baeac19cb041c36dad5.mp3` | 4baeac19cb04 |
| battle.tang-zhaoxue.support.01 | `assets/audio/battle-voices/tang-zhaoxue-e4e0467c8df0cc2aa1f9.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/tang-zhaoxue-e4e0467c8df0cc2aa1f9.mp3` | e4e0467c8df0 |
| battle.duan-mingtang.turn.01 | `assets/audio/battle-voices/duan-mingtang-7f5ae67400cf5382a68f.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/duan-mingtang-7f5ae67400cf5382a68f.mp3` | 7f5ae67400cf |
| battle.duan-mingtang.turn.02 | `assets/audio/battle-voices/duan-mingtang-10e75a24e53fae025fa7.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/duan-mingtang-10e75a24e53fae025fa7.mp3` | 10e75a24e53f |
| battle.duan-mingtang.attack.01 | `assets/audio/battle-voices/duan-mingtang-896a9254cdd1165b11eb.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/duan-mingtang-896a9254cdd1165b11eb.mp3` | 896a9254cdd1 |
| battle.duan-mingtang.attack.02 | `assets/audio/battle-voices/duan-mingtang-bd9bf6d8500ae96e552f.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/duan-mingtang-bd9bf6d8500ae96e552f.mp3` | bd9bf6d8500a |
| battle.duan-mingtang.hurt.01 | `assets/audio/battle-voices/duan-mingtang-157c479ba04f52781a2a.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/duan-mingtang-157c479ba04f52781a2a.mp3` | 157c479ba04f |
| battle.duan-mingtang.hurt.02 | `assets/audio/battle-voices/duan-mingtang-244baa870d9a8c353a72.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/duan-mingtang-244baa870d9a8c353a72.mp3` | 244baa870d9a |
| battle.duan-mingtang.down.01 | `assets/audio/battle-voices/duan-mingtang-f30789ceabcc514b560f.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/duan-mingtang-f30789ceabcc514b560f.mp3` | f30789ceabcc |
| battle.duan-mingtang.support.01 | `assets/audio/battle-voices/duan-mingtang-0412baa0af1c4f5f98ba.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/duan-mingtang-0412baa0af1c4f5f98ba.mp3` | 0412baa0af1c |
| battle.wen-shutong.turn.01 | `assets/audio/battle-voices/wen-shutong-eb45056227a987f63332.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/wen-shutong-eb45056227a987f63332.mp3` | eb45056227a9 |
| battle.wen-shutong.turn.02 | `assets/audio/battle-voices/wen-shutong-50e70700bb6628b9398e.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/wen-shutong-50e70700bb6628b9398e.mp3` | 50e70700bb66 |
| battle.wen-shutong.attack.01 | `assets/audio/battle-voices/wen-shutong-84855b94e2e061d6540b.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/wen-shutong-84855b94e2e061d6540b.mp3` | 84855b94e2e0 |
| battle.wen-shutong.attack.02 | `assets/audio/battle-voices/wen-shutong-fa19b820929788e87573.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/wen-shutong-fa19b820929788e87573.mp3` | fa19b8209297 |
| battle.wen-shutong.hurt.01 | `assets/audio/battle-voices/wen-shutong-6ea75a875ad07eb56a28.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/wen-shutong-6ea75a875ad07eb56a28.mp3` | 6ea75a875ad0 |
| battle.wen-shutong.hurt.02 | `assets/audio/battle-voices/wen-shutong-e913e8c435af21deec05.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/wen-shutong-e913e8c435af21deec05.mp3` | e913e8c435af |
| battle.wen-shutong.down.01 | `assets/audio/battle-voices/wen-shutong-19702a1145f236d589cd.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/wen-shutong-19702a1145f236d589cd.mp3` | 19702a1145f2 |
| battle.wen-shutong.support.01 | `assets/audio/battle-voices/wen-shutong-2769b4ef940961c8f1fa.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/wen-shutong-2769b4ef940961c8f1fa.mp3` | 2769b4ef9409 |
| battle.cen-shuang.turn.01 | `assets/audio/battle-voices/cen-shuang-651cad383c2a56ef8263.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/cen-shuang-651cad383c2a56ef8263.mp3` | 651cad383c2a |
| battle.cen-shuang.turn.02 | `assets/audio/battle-voices/cen-shuang-e63aa387e29572b0668c.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/cen-shuang-e63aa387e29572b0668c.mp3` | e63aa387e295 |
| battle.cen-shuang.attack.01 | `assets/audio/battle-voices/cen-shuang-f3dfb540d8baab07a238.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/cen-shuang-f3dfb540d8baab07a238.mp3` | f3dfb540d8ba |
| battle.cen-shuang.attack.02 | `assets/audio/battle-voices/cen-shuang-8ece1dd1f00c61a8b0a2.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/cen-shuang-8ece1dd1f00c61a8b0a2.mp3` | 8ece1dd1f00c |
| battle.cen-shuang.hurt.01 | `assets/audio/battle-voices/cen-shuang-23117823d49031e01c02.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/cen-shuang-23117823d49031e01c02.mp3` | 23117823d490 |
| battle.cen-shuang.hurt.02 | `assets/audio/battle-voices/cen-shuang-8d9d34e6a2566b1d8984.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/cen-shuang-8d9d34e6a2566b1d8984.mp3` | 8d9d34e6a256 |
| battle.cen-shuang.down.01 | `assets/audio/battle-voices/cen-shuang-252fafa6d13518f8d790.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/cen-shuang-252fafa6d13518f8d790.mp3` | 252fafa6d135 |
| battle.cen-shuang.support.01 | `assets/audio/battle-voices/cen-shuang-502f6f6e272a0012b2bd.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/cen-shuang-502f6f6e272a0012b2bd.mp3` | 502f6f6e272a |
| battle.xu-lingyi.turn.01 | `assets/audio/battle-voices/xu-lingyi-6cf838f89b4f21aa80f9.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/xu-lingyi-6cf838f89b4f21aa80f9.mp3` | 6cf838f89b4f |
| battle.xu-lingyi.turn.02 | `assets/audio/battle-voices/xu-lingyi-c111ba6b0594f41c3708.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/xu-lingyi-c111ba6b0594f41c3708.mp3` | c111ba6b0594 |
| battle.xu-lingyi.attack.01 | `assets/audio/battle-voices/xu-lingyi-8959654813ed93f3d585.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/xu-lingyi-8959654813ed93f3d585.mp3` | 8959654813ed |
| battle.xu-lingyi.attack.02 | `assets/audio/battle-voices/xu-lingyi-e54c32f09bde83d2cec1.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/xu-lingyi-e54c32f09bde83d2cec1.mp3` | e54c32f09bde |
| battle.xu-lingyi.hurt.01 | `assets/audio/battle-voices/xu-lingyi-2fa967a356240df3c1f9.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/xu-lingyi-2fa967a356240df3c1f9.mp3` | 2fa967a35624 |
| battle.xu-lingyi.hurt.02 | `assets/audio/battle-voices/xu-lingyi-13bfc3c8350a496f68f4.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/xu-lingyi-13bfc3c8350a496f68f4.mp3` | 13bfc3c8350a |
| battle.xu-lingyi.down.01 | `assets/audio/battle-voices/xu-lingyi-362dd5dc4825463291bd.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/xu-lingyi-362dd5dc4825463291bd.mp3` | 362dd5dc4825 |
| battle.xu-lingyi.support.01 | `assets/audio/battle-voices/xu-lingyi-5f731feaeecd0c503512.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/xu-lingyi-5f731feaeecd0c503512.mp3` | 5f731feaeecd |
| battle.shen-yanhui.turn.01 | `assets/audio/battle-voices/shen-yanhui-405a35bcdf0e73c39ae6.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/shen-yanhui-405a35bcdf0e73c39ae6.mp3` | 405a35bcdf0e |
| battle.shen-yanhui.turn.02 | `assets/audio/battle-voices/shen-yanhui-d83f839ccc8994ab0726.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/shen-yanhui-d83f839ccc8994ab0726.mp3` | d83f839ccc89 |
| battle.shen-yanhui.attack.01 | `assets/audio/battle-voices/shen-yanhui-539b163971ebe17093e8.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/shen-yanhui-539b163971ebe17093e8.mp3` | 539b163971eb |
| battle.shen-yanhui.attack.02 | `assets/audio/battle-voices/shen-yanhui-694d80c1c240a88a4af5.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/shen-yanhui-694d80c1c240a88a4af5.mp3` | 694d80c1c240 |
| battle.shen-yanhui.hurt.01 | `assets/audio/battle-voices/shen-yanhui-7a720c2bc710b2976de2.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/shen-yanhui-7a720c2bc710b2976de2.mp3` | 7a720c2bc710 |
| battle.shen-yanhui.hurt.02 | `assets/audio/battle-voices/shen-yanhui-1f168023158b06553b34.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/shen-yanhui-1f168023158b06553b34.mp3` | 1f168023158b |
| battle.shen-yanhui.down.01 | `assets/audio/battle-voices/shen-yanhui-f68767a9355a0feb2aaf.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/shen-yanhui-f68767a9355a0feb2aaf.mp3` | f68767a9355a |
| battle.shen-yanhui.support.01 | `assets/audio/battle-voices/shen-yanhui-de3d57dca2c1c19bed29.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/shen-yanhui-de3d57dca2c1c19bed29.mp3` | de3d57dca2c1 |
| battle.yan-xiaolou.turn.01 | `assets/audio/battle-voices/yan-xiaolou-33877c5b8828d48ebcf0.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/yan-xiaolou-33877c5b8828d48ebcf0.mp3` | 33877c5b8828 |
| battle.yan-xiaolou.turn.02 | `assets/audio/battle-voices/yan-xiaolou-e4efa6bf353291ac240b.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/yan-xiaolou-e4efa6bf353291ac240b.mp3` | e4efa6bf3532 |
| battle.yan-xiaolou.attack.01 | `assets/audio/battle-voices/yan-xiaolou-bcac6ff0e3ea70517f11.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/yan-xiaolou-bcac6ff0e3ea70517f11.mp3` | bcac6ff0e3ea |
| battle.yan-xiaolou.attack.02 | `assets/audio/battle-voices/yan-xiaolou-11a9134861d066b2ada7.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/yan-xiaolou-11a9134861d066b2ada7.mp3` | 11a9134861d0 |
| battle.yan-xiaolou.hurt.01 | `assets/audio/battle-voices/yan-xiaolou-2816b165d98dc7c3dc1e.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/yan-xiaolou-2816b165d98dc7c3dc1e.mp3` | 2816b165d98d |
| battle.yan-xiaolou.hurt.02 | `assets/audio/battle-voices/yan-xiaolou-e43f5d0a5f2f736d4832.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/yan-xiaolou-e43f5d0a5f2f736d4832.mp3` | e43f5d0a5f2f |
| battle.yan-xiaolou.down.01 | `assets/audio/battle-voices/yan-xiaolou-dc37268dbeb4e5182b61.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/yan-xiaolou-dc37268dbeb4e5182b61.mp3` | dc37268dbeb4 |
| battle.yan-xiaolou.support.01 | `assets/audio/battle-voices/yan-xiaolou-ca0ee341c860be1c30ef.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/yan-xiaolou-ca0ee341c860be1c30ef.mp3` | ca0ee341c860 |
| battle.qiao-xingzhou.turn.01 | `assets/audio/battle-voices/qiao-xingzhou-84dd80c0ed3afd3721c7.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/qiao-xingzhou-84dd80c0ed3afd3721c7.mp3` | 84dd80c0ed3a |
| battle.qiao-xingzhou.turn.02 | `assets/audio/battle-voices/qiao-xingzhou-ef3a7d780a330339e54e.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/qiao-xingzhou-ef3a7d780a330339e54e.mp3` | ef3a7d780a33 |
| battle.qiao-xingzhou.attack.01 | `assets/audio/battle-voices/qiao-xingzhou-4eacd8d33df256e36a22.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/qiao-xingzhou-4eacd8d33df256e36a22.mp3` | 4eacd8d33df2 |
| battle.qiao-xingzhou.attack.02 | `assets/audio/battle-voices/qiao-xingzhou-2840c7b856a21c5a4683.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/qiao-xingzhou-2840c7b856a21c5a4683.mp3` | 2840c7b856a2 |
| battle.qiao-xingzhou.hurt.01 | `assets/audio/battle-voices/qiao-xingzhou-65eb005321d2042b5f9f.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/qiao-xingzhou-65eb005321d2042b5f9f.mp3` | 65eb005321d2 |
| battle.qiao-xingzhou.hurt.02 | `assets/audio/battle-voices/qiao-xingzhou-034386754c8afd86dd08.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/qiao-xingzhou-034386754c8afd86dd08.mp3` | 034386754c8a |
| battle.qiao-xingzhou.down.01 | `assets/audio/battle-voices/qiao-xingzhou-1df7c550c0a8ed84e4d3.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/qiao-xingzhou-1df7c550c0a8ed84e4d3.mp3` | 1df7c550c0a8 |
| battle.qiao-xingzhou.support.01 | `assets/audio/battle-voices/qiao-xingzhou-c2da93a1d70b78c854dd.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/qiao-xingzhou-c2da93a1d70b78c854dd.mp3` | c2da93a1d70b |
| battle.shi-changgeng.turn.01 | `assets/audio/battle-voices/shi-changgeng-75b83cb0dbc7490fd0a3.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/shi-changgeng-75b83cb0dbc7490fd0a3.mp3` | 75b83cb0dbc7 |
| battle.shi-changgeng.turn.02 | `assets/audio/battle-voices/shi-changgeng-78f704ac75dd74016290.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/shi-changgeng-78f704ac75dd74016290.mp3` | 78f704ac75dd |
| battle.shi-changgeng.attack.01 | `assets/audio/battle-voices/shi-changgeng-cc960f15e1290afd9b0a.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/shi-changgeng-cc960f15e1290afd9b0a.mp3` | cc960f15e129 |
| battle.shi-changgeng.attack.02 | `assets/audio/battle-voices/shi-changgeng-fb679b519c0595b5b8ff.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/shi-changgeng-fb679b519c0595b5b8ff.mp3` | fb679b519c05 |
| battle.shi-changgeng.hurt.01 | `assets/audio/battle-voices/shi-changgeng-8f6601d914d0420675c1.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/shi-changgeng-8f6601d914d0420675c1.mp3` | 8f6601d914d0 |
| battle.shi-changgeng.hurt.02 | `assets/audio/battle-voices/shi-changgeng-94f7c564082d2ec0c951.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/shi-changgeng-94f7c564082d2ec0c951.mp3` | 94f7c564082d |
| battle.shi-changgeng.down.01 | `assets/audio/battle-voices/shi-changgeng-993fb7445eeed32193ff.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/shi-changgeng-993fb7445eeed32193ff.mp3` | 993fb7445eee |
| battle.shi-changgeng.support.01 | `assets/audio/battle-voices/shi-changgeng-6b8b208a55b4cc40d45d.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/shi-changgeng-6b8b208a55b4cc40d45d.mp3` | 6b8b208a55b4 |
| battle.qi-zheng.turn.01 | `assets/audio/battle-voices/qi-zheng-472f1c5e2f9d67973004.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/qi-zheng-472f1c5e2f9d67973004.mp3` | 472f1c5e2f9d |
| battle.qi-zheng.turn.02 | `assets/audio/battle-voices/qi-zheng-5ee52c3ff16e2c564a8b.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/qi-zheng-5ee52c3ff16e2c564a8b.mp3` | 5ee52c3ff16e |
| battle.qi-zheng.attack.01 | `assets/audio/battle-voices/qi-zheng-9bd48f47395d4e907362.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/qi-zheng-9bd48f47395d4e907362.mp3` | 9bd48f47395d |
| battle.qi-zheng.attack.02 | `assets/audio/battle-voices/qi-zheng-8137d48056f85a688b14.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/qi-zheng-8137d48056f85a688b14.mp3` | 8137d48056f8 |
| battle.qi-zheng.hurt.01 | `assets/audio/battle-voices/qi-zheng-3a329c351b146cbae0c4.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/qi-zheng-3a329c351b146cbae0c4.mp3` | 3a329c351b14 |
| battle.qi-zheng.hurt.02 | `assets/audio/battle-voices/qi-zheng-13c22444fc75db7b7f21.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/qi-zheng-13c22444fc75db7b7f21.mp3` | 13c22444fc75 |
| battle.qi-zheng.down.01 | `assets/audio/battle-voices/qi-zheng-d74c6558034661d3301d.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/qi-zheng-d74c6558034661d3301d.mp3` | d74c65580346 |
| battle.qi-zheng.support.01 | `assets/audio/battle-voices/qi-zheng-f1a281a85df96c76fe96.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/battle-voices/qi-zheng-f1a281a85df96c76fe96.mp3` | f1a281a85df9 |
| xy.emotion.ye.02 | `assets/audio/voices/ye-dd15fb0db79b4df82c3d.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/ye-dd15fb0db79b4df82c3d.mp3` | dd15fb0db79b |
| opening.P-01-04 | `assets/audio/voices/ye-40941e647bc2e99f48ba.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/ye-40941e647bc2e99f48ba.mp3` | 40941e647bc2 |
| opening.P-01-09 | `assets/audio/voices/ye-6089691ae45a3fc4934c.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/ye-6089691ae45a3fc4934c.mp3` | 6089691ae45a |
| opening.P-01-14 | `assets/audio/voices/ye-efd09b85fef6f73de827.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/ye-efd09b85fef6f73de827.mp3` | efd09b85fef6 |
| opening.P-04-10 | `assets/audio/voices/ye-8596c8379e8a939a647e.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/ye-8596c8379e8a939a647e.mp3` | 8596c8379e8a |
| opening.P-05-07 | `assets/audio/voices/ye-b79f2d27e23c255d74b7.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/ye-b79f2d27e23c255d74b7.mp3` | b79f2d27e23c |
| opening.C1-01-07 | `assets/audio/voices/ye-543e58fc6c97dbff38cb.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/ye-543e58fc6c97dbff38cb.mp3` | 543e58fc6c97 |
| opening.C1-04-03 | `assets/audio/voices/ye-212896ff92c32b5f95f0.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/ye-212896ff92c32b5f95f0.mp3` | 212896ff92c3 |
| opening.C1-05-02 | `assets/audio/voices/ye-ddf11f00c05469e5cf3b.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/ye-ddf11f00c05469e5cf3b.mp3` | ddf11f00c054 |
| opening.C1-06-09 | `assets/audio/voices/ye-75b63593e7bd755fbb87.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/ye-75b63593e7bd755fbb87.mp3` | 75b63593e7bd |
| opening.C1-08-28 | `assets/audio/voices/ye-6bd6a1030452d52dba6c.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/ye-6bd6a1030452d52dba6c.mp3` | 6bd6a1030452 |
| opening.C1-08-29 | `assets/audio/voices/ye-17c38b300c3c4d95da8b.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/ye-17c38b300c3c4d95da8b.mp3` | 17c38b300c3c |
| opening.C1-12-15 | `assets/audio/voices/ye-d1f74f09288c34c1746c.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/ye-d1f74f09288c34c1746c.mp3` | d1f74f09288c |
| xy.emotion.suzhi.01 | `assets/audio/voices/suzhi-d3757a403ea9cb95bf1b.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/suzhi-d3757a403ea9cb95bf1b.mp3` | d3757a403ea9 |
| xy.emotion.suzhi.02 | `assets/audio/voices/suzhi-212abc39ab2d1ddabd57.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/suzhi-212abc39ab2d1ddabd57.mp3` | 212abc39ab2d |
| opening.C1-04-16 | `assets/audio/voices/cen-shuang-6f095e46f00197abc8c5.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/cen-shuang-6f095e46f00197abc8c5.mp3` | 6f095e46f001 |
| opening.C1-04-18 | `assets/audio/voices/cen-shuang-ef75e494b49765cc40dc.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/cen-shuang-ef75e494b49765cc40dc.mp3` | ef75e494b497 |
| opening.C1-08-06 | `assets/audio/voices/cen-shuang-b9f86a411bd16af582ed.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/cen-shuang-b9f86a411bd16af582ed.mp3` | b9f86a411bd1 |
| opening.C1-08-08 | `assets/audio/voices/cen-shuang-5c5422b7f7100ff56d8a.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/cen-shuang-5c5422b7f7100ff56d8a.mp3` | 5c5422b7f710 |
| opening.C1-08-10 | `assets/audio/voices/cen-shuang-7b591fe37aca4612c7a4.mp3` | `art_sources/voice-adoption-20261010/staging/assets/audio/voices/cen-shuang-7b591fe37aca4612c7a4.mp3` | 7b591fe37aca |
| staff_hit_20261010 | `assets/audio/staff_hit_20261010.wav` | `art_sources/hero-staff-combo-20261010/audio/staff_hit_20261010.wav` | a7f793494da9 |
| needle_release_20261012 | `assets/audio/needle_release_20261012.wav` | `art_sources/ye-needle-battle-20261012/audio/needle_release_20261012.wav` | 5cc320b16878 |
| needle_hit_20261012 | `assets/audio/needle_hit_20261012.wav` | `art_sources/ye-needle-battle-20261012/audio/needle_hit_20261012.wav` | a6969278b721 |

### battle

| ID | 正式路径 | 原件来源 | SHA256（前12位） |
| --- | --- | --- | --- |
| b_bandit | `assets/production/battle/b_bandit.webp` | `assets/b_bandit.webp` | 7d492b802d06 |
| b_beggar | `assets/production/battle/b_beggar.webp` | `assets/b_beggar.webp` | 9b1dfb306573 |
| b_chief | `assets/production/battle/b_chief.webp` | `assets/b_chief.webp` | a5bfb40e96d9 |
| b_dog | `assets/production/battle/b_dog.webp` | `assets/b_dog.webp` | 32336704d8ca |
| b_hero | `assets/production/battle/b_hero.webp` | `assets/b_hero.webp` | 516cf331ea26 |
| b_hero_village | `assets/production/battle/b_hero_village.webp` | `assets/b_hero_village.webp` | a4a80f20fff1 |
| b_luheng | `assets/production/battle/b_luheng.webp` | `assets/b_luheng.webp` | f50945945060 |
| b_monk | `assets/production/battle/b_monk.webp` | `assets/b_monk.webp` | e677def4dc42 |
| b_qh_raider_rear_v1 | `assets/production/battle/b_qh_raider_rear_v1.webp` | `assets/b_qh_raider_rear_v1.webp` | 016eb0757c09 |
| b_rooster | `assets/production/battle/b_rooster.webp` | `assets/b_rooster.webp` | 44b72fd4ce7d |
| b_snake | `assets/production/battle/b_snake.webp` | `assets/b_snake.webp` | 85c89b1c835c |
| b_soldier | `assets/production/battle/b_soldier.webp` | `assets/b_soldier.webp` | 7ca96f649e09 |
| b_suzhi | `assets/production/battle/b_suzhi.webp` | `assets/b_suzhi.webp` | 991f1b6e47b3 |
| b_wilddog | `assets/production/battle/b_wilddog.webp` | `assets/b_wilddog.webp` | 2bfabe5dd436 |
| b_wolf | `assets/production/battle/b_wolf.webp` | `assets/b_wolf.webp` | 4ad17f9d6822 |
| b_ye | `assets/production/battle/b_ye.webp` | `assets/b_ye.webp` | 45acd205682c |
| bb_prologue_backhill_v1 | `assets/production/battle/bb_prologue_backhill_v1.webp` | `assets/bb_prologue_backhill_v1.webp` | 2fc08f61b319 |
| bb_qh_evacuation_v1 | `assets/production/battle/bb_qh_evacuation_v1.webp` | `assets/bb_qh_evacuation_v1.webp` | c14aa8c43c22 |
| bb_qh_training_v1 | `assets/production/battle/bb_qh_training_v1.webp` | `assets/bb_qh_training_v1.webp` | 575c6f87a3f1 |

### characters

| ID | 正式路径 | 原件来源 | SHA256（前12位） |
| --- | --- | --- | --- |
| s_opening_apothecary | `assets/production/characters/s_opening_apothecary_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_opening_apothecary.webp` | f08076d42822 |
| s_opening_aunt | `assets/production/characters/s_opening_aunt_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_opening_aunt.webp` | 75465b681a4e |
| s_opening_bailiff | `assets/production/characters/s_opening_bailiff_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_opening_bailiff.webp` | d0f70d3abba3 |
| s_opening_censhuang | `assets/production/characters/s_opening_censhuang_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_opening_censhuang.webp` | 470c3d47fe4c |
| s_opening_chen | `assets/production/characters/s_opening_chen_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_opening_chen.webp` | 8aa7ae39cf29 |
| s_opening_chengduo | `assets/production/characters/s_opening_chengduo_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_opening_chengduo.webp` | a09446f3601d |
| s_opening_hero_modern | `assets/production/characters/s_opening_hero_modern_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_opening_hero_modern.webp` | 19bc8a709fac |
| s_opening_luheng | `assets/production/characters/s_opening_luheng_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_opening_luheng.webp` | 1c288c505f7a |
| s_opening_procurement | `assets/production/characters/s_opening_procurement_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_opening_procurement.webp` | 448d0e30ba5e |
| s_opening_procurement_aide | `assets/production/characters/s_opening_procurement_aide_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_opening_procurement_aide.webp` | 3fb5cc2bc04c |
| s_opening_retainer | `assets/production/characters/s_opening_retainer_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_opening_retainer.webp` | 59e4df78c153 |
| s_opening_steward | `assets/production/characters/s_opening_steward_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_opening_steward.webp` | 05ff84dd2b4e |
| s_opening_wukui | `assets/production/characters/s_opening_wukui_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_opening_wukui.webp` | ee09afd36b0c |
| s_opening_zhouyan | `assets/production/characters/s_opening_zhouyan_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_opening_zhouyan.webp` | e42bbfb62f3e |
| s_qh_bandit | `assets/production/characters/s_qh_bandit_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_qh_bandit.webp` | 7f7fd95ef046 |
| s_qh_merchant | `assets/production/characters/s_qh_merchant_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_qh_merchant.webp` | a550bf4569f7 |
| s_qh_oldman | `assets/production/characters/s_qh_oldman_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_qh_oldman.webp` | a09abce441ae |
| s_ye | `assets/production/characters/s_ye_pixfix_20261007.webp` | `art_sources/character-pixel-fix-20261007/final/s_ye.webp` | 5a49f9c4ed28 |
| s_gy_yinhongying | `assets/production/characters/s_gy_yinhongying.webp` | `art_sources/guiyun-inkcloud-cn-20261008/out/s_gy_yinhongying.webp` | cbc715c52ccb |
| s_qh_hero_blue_20261010 | `assets/production/characters/s_qh_hero_blue_20261010.webp` | `art_sources/hero-blue-formal-20261010/out/s_qh_hero_blue_20261010.webp` | 5a33ac856c8e |
| s_qh_hero_blue_idle_20261010 | `assets/production/characters/s_qh_hero_blue_idle_20261010.webp` | `art_sources/hero-blue-formal-20261010/out/s_qh_hero_blue_idle_20261010.webp` | 6e606f343936 |
| s_qh_hero_blue_run_20261010 | `assets/production/characters/s_qh_hero_blue_run_20261010.webp` | `art_sources/hero-blue-formal-20261010/out/s_qh_hero_blue_run_20261010.webp` | b7398353ce02 |
| s_qh_hero_blue_walk_20261010 | `assets/production/characters/s_qh_hero_blue_walk_20261010.webp` | `art_sources/hero-blue-formal-20261010/out/s_qh_hero_blue_walk_20261010.webp` | 10a892a15249 |
| s_qh_song_seated | `assets/production/characters/s_qh_song_seated.webp` | `art_sources/qh-song-disguise-20261008/final/s_qh_song_seated.webp` | 597edc4198ae |
| s_qh_song_story | `assets/production/characters/s_qh_song_story.webp` | `art_sources/qh-song-disguise-20261008/final/s_qh_song_story.webp` | 725280f9958c |
| s_npc_opening_apothecary_20261010 | `assets/production/characters/s_npc_opening_apothecary_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/opening_apothecary/s_npc_opening_apothecary_20261010.webp` | b199e2a768a2 |
| s_npc_opening_aunt_20261010 | `assets/production/characters/s_npc_opening_aunt_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/opening_aunt/s_npc_opening_aunt_20261010.webp` | ac259ded257d |
| s_npc_opening_bailiff_20261010 | `assets/production/characters/s_npc_opening_bailiff_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/opening_bailiff/s_npc_opening_bailiff_20261010.webp` | 16159039228c |
| s_npc_opening_chen_20261010 | `assets/production/characters/s_npc_opening_chen_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/opening_chen/s_npc_opening_chen_20261010.webp` | c85d2a0d7371 |
| s_npc_opening_luheng_20261010 | `assets/production/characters/s_npc_opening_luheng_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/opening_luheng/s_npc_opening_luheng_20261010.webp` | e1bbb4d8a171 |
| s_npc_opening_procurement_20261010 | `assets/production/characters/s_npc_opening_procurement_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/opening_procurement/s_npc_opening_procurement_20261010.webp` | 1b82bf81f23c |
| s_npc_opening_procurement_aide_20261010 | `assets/production/characters/s_npc_opening_procurement_aide_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/opening_procurement_aide/s_npc_opening_procurement_aide_20261010.webp` | 915bfd40843b |
| s_npc_opening_retainer_20261010 | `assets/production/characters/s_npc_opening_retainer_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/opening_retainer/s_npc_opening_retainer_20261010.webp` | 3a2118a964b6 |
| s_npc_opening_steward_20261010 | `assets/production/characters/s_npc_opening_steward_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/opening_steward/s_npc_opening_steward_20261010.webp` | 88b4a7bc80b8 |
| s_npc_opening_wukui_20261010 | `assets/production/characters/s_npc_opening_wukui_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/opening_wukui/s_npc_opening_wukui_20261010.webp` | b02a8be56bc2 |
| s_npc_opening_zhouyan_20261010 | `assets/production/characters/s_npc_opening_zhouyan_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/opening_zhouyan/s_npc_opening_zhouyan_20261010.webp` | 2e72389c89a4 |
| s_npc_qh_bandit_20261010 | `assets/production/characters/s_npc_qh_bandit_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/qh_bandit/s_npc_qh_bandit_20261010.webp` | 483324854db4 |
| s_npc_qh_censhuang_story_20261010 | `assets/production/characters/s_npc_qh_censhuang_story_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/qh_censhuang_story/s_npc_qh_censhuang_story_20261010.webp` | a48a735482b8 |
| s_npc_qh_chen_rest_story_20261010 | `assets/production/characters/s_npc_qh_chen_rest_story_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/qh_chen_rest_story/s_npc_qh_chen_rest_story_20261010.webp` | e0bfaf702471 |
| s_npc_qh_merchant_20261010 | `assets/production/characters/s_npc_qh_merchant_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/qh_merchant/s_npc_qh_merchant_20261010.webp` | 00cd6f57b0c8 |
| s_npc_qh_oldman_20261010 | `assets/production/characters/s_npc_qh_oldman_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/qh_oldman/s_npc_qh_oldman_20261010.webp` | cc46e6ffca9c |
| s_npc_qh_shenyanhui_story_20261010 | `assets/production/characters/s_npc_qh_shenyanhui_story_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/qh_shenyanhui_story/s_npc_qh_shenyanhui_story_20261010.webp` | e90b0a434317 |
| s_npc_qh_song_seated_20261010 | `assets/production/characters/s_npc_qh_song_seated_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/qh_song_seated/s_npc_qh_song_seated_20261010.webp` | 35e925fb0df2 |
| s_npc_qh_song_story_20261010 | `assets/production/characters/s_npc_qh_song_story_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/qh_song_story/s_npc_qh_song_story_20261010.webp` | 8178a474607f |
| s_npc_qh_xulingyi_story_20261010 | `assets/production/characters/s_npc_qh_xulingyi_story_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/qh_xulingyi_story/s_npc_qh_xulingyi_story_20261010.webp` | ef1cd878d3da |
| s_npc_ye_20261010 | `assets/production/characters/s_npc_ye_20261010.webp` | `art_sources/qihe-npc-refresh-20261010/out/ye/s_npc_ye_20261010.webp` | 65dcc5a44b26 |
| s_qh_censhuang_story | `assets/production/characters/s_qh_censhuang_story.webp` | `art_sources/qihe-representatives-adoption-20261007/s_qh_censhuang_story.webp` | c2f39a92bac9 |
| s_qh_chen_rest_story | `assets/production/characters/s_qh_chen_rest_story.webp` | `art_sources/qihe-representatives-adoption-20261007/s_qh_chen_rest_story.webp` | 47a087b00fe7 |
| s_qh_shenyanhui_story | `assets/production/characters/s_qh_shenyanhui_story.webp` | `art_sources/qihe-representatives-adoption-20261007/s_qh_shenyanhui_story.webp` | d504297fc63e |
| s_qh_xulingyi_story | `assets/production/characters/s_qh_xulingyi_story.webp` | `art_sources/qihe-representatives-adoption-20261007/s_qh_xulingyi_story.webp` | 1e9d5f0be2cc |
| s_bandit | `assets/production/characters/s_bandit.webp` | `assets/s_bandit.webp` | dc064373aec4 |
| s_bandit_bright | `assets/production/characters/s_bandit_bright.webp` | `assets/s_bandit_bright.webp` | 3fd8fbf8780a |
| s_beggar | `assets/production/characters/s_beggar.webp` | `assets/s_beggar.webp` | 7b28c6927be8 |
| s_beggar_bright | `assets/production/characters/s_beggar_bright.webp` | `assets/s_beggar_bright.webp` | a46dbc41d9c9 |
| s_boatman | `assets/production/characters/s_boatman.webp` | `assets/s_boatman.webp` | 7ba7f9566bc9 |
| s_boatman_bright | `assets/production/characters/s_boatman_bright.webp` | `assets/s_boatman_bright.webp` | 01c150a65392 |
| s_chief | `assets/production/characters/s_chief.webp` | `assets/s_chief.webp` | 0ab8fd21e9eb |
| s_chief_bright | `assets/production/characters/s_chief_bright.webp` | `assets/s_chief_bright.webp` | 6b6f32958336 |
| s_child | `assets/production/characters/s_child.webp` | `assets/s_child.webp` | 644504e246fd |
| s_child_bright | `assets/production/characters/s_child_bright.webp` | `assets/s_child_bright.webp` | fd206b717fab |
| s_dog | `assets/production/characters/s_dog.webp` | `assets/s_dog.webp` | 90de799f10d1 |
| s_dog_bright | `assets/production/characters/s_dog_bright.webp` | `assets/s_dog_bright.webp` | 90de799f10d1 |
| s_dog_idle | `assets/production/characters/s_dog_idle.webp` | `assets/s_dog_idle.webp` | 059178c1f464 |
| s_dog_idle_bright | `assets/production/characters/s_dog_idle_bright.webp` | `assets/s_dog_idle_bright.webp` | 059178c1f464 |
| s_dog_run | `assets/production/characters/s_dog_run.webp` | `assets/s_dog_run.webp` | 4163e58de3e4 |
| s_dog_run_bright | `assets/production/characters/s_dog_run_bright.webp` | `assets/s_dog_run_bright.webp` | 4163e58de3e4 |
| s_dog_walk | `assets/production/characters/s_dog_walk.webp` | `assets/s_dog_walk.webp` | 7f90ea4bdab5 |
| s_dog_walk_bright | `assets/production/characters/s_dog_walk_bright.webp` | `assets/s_dog_walk_bright.webp` | 7f90ea4bdab5 |
| s_gossip | `assets/production/characters/s_gossip.webp` | `assets/s_gossip.webp` | a155eb3a96e7 |
| s_gossip_bright | `assets/production/characters/s_gossip_bright.webp` | `assets/s_gossip_bright.webp` | 99d8a1f7673f |
| s_hero | `assets/production/characters/s_hero.webp` | `assets/s_hero.webp` | cf80e581a565 |
| s_hero_battle | `assets/production/characters/s_hero_battle.webp` | `assets/s_hero_battle.webp` | 79c38cdbf5cd |
| s_hero_bright | `assets/production/characters/s_hero_bright.webp` | `assets/s_hero_bright.webp` | cf80e581a565 |
| s_hero_idle | `assets/production/characters/s_hero_idle.webp` | `assets/s_hero_idle.webp` | 2376968df023 |
| s_hero_idle_bright | `assets/production/characters/s_hero_idle_bright.webp` | `assets/s_hero_idle_bright.webp` | 2376968df023 |
| s_hero_run | `assets/production/characters/s_hero_run.webp` | `assets/s_hero_run.webp` | a5f5e7ecbba2 |
| s_hero_run_bright | `assets/production/characters/s_hero_run_bright.webp` | `assets/s_hero_run_bright.webp` | a5f5e7ecbba2 |
| s_hero_walk | `assets/production/characters/s_hero_walk.webp` | `assets/s_hero_walk.webp` | 59cb2ee13691 |
| s_hero_walk_bright | `assets/production/characters/s_hero_walk_bright.webp` | `assets/s_hero_walk_bright.webp` | 59cb2ee13691 |
| s_lady | `assets/production/characters/s_lady.webp` | `assets/s_lady.webp` | 05656fe827fb |
| s_lady_bright | `assets/production/characters/s_lady_bright.webp` | `assets/s_lady_bright.webp` | 1d33c00c0bd6 |
| s_langli | `assets/production/characters/s_langli.webp` | `assets/s_langli.webp` | 90ba54778230 |
| s_liu | `assets/production/characters/s_liu.webp` | `assets/s_liu.webp` | 35f0938706e3 |
| s_merchant | `assets/production/characters/s_merchant.webp` | `assets/s_merchant.webp` | 166001248b87 |
| s_merchant_bright | `assets/production/characters/s_merchant_bright.webp` | `assets/s_merchant_bright.webp` | a1d4a88fa4eb |
| s_monk | `assets/production/characters/s_monk.webp` | `assets/s_monk.webp` | d25e88028c91 |
| s_monk_bright | `assets/production/characters/s_monk_bright.webp` | `assets/s_monk_bright.webp` | 714deebfa650 |
| s_oldman | `assets/production/characters/s_oldman.webp` | `assets/s_oldman.webp` | 57270d502ca5 |
| s_oldman_bright | `assets/production/characters/s_oldman_bright.webp` | `assets/s_oldman_bright.webp` | e7304ce80d2e |
| s_prologue_wilddog_v1 | `assets/production/characters/s_prologue_wilddog_v1.webp` | `assets/s_prologue_wilddog_v1.webp` | 9cbed0d5a79c |
| s_qh_hero_initial | `assets/production/characters/s_qh_hero_initial.webp` | `assets/s_qh_hero_initial.webp` | 572407b92464 |
| s_qh_hero_initial_idle | `assets/production/characters/s_qh_hero_initial_idle.webp` | `assets/s_qh_hero_initial_idle.webp` | 8a362feb382a |
| s_qh_hero_initial_idle_bright | `assets/production/characters/s_qh_hero_initial_idle_bright.webp` | `assets/s_qh_hero_initial_idle_bright.webp` | 8a362feb382a |
| s_qh_hero_initial_run | `assets/production/characters/s_qh_hero_initial_run.webp` | `assets/s_qh_hero_initial_run.webp` | b205ca675a48 |
| s_qh_hero_initial_run_bright | `assets/production/characters/s_qh_hero_initial_run_bright.webp` | `assets/s_qh_hero_initial_run_bright.webp` | b205ca675a48 |
| s_qh_hero_initial_walk | `assets/production/characters/s_qh_hero_initial_walk.webp` | `assets/s_qh_hero_initial_walk.webp` | 1b16b5579013 |
| s_qh_hero_initial_walk_bright | `assets/production/characters/s_qh_hero_initial_walk_bright.webp` | `assets/s_qh_hero_initial_walk_bright.webp` | 1b16b5579013 |
| s_rooster | `assets/production/characters/s_rooster.webp` | `assets/s_rooster.webp` | fbd990432ee7 |
| s_rooster_bright | `assets/production/characters/s_rooster_bright.webp` | `assets/s_rooster_bright.webp` | f7e8d3bb4cd2 |
| s_smith | `assets/production/characters/s_smith.webp` | `assets/s_smith.webp` | 591093570c6c |
| s_smith_bright | `assets/production/characters/s_smith_bright.webp` | `assets/s_smith_bright.webp` | f1752fcea528 |
| s_snake | `assets/production/characters/s_snake.webp` | `assets/s_snake.webp` | 39b964ef7b8b |
| s_snake_bright | `assets/production/characters/s_snake_bright.webp` | `assets/s_snake_bright.webp` | b7ee4834239f |
| s_soldier | `assets/production/characters/s_soldier.webp` | `assets/s_soldier.webp` | 4e2940dc9440 |
| s_soldier_bright | `assets/production/characters/s_soldier_bright.webp` | `assets/s_soldier_bright.webp` | 1324259f3236 |
| s_suzhi | `assets/production/characters/s_suzhi.webp` | `assets/s_suzhi.webp` | a66bcce333d1 |
| s_suzhi_bright | `assets/production/characters/s_suzhi_bright.webp` | `assets/s_suzhi_bright.webp` | a66bcce333d1 |
| s_suzhi_idle | `assets/production/characters/s_suzhi_idle.webp` | `assets/s_suzhi_idle.webp` | ad5335eb0cc6 |
| s_suzhi_idle_bright | `assets/production/characters/s_suzhi_idle_bright.webp` | `assets/s_suzhi_idle_bright.webp` | ad5335eb0cc6 |
| s_suzhi_run | `assets/production/characters/s_suzhi_run.webp` | `assets/s_suzhi_run.webp` | 9a6ca0b5da97 |
| s_suzhi_run_bright | `assets/production/characters/s_suzhi_run_bright.webp` | `assets/s_suzhi_run_bright.webp` | 9a6ca0b5da97 |
| s_suzhi_walk | `assets/production/characters/s_suzhi_walk.webp` | `assets/s_suzhi_walk.webp` | 0d87ce33caca |
| s_suzhi_walk_bright | `assets/production/characters/s_suzhi_walk_bright.webp` | `assets/s_suzhi_walk_bright.webp` | 0d87ce33caca |
| s_villager | `assets/production/characters/s_villager.webp` | `assets/s_villager.webp` | 15fce878b00f |
| s_villager_bright | `assets/production/characters/s_villager_bright.webp` | `assets/s_villager_bright.webp` | 73b2d865b3fa |
| s_wolf | `assets/production/characters/s_wolf.webp` | `assets/s_wolf.webp` | 69d96d4c2550 |
| s_wolf_bright | `assets/production/characters/s_wolf_bright.webp` | `assets/s_wolf_bright.webp` | 1fa3beaca48b |
| s_zhou | `assets/production/characters/s_zhou.webp` | `assets/s_zhou.webp` | d828d3c9c284 |
| s_npc_gy_fangchi_20261010 | `assets/production/characters/s_npc_gy_fangchi_20261010.webp` | `art_sources/guiyun-spar-sprites-20261010/out/s_npc_gy_fangchi_20261010.webp` | ac4eba23202e |
| s_npc_gy_luxiaodou_20261010 | `assets/production/characters/s_npc_gy_luxiaodou_20261010.webp` | `art_sources/guiyun-spar-sprites-20261010/out/s_npc_gy_luxiaodou_20261010.webp` | dedae3e11541 |
| s_npc_gy_zhongzhuo_20261010 | `assets/production/characters/s_npc_gy_zhongzhuo_20261010.webp` | `art_sources/guiyun-spar-sprites-20261010/out/s_npc_gy_zhongzhuo_20261010.webp` | 07715cf9dbd5 |
| s_npc_gy_yinhongying_20261010 | `assets/production/characters/s_npc_gy_yinhongying_20261010.webp` | `art_sources/guiyun-spar-sprites-20261010/out/s_npc_gy_yinhongying_20261010.webp` | 2a48e7ba576b |

### cultivation

| ID | 正式路径 | 原件来源 | SHA256（前12位） |
| --- | --- | --- | --- |
| cu_animations_action_basic_v4_png | `assets/production/cultivation/animations/action_basic_v4.png` | `art_sources/cultivation-adoption-20261005/animations/action_basic_v4.png` | 4d7f1f571ec1 |
| cu_animations_action_stroll_v2_png | `assets/production/cultivation/animations/action_stroll_v2.png` | `art_sources/cultivation-adoption-20261005/animations/action_stroll_v2.png` | bf64c8098024 |
| cu_animations_avatar_gestures_v4_png | `assets/production/cultivation/animations/avatar_gestures_v4.png` | `art_sources/cultivation-adoption-20261005/animations/avatar_gestures_v4.png` | 7dbeb43b12fe |
| cu_bg_mountain_autumn_v1 | `assets/production/cultivation/bg_mountain_autumn_v1.png` | `art_sources/cultivation-adoption-20261005/bg_mountain_autumn_v1.png` | a4777d59d45a |
| cu_bg_mountain_spring_v1 | `assets/production/cultivation/bg_mountain_spring_v1.png` | `art_sources/cultivation-adoption-20261005/bg_mountain_spring_v1.png` | c966f2e1e414 |
| cu_bg_mountain_summer_v1 | `assets/production/cultivation/bg_mountain_summer_v1.png` | `art_sources/cultivation-adoption-20261005/bg_mountain_summer_v1.png` | 57328228e0b4 |
| cu_bg_mountain_winter_v1 | `assets/production/cultivation/bg_mountain_winter_v1.png` | `art_sources/cultivation-adoption-20261005/bg_mountain_winter_v1.png` | cc202aa8c225 |
| cu_mail-classic_mail-brush_png | `assets/production/cultivation/mail-classic/mail-brush.png` | `art_sources/cultivation-adoption-20261005/mail-classic/mail-brush.png` | da772ad8f3ae |
| cu_mail-classic_manifest_json | `assets/production/cultivation/mail-classic/manifest.json` | `art_sources/cultivation-adoption-20261005/mail-classic/manifest.json` | 76525895702f |
| cu_mail-classic_paper-panel_png | `assets/production/cultivation/mail-classic/paper-panel.png` | `art_sources/cultivation-adoption-20261005/mail-classic/paper-panel.png` | 1c1253dae68e |
| cu_mail-classic_portraits_lu-menu_png | `assets/production/cultivation/mail-classic/portraits/lu-menu.png` | `art_sources/cultivation-adoption-20261005/mail-classic/portraits/lu-menu.png` | 50aa23c11a8e |
| cu_mail-classic_portraits_neighbor-menu_png | `assets/production/cultivation/mail-classic/portraits/neighbor-menu.png` | `art_sources/cultivation-adoption-20261005/mail-classic/portraits/neighbor-menu.png` | de04865c9188 |
| cu_mail-classic_portraits_ye-menu_webp | `assets/production/cultivation/mail-classic/portraits/ye-menu.webp` | `art_sources/cultivation-adoption-20261005/mail-classic/portraits/ye-menu.webp` | 6cabc1cf9c88 |
| cu_mail-classic_portraits_zhou-menu_png | `assets/production/cultivation/mail-classic/portraits/zhou-menu.png` | `art_sources/cultivation-adoption-20261005/mail-classic/portraits/zhou-menu.png` | 49279e4ac81c |
| cu_mail-v7_food_png | `assets/production/cultivation/mail-v7/food.png` | `art_sources/cultivation-adoption-20261005/mail-v7/food.png` | 700cc284db48 |
| cu_mail-v7_herb_png | `assets/production/cultivation/mail-v7/herb.png` | `art_sources/cultivation-adoption-20261005/mail-v7/herb.png` | 7fc4608c6ccb |
| cu_mail-v7_pouch_png | `assets/production/cultivation/mail-v7/pouch.png` | `art_sources/cultivation-adoption-20261005/mail-v7/pouch.png` | 20886edb3612 |
| cu_mail-v7_return_png | `assets/production/cultivation/mail-v7/return.png` | `art_sources/cultivation-adoption-20261005/mail-v7/return.png` | 0298fa33bc6c |
| cu_portraits_hero_listen_v2_png | `assets/production/cultivation/portraits/hero_listen_v2.png` | `art_sources/cultivation-adoption-20261005/portraits/hero_listen_v2.png` | eceabdc48b8e |
| cu_portraits_ye_tidy_v2_png | `assets/production/cultivation/portraits/ye_tidy_v2.png` | `art_sources/cultivation-adoption-20261005/portraits/ye_tidy_v2.png` | 51bcc02f20e2 |
| cu_story-v6_lu_png | `assets/production/cultivation/story-v6/lu.png` | `art_sources/cultivation-adoption-20261005/story-v6/lu.png` | 7e5c4024a9cb |
| cu_story-v6_neighbor_png | `assets/production/cultivation/story-v6/neighbor.png` | `art_sources/cultivation-adoption-20261005/story-v6/neighbor.png` | 0ac29721e424 |
| cu_story-v6_zhou_png | `assets/production/cultivation/story-v6/zhou.png` | `art_sources/cultivation-adoption-20261005/story-v6/zhou.png` | 8c61ee550b98 |
| cu_ui_dock_icons_v2_png | `assets/production/cultivation/ui/dock_icons_v2.png` | `art_sources/cultivation-adoption-20261005/ui/dock_icons_v2.png` | 1288cac013c6 |
| cu_ui_dock_icons_v3_png | `assets/production/cultivation/ui/dock_icons_v3.png` | `art_sources/cultivation-adoption-20261005/ui/dock_icons_v3.png` | 0ed4c96f97b8 |
| cu_ui_dock_scroll_v2_png | `assets/production/cultivation/ui/dock_scroll_v2.png` | `art_sources/cultivation-adoption-20261005/ui/dock_scroll_v2.png` | 13434460ac57 |
| cu_ui_interaction_ui_v4_png | `assets/production/cultivation/ui/interaction_ui_v4.png` | `art_sources/cultivation-adoption-20261005/ui/interaction_ui_v4.png` | ec8ba19d13c7 |
| cu_ui_ornaments_v3_png | `assets/production/cultivation/ui/ornaments_v3.png` | `art_sources/cultivation-adoption-20261005/ui/ornaments_v3.png` | 229e911d3bec |
| cu_v10_B02-activity-v10_png | `assets/production/cultivation/v10/B02-activity-v10.png` | `art_sources/cultivation-adoption-20261005/v10/B02-activity-v10.png` | 24253a84340e |
| cu_v10_D02-activity-v10_png | `assets/production/cultivation/v10/D02-activity-v10.png` | `art_sources/cultivation-adoption-20261005/v10/D02-activity-v10.png` | a07e401a1206 |
| cu_v5_avatar-atlas_png | `assets/production/cultivation/v5/avatar-atlas.png` | `art_sources/cultivation-adoption-20261005/v5/avatar-atlas.png` | ee94a65209e1 |
| cu_v5_basic-atlas_png | `assets/production/cultivation/v5/basic-atlas.png` | `art_sources/cultivation-adoption-20261005/v5/basic-atlas.png` | 667df8f92d60 |
| cu_v5_guidance-atlas_png | `assets/production/cultivation/v5/guidance-atlas.png` | `art_sources/cultivation-adoption-20261005/v5/guidance-atlas.png` | f9c890d1ef1c |
| cu_v7_breathing-six-v1_png | `assets/production/cultivation/v7/breathing-six-v1.png` | `art_sources/cultivation-adoption-20261005/v7/breathing-six-v1.png` | 199dcd281590 |
| cu_v8_A01-six-v1_png | `assets/production/cultivation/v8/A01-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/A01-six-v1.png` | 0b610e9aa4a5 |
| cu_v8_A02-six-v1_png | `assets/production/cultivation/v8/A02-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/A02-six-v1.png` | 343e81c95bdf |
| cu_v8_A03-six-v1_png | `assets/production/cultivation/v8/A03-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/A03-six-v1.png` | 50f8f701c0c7 |
| cu_v8_A04-six-v1_png | `assets/production/cultivation/v8/A04-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/A04-six-v1.png` | b866e3cafb78 |
| cu_v8_A05-six-v1_png | `assets/production/cultivation/v8/A05-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/A05-six-v1.png` | d67692cb2164 |
| cu_v8_A06-six-v1_png | `assets/production/cultivation/v8/A06-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/A06-six-v1.png` | 0680c2c57fb6 |
| cu_v8_B02-six-v1_png | `assets/production/cultivation/v8/B02-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/B02-six-v1.png` | 05d2076956d0 |
| cu_v8_B03-six-v1_png | `assets/production/cultivation/v8/B03-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/B03-six-v1.png` | 34b1476571e1 |
| cu_v8_B04-six-v1_png | `assets/production/cultivation/v8/B04-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/B04-six-v1.png` | 249b6b1fe51d |
| cu_v8_B06-six-v1_png | `assets/production/cultivation/v8/B06-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/B06-six-v1.png` | ac402bb8cadb |
| cu_v8_C01-six-v1_png | `assets/production/cultivation/v8/C01-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/C01-six-v1.png` | 60384cb1c73e |
| cu_v8_C02-six-v1_png | `assets/production/cultivation/v8/C02-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/C02-six-v1.png` | b108bed7322e |
| cu_v8_D01-six-v2_png | `assets/production/cultivation/v8/D01-six-v2.png` | `art_sources/cultivation-adoption-20261005/v8/D01-six-v2.png` | d0e3fd82d176 |
| cu_v8_D02-six-v2_png | `assets/production/cultivation/v8/D02-six-v2.png` | `art_sources/cultivation-adoption-20261005/v8/D02-six-v2.png` | 6b7b5e7ea282 |
| cu_v8_D03-six-v1_png | `assets/production/cultivation/v8/D03-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/D03-six-v1.png` | 64d7ec1aa783 |
| cu_v8_D04-six-v1_png | `assets/production/cultivation/v8/D04-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/D04-six-v1.png` | 2b162d0e9701 |
| cu_v8_D05-six-v1_png | `assets/production/cultivation/v8/D05-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/D05-six-v1.png` | 8e8c0687ce53 |
| cu_v8_G01-six-v2_png | `assets/production/cultivation/v8/G01-six-v2.png` | `art_sources/cultivation-adoption-20261005/v8/G01-six-v2.png` | 77d00b9f248c |
| cu_v8_G02-six-v2_png | `assets/production/cultivation/v8/G02-six-v2.png` | `art_sources/cultivation-adoption-20261005/v8/G02-six-v2.png` | 1f728a81b7cc |
| cu_v8_K01-six-v2_png | `assets/production/cultivation/v8/K01-six-v2.png` | `art_sources/cultivation-adoption-20261005/v8/K01-six-v2.png` | 980ad927c389 |
| cu_v8_K02-six-v2_png | `assets/production/cultivation/v8/K02-six-v2.png` | `art_sources/cultivation-adoption-20261005/v8/K02-six-v2.png` | 60ff32c6a4ab |
| cu_v8_P01-six-v1_png | `assets/production/cultivation/v8/P01-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/P01-six-v1.png` | 69fb1e545406 |
| cu_v8_P02-six-v2_png | `assets/production/cultivation/v8/P02-six-v2.png` | `art_sources/cultivation-adoption-20261005/v8/P02-six-v2.png` | 45d5f1dfd786 |
| cu_v8_P03-six-v1_png | `assets/production/cultivation/v8/P03-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/P03-six-v1.png` | cd5226ab511a |
| cu_v8_W01-six-v1_png | `assets/production/cultivation/v8/W01-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/W01-six-v1.png` | 3e251848913b |
| cu_v8_W02-six-v1_png | `assets/production/cultivation/v8/W02-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/W02-six-v1.png` | 4f58e831813b |
| cu_v8_W03-six-v1_png | `assets/production/cultivation/v8/W03-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/W03-six-v1.png` | 1f8aab92b249 |
| cu_v8_W04-six-v1_png | `assets/production/cultivation/v8/W04-six-v1.png` | `art_sources/cultivation-adoption-20261005/v8/W04-six-v1.png` | 96e2251eae20 |
| cu_v9_D01-rig-trial-v1_png | `assets/production/cultivation/v9/D01-rig-trial-v1.png` | `art_sources/cultivation-adoption-20261005/v9/D01-rig-trial-v1.png` | ed9bd803004c |
| cu_v9_G01-rig-trial-v1_png | `assets/production/cultivation/v9/G01-rig-trial-v1.png` | `art_sources/cultivation-adoption-20261005/v9/G01-rig-trial-v1.png` | 09417a00d7e1 |
| cu_v9_G02-rig-trial-v1_png | `assets/production/cultivation/v9/G02-rig-trial-v1.png` | `art_sources/cultivation-adoption-20261005/v9/G02-rig-trial-v1.png` | 7cd901d9aaa9 |
| cu_visitors-v1_head-anchors_json | `assets/production/cultivation/visitors-v1/head-anchors.json` | `art_sources/cultivation-adoption-20261005/visitors-v1/head-anchors.json` | 47e95b908179 |
| cu_visitors-v1_meng_zhiwei_png | `assets/production/cultivation/visitors-v1/meng_zhiwei.png` | `art_sources/cultivation-adoption-20261005/visitors-v1/meng_zhiwei.png` | c9da525034a5 |
| cu_visitors-v1_mo_songnian_png | `assets/production/cultivation/visitors-v1/mo_songnian.png` | `art_sources/cultivation-adoption-20261005/visitors-v1/mo_songnian.png` | 439acadbdfe2 |
| cu_visitors-v1_reception-porch_png | `assets/production/cultivation/visitors-v1/reception-porch.png` | `art_sources/cultivation-adoption-20261005/visitors-v1/reception-porch.png` | ca1c58a00af5 |
| cu_visitors-v1_zhaochuan_courier_png | `assets/production/cultivation/visitors-v1/zhaochuan_courier.png` | `art_sources/cultivation-adoption-20261005/visitors-v1/zhaochuan_courier.png` | dae32631fe87 |
| cu_household-v1_goose_png | `assets/production/cultivation/household-v1/goose.png` | `art_sources/guiyun-household-20261007/out/household-v1/goose.png` | 8105f4bab887 |
| cu_mail-classic_portraits_shimu-menu_png | `assets/production/cultivation/mail-classic/portraits/shimu-menu.png` | `art_sources/guiyun-inkcloud-cn-20261008/menu/shimu-menu.png` | 5a5adeb0d923 |
| cu_mail-classic_portraits_yin-menu_png | `assets/production/cultivation/mail-classic/portraits/yin-menu.png` | `art_sources/guiyun-inkcloud-cn-20261008/menu/yin-menu.png` | 60631a1475c3 |
| cu_mail-classic_portraits_zhou-menu-inkcloud_png | `assets/production/cultivation/mail-classic/portraits/zhou-menu-inkcloud.png` | `art_sources/guiyun-inkcloud-cn-20261008/menu/zhou-menu.png` | bcbfb38c73ed |
| cu_household-v1_dou_png | `assets/production/cultivation/household-v1/dou.png` | `art_sources/guiyun-inkcloud-cn-20261008/out/household-v1/dou.png` | e100e9bff11d |
| cu_household-v1_fang_png | `assets/production/cultivation/household-v1/fang.png` | `art_sources/guiyun-inkcloud-cn-20261008/out/household-v1/fang.png` | 9b055508e9f2 |
| cu_household-v1_hero_long_png | `assets/production/cultivation/household-v1/hero_long.png` | `art_sources/guiyun-inkcloud-cn-20261008/out/household-v1/hero_long.png` | ff1f0e712bbc |
| cu_household-v1_hero_mid_png | `assets/production/cultivation/household-v1/hero_mid.png` | `art_sources/guiyun-inkcloud-cn-20261008/out/household-v1/hero_mid.png` | d2f96d484fff |
| cu_household-v1_hero_short_png | `assets/production/cultivation/household-v1/hero_short.png` | `art_sources/guiyun-inkcloud-cn-20261008/out/household-v1/hero_short.png` | 1c6bff2623e7 |
| cu_household-v1_man_png | `assets/production/cultivation/household-v1/man.png` | `art_sources/guiyun-inkcloud-cn-20261008/out/household-v1/man.png` | 0af6691dd0ad |
| cu_household-v1_shimu_png | `assets/production/cultivation/household-v1/shimu.png` | `art_sources/guiyun-performance-fix-20261012/shimu.png` | 49e0792cf270 |
| cu_household-v1_yin_png | `assets/production/cultivation/household-v1/yin.png` | `art_sources/guiyun-performance-fix-20261012/yin.png` | e73da99e8fd5 |
| cu_household-v1_zhong_png | `assets/production/cultivation/household-v1/zhong.png` | `art_sources/guiyun-inkcloud-cn-20261008/out/household-v1/zhong.png` | e52eaf3128e1 |
| cu_household-v1_zhou_png | `assets/production/cultivation/household-v1/zhou.png` | `art_sources/guiyun-inkcloud-cn-20261008/out/household-v1/zhou.png` | 5c69a0f0e039 |
| cu_household-v1_lu_png | `assets/production/cultivation/household-v1/lu.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/lu.png` | bbcfa03bb972 |
| cu_household-v1_lu_normal_png | `assets/production/cultivation/household-v1/lu_normal.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/lu_normal.png` | bbcfa03bb972 |
| cu_household-v1_lu_sad_png | `assets/production/cultivation/household-v1/lu_sad.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/lu_sad.png` | ba3c29b3e12b |
| cu_household-v1_lu_serious_png | `assets/production/cultivation/household-v1/lu_serious.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/lu_serious.png` | 171ec9427b6f |
| cu_household-v1_lu_smile_png | `assets/production/cultivation/household-v1/lu_smile.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/lu_smile.png` | c307c8d652c3 |
| cu_household-v1_lu_surprise_png | `assets/production/cultivation/household-v1/lu_surprise.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/lu_surprise.png` | 16c354d37b67 |
| cu_household-v1_lu_worry_png | `assets/production/cultivation/household-v1/lu_worry.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/lu_worry.png` | 905db8615455 |
| cu_household-v1_meng_zhiwei_png | `assets/production/cultivation/household-v1/meng_zhiwei.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/meng_zhiwei.png` | a0c30acc82a3 |
| cu_household-v1_meng_zhiwei_normal_png | `assets/production/cultivation/household-v1/meng_zhiwei_normal.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/meng_zhiwei_normal.png` | a0c30acc82a3 |
| cu_household-v1_meng_zhiwei_serious_png | `assets/production/cultivation/household-v1/meng_zhiwei_serious.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/meng_zhiwei_serious.png` | fc336bd27177 |
| cu_household-v1_meng_zhiwei_smile_png | `assets/production/cultivation/household-v1/meng_zhiwei_smile.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/meng_zhiwei_smile.png` | 62d6a922aff3 |
| cu_household-v1_meng_zhiwei_worry_png | `assets/production/cultivation/household-v1/meng_zhiwei_worry.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/meng_zhiwei_worry.png` | 7cce7060618f |
| cu_household-v1_mo_songnian_png | `assets/production/cultivation/household-v1/mo_songnian.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/mo_songnian.png` | 0b7083e28cae |
| cu_household-v1_mo_songnian_normal_png | `assets/production/cultivation/household-v1/mo_songnian_normal.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/mo_songnian_normal.png` | 0b7083e28cae |
| cu_household-v1_mo_songnian_serious_png | `assets/production/cultivation/household-v1/mo_songnian_serious.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/mo_songnian_serious.png` | 01e789064b57 |
| cu_household-v1_mo_songnian_smile_png | `assets/production/cultivation/household-v1/mo_songnian_smile.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/mo_songnian_smile.png` | dae7ad02829c |
| cu_household-v1_mo_songnian_surprise_png | `assets/production/cultivation/household-v1/mo_songnian_surprise.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/mo_songnian_surprise.png` | a4c6e3ab11de |
| cu_household-v1_neighbor_png | `assets/production/cultivation/household-v1/neighbor.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/neighbor.png` | f734acbdac96 |
| cu_household-v1_neighbor_normal_png | `assets/production/cultivation/household-v1/neighbor_normal.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/neighbor_normal.png` | f734acbdac96 |
| cu_household-v1_neighbor_smile_png | `assets/production/cultivation/household-v1/neighbor_smile.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/neighbor_smile.png` | 6b2ae4e4b1ca |
| cu_household-v1_neighbor_worry_png | `assets/production/cultivation/household-v1/neighbor_worry.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/neighbor_worry.png` | db98d42aa26a |
| cu_household-v1_zhaochuan_courier_png | `assets/production/cultivation/household-v1/zhaochuan_courier.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/zhaochuan_courier.png` | d036f4dd637f |
| cu_household-v1_zhaochuan_courier_normal_png | `assets/production/cultivation/household-v1/zhaochuan_courier_normal.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/zhaochuan_courier_normal.png` | d036f4dd637f |
| cu_household-v1_zhaochuan_courier_serious_png | `assets/production/cultivation/household-v1/zhaochuan_courier_serious.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/zhaochuan_courier_serious.png` | c73c8501025f |
| cu_household-v1_zhaochuan_courier_smile_png | `assets/production/cultivation/household-v1/zhaochuan_courier_smile.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/zhaochuan_courier_smile.png` | 9a27c3e936b1 |
| cu_household-v1_zhaochuan_courier_surprise_png | `assets/production/cultivation/household-v1/zhaochuan_courier_surprise.png` | `art_sources/guiyun-outsiders-q-20261008/out/household-v1/zhaochuan_courier_surprise.png` | 801dddaf1e2f |
| cu_household-v1_dou_angry_png | `assets/production/cultivation/household-v1/dou_angry.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/dou_angry.png` | 0b65a2824f42 |
| cu_household-v1_dou_normal_png | `assets/production/cultivation/household-v1/dou_normal.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/dou_normal.png` | 457e9bbbc32e |
| cu_household-v1_dou_sad_png | `assets/production/cultivation/household-v1/dou_sad.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/dou_sad.png` | d82a07accf4b |
| cu_household-v1_dou_serious_png | `assets/production/cultivation/household-v1/dou_serious.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/dou_serious.png` | 087c27195053 |
| cu_household-v1_dou_smile_png | `assets/production/cultivation/household-v1/dou_smile.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/dou_smile.png` | 620ffacf75a7 |
| cu_household-v1_dou_surprise_png | `assets/production/cultivation/household-v1/dou_surprise.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/dou_surprise.png` | b8514d84794f |
| cu_household-v1_dou_worry_png | `assets/production/cultivation/household-v1/dou_worry.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/dou_worry.png` | f499cc7226cc |
| cu_household-v1_fang_angry_png | `assets/production/cultivation/household-v1/fang_angry.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/fang_angry.png` | b5e41611f02f |
| cu_household-v1_fang_normal_png | `assets/production/cultivation/household-v1/fang_normal.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/fang_normal.png` | 6fcdbbae2fb3 |
| cu_household-v1_fang_sad_png | `assets/production/cultivation/household-v1/fang_sad.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/fang_sad.png` | b1f56438ed9f |
| cu_household-v1_fang_serious_png | `assets/production/cultivation/household-v1/fang_serious.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/fang_serious.png` | 0291561267e7 |
| cu_household-v1_fang_smile_png | `assets/production/cultivation/household-v1/fang_smile.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/fang_smile.png` | 88955f05eda8 |
| cu_household-v1_fang_surprise_png | `assets/production/cultivation/household-v1/fang_surprise.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/fang_surprise.png` | 731cb318d499 |
| cu_household-v1_fang_worry_png | `assets/production/cultivation/household-v1/fang_worry.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/fang_worry.png` | fac62bce700b |
| cu_household-v1_goose_normal_png | `assets/production/cultivation/household-v1/goose_normal.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/goose_normal.png` | c1ae04e7e6ba |
| cu_household-v1_hero_long_angry_png | `assets/production/cultivation/household-v1/hero_long_angry.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/hero_long_angry.png` | aaab3e272265 |
| cu_household-v1_hero_long_normal_png | `assets/production/cultivation/household-v1/hero_long_normal.png` | `art_sources/guiyun-playtest-fix-20261011/out/household-v1/hero_long_normal.png` | dfa819d02ff8 |
| cu_household-v1_hero_long_sad_png | `assets/production/cultivation/household-v1/hero_long_sad.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/hero_long_sad.png` | 153dadde3e1b |
| cu_household-v1_hero_long_smile_png | `assets/production/cultivation/household-v1/hero_long_smile.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/hero_long_smile.png` | e4cadfd670e2 |
| cu_household-v1_hero_mid_normal_png | `assets/production/cultivation/household-v1/hero_mid_normal.png` | `art_sources/guiyun-playtest-fix-20261011/out/household-v1/hero_mid_normal.png` | 173f2f9cf339 |
| cu_household-v1_hero_mid_smile_png | `assets/production/cultivation/household-v1/hero_mid_smile.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/hero_mid_smile.png` | 7adab44e0c03 |
| cu_household-v1_hero_short_normal_png | `assets/production/cultivation/household-v1/hero_short_normal.png` | `art_sources/guiyun-playtest-fix-20261011/out/household-v1/hero_short_normal.png` | 048d4c3d3c1c |
| cu_household-v1_man_normal_png | `assets/production/cultivation/household-v1/man_normal.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/man_normal.png` | a81efeedaacb |
| cu_household-v1_man_sad_png | `assets/production/cultivation/household-v1/man_sad.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/man_sad.png` | 4e27a5d7d829 |
| cu_household-v1_man_smile_png | `assets/production/cultivation/household-v1/man_smile.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/man_smile.png` | 586ee93dfcf7 |
| cu_household-v1_man_surprise_png | `assets/production/cultivation/household-v1/man_surprise.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/man_surprise.png` | 9b580b0eec68 |
| cu_household-v1_man_worry_png | `assets/production/cultivation/household-v1/man_worry.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/man_worry.png` | 4d495db0a9d2 |
| cu_household-v1_shimu_angry_png | `assets/production/cultivation/household-v1/shimu_angry.png` | `art_sources/guiyun-performance-fix-20261012/shimu_angry.png` | c15749e9db57 |
| cu_household-v1_shimu_normal_png | `assets/production/cultivation/household-v1/shimu_normal.png` | `art_sources/guiyun-performance-fix-20261012/shimu_normal.png` | d545db85e5f1 |
| cu_household-v1_shimu_sad_png | `assets/production/cultivation/household-v1/shimu_sad.png` | `art_sources/guiyun-performance-fix-20261012/shimu_sad.png` | 61e646aeb8bb |
| cu_household-v1_shimu_serious_png | `assets/production/cultivation/household-v1/shimu_serious.png` | `art_sources/guiyun-performance-fix-20261012/shimu_serious.png` | 7ef3cbee5f1a |
| cu_household-v1_shimu_smile_png | `assets/production/cultivation/household-v1/shimu_smile.png` | `art_sources/guiyun-performance-fix-20261012/shimu_smile.png` | c03fb940d185 |
| cu_household-v1_shimu_surprise_png | `assets/production/cultivation/household-v1/shimu_surprise.png` | `art_sources/guiyun-performance-fix-20261012/shimu_surprise.png` | f6c5da891368 |
| cu_household-v1_shimu_worry_png | `assets/production/cultivation/household-v1/shimu_worry.png` | `art_sources/guiyun-performance-fix-20261012/shimu_worry.png` | f5de6c4f8f61 |
| cu_household-v1_ye_png | `assets/production/cultivation/household-v1/ye.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/ye.png` | 79b1d62ee139 |
| cu_household-v1_ye_angry_png | `assets/production/cultivation/household-v1/ye_angry.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/ye_angry.png` | 5033d77eb928 |
| cu_household-v1_ye_normal_png | `assets/production/cultivation/household-v1/ye_normal.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/ye_normal.png` | 8662f3c4d5ed |
| cu_household-v1_ye_sad_png | `assets/production/cultivation/household-v1/ye_sad.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/ye_sad.png` | 5b09f46ecd0a |
| cu_household-v1_ye_serious_png | `assets/production/cultivation/household-v1/ye_serious.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/ye_serious.png` | 885d2e4a4610 |
| cu_household-v1_ye_smile_png | `assets/production/cultivation/household-v1/ye_smile.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/ye_smile.png` | 0d79f4244ac5 |
| cu_household-v1_ye_surprise_png | `assets/production/cultivation/household-v1/ye_surprise.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/ye_surprise.png` | fe800aa2a39d |
| cu_household-v1_ye_worry_png | `assets/production/cultivation/household-v1/ye_worry.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/ye_worry.png` | 4b7cee1bdb95 |
| cu_household-v1_yin_angry_png | `assets/production/cultivation/household-v1/yin_angry.png` | `art_sources/guiyun-performance-fix-20261012/yin_angry.png` | f5ff12792a84 |
| cu_household-v1_yin_normal_png | `assets/production/cultivation/household-v1/yin_normal.png` | `art_sources/guiyun-performance-fix-20261012/yin_normal.png` | 57656dbfbabc |
| cu_household-v1_yin_sad_png | `assets/production/cultivation/household-v1/yin_sad.png` | `art_sources/guiyun-performance-fix-20261012/yin_sad.png` | 1d3c2b4294a7 |
| cu_household-v1_yin_serious_png | `assets/production/cultivation/household-v1/yin_serious.png` | `art_sources/guiyun-performance-fix-20261012/yin_serious.png` | ab415a93a3ba |
| cu_household-v1_yin_smile_png | `assets/production/cultivation/household-v1/yin_smile.png` | `art_sources/guiyun-performance-fix-20261012/yin_smile.png` | d46135983b65 |
| cu_household-v1_yin_surprise_png | `assets/production/cultivation/household-v1/yin_surprise.png` | `art_sources/guiyun-performance-fix-20261012/yin_surprise.png` | b73d29e7a7d8 |
| cu_household-v1_yin_worry_png | `assets/production/cultivation/household-v1/yin_worry.png` | `art_sources/guiyun-performance-fix-20261012/yin_worry.png` | f2babf317143 |
| cu_household-v1_zhong_angry_png | `assets/production/cultivation/household-v1/zhong_angry.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/zhong_angry.png` | 991f1d1bade2 |
| cu_household-v1_zhong_normal_png | `assets/production/cultivation/household-v1/zhong_normal.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/zhong_normal.png` | 43f99eae22e0 |
| cu_household-v1_zhong_sad_png | `assets/production/cultivation/household-v1/zhong_sad.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/zhong_sad.png` | 8b399bf8aa7b |
| cu_household-v1_zhong_serious_png | `assets/production/cultivation/household-v1/zhong_serious.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/zhong_serious.png` | 0d2802d21ac0 |
| cu_household-v1_zhong_smile_png | `assets/production/cultivation/household-v1/zhong_smile.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/zhong_smile.png` | 419770679d8c |
| cu_household-v1_zhong_surprise_png | `assets/production/cultivation/household-v1/zhong_surprise.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/zhong_surprise.png` | d196c8a6d65a |
| cu_household-v1_zhong_worry_png | `assets/production/cultivation/household-v1/zhong_worry.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/zhong_worry.png` | 92a3fa7b3b68 |
| cu_household-v1_zhou_angry_png | `assets/production/cultivation/household-v1/zhou_angry.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/zhou_angry.png` | 029d94b1a4d6 |
| cu_household-v1_zhou_normal_png | `assets/production/cultivation/household-v1/zhou_normal.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/zhou_normal.png` | 49bd17cf0378 |
| cu_household-v1_zhou_sad_png | `assets/production/cultivation/household-v1/zhou_sad.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/zhou_sad.png` | b778d1f34f5c |
| cu_household-v1_zhou_serious_png | `assets/production/cultivation/household-v1/zhou_serious.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/zhou_serious.png` | cc229bdf1661 |
| cu_household-v1_zhou_smile_png | `assets/production/cultivation/household-v1/zhou_smile.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/zhou_smile.png` | 7cc415d9c518 |
| cu_household-v1_zhou_surprise_png | `assets/production/cultivation/household-v1/zhou_surprise.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/zhou_surprise.png` | b81838ded763 |
| cu_household-v1_zhou_worry_png | `assets/production/cultivation/household-v1/zhou_worry.png` | `art_sources/guiyun-q-moods-20261008/out/household-v1/zhou_worry.png` | 2746b3dc7acf |
| cu_mail-classic_portraits_dou-menu_png | `assets/production/cultivation/mail-classic/portraits/dou-menu.png` | `art_sources/guiyun-side-q-20261008/mail/dou-menu.png` | 8e82bd594d4b |
| cu_mail-classic_portraits_fang-menu_png | `assets/production/cultivation/mail-classic/portraits/fang-menu.png` | `art_sources/guiyun-side-q-20261008/mail/fang-menu.png` | cf1ba9f21ea2 |
| cu_mail-classic_portraits_man-menu_png | `assets/production/cultivation/mail-classic/portraits/man-menu.png` | `art_sources/guiyun-side-q-20261008/mail/man-menu.png` | 5fa83972d95d |
| cu_mail-classic_portraits_zhong-menu_png | `assets/production/cultivation/mail-classic/portraits/zhong-menu.png` | `art_sources/guiyun-side-q-20261008/mail/zhong-menu.png` | d47c3ccaf461 |
| cu_household-v1_dou_sleep_png | `assets/production/cultivation/household-v1/dou_sleep.png` | `art_sources/guiyun-side-q-20261008/out/dou_sleep.png` | b092777fc7cc |
| cu_household-v1_fang_hurt_normal_png | `assets/production/cultivation/household-v1/fang_hurt_normal.png` | `art_sources/guiyun-side-q-20261008/out/fang_hurt_normal.png` | 45dcc2472d74 |
| cu_household-v1_fang_hurt_sad_png | `assets/production/cultivation/household-v1/fang_hurt_sad.png` | `art_sources/guiyun-side-q-20261008/out/fang_hurt_sad.png` | 305ab30512a9 |
| cu_household-v1_fang_hurt_serious_png | `assets/production/cultivation/household-v1/fang_hurt_serious.png` | `art_sources/guiyun-side-q-20261008/out/fang_hurt_serious.png` | b9f427acdeb7 |
| cu_household-v1_fang_hurt_smile_png | `assets/production/cultivation/household-v1/fang_hurt_smile.png` | `art_sources/guiyun-side-q-20261008/out/fang_hurt_smile.png` | dad0ec9feff6 |
| cu_story-bg-v1_bamboo_path_png | `assets/production/cultivation/story-bg-v1/bamboo_path.png` | `art_sources/guiyun-story-bg-20261008/bg_bamboo_path.png` | acb5881e1f64 |
| cu_story-bg-v1_herb_garden_png | `assets/production/cultivation/story-bg-v1/herb_garden.png` | `art_sources/guiyun-story-bg-20261008/bg_herb_garden.png` | 8ab5e3977df7 |
| cu_story-bg-v1_kitchen_png | `assets/production/cultivation/story-bg-v1/kitchen.png` | `art_sources/guiyun-story-bg-20261008/bg_kitchen.png` | e17ccbe404d5 |
| cu_story-bg-v1_market_town_png | `assets/production/cultivation/story-bg-v1/market_town.png` | `art_sources/guiyun-story-bg-20261008/bg_market_town.png` | 86ca5cd556e4 |
| cu_story-bg-v1_night_bamboo_path_png | `assets/production/cultivation/story-bg-v1/night_bamboo_path.png` | `art_sources/guiyun-story-bg-20261008/bg_night_bamboo_path.png` | e77a390a90e8 |
| cu_story-bg-v1_night_courtyard_png | `assets/production/cultivation/story-bg-v1/night_courtyard.png` | `art_sources/guiyun-story-bg-20261008/bg_night_courtyard.png` | 84385ec578c6 |
| cu_story-bg-v1_night_kitchen_png | `assets/production/cultivation/story-bg-v1/night_kitchen.png` | `art_sources/guiyun-story-bg-20261008/bg_night_kitchen.png` | 24e568859127 |
| cu_story-bg-v1_night_study_png | `assets/production/cultivation/story-bg-v1/night_study.png` | `art_sources/guiyun-story-bg-20261008/bg_night_study.png` | d78b4da65d54 |
| cu_story-bg-v1_road_after_rain_png | `assets/production/cultivation/story-bg-v1/road_after_rain.png` | `art_sources/guiyun-story-bg-20261008/bg_road_after_rain.png` | 06534f5907b6 |
| cu_story-bg-v1_study_png | `assets/production/cultivation/story-bg-v1/study.png` | `art_sources/guiyun-story-bg-20261008/bg_study.png` | 0c12821e39cc |
| cu_story-bg-v1_training_ground_png | `assets/production/cultivation/story-bg-v1/training_ground.png` | `art_sources/guiyun-story-bg-20261008/bg_training_ground.png` | ee8e871a525a |
| cu_story-bg-v1_xiangyang_road_png | `assets/production/cultivation/story-bg-v1/xiangyang_road.png` | `art_sources/guiyun-story-bg-20261008/bg_xiangyang_road.png` | ea0ae3e1d561 |
| cu_household-v1_pei_png | `assets/production/cultivation/household-v1/pei.png` | `art_sources/guiyun-performance-fix-20261012/pei.png` | 10cc707ba2b0 |
| cu_household-v1_pei_normal_png | `assets/production/cultivation/household-v1/pei_normal.png` | `art_sources/guiyun-performance-fix-20261012/pei_normal.png` | d60adba06841 |
| cu_household-v1_pei_sad_png | `assets/production/cultivation/household-v1/pei_sad.png` | `art_sources/guiyun-performance-fix-20261012/pei_sad.png` | 0731be301461 |
| cu_household-v1_pei_serious_png | `assets/production/cultivation/household-v1/pei_serious.png` | `art_sources/guiyun-performance-fix-20261012/pei_serious.png` | 1da4b1ff9119 |
| cu_household-v1_pei_smile_png | `assets/production/cultivation/household-v1/pei_smile.png` | `art_sources/guiyun-performance-fix-20261012/pei_smile.png` | eb620f9e599f |
| cu_household-v1_pei_surprise_png | `assets/production/cultivation/household-v1/pei_surprise.png` | `art_sources/guiyun-performance-fix-20261012/pei_surprise.png` | 6ba3e63c1270 |
| cu_household-v1_pei_worry_png | `assets/production/cultivation/household-v1/pei_worry.png` | `art_sources/guiyun-performance-fix-20261012/pei_worry.png` | f61216007cbf |
| cu_household-v1_peishu_png | `assets/production/cultivation/household-v1/peishu.png` | `art_sources/guiyun-neighbors-20261011/out/household-v1/peishu.png` | 85c1c5d7b6c5 |
| cu_household-v1_peishu_normal_png | `assets/production/cultivation/household-v1/peishu_normal.png` | `art_sources/guiyun-neighbors-20261011/out/household-v1/peishu_normal.png` | 19ae9f5b8565 |
| cu_household-v1_peishu_sad_png | `assets/production/cultivation/household-v1/peishu_sad.png` | `art_sources/guiyun-neighbors-20261011/out/household-v1/peishu_sad.png` | dba17d250dce |
| cu_household-v1_peishu_serious_png | `assets/production/cultivation/household-v1/peishu_serious.png` | `art_sources/guiyun-neighbors-20261011/out/household-v1/peishu_serious.png` | 11ae4111681f |
| cu_household-v1_peishu_smile_png | `assets/production/cultivation/household-v1/peishu_smile.png` | `art_sources/guiyun-neighbors-20261011/out/household-v1/peishu_smile.png` | d772520da92c |
| cu_household-v1_peishu_surprise_png | `assets/production/cultivation/household-v1/peishu_surprise.png` | `art_sources/guiyun-neighbors-20261011/out/household-v1/peishu_surprise.png` | d0c06f99a55d |
| cu_household-v1_peishu_worry_png | `assets/production/cultivation/household-v1/peishu_worry.png` | `art_sources/guiyun-neighbors-20261011/out/household-v1/peishu_worry.png` | 3f6bc048ff4c |
| cu_neighbors-v1_bookhouse_png | `assets/production/cultivation/neighbors-v1/bookhouse.png` | `art_sources/guiyun-neighbors-20261011/out/neighbors-v1/bookhouse.png` | 427c54f80bcd |
| cu_neighbors-v1_bookhouse_inside_png | `assets/production/cultivation/neighbors-v1/bookhouse_inside.png` | `art_sources/guiyun-neighbors-20261011/out/neighbors-v1/bookhouse_inside.png` | 305d33635776 |
| cu_neighbors-v1_bookhouse_night_png | `assets/production/cultivation/neighbors-v1/bookhouse_night.png` | `art_sources/guiyun-neighbors-20261011/out/neighbors-v1/bookhouse_night.png` | 06bbdba86894 |
| cu_neighbors-v1_terraces_png | `assets/production/cultivation/neighbors-v1/terraces.png` | `art_sources/guiyun-neighbors-20261011/out/neighbors-v1/terraces.png` | b040421afd28 |
| cu_neighbors-v1_watermill_png | `assets/production/cultivation/neighbors-v1/watermill.png` | `art_sources/guiyun-neighbors-20261011/out/neighbors-v1/watermill.png` | ee76201cb034 |
| cu_household-v1_hero_mid_angry_png | `assets/production/cultivation/household-v1/hero_mid_angry.png` | `art_sources/guiyun-playtest-fix-20261011/out/household-v1/hero_mid_angry.png` | 86f8b5ab7774 |
| cu_household-v1_hero_mid_sad_png | `assets/production/cultivation/household-v1/hero_mid_sad.png` | `art_sources/guiyun-playtest-fix-20261011/out/household-v1/hero_mid_sad.png` | c373303af1e6 |
| cu_household-v1_hero_short_angry_png | `assets/production/cultivation/household-v1/hero_short_angry.png` | `art_sources/guiyun-playtest-fix-20261011/out/household-v1/hero_short_angry.png` | d54fe9857dd8 |
| cu_household-v1_hero_short_sad_png | `assets/production/cultivation/household-v1/hero_short_sad.png` | `art_sources/guiyun-playtest-fix-20261011/out/household-v1/hero_short_sad.png` | f533436520d1 |
| cu_household-v1_hero_short_smile_png | `assets/production/cultivation/household-v1/hero_short_smile.png` | `art_sources/guiyun-playtest-fix-20261011/out/household-v1/hero_short_smile.png` | 7342d94eb1df |
| cu_place-icons-v1_bamboo_path_png | `assets/production/cultivation/place-icons-v1/bamboo_path.png` | `art_sources/guiyun-playtest-fix-20261011/out/place-icons-v1/bamboo_path.png` | 2493a4376d7b |
| cu_place-icons-v1_bookhouse_png | `assets/production/cultivation/place-icons-v1/bookhouse.png` | `art_sources/guiyun-playtest-fix-20261011/out/place-icons-v1/bookhouse.png` | 607f053c21e7 |
| cu_place-icons-v1_courtyard_png | `assets/production/cultivation/place-icons-v1/courtyard.png` | `art_sources/guiyun-playtest-fix-20261011/out/place-icons-v1/courtyard.png` | dadfbba25691 |
| cu_place-icons-v1_herb_garden_png | `assets/production/cultivation/place-icons-v1/herb_garden.png` | `art_sources/guiyun-playtest-fix-20261011/out/place-icons-v1/herb_garden.png` | edeec89bbece |
| cu_place-icons-v1_kitchen_png | `assets/production/cultivation/place-icons-v1/kitchen.png` | `art_sources/guiyun-playtest-fix-20261011/out/place-icons-v1/kitchen.png` | 65ab24f06e10 |
| cu_place-icons-v1_market_town_png | `assets/production/cultivation/place-icons-v1/market_town.png` | `art_sources/guiyun-playtest-fix-20261011/out/place-icons-v1/market_town.png` | 6cfc115dce02 |
| cu_place-icons-v1_reception_png | `assets/production/cultivation/place-icons-v1/reception.png` | `art_sources/guiyun-playtest-fix-20261011/out/place-icons-v1/reception.png` | 955f64064bda |
| cu_place-icons-v1_stream_png | `assets/production/cultivation/place-icons-v1/stream.png` | `art_sources/guiyun-playtest-fix-20261011/out/place-icons-v1/stream.png` | 733c32963b60 |
| cu_place-icons-v1_study_png | `assets/production/cultivation/place-icons-v1/study.png` | `art_sources/guiyun-playtest-fix-20261011/out/place-icons-v1/study.png` | 6e9243f6f1c8 |
| cu_place-icons-v1_terraces_png | `assets/production/cultivation/place-icons-v1/terraces.png` | `art_sources/guiyun-playtest-fix-20261011/out/place-icons-v1/terraces.png` | b2f6b95c79d4 |
| cu_place-icons-v1_training_ground_png | `assets/production/cultivation/place-icons-v1/training_ground.png` | `art_sources/guiyun-playtest-fix-20261011/out/place-icons-v1/training_ground.png` | 8479e1b72a25 |
| cu_place-icons-v1_watermill_png | `assets/production/cultivation/place-icons-v1/watermill.png` | `art_sources/guiyun-playtest-fix-20261011/out/place-icons-v1/watermill.png` | eefb5b3c146d |
| cu_mood-avatars-v1_happy_png | `assets/production/cultivation/mood-avatars-v1/happy.png` | `art_sources/guiyun-playtest-fix-20261011/avatar/avatar_happy.png` | ee4e38303fd7 |
| cu_mood-avatars-v1_calm_png | `assets/production/cultivation/mood-avatars-v1/calm.png` | `art_sources/guiyun-playtest-fix-20261011/avatar/full/avatar_calm.png` | b9f94deffec5 |
| cu_mood-avatars-v1_low_png | `assets/production/cultivation/mood-avatars-v1/low.png` | `art_sources/guiyun-playtest-fix-20261011/avatar/full/avatar_low.png` | a5c06a249b76 |
| cu_mood-avatars-v1_annoyed_png | `assets/production/cultivation/mood-avatars-v1/annoyed.png` | `art_sources/guiyun-playtest-fix-20261011/avatar/full/avatar_annoyed.png` | b345908bca23 |
| cu_mood-avatars-v1_happy_fx_png | `assets/production/cultivation/mood-avatars-v1/happy_fx.png` | `art_sources/guiyun-playtest-fix-20261011/avatar/avatar_happy.png` | fe2879100a9f |
| cu_mood-avatars-v1_calm_fx_png | `assets/production/cultivation/mood-avatars-v1/calm_fx.png` | `art_sources/guiyun-playtest-fix-20261011/avatar/full/avatar_calm.png` | 7f87d55409c0 |
| cu_mood-avatars-v1_low_fx_png | `assets/production/cultivation/mood-avatars-v1/low_fx.png` | `art_sources/guiyun-playtest-fix-20261011/avatar/full/avatar_low.png` | de50e967f988 |
| cu_mood-avatars-v1_annoyed_fx_png | `assets/production/cultivation/mood-avatars-v1/annoyed_fx.png` | `art_sources/guiyun-playtest-fix-20261011/avatar/full/avatar_annoyed.png` | 5646e90dabdb |

### icons-and-props

| ID | 正式路径 | 原件来源 | SHA256（前12位） |
| --- | --- | --- | --- |
| i_equipment_stats_v1 | `assets/production/icons-and-props/i_equipment_stats_v1.webp` | `art_sources/equipment-stat-icons-v1/atlas.png` | a728d997ef61 |
| i_qh_song_gifts_v1 | `assets/production/icons-and-props/i_qh_song_gifts_v1.webp` | `art_sources/qh-song-disguise-20261008/final/i_qh_song_gifts_v1.webp` | c258b793f880 |
| r_qh_song_basket_v1 | `assets/production/icons-and-props/r_qh_song_basket_v1.webp` | `art_sources/qh-song-disguise-20261008/final/r_qh_song_basket_v1.webp` | 7263c5e2db4c |
| r_qh_song_bundle_v1 | `assets/production/icons-and-props/r_qh_song_bundle_v1.webp` | `art_sources/qh-song-disguise-20261008/final/r_qh_song_bundle_v1.webp` | 3ec0f67c0f31 |
| a_opening_apothecary | `assets/production/icons-and-props/a_opening_apothecary.webp` | `assets/a_opening_apothecary.webp` | a179d22d55d3 |
| a_opening_aunt | `assets/production/icons-and-props/a_opening_aunt.webp` | `assets/a_opening_aunt.webp` | f3818c601c66 |
| a_opening_bailiff | `assets/production/icons-and-props/a_opening_bailiff.webp` | `assets/a_opening_bailiff.webp` | 167725940809 |
| a_opening_censhuang | `assets/production/icons-and-props/a_opening_censhuang.webp` | `assets/a_opening_censhuang.webp` | eb662f18f3c4 |
| a_opening_chen | `assets/production/icons-and-props/a_opening_chen.webp` | `assets/a_opening_chen.webp` | d42a0e2fe64b |
| a_opening_chengduo | `assets/production/icons-and-props/a_opening_chengduo.webp` | `assets/a_opening_chengduo.webp` | 37cc2a1401a3 |
| a_opening_hero_modern | `assets/production/icons-and-props/a_opening_hero_modern.webp` | `assets/a_opening_hero_modern.webp` | a55b9fc6828c |
| a_opening_hero_village | `assets/production/icons-and-props/a_opening_hero_village.webp` | `assets/a_opening_hero_village.webp` | aec9c67f514f |
| a_opening_luheng | `assets/production/icons-and-props/a_opening_luheng.webp` | `assets/a_opening_luheng.webp` | f2277c8c87ca |
| a_opening_procurement | `assets/production/icons-and-props/a_opening_procurement.webp` | `assets/a_opening_procurement.webp` | 72fd05c650ca |
| a_opening_procurement_aide | `assets/production/icons-and-props/a_opening_procurement_aide.webp` | `assets/a_opening_procurement_aide.webp` | 5b29962c118d |
| a_opening_retainer | `assets/production/icons-and-props/a_opening_retainer.webp` | `assets/a_opening_retainer.webp` | e3086c0ba640 |
| a_opening_steward | `assets/production/icons-and-props/a_opening_steward.webp` | `assets/a_opening_steward.webp` | 77e526e44d7d |
| a_opening_wukui | `assets/production/icons-and-props/a_opening_wukui.webp` | `assets/a_opening_wukui.webp` | a87fa0197f86 |
| a_opening_zhouyan | `assets/production/icons-and-props/a_opening_zhouyan.webp` | `assets/a_opening_zhouyan.webp` | e508ec4e47af |
| i_icons | `assets/production/icons-and-props/i_icons.webp` | `assets/i_icons.webp` | 718e537b7b35 |
| i_jianghu | `assets/production/icons-and-props/i_jianghu.webp` | `assets/i_jianghu.webp` | e0a8a47ace4c |
| r_qh_branch_v1 | `assets/production/icons-and-props/r_qh_branch_v1.webp` | `assets/r_qh_branch_v1.webp` | 903ca6105dc0 |
| r_qh_herb_v1 | `assets/production/icons-and-props/r_qh_herb_v1.webp` | `assets/r_qh_herb_v1.webp` | 4f1301259c1f |
| r_qh_reed_v1 | `assets/production/icons-and-props/r_qh_reed_v1.webp` | `assets/r_qh_reed_v1.webp` | 6afcde499803 |

### maps

| ID | 正式路径 | 原件来源 | SHA256（前12位） |
| --- | --- | --- | --- |
| m_prologue_backhill_v1 | `assets/production/maps/m_prologue_backhill_modular_20261008.webp` | `art_sources/qihe-modular-backhill-20261007/out/hd/bg.png` | 856fda01145d |
| m_prologue_backhill_props | `assets/production/maps/m_prologue_backhill_props_modular_20261008.webp` | `art_sources/qihe-modular-backhill-20261007/out/hd/props.png` | 746e47f3852f |
| m_qh_central | `assets/production/maps/m_qh_central_modular_20261007.webp` | `art_sources/qihe-modular-central-20261007/out/hd/bg.png` | 29131902cd53 |
| m_qh_central_props | `assets/production/maps/m_qh_central_props_modular_20261007.webp` | `art_sources/qihe-modular-central-20261007/out/hd/props.png` | d196c1ee93c6 |
| m_qh_east | `assets/production/maps/m_qh_east_modular_20261007.webp` | `art_sources/qihe-modular-east-20261007/out/hd/bg.png` | cf61bcbff784 |
| m_qh_east_props | `assets/production/maps/m_qh_east_props_modular_20261007.webp` | `art_sources/qihe-modular-east-20261007/out/hd/props.png` | 5e133c7db4ce |
| m_qh_north | `assets/production/maps/m_qh_north_modular_20261007.webp` | `art_sources/qihe-modular-north-20261007/out/hd/bg.png` | 155c5826263f |
| m_qh_north_props | `assets/production/maps/m_qh_north_props_modular_20261007.webp` | `art_sources/qihe-modular-north-20261007/out/hd/props.png` | f4e0173026a1 |
| m_qh_south | `assets/production/maps/m_qh_south_modular_20261007.webp` | `art_sources/qihe-modular-pilot-20261007/out/hd/bg.png` | fe7ec6b29dae |
| m_qh_south_props | `assets/production/maps/m_qh_south_props_modular_20261007.webp` | `art_sources/qihe-modular-pilot-20261007/out/hd/props.png` | 4318e22fd125 |
| m_qh_refuge | `assets/production/maps/m_qh_refuge_modular_20261007.webp` | `art_sources/qihe-modular-refuge-20261007/out/hd/bg.png` | f2491e6810f6 |
| m_qh_refuge_props | `assets/production/maps/m_qh_refuge_props_modular_20261007.webp` | `art_sources/qihe-modular-refuge-20261007/out/hd/props.png` | e2d83e8f08cf |
| m_qh_west | `assets/production/maps/m_qh_west_modular_20261007.webp` | `art_sources/qihe-modular-west-20261007/out/hd/bg.png` | ec45eaa6a745 |
| m_qh_west_props | `assets/production/maps/m_qh_west_props_modular_20261007.webp` | `art_sources/qihe-modular-west-20261007/out/hd/props.png` | 8f88852f191d |
| m_qh_mountain | `assets/production/maps/m_qh_mountain.webp` | `assets/m_qh_mountain.webp` | 189775e47904 |
| m_qh_mountain_fg | `assets/production/maps/m_qh_mountain_fg.webp` | `assets/m_qh_mountain_fg.webp` | b7fee52e3443 |
| m_qihe_chen_guest | `assets/production/maps/m_qihe_chen_guest.webp` | `assets/m_qihe_chen_guest.webp` | bbd8e51f1b7b |
| m_qihe_chen_guest_fg | `assets/production/maps/m_qihe_chen_guest_fg.webp` | `assets/m_qihe_chen_guest_fg.webp` | e0839624fc87 |
| m_qihe_chen_hall | `assets/production/maps/m_qihe_chen_hall.webp` | `assets/m_qihe_chen_hall.webp` | 92a04cf52b1f |
| m_qihe_chen_hall_fg | `assets/production/maps/m_qihe_chen_hall_fg.webp` | `assets/m_qihe_chen_hall_fg.webp` | 6fa2e00ef99a |
| m_qihe_clinic_interior | `assets/production/maps/m_qihe_clinic_interior.webp` | `assets/m_qihe_clinic_interior.webp` | 85a7011fd299 |
| m_qihe_clinic_interior_fg | `assets/production/maps/m_qihe_clinic_interior_fg.webp` | `assets/m_qihe_clinic_interior_fg.webp` | a3f72c366989 |
| m_qihe_inn_interior | `assets/production/maps/m_qihe_inn_interior.webp` | `assets/m_qihe_inn_interior.webp` | 305c94c84d82 |
| m_qihe_inn_interior_fg | `assets/production/maps/m_qihe_inn_interior_fg.webp` | `assets/m_qihe_inn_interior_fg.webp` | e2d117e3bb71 |
| m_qihe_ye_house | `assets/production/maps/m_qihe_ye_house.webp` | `assets/m_qihe_ye_house.webp` | 87ab18045b4e |
| m_qihe_ye_house_fg | `assets/production/maps/m_qihe_ye_house_fg.webp` | `assets/m_qihe_ye_house_fg.webp` | b7eb4b2676e9 |

### portraits

| ID | 正式路径 | 原件来源 | SHA256（前12位） |
| --- | --- | --- | --- |
| p_gy_hero_long | `assets/production/portraits/p_gy_hero_long.webp` | `art_sources/guiyun-inkcloud-cn-20261008/out/p_gy_hero_long.webp` | d0e188ff6435 |
| p_gy_hero_long_firm | `assets/production/portraits/p_gy_hero_long_firm.webp` | `art_sources/guiyun-inkcloud-cn-20261008/out/p_gy_hero_long_firm.webp` | 72172fa4c145 |
| p_gy_hero_long_hurt | `assets/production/portraits/p_gy_hero_long_hurt.webp` | `art_sources/guiyun-inkcloud-cn-20261008/out/p_gy_hero_long_hurt.webp` | ddcc183a190a |
| p_gy_hero_long_smile | `assets/production/portraits/p_gy_hero_long_smile.webp` | `art_sources/guiyun-inkcloud-cn-20261008/out/p_gy_hero_long_smile.webp` | 1e22dfbcb728 |
| p_gy_hero_long_surprise | `assets/production/portraits/p_gy_hero_long_surprise.webp` | `art_sources/guiyun-inkcloud-cn-20261008/out/p_gy_hero_long_surprise.webp` | 658fab07f191 |
| p_gy_hero_long_worry | `assets/production/portraits/p_gy_hero_long_worry.webp` | `art_sources/guiyun-inkcloud-cn-20261008/out/p_gy_hero_long_worry.webp` | 495ba68e8f3f |
| p_gy_yinhongying | `assets/production/portraits/p_gy_yinhongying.webp` | `art_sources/guiyun-inkcloud-cn-20261008/out/p_gy_yinhongying.webp` | 7e9ce34f5486 |
| p_gy_yinhongying_angry | `assets/production/portraits/p_gy_yinhongying_angry.webp` | `art_sources/guiyun-inkcloud-cn-20261008/out/p_gy_yinhongying_angry.webp` | 18ecbdf02fb3 |
| p_gy_yinhongying_happy | `assets/production/portraits/p_gy_yinhongying_happy.webp` | `art_sources/guiyun-inkcloud-cn-20261008/out/p_gy_yinhongying_happy.webp` | 37afa77f185c |
| p_gy_yinhongying_sad | `assets/production/portraits/p_gy_yinhongying_sad.webp` | `art_sources/guiyun-inkcloud-cn-20261008/out/p_gy_yinhongying_sad.webp` | 66824b088fdb |
| p_gy_yinhongying_surprise | `assets/production/portraits/p_gy_yinhongying_surprise.webp` | `art_sources/guiyun-inkcloud-cn-20261008/out/p_gy_yinhongying_surprise.webp` | 2d1dc41648ec |
| p_gy_yinhongying_tease | `assets/production/portraits/p_gy_yinhongying_tease.webp` | `art_sources/guiyun-inkcloud-cn-20261008/out/p_gy_yinhongying_tease.webp` | 1e896768d897 |
| p_qh_song_story | `assets/production/portraits/p_qh_song_story_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_song_story_hd_20261017.webp` | f0fa1471e48c |
| p_qh_song_story_firm | `assets/production/portraits/p_qh_song_story_firm_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_song_story_firm_hd_20261017.webp` | 0c386a22817e |
| p_qh_song_story_worry | `assets/production/portraits/p_qh_song_story_worry_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_song_story_worry_hd_20261017.webp` | 45c4da762538 |
| p_qh_censhuang_story | `assets/production/portraits/p_qh_censhuang_story_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_censhuang_story_hd_20261017.webp` | 0cbc95969256 |
| p_qh_censhuang_story_angry | `assets/production/portraits/p_qh_censhuang_story_angry_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_censhuang_story_angry_hd_20261017.webp` | b0095e05b563 |
| p_qh_censhuang_story_happy | `assets/production/portraits/p_qh_censhuang_story_happy_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_censhuang_story_happy_hd_20261017.webp` | 2adf0f3fe6c9 |
| p_qh_censhuang_story_sad | `assets/production/portraits/p_qh_censhuang_story_sad_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_censhuang_story_sad_hd_20261017.webp` | bb02ab57dd3a |
| p_qh_censhuang_story_surprise | `assets/production/portraits/p_qh_censhuang_story_surprise_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_censhuang_story_surprise_hd_20261017.webp` | 11afd739aee0 |
| p_qh_censhuang_story_tease | `assets/production/portraits/p_qh_censhuang_story_tease_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_censhuang_story_tease_hd_20261017.webp` | 4b95a1ac1c09 |
| p_qh_shenyanhui_story | `assets/production/portraits/p_qh_shenyanhui_story_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_shenyanhui_story_hd_20261017.webp` | 090ce205b88a |
| p_qh_shenyanhui_story_angry | `assets/production/portraits/p_qh_shenyanhui_story_angry_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_shenyanhui_story_angry_hd_20261017.webp` | 54d99d116d61 |
| p_qh_shenyanhui_story_happy | `assets/production/portraits/p_qh_shenyanhui_story_happy_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_shenyanhui_story_happy_hd_20261017.webp` | a624aea85fea |
| p_qh_shenyanhui_story_sad | `assets/production/portraits/p_qh_shenyanhui_story_sad_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_shenyanhui_story_sad_hd_20261017.webp` | 21665ee57d65 |
| p_qh_shenyanhui_story_skeptical | `assets/production/portraits/p_qh_shenyanhui_story_skeptical_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_shenyanhui_story_skeptical_hd_20261017.webp` | 4cc27c4a7c2a |
| p_qh_shenyanhui_story_surprise | `assets/production/portraits/p_qh_shenyanhui_story_surprise_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_shenyanhui_story_surprise_hd_20261017.webp` | 568d80d533d3 |
| p_qh_xulingyi_story | `assets/production/portraits/p_qh_xulingyi_story_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_xulingyi_story_hd_20261017.webp` | 7fc1a9d1d1a3 |
| p_qh_xulingyi_story_angry | `assets/production/portraits/p_qh_xulingyi_story_angry_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_xulingyi_story_angry_hd_20261017.webp` | 9e7b652ddead |
| p_qh_xulingyi_story_awkward | `assets/production/portraits/p_qh_xulingyi_story_awkward_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_xulingyi_story_awkward_hd_20261017.webp` | 305f0b596e68 |
| p_qh_xulingyi_story_happy | `assets/production/portraits/p_qh_xulingyi_story_happy_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_xulingyi_story_happy_hd_20261017.webp` | fd5df226e147 |
| p_qh_xulingyi_story_sad | `assets/production/portraits/p_qh_xulingyi_story_sad_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_xulingyi_story_sad_hd_20261017.webp` | c408acf0d7c5 |
| p_qh_xulingyi_story_surprise | `assets/production/portraits/p_qh_xulingyi_story_surprise_hd_20261017.webp` | `art_sources/portrait-hd-20261017/final/p_qh_xulingyi_story_surprise_hd_20261017.webp` | cddc9d6839f5 |
| p_bandit | `assets/production/portraits/p_bandit.webp` | `assets/p_bandit.webp` | 836ec2b41396 |
| p_beggar | `assets/production/portraits/p_beggar.webp` | `assets/p_beggar.webp` | 2f456cee7364 |
| p_boatman | `assets/production/portraits/p_boatman.webp` | `assets/p_boatman.webp` | b7bff8c51e10 |
| p_chief | `assets/production/portraits/p_chief.webp` | `assets/p_chief.webp` | 68735a541d77 |
| p_gossip | `assets/production/portraits/p_gossip.webp` | `assets/p_gossip.webp` | a32bafbeb9e7 |
| p_hero | `assets/production/portraits/p_hero.webp` | `assets/p_hero.webp` | 9f3ebc215cec |
| p_hero_angry | `assets/production/portraits/p_hero_angry.webp` | `assets/p_hero_angry.webp` | f128370b363f |
| p_hero_battle | `assets/production/portraits/p_hero_battle.webp` | `assets/p_hero_battle.webp` | 3364d46a8a06 |
| p_hero_hurt | `assets/production/portraits/p_hero_hurt.webp` | `assets/p_hero_hurt.webp` | 793519063850 |
| p_hero_smile | `assets/production/portraits/p_hero_smile.webp` | `assets/p_hero_smile.webp` | 46b5fb6e9ab7 |
| p_hero_surprise | `assets/production/portraits/p_hero_surprise.webp` | `assets/p_hero_surprise.webp` | 714edc571fbb |
| p_hero_think | `assets/production/portraits/p_hero_think.webp` | `assets/p_hero_think.webp` | f80a2fb6ad29 |
| p_lady | `assets/production/portraits/p_lady.webp` | `assets/p_lady.webp` | 825b17b00330 |
| p_langli | `assets/production/portraits/p_langli.webp` | `assets/p_langli.webp` | 45ba2151c955 |
| p_liu | `assets/production/portraits/p_liu.webp` | `assets/p_liu.webp` | f4542df31c2f |
| p_monk | `assets/production/portraits/p_monk.webp` | `assets/p_monk.webp` | a7ad6799a272 |
| p_oldman | `assets/production/portraits/p_oldman.webp` | `assets/p_oldman.webp` | ded7fa010db1 |
| p_opening_censhuang | `assets/production/portraits/p_opening_censhuang.webp` | `assets/p_opening_censhuang.webp` | a20711bef4a2 |
| p_opening_censhuang_firm | `assets/production/portraits/p_opening_censhuang_firm.webp` | `assets/p_opening_censhuang_firm.webp` | a0cc5a60df40 |
| p_opening_censhuang_worry | `assets/production/portraits/p_opening_censhuang_worry.webp` | `assets/p_opening_censhuang_worry.webp` | f32a0ba15680 |
| p_opening_chengduo | `assets/production/portraits/p_opening_chengduo_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_opening_chengduo_hd_20261017.webp` | be4f16141db3 |
| p_opening_chengduo_firm | `assets/production/portraits/p_opening_chengduo_firm_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_opening_chengduo_firm_hd_20261017.webp` | f4764705f6ef |
| p_opening_chengduo_worry | `assets/production/portraits/p_opening_chengduo_worry_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_opening_chengduo_worry_hd_20261017.webp` | 8ec1d2f34cce |
| p_opening_hero_modern | `assets/production/portraits/p_opening_hero_modern_hd_20261017.webp` | `art_sources/portrait-hd-hero-20261017/final/p_opening_hero_modern_hd_20261017.webp` | 2ef4f87c70ca |
| p_opening_hero_modern_firm | `assets/production/portraits/p_opening_hero_modern_firm_hd_20261017.webp` | `art_sources/portrait-hd-hero-20261017/final/p_opening_hero_modern_firm_hd_20261017.webp` | be81025354f9 |
| p_opening_hero_modern_guard | `assets/production/portraits/p_opening_hero_modern_guard_hd_20261017.webp` | `art_sources/portrait-hd-hero-20261017/final/p_opening_hero_modern_guard_hd_20261017.webp` | 54305956f0cb |
| p_opening_hero_modern_hurt | `assets/production/portraits/p_opening_hero_modern_hurt_hd_20261017.webp` | `art_sources/portrait-hd-hero-20261017/final/p_opening_hero_modern_hurt_hd_20261017.webp` | 1a9358ef2846 |
| p_opening_hero_modern_smile | `assets/production/portraits/p_opening_hero_modern_smile_hd_20261017.webp` | `art_sources/portrait-hd-hero-20261017/final/p_opening_hero_modern_smile_hd_20261017.webp` | b6f4ab1cb3b4 |
| p_opening_hero_modern_surprise | `assets/production/portraits/p_opening_hero_modern_surprise_hd_20261017.webp` | `art_sources/portrait-hd-hero-20261017/final/p_opening_hero_modern_surprise_hd_20261017.webp` | aa1494494ba7 |
| p_opening_hero_modern_worry | `assets/production/portraits/p_opening_hero_modern_worry_hd_20261017.webp` | `art_sources/portrait-hd-hero-20261017/final/p_opening_hero_modern_worry_hd_20261017.webp` | 6e1f95f8b7d8 |
| p_opening_hero_village | `assets/production/portraits/p_opening_hero_village_hd_20261017.webp` | `art_sources/portrait-hd-hero-20261017/final/p_opening_hero_village_hd_20261017.webp` | 73f9f903ae27 |
| p_opening_hero_village_firm | `assets/production/portraits/p_opening_hero_village_firm_hd_20261017.webp` | `art_sources/portrait-hd-hero-20261017/final/p_opening_hero_village_firm_hd_20261017.webp` | 1d488bf0911c |
| p_opening_hero_village_hurt | `assets/production/portraits/p_opening_hero_village_hurt_hd_20261017.webp` | `art_sources/portrait-hd-hero-20261017/final/p_opening_hero_village_hurt_hd_20261017.webp` | 2fbd1eb0369b |
| p_opening_hero_village_smile | `assets/production/portraits/p_opening_hero_village_smile_hd_20261017.webp` | `art_sources/portrait-hd-hero-20261017/final/p_opening_hero_village_smile_hd_20261017.webp` | 630cfd829534 |
| p_opening_hero_village_surprise | `assets/production/portraits/p_opening_hero_village_surprise_hd_20261017.webp` | `art_sources/portrait-hd-hero-20261017/final/p_opening_hero_village_surprise_hd_20261017.webp` | 4646ea0960ef |
| p_opening_hero_village_worry | `assets/production/portraits/p_opening_hero_village_worry_hd_20261017.webp` | `art_sources/portrait-hd-hero-20261017/final/p_opening_hero_village_worry_hd_20261017.webp` | c2f48021c65b |
| p_opening_luheng | `assets/production/portraits/p_opening_luheng_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_opening_luheng_hd_20261017.webp` | b9f77b9676d4 |
| p_opening_luheng_firm | `assets/production/portraits/p_opening_luheng_firm_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_opening_luheng_firm_hd_20261017.webp` | 17945114c4ea |
| p_opening_luheng_worry | `assets/production/portraits/p_opening_luheng_worry_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_opening_luheng_worry_hd_20261017.webp` | dff89fec678f |
| p_opening_wukui | `assets/production/portraits/p_opening_wukui_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_opening_wukui_hd_20261017.webp` | ea2a692d4e2c |
| p_opening_wukui_firm | `assets/production/portraits/p_opening_wukui_firm_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_opening_wukui_firm_hd_20261017.webp` | c0e0220f50a8 |
| p_opening_wukui_worry | `assets/production/portraits/p_opening_wukui_worry_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_opening_wukui_worry_hd_20261017.webp` | 6a311f20ac72 |
| p_opening_zhouyan | `assets/production/portraits/p_opening_zhouyan_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_opening_zhouyan_hd_20261017.webp` | 057ff033d7b9 |
| p_opening_zhouyan_firm | `assets/production/portraits/p_opening_zhouyan_firm_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_opening_zhouyan_firm_hd_20261017.webp` | 5ad25e8efcc2 |
| p_opening_zhouyan_worry | `assets/production/portraits/p_opening_zhouyan_worry_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_opening_zhouyan_worry_hd_20261017.webp` | 206729d895e4 |
| p_smith | `assets/production/portraits/p_smith.webp` | `assets/p_smith.webp` | 6d4e4ae5198d |
| p_soldier | `assets/production/portraits/p_soldier.webp` | `assets/p_soldier.webp` | 04240ad489b1 |
| p_suzhi | `assets/production/portraits/p_suzhi.webp` | `assets/p_suzhi.webp` | b381a8015718 |
| p_suzhi_angry | `assets/production/portraits/p_suzhi_angry.webp` | `assets/p_suzhi_angry.webp` | f6d07c47a87f |
| p_suzhi_battle | `assets/production/portraits/p_suzhi_battle.webp` | `assets/p_suzhi_battle.webp` | df69b402184d |
| p_suzhi_shy | `assets/production/portraits/p_suzhi_shy.webp` | `assets/p_suzhi_shy.webp` | 7e74ef70c940 |
| p_suzhi_smile | `assets/production/portraits/p_suzhi_smile.webp` | `assets/p_suzhi_smile.webp` | be2bc05f4ea3 |
| p_suzhi_surprise | `assets/production/portraits/p_suzhi_surprise.webp` | `assets/p_suzhi_surprise.webp` | 81980cbe3006 |
| p_suzhi_worry | `assets/production/portraits/p_suzhi_worry.webp` | `assets/p_suzhi_worry.webp` | 7d3a44a86070 |
| p_ye | `assets/production/portraits/p_ye_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_ye_hd_20261017.webp` | 834a02f1e3c7 |
| p_ye_angry | `assets/production/portraits/p_ye_angry_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_ye_angry_hd_20261017.webp` | 9b3c7afd49ff |
| p_ye_battle | `assets/production/portraits/p_ye_battle_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_ye_battle_hd_20261017.webp` | 3025288156ed |
| p_ye_hurt | `assets/production/portraits/p_ye_hurt_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_ye_hurt_hd_20261017.webp` | be5fe9b86901 |
| p_ye_shy | `assets/production/portraits/p_ye_shy_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_ye_shy_hd_20261017.webp` | ba43fe29a6a4 |
| p_ye_smile | `assets/production/portraits/p_ye_smile_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_ye_smile_hd_20261017.webp` | bca43c786374 |
| p_ye_surprise | `assets/production/portraits/p_ye_surprise_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_ye_surprise_hd_20261017.webp` | 39c658d21e9a |
| p_ye_worry | `assets/production/portraits/p_ye_worry_hd_20261017.webp` | `art_sources/portrait-hd-cast-20261017/final/p_ye_worry_hd_20261017.webp` | f3bb4cf276a6 |
| p_zhou | `assets/production/portraits/p_zhou.webp` | `assets/p_zhou.webp` | efc158d432af |

### shared

| ID | 正式路径 | 原件来源 | SHA256（前12位） |
| --- | --- | --- | --- |
| cg_qh_backhill_rope_v1 | `assets/production/shared/cg_qh_backhill_rope_v1.webp` | `art_sources/qh-song-disguise-20261008/final/cg_qh_backhill_rope_v1.webp` | fc55f10a87bf |
| cg_qh_relics_lining_v1 | `assets/production/shared/cg_qh_relics_lining_v1.webp` | `art_sources/qh-song-disguise-20261008/final/cg_qh_relics_lining_v1.webp` | bb7fdab59d7a |
| cg_qh_fire_ignition_v2 | `assets/production/shared/cg_qh_fire_ignition_v2.webp` | `art_sources/qihe-cg-direction-20261006/ignition-native.png` | ff348e1fe92a |
| cg_qh_fire_ignition_v3 | `assets/production/shared/cg_qh_fire_ignition_v3.webp` | `art_sources/qihe-lamp-insert-20261006/native.png` | f2a9c409595a |
| cg_qh_xu_responsibility_v1 | `assets/production/shared/cg_qh_xu_responsibility_v1.webp` | `art_sources/qihe-representatives-adoption-20261007/cg_qh_xu_responsibility_v1.webp` | 7ff37f822569 |
| bg_title | `assets/production/shared/bg_title.webp` | `assets/bg_title.webp` | 0dc28fd2e29e |
| cg_p_water_v1 | `assets/production/shared/cg_p_water_v1.webp` | `assets/cg_p_water_v1.webp` | f8ffd56bf38d |
| fx_poshi_band | `assets/production/shared/fx_poshi_band.webp` | `assets/fx_poshi_band.webp` | be8025d00860 |
| fx_poshi_ink | `assets/production/shared/fx_poshi_ink.webp` | `assets/fx_poshi_ink.webp` | e029be573a73 |
| fx_poshi_po | `assets/production/shared/fx_poshi_po.webp` | `assets/fx_poshi_po.webp` | 339ff743b620 |
| fx_poshi_seal | `assets/production/shared/fx_poshi_seal.webp` | `assets/fx_poshi_seal.webp` | 7a38dd8dbbf1 |
| fx_poshi_seal_s | `assets/production/shared/fx_poshi_seal_s.webp` | `assets/fx_poshi_seal_s.webp` | aed96e0f5fb2 |

### ui

| ID | 正式路径 | 原件来源 | SHA256（前12位） |
| --- | --- | --- | --- |
| background | `assets/ui/jianghu-v4/background.webp` | `assets/ui/jianghu-v4/background.webp` | 3e5b99630961 |
| nav-attr | `assets/ui/jianghu-v4/icons/nav-attr.svg` | `assets/ui/jianghu-v4/icons/nav-attr.svg` | 59ed474887c8 |
| nav-bag | `assets/ui/jianghu-v4/icons/nav-bag.svg` | `assets/ui/jianghu-v4/icons/nav-bag.svg` | 724ed7b4640d |
| nav-equip | `assets/ui/jianghu-v4/icons/nav-equip.svg` | `assets/ui/jianghu-v4/icons/nav-equip.svg` | 77bb06efd842 |
| nav-party | `assets/ui/jianghu-v4/icons/nav-party.svg` | `assets/ui/jianghu-v4/icons/nav-party.svg` | ba2d55b2e874 |
| nav-pet | `assets/ui/jianghu-v4/icons/nav-pet.svg` | `assets/ui/jianghu-v4/icons/nav-pet.svg` | 3be274257497 |
| nav-quest | `assets/ui/jianghu-v4/icons/nav-quest.svg` | `assets/ui/jianghu-v4/icons/nav-quest.svg` | f1adc371ba1b |
| nav-skill | `assets/ui/jianghu-v4/icons/nav-skill.svg` | `assets/ui/jianghu-v4/icons/nav-skill.svg` | 7f4765dbce5c |
| nav-sys | `assets/ui/jianghu-v4/icons/nav-sys.svg` | `assets/ui/jianghu-v4/icons/nav-sys.svg` | ff1f157a33ca |
| slot-acc | `assets/ui/jianghu-v4/icons/slot-acc.svg` | `assets/ui/jianghu-v4/icons/slot-acc.svg` | f83a584eb228 |
| slot-armor | `assets/ui/jianghu-v4/icons/slot-armor.svg` | `assets/ui/jianghu-v4/icons/slot-armor.svg` | 844a725372f3 |
| slot-weapon | `assets/ui/jianghu-v4/icons/slot-weapon.svg` | `assets/ui/jianghu-v4/icons/slot-weapon.svg` | 5890f9b63838 |
| stat-agi | `assets/ui/jianghu-v4/icons/stat-agi.svg` | `assets/ui/jianghu-v4/icons/stat-agi.svg` | ab181775ab0c |
| stat-con | `assets/ui/jianghu-v4/icons/stat-con.svg` | `assets/ui/jianghu-v4/icons/stat-con.svg` | a0cbd226eb21 |
| stat-str | `assets/ui/jianghu-v4/icons/stat-str.svg` | `assets/ui/jianghu-v4/icons/stat-str.svg` | f63e047ba5ba |
| stat-wil | `assets/ui/jianghu-v4/icons/stat-wil.svg` | `assets/ui/jianghu-v4/icons/stat-wil.svg` | 18f0f6baa098 |
| stat-wis | `assets/ui/jianghu-v4/icons/stat-wis.svg` | `assets/ui/jianghu-v4/icons/stat-wis.svg` | c20d727de03c |
| manifest | `assets/ui/jianghu-v4/manifest.json` | `assets/ui/jianghu-v4/manifest.json` | aeb84e6e5d40 |
| censhuang | `assets/ui/jianghu-v4/portraits/censhuang.webp` | `assets/ui/jianghu-v4/portraits/censhuang.webp` | ad67dd3bacaa |
| hero-modern | `assets/ui/jianghu-v4/portraits/hero-modern.webp` | `assets/ui/jianghu-v4/portraits/hero-modern.webp` | ff8bb55d4bf8 |
| hero-village | `assets/ui/jianghu-v4/portraits/hero-village.webp` | `assets/ui/jianghu-v4/portraits/hero-village.webp` | 44e831a60afe |
| suzhi | `assets/ui/jianghu-v4/portraits/suzhi.webp` | `assets/ui/jianghu-v4/portraits/suzhi.webp` | 2609e36e6650 |
| ye-menu-v2 | `assets/ui/jianghu-v4/portraits/ye-menu-v2.png` | `assets/ui/jianghu-v4/portraits/ye-menu-v2.png` | 2ce92f925a00 |
| ye | `assets/ui/jianghu-v4/portraits/ye.webp` | `assets/ui/jianghu-v4/portraits/ye.webp` | f01580ad7ec5 |
| icons-atlas | `assets/ui/jianghu-v5/icons-atlas.png` | `assets/ui/jianghu-v5/icons-atlas.png` | 930bfaebdd3d |
| hero-guiyun | `assets/ui/jianghu-v4/portraits/hero-guiyun.webp` | `art_sources/guiyun-playtest-fix-20261011/jianghu/hero-guiyun-native.png` | 5aee5efa448a |

## 2026-10-12 开始部分领队交锋

| ID | 正式文件 | 原件 | SHA-256前12位 |
|---|---|---|---|
| bb_qh_faction_clash_20261012 | `assets/production/battle/bb_qh_faction_clash_20261012.webp` | `art_sources/qihe-faction-clash-20261012/out/bb_qh_faction_clash_20261012.webp` | 9d34bbccc6ff |
| fx_qh_clash_am_short_thrust | `assets/production/fx/qihe-clash/am_v1/fx_qh_clash_am_short_thrust.webp` | `art_sources/qihe-faction-clash-20261012/fx/am_v1/am_short_thrust.webp` | 94c7829edaab |
| fx_qh_clash_am_guard_crescent | `assets/production/fx/qihe-clash/am_v1/fx_qh_clash_am_guard_crescent.webp` | `art_sources/qihe-faction-clash-20261012/fx/am_v1/am_guard_crescent.webp` | f307b597aa5c |
| fx_qh_clash_am_stab_mark | `assets/production/fx/qihe-clash/am_v1/fx_qh_clash_am_stab_mark.webp` | `art_sources/qihe-faction-clash-20261012/fx/am_v1/am_stab_mark.webp` | aaec272b59c2 |
| fx_qh_clash_am_power_orb | `assets/production/fx/qihe-clash/am_v1/fx_qh_clash_am_power_orb.webp` | `art_sources/qihe-faction-clash-20261012/fx/am_v1/am_power_orb.webp` | 1d91da0bbeb4 |
| fx_qh_clash_am_flow_ribbon | `assets/production/fx/qihe-clash/am_v1/fx_qh_clash_am_flow_ribbon.webp` | `art_sources/qihe-faction-clash-20261012/fx/am_v1/am_flow_ribbon.webp` | 19af6303d4ae |
| fx_qh_clash_am_bp_pips | `assets/production/fx/qihe-clash/am_v1/fx_qh_clash_am_bp_pips.webp` | `art_sources/qihe-faction-clash-20261012/fx/am_v1/am_bp_pips.webp` | fedadd577f9b |
| fx_qh_clash_gj_fold_shade | `assets/production/fx/qihe-clash/gj_v1/fx_qh_clash_gj_fold_shade.webp` | `art_sources/qihe-faction-clash-20261012/fx/gj_v1/gj_fold_shade.webp` | a5ba39af70a7 |
| fx_qh_clash_gj_short_stab | `assets/production/fx/qihe-clash/gj_v1/fx_qh_clash_gj_short_stab.webp` | `art_sources/qihe-faction-clash-20261012/fx/gj_v1/gj_short_stab.webp` | 88b87b42d2e3 |
| fx_qh_clash_gj_stab_burst | `assets/production/fx/qihe-clash/gj_v1/fx_qh_clash_gj_stab_burst.webp` | `art_sources/qihe-faction-clash-20261012/fx/gj_v1/gj_stab_burst.webp` | 66a1b53d18e5 |
| fx_qh_clash_gj_expose | `assets/production/fx/qihe-clash/gj_v1/fx_qh_clash_gj_expose.webp` | `art_sources/qihe-faction-clash-20261012/fx/gj_v1/gj_expose.webp` | c6ea5e2e3aba |
| fx_qh_clash_gj_thick_arc | `assets/production/fx/qihe-clash/gj_v1/fx_qh_clash_gj_thick_arc.webp` | `art_sources/qihe-faction-clash-20261012/fx/gj_v1/gj_thick_arc.webp` | dac1be7c9146 |
| fx_qh_clash_gj_ember_halves | `assets/production/fx/qihe-clash/gj_v1/fx_qh_clash_gj_ember_halves.webp` | `art_sources/qihe-faction-clash-20261012/fx/gj_v1/gj_ember_halves.webp` | ae7aeb05bf99 |
| fx_qh_clash_kit_ring | `assets/production/fx/qihe-clash/kit_v1/fx_qh_clash_kit_ring.webp` | `art_sources/qihe-faction-clash-20261012/fx/kit_v1/kit_ring.webp` | 3287cce5a9ff |
| fx_qh_clash_kit_qi | `assets/production/fx/qihe-clash/kit_v1/fx_qh_clash_kit_qi.webp` | `art_sources/qihe-faction-clash-20261012/fx/kit_v1/kit_qi.webp` | e8489e29d081 |
| fx_qh_clash_kit_rise | `assets/production/fx/qihe-clash/kit_v1/fx_qh_clash_kit_rise.webp` | `art_sources/qihe-faction-clash-20261012/fx/kit_v1/kit_rise.webp` | 887718f065f9 |
| fx_qh_clash_kit_burst | `assets/production/fx/qihe-clash/kit_v1/fx_qh_clash_kit_burst.webp` | `art_sources/qihe-faction-clash-20261012/fx/kit_v1/kit_burst.webp` | 61f6559a5868 |
| clash_blade_hit_20261012 | `assets/audio/clash_blade_hit_20261012.wav` | `art_sources/qihe-faction-clash-20261012/audio/clash_blade_hit_20261012.wav` | 102204e5c0b3 |
| clash_qi_transfer_20261012 | `assets/audio/clash_qi_transfer_20261012.wav` | `art_sources/qihe-faction-clash-20261012/audio/clash_qi_transfer_20261012.wav` | 10badc684e42 |

## 2026-10-13 入汉皋前正式素材

| ID | 正式文件 | 原件 | SHA-256前12位 |
|---|---|---|---|
| b_gy_luxiaodou_prehangao_20261013 | `assets/production/battle/b_gy_luxiaodou_prehangao_20261013.webp` | `art_sources/pre-hangao-completion-20261013/out/b_gy_luxiaodou_prehangao_20261013.webp` | 45866da56cad |
| b_gy_fangchi_prehangao_20261013 | `assets/production/battle/b_gy_fangchi_prehangao_20261013.webp` | `art_sources/pre-hangao-completion-20261013/out/b_gy_fangchi_prehangao_20261013.webp` | bddb936a93f1 |
| b_gy_zhongzhuo_prehangao_20261013 | `assets/production/battle/b_gy_zhongzhuo_prehangao_20261013.webp` | `art_sources/pre-hangao-completion-20261013/out/b_gy_zhongzhuo_prehangao_20261013.webp` | beae35bed448 |
| b_gy_zhouyan_prehangao_20261013 | `assets/production/battle/b_gy_zhouyan_prehangao_20261013.webp` | `art_sources/pre-hangao-completion-20261013/out/b_gy_zhouyan_prehangao_20261013.webp` | 7dfd341b4303 |
| b_gy_hero_sword_prehangao_20261013 | `assets/production/battle/b_gy_hero_sword_prehangao_20261013.webp` | `art_sources/pre-hangao-completion-20261013/out/b_gy_hero_sword_prehangao_20261013.webp` | dd3c1e812c8d |
| b_gy_hero_fist_prehangao_20261013 | `assets/production/battle/b_gy_hero_fist_prehangao_20261013.webp` | `art_sources/pre-hangao-completion-20261013/out/b_gy_hero_fist_prehangao_20261013.webp` | 621d25f4d057 |
| b_gy_peizhigu_prehangao_20261013 | `assets/production/battle/b_gy_peizhigu_prehangao_20261013.webp` | `art_sources/pre-hangao-completion-20261013/out/b_gy_peizhigu_prehangao_20261013.webp` | a1af48f68335 |
| s_gy_peizhigu_prehangao_20261013 | `assets/production/characters/s_gy_peizhigu_prehangao_20261013.webp` | `art_sources/pre-hangao-completion-20261013/out/s_gy_peizhigu_prehangao_20261013.webp` | 8417312f9007 |
| p_gy_peizhigu | `assets/production/characters/p_gy_peizhigu_prehangao_20261013.webp` | `assets/production/cultivation/household-v1/pei_normal.png` | d8c906b85c85 |
| pei_sujian_icon | `assets/production/pre-hangao/sujian-icon.png` | `art_sources/pre-hangao-completion-20261013/sujian-icon.png` | cb44f8d6c3cd |
| cu_hangao_gate_20261013 | `assets/production/cultivation/pre-hangao/hangao_gate.png` | `art_sources/pre-hangao-completion-20261013/hangao-gate-source.png` | 30c4c9f7b84e |

## 2026-10-14 主角多武器像素动作

| ID | 正式文件 | 原件 | SHA-256前12位 |
|---|---|---|---|

## 2026-10-14 尾声新增已确认配音

| ID | 正式文件 | 原件 | SHA-256前12位 |
|---|---|---|---|
| clash.whip.opening.0 | `assets/audio/voices/xu-lingyi-45bf9797fd06d5f05a86.mp3` | `art_sources/qihe-whip-clash-20261014/audio/xu-lingyi-45bf9797fd06d5f05a86.mp3` | 45bf9797fd06 |
| clash.whip.opening.1 | `assets/audio/voices/cen-shuang-01c5022aa0c967a8840a.mp3` | `art_sources/qihe-whip-clash-20261014/audio/cen-shuang-01c5022aa0c967a8840a.mp3` | 01c5022aa0c9 |
| clash.whip.stopping.0 | `assets/audio/voices/shen-yanhui-dddec471247494647080.mp3` | `art_sources/qihe-whip-clash-20261014/audio/shen-yanhui-dddec471247494647080.mp3` | dddec4712474 |
| clash.whip.stopping.1 | `assets/audio/voices/xu-lingyi-4dde8f0a0d4f7161be19.mp3` | `art_sources/qihe-whip-clash-20261014/audio/xu-lingyi-4dde8f0a0d4f7161be19.mp3` | 4dde8f0a0d4f |
| clash.whip.stopping.2 | `assets/audio/voices/cen-shuang-96f55d1b295bdf5dca0a.mp3` | `art_sources/qihe-whip-clash-20261014/audio/cen-shuang-96f55d1b295bdf5dca0a.mp3` | 96f55d1b295b |
| clash.whip.beam | `assets/audio/voices/xu-lingyi-5073662de466a2323adb.mp3` | `art_sources/qihe-whip-clash-20261014/audio/xu-lingyi-5073662de466a2323adb.mp3` | 5073662de466 |
| clash.whip.responsibility.xu | `assets/audio/voices/xu-lingyi-84e11cc2dd7b4d7b3351.mp3` | `art_sources/qihe-whip-clash-20261014/audio/xu-lingyi-84e11cc2dd7b4d7b3351.mp3` | 84e11cc2dd7b |
| clash.whip.responsibility.cen | `assets/audio/voices/cen-shuang-dcad95c45a70b155987d.mp3` | `art_sources/qihe-whip-clash-20261014/audio/cen-shuang-dcad95c45a70b155987d.mp3` | dcad95c45a70 |

## 2026-10-14 尾声夜间CG连贯性修正

| ID | 正式文件 | 原件 | SHA-256前12位 |
|---|---|---|---|
| cg_qh_ignition_night_20261014 | `assets/production/shared/cg_qh_ignition_night_20261014.webp` | `art_sources/qihe-whip-clash-20261014/cg/ignition.png` | e7a0c4a50e59 |
| cg_qh_cen_night_20261014 | `assets/production/shared/cg_qh_cen_night_20261014.webp` | `art_sources/qihe-whip-clash-20261014/cg/cen.png` | 5217e5d26f92 |
| cg_qh_shen_night_20261014 | `assets/production/shared/cg_qh_shen_night_20261014.webp` | `art_sources/qihe-whip-clash-20261014/cg/shen.png` | 5b56554561c5 |
| cg_qh_evacuation_night_20261014 | `assets/production/shared/cg_qh_evacuation_night_20261014.webp` | `art_sources/qihe-whip-clash-20261014/cg/evacuation.png` | 0bf382d126ad |

## 2026-10-14 归云人物战斗收尾

| ID | 正式文件 | 原件 | SHA-256前12位 |
|---|---|---|---|
| b_gy_luxiaodou_finish_20261014 | `assets/production/battle/b_gy_luxiaodou_finish_20261014.webp` | `art_sources/guiyun-battle-finish-20261014/out/b_gy_luxiaodou_finish_20261014.webp` | 598656ccff53 |
| b_gy_fangchi_finish_20261014 | `assets/production/battle/b_gy_fangchi_finish_20261014.webp` | `art_sources/guiyun-battle-finish-20261014/out/b_gy_fangchi_finish_20261014.webp` | 06bdfdfb00f8 |
| b_gy_zhongzhuo_finish_20261014 | `assets/production/battle/b_gy_zhongzhuo_finish_20261014.webp` | `art_sources/guiyun-battle-finish-20261014/out/b_gy_zhongzhuo_finish_20261014.webp` | 41ff6c2cdc02 |
| b_gy_zhouyan_finish_20261014 | `assets/production/battle/b_gy_zhouyan_finish_20261014.webp` | `art_sources/guiyun-battle-finish-20261014/out/b_gy_zhouyan_finish_20261014.webp` | 93ef73bf304f |
| b_gy_peizhigu_finish_20261014 | `assets/production/battle/b_gy_peizhigu_finish_20261014.webp` | `art_sources/guiyun-battle-finish-20261014/out/b_gy_peizhigu_finish_20261014.webp` | a6ede46d8c4e |

## 2026-10-14 主角无剑对白状态

| ID | 正式文件 | 原件 | SHA-256前12位 |
|---|---|---|---|

## 2026-10-14 入汉皋前已确认对白语音

| ID | 正式文件 | 原件 | SHA-256前12位 |
|---|---|---|---|
| prehg.ye.17dad18eabceae | `assets/audio/voices/ye-10798247abe9644059ea.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-10798247abe9644059ea.mp3` | 10798247abe9 |
| prehg.ye.cfb44540705848 | `assets/audio/voices/ye-c6b6a1cbe748e386f698.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-c6b6a1cbe748e386f698.mp3` | c6b6a1cbe748 |
| prehg.ye.ab2f3b4aea512c | `assets/audio/voices/ye-0da6153ad4b52f82aed5.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-0da6153ad4b52f82aed5.mp3` | 0da6153ad4b5 |
| prehg.ye.4fff7aa8285000 | `assets/audio/voices/ye-1bd0af4c9781c3a5c08d.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-1bd0af4c9781c3a5c08d.mp3` | 1bd0af4c9781 |
| prehg.ye.2dd8a16361086b | `assets/audio/voices/ye-47d78c63d24bf4d44572.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-47d78c63d24bf4d44572.mp3` | 47d78c63d24b |
| prehg.ye.805aaa343711a9 | `assets/audio/voices/ye-395aef7433130c45aa16.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-395aef7433130c45aa16.mp3` | 395aef743313 |
| prehg.ye.42e9b27c4da20c | `assets/audio/voices/ye-fc1fcf198c9a0b274a96.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-fc1fcf198c9a0b274a96.mp3` | fc1fcf198c9a |
| prehg.ye.41891b6bd1d423 | `assets/audio/voices/ye-f0fc2c1060ec5d6b5187.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-f0fc2c1060ec5d6b5187.mp3` | f0fc2c1060ec |
| prehg.ye.0b162dde18d643 | `assets/audio/voices/ye-c896c3bfcdbb394887c8.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-c896c3bfcdbb394887c8.mp3` | c896c3bfcdbb |
| prehg.ye.f137d0d8932475 | `assets/audio/voices/ye-7fe76992a1c1a9d00e0d.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-7fe76992a1c1a9d00e0d.mp3` | 7fe76992a1c1 |
| prehg.ye.54b88a1637a287 | `assets/audio/voices/ye-3f44a18dc13e3cebca40.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-3f44a18dc13e3cebca40.mp3` | 3f44a18dc13e |
| prehg.ye.c01bfe60605866 | `assets/audio/voices/ye-bfb0bdd00bcc37dc922d.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-bfb0bdd00bcc37dc922d.mp3` | bfb0bdd00bcc |
| prehg.ye.9b27c9f3d5ca10 | `assets/audio/voices/ye-a80b3ff2133a4637339c.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-a80b3ff2133a4637339c.mp3` | a80b3ff2133a |
| prehg.ye.c3829ea09b948a | `assets/audio/voices/ye-09a3a22070324e0dfec6.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-09a3a22070324e0dfec6.mp3` | 09a3a2207032 |
| prehg.ye.08b1d1ce243ff1 | `assets/audio/voices/ye-8b5b3b5c371683d6ed5e.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-8b5b3b5c371683d6ed5e.mp3` | 8b5b3b5c3716 |
| prehg.ye.488b76f608ac4f | `assets/audio/voices/ye-4ebea2994b962ee82a0a.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-4ebea2994b962ee82a0a.mp3` | 4ebea2994b96 |
| prehg.ye.9824764cdc4d5f | `assets/audio/voices/ye-b569e20a16782d219c65.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-b569e20a16782d219c65.mp3` | b569e20a1678 |
| prehg.ye.e541fe609bcce7 | `assets/audio/voices/ye-97bc48aef6c4f7ce8d1b.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-97bc48aef6c4f7ce8d1b.mp3` | 97bc48aef6c4 |
| prehg.ye.f5d2d39a085142 | `assets/audio/voices/ye-9b722addabc006eff716.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-9b722addabc006eff716.mp3` | 9b722addabc0 |
| prehg.ye.e55faef4b1da0c | `assets/audio/voices/ye-38e8defa5721c6c65071.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-38e8defa5721c6c65071.mp3` | 38e8defa5721 |
| prehg.ye.6da7285d0a71ab | `assets/audio/voices/ye-fcf51d0611be1d1ff869.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-fcf51d0611be1d1ff869.mp3` | fcf51d0611be |
| prehg.ye.b9856302803d74 | `assets/audio/voices/ye-2adbe66dee5eb79df437.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-2adbe66dee5eb79df437.mp3` | 2adbe66dee5e |
| prehg.ye.c3ceb7e833ca42 | `assets/audio/voices/ye-ea934605e5867ecaf752.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-ea934605e5867ecaf752.mp3` | ea934605e586 |
| prehg.ye.2f5c705a00fda4 | `assets/audio/voices/ye-4acd03c5a88613d23214.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-4acd03c5a88613d23214.mp3` | 4acd03c5a886 |
| prehg.ye.da0651419a6761 | `assets/audio/voices/ye-0a5aaa59e4ab9767b793.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-0a5aaa59e4ab9767b793.mp3` | 0a5aaa59e4ab |
| prehg.ye.d3c6dd0fe41313 | `assets/audio/voices/ye-37d5ff45db048d4dc79d.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-37d5ff45db048d4dc79d.mp3` | 37d5ff45db04 |
| prehg.ye.f009eeb1516fa8 | `assets/audio/voices/ye-dbbe6d3ecdebd6b52107.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-dbbe6d3ecdebd6b52107.mp3` | dbbe6d3ecdeb |
| prehg.ye.52f0c9a4b9ddc4 | `assets/audio/voices/ye-afcf26306d71c52681c7.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-afcf26306d71c52681c7.mp3` | afcf26306d71 |
| prehg.ye.a0f0c01a0ea115 | `assets/audio/voices/ye-64487ba6a16e795a4532.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-64487ba6a16e795a4532.mp3` | 64487ba6a16e |
| prehg.ye.551216c90f9a3a | `assets/audio/voices/ye-c9aae1413c5570672e2b.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-c9aae1413c5570672e2b.mp3` | c9aae1413c55 |
| prehg.ye.531f1bbd2ad71c | `assets/audio/voices/ye-a74ff9b924d4391cb7b6.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-a74ff9b924d4391cb7b6.mp3` | a74ff9b924d4 |
| prehg.ye.da23565689f0dd | `assets/audio/voices/ye-36ac2c9bda7178db75de.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-36ac2c9bda7178db75de.mp3` | 36ac2c9bda71 |
| prehg.ye.af7df02927c099 | `assets/audio/voices/ye-309f48a1463480482d33.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-309f48a1463480482d33.mp3` | 309f48a14634 |
| prehg.ye.664af4cf637a45 | `assets/audio/voices/ye-ba5a2644f95b716009f9.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-ba5a2644f95b716009f9.mp3` | ba5a2644f95b |
| prehg.ye.50b7eea3d8b2fe | `assets/audio/voices/ye-9dc0254225ad2172b590.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-9dc0254225ad2172b590.mp3` | 9dc0254225ad |
| prehg.ye.c2e8dc0569b7fe | `assets/audio/voices/ye-a39df919ca1da8c1501a.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/ye-a39df919ca1da8c1501a.mp3` | a39df919ca1d |
| prehg.pei-zhigu.a544e051d885ed | `assets/audio/voices/pei-zhigu-a63b6d879de9bbb06e39.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-a63b6d879de9bbb06e39.mp3` | a63b6d879de9 |
| prehg.pei-zhigu.f9bd0f496da5ea | `assets/audio/voices/pei-zhigu-3842bfe90a83ba1cd8a5.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-3842bfe90a83ba1cd8a5.mp3` | 3842bfe90a83 |
| prehg.pei-zhigu.3696d7aab12abd | `assets/audio/voices/pei-zhigu-58ce7410c23aeb43376e.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-58ce7410c23aeb43376e.mp3` | 58ce7410c23a |
| prehg.pei-zhigu.ad5d58b4f37ab9 | `assets/audio/voices/pei-zhigu-cd202304e8af51734151.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-cd202304e8af51734151.mp3` | cd202304e8af |
| prehg.pei-zhigu.fca59da15f692c | `assets/audio/voices/pei-zhigu-292f9afcff902c7ee133.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-292f9afcff902c7ee133.mp3` | 292f9afcff90 |
| prehg.pei-zhigu.197019f672e9bd | `assets/audio/voices/pei-zhigu-35d325fbaccc1946f970.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-35d325fbaccc1946f970.mp3` | 35d325fbaccc |
| prehg.pei-zhigu.79f59cfd189454 | `assets/audio/voices/pei-zhigu-6a4f457ff6db6f5a48ce.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-6a4f457ff6db6f5a48ce.mp3` | 6a4f457ff6db |
| prehg.pei-zhigu.c758196ac3f926 | `assets/audio/voices/pei-zhigu-479c2cff1306980c8935.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-479c2cff1306980c8935.mp3` | 479c2cff1306 |
| prehg.pei-zhigu.db950f09906cca | `assets/audio/voices/pei-zhigu-4f8dbdcd8c167d0afa59.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-4f8dbdcd8c167d0afa59.mp3` | 4f8dbdcd8c16 |
| prehg.pei-zhigu.ec756012072f4f | `assets/audio/voices/pei-zhigu-9dc49e3fd5f6e7a0e2ac.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-9dc49e3fd5f6e7a0e2ac.mp3` | 9dc49e3fd5f6 |
| prehg.pei-zhigu.28d699ca5e322c | `assets/audio/voices/pei-zhigu-e6591d33428284931962.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-e6591d33428284931962.mp3` | e6591d334282 |
| prehg.pei-zhigu.a38da086205ab7 | `assets/audio/voices/pei-zhigu-530d7ec03a41395b598b.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-530d7ec03a41395b598b.mp3` | 530d7ec03a41 |
| prehg.pei-zhigu.7b33a3b8ac3bd0 | `assets/audio/voices/pei-zhigu-50f655dd4eec11b4f512.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-50f655dd4eec11b4f512.mp3` | 50f655dd4eec |
| prehg.pei-zhigu.d4d4ca1632c632 | `assets/audio/voices/pei-zhigu-d7cf0cc7c35dca94f383.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-d7cf0cc7c35dca94f383.mp3` | d7cf0cc7c35d |
| prehg.pei-zhigu.f7cb8cf7ed8b43 | `assets/audio/voices/pei-zhigu-c8bf7864171b9b923f8c.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-c8bf7864171b9b923f8c.mp3` | c8bf7864171b |
| prehg.pei-zhigu.b4ea31b944584f | `assets/audio/voices/pei-zhigu-039571331dbeefee0f11.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-039571331dbeefee0f11.mp3` | 039571331dbe |
| prehg.pei-zhigu.4776d56175c03f | `assets/audio/voices/pei-zhigu-6270dd02770a2f42e826.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-6270dd02770a2f42e826.mp3` | 6270dd02770a |
| prehg.pei-zhigu.76cdfaff9d73b1 | `assets/audio/voices/pei-zhigu-6deb41ca192675a472f8.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-6deb41ca192675a472f8.mp3` | 6deb41ca1926 |
| prehg.pei-zhigu.df4d5b469f1ac8 | `assets/audio/voices/pei-zhigu-1e943a581ffbcbf37aac.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-1e943a581ffbcbf37aac.mp3` | 1e943a581ffb |
| prehg.pei-zhigu.e36611dfe6b333 | `assets/audio/voices/pei-zhigu-147170006651af50e180.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-147170006651af50e180.mp3` | 147170006651 |
| prehg.pei-zhigu.f60c3f1c266dec | `assets/audio/voices/pei-zhigu-7471c8c28210e8f37fd0.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-7471c8c28210e8f37fd0.mp3` | 7471c8c28210 |
| prehg.pei-zhigu.e0d59db421c1d5 | `assets/audio/voices/pei-zhigu-67585427f9393db01ab7.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-67585427f9393db01ab7.mp3` | 67585427f939 |
| prehg.pei-zhigu.226dd8733a93a9 | `assets/audio/voices/pei-zhigu-d343187df21e888d426f.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-d343187df21e888d426f.mp3` | d343187df21e |
| prehg.pei-zhigu.8fa75ac1c28ced | `assets/audio/voices/pei-zhigu-a4f641547b4cfd2559c5.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-a4f641547b4cfd2559c5.mp3` | a4f641547b4c |
| prehg.pei-zhigu.a0b655df856078 | `assets/audio/voices/pei-zhigu-e528701c0579f2059681.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-e528701c0579f2059681.mp3` | e528701c0579 |
| prehg.pei-zhigu.a1f648d2551635 | `assets/audio/voices/pei-zhigu-f2788576b90b24f1761c.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-f2788576b90b24f1761c.mp3` | f2788576b90b |
| prehg.pei-zhigu.311ea89e08ff9d | `assets/audio/voices/pei-zhigu-809bee3d34bebab85ba9.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-809bee3d34bebab85ba9.mp3` | 809bee3d34be |
| prehg.pei-zhigu.7a17fd4ada20ec | `assets/audio/voices/pei-zhigu-635da3d4b5d39de71859.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-635da3d4b5d39de71859.mp3` | 635da3d4b5d3 |
| prehg.pei-zhigu.7440732b63b819 | `assets/audio/voices/pei-zhigu-f93c3968f443f3f7fc87.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-f93c3968f443f3f7fc87.mp3` | f93c3968f443 |
| prehg.pei-zhigu.6e0e477380cc4d | `assets/audio/voices/pei-zhigu-ff71762a0380200eb19e.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-ff71762a0380200eb19e.mp3` | ff71762a0380 |
| prehg.pei-zhigu.88ce51e39fddc5 | `assets/audio/voices/pei-zhigu-359c94803bc65ac8928c.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-359c94803bc65ac8928c.mp3` | 359c94803bc6 |
| prehg.pei-zhigu.549532a88edfed | `assets/audio/voices/pei-zhigu-dfae160498c00d1b8657.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-dfae160498c00d1b8657.mp3` | dfae160498c0 |
| prehg.pei-zhigu.660615b5d62221 | `assets/audio/voices/pei-zhigu-c71d5cf1d38a4a407ae0.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-c71d5cf1d38a4a407ae0.mp3` | c71d5cf1d38a |
| prehg.pei-zhigu.59af65ebf5ffb3 | `assets/audio/voices/pei-zhigu-6a1dc8b76b6b3beb8e0e.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-6a1dc8b76b6b3beb8e0e.mp3` | 6a1dc8b76b6b |
| prehg.pei-zhigu.2345239eecc81e | `assets/audio/voices/pei-zhigu-3c4c3499a09506df4ded.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-3c4c3499a09506df4ded.mp3` | 3c4c3499a095 |
| prehg.pei-zhigu.6f6bb671872cd5 | `assets/audio/voices/pei-zhigu-f8f0fe8ad2b613acce48.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-f8f0fe8ad2b613acce48.mp3` | f8f0fe8ad2b6 |
| prehg.pei-zhigu.e5c6a4a4287af2 | `assets/audio/voices/pei-zhigu-1d9798fe2e66bd8b3688.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-1d9798fe2e66bd8b3688.mp3` | 1d9798fe2e66 |
| prehg.pei-zhigu.4ff0edb46a244c | `assets/audio/voices/pei-zhigu-f3417df3c96785e0b880.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-f3417df3c96785e0b880.mp3` | f3417df3c967 |
| prehg.pei-zhigu.fbc9fdc7821dd6 | `assets/audio/voices/pei-zhigu-b06928dd2347e065c38c.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-b06928dd2347e065c38c.mp3` | b06928dd2347 |
| prehg.pei-zhigu.46fd70bd6d9713 | `assets/audio/voices/pei-zhigu-66450a732a75e9a504c6.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-66450a732a75e9a504c6.mp3` | 66450a732a75 |
| prehg.pei-zhigu.b10b253edcda1a | `assets/audio/voices/pei-zhigu-e892e8fa46c7dfaa2062.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-e892e8fa46c7dfaa2062.mp3` | e892e8fa46c7 |
| prehg.pei-zhigu.26d537a3d53de4 | `assets/audio/voices/pei-zhigu-20493ba3f658845f211a.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-20493ba3f658845f211a.mp3` | 20493ba3f658 |
| prehg.pei-zhigu.406d1ebf8f5d30 | `assets/audio/voices/pei-zhigu-8271877ed205d703d0b7.mp3` | `art_sources/guiyun-battle-finish-20261014/voice-originals/pei-zhigu-8271877ed205d703d0b7.mp3` | 8271877ed205 |
| cu_hero_long_empty_serious_20261014 | `assets/production/cultivation/hero-empty/hero_long_empty_serious.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_long_empty_serious.png` | 363c4e225259 |
| cu_hero_long_empty_worry_20261014 | `assets/production/cultivation/hero-empty/hero_long_empty_worry.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_long_empty_worry.png` | 62c2e7733a88 |
| cu_hero_long_empty_surprise_20261014 | `assets/production/cultivation/hero-empty/hero_long_empty_surprise.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_long_empty_surprise.png` | 6cc24d7ede6b |
| cu_hero_long_empty_hurt_20261014 | `assets/production/cultivation/hero-empty/hero_long_empty_hurt.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_long_empty_hurt.png` | 6e4a0a0c0201 |
| cu_hero_long_empty_sad_20261014 | `assets/production/cultivation/hero-empty/hero_long_empty_sad.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_long_empty_sad.png` | 6c48d625d5d3 |
| cu_hero_long_empty_sleep_20261014 | `assets/production/cultivation/hero-empty/hero_long_empty_sleep.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_long_empty_sleep.png` | 83aae85d62d9 |
| cu_hero_long_empty_normal_20261014 | `assets/production/cultivation/hero-empty/hero_long_empty_normal.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_long_empty_normal.png` | e7d2f638d427 |
| cu_hero_long_empty_smile_20261014 | `assets/production/cultivation/hero-empty/hero_long_empty_smile.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_long_empty_smile.png` | 33f64468e5e5 |
| cu_hero_short_empty_normal_20261014 | `assets/production/cultivation/hero-empty/hero_short_empty_normal.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_short_empty_normal.png` | 0a5d28ae87c7 |
| cu_hero_short_empty_smile_20261014 | `assets/production/cultivation/hero-empty/hero_short_empty_smile.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_short_empty_smile.png` | 7869ca248937 |
| cu_hero_short_empty_serious_20261014 | `assets/production/cultivation/hero-empty/hero_short_empty_serious.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_short_empty_serious.png` | 132714a0306f |
| cu_hero_short_empty_worry_20261014 | `assets/production/cultivation/hero-empty/hero_short_empty_worry.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_short_empty_worry.png` | f7a0b2982215 |
| cu_hero_short_empty_surprise_20261014 | `assets/production/cultivation/hero-empty/hero_short_empty_surprise.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_short_empty_surprise.png` | 8a4272073c55 |
| cu_hero_short_empty_sad_20261014 | `assets/production/cultivation/hero-empty/hero_short_empty_sad.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_short_empty_sad.png` | bf2039c2ae59 |
| cu_hero_mid_empty_normal_20261014 | `assets/production/cultivation/hero-empty/hero_mid_empty_normal.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_mid_empty_normal.png` | fe243e60a402 |
| cu_hero_mid_empty_smile_20261014 | `assets/production/cultivation/hero-empty/hero_mid_empty_smile.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_mid_empty_smile.png` | bd28e45c3468 |
| cu_hero_mid_empty_serious_20261014 | `assets/production/cultivation/hero-empty/hero_mid_empty_serious.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_mid_empty_serious.png` | 0102f450d9fd |
| cu_hero_mid_empty_worry_20261014 | `assets/production/cultivation/hero-empty/hero_mid_empty_worry.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_mid_empty_worry.png` | 077b8d669933 |
| cu_hero_mid_empty_surprise_20261014 | `assets/production/cultivation/hero-empty/hero_mid_empty_surprise.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_mid_empty_surprise.png` | c644587ca3fa |
| cu_hero_mid_empty_sad_20261014 | `assets/production/cultivation/hero-empty/hero_mid_empty_sad.png` | `art_sources/hero-unarmed-dialogue-20261014/out/hero_mid_empty_sad.png` | 544e327faee6 |

## 2026-10-14 双甲级群攻：岑霜软鞭战斗表

| ID | 正式文件 | 原件 | SHA-256前12位 |
|---|---|---|---|

## 2026-10-17 交锋领队战斗表重画（高密度试点，2倍最近邻）

| ID | 正式文件 | 原件 | SHA-256前12位 |
|---|---|---|---|
| b_qh_clash_cen_redraw_20261017 | `assets/production/battle/b_qh_clash_cen_redraw_20261017.webp` | `art_sources/qihe-clash-leaders-redraw-20261017/out/b_qh_clash_cen_redraw_20261017.webp` | 4cee22adf16c |
| b_qh_clash_xu_redraw_20261017 | `assets/production/battle/b_qh_clash_xu_redraw_20261017.webp` | `art_sources/qihe-clash-leaders-redraw-20261017/out/b_qh_clash_xu_redraw_20261017.webp` | 286fcbf7ab15 |

## 2026-10-17 主角战斗表高密度重画（2倍最近邻）

| ID | 正式文件 | 原件 | SHA-256前12位 |
|---|---|---|---|
| b_hero_village_staff_hd_20261017 | `assets/production/battle/b_hero_village_staff_hd_20261017.webp` | `art_sources/hero-hd-redraw-20261017/out/b_hero_village_staff_hd_20261017.webp` | a78b293ff2f1 |
| b_hero_modern_hd_20261017 | `assets/production/battle/b_hero_modern_hd_20261017.webp` | `art_sources/hero-hd-redraw-20261017/out/b_hero_modern_hd_20261017.webp` | 8b9c806b6d96 |
| b_gy_hero_sword_steel_hd_20261017 | `assets/production/battle/b_gy_hero_sword_steel_hd_20261017.webp` | `art_sources/hero-hd-redraw-20261017/out/b_gy_hero_sword_steel_hd_20261017.webp` | f1e73381104d |

## 2026-10-17 第二批战斗表高密度重画（2倍最近邻）

| ID | 正式文件 | 原件 | SHA-256前12位 |
|---|---|---|---|
| b_gy_hero_fist_hd_20261017 | `assets/production/battle/b_gy_hero_fist_hd_20261017.webp` | `art_sources/battle-hd-redraw-batch2-20261017/out/b_gy_hero_fist_hd_20261017.webp` | d2b7494ca6f2 |
| b_gy_hero_sword_wood_hd_20261017 | `assets/production/battle/b_gy_hero_sword_wood_hd_20261017.webp` | `art_sources/battle-hd-redraw-batch2-20261017/out/b_gy_hero_sword_wood_hd_20261017.webp` | f5621cf56040 |
| b_gy_hero_dao_hd_20261017 | `assets/production/battle/b_gy_hero_dao_hd_20261017.webp` | `art_sources/battle-hd-redraw-batch2-20261017/out/b_gy_hero_dao_hd_20261017.webp` | 07d9dd0229b5 |
| b_gy_hero_staff_hd_20261017 | `assets/production/battle/b_gy_hero_staff_hd_20261017.webp` | `art_sources/battle-hd-redraw-batch2-20261017/out/b_gy_hero_staff_hd_20261017.webp` | 5899eef99f8c |
| b_gy_hero_needle_hd_20261017 | `assets/production/battle/b_gy_hero_needle_hd_20261017.webp` | `art_sources/battle-hd-redraw-batch2-20261017/out/b_gy_hero_needle_hd_20261017.webp` | e0f2386abfd4 |
| b_ye_initial_needle_hd_20261017 | `assets/production/battle/b_ye_initial_needle_hd_20261017.webp` | `art_sources/battle-hd-redraw-batch2-20261017/out/b_ye_initial_needle_hd_20261017.webp` | 0b3ce47f2089 |
| b_qh_luheng_hd_20261017 | `assets/production/battle/b_qh_luheng_hd_20261017.webp` | `art_sources/battle-hd-redraw-batch2-20261017/out/b_qh_luheng_hd_20261017.webp` | e266ee442a95 |
| b_qh_raider_front_hd_20261017 | `assets/production/battle/b_qh_raider_front_hd_20261017.webp` | `art_sources/battle-hd-redraw-batch2-20261017/out/b_qh_raider_front_hd_20261017.webp` | fe2cd7aa4804 |
| b_qh_raider_rear_hd_20261017 | `assets/production/battle/b_qh_raider_rear_hd_20261017.webp` | `art_sources/battle-hd-redraw-batch2-20261017/out/b_qh_raider_rear_hd_20261017.webp` | 83828790fc72 |
| b_qh_clash_guard_hd_20261017 | `assets/production/battle/b_qh_clash_guard_hd_20261017.webp` | `art_sources/battle-hd-redraw-batch2-20261017/out/b_qh_clash_guard_hd_20261017.webp` | 24a6d68e0250 |

## 2026-10-17 灰狼战斗表高密度重画（2倍最近邻）

| ID | 正式文件 | 原件 | SHA-256前12位 |
|---|---|---|---|
| b_wolf_hd_20261017 | `assets/production/battle/b_wolf_hd_20261017.webp` | `art_sources/wolf-hd-redraw-20261017/out/b_wolf_hd_20261017.webp` | 695bc2e47f43 |

## 2026-10-18 交锋三招特效 v2（2026-10-18 用户评审通过，已接入实机交锋）

按 skill-vfx-pipeline 第 4–5 步由定稿概念图（art_sources/qihe-clash-vfx-concepts-v1/approved.json）拆出单体元素整理而成；只被评审页 review/qihe-clash-vfx-v2/ 加载，实机交锋仍播旧版程序特效，用户确认后再接入。

| ID | 正式文件 | 原件 | SHA-256前12位 |
|---|---|---|---|
| fx_qh_clash_am3_fan_jiangqing | `assets/production/fx/qihe-clash/clash_v2/fx_qh_clash_am3_fan_jiangqing.webp` | `art_sources/qihe-clash-vfx-elements-v1/am3_fan_jiangqing.png` | 0bffdd33bbbd |
| fx_qh_clash_am3_edge_arc | `assets/production/fx/qihe-clash/clash_v2/fx_qh_clash_am3_edge_arc.webp` | `art_sources/qihe-clash-vfx-elements-v1/am3_edge_arc.png` | e2a3b3e41dc8 |
| fx_qh_clash_am3_cross_hit | `assets/production/fx/qihe-clash/clash_v2/fx_qh_clash_am3_cross_hit.webp` | `art_sources/qihe-clash-vfx-elements-v1/am3_cross_hit.png` | 592ee313e20e |
| fx_qh_clash_am3_blade_glint | `assets/production/fx/qihe-clash/clash_v2/fx_qh_clash_am3_blade_glint.webp` | `art_sources/qihe-clash-vfx-elements-v1/am3_blade_glint.png` | 22f13fadb3f0 |
| fx_qh_clash_cs1_wrist_lash | `assets/production/fx/qihe-clash/clash_v2/fx_qh_clash_cs1_wrist_lash.webp` | `art_sources/qihe-clash-vfx-elements-v1/cs1_wrist_lash.png` | f87c0c43e6af |
| fx_qh_clash_cs_copper_point | `assets/production/fx/qihe-clash/clash_v2/fx_qh_clash_cs_copper_point.webp` | `art_sources/qihe-clash-vfx-elements-v1/cs_copper_point.png` | 24381fb5d308 |
| fx_qh_clash_cs2_wisps | `assets/production/fx/qihe-clash/clash_v2/fx_qh_clash_cs2_wisps.webp` | `art_sources/qihe-clash-vfx-elements-v1/cs2_wisps.png` | 78bbe7420c23 |
| fx_qh_clash_cs2_whip_arc | `assets/production/fx/qihe-clash/clash_v2/fx_qh_clash_cs2_whip_arc.webp` | `art_sources/qihe-clash-vfx-elements-v1/cs2_whip_arc.png` | e7a2d1582412 |
| fx_qh_clash_cs2_ghost_red | `assets/production/fx/qihe-clash/clash_v2/fx_qh_clash_cs2_ghost_red.webp` | `art_sources/qihe-clash-vfx-elements-v1/cs2_ghost_red.png` | 34dd337a7a49 |
| fx_qh_clash_cs_copper_sparks | `assets/production/fx/qihe-clash/clash_v2/fx_qh_clash_cs_copper_sparks.webp` | `art_sources/qihe-clash-vfx-elements-v1/cs_copper_sparks.png` | 4936037d634f |

## 2026-10-19 注销：襄阳演示与弃用入口归档

用户要求清理可经后缀进入的被弃用演示。以下 55 项只服务于襄阳演示（#street/#streetbright/#xiangyang）、旧大地图、场景容器、江湖手段原型或街市音景，已从正式清单与运行映射注销，文件移入 `_attic/2026-10-19-deprecated/xiaojianghu-legacy-prologue/`（保持原相对路径，`restore.sh` 可还原）。详见 [更新记录](../updates/2026-10-19-deprecated-entries.md)。

`m_alley_v2`、`m_alley_v2_props`、`m_bgate_v2`、`m_bgate_v2_props`、`m_cave_v2`、`m_cave_v2_props`、`m_crossing_far`、`m_crossing_v2`、`m_crossing_v2_props`、`m_ferry_e_v2`、`m_ferry_e_v2_props`、`m_ferry_v2`、`m_ferry_v2_props`、`m_gate_v2`、`m_gate_v2_props`、`m_street_v2`、`m_street_v2_props`、`m_temple_out_v2`、`m_temple_out_v2_props`、`m_temple_v2`、`m_temple_v2_props`、`m_world`、`bb_alley`、`bb_alley_v3`、`bb_bandit_cave`、`bb_bandit_gate`、`bb_ferry`、`bb_gate`、`bb_river`、`bb_road`、`bb_street`、`bb_temple`、`bb_temple_out`、`bg_alley`、`bg_bandit_cave`、`bg_bandit_gate`、`bg_ferry`、`bg_gate`、`bg_map`、`bg_street`、`bg_temple`、`bg_temple_out`、`containers_v1`、`cg_zhou_rescue`、`amb_street`、`bgm_street`、`arts_fail`、`arts_inquire`、`arts_inspect`、`arts_persuade`、`arts_spar`、`arts_steal`、`arts_success`、`forge`、`kettle`

## 2026-10-20 清理：失效素材移入 _attic

按运行时与静态核查，130 个已登记但不可达的条目从本表去掉；连同被取代旧原件和未登记不可达文件共 214 个文件移入 `_attic/2026-10-20-assets/`（不删除，restore.sh 一键还原）。逐项理由、哈希见该目录 manifest.json 与[清理记录](../updates/2026-10-20-assets-cleanup.md)。supersedes 指向已移走文件的条目已注明“已移入 _attic”。
