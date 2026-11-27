/* ============================================================
   DinoGo · 恐龙英语 — 动物乐园：主题词表、地图与玩法配置
   神奇动物园：50 关，共用一张连续路线图
   题库共 125 词（仅神奇动物园）：核心动物名词 57 + 动作动词 49 + 身体部位 19
   每 5 关为一阶段：第 1~4 关按「保底基础题 + 互动进阶题」组卷，第 5 关先占位待迭代
   闯关只使用当前场景的 words，与词性词库完全独立
   ============================================================ */

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

/* 关卡编号 1~50，按固定顺序连续排列 */
/* ============================================================
   动物乐园题库（125 词，仅神奇动物园）
   1. 核心动物名词 57 个（含 14 个海洋动物）：看图选词 / 听音戳泡泡
   2. 动作动词 49 个：动作猜猜（中央动态动物 + 纯文字选项）
   3. 身体部位 19 个：身体部位词汇与宿主动物插画
   ============================================================ */
/* 词表：引用全局词库（data/game/library.js），不再自带词表
   - 字符串引用 = 整条取库；动词对象 = 库条目 + 地图动画参数（actor/motion）
   - 同一个词可被其他主题（school 等）同时引用；下方 normalize 仍按原逻辑
     派生 assetKey/img/food/dialogueClue 等动物园场景字段 */
const ANIMAL_ZOO_WORD_REFS = [
  /* ---------------- 1. 核心动物名词 58 个 ---------------- */
  "lion", "tiger", "monkey", "panda",
  "bear", "zebra", "giraffe", "elephant",
  "hippo", "crocodile", "kangaroo", "rabbit",
  "cow", "fox", "wolf", "deer",
  "sheep", "snake", "turtle", "goat",
  "parrot", "duck", "peacock", "donkey",
  "camel", "squirrel", "gorilla", "rhino",
  "cheetah", "horse", "cat", "dog",
  "pig", "chicken", "bird", "owl",
  "eagle", "crow", "baboon",
  "flamingo", "koala", "lizard", "raccoon", "sloth",
  /* 海洋动物 13 个（turtle 已包含在上方陆地名单，合计 14 种）
     fish 只作为食物词（ANIMAL_FOODS），不再作为动物园名词出题 */
  "penguin", "shark", "seal", "whale",
  "dolphin", "octopus", "crab", "starfish", "jellyfish",
  "shrimp", "squid", "clownfish",
  /* ---------------- 2. 动作动词（actor/motion 为动物园地图动画参数） 49 个 ---------------- */
  { word: "eat", actor: "🐼", motion: "eat" },
  { word: "sleep", actor: "🐱", motion: "sleep" },
  { word: "jump", actor: "🦘", motion: "jump" },
  { word: "run", actor: "🦌", motion: "run" },
  { word: "swim", actor: "🦛", motion: "swim" },
  { word: "climb", actor: "🐒", motion: "climb" },
  { word: "roar", actor: "🦁", motion: "roar" },
  { word: "fly", actor: "🦜", motion: "fly" },
  { word: "bark", actor: "🐕", motion: "roar" },
  { word: "lick", actor: "🐱", motion: "sniff" },
  { word: "hunt", actor: "🐯", motion: "pounce" },
  { word: "bite", actor: "🐊", motion: "pounce" },
  { word: "dance", actor: "🦚", motion: "dance" },
  { word: "sing", actor: "🐦", motion: "dance" },
  { word: "splash", actor: "🦛", motion: "swim" },
  { word: "dig", actor: "🐰", motion: "sniff" },
  { word: "stretch", actor: "🐕", motion: "stand" },
  { word: "chase", actor: "🐺", motion: "run" },
  { word: "catch", actor: "🦊", motion: "pounce" },
  { word: "walk", actor: "🐢", motion: "walk" },
  { word: "drink", actor: "🦛", motion: "drink" },
  { word: "play", actor: "🐒", motion: "dance" },
  { word: "sit", actor: "🐼", motion: "sit" },
  { word: "stand", actor: "🦒", motion: "stand" },
  { word: "fight", actor: "🦍", motion: "pounce" },
  { word: "hide", actor: "🦊", motion: "hide" },
  { word: "nap", actor: "🐱", motion: "sit" },
  { word: "sniff", actor: "🐺", motion: "sniff" },
  { word: "see", actor: "🦉", motion: "stand" },
  { word: "look", actor: "🐱", motion: "stand" },
  { word: "listen", actor: "🐰", motion: "sit" },
  { word: "share", actor: "🐿️", motion: "sit" },
  { word: "give", actor: "🐒", motion: "stand" },
  { word: "help", actor: "🐘", motion: "walk" },
  { word: "love", actor: "🐻", motion: "stand" },
  { word: "smile", actor: "🐱", motion: "sit" },
  { word: "laugh", actor: "🦜", motion: "dance" },
  { word: "cry", actor: "🐺", motion: "roar" },
  { word: "wave", actor: "🐒", motion: "dance" },
  { word: "hug", actor: "🐻", motion: "stand" },
  { word: "wait", actor: "🐶", motion: "sit" },
  { word: "find", actor: "🦊", motion: "sniff" },
  { word: "touch", actor: "🦒", motion: "stand" },
  { word: "hold", actor: "🐿️", motion: "stand" },
  { word: "carry", actor: "🐘", motion: "walk" },
  { word: "pull", actor: "🐶", motion: "run" },
  { word: "push", actor: "🦏", motion: "walk" },
  { word: "open", actor: "🐻", motion: "stand" },
  { word: "wag", actor: "🐶", motion: "wag" },
  /* ---------------- 3. 身体部位 19 个 ---------------- */
  "head", "eye", "nose", "mouth",
  "tail", "ear", "trunk", "wing",
  "paw", "fur", "horn", "claw",
  "feather", "beak", "neck", "tooth",
  "tongue", "leg", "belly",
];
const ANIMAL_ZOO_WORDS = resolveWordRefs(ANIMAL_ZOO_WORD_REFS);

/* 素材键（assetKey）：普通词默认用单词本身作为素材键，题目与图片解耦 */

/* ------------------------------------------------ 素材挂载 *//* ============================================================
   素材挂载：食物、宿主动物、图片与对话线索
   - 数据层只补字段，渲染层按字段取图，缺图时回退 emoji
   - 食物图直接以单词命名放在 images/words/food/，动作图统一命名为 animal-xx.webp 放在 images/words/action/
   ============================================================ */
/* 食性 + 栖息地双维度分类：
   diet    → carnivore(肉食) / herbivore(草食) / omnivore(杂食)
   habitat → land(陆地) / sea(海洋)
   FOOD_CLASS 用于 buildFeedAnimal 的干扰项安全过滤（植物 vs 动物类） */
const ANIMAL_FOOD_CLASS = {
  /* —— 陆地食物 land —— */
  meat:       { cls: "animal", habitat: "land" },
  bamboo:     { cls: "plant",  habitat: "land" },
  banana:     { cls: "plant",  habitat: "land" },
  carrot:     { cls: "plant",  habitat: "land" },
  grass:      { cls: "plant",  habitat: "land" },
  nut:        { cls: "plant",  habitat: "land" },
  bone:       { cls: "animal", habitat: "land" },
  apple:      { cls: "plant",  habitat: "land" },
  worm:       { cls: "animal", habitat: "land" },
  leaves:     { cls: "plant",  habitat: "land" },
  corn:       { cls: "plant",  habitat: "land" },
  milk:       { cls: "animal", habitat: "land" },
  honey:      { cls: "plant",  habitat: "land" }, /* 蜂蜜由花蜜酿成，草食动物也能吃 */
  watermelon: { cls: "plant",  habitat: "land" },
  /* —— 海洋食物 sea —— fish 同时是海/海鸟食物，归 sea 以减少跨域干扰 */
  fish:       { cls: "animal", habitat: "sea"  },
  seaweed:    { cls: "plant",  habitat: "sea"  },
  kelp:       { cls: "plant",  habitat: "sea"  }, /* 海带：大型海藻，海鸟/海龟/海獭常吃 */
  shellfish:  { cls: "animal", habitat: "sea"  },
  plankton:   { cls: "animal", habitat: "sea"  },
};

/* 海洋动物集合：喂食题干扰项从海洋食物池挑，避免出现 banana/grass 跨域乱配 */
const MARINE_ANIMALS = new Set([
  "penguin", "shark", "seal", "whale",
  "dolphin", "octopus", "crab", "starfish", "jellyfish",
  "shrimp", "squid", "clownfish", "turtle",
]);

const ANIMAL_FOODS = {
  meat:   { id: "meat",   en: "meat",   zh: "肉",     phon: "/miːt/",            emoji: "🥩", img: "images/words/food/meat.webp", ...ANIMAL_FOOD_CLASS.meat },
  bamboo: { id: "bamboo", en: "bamboo", zh: "竹子",   phon: "/bæmˈbuː/",         emoji: "🎋", img: "images/words/food/bamboo.webp", ...ANIMAL_FOOD_CLASS.bamboo },
  banana: { id: "banana", en: "banana", zh: "香蕉",   phon: "/bəˈnɑːnə/",        emoji: "🍌", img: "images/words/food/banana.webp", ...ANIMAL_FOOD_CLASS.banana },
  carrot: { id: "carrot", en: "carrot", zh: "胡萝卜", phon: "/ˈkærət/",          emoji: "🥕", img: "images/words/food/carrot.webp", ...ANIMAL_FOOD_CLASS.carrot },
  grass:  { id: "grass",  en: "grass",  zh: "青草",   phon: "/ɡrɑːs/",           emoji: "🌿", img: "images/words/food/grass.webp", ...ANIMAL_FOOD_CLASS.grass },
  fish:   { id: "fish",   en: "fish",   zh: "鱼",     phon: "/fɪʃ/",             emoji: "🐟", img: "images/words/food/fish.webp", ...ANIMAL_FOOD_CLASS.fish },
  nut:    { id: "nut",    en: "nut",    zh: "坚果",   phon: "/nʌt/",             emoji: "🌰", img: "images/words/food/nut.webp", ...ANIMAL_FOOD_CLASS.nut },
  bone:   { id: "bone",   en: "bone",   zh: "骨头",   phon: "/bəʊn/",            emoji: "🦴", img: "images/words/food/bone.webp", ...ANIMAL_FOOD_CLASS.bone },
  apple:  { id: "apple",  en: "apple",  zh: "苹果",   phon: "/ˈæpəl/",           emoji: "🍎", img: "images/words/food/apple.webp", ...ANIMAL_FOOD_CLASS.apple },
  worm:   { id: "worm",   en: "worm",   zh: "虫子",   phon: "/wɜːm/",            emoji: "🪱", img: "images/words/food/worm.webp", ...ANIMAL_FOOD_CLASS.worm },
  leaves: { id: "leaves", en: "leaves", zh: "树叶",   phon: "/liːvz/",           emoji: "🍃", img: "images/words/food/leaves.webp", ...ANIMAL_FOOD_CLASS.leaves },
  corn:   { id: "corn",   en: "corn",   zh: "玉米",   phon: "/kɔːn/",            emoji: "🌽", img: "images/words/food/corn.webp", ...ANIMAL_FOOD_CLASS.corn },
  milk:   { id: "milk",   en: "milk",   zh: "牛奶",   phon: "/mɪlk/",            emoji: "🥛", img: "images/words/food/milk.webp", ...ANIMAL_FOOD_CLASS.milk },
  honey:  { id: "honey",  en: "honey",  zh: "蜂蜜",   phon: "/ˈhʌni/",           emoji: "🍯", img: "images/words/food/honey.webp", ...ANIMAL_FOOD_CLASS.honey },
  watermelon: { id: "watermelon", en: "watermelon", zh: "西瓜", phon: "/ˈwɔːtəmelən/", emoji: "🍉", img: "images/words/food/watermelon.webp", ...ANIMAL_FOOD_CLASS.watermelon },
  /* 海洋食物：暂无插画，直接用 emoji 呈现 */
  seaweed: { id: "seaweed", en: "seaweed", zh: "海藻", phon: "/ˈsiːwiːd/", emoji: "🌿", img: "", ...ANIMAL_FOOD_CLASS.seaweed },
  kelp: { id: "kelp", en: "kelp", zh: "海带", phon: "/kelp/", emoji: "🌊", img: "", ...ANIMAL_FOOD_CLASS.kelp },
  shellfish: { id: "shellfish", en: "shellfish", zh: "贝类", phon: "/ˈʃelfɪʃ/", emoji: "🐚", img: "", ...ANIMAL_FOOD_CLASS.shellfish },
  plankton: { id: "plankton", en: "plankton", zh: "浮游生物", phon: "/ˈplæŋktən/", emoji: "🫧", img: "", ...ANIMAL_FOOD_CLASS.plankton },
};

/* 57 种动物各自爱吃的食物 */
const ANIMAL_FEED_MAP = {
  lion: "meat", tiger: "meat", wolf: "meat", fox: "meat", crocodile: "meat",
  cheetah: "meat", eagle: "meat", owl: "meat", snake: "meat",
  zebra: "grass", deer: "grass", cow: "grass", sheep: "grass", goat: "grass", kangaroo: "grass", rhino: "grass", camel: "grass",
  giraffe: "leaves", elephant: "leaves", hippo: "watermelon", koala: "leaves", sloth: "leaves",
  chicken: "corn", bird: "worm", peacock: "worm", crow: "worm", lizard: "worm",
  monkey: "banana", gorilla: "banana", baboon: "banana",
  rabbit: "carrot", horse: "carrot", donkey: "carrot",
  bear: "honey", cat: "milk", duck: "fish",
  squirrel: "nut", parrot: "nut",
  pig: "apple",
  panda: "bamboo",
  dog: "bone",
  flamingo: "fish", raccoon: "fish",
  /* 海洋动物：按常识配置 + 栖息地约束——
     海龟吃草/海藻、水母/小虾滤食浮游生物、鲸滤食浮游生物、
     鲨鱼/海豹/海豚吃小鱼、章鱼/海星吃贝类、螃蟹吃鱼和藻类 */
  turtle: "seaweed",
  penguin: "fish", shark: "fish", seal: "fish",
  whale: "plankton", dolphin: "fish", octopus: "shellfish", crab: "fish",
  starfish: "shellfish", jellyfish: "plankton", shrimp: "plankton", squid: "fish",
  clownfish: "plankton", otter: "fish",
};

/* 食性分类：喂食题只从“明显不吃”的食物类别里取干扰项，
   避免 2 选项时把常识上也能吃的食物判成错误答案 */
const ANIMAL_DIET = {
  lion: "carnivore", tiger: "carnivore", wolf: "carnivore", fox: "carnivore",
  cheetah: "carnivore", eagle: "carnivore", owl: "carnivore", snake: "carnivore",
  crocodile: "carnivore", cat: "carnivore", dog: "carnivore",
  flamingo: "carnivore", lizard: "carnivore",
  /* 杂食动物在启蒙模式下不出喂食题，因为可吃食物太杂，容易误判 */
  bear: "omnivore", pig: "omnivore", chicken: "omnivore", duck: "omnivore", crow: "omnivore",
  raccoon: "omnivore",
  /* —— 海洋动物食性 ——
     滤食型（鲸/水母/小虾/小丑鱼）和海龟归 herbivore → 干扰项从 sea animal 池挑
     顶级捕食者（鲨/海豹/企鹅/海豚/章鱼/海星/螃蟹/乌贼/海獭）归 carnivore → 干扰项从 sea plant 池挑 */
  whale: "herbivore", jellyfish: "herbivore", shrimp: "herbivore", clownfish: "herbivore",
  turtle: "herbivore",
  shark: "carnivore", seal: "carnivore", penguin: "carnivore", dolphin: "carnivore",
  octopus: "carnivore", crab: "carnivore", starfish: "carnivore", squid: "carnivore", otter: "carnivore",
};

/* 19 个身体部位 → 宿主动物（用于词条插画与素材映射） */
const PART_OWNER_WORD_MAP = {
  head: "lion", eye: "owl", nose: "dog", mouth: "hippo",
  tail: "monkey", ear: "rabbit", trunk: "elephant", wing: "duck",
  paw: "bear", fur: "panda", horn: "rhino",
  claw: "tiger", feather: "peacock", beak: "parrot",
  neck: "giraffe", tooth: "crocodile", tongue: "snake", leg: "zebra", belly: "cat",
};

ANIMAL_ZOO_WORDS.forEach((w) => {
  if (w.category === "verb") {
    /* 动作题统一用 animal-{word} 素材键，便于后续主题动作词汇区分 */
    if (!w.assetKey || w.assetKey.indexOf("animal-") !== 0) w.assetKey = `animal-${w.word}`;
    w.img = w.img || `images/words/action/${w.assetKey}.webp`;
  } else if (w.category === "part") {
    w.ownerWord = PART_OWNER_WORD_MAP[w.word] || "lion";
    w.assetKey = w.assetKey || w.ownerWord;
    w.img = w.img || `images/words/animal/${w.ownerWord}.webp`;
  } else {
    w.assetKey = w.assetKey || w.word;
    w.img = w.img || `images/words/animal/${w.word}.webp`;
    const foodId = ANIMAL_FEED_MAP[w.word] || "apple";
    w.foodId = foodId;
    w.food = ANIMAL_FOODS[foodId];
    w.eats = foodId;
    w.diet = ANIMAL_DIET[w.word] || "herbivore";
    w.habitat = MARINE_ANIMALS.has(w.word) ? "sea" : "land";
    w.dialogueClue = w.example
      ? w.example.replace(new RegExp(`\\b${w.word}\\b`, "i"), "___")
      : "";
  }
});

/* 50 个关卡：level 1~50，坐标取自路线图标定 */
const ANIMAL_ZOO_LEVELS = ANIMAL_ZOO_NODES.map((node, i) => ({
  level: i + 1,
  x: node.x,
  y: node.y,
}));

/* 全场景词池：50 关共用同一套 125 词题库（仅神奇动物园） */

const ANIMAL_SCENES = [
  {
    id: "zoo",
    name: "神奇动物园",
    emoji: "🦁",
    /* 点击入口卡进入路线抽屉（由 frame/route-sheet.js 通用渲染） */
    mapImage: "./images/background/animal-zoo-map.webp",
    mapRatio: "1505/1045",
    sheetClass: "zoo-route-sheet",
    mapClass: "zoo",
    levelCount: ANIMAL_ZOO_LEVELS.length,
    levels: ANIMAL_ZOO_LEVELS,
    words: ANIMAL_ZOO_WORDS,
  },
];

defineDinoTheme({
  id: "animal",
  name: "动物乐园",
  islandName: "神奇动物园",
  chip: "动物单词",
  emoji: "🦁",
  cover: "./images/background/theme-animal.webp",
  wordImgDir: "animal",
  useWrongBank: true,
  dialog: { q: "What animal is this?", a: "It's a {word}." },
  scenes: ANIMAL_SCENES,
});
