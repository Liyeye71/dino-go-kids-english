/* ============================================================
   DinoGo · 恐龙英语 — 动物乐园：主题词表、地图与玩法配置
   陆地动物园：10 个主题馆 × 5 关 = 50 关，共用一张连续路线图
   每馆 9~10 个词，覆盖 noun / verb / part / food / color 五类
   海洋公园暂保留静态预览
   闯关只使用当前场馆的 words，与词性词库完全独立
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
const ANIMAL_ZOO_VENUES = [
  {
    id: "lion",
    en: "Lion Savannah",
    zh: "狮子草原",
    icon: "🦁",
    words: [
      { word: "lion",    zh: "狮子",   phon: "/ˈlaɪən/", example: "The lion is the king.",        emoji: "🦁", category: "noun", animal: true, eats: "meat" },
      { word: "cub",     zh: "幼崽",   phon: "/kʌb/",    example: "The lion cub plays with its mother.", emoji: "🐾", category: "noun", animal: true, eats: "meat" },
      { word: "cheetah", zh: "猎豹",   phon: "/ˈtʃiːtə/", example: "The cheetah runs very fast.",  emoji: "🐆", category: "noun", animal: true, eats: "meat" },
      { word: "mane",    zh: "鬃毛",   phon: "/meɪn/",   example: "The lion has a big mane.",     emoji: "👑", category: "part" },
      { word: "paw",     zh: "爪子",   phon: "/pɔː/",    example: "The lion has a big paw.",      emoji: "🐾", category: "part" },
      { word: "roar",    zh: "吼叫",   phon: "/rɔː(r)/", example: "The lion can roar loudly.",    emoji: "🔊", category: "verb" },
      { word: "chase",   zh: "追逐",   phon: "/tʃeɪs/",  example: "Lions chase their food.",      emoji: "🏃", category: "verb" },
      { word: "meat",    zh: "肉",     phon: "/miːt/",   example: "The lion eats meat.",          emoji: "🥩", category: "food" },
      { word: "golden",  zh: "金色的", phon: "/ˈɡəʊldən/", example: "The lion has golden fur.",   emoji: "💛", category: "color" },
    ],
  },
  {
    id: "monkey",
    en: "Monkey Island",
    zh: "猴子岛",
    icon: "🐒",
    words: [
      { word: "monkey",    zh: "猴子",   phon: "/ˈmʌŋki/",   example: "The monkey climbs trees.",     emoji: "🐒", category: "noun", animal: true, eats: "banana" },
      { word: "gorilla",   zh: "大猩猩", phon: "/ɡəˈrɪlə/",  example: "The gorilla is very strong.",  emoji: "🦍", category: "noun", animal: true, eats: "banana" },
      { word: "orangutan", zh: "猩猩",   phon: "/ɔːˈræŋuːtæn/", example: "The orangutan lives in the jungle.", emoji: "🦧", category: "noun", animal: true, eats: "banana" },
      { word: "vine",      zh: "藤蔓",   phon: "/vaɪn/",     example: "Monkeys swing on the vine.",   emoji: "🌿", category: "noun" },
      { word: "tail",      zh: "尾巴",   phon: "/teɪl/",     example: "The monkey has a long tail.",  emoji: "🐒", category: "part" },
      { word: "climb",     zh: "爬",     phon: "/klaɪm/",    example: "Monkeys climb trees.",         emoji: "🧗", category: "verb" },
      { word: "swing",     zh: "荡",     phon: "/swɪŋ/",     example: "Monkeys swing from tree to tree.", emoji: "🎋", category: "verb" },
      { word: "banana",    zh: "香蕉",   phon: "/bəˈnɑːnə/", example: "Monkeys love bananas.",        emoji: "🍌", category: "food" },
      { word: "brown",     zh: "棕色",   phon: "/braʊn/",    example: "The monkey has brown fur.",    emoji: "🤎", category: "color" },
    ],
  },
  {
    id: "plains",
    en: "Giraffe & Zebra Plains",
    zh: "长颈鹿斑马平原",
    icon: "🦒",
    words: [
      { word: "giraffe",    zh: "长颈鹿", phon: "/dʒəˈrɑːf/", example: "The giraffe has a long neck.",  emoji: "🦒", category: "noun", animal: true, eats: "acacia" },
      { word: "zebra",      zh: "斑马",   phon: "/ˈzebrə/",   example: "The zebra has stripes.",        emoji: "🦓", category: "noun", animal: true, eats: "grass" },
      { word: "wildebeest", zh: "角马",   phon: "/ˈwɪldəbiːst/", example: "The wildebeest runs with the herd.", emoji: "🐂", category: "noun", animal: true, eats: "grass" },
      { word: "neck",       zh: "脖子",   phon: "/nek/",      example: "The giraffe has a long neck.",  emoji: "📏", category: "part" },
      { word: "stripe",     zh: "条纹",   phon: "/straɪp/",   example: "The zebra has black and white stripes.", emoji: "🦓", category: "part" },
      { word: "run",        zh: "跑",     phon: "/rʌn/",      example: "Zebras can run fast.",          emoji: "💨", category: "verb" },
      { word: "gallop",     zh: "疾驰",   phon: "/ˈɡæləp/",   example: "The zebra can gallop fast.",    emoji: "🐎", category: "verb" },
      { word: "grass",      zh: "草",     phon: "/ɡrɑːs/",    example: "Zebras eat grass.",             emoji: "🌿", category: "food" },
      { word: "acacia",     zh: "金合欢叶", phon: "/əˈkeɪʃə/", example: "The giraffe eats acacia leaves.", emoji: "🍃", category: "food" },
      { word: "yellow",     zh: "黄色",   phon: "/ˈjeləʊ/",   example: "The savanna is yellow in the sun.", emoji: "💛", category: "color" },
    ],
  },
  {
    id: "elephant",
    en: "Elephant Kingdom",
    zh: "大象王国",
    icon: "🐘",
    words: [
      { word: "elephant", zh: "大象", phon: "/ˈelɪfənt/", example: "The elephant has a long trunk.", emoji: "🐘", category: "noun", animal: true, eats: "peanut" },
      { word: "rhino",    zh: "犀牛", phon: "/ˈraɪnəʊ/",  example: "The rhino has a big horn.",      emoji: "🦏", category: "noun", animal: true, eats: "peanut" },
      { word: "calf",     zh: "幼象", phon: "/kɑːf/",     example: "The elephant calf stays near its mother.", emoji: "🐘", category: "noun", animal: true, eats: "peanut" },
      { word: "trunk",    zh: "象鼻", phon: "/trʌŋk/",    example: "The elephant uses its trunk.",   emoji: "🐘", category: "part" },
      { word: "horn",     zh: "角",   phon: "/hɔːn/",     example: "The rhino has a sharp horn.",    emoji: "🦏", category: "part" },
      { word: "tusk",     zh: "象牙", phon: "/tʌsk/",     example: "The elephant has two long tusks.", emoji: "🦷", category: "part" },
      { word: "stomp",    zh: "跺脚", phon: "/stɒmp/",    example: "The elephant stomps on the ground.", emoji: "🦶", category: "verb" },
      { word: "charge",   zh: "冲锋", phon: "/tʃɑːdʒ/",   example: "The rhino can charge fast.",     emoji: "💨", category: "verb" },
      { word: "peanut",   zh: "花生", phon: "/ˈpiːnʌt/",  example: "The elephant likes peanuts.",    emoji: "🥜", category: "food" },
      { word: "grey",     zh: "灰色", phon: "/ɡreɪ/",     example: "The elephant is grey.",          emoji: "⚪", category: "color" },
    ],
  },
  {
    id: "reptile",
    en: "Reptile Museum",
    zh: "爬行动物馆",
    icon: "🦎",
    words: [
      { word: "snake",     zh: "蛇",   phon: "/sneɪk/",      example: "The snake is long.",                 emoji: "🐍", category: "noun", animal: true, eats: "insect" },
      { word: "crocodile", zh: "鳄鱼", phon: "/ˈkrɒkədaɪl/", example: "The crocodile has sharp teeth.",     emoji: "🐊", category: "noun", animal: true, eats: "fish" },
      { word: "lizard",    zh: "蜥蜴", phon: "/ˈlɪzəd/",     example: "The lizard sits on a rock.",         emoji: "🦎", category: "noun", animal: true, eats: "insect" },
      { word: "turtle",    zh: "乌龟", phon: "/ˈtɜːtl/",     example: "The turtle has a hard shell.",       emoji: "🐢", category: "noun", animal: true, eats: "fish" },
      { word: "scales",    zh: "鳞片", phon: "/skeɪlz/",     example: "Snakes have scales.",                emoji: "🐍", category: "part" },
      { word: "crawl",     zh: "爬行", phon: "/krɔːl/",      example: "Snakes crawl on the ground.",        emoji: "🐍", category: "verb" },
      { word: "bite",      zh: "咬",   phon: "/baɪt/",       example: "The crocodile can bite hard.",       emoji: "🦷", category: "verb" },
      { word: "insect",    zh: "昆虫", phon: "/ˈɪnsekt/",    example: "Lizards eat insects.",               emoji: "🐜", category: "food" },
      { word: "fish",      zh: "鱼",   phon: "/fɪʃ/",        example: "The crocodile catches a fish.",      emoji: "🐟", category: "food" },
      { word: "green",     zh: "绿色", phon: "/ɡriːn/",      example: "The lizard is green.",               emoji: "💚", category: "color" },
    ],
  },
  {
    id: "tiger",
    en: "Tiger Temple",
    zh: "老虎庙",
    icon: "🐯",
    words: [
      { word: "tiger", zh: "老虎", phon: "/ˈtaɪɡə(r)/", example: "The tiger has stripes.",        emoji: "🐯", category: "noun", animal: true, eats: "deer" },
      { word: "wolf",  zh: "狼",   phon: "/wʊlf/",      example: "The wolf lives in the forest.", emoji: "🐺", category: "noun", animal: true, eats: "deer" },
      { word: "fox",   zh: "狐狸", phon: "/fɒks/",      example: "The fox is clever.",            emoji: "🦊", category: "noun", animal: true, eats: "deer" },
      { word: "fangs", zh: "獠牙", phon: "/fæŋz/",      example: "Tigers have sharp fangs.",      emoji: "🦷", category: "part" },
      { word: "claw",  zh: "爪子", phon: "/klɔː/",      example: "The tiger has sharp claws.",    emoji: "🐾", category: "part" },
      { word: "hunt",  zh: "捕猎", phon: "/hʌnt/",      example: "Tigers hunt at night.",         emoji: "🏹", category: "verb" },
      { word: "pounce", zh: "猛扑", phon: "/paʊns/",    example: "The tiger pounces on its food.", emoji: "🐯", category: "verb" },
      { word: "deer",  zh: "鹿",   phon: "/dɪə(r)/",    example: "The tiger hunts deer.",         emoji: "🦌", category: "food" },
      { word: "orange", zh: "橙色", phon: "/ˈɒrɪndʒ/",  example: "The tiger has orange fur.",     emoji: "🧡", category: "color" },
    ],
  },
  {
    id: "panda",
    en: "Panda Pavilion",
    zh: "熊猫馆",
    icon: "🐼",
    words: [
      { word: "panda",   zh: "熊猫",   phon: "/ˈpændə/",   example: "The panda eats bamboo.",    emoji: "🐼", category: "noun", animal: true, eats: "bamboo" },
      { word: "keeper",  zh: "饲养员", phon: "/ˈkiːpə(r)/", example: "The panda keeper feeds the panda.", emoji: "👩‍🌾", category: "noun" },
      { word: "zoo",     zh: "动物园", phon: "/zuː/",      example: "The panda lives in the zoo.", emoji: "🏞️", category: "noun" },
      { word: "fur",     zh: "毛",     phon: "/fɜː(r)/",   example: "The panda has soft fur.",   emoji: "🐼", category: "part" },
      { word: "eat",     zh: "吃",     phon: "/iːt/",      example: "The panda eats bamboo.",    emoji: "🍽️", category: "verb" },
      { word: "chew",    zh: "咀嚼",   phon: "/tʃuː/",     example: "Pandas chew bamboo slowly.", emoji: "🎋", category: "verb" },
      { word: "bamboo",  zh: "竹子",   phon: "/ˌbæmˈbuː/", example: "Pandas eat bamboo.",        emoji: "🎋", category: "food" },
      { word: "leaf",    zh: "叶子",   phon: "/liːf/",     example: "The panda eats bamboo leaves.", emoji: "🍃", category: "food" },
      { word: "black",   zh: "黑色",   phon: "/blæk/",     example: "The panda has black eyes.", emoji: "🖤", category: "color" },
      { word: "white",   zh: "白色",   phon: "/waɪt/",     example: "The panda has a white body.", emoji: "🤍", category: "color" },
    ],
  },
  {
    id: "kangaroo",
    en: "Kangaroo Creek",
    zh: "袋鼠溪",
    icon: "🦘",
    words: [
      { word: "kangaroo",   zh: "袋鼠",   phon: "/ˌkæŋɡəˈruː/", example: "The kangaroo has a pouch.",           emoji: "🦘", category: "noun", animal: true, eats: "hay" },
      { word: "koala",      zh: "考拉",   phon: "/kəʊˈɑːlə/",   example: "The koala sleeps all day.",           emoji: "🐨", category: "noun", animal: true, eats: "eucalyptus" },
      { word: "joey",       zh: "小袋鼠", phon: "/ˈdʒəʊi/",     example: "The joey stays in the pouch.",        emoji: "🦘", category: "noun", animal: true, eats: "hay" },
      { word: "pouch",      zh: "育儿袋", phon: "/paʊtʃ/",      example: "The baby kangaroo is in the pouch.",  emoji: "🦘", category: "part" },
      { word: "ear",        zh: "耳朵",   phon: "/ɪə(r)/",      example: "The koala has fluffy ears.",          emoji: "👂", category: "part" },
      { word: "sleep",      zh: "睡觉",   phon: "/sliːp/",      example: "The koala likes to sleep.",           emoji: "😴", category: "verb" },
      { word: "hop",        zh: "蹦跳",   phon: "/hɒp/",        example: "Kangaroos hop across the grass.",     emoji: "🦘", category: "verb" },
      { word: "hay",        zh: "干草",   phon: "/heɪ/",        example: "Kangaroos eat hay.",                  emoji: "🌾", category: "food" },
      { word: "eucalyptus", zh: "桉树叶", phon: "/ˌjuːkəˈlɪptəs/", example: "Koalas eat eucalyptus leaves.",     emoji: "🌿", category: "food" },
      { word: "red",        zh: "红色",   phon: "/red/",        example: "The kangaroo is red.",                emoji: "❤️", category: "color" },
    ],
  },
  {
    id: "bird",
    en: "Bird Aviary",
    zh: "鸟舍",
    icon: "🦜",
    words: [
      { word: "peacock",  zh: "孔雀",   phon: "/ˈpiːkɒk/",    example: "The peacock has beautiful feathers.", emoji: "🦚", category: "noun", animal: true, eats: "seed" },
      { word: "flamingo", zh: "火烈鸟", phon: "/fləˈmɪŋɡəʊ/", example: "The flamingo is pink.",               emoji: "🦩", category: "noun", animal: true, eats: "seed" },
      { word: "owl",      zh: "猫头鹰", phon: "/aʊl/",        example: "The owl comes out at night.",          emoji: "🦉", category: "noun", animal: true, eats: "seed" },
      { word: "wing",     zh: "翅膀",   phon: "/wɪŋ/",        example: "Birds have wings.",                    emoji: "🦅", category: "part" },
      { word: "feather",  zh: "羽毛",   phon: "/ˈfeðə(r)/",   example: "The peacock has colorful feathers.",   emoji: "🪶", category: "part" },
      { word: "fly",      zh: "飞",     phon: "/flaɪ/",       example: "Birds can fly.",                       emoji: "✈️", category: "verb" },
      { word: "sing",     zh: "唱歌",   phon: "/sɪŋ/",        example: "Birds sing in the morning.",           emoji: "🎵", category: "verb" },
      { word: "seed",     zh: "种子",   phon: "/siːd/",       example: "Birds eat seeds.",                     emoji: "🌰", category: "food" },
      { word: "pink",     zh: "粉色",   phon: "/pɪŋk/",       example: "The flamingo is pink.",                emoji: "🌸", category: "color" },
    ],
  },
  {
    id: "circus",
    en: "Animal Frolic Circus",
    zh: "动物欢乐马戏团",
    icon: "🎪",
    words: [
      { word: "bear",    zh: "熊",   phon: "/beə(r)/",    example: "The bear likes honey.",          emoji: "🐻", category: "noun", animal: true, eats: "honey" },
      { word: "rabbit",  zh: "兔子", phon: "/ˈræbɪt/",   example: "The rabbit has long ears.",      emoji: "🐰", category: "noun", animal: true, eats: "carrot" },
      { word: "clown",   zh: "小丑", phon: "/klaʊn/",    example: "The clown dances with the bear.", emoji: "🤡", category: "noun" },
      { word: "whisker", zh: "胡须", phon: "/ˈwɪskə(r)/", example: "The rabbit has long whiskers.", emoji: "🐰", category: "part" },
      { word: "jump",    zh: "跳",   phon: "/dʒʌmp/",    example: "Rabbits can jump high.",         emoji: "🦘", category: "verb" },
      { word: "dance",   zh: "跳舞", phon: "/dɑːns/",    example: "The bear can dance.",            emoji: "💃", category: "verb" },
      { word: "honey",   zh: "蜂蜜", phon: "/ˈhʌni/",    example: "Bears love honey.",              emoji: "🍯", category: "food" },
      { word: "carrot",  zh: "胡萝卜", phon: "/ˈkærət/", example: "The rabbit eats a carrot.",      emoji: "🥕", category: "food" },
      { word: "purple",  zh: "紫色", phon: "/ˈpɜːpl/",   example: "The circus tent has a purple flag.", emoji: "💜", category: "color" },
    ],
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

/* 全场景词池：由 10 个馆的词表自动合并 */
const ANIMAL_ZOO_WORDS = ANIMAL_ZOO_VENUES.flatMap((venue) => venue.words);

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
  {
    id: "ocean",
    name: "海洋公园",
    image: "./images/background/animal-ocean.webp",
    description: "鲸鱼、海龟与海洋伙伴",
    playable: false,
    words: [
      { word: "dolphin",    zh: "海豚",   phon: "/ˈdɒlfɪn/",      example: "The dolphin jumps out of the water.", emoji: "🐬" },
      { word: "whale",      zh: "鲸鱼",   phon: "/weɪl/",         example: "The whale is very big.",           emoji: "🐋" },
      { word: "shark",      zh: "鲨鱼",   phon: "/ʃɑːk/",         example: "The shark has sharp teeth.",       emoji: "🦈" },
      { word: "octopus",    zh: "章鱼",   phon: "/ˈɒktəpəs/",     example: "The octopus has eight arms.",      emoji: "🐙" },
      { word: "turtle",     zh: "海龟",   phon: "/ˈtɜːtl/",       example: "The turtle swims slowly.",         emoji: "🐢" },
      { word: "seal",       zh: "海豹",   phon: "/siːl/",         example: "The seal claps its flippers.",     emoji: "🦭" },
      { word: "crab",       zh: "螃蟹",   phon: "/kræb/",         example: "The crab walks sideways.",         emoji: "🦀" },
      { word: "lobster",    zh: "龙虾",   phon: "/ˈlɒbstə(r)/",   example: "The lobster has two big claws.",   emoji: "🦞" },
      { word: "jellyfish",  zh: "水母",   phon: "/ˈdʒelifɪʃ/",    example: "The jellyfish is soft.",           emoji: "🪼" },
      { word: "squid",      zh: "鱿鱼",   phon: "/skwɪd/",        example: "The squid can swim fast.",         emoji: "🦑" },
      { word: "shrimp",     zh: "虾",     phon: "/ʃrɪmp/",        example: "The shrimp is small.",             emoji: "🦐" },
      { word: "clownfish",  zh: "小丑鱼", phon: "/ˈklaʊnfɪʃ/",    example: "The clownfish is orange.",         emoji: "🐠" },
      { word: "pufferfish", zh: "河豚",   phon: "/ˈpʌfəfɪʃ/",     example: "The pufferfish blows up.",         emoji: "🐡" },
      { word: "oyster",     zh: "牡蛎",   phon: "/ˈɔɪstə(r)/",    example: "There is a pearl in the oyster.",  emoji: "🦪" },
      { word: "coral",      zh: "珊瑚",   phon: "/ˈkɒrəl/",       example: "The coral is colorful.",           emoji: "🪸" },
      { word: "shell",      zh: "贝壳",   phon: "/ʃel/",          example: "I found a shell on the beach.",    emoji: "🐚" },
      { word: "wave",       zh: "海浪",   phon: "/weɪv/",         example: "A big wave comes to the shore.",   emoji: "🌊" },
      { word: "penguin",    zh: "企鹅",   phon: "/ˈpeŋɡwɪn/",     example: "The penguin cannot fly.",          emoji: "🐧" },
      { word: "starfish",   zh: "海星",   phon: "/ˈstɑːfɪʃ/",     example: "The starfish has five arms." },
      { word: "seahorse",   zh: "海马",   phon: "/ˈsiːhɔːs/",     example: "The seahorse is very small." },
      { word: "seaweed",    zh: "海草",   phon: "/ˈsiːwiːd/",     example: "Seaweed grows in the sea." },
      { word: "pelican",    zh: "鹈鹕",   phon: "/ˈpelɪkən/",     example: "The pelican has a big beak." },
    ],
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
  const current = scene.levels[level - 1];
  const venue = current ? current.venue : scene.venues[scene.venues.length - 1];
  const activeVenue = current ? current.venueIndex : scene.venues.length - 1;

  const venueStrip = scene.venues.map((v, i) => {
    const st = i < activeVenue ? "done" : i === activeVenue ? "current" : "locked";
    return `<span class="zoo-venue-dot ${st}" title="${v.zh}"
      aria-label="${v.zh}${i === activeVenue ? "，当前主题馆" : i < activeVenue ? "，已通过" : "，未解锁"}">${v.icon}</span>`;
  }).join("");

  const nodes = scene.levels.map((s) => {
    const locked = s.level > level;
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
          <small>第 ${level} 关 · ${venue ? venue.zh : "全部通关"} · ★ ${stars} / ${total * 3}</small>
        </div>
        <button type="button" class="zoo-route-close" data-action="close-overlay" aria-label="关闭路线图">×</button>
      </div>
      <div class="zoo-venue-strip" aria-label="主题馆进度">${venueStrip}</div>
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
