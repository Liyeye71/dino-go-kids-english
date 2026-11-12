/* ============================================================
   静态配置：进化阶段、商店道具、背景、图鉴与默认存档
   ============================================================ */

const STAGES = [
  { key: "egg",   name: "恐龙蛋",       phase: "孵化期", min: 0,    rarity: 3, height: "18 cm", weight: "0.4 kg", skill: "等待破壳", desc: "一颗安静的恐龙蛋，表面有薄荷色斑点。每天认真学习，它就会听见你的声音。" },
  { key: "baby",  name: "幼龙",         phase: "幼年期", min: 240,  rarity: 3, height: "0.6 m", weight: "8 kg", skill: "奶声奶气", desc: "刚破壳的小家伙，走起路来摇摇晃晃。最喜欢和你一起读单词。" },
  { key: "teen",  name: "少年龙",       phase: "成长期", min: 900,  rarity: 4, height: "1.2 m", weight: "36 kg", skill: "记忆力 +10%", desc: "背上长出了第一排小刺，眼睛亮亮的。它已经能记住好多水果单词了。" },
  { key: "adult", name: "成年龙",       phase: "成熟期", min: 2100, rarity: 4, height: "2.1 m", weight: "120 kg", skill: "星星加成 +10%", desc: "鼻尖长出了小角，步伐变得稳健。现在是森林里最可靠的伙伴。" },
  { key: "super", name: "霸王龙",       phase: "完全体", min: 4200, rarity: 5, height: "3.6 m", weight: "1.2 t", skill: "王者气势", desc: "金色的背刺在阳光下闪闪发亮。它记得你陪它走过的每一次闯关。" },
  { key: "ultra", name: "超级霸王龙",   phase: "究极体", min: 6000, rarity: 5, height: "5.0 m", weight: "2.4 t", skill: "星辉护佑", desc: "传说中的究极形态，身上环绕着星辉。只有最坚持的小探险家才能遇见它。" },
];

const ITEMS = [
  { id: "hat",     slot: "head", name: "探险帽",     sub: "进化奖励 · 稀有", price: 0,   unlockStage: "adult", thumb: "h1", art: itemHat },
  { id: "glasses", slot: "face", name: "酷酷墨镜",   sub: "配饰 · 稀有",     price: 80,  thumb: "h2", art: itemGlasses },
  { id: "wings",   slot: "back", name: "蝴蝶翅膀",   sub: "翅膀 · 史诗",     price: 150, thumb: "h3", badge: "NEW", art: itemWings },
  { id: "crown",   slot: "head", name: "黄金小皇冠", sub: "头饰 · 传说",     price: 200, thumb: "h4", art: itemCrown },
];

const BACKGROUNDS = [
  { id: "jungle", name: "晨雾森林", sub: "默认场景",     price: 0,   cls: "jungle" },
  { id: "sunset", name: "落日山谷", sub: "背景 · 稀有",   price: 120, cls: "sunset" },
  { id: "night",  name: "星空营地", sub: "背景 · 史诗",   price: 200, cls: "night" },
];

const DEX = STAGES.map((s) => ({ ...s }));

const DEFAULT_STATE = {
  v: 3,
  name: "毛肚",
  stars: 0,
  growth: 0,
  stage: "egg",
  theme: "fruit",
  progress: {},
  log: {},
  words: 0,
  minutes: 0,
  threeStars: 0,
  tasks: { level: false },
  owned: [],
  equipped: { head: null, face: null, back: null },
  bg: "jungle",
  bgOwned: ["jungle"],
  dex: ["egg"],
  sound: true,
  starBonus: 0,
};
