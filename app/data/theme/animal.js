/* ============================================================
   DinoGo · 恐龙英语 — 动物乐园：主题词表、地图与玩法配置
   陆地动物园：10 个主题馆 × 5 关 = 50 关，共用一张连续路线图
   题库共 109 词（仅陆地动物园）：核心动物名词 39 + 动作动词 30 + 身体部位 20 + 特征形容词 20
   每 5 关为一阶段：第 1~4 关按「保底基础题 + 互动进阶题」组卷，第 5 关先占位待迭代
   闯关只使用当前场景的 words，与词性词库完全独立
   ============================================================ */

/* 每个主题馆固定 5 关 */
const LEVELS_PER_VENUE = 5;

/* 路线坐标：animal-zoo-map.webp 上 1~50 号白色圆圈中心（百分比，OpenCV 标定） */
const ANIMAL_ZOO_NODES = [
  { x: 33.49, y: 91.10 }, /* 1 */
  { x: 39.34, y: 84.78 }, /* 2 */
  { x: 38.94, y: 75.22 }, /* 3 */
  { x: 31.36, y: 79.43 }, /* 4 */
  { x: 22.46, y: 79.04 }, /* 5 */
  { x: 18.60, y: 69.28 }, /* 6 */
  { x: 19.00, y: 58.76 }, /* 7 */
  { x: 16.35, y: 47.27 }, /* 8 */
  { x: 7.97, y: 43.25 },  /* 9 */
  { x: 15.15, y: 33.88 }, /* 10 */
  { x: 8.50, y: 23.54 },  /* 11 */
  { x: 13.55, y: 13.97 }, /* 12 */
  { x: 20.07, y: 22.39 }, /* 13 */
  { x: 27.38, y: 25.84 }, /* 14 */
  { x: 34.95, y: 26.03 }, /* 15 */
  { x: 32.29, y: 36.36 }, /* 16 */
  { x: 30.56, y: 45.36 }, /* 17 */
  { x: 32.96, y: 56.08 }, /* 18 */
  { x: 39.73, y: 63.92 }, /* 19 */
  { x: 46.64, y: 64.31 }, /* 20 */
  { x: 50.76, y: 71.00 }, /* 21 */
  { x: 47.04, y: 80.00 }, /* 22 */
  { x: 49.70, y: 89.38 }, /* 23 */
  { x: 56.88, y: 91.48 }, /* 24 */
  { x: 61.93, y: 83.25 }, /* 25 */
  { x: 61.93, y: 73.49 }, /* 26 */
  { x: 58.87, y: 63.92 }, /* 27 */
  { x: 53.42, y: 56.65 }, /* 28 */
  { x: 47.84, y: 47.27 }, /* 29 */
  { x: 44.12, y: 39.04 }, /* 30 */
  { x: 42.66, y: 28.13 }, /* 31 */
  { x: 45.98, y: 16.27 }, /* 32 */
  { x: 52.89, y: 9.76 },  /* 33 */
  { x: 62.72, y: 12.06 }, /* 34 */
  { x: 59.53, y: 27.94 }, /* 35 */
  { x: 59.40, y: 38.66 }, /* 36 */
  { x: 66.58, y: 46.89 }, /* 37 */
  { x: 71.50, y: 54.16 }, /* 38 */
  { x: 75.48, y: 66.79 }, /* 39 */
  { x: 78.14, y: 78.47 }, /* 40 */
  { x: 78.41, y: 89.19 }, /* 41 */
  { x: 86.91, y: 90.91 }, /* 42 */
  { x: 93.69, y: 82.68 }, /* 43 */
  { x: 92.36, y: 72.73 }, /* 44 */
  { x: 91.43, y: 59.33 }, /* 45 */
  { x: 85.71, y: 51.48 }, /* 46 */
  { x: 89.44, y: 41.91 }, /* 47 */
  { x: 83.19, y: 33.88 }, /* 48 */
  { x: 75.61, y: 26.60 }, /* 49 */
  { x: 75.75, y: 16.65 }, /* 50 */
];

/* 10 个主题馆：每馆 5 关，关卡编号 1~50 按馆顺序连续排列 */
/* ============================================================
   动物乐园题库（106 词，仅陆地动物园）
   1. 核心动物名词 39 个：看图选词 / 听音识图 / 词汇拼图
   2. 动作动词 28 个：动作猜猜（中央动态动物 + 纯文字选项）
   3. 身体部位 19 个：局部特写（放大镜高亮局部）
   4. 特征形容词 20 个：对比观察（同框对照 + 高亮目标）
   ============================================================ */
const ANIMAL_ZOO_WORDS = [
  /* ---------------- 1. 核心动物名词 39 个 ---------------- */
  { word: "lion",       zh: "狮子",   phon: "/ˈlaɪən/",       example: "The lion is the king of the zoo.",        emoji: "🦁", category: "noun", animal: true },
  { word: "tiger",      zh: "老虎",   phon: "/ˈtaɪɡə(r)/",    example: "The tiger has orange fur.",               emoji: "🐯", category: "noun", animal: true },
  { word: "monkey",     zh: "猴子",   phon: "/ˈmʌŋki/",       example: "The monkey climbs the tree.",             emoji: "🐒", category: "noun", animal: true },
  { word: "panda",      zh: "熊猫",   phon: "/ˈpændə/",       example: "The panda eats bamboo.",                  emoji: "🐼", category: "noun", animal: true },
  { word: "bear",       zh: "熊",     phon: "/beə(r)/",       example: "The bear is very big.",                   emoji: "🐻", category: "noun", animal: true },
  { word: "zebra",      zh: "斑马",   phon: "/ˈzebrə/",       example: "The zebra has black and white stripes.",  emoji: "🦓", category: "noun", animal: true },
  { word: "giraffe",    zh: "长颈鹿", phon: "/dʒəˈrɑːf/",     example: "The giraffe has a long neck.",            emoji: "🦒", category: "noun", animal: true },
  { word: "elephant",   zh: "大象",   phon: "/ˈelɪfənt/",     example: "The elephant has a long trunk.",          emoji: "🐘", category: "noun", animal: true },
  { word: "hippo",      zh: "河马",   phon: "/ˈhɪpəʊ/",       example: "The hippo likes water.",                  emoji: "🦛", category: "noun", animal: true },
  { word: "crocodile",  zh: "鳄鱼",   phon: "/ˈkrɒkədaɪl/",   example: "The crocodile has sharp teeth.",          emoji: "🐊", category: "noun", animal: true },
  { word: "kangaroo",   zh: "袋鼠",   phon: "/ˌkæŋɡəˈruː/",   example: "The kangaroo jumps very high.",           emoji: "🦘", category: "noun", animal: true },
  { word: "rabbit",     zh: "兔子",   phon: "/ˈræbɪt/",       example: "The rabbit has long ears.",               emoji: "🐰", category: "noun", animal: true },
  { word: "cow",        zh: "奶牛",   phon: "/kaʊ/",          example: "The cow is on the farm.",                 emoji: "🐄", category: "noun", animal: true },
  { word: "fox",        zh: "狐狸",   phon: "/fɒks/",         example: "The fox is clever.",                      emoji: "🦊", category: "noun", animal: true },
  { word: "wolf",       zh: "狼",     phon: "/wʊlf/",         example: "The wolf lives in the forest.",           emoji: "🐺", category: "noun", animal: true },
  { word: "deer",       zh: "鹿",     phon: "/dɪə(r)/",       example: "The deer runs fast.",                     emoji: "🦌", category: "noun", animal: true },
  { word: "sheep",      zh: "绵羊",   phon: "/ʃiːp/",         example: "The sheep has soft wool.",                emoji: "🐑", category: "noun", animal: true },
  { word: "snake",      zh: "蛇",     phon: "/sneɪk/",        example: "The snake is long.",                      emoji: "🐍", category: "noun", animal: true },
  { word: "turtle",     zh: "乌龟",   phon: "/ˈtɜːtl/",       example: "The turtle walks slowly.",                emoji: "🐢", category: "noun", animal: true },
  { word: "goat",       zh: "山羊",   phon: "/ɡəʊt/",         example: "The goat climbs on rocks.",               emoji: "🐐", category: "noun", animal: true },
  { word: "parrot",     zh: "鹦鹉",   phon: "/ˈpærət/",       example: "The parrot has colorful feathers.",       emoji: "🦜", category: "noun", animal: true },
  { word: "duck",       zh: "鸭子",   phon: "/dʌk/",          example: "The duck swims in the pond.",             emoji: "🦆", category: "noun", animal: true },
  { word: "peacock",    zh: "孔雀",   phon: "/ˈpiːkɒk/",      example: "The peacock has a beautiful tail.",       emoji: "🦚", category: "noun", animal: true },
  { word: "donkey",     zh: "驴子",   phon: "/ˈdɒŋki/",       example: "The donkey works on the farm.",           emoji: "🫏", category: "noun", animal: true },
  { word: "camel",      zh: "骆驼",   phon: "/ˈkæml/",        example: "The camel lives in the desert.",          emoji: "🐪", category: "noun", animal: true },
  { word: "squirrel",   zh: "松鼠",   phon: "/ˈskwɪrəl/",     example: "The squirrel has a big tail.",            emoji: "🐿️", category: "noun", animal: true },
  { word: "gorilla",    zh: "大猩猩", phon: "/ɡəˈrɪlə/",      example: "The gorilla is very strong.",             emoji: "🦍", category: "noun", animal: true },
  { word: "rhino",      zh: "犀牛",   phon: "/ˈraɪnəʊ/",      example: "The rhino has a big horn.",               emoji: "🦏", category: "noun", animal: true },
  { word: "cheetah",    zh: "猎豹",   phon: "/ˈtʃiːtə/",      example: "The cheetah runs very fast.",             emoji: "🐆", category: "noun", animal: true },
  { word: "horse",      zh: "马",     phon: "/hɔːs/",         example: "The horse runs very fast.",               emoji: "🐴", category: "noun", animal: true },
  { word: "cat",        zh: "猫",     phon: "/kæt/",          example: "The cat is sleeping on the sofa.",        emoji: "🐱", category: "noun", animal: true },
  { word: "dog",        zh: "狗",     phon: "/dɒɡ/",          example: "The dog likes to play in the yard.",      emoji: "🐶", category: "noun", animal: true },
  { word: "pig",        zh: "猪",     phon: "/pɪɡ/",          example: "The pig is rolling in the mud.",          emoji: "🐷", category: "noun", animal: true },
  { word: "chicken",    zh: "鸡",     phon: "/ˈtʃɪkɪn/",      example: "The chicken lays eggs on the farm.",      emoji: "🐔", category: "noun", animal: true },
  { word: "bird",       zh: "小鸟",   phon: "/bɜːd/",         example: "A bird is singing in the tree.",          emoji: "🐦", category: "noun", animal: true },
  { word: "owl",        zh: "猫头鹰", phon: "/aʊl/",          example: "The owl hunts at night.",                 emoji: "🦉", category: "noun", animal: true },
  { word: "eagle",      zh: "老鹰",   phon: "/ˈiːɡl/",        example: "The eagle flies high in the sky.",        emoji: "🦅", category: "noun", animal: true },
  { word: "crow",       zh: "乌鸦",   phon: "/krəʊ/",         example: "The crow is black and clever.",           emoji: "🐦‍⬛", category: "noun", animal: true },
  { word: "baboon",     zh: "狒狒",   phon: "/bəˈbuːn/",      example: "The baboon lives in the forest.",         emoji: "🐒", category: "noun", animal: true },

  /* ---------------- 2. 动作动词 30 个 ---------------- */
  { word: "eat",        zh: "吃",     phon: "/iːt/",          example: "The panda likes to eat bamboo.",          emoji: "🍽️", category: "verb", actor: "🐼", motion: "eat" },
  { word: "sleep",      zh: "睡觉",   phon: "/sliːp/",        example: "The cat likes to sleep.",                 emoji: "😴", category: "verb", actor: "🐱", motion: "sleep" },
  { word: "jump",       zh: "跳",     phon: "/dʒʌmp/",        example: "The kangaroo can jump high.",             emoji: "🦘", category: "verb", actor: "🦘", motion: "jump" },
  { word: "run",        zh: "跑",     phon: "/rʌn/",          example: "The deer can run fast.",                  emoji: "💨", category: "verb", actor: "🦌", motion: "run" },
  { word: "swim",       zh: "游泳",   phon: "/swɪm/",         example: "The hippo can swim fast.",                emoji: "🏊", category: "verb", actor: "🦛", motion: "swim" },
  { word: "climb",      zh: "爬",     phon: "/klaɪm/",        example: "The monkey climbs the tree.",             emoji: "🧗", category: "verb", actor: "🐒", motion: "climb" },
  { word: "roar",       zh: "吼叫",   phon: "/rɔː(r)/",       example: "The lion roars loudly.",                  emoji: "🔊", category: "verb", actor: "🦁", motion: "roar" },
  { word: "fly",        zh: "飞",     phon: "/flaɪ/",         example: "The parrot can fly.",                     emoji: "🕊️", category: "verb", actor: "🦜", motion: "fly" },
  { word: "bark",       zh: "吠叫",   phon: "/bɑːk/",         example: "The dog barks at strangers.",             emoji: "🐕", category: "verb", actor: "🐕", motion: "roar",   assetKey: "action-bark" },
  { word: "lick",       zh: "舔",     phon: "/lɪk/",          example: "The cat licks its fur.",                  emoji: "🐱", category: "verb", actor: "🐱", motion: "sniff",  assetKey: "action-lick" },
  { word: "hunt",       zh: "捕猎",   phon: "/hʌnt/",         example: "The tiger hunts at night.",               emoji: "🏹", category: "verb", actor: "🐯", motion: "pounce" },
  { word: "bite",       zh: "咬",     phon: "/baɪt/",         example: "The crocodile can bite hard.",            emoji: "🦷", category: "verb", actor: "🐊", motion: "pounce" },
  { word: "dance",      zh: "跳舞",   phon: "/dɑːns/",        example: "The peacock dances in the sun.",          emoji: "💃", category: "verb", actor: "🦚", motion: "dance" },
  { word: "sing",       zh: "唱歌",   phon: "/sɪŋ/",          example: "The bird sings in the tree.",             emoji: "🎵", category: "verb", actor: "🐦", motion: "dance" },
  { word: "splash",     zh: "戏水",   phon: "/splæʃ/",        example: "The hippo splashes in the water.",        emoji: "💦", category: "verb", actor: "🦛", motion: "swim" },
  { word: "dig",        zh: "挖洞",   phon: "/dɪɡ/",          example: "The rabbit digs a hole.",                 emoji: "🕳️", category: "verb", actor: "🐰", motion: "sniff" },
  { word: "stretch",    zh: "伸懒腰", phon: "/stretʃ/",       example: "The dog stretches after a nap.",          emoji: "🐕", category: "verb", actor: "🐕", motion: "stand" },
  { word: "chase",      zh: "追逐",   phon: "/tʃeɪs/",        example: "The wolf chases the deer.",               emoji: "🏃", category: "verb", actor: "🐺", motion: "run" },
  { word: "catch",      zh: "抓住",   phon: "/kætʃ/",         example: "The fox catches a rabbit.",               emoji: "🎯", category: "verb", actor: "🦊", motion: "pounce" },
  { word: "walk",       zh: "走",     phon: "/wɔːk/",         example: "The turtle walks slowly.",                emoji: "🚶", category: "verb", actor: "🐢", motion: "walk" },
  { word: "drink",      zh: "喝",     phon: "/drɪŋk/",        example: "The hippo drinks water.",                 emoji: "🥤", category: "verb", actor: "🦛", motion: "drink",   assetKey: "action-drink" },
  { word: "play",       zh: "玩",     phon: "/pleɪ/",         example: "The monkey likes to play.",               emoji: "🎾", category: "verb", actor: "🐒", motion: "dance",   assetKey: "action-play" },
  { word: "sit",        zh: "坐",     phon: "/sɪt/",          example: "The panda sits on the grass.",            emoji: "🪑", category: "verb", actor: "🐼", motion: "sit",     assetKey: "action-sit" },
  { word: "stand",      zh: "站",     phon: "/stænd/",        example: "The giraffe stands tall.",                emoji: "🧍", category: "verb", actor: "🦒", motion: "stand",   assetKey: "action-stand" },
  { word: "fight",      zh: "打架",   phon: "/faɪt/",         example: "The gorillas fight for fun.",             emoji: "🥊", category: "verb", actor: "🦍", motion: "pounce",  assetKey: "action-fight" },
  { word: "hide",       zh: "躲藏",   phon: "/haɪd/",         example: "The fox hides in the bushes.",            emoji: "🙈", category: "verb", actor: "🦊", motion: "hide",    assetKey: "action-hide" },
  { word: "nap",        zh: "打盹",   phon: "/næp/",          example: "The cat takes a nap in the sun.",         emoji: "😸", category: "verb", actor: "🐱", motion: "sit",     assetKey: "action-nap" },
  { word: "sniff",      zh: "闻",     phon: "/snɪf/",         example: "The wolf sniffs the ground.",             emoji: "👃", category: "verb", actor: "🐺", motion: "sniff",   assetKey: "action-sniff" },

  /* ---------------- 3. 身体部位 19 个 ---------------- */
  { word: "head",       zh: "头",     phon: "/hed/",          example: "The lion has a big head.",                emoji: "🦁", category: "part", owner: "🦁", focus: { x: "0%", y: "-14%", scale: 2.2 } },
  { word: "eye",        zh: "眼睛",   phon: "/aɪ/",           example: "The owl has big eyes.",                   emoji: "👁️", category: "part", owner: "🦉", focus: { x: "0%", y: "-8%", scale: 2.6 } },
  { word: "nose",       zh: "鼻子",   phon: "/nəʊz/",         example: "The dog has a good nose.",                emoji: "👃", category: "part", owner: "🐶", focus: { x: "0%", y: "2%", scale: 2.8 } },
  { word: "mouth",      zh: "嘴巴",   phon: "/maʊθ/",         example: "The hippo has a big mouth.",              emoji: "👄", category: "part", owner: "🦛", focus: { x: "0%", y: "10%", scale: 2.6 } },
  { word: "tail",       zh: "尾巴",   phon: "/teɪl/",         example: "The monkey has a long tail.",             emoji: "🐒", category: "part", owner: "🐒", focus: { x: "20%", y: "10%", scale: 2.6 } },
  { word: "ear",        zh: "耳朵",   phon: "/ɪə(r)/",        example: "The rabbit has long ears.",               emoji: "👂", category: "part", owner: "🐰", focus: { x: "0%", y: "14%", scale: 2.8 } },
  { word: "trunk",      zh: "象鼻",   phon: "/trʌŋk/",        example: "The elephant uses its trunk.",            emoji: "🐘", category: "part", owner: "🐘", focus: { x: "8%", y: "-4%", scale: 2.2 } },
  { word: "wing",       zh: "翅膀",   phon: "/wɪŋ/",          example: "The duck has two wings.",                 emoji: "🦆", category: "part", owner: "🦆", focus: { x: "-14%", y: "2%", scale: 2.4 } },
  { word: "paw",        zh: "脚掌",   phon: "/pɔː/",          example: "The bear has a big paw.",                 emoji: "🐾", category: "part", owner: "🐻", focus: { x: "6%", y: "22%", scale: 2.8 } },
  { word: "fur",        zh: "皮毛",   phon: "/fɜː(r)/",       example: "The panda has soft fur.",                 emoji: "🐼", category: "part", owner: "🐼", focus: { x: "0%", y: "0%", scale: 2.4 } },
  { word: "horn",       zh: "角",     phon: "/hɔːn/",         example: "The rhino has a sharp horn.",             emoji: "🦏", category: "part", owner: "🦏", focus: { x: "10%", y: "-16%", scale: 2.6 } },
  { word: "claw",       zh: "利爪",   phon: "/klɔː/",         example: "The tiger has sharp claws.",              emoji: "🐾", category: "part", owner: "🐯", focus: { x: "-4%", y: "22%", scale: 2.8 } },
  { word: "feather",    zh: "羽毛",   phon: "/ˈfeðə(r)/",     example: "The peacock has colorful feathers.",      emoji: "🪶", category: "part", owner: "🦚", focus: { x: "0%", y: "-6%", scale: 2.2 } },
  { word: "beak",       zh: "喙",     phon: "/biːk/",         example: "The parrot has a strong beak.",           emoji: "🦜", category: "part", owner: "🦜", focus: { x: "0%", y: "8%", scale: 2.4 } },
  { word: "neck",       zh: "脖子",   phon: "/nek/",          example: "The giraffe has a long neck.",            emoji: "🦒", category: "part", owner: "🦒", focus: { x: "6%", y: "-20%", scale: 2.2 } },
  { word: "tooth",      zh: "牙齿",   phon: "/tuːθ/",         example: "The crocodile has sharp teeth.",          emoji: "🦷", category: "part", owner: "🐊", focus: { x: "0%", y: "18%", scale: 2.6 } },
  { word: "tongue",     zh: "舌头",   phon: "/tʌŋ/",          example: "The snake shows its tongue.",             emoji: "👅", category: "part", owner: "🐍", focus: { x: "0%", y: "8%", scale: 2.8 } },
  { word: "leg",        zh: "腿",     phon: "/leɡ/",          example: "The zebra has four strong legs.",         emoji: "🦵", category: "part", owner: "🦓", focus: { x: "0%", y: "22%", scale: 2.6 } },
  { word: "belly",      zh: "肚子",   phon: "/ˈbeli/",        example: "The cat has a soft belly.",               emoji: "🐱", category: "part", owner: "🐱", focus: { x: "0%", y: "6%", scale: 2.4 } },

  /* ---------------- 4. 特征形容词 20 个（成对出现） ---------------- */
  { word: "big",        zh: "大的",   phon: "/bɪɡ/",          example: "The elephant is big.",                    emoji: "🐘", category: "adj",
    compare: { pair: "small", mode: "size", target: "a", a: { emoji: "🐘", scale: 1.35 }, b: { emoji: "🐭", scale: 0.62 } } },
  { word: "small",      zh: "小的",   phon: "/smɔːl/",         example: "The mouse is small.",                     emoji: "🐭", category: "adj",
    compare: { pair: "big", mode: "size", target: "b", a: { emoji: "🐘", scale: 1.35 }, b: { emoji: "🐭", scale: 0.62 } } },
  { word: "tall",       zh: "高的",   phon: "/tɔːl/",          example: "The giraffe is tall.",                    emoji: "🦒", category: "adj",
    compare: { pair: "short", mode: "height", target: "a", a: { emoji: "🦒", scale: 1.45 }, b: { emoji: "🐰", scale: 0.72 } } },
  { word: "short",      zh: "矮的",   phon: "/ʃɔːt/",          example: "The rabbit is short.",                    emoji: "🐰", category: "adj",
    compare: { pair: "tall", mode: "height", target: "b", a: { emoji: "🦒", scale: 1.45 }, b: { emoji: "🐰", scale: 0.72 } } },
  { word: "long",       zh: "长的",   phon: "/lɒŋ/",           example: "The snake is long.",                      emoji: "🐍", category: "adj",
    compare: { pair: "short", mode: "length", target: "a", a: { emoji: "🐍", scale: 1.15 }, b: { emoji: "🐇", scale: 0.92 } } },
  { word: "fast",       zh: "快的",   phon: "/fɑːst/",         example: "The cheetah runs fast.",                  emoji: "🐆", category: "adj",
    compare: { pair: "slow", mode: "speed", target: "a", a: { emoji: "🐆", scale: 1 }, b: { emoji: "🐢", scale: 1 } } },
  { word: "slow",       zh: "慢的",   phon: "/sləʊ/",          example: "The turtle walks slowly.",                emoji: "🐢", category: "adj",
    compare: { pair: "fast", mode: "speed", target: "b", a: { emoji: "🐆", scale: 1 }, b: { emoji: "🐢", scale: 1 } } },
  { word: "fat",        zh: "胖的",   phon: "/fæt/",           example: "The pig is fat.",                         emoji: "🐷", category: "adj",
    compare: { pair: "thin", mode: "size", target: "a", a: { emoji: "🐷", scale: 1.2 }, b: { emoji: "🐒", scale: 0.9 } } },
  { word: "thin",       zh: "瘦的",   phon: "/θɪn/",           example: "The monkey is thin.",                     emoji: "🐒", category: "adj",
    compare: { pair: "fat", mode: "size", target: "b", a: { emoji: "🐷", scale: 1.2 }, b: { emoji: "🐒", scale: 0.9 } } },
  { word: "strong",     zh: "强壮的", phon: "/strɒŋ/",         example: "The gorilla is strong.",                  emoji: "🦍", category: "adj",
    compare: { pair: "small", mode: "size", target: "a", a: { emoji: "🦍", scale: 1.2 }, b: { emoji: "🐭", scale: 0.7 } } },
  { word: "quiet",      zh: "安静的", phon: "/ˈkwaɪət/",       example: "The rabbit is quiet.",                    emoji: "🐰", category: "adj",
    compare: { pair: "noisy", mode: "sound", target: "a", a: { emoji: "🐰", scale: 1, badge: "🤫" }, b: { emoji: "🦁", scale: 1, badge: "🔊" } } },
  { word: "noisy",      zh: "吵闹的", phon: "/ˈnɔɪzi/",        example: "The lion is noisy.",                      emoji: "🦁", category: "adj",
    compare: { pair: "quiet", mode: "sound", target: "b", a: { emoji: "🐰", scale: 1, badge: "🤫" }, b: { emoji: "🦁", scale: 1, badge: "🔊" } } },
  { word: "cute",       zh: "可爱的", phon: "/kjuːt/",         example: "The rabbit is very cute.",                emoji: "🐰", category: "adj" },
  { word: "clean",      zh: "干净的", phon: "/kliːn/",         example: "The cat is very clean.",                  emoji: "🐱", category: "adj" },
  { word: "heavy",      zh: "重的",   phon: "/ˈhevi/",         example: "The elephant is heavy.",                  emoji: "🐘", category: "adj",
    compare: { pair: "light", mode: "weight", target: "a", a: { emoji: "🐘", scale: 1.15 }, b: { emoji: "🪶", scale: 0.9 } } },
  { word: "light",      zh: "轻的",   phon: "/laɪt/",          example: "The feather is light.",                   emoji: "🪶", category: "adj",
    compare: { pair: "heavy", mode: "weight", target: "b", a: { emoji: "🐘", scale: 1.15 }, b: { emoji: "🪶", scale: 0.9 } } },
  { word: "hungry",     zh: "饥饿的", phon: "/ˈhʌŋɡri/",       example: "The wolf is hungry.",                     emoji: "🐺", category: "adj",
    compare: { pair: "full", mode: "state", target: "a", a: { emoji: "🐺", scale: 1, badge: "🥣" }, b: { emoji: "🐺", scale: 1, badge: "🍗" } } },
  { word: "full",       zh: "饱的",   phon: "/fʊl/",           example: "The wolf is full.",                       emoji: "🐺", category: "adj",
    compare: { pair: "hungry", mode: "state", target: "b", a: { emoji: "🐺", scale: 1, badge: "🥣" }, b: { emoji: "🐺", scale: 1, badge: "🍗" } } },
  { word: "angry",      zh: "愤怒的", phon: "/ˈæŋɡri/",        example: "The monkey looks angry.",                 emoji: "🐵", category: "adj",
    compare: { pair: "scared", mode: "state", target: "a", a: { emoji: "🐵", scale: 1, badge: "💢" }, b: { emoji: "🐵", scale: 1, badge: "😱" } } },
  { word: "scared",     zh: "害怕的", phon: "/skeəd/",         example: "The monkey looks scared.",                emoji: "🐵", category: "adj",
    compare: { pair: "angry", mode: "state", target: "b", a: { emoji: "🐵", scale: 1, badge: "💢" }, b: { emoji: "🐵", scale: 1, badge: "😱" } } },
];

/* 素材键（assetKey）：题目与图片解耦
   - 普通词默认用单词本身作为素材键
   - 成对形容词共用同一个素材键，只通过前端高亮框（target）切换考察对象
     例如 big / small 共用 "elephant-mouse" 底图，不必重复绘制 */
const ANIMAL_ADJ_ASSET_KEYS = {
  big: "elephant-mouse",     small: "elephant-mouse",
  tall: "giraffe-rabbit",    short: "giraffe-rabbit",
  long: "snake-rabbit",
  fast: "cheetah-turtle",    slow: "cheetah-turtle",
  fat: "pig-monkey",         thin: "pig-monkey",
  strong: "gorilla-mouse",
  quiet: "rabbit-lion",      noisy: "rabbit-lion",
  heavy: "elephant-feather", light: "elephant-feather",
  hungry: "wolf-meal",       full: "wolf-meal",
  angry: "monkey-mood",      scared: "monkey-mood",
};

/* 仅为声音线索明确的动作配置本地拟声音效；其余动作点击喇叭不播放 */
const ANIMAL_ACTION_SOUND_WORDS = new Set([
  "eat", "sleep", "jump", "run", "swim", "roar", "fly", "bark",
  "lick", "bite", "sing", "splash", "dig", "walk", "drink", "sniff",
]);

/* ============================================================
   素材挂载：食物、宿主动物、图片与对话线索
   - 数据层只补字段，渲染层按字段取图，缺图时回退 emoji
   - 食物图统一命名为 food-xx.webp 放在 images/words/food/，动作图放在 images/words/action/
   ============================================================ */
const ANIMAL_FOODS = {
  meat:   { id: "meat",   en: "meat",   zh: "肉",     phon: "/miːt/",            emoji: "🥩", img: "images/words/food/food-meat.webp" },
  bamboo: { id: "bamboo", en: "bamboo", zh: "竹子",   phon: "/bæmˈbuː/",         emoji: "🎋", img: "images/words/food/food-bamboo.webp" },
  banana: { id: "banana", en: "banana", zh: "香蕉",   phon: "/bəˈnɑːnə/",        emoji: "🍌", img: "images/words/food/food-banana.webp" },
  carrot: { id: "carrot", en: "carrot", zh: "胡萝卜", phon: "/ˈkærət/",          emoji: "🥕", img: "images/words/food/food-carrot.webp" },
  grass:  { id: "grass",  en: "grass",  zh: "青草",   phon: "/ɡrɑːs/",           emoji: "🌿", img: "images/words/food/food-grass.webp" },
  fish:   { id: "fish",   en: "fish",   zh: "鱼",     phon: "/fɪʃ/",             emoji: "🐟", img: "images/words/food/food-fish.webp" },
  nut:    { id: "nut",    en: "nut",    zh: "坚果",   phon: "/nʌt/",             emoji: "🌰", img: "images/words/food/food-nut.webp" },
  bone:   { id: "bone",   en: "bone",   zh: "骨头",   phon: "/bəʊn/",            emoji: "🦴", img: "images/words/food/food-bone.webp" },
  apple:  { id: "apple",  en: "apple",  zh: "苹果",   phon: "/ˈæpəl/",           emoji: "🍎", img: "images/words/food/food-apple.webp" },
  worm:   { id: "worm",   en: "worm",   zh: "虫子",   phon: "/wɜːm/",            emoji: "🪱", img: "images/words/food/food-worm.webp" },
  leaves: { id: "leaves", en: "leaves", zh: "树叶",   phon: "/liːvz/",           emoji: "🍃", img: "images/words/food/food-leaves.webp" },
  corn:   { id: "corn",   en: "corn",   zh: "玉米",   phon: "/kɔːn/",            emoji: "🌽", img: "images/words/food/food-corn.webp" },
  milk:   { id: "milk",   en: "milk",   zh: "牛奶",   phon: "/mɪlk/",            emoji: "🥛", img: "images/words/food/food-milk.webp" },
  honey:  { id: "honey",  en: "honey",  zh: "蜂蜜",   phon: "/ˈhʌni/",           emoji: "🍯", img: "images/words/food/food-honey.webp" },
  watermelon: { id: "watermelon", en: "watermelon", zh: "西瓜", phon: "/ˈwɔːtəmelən/", emoji: "🍉", img: "images/words/food/food-watermelon.webp" },
};

/* 39 种动物各自爱吃的食物 */
const ANIMAL_FEED_MAP = {
  lion: "meat", tiger: "meat", wolf: "meat", fox: "meat", crocodile: "meat",
  cheetah: "meat", eagle: "meat", owl: "meat", snake: "meat",
  zebra: "grass", deer: "grass", cow: "grass", sheep: "grass", goat: "grass", kangaroo: "grass", rhino: "grass", camel: "grass", turtle: "grass",
  giraffe: "leaves", elephant: "leaves", hippo: "watermelon",
  chicken: "corn", bird: "worm", peacock: "worm", crow: "worm",
  monkey: "banana", gorilla: "banana", baboon: "banana",
  rabbit: "carrot", horse: "carrot", donkey: "carrot",
  bear: "honey", cat: "milk", duck: "fish",
  squirrel: "nut", parrot: "nut",
  pig: "apple",
  panda: "bamboo",
  dog: "bone",
};

/* 19 个身体部位 → 宿主动物（局部特写直接裁剪宿主图片） */
const PART_OWNER_WORD_MAP = {
  head: "lion", eye: "owl", nose: "dog", mouth: "hippo",
  tail: "monkey", ear: "rabbit", trunk: "elephant", wing: "duck",
  paw: "bear", fur: "panda", horn: "rhino",
  claw: "tiger", feather: "peacock", beak: "parrot",
  neck: "giraffe", tooth: "crocodile", tongue: "snake", leg: "zebra", belly: "cat",
};

ANIMAL_ZOO_WORDS.forEach((w) => {
  if (w.category === "verb") {
    /* 动作题统一用 action-{word} 素材键，已有自定义键保持不变 */
    if (!w.assetKey || w.assetKey.indexOf("action-") !== 0) w.assetKey = `action-${w.word}`;
    w.img = w.img || `images/words/action/${w.assetKey}.webp`;
    w.actionSound = ANIMAL_ACTION_SOUND_WORDS.has(w.word) ? w.word : "";
  } else if (w.category === "part") {
    w.ownerWord = PART_OWNER_WORD_MAP[w.word] || "lion";
    w.assetKey = w.assetKey || w.ownerWord;
    w.img = w.img || `images/words/animal/${w.ownerWord}.webp`;
  } else if (w.category === "adj") {
    w.assetKey = w.assetKey || ANIMAL_ADJ_ASSET_KEYS[w.word] || w.word;
  } else {
    w.assetKey = w.assetKey || w.word;
    w.img = w.img || `images/words/animal/${w.word}.webp`;
    const foodId = ANIMAL_FEED_MAP[w.word] || "apple";
    w.foodId = foodId;
    w.food = ANIMAL_FOODS[foodId];
    w.eats = foodId;
    w.dialogueClue = w.example
      ? w.example.replace(new RegExp(`\\b${w.word}\\b`, "i"), "___")
      : "";
  }
});

const ANIMAL_ZOO_VENUES = [
  {
    id: "lion",
    en: "Lion Savannah",
    zh: "狮子草原",
    icon: "🦁",
  },
  {
    id: "monkey",
    en: "Monkey Island",
    zh: "猴子岛",
    icon: "🐒",
  },
  {
    id: "plains",
    en: "Giraffe & Zebra Plains",
    zh: "长颈鹿斑马平原",
    icon: "🦒",
  },
  {
    id: "elephant",
    en: "Elephant Kingdom",
    zh: "大象王国",
    icon: "🐘",
  },
  {
    id: "reptile",
    en: "Reptile Museum",
    zh: "爬行动物馆",
    icon: "🦎",
  },
  {
    id: "tiger",
    en: "Tiger Temple",
    zh: "老虎庙",
    icon: "🐯",
  },
  {
    id: "panda",
    en: "Panda Pavilion",
    zh: "熊猫馆",
    icon: "🐼",
  },
  {
    id: "kangaroo",
    en: "Kangaroo Creek",
    zh: "袋鼠溪",
    icon: "🦘",
  },
  {
    id: "bird",
    en: "Bird Aviary",
    zh: "鸟舍",
    icon: "🦜",
  },
  {
    id: "circus",
    en: "Animal Frolic Circus",
    zh: "动物欢乐马戏团",
    icon: "🎪",
  },
];

/* 展平为 50 个关卡：level 1~50，step 为馆内第 1~5 关 */
const ANIMAL_ZOO_LEVELS = ANIMAL_ZOO_VENUES.flatMap((venue, vi) =>
  Array.from({ length: LEVELS_PER_VENUE }, (_, li) => {
    const level = vi * LEVELS_PER_VENUE + li + 1;
    return {
      level,
      venueIndex: vi,
      venue,
      step: li + 1,
      x: ANIMAL_ZOO_NODES[level - 1].x,
      y: ANIMAL_ZOO_NODES[level - 1].y,
    };
  })
);

/* 全场景词池：50 关共用同一套 109 词题库（仅陆地动物园） */

const ANIMAL_SCENES = [
  {
    id: "zoo",
    name: "陆地动物园",
    /* 入口图层：整张 Zoo English Adventure 地图，点击图上「开始闯关」进入路线图 */
    image: "./images/background/animal-zoo-cover.webp",
    mapImage: "./images/background/animal-zoo-map.webp",
    routeLabel: "草原探索路线",
    description: "狮子、长颈鹿与草原伙伴",
    playable: true,
    levelCount: ANIMAL_ZOO_LEVELS.length,
    venues: ANIMAL_ZOO_VENUES,
    levels: ANIMAL_ZOO_LEVELS,
    words: ANIMAL_ZOO_WORDS,
  },
];

/* ============================================================
   🦁 路线弹框（底部抽屉）
   - 点「开始闯关」后升起，使用原版海报地图（不重绘画面）
   - 50 个关卡点直接落在图上 1~50 号白色圆圈中心
   - 节点只画状态环：已通关绿色、当前关金色跳动、未解锁灰化，保留底图原数字
   - 抽屉内支持 100% / 150% / 200% / 250% 缩放，打开时自动定位当前关
   ============================================================ */
const ZOO_ZOOM_STEPS = [1, 1.5, 2, 2.5];
let zooZoom = 1;

function zooBoardEls() {
  const viewport = document.querySelector(".zoo-board-viewport");
  const inner = viewport && viewport.querySelector(".zoo-board-inner");
  const label = document.querySelector(".zoo-zoom-val");
  return { viewport, inner, label };
}

/* 以当前关为锚点缩放，放大后始终把当前关留在视口中央 */
function zooApplyZoom() {
  const { viewport, inner, label } = zooBoardEls();
  if (!viewport || !inner) return;
  inner.style.width = (zooZoom * 100) + "%";
  if (label) label.textContent = Math.round(zooZoom * 100) + "%";
  requestAnimationFrame(zooFocusCurrent);
}

/* 把当前关节点滚到视口中央 */
function zooFocusCurrent() {
  const { viewport } = zooBoardEls();
  const node = viewport && viewport.querySelector(".zoo-step.current");
  if (!viewport || !node) return;
  const vr = viewport.getBoundingClientRect();
  const nr = node.getBoundingClientRect();
  viewport.scrollLeft += nr.left - vr.left - (vr.width - nr.width) / 2;
  viewport.scrollTop += nr.top - vr.top - (vr.height - nr.height) / 2;
}

window.ZooRouteView = {
  focusCurrent: zooFocusCurrent,
  zoomIn() {
    const i = ZOO_ZOOM_STEPS.indexOf(zooZoom);
    zooZoom = ZOO_ZOOM_STEPS[Math.min(ZOO_ZOOM_STEPS.length - 1, (i < 0 ? 0 : i) + 1)];
    zooApplyZoom();
  },
  zoomOut() {
    const i = ZOO_ZOOM_STEPS.indexOf(zooZoom);
    zooZoom = ZOO_ZOOM_STEPS[Math.max(0, (i < 0 ? 0 : i) - 1)];
    zooApplyZoom();
  },
  resetZoom() {
    zooZoom = 1;
    zooApplyZoom();
    zooFocusCurrent();
  },
};

function renderZooRouteSheet(scene, prog) {
  zooZoom = 1;
  const total = scene.levelCount || scene.levels.length;
  const level = Math.min(total, Math.max(1, prog.level || 1));
  const stars = Object.values(prog.stars || {}).reduce((a, b) => a + (Number(b) || 0), 0);
  const starMax = Math.floor(total / LEVELS_PER_VENUE) * 3;
  const current = scene.levels[level - 1];
  const venue = current ? current.venue : scene.venues[scene.venues.length - 1];

  const nodes = scene.levels.map((s) => {
    const locked = s.level > level || !canEnterLevel(s.level);
    const done = s.level < level;
    const isCurrent = s.level === level;
    const cls = [
      "animal-route-node", "zoo-step",
      done ? "done" : "",
      isCurrent ? "current" : "",
      locked ? "locked" : "",
      s.step === LEVELS_PER_VENUE ? "venue-boss" : "",
    ].filter(Boolean).join(" ");
    return `<button type="button" class="${cls}" style="left:${s.x}%;top:${s.y}%"
        data-action="zoo-node" data-level="${s.level}"
        title="${s.venue.zh} · 第 ${s.level} 关"
        aria-label="${s.venue.zh}第 ${s.step} 关${done ? "，已通关" : isCurrent ? "，当前关卡" : "，未解锁"}"
        ${locked ? "disabled" : ""}><span class="zoo-step-num">${s.level}</span></button>`;
  }).join("");

  return `<div class="overlay">
    <section class="sheet animal-route-sheet zoo-route-sheet" role="dialog" aria-modal="true" aria-label="陆地动物园闯关路线">
      <div class="grab"></div>
      <div class="zoo-route-head">
        <div class="zoo-route-title">
          <strong>🦁 陆地动物园</strong>
          <small>第 ${level} 关 · ${venue ? venue.zh : "全部通关"} · ★ ${stars} / ${starMax}</small>
        </div>
        <button type="button" class="zoo-route-close" data-action="close-overlay" aria-label="关闭路线图">×</button>
      </div>
      <div class="zoo-board-frame">
        <div class="zoo-board-viewport">
          <div class="zoo-board-inner">
            <div class="animal-route-map has-map zoo" style="--arm-ratio:1505/1045">
              <img class="arm-bg" src="${scene.mapImage}" alt="陆地动物园闯关路线图">
              ${nodes}
            </div>
          </div>
        </div>
        <div class="zoo-zoom-bar" role="group" aria-label="路线图缩放">
          <button type="button" data-action="zoo-zoom-out" aria-label="缩小路线图">−</button>
          <button type="button" class="zoo-zoom-val" data-action="zoo-zoom-reset" title="恢复 100%">100%</button>
          <button type="button" data-action="zoo-zoom-in" aria-label="放大路线图">＋</button>
        </div>
      </div>
    </section>
  </div>`;
}

defineDinoTheme({
  id: "animal",
  name: "动物乐园",
  chip: "动物单词",
  unit: "Unit 2 · 动物乐园",
  emoji: "🦁",
  dialog: { q: "What animal is this?", a: "It's a {word}." },
  scenes: ANIMAL_SCENES,
  map: {
    title: "动物园闯关地图",
    intro: "点击图上「开始闯关」，沿着路线完成 10 个主题馆、50 个关卡的单词任务。",
    sceneSelector: true,
    bg: "#FBF3E3",
    border: "#E7DAC3",
    render() {
      /* 整张地图作为入口图层，点图上「开始闯关」弹出路线抽屉 */
      const scene = ANIMAL_SCENES.find((s) => s.id === "zoo");
      return `<section class="zoo-cover-layer">
        <img class="zoo-cover-img" src="${scene.image}" alt="Zoo English Adventure 动物园闯关地图">
        <button type="button" class="zoo-cover-start" data-action="open-animal-scene" data-scene="zoo" aria-label="开始闯关"></button>
      </section>
      ${window.ChestManager && ChestManager.isAllCleared()
        ? `<div class="zoo-all-clear"><span>🏆</span> 陆地动物园全部通关！</div>`
        : ""}`;
    },
  },
});
