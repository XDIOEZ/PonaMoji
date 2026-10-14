/* Original PonaMoji v1.3 dictionary and offline lexical rules. */
(function (global) {
'use strict';
const DATA = {"name":"PonaMoji","version":"1.3","based_on":"Toki Pona (pu-era 120 core roots)","principle":"Each canonical Toki Pona root has exactly one distinct emoji; output retains token-separating spaces.","aliases":{"ali":"ale","kin":"a","oko":"lukin","namako":"sin"},"entries":[{"word":"a","emoji":"✨","meaning":"语气、强调、感叹","category":"功能"},{"word":"akesi","emoji":"🦎","meaning":"爬行动物、两栖动物","category":"自然"},{"word":"ala","emoji":"🚫","meaning":"没有、不、零","category":"功能"},{"word":"alasa","emoji":"🏹","meaning":"寻找、狩猎、采集","category":"动作"},{"word":"ale","emoji":"🌐","meaning":"全部、所有、万物、百","category":"概念"},{"word":"anpa","emoji":"⬇️","meaning":"下方、低、谦卑","category":"空间"},{"word":"ante","emoji":"🔄","meaning":"变化、不同、其他","category":"概念"},{"word":"anu","emoji":"🔀","meaning":"或者","category":"功能"},{"word":"awen","emoji":"🛡️","meaning":"保持、停留、保护、继续","category":"动作"},{"word":"e","emoji":"🎯","meaning":"直接宾语标记","category":"语法"},{"word":"en","emoji":"➕","meaning":"并列主语标记","category":"语法"},{"word":"esun","emoji":"🏪","meaning":"市场、交易、商店","category":"社会"},{"word":"ijo","emoji":"📦","meaning":"物体、东西、事物","category":"概念"},{"word":"ike","emoji":"👎","meaning":"坏、负面、无用","category":"概念"},{"word":"ilo","emoji":"🔧","meaning":"工具、机器、设备","category":"物品"},{"word":"insa","emoji":"🔳","meaning":"内部、中间、里面","category":"空间"},{"word":"jaki","emoji":"🤢","meaning":"脏、不卫生、恶心","category":"概念"},{"word":"jan","emoji":"👤","meaning":"人、某人","category":"人称"},{"word":"jelo","emoji":"🟨","meaning":"黄色","category":"颜色"},{"word":"jo","emoji":"✊","meaning":"持有、拥有","category":"动作"},{"word":"kala","emoji":"🐟","meaning":"鱼、水生动物","category":"自然"},{"word":"kalama","emoji":"🔊","meaning":"声音、发声","category":"动作"},{"word":"kama","emoji":"🛬","meaning":"来到、成为、成功做到","category":"动作"},{"word":"kasi","emoji":"🌿","meaning":"植物、草木","category":"自然"},{"word":"ken","emoji":"✅","meaning":"能够、可能、允许","category":"动作"},{"word":"kepeken","emoji":"🧰","meaning":"使用、借助、用","category":"动作"},{"word":"kili","emoji":"🍎","meaning":"水果、蔬菜、果实","category":"饮食"},{"word":"kiwen","emoji":"🪨","meaning":"石头、金属、坚硬之物","category":"自然"},{"word":"ko","emoji":"🫠","meaning":"黏土、糊状物、粉末","category":"自然"},{"word":"kon","emoji":"💨","meaning":"空气、气息、精神","category":"自然"},{"word":"kule","emoji":"🎨","meaning":"颜色、彩色","category":"颜色"},{"word":"kulupu","emoji":"👥","meaning":"群体、社群、团队","category":"社会"},{"word":"kute","emoji":"👂","meaning":"听、耳朵","category":"动作"},{"word":"la","emoji":"🔻","meaning":"背景、条件分隔符","category":"语法"},{"word":"lape","emoji":"😴","meaning":"睡眠、休息","category":"动作"},{"word":"laso","emoji":"🟦","meaning":"蓝色或绿色","category":"颜色"},{"word":"lawa","emoji":"👑","meaning":"头、领导、控制","category":"人称"},{"word":"len","emoji":"👕","meaning":"布、衣服、遮盖","category":"物品"},{"word":"lete","emoji":"🧊","meaning":"冷、凉、未经加热","category":"自然"},{"word":"li","emoji":"🔹","meaning":"主语与谓语分隔符","category":"语法"},{"word":"lili","emoji":"🤏","meaning":"小、少、年轻","category":"概念"},{"word":"linja","emoji":"🧵","meaning":"绳子、线、毛发","category":"物品"},{"word":"lipu","emoji":"📄","meaning":"纸张、文件、书籍、网页","category":"物品"},{"word":"loje","emoji":"🟥","meaning":"红色","category":"颜色"},{"word":"lon","emoji":"📍","meaning":"在、存在、真实","category":"空间"},{"word":"luka","emoji":"✋","meaning":"手、胳膊、五","category":"人称"},{"word":"lukin","emoji":"👀","meaning":"眼睛、看、观察","category":"动作"},{"word":"lupa","emoji":"🚪","meaning":"门、孔洞、开口","category":"空间"},{"word":"ma","emoji":"🌍","meaning":"土地、地区、世界、国家","category":"自然"},{"word":"mama","emoji":"👪","meaning":"父母、创造者、照顾者","category":"人称"},{"word":"mani","emoji":"💰","meaning":"钱、财富、财产","category":"社会"},{"word":"meli","emoji":"👩","meaning":"女性、女人","category":"人称"},{"word":"mi","emoji":"🙋","meaning":"我、我们","category":"人称"},{"word":"mije","emoji":"👨","meaning":"男性、男人","category":"人称"},{"word":"moku","emoji":"🍽️","meaning":"吃、喝、食物、消耗","category":"饮食"},{"word":"moli","emoji":"💀","meaning":"死亡、死去","category":"概念"},{"word":"monsi","emoji":"🔙","meaning":"后面、背面","category":"空间"},{"word":"mu","emoji":"🐮","meaning":"动物叫声","category":"自然"},{"word":"mun","emoji":"🌙","meaning":"月亮、夜空天体","category":"自然"},{"word":"musi","emoji":"🎮","meaning":"游戏、娱乐、艺术","category":"社会"},{"word":"mute","emoji":"🔢","meaning":"许多、很多、非常","category":"概念"},{"word":"nanpa","emoji":"🔟","meaning":"数字、序数标记","category":"概念"},{"word":"nasa","emoji":"🌀","meaning":"奇怪、反常、迷乱","category":"概念"},{"word":"nasin","emoji":"🛤️","meaning":"道路、方法、习俗","category":"空间"},{"word":"nena","emoji":"⛰️","meaning":"山、凸起、鼻子","category":"自然"},{"word":"ni","emoji":"👇","meaning":"这个、那个","category":"概念"},{"word":"nimi","emoji":"🔤","meaning":"名字、单词","category":"概念"},{"word":"noka","emoji":"🦶","meaning":"脚、腿、底部","category":"人称"},{"word":"o","emoji":"📣","meaning":"呼唤、祈使标记","category":"语法"},{"word":"olin","emoji":"❤️","meaning":"爱、关怀、尊重","category":"情感"},{"word":"ona","emoji":"🧍","meaning":"他、她、它、他们","category":"人称"},{"word":"open","emoji":"🔓","meaning":"开启、开始","category":"动作"},{"word":"pakala","emoji":"💔","meaning":"损坏、出错、受伤","category":"概念"},{"word":"pali","emoji":"🏗️","meaning":"做、工作、制造","category":"动作"},{"word":"palisa","emoji":"🪵","meaning":"杆、棍、长而硬的东西","category":"物品"},{"word":"pan","emoji":"🍞","meaning":"谷物、面包、主食","category":"饮食"},{"word":"pana","emoji":"🎁","meaning":"给予、发送、提供","category":"动作"},{"word":"pi","emoji":"🧩","meaning":"修饰语分组标记","category":"语法"},{"word":"pilin","emoji":"🫀","meaning":"心、感觉、情绪","category":"情感"},{"word":"pimeja","emoji":"⬛","meaning":"黑色、黑暗","category":"颜色"},{"word":"pini","emoji":"🏁","meaning":"结束、完成、过去","category":"概念"},{"word":"pipi","emoji":"🐜","meaning":"虫、昆虫、蜘蛛","category":"自然"},{"word":"poka","emoji":"↔️","meaning":"侧面、旁边、附近","category":"空间"},{"word":"poki","emoji":"🧺","meaning":"容器、盒子、袋子","category":"物品"},{"word":"pona","emoji":"👍","meaning":"好、友善、简单、有用","category":"概念"},{"word":"pu","emoji":"📙","meaning":"使用《Toki Pona》原版教材","category":"社会"},{"word":"sama","emoji":"🪞","meaning":"相似、相同、像","category":"概念"},{"word":"seli","emoji":"🔥","meaning":"热、火、加热","category":"自然"},{"word":"selo","emoji":"🐚","meaning":"表面、外壳、皮肤、边界","category":"自然"},{"word":"seme","emoji":"❓","meaning":"什么、哪个、疑问代词","category":"功能"},{"word":"sewi","emoji":"⬆️","meaning":"上面、高、神圣","category":"空间"},{"word":"sijelo","emoji":"🩻","meaning":"身体、躯体","category":"人称"},{"word":"sike","emoji":"⭕","meaning":"圆、球、循环","category":"概念"},{"word":"sin","emoji":"🆕","meaning":"新、又一个、额外","category":"概念"},{"word":"sina","emoji":"🫵","meaning":"你、你们","category":"人称"},{"word":"sinpin","emoji":"🗿","meaning":"正面、脸、前方","category":"空间"},{"word":"sitelen","emoji":"🖼️","meaning":"图像、符号、文字、绘制","category":"物品"},{"word":"sona","emoji":"🧠","meaning":"知识、知道、会","category":"概念"},{"word":"soweli","emoji":"🐾","meaning":"陆生哺乳动物、兽类","category":"自然"},{"word":"suli","emoji":"🐘","meaning":"大、重要、成年","category":"概念"},{"word":"suno","emoji":"☀️","meaning":"太阳、光、明亮","category":"自然"},{"word":"supa","emoji":"🪑","meaning":"水平表面、桌椅、床","category":"物品"},{"word":"suwi","emoji":"🍬","meaning":"甜、可爱、香甜","category":"饮食"},{"word":"tan","emoji":"↩️","meaning":"来自、因为、原因","category":"空间"},{"word":"taso","emoji":"☝️","meaning":"但是、仅仅","category":"功能"},{"word":"tawa","emoji":"🚶","meaning":"移动、去、朝向、为了","category":"空间"},{"word":"telo","emoji":"💧","meaning":"水、液体、饮料","category":"自然"},{"word":"tenpo","emoji":"⏰","meaning":"时间、时刻、时期","category":"概念"},{"word":"toki","emoji":"🗣️","meaning":"说、交流、语言","category":"动作"},{"word":"tomo","emoji":"🏠","meaning":"房子、建筑、室内","category":"空间"},{"word":"tu","emoji":"2️⃣","meaning":"二、两个","category":"概念"},{"word":"unpa","emoji":"💞","meaning":"亲密、性或婚姻关系","category":"情感"},{"word":"uta","emoji":"👄","meaning":"嘴、嘴唇","category":"人称"},{"word":"utala","emoji":"⚔️","meaning":"争斗、战斗、竞争","category":"动作"},{"word":"walo","emoji":"⬜","meaning":"白色、浅色","category":"颜色"},{"word":"wan","emoji":"1️⃣","meaning":"一、统一、独一","category":"概念"},{"word":"waso","emoji":"🐦","meaning":"鸟、飞行生物","category":"自然"},{"word":"wawa","emoji":"💪","meaning":"力量、强、有活力","category":"概念"},{"word":"weka","emoji":"🫥","meaning":"远离、消失、缺席","category":"空间"},{"word":"wile","emoji":"🤲","meaning":"想要、需要、必须","category":"情感"}],"examples":[{"tp":"toki pona","zh":"好的交流 / 简单的语言","note":"语言的名字就是一个词组","emoji":"🗣️ 👍"},{"tp":"mi olin e sina.","zh":"我爱你。","note":"mi 是我，e 标记爱的对象","emoji":"🙋 ❤️ 🎯 🫵."},{"tp":"jan li moku e kili.","zh":"人吃水果。","note":"一般主语后面使用 li","emoji":"👤 🔹 🍽️ 🎯 🍎."},{"tp":"sina pona.","zh":"你很好。","note":"主语仅有 sina 时省略 li","emoji":"🫵 👍."},{"tp":"mi wile moku e pan.","zh":"我想吃面包。","note":"wile 表示希望、需要","emoji":"🙋 🤲 🍽️ 🎯 🍞."},{"tp":"mi sona ala.","zh":"我不知道。","note":"否定词放在被否定的词后","emoji":"🙋 🧠 🚫."},{"tp":"tenpo suno ni la mi tawa tomo.","zh":"今天我回家 / 去房子。","note":"la 把时间背景和主句隔开","emoji":"⏰ ☀️ 👇 🔻 🙋 🚶 🏠."},{"tp":"jan pi pona mute li pali e tomo.","zh":"非常好的人建造房子。","note":"pi 把 pona mute 合为一个修饰短语","emoji":"👤 🧩 👍 🔢 🔹 🏗️ 🎯 🏠."},{"tp":"soweli suli li lon tomo.","zh":"大动物在房屋里面。","note":"修饰词通常放在名词后面","emoji":"🐾 🐘 🔹 📍 🏠."},{"tp":"sina wile ala wile moku?","zh":"你想不想吃东西？","note":"A ala A 是一种是非问句","emoji":"🫵 🤲 🚫 🤲 🍽️?"},{"tp":"mi kepeken ilo.","zh":"我使用工具。","note":"kepeken 可以表示借助、使用","emoji":"🙋 🧰 🔧."},{"tp":"mi tawa ma.","zh":"我前往陆地 / 某个地方。","note":"tawa 可以表示运动方向","emoji":"🙋 🚶 🌍."}],"conventions":["One space separates every emoji lexeme; comma, question mark, period, and line breaks may be retained.","When the subject is mi or sina alone, omit li. Otherwise use li.","Object e, contextual la, regrouping pi, and imperative o retain Toki Pona grammar.","Proper names may be left as literal names. Custom purely symbolic names require a shared naming convention.","Legacy variants ali, kin, oko, namako normalize to canonical ale, a, lukin, sin respectively.","Chinese-to-Toki-Pona is implemented with limited offline semantic rules; it is not a universal natural-language translator."],"translation":"Client-only rule-based machine translation (RBMT): Chinese ↔ Toki Pona ↔ fixed Emoji. No LLM, no external API."};
const ZH_DATA = {
  greetings: {
    '你好':'toki!', '您好':'toki!', '嗨':'toki!', '再见':'mi tawa!',
    '谢谢':'sina pona!', '非常感谢':'sina pona mute!',
    '对不起':'mi pakala.', '晚安':'o lape pona!',
    '走吧':'o tawa!', '我爱你':'mi olin e sina.',
    '你好吗':'sina pilin pona anu seme?',
    '我很好':'mi pilin pona.', '我不知道':'mi sona ala.',
    '下雨了':'telo li kama tan sewi.',
    '这是什么':'ni li seme?', '这是什么？':'ni li seme?',
  },
  // 名词是一组概念组合，并不对应现代汉语中每一个精细的词义。
  nouns: {
    '道本语':'toki pona','表情语':'toki sitelen', 'emoji语':'toki sitelen',
    '手机':'ilo toki', '电脑':'ilo sona', '计算机':'ilo sona',
    '程序':'sitelen pi ilo sona', '代码':'sitelen pi ilo sona',
    '书':'lipu', '文件':'lipu', '网页':'lipu', '文字':'sitelen', '图片':'sitelen',
    '朋友':'jan pona','孩子':'jan lili','人':'jan','女人':'meli','男人':'mije',
    '妈妈':'mama meli','爸爸':'mama mije','父母':'mama',
    '我':'mi','我们':'mi','你':'sina','你们':'sina',
    '他':'ona','她':'ona','它':'ona','他们':'ona','她们':'ona',
    '猫':'soweli', '狗':'soweli', '动物':'soweli', '鸟':'waso', '鱼':'kala',
    '苹果':'kili', '香蕉':'kili', '水果':'kili', '蔬菜':'kili', '面包':'pan',
    '饭':'moku','食物':'moku','东西':'ijo', '物品':'ijo', '水':'telo',
    '茶':'telo kasi', '咖啡':'telo pimeja', '饮料':'telo',
    '游戏':'musi','沙盒游戏':'musi pi ma suli', // 创造性概括：宽阔世界的游戏
    '音乐':'kalama musi','声音':'kalama', '画':'sitelen',
    '家':'tomo', '家里':'tomo', '房子':'tomo', '房间':'tomo',
    '学校':'tomo sona', '商店':'tomo esun','城市':'ma tomo',
    '世界':'ma','地方':'ma','国家':'ma','土地':'ma','道路':'nasin',
    '天':'sewi', '太阳':'suno','月亮':'mun', '天空':'sewi',
    '雨':'telo','雪':'telo lete','火':'seli','空气':'kon',
    '树':'kasi suli','草':'kasi','植物':'kasi','花':'kasi kule',
    '石头':'kiwen', '金属':'kiwen', '金钱':'mani', '钱':'mani',
    '工具':'ilo', '机器':'ilo', '武器':'ilo utala',
    '门':'lupa', '衣服':'len', '盒子':'poki',
    '什么':'seme','谁':'jan seme','哪里':'ma seme',
  },
  // 词义简化提醒，避免产生“猫≈所有兽类”的误读。
  broad: {
    '猫':'🐾 只表示哺乳动物，不能区分猫和狗',
    '狗':'🐾 只表示哺乳动物，不能区分猫和狗',
    '香蕉':'🍎 只表示水果，不区分香蕉和苹果',
    '苹果':'🍎 只表示水果，不区分具体种类',
    '咖啡':'用「黑色液体」概括咖啡',
    '茶':'用「植物饮料」概括茶',
    '手机':'用「交流工具」概括手机',
    '电脑':'用「知识工具」概括电脑',
    '计算机':'用「知识工具」概括计算机',
    '代码':'用「计算机文字」概括代码',
    '程序':'用「计算机文字」概括程序',
    '沙盒游戏':'用「广大世界的游戏」概括沙盒游戏',
    '回来':'使用 tawa 表达移动，不能单独表达返回的方向',
    '回家':'使用 tawa tomo 表达去家里，未强调「返回」',
    '回':'使用 tawa 表达移动，未强调「返回」',
    '开发':'使用 pali 表达制作／工作，不区分开发活动',
  },
  adjectivals: {
    '非常好':'pona mute', '很好':'pona mute','太好':'pona mute',
    '好':'pona','坏':'ike','糟糕':'ike',
    '开心':'pilin pona','快乐':'pilin pona','高兴':'pilin pona',
    '伤心':'pilin ike','难过':'pilin ike','悲伤':'pilin ike',
    '有趣':'musi','好玩':'musi',
    '冷':'lete','热':'seli','大':'suli','小':'lili',
    '漂亮':'pona','美丽':'pona','强大':'wawa',
    '简单':'pona','复杂':'nasa','新':'sin','旧':'sin ala',
    '重要':'suli','黑':'pimeja', '白':'walo',
  },
  verbs: [
    ['想要','wile','modal'], ['希望','wile','modal'], ['需要','wile','modal'],
    ['能够','ken','modal'], ['可以','ken','modal'], ['可能','ken','modal'],
    ['会','ken','modal'], ['想','wile','modal'], ['要','wile','modal'],
    ['回家','tawa tomo','intrans'],['回来','tawa','intrans'],
    ['去往','tawa','motion'], ['前往','tawa','motion'], ['去','tawa','motion'],
    ['回','tawa','motion'],['走路','tawa','intrans'],['跑步','tawa wawa','intrans'],
    ['跑','tawa wawa','intrans'],['走','tawa','intrans'],
    ['正在','', 'progress'],
    ['不喜欢','pona ala','like'],['喜欢','pona','like'],
    ['看见','lukin','trans'],['看到','lukin','trans'],['看','lukin','trans'],
    ['听见','kute','trans'],['听','kute','trans'],
    ['写','sitelen','trans'],['画','sitelen','trans'],
    ['吃','moku','trans'],['喝','moku','trans'],
    ['爱','olin','trans'],['拥有','jo','trans'],['有','jo','trans'],
    ['没有','jo ala','trans'],
    ['开发','pali','trans'],['制作','pali','trans'],['制造','pali','trans'],
    ['建造','pali','trans'],['做','pali','trans'],
    ['学习','kama sona','trans'],['研究','alasa sona','trans'],
    ['知道','sona','trans'],['认识','sona','trans'],
    ['打开','open','trans'],['关闭','pini','trans'],
    ['使用','kepeken','with'],['用','kepeken','with'],
    ['工作','pali','intrans'],['睡觉','lape','intrans'],['睡','lape','intrans'],
    ['玩游戏','musi','intrans'],['玩','musi','play'],
    ['说话','toki','intrans'],['聊天','toki','intrans'],
    ['说','toki','trans'], ['开始','open','modal'],
    ['住','awen','stay'],['待','awen','stay'],
    ['等待','awen','intrans'],
    ['下雨','telo li kama tan sewi','weather'],
    ['下雪','telo lete li kama tan sewi','weather'],
  ],
  times: {
    '今天':'tenpo suno ni','昨天':'tenpo suno pini','明天':'tenpo suno kama',
    '现在':'tenpo ni','今晚':'tenpo pimeja ni','晚上':'tenpo pimeja',
    '早上':'tenpo suno open','每天':'tenpo suno ale',
  },
  numbers: {'一':'wan','两':'tu','二':'tu','三':'tu wan','四':'tu tu','五':'luka'},
  modifiers: {'很':'mute','非常':'mute','特别':'mute','太':'mute'},
  nounModifiers: {'红色':'loje','红':'loje','蓝色':'laso','蓝':'laso',
    '绿色':'laso','绿':'laso','白色':'walo','黑色':'pimeja',
    '大':'suli','小':'lili','新':'sin','好':'pona','坏':'ike','旧':'sin ala'},
};
// v1.3 更丰富的常用概念。小词根表达抽象概念，不保证专有名词区分。
Object.assign(ZH_DATA.nouns, {
  '猫咪':'soweli','小猫':'soweli lili','小狗':'soweli lili',
  '宠物':'soweli', '森林':'ma kasi','树木':'kasi suli','海洋':'telo suli',
  '河流':'telo', '星星':'mun','地球':'ma','宇宙':'ale',
  '学生':'jan pi kama sona','老师':'jan pi pana sona',
  '故事':'toki','信':'lipu','消息':'toki','电子邮件':'lipu toki',
  '网站':'lipu pi ilo sona','服务器':'ilo sona',
  '游戏开发':'pali musi', '朋友们':'jan pona mute',
  '早饭':'moku pi tenpo suno open', '晚饭':'moku pi tenpo pimeja',
  '牛奶':'telo walo', '杯子':'poki','手机游戏':'musi pi ilo toki',
  '好人':'jan pona','坏人':'jan ike', '礼物':'ijo pi pana',
  '附近':'poka', '时间':'tenpo', '问题':'ijo pi sona ala',
  '你自己':'sina','我自己':'mi',
});
Object.assign(ZH_DATA.adjectivals, {'有意思':'musi','太棒':'pona mute','生气':'pilin ike', '轻松':'pilin pona'});
ZH_DATA.verbs.push(
  ['帮助','pana pona','trans'],['发送','pana','trans'],['阅读','lukin','trans'],
  ['觉得','pilin','trans'],['记得','sona','trans'],['玩耍','musi','intrans'],
  ['买','esun','trans'],['卖','esun','trans'],['寻找','alasa','trans'],
  ['分享','pana','trans'],['保护','awen','trans'],['开','open','trans'],
);

const CN_PHRASE = {
  'jan pona':'朋友','jan lili':'孩子','mama meli':'妈妈','mama mije':'爸爸',
  'ilo sona':'电脑','ilo toki':'通讯设备','sitelen pi ilo sona':'计算机代码',
  'musi pi ma suli':'沙盒游戏','kalama musi':'音乐',
  'tomo sona':'学校','tomo esun':'商店','ma tomo':'城市','telo kasi':'茶',
  'telo pimeja':'深色饮料','telo lete':'雪','kasi suli':'树','kasi kule':'花',
  'ilo utala':'武器','tenpo suno ni':'今天','tenpo suno pini':'昨天',
  'tenpo suno kama':'明天','tenpo ni':'现在','tenpo pimeja ni':'今晚',
  'tenpo pimeja':'夜晚','tenpo suno open':'早上','tenpo suno ale':'每天',
  'ma seme':'哪里','jan seme':'谁',
  'mi':'我','sina':'你','ona':'他/她','jan':'人','meli':'女人','mije':'男人',
  'soweli':'兽类动物','waso':'鸟','kala':'鱼','akesi':'爬行动物','pipi':'昆虫',
  'kili':'水果','pan':'面包','moku':'食物','telo':'水','mani':'钱',
  'musi':'游戏','tomo':'家','ma':'地方','nasin':'路','suno':'太阳',
  'mun':'月亮','seli':'火','lete':'寒冷','sewi':'上方','kiwen':'石头',
  'kasi':'植物','lipu':'书或文件','sitelen':'图像或文字','ilo':'工具',
  'ijo':'东西','poki':'容器','supa':'桌椅','len':'衣服','lupa':'门',
  'kon':'空气','sijelo':'身体','nimi':'名字','kalama':'声音',
  'kulupu':'群体','tenpo':'时间','toki':'语言','wile':'需求',
  'sike':'圆环','pona':'好','ike':'糟糕',
};
const CN_MODIFIER = {suli:'大',lili:'小',pona:'好',ike:'坏',sin:'新',
  loje:'红色',laso:'蓝绿色',walo:'白色',pimeja:'黑色',jelo:'黄色',
  mute:'很多',wawa:'强大',suwi:'可爱',jaki:'脏'};
const CN_VERB = {tawa:'去',jo:'有',olin:'爱',lukin:'看',kute:'听',
  sona:'知道',moku:'吃',pali:'制作',lape:'睡觉',awen:'待着',
  toki:'说',sitelen:'写',musi:'玩',open:'开始',pini:'结束',
  kama:'来',kepeken:'使用',pana:'给',alasa:'寻找',utala:'战斗',
  moli:'死亡',ken:'能够'};
const CN_ADJ = {pona:'很好',ike:'不好',musi:'有趣',suli:'很大',lili:'很小',
  lete:'冷',seli:'热',sin:'新',wawa:'强大',suwi:'可爱',jaki:'脏',
  nasa:'奇怪',pimeja:'黑',walo:'白'};
const CN_TIME = { 'tenpo suno ni':'今天','tenpo suno pini':'昨天',
  'tenpo suno kama':'明天','tenpo ni':'现在','tenpo pimeja ni':'今晚',
  'tenpo pimeja':'晚上','tenpo suno open':'早上','tenpo suno ale':'每天'};
const CN_NUM = {wan:'一',tu:'二',luka:'五'};

// Correct an invalid single-word pi group; root/emoji mappings stay unchanged.
ZH_DATA.nouns['礼物'] = 'ijo pana';
ZH_DATA.verbs.push(['能','ken','modal']);
ZH_DATA.nouns['这'] = 'ni';
ZH_DATA.nouns['那'] = 'ni';
ZH_DATA.nounModifiers['黑'] = 'pimeja';
ZH_DATA.nounModifiers['白'] = 'walo';
ZH_DATA.broad['礼物'] = '用「给予的东西」概括礼物';
ZH_DATA.broad['学生'] = '用「学习的人」概括学生';
ZH_DATA.broad['老师'] = '用「传授知识的人」概括老师';
ZH_DATA.broad['雪'] = '用「冷的水」概括雪';
ZH_DATA.broad['蔬菜'] = 'kili 泛指果实和蔬菜，不保留具体种类';
ZH_DATA.broad['森林'] = '用「植物的土地」概括森林';
ZH_DATA.broad['服务器'] = '用「知识工具」概括服务器';
ZH_DATA.broad['地球'] = 'ma 泛指土地或世界，不唯一表示地球';
ZH_DATA.broad['宇宙'] = '用「万物」概括宇宙';
ZH_DATA.broad['宠物'] = 'soweli 泛指兽类，不保留宠物身份';
Object.assign(DATA, {zhLexicon: ZH_DATA, cn: {phrase: CN_PHRASE, modifier: CN_MODIFIER, verb: CN_VERB, adjective: CN_ADJ, time: CN_TIME, number: CN_NUM}});
global.PonaMojiData = DATA;
})(typeof window !== 'undefined' ? window : globalThis);
