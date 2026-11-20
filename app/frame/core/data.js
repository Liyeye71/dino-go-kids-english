/* ============================================================
   静态配置：进化阶段、收藏道具、背景、图鉴与默认存档
   ============================================================ */

const STAGES = [
  { key: "egg",   name: "恐龙蛋",       phase: "孵化期", min: 0,    vocab: "basic",   rarity: 3, height: "18 cm", weight: "0.4 kg", skill: "等待破壳", desc: "一颗奶油色的恐龙蛋，壳上画着彩色小斑点。每天认真学习，它就会听见你的声音。" },
  { key: "baby",  name: "幼龙",         phase: "幼年期", min: 240,  vocab: "basic",   rarity: 3, height: "0.6 m", weight: "8 kg", skill: "奶声奶气", desc: "刚破壳的小家伙，橙色皮肤上挂着彩色斑点，走起路来摇摇晃晃。最喜欢和你一起读单词。" },
  { key: "teen",  name: "少年龙",       phase: "成长期", min: 900,  vocab: "basic",   rarity: 4, height: "1.2 m", weight: "36 kg", skill: "记忆力 +10%", desc: "嘴巴张得大大的，露出小牙齿，橙色鳞片越擦越亮。它已经能记住好多水果单词了。" },
  { key: "adult", name: "成年龙",       phase: "成熟期", min: 2100, vocab: "advance", rarity: 4, height: "2.1 m", weight: "120 kg", skill: "元气满满", desc: "叫声越来越有威势，橙色的身体配上粗描边，像从蜡笔画里走出来。现在是森林里最可靠的伙伴。" },
  { key: "super", name: "霸王龙",       phase: "完全体", min: 4200, vocab: "advance", rarity: 5, height: "3.6 m", weight: "1.2 t", skill: "王者气势", desc: "背上升起一排气派的彩色骨板，身边像有火焰在跳动。它记得你陪它走过的每一次闯关。" },
  { key: "ultra", name: "超级霸王龙",   phase: "究极体", min: 6000, vocab: "pro",     rarity: 5, height: "5.0 m", weight: "2.4 t", skill: "星辉护佑", desc: "骨板燃起金红色的光，威风凛凛地站在山岗上。只有最坚持的小探险家才能遇见它。" },
];

const BACKGROUNDS = [
  { id: "jungle", name: "丛林瀑布", sub: "默认场景",     price: 0,   cls: "jungle" },
  { id: "sunset", name: "静谧湖畔", sub: "背景 · 稀有",   price: 10,  cls: "sunset" },
  { id: "night",  name: "珊瑚海湾", sub: "背景 · 史诗",   price: 18,  cls: "night" },
];

/* 超级霸王龙（究极体）的四种机甲形态：解锁 ultra 后可在图鉴里自由切换 */
const ULTRA_SKINS = [
  { id: 1, name: "彩虹能量", sub: "尾巴彩虹能量环" },
  { id: 2, name: "护目炮塔", sub: "护目镜 + 背部炮塔" },
  { id: 3, name: "霓虹疾行", sub: "霓虹电路 + 喷射推进" },
  { id: 4, name: "红眼重装", sub: "重装机械臂甲" },
];

const DEFAULT_STATE = {
  v: 8,
  name: "毛肚",
  stars: 0,
  growth: 0,
  stage: "egg",
  theme: "animal",
  /* 多场景主题的当前场景（动物乐园：zoo / ocean），各场景进度独立 */
  scene: "zoo",
  progress: {},
  log: {},
  words: 0,
  threeStars: 0,
  tasks: { level: false },
  bg: "jungle",
  bgOwned: ["jungle"],
  ultraSkin: 1,
  dex: ["egg"],
  sound: true,
};
