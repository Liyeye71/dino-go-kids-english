/* ============================================================
   静态配置：进化阶段、收藏道具、背景、图鉴与默认存档
   ============================================================ */

const STAGES = [
  { key: "egg",   name: "恐龙蛋",       phase: "孵化期", min: 0,    rarity: 3, height: "18 cm", weight: "0.4 kg", skill: "等待破壳", desc: "一颗奶油色的恐龙蛋，壳上画着彩色小斑点。每天认真学习，它就会听见你的声音。" },
  { key: "baby",  name: "幼龙",         phase: "幼年期", min: 60,   rarity: 3, height: "0.6 m", weight: "8 kg", skill: "奶声奶气", desc: "刚破壳的小家伙，橙色皮肤上挂着彩色斑点，走起路来摇摇晃晃。最喜欢和你一起读单词。" },
  { key: "teen",  name: "少年龙",       phase: "成长期", min: 250,  rarity: 4, height: "1.2 m", weight: "36 kg", skill: "记忆力 +10%", desc: "嘴巴张得大大的，露出小牙齿，橙色鳞片越擦越亮。它已经能记住好多水果单词了。" },
  { key: "adult", name: "成年龙",       phase: "成熟期", min: 600,  rarity: 4, height: "2.1 m", weight: "120 kg", skill: "元气满满", desc: "叫声越来越有威势，橙色的身体配上粗描边，像从蜡笔画里走出来。现在是森林里最可靠的伙伴。" },
  { key: "super", name: "霸王龙",       phase: "完全体", min: 1200, rarity: 5, height: "3.6 m", weight: "1.2 t", skill: "王者气势", desc: "背上升起一排气派的彩色骨板，身边像有火焰在跳动。它记得你陪它走过的每一次闯关。" },
  { key: "ultra", name: "超级霸王龙",   phase: "究极体", min: 2000, rarity: 5, height: "5.0 m", weight: "2.4 t", skill: "星辉护佑", desc: "骨板燃起金红色的光，威风凛凛地站在山岗上。只有最坚持的小探险家才能遇见它。" },
];

/* 自动进化止步于完全体；成长值达到究极体额度后，改为在图鉴里用星星兑换 */
const EVOLVE_MAX_INDEX = STAGES.findIndex((s) => s.key === "super");
const ULTRA_MIN = STAGES.find((s) => s.key === "ultra").min;
const ULTRA_PRICE = 10;

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

/* 究极体图鉴：10 种机甲恐龙，解锁 ultra 后收录并可切换形象 */
const ULTRA_DINOS = [
  { id: 5,  name: "机甲剑龙",   sub: "青铜装甲 · 雷电骨板" },
  { id: 6,  name: "机甲腕龙",   sub: "太阳能帆板 · 长颈侦察" },
  { id: 7,  name: "冰晶三角龙", sub: "冰蓝能量罩 · 三重尖角" },
  { id: 8,  name: "苍穹翼龙",   sub: "霓虹电路 · 高空滑翔" },
  { id: 9,  name: "霓虹霸王龙", sub: "彩虹骨板 · 喷射尾环" },
  { id: 10, name: "疾风迅猛龙", sub: "光刃爪 · 极速突袭" },
  { id: 11, name: "磐石甲龙",   sub: "尾锤护盾 · 重装防御" },
  { id: 12, name: "音波副栉龙", sub: "声波头冠 · 音浪冲击" },
  { id: 13, name: "黄金三角龙", sub: "蒸汽齿轮 · 翡翠棱角" },
  { id: 14, name: "黑曜霸王龙", sub: "暗红装甲 · 聚能炮" },
];

const DEFAULT_STATE = {
  v: 10,
  name: "毛肚",
  stars: 0,
  /* 宝箱赠送的免费转盘机会，可累积并保留到下次 */
  spins: 0,
  /* 每日转盘次数限制：spinDay 记录当天日期键，spinCount 为当天已转次数 */
  spinDay: "",
  spinCount: 0,
  /* 每日随机挑战（全主题共享）：dailyDay 记录当天日期键，dailyCount 为当天已玩次数 */
  dailyDay: "",
  dailyCount: 0,
  /* 启蒙模式：开启后 2 选项 + 零挫败答题，屏蔽词汇拼图与情景对话 */
  enlighten: false,
  growth: 0,
  stage: "egg",
  theme: "animal",
  /* 闯关单元：basic 开放；advance 锁定待后续迭代，旧存档缺省回落 basic */
  unit: "basic",
  /* 多场景主题的当前场景（动物乐园：zoo / ocean），各场景进度独立 */
  scene: "zoo",
  progress: {},
  log: {},
  /* 已解锁单词：存档键为 "主题:场景:单词"，词汇页只展示这里列出的词 */
  unlocked: [],
  words: 0,
  threeStars: 0,
  tasks: { level: false },
  bg: "jungle",
  bgOwned: ["jungle"],
  ultraSkin: 1,
  /* 已兑换的究极体形态（1 = 超级霸王龙，5–14 = 究极体图鉴） */
  ultraOwned: [],
  dex: ["egg"],
  sound: true,
  /* 英文读音风格：kids 童趣朗读（默认，更慢更亮）/ standard 标准朗读（教材发音） */
  voice: "kids",
};
