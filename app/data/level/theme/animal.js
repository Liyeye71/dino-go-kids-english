/* ============================================================
   DinoGo · 恐龙英语 — 动物乐园：词库、地图与玩法配置
   words 为空，按 type 从 pos 文件中自动匹配对应单词
   ============================================================ */
defineDinoTheme({
  id: "animal",
  name: "动物乐园",
  chip: "动物单词",
  unit: "Unit 2 · 动物乐园",
  emoji: "🦁",
  type: "animal",
  dialog: { q: "What animal is this?", a: "It's a {word}." },
  words: [],
  map: {
    title: "请选择探险场景",
    intro: "点击场景图片，沿着对应路线收集单词星星。",
    sceneSelector: true,
    bg: "#FBF3E3",
    border: "#E7DAC3",
    render() {
      const scenes = [
        {
          id: "zoo",
          name: "陆地动物园",
          image: "./images/background/animal-zoo.webp",
          description: "狮子、长颈鹿与草原伙伴",
        },
        {
          id: "ocean",
          name: "海洋公园",
          image: "./images/background/animal-ocean.webp",
          description: "鲸鱼、海龟与海洋伙伴",
        },
      ];
      return `<div class="animal-scene-list">${scenes.map((scene) => `
        <button type="button" class="animal-scene-card" data-action="open-animal-scene" data-scene="${scene.id}" aria-label="查看${scene.name}关卡路线">
          <span class="animal-scene-image"><img src="${scene.image}" alt="${scene.name}完整场景"></span>
          <span class="animal-scene-info">
            <strong>${scene.name}</strong>
            <small>${scene.description}</small>
            <small>完整场景，点击查看路线</small>
          </span>
          <span class="animal-scene-go">查看路线 <b>›</b></span>
        </button>`).join("")}</div>`;
    },
  },
});
