/* ============================================================
   DinoGo · 恐龙英语 — 动物乐园：主题词表、地图与玩法配置
   神奇动物园：50 关，共用一张连续路线图
   题库共 127 词（仅神奇动物园）：核心动物名词 59 + 动作动词 49 + 身体部位 19
   每 5 关为一阶段：第 1~4 关按「保底基础题 + 互动进阶题」组卷，第 5 关为阶段考核关
   闯关只使用当前场景的 words，并按 Tier 1/2/3 分阶解锁（L1~15 / L16~35 / L36~50）
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
   动物乐园题库（127 词，仅神奇动物园）
   1. 核心动物名词 59 个（含 16 个海洋/极地动物）：看图选词 / 听音戳泡泡 / 动物喂食
   2. 动作动词 49 个：动作猜猜（中央动态动物 + 纯文字选项）
   3. 身体部位 19 个：身体部位词汇与宿主动物插画
   ============================================================ */
/* 词表：引用全局词库（data/game/library.js），不再自带词表
   - 字符串引用 = 整条取库；动词对象 = 库条目 + 地图动画参数（actor/motion）
   - 同一个词可被其他主题（school 等）同时引用；下方 normalize 仍按原逻辑
     派生 assetKey/img/food/dialogueClue 等动物园场景字段 */
const ANIMAL_ZOO_WORD_REFS = [
  /* ---------------- 1. 核心动物名词 59 个 ---------------- */
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
  /* 海洋与极地动物 15 个（turtle 已包含在上方名单，合计 16 种）
     fish 只作为食物词（ANIMAL_FOODS），不再作为动物园名词出题 */
  "penguin", "shark", "seal", "whale",
  "dolphin", "octopus", "crab", "starfish", "jellyfish",
  "shrimp", "squid", "clownfish",
  "polar bear", "sea lion", "walrus",
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
/* 食物分类：所有参与喂食题的食物均有手绘 .webp 插画，不再混入 emoji 海洋食物 */
const ANIMAL_FOOD_CLASS = {
  meat:       { cls: "animal", habitat: "land" },
  bone:       { cls: "animal", habitat: "land" },
  fish:       { cls: "animal", habitat: "land" },
  worm:       { cls: "animal", habitat: "land" },
  bamboo:     { cls: "plant",  habitat: "land" },
  banana:     { cls: "plant",  habitat: "land" },
  carrot:     { cls: "plant",  habitat: "land" },
  grass:      { cls: "plant",  habitat: "land" },
  leaves:     { cls: "plant",  habitat: "land" },
  nut:        { cls: "plant",  habitat: "land" },
  apple:      { cls: "plant",  habitat: "land" },
  corn:       { cls: "plant",  habitat: "land" },
  honey:      { cls: "plant",  habitat: "land" },
  watermelon: { cls: "plant",  habitat: "land" },
};

/* 海洋/极地动物集合（用于词库属性标记） */
const MARINE_ANIMALS = new Set([
  "penguin", "shark", "seal", "whale",
  "dolphin", "octopus", "crab", "starfish", "jellyfish",
  "shrimp", "squid", "clownfish", "turtle",
  "polar bear", "sea lion", "walrus",
]);

const ANIMAL_FOODS = {
  meat:       { id: "meat",       en: "meat",       zh: "肉",     phon: "/miːt/",        emoji: "🥩", img: "images/words/food/meat.webp",       ...ANIMAL_FOOD_CLASS.meat },
  bone:       { id: "bone",       en: "bone",       zh: "骨头",   phon: "/bəʊn/",        emoji: "🦴", img: "images/words/food/bone.webp",       ...ANIMAL_FOOD_CLASS.bone },
  fish:       { id: "fish",       en: "fish",       zh: "鱼",     phon: "/fɪʃ/",         emoji: "🐟", img: "images/words/food/fish.webp",       ...ANIMAL_FOOD_CLASS.fish },
  worm:       { id: "worm",       en: "worm",       zh: "虫子",   phon: "/wɜːm/",        emoji: "🪱", img: "images/words/food/worm.webp",       ...ANIMAL_FOOD_CLASS.worm },
  bamboo:     { id: "bamboo",     en: "bamboo",     zh: "竹子",   phon: "/bæmˈbuː/",     emoji: "🎋", img: "images/words/food/bamboo.webp",     ...ANIMAL_FOOD_CLASS.bamboo },
  banana:     { id: "banana",     en: "banana",     zh: "香蕉",   phon: "/bəˈnɑːnə/",    emoji: "🍌", img: "images/words/food/banana.webp",     ...ANIMAL_FOOD_CLASS.banana },
  carrot:     { id: "carrot",     en: "carrot",     zh: "胡萝卜", phon: "/ˈkærət/",      emoji: "🥕", img: "images/words/food/carrot.webp",     ...ANIMAL_FOOD_CLASS.carrot },
  grass:      { id: "grass",      en: "grass",      zh: "青草",   phon: "/ɡrɑːs/",       emoji: "🌿", img: "images/words/food/grass.webp",      ...ANIMAL_FOOD_CLASS.grass },
  leaves:     { id: "leaves",     en: "leaves",     zh: "树叶",   phon: "/liːvz/",       emoji: "🍃", img: "images/words/food/leaves.webp",     ...ANIMAL_FOOD_CLASS.leaves },
  nut:        { id: "nut",        en: "nut",        zh: "坚果",   phon: "/nʌt/",         emoji: "🌰", img: "images/words/food/nut.webp",        ...ANIMAL_FOOD_CLASS.nut },
  apple:      { id: "apple",      en: "apple",      zh: "苹果",   phon: "/ˈæpəl/",       emoji: "🍎", img: "images/words/food/apple.webp",      ...ANIMAL_FOOD_CLASS.apple },
  corn:       { id: "corn",       en: "corn",       zh: "玉米",   phon: "/kɔːn/",        emoji: "🌽", img: "images/words/food/corn.webp",       ...ANIMAL_FOOD_CLASS.corn },
  honey:      { id: "honey",      en: "honey",      zh: "蜂蜜",   phon: "/ˈhʌni/",       emoji: "🍯", img: "images/words/food/honey.webp",      ...ANIMAL_FOOD_CLASS.honey },
  watermelon: { id: "watermelon", en: "watermelon", zh: "西瓜",   phon: "/ˈwɔːtəmelən/", emoji: "🍉", img: "images/words/food/watermelon.webp", ...ANIMAL_FOOD_CLASS.watermelon },
};

/* 仅针对 29 种常见、孩子一眼能答出的动物出喂食题；
   冷门或食性容易引起歧义的动物（如狒狒/树懒/水母/海星等）不配置 food，自动不进喂食题 */
const ANIMAL_FEED_MAP = {
  /* —— 常见草食 / 果蔬类（17 种） —— */
  panda: "bamboo",
  monkey: "banana",
  rabbit: "carrot",
  horse: "carrot",
  cow: "grass",
  sheep: "grass",
  goat: "grass",
  zebra: "grass",
  giraffe: "leaves",
  elephant: "leaves",
  koala: "leaves",
  deer: "leaves",
  hippo: "watermelon",
  squirrel: "nut",
  pig: "apple",
  chicken: "corn",
  bear: "honey",
  /* —— 常见肉食 / 鱼虫类（12 种） —— */
  lion: "meat",
  tiger: "meat",
  wolf: "meat",
  crocodile: "meat",
  dog: "bone",
  cat: "fish",
  bird: "worm",
  penguin: "fish",
  shark: "fish",
  dolphin: "fish",
  seal: "fish",
  "polar bear": "fish",
};

/* 食性分类：喂食题只从“明显不吃”的食物类别里取干扰项
   - carnivore → 干扰项取 plant 类（竹子/香蕉/胡萝卜/草/树叶等）
   - herbivore → 干扰项取 animal 类（肉/骨头/鱼，自动排除 worm） */
const ANIMAL_DIET = {
  lion: "carnivore", tiger: "carnivore", wolf: "carnivore", crocodile: "carnivore",
  dog: "carnivore", cat: "carnivore", bird: "carnivore",
  penguin: "carnivore", shark: "carnivore", dolphin: "carnivore",
  seal: "carnivore", "polar bear": "carnivore",
  /* 熊既爱蜂蜜也吃鱼，归 omnivore：启蒙 2 选项不出喂食题，避免误判 */
  bear: "omnivore",
};

/* 难度分层：L1~15 高频启蒙词（Tier 1）→ L16~35 进阶词（Tier 2）→ L36~50 全词池（Tier 3） */
const ANIMAL_TIER1_WORDS = new Set([
  /* 常见陆地动物 */
  "cat", "dog", "panda", "lion", "tiger", "monkey", "rabbit", "bear",
  "elephant", "giraffe", "zebra", "cow", "pig", "sheep", "duck", "chicken",
  "bird", "horse", "turtle", "deer", "goat", "fox",
  /* 高频直观动作 */
  "eat", "sleep", "jump", "run", "swim", "walk", "drink", "fly",
  "sing", "dance", "sit", "stand", "climb", "roar", "bark", "cry",
  "smile", "laugh", "wave", "hug", "play",
]);
const ANIMAL_TIER2_WORDS = new Set([
  /* 进阶陆地与热门海洋动物 */
  "hippo", "crocodile", "kangaroo", "wolf", "snake", "parrot", "peacock",
  "donkey", "camel", "squirrel", "gorilla", "rhino", "cheetah", "owl",
  "eagle", "crow", "koala", "lizard", "raccoon", "sloth", "flamingo",
  "penguin", "shark", "whale", "dolphin", "octopus", "crab", "starfish",
  "seal", "polar bear", "sea lion",
  /* 中阶动作 */
  "bite", "lick", "dig", "splash", "chase", "catch", "hide", "nap",
  "sniff", "wag", "pull", "push", "carry", "hold", "touch", "open",
]);

/* 19 个身体部位 → 宿主动物（用于词条插画与素材映射） */
const PART_OWNER_WORD_MAP = {
  head: "lion", eye: "owl", nose: "dog", mouth: "hippo",
  tail: "monkey", ear: "rabbit", trunk: "elephant", wing: "duck",
  paw: "bear", fur: "panda", horn: "rhino",
  claw: "tiger", feather: "peacock", beak: "parrot",
  neck: "giraffe", tooth: "crocodile", tongue: "snake", leg: "zebra", belly: "cat",
};

/* 新补全的透明底 PNG 素材集合：直接指向 .png，避免先请求 .webp 404 再回退 */
const ANIMAL_PNG_WORDS = new Set(["shrimp", "squid"]);
const ACTION_PNG_WORDS = new Set(["jump", "roar", "splash", "chase", "walk", "stand", "open"]);

ANIMAL_ZOO_WORDS.forEach((w) => {
  w.tier = ANIMAL_TIER1_WORDS.has(w.word) ? 1 : (ANIMAL_TIER2_WORDS.has(w.word) ? 2 : 3);
  if (w.category === "verb") {
    /* 动作题统一用 animal-{word} 素材键，便于后续主题动作词汇区分 */
    if (!w.assetKey || w.assetKey.indexOf("animal-") !== 0) w.assetKey = `animal-${w.word}`;
    const ext = ACTION_PNG_WORDS.has(w.word) ? "png" : "webp";
    w.img = w.img || `images/words/action/${w.assetKey}.${ext}`;
  } else if (w.category === "part") {
    w.ownerWord = PART_OWNER_WORD_MAP[w.word] || "lion";
    w.assetKey = w.assetKey || w.ownerWord;
    w.img = w.img || `images/words/animal/${w.ownerWord}.webp`;
  } else {
    w.assetKey = w.assetKey || w.word;
    const ext = ANIMAL_PNG_WORDS.has(w.word) ? "png" : "webp";
    w.img = w.img || `images/words/animal/${w.word.replace(/ /g, "-")}.${ext}`;
    /* 仅常见动物挂载食物，冷门动物不配置 food → 自动不参与喂食题和“爱吃什么”情景对话 */
    const foodId = ANIMAL_FEED_MAP[w.word] || "";
    if (foodId && ANIMAL_FOODS[foodId]) {
      w.foodId = foodId;
      w.food = ANIMAL_FOODS[foodId];
      w.eats = foodId;
      w.diet = ANIMAL_DIET[w.word] || "herbivore";
    }
    w.habitat = MARINE_ANIMALS.has(w.word) ? "sea" : "land";
    w.dialogueClue = w.example
      ? w.example.replace(new RegExp(`\\b${w.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"), "___")
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
