/* ============================================================
   DinoGo · 恐龙英语 — 主题注册与默认玩法
   每个主题可独立覆盖关卡题序和题型实现
   ============================================================ */
(function () {
  "use strict";

  function defaultLevelGames() {
    return {
      1: ["pic", "listen", "pic", "listen", "pic"],
      2: ["pic", "listen", "pic", "listen", "pic"],
      3: ["pic", "listen", "match", "pic", "listen"],
      4: ["listen", "pic", "match", "listen", "pic"],
      5: ["pic", "match", "repeat", "listen", "pic"],
      6: ["listen", "repeat", "match", "pic", "listen"],
      7: ["pic", "match", "repeat", "dialog", "listen"],
      8: ["listen", "dialog", "match", "repeat", "pic"],
      9: ["dialog", "match", "listen", "dialog", "repeat"],
      10: ["dialog", "listen", "dialog", "match", "repeat"],
    };
  }

  function buildOptions(task, pool, count) {
    task.options = shuffle([
      task.word,
      ...shuffle(pool.filter((x) => x.word !== task.word)).slice(0, count - 1).map((x) => x.word),
    ]);
  }

  /* 看图识词：平面插画风场景底图（纯内联 SVG，离线可用） */
  const PIC_SCENE = `<svg class="pic-scene" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 52 Q64 20 132 44 T266 42 T400 30 L400 120 L0 120 Z" fill="#9AD97F"/>
    <path d="M0 74 Q88 52 178 70 T400 62 L400 120 L0 120 Z" fill="#72C166"/>
    <g fill="#57AF57" opacity=".85">
      <path d="M36 92q5-18 10 0 5-18 10 0z"/>
      <path d="M96 104q4-14 8 0 4-14 8 0z"/>
      <path d="M298 96q5-17 10 0 5-17 10 0z"/>
      <path d="M352 110q4-13 8 0 4-13 8 0z"/>
    </g>
  </svg>`;

  /* 单词主图：优先取 images/words/{word}.png，缺图时回退 emoji */
  function wordHeroArt(w) {
    const emoji = w.emoji || wordGlyph(w.word);
    return `<img class="pic-img" src="images/words/${w.word}.png" alt="" loading="eager" decoding="async"
      onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
      <span class="pic-emoji" style="display:none">${emoji}</span>`;
  }

  function defaultGames() {
    return {
      pic: {
        label: "看图选词",
        title: "看图，选出正确的单词",
        pageClass: "pic-page",
        build(task, pool) {
          buildOptions(task, pool, 4);
        },
        render({ q, choiceButton, options }) {
          return {
            body: `<div class="pic-art">
                ${PIC_SCENE}
                <span class="pic-sun" aria-hidden="true"></span>
                <span class="pic-cloud pc1" aria-hidden="true"></span>
                <span class="pic-cloud pc2" aria-hidden="true"></span>
                <div class="pic-bubble">What is it?</div>
                <div class="pic-hero">${wordHeroArt(q)}</div>
                ${listenPill()}
              </div>
              <div class="options pic-options">${options(q.options)}</div>`,
            btn: choiceButton("选一个答案"),
          };
        },
      },
      listen: {
        label: "听音选图",
        title: "听单词，选出正确的图片",
        autoSpeak: true,
        build(task, pool) {
          buildOptions(task, pool, 4);
        },
        render({ q, quiz, optionClass, choiceButton, letters, artOf }) {
          const revealed = quiz.revealed;
          return {
            body: `<div class="quiz-art listen-art">
                <div class="blob"></div>
                <div class="art-tag">LISTEN &amp; CHOOSE</div>
                <button class="big-speaker" data-action="speak-word" data-word="${q.word}" aria-label="再听一遍">${I.speaker(46)}</button>
                <div class="listen-tip">听发音，选出对应的图片</div>
                ${listenPill()}
              </div>
              <div class="options pic-grid">${q.options.map((opt, i) => {
                const cls = optionClass(opt, "option pic");
                const label = revealed && opt === q.word ? `<b class="pic-word">${opt}</b>` : "";
                return `<button class="${cls}" data-action="select" data-word="${opt}">
                  <span class="key">${letters[i]}</span><span class="pic">${artOf(opt)()}</span>${label}
                </button>`;
              }).join("")}</div>`,
            btn: choiceButton("选一张图片"),
          };
        },
      },
      match: {
        label: "单词连线",
        title: "把单词和图片连起来",
        build(task, pool) {
          const trio = shuffle(pool).slice(0, 3);
          task.pairs = trio.map((x) => ({ word: x.word, art: x.art }));
          task.words = shuffle(trio.map((x) => x.word));
          task.arts = shuffle(trio.map((x) => ({ word: x.word, art: x.art })));
        },
        render({ q, quiz }) {
          const solved = quiz.matched;
          const wordCol = q.words.map((w) => `<button class="mcard word ${solved.includes(w) ? "ok" : ""} ${quiz.pickWord === w ? "sel" : ""}"
              data-action="match-word" data-word="${w}">${w}</button>`).join("");
          const artCol = q.arts.map((p) => `<button class="mcard art ${solved.includes(p.word) ? "ok" : ""}"
              data-action="match-art" data-word="${p.word}">${p.art()}</button>`).join("");
          return {
            body: `<div class="match-grid"><div class="match-col">${wordCol}</div><div class="match-col">${artCol}</div></div>
              <div class="listen-row">${listenPill()}</div>`,
            btn: quiz.revealed ? quizNextButton() : `<button class="btn" disabled>连对 3 组即可过关 ${I.arrow(18)}</button>`,
          };
        },
        onPickWord(word) {
          if (!quiz || quiz.revealed) return;
          quiz.pickWord = word;
          sfx("tap");
          render();
        },
        onPickArt(word) {
          if (!quiz || quiz.revealed || !quiz.pickWord) return;
          const q = quiz.order[quiz.index];
          /* 构造错题库 wordId（match 题型的 q.pairs 里没有 wrongWordId） */
          const _sceneId = (state && state.scene) || "";
          const _makeWid = (w) => window.WrongBank ? WrongBank.makeId(_sceneId, w) : null;
          if (word === quiz.pickWord) {
            quiz.matched.push(word);
            quiz.pickWord = null;
            sfx("correct");
            /* 🦁 动物园：配对成功 → 尝试清除错题库 */
            if (window.isZooScene && isZooScene() && _makeWid(word)) WrongBank.recordCorrect(_makeWid(word));
            if (quiz.matched.length >= q.pairs.length) {
              quiz.revealed = true;
              quiz.choiceCorrect = quiz.matchWrong === 0;
              if (quiz.choiceCorrect) {
                quiz.correct++;
                quiz.combo++;
                q.pairs.forEach((p) => quiz.words.push(p.word));
              } else {
                quiz.combo = 0;
              }
              render();
              return;
            }
          } else {
            quiz.matchWrong++;
            const wrongPair = quiz.pickWord; /* 被选错的那个单词 */
            quiz.pickWord = null;
            quiz.hearts = Math.max(0, quiz.hearts - 1);
            quiz.combo = 0;
            sfx("wrong");
            /* 🦁 动物园：配对失败 → 自动收录错题库 */
            if (window.isZooScene && isZooScene() && _makeWid(wrongPair)) WrongBank.recordWrong(_makeWid(wrongPair));
            if (quiz.hearts <= 0) {
              quiz.revealed = true;
              quiz.choiceCorrect = false;
              render();
              return;
            }
            toast("这两张不匹配，再试一次");
          }
          render();
        },
      },
      repeat: {
        label: "跟读练习",
        title: "听发音，大声跟读这个单词",
        autoSpeak: true,
        render({ q, quiz, total }) {
          const revealed = quiz.revealed;
          return {
            body: `<div class="quiz-art">
                <div class="blob"></div>
                <div class="art-tag">READ IT OUT</div>
                ${q.art()}
                <button class="listen" data-action="speak-word" data-word="${q.word}">${I.speaker(14)} 点我听发音</button>
              </div>
              <div class="repeat-word"><b>${q.word}</b><span>${q.phon || ""}</span><i>大声读三遍，点下面完成</i></div>`,
            btn: revealed ? `<button class="btn" data-action="next">${quiz.index >= total - 1 || quiz.hearts <= 0 ? "查看成绩" : "下一题"} ${I.arrow(18)}</button>`
              : `<button class="btn" data-action="repeat-done">我读好了 ${I.arrow(18)}</button>`,
          };
        },
        onDone() {
          if (!quiz || quiz.revealed) return;
          const q = quiz.order[quiz.index];
          quiz.revealed = true;
          quiz.choiceCorrect = true;
          quiz.correct++;
          quiz.combo++;
          quiz.words.push(q.word);
          sfx("correct");
          /* 🦁 动物园：跟读完成 → 尝试清除错题库 */
          if (window.isZooScene && isZooScene()) {
            const wid = q.wrongWordId || (WrongBank ? WrongBank.makeId(state.scene, q.word) : null);
            if (wid) WrongBank.recordCorrect(wid);
          }
          render();
        },
      },
      dialog: {
        label: "情景对话",
        title: "读对话，选出正确的单词",
        build(task, pool) {
          buildOptions(task, pool, 3);
        },
        render({ q, quiz, choiceButton, options }) {
          const revealed = quiz.revealed;
          return {
            body: `<div class="dialog-card">
                <div class="dlg"><span class="who">A</span><p>${q.dlgQ}</p><span class="dlg-pic">${q.art()}</span></div>
                <div class="dlg me"><span class="who">B</span><p>${q.dlgA.replace("{word}", `<b class="blank">${revealed ? q.word : "＿＿"}</b>`)}</p></div>
              </div>
              <div class="listen-row">${listenPill()}</div>
              <div class="options one-col">${options(q.options)}</div>`,
            btn: choiceButton("选一个单词"),
          };
        },
      },
      /* 🎨 颜色涂鸦板（Week 3 新增，需要 Canvas 2D） */
      color_paint: {
        label: "颜色涂鸦板",
        title: "用英文说的颜色来画画！",
        build(task, pool) {
          /* 不需要 buildOptions，涂色是非选择型交互 */
          task.colors = ["red", "yellow", "blue", "green", "pink", "black", "orange", "white", "brown", "grey", "golden", "purple"];
          task.colorHex = {
            red: "#E53935", yellow: "#FDD835", blue: "#1E88E5", green: "#43A047",
            pink: "#EC407A", black: "#212121", orange: "#FB8C00", white: "#FAFAFA",
            brown: "#8D6E63", grey: "#9E9E9E", golden: "#F2B33D", purple: "#8E44AD",
          };
        },
        render({ q, quiz }) {
          const revealed = quiz.revealed;
          const colorButtons = q.colors.map((c) => {
            const hex = q.colorHex[c];
            return `<button type="button" class="cp-swatch" data-action="cp-color" data-color="${c}"
              style="background:${hex}${c === "white" ? ";box-shadow:inset 0 0 0 0.09375rem #ccc" : ""}"
              aria-label="选择 ${c} 色"></button>`;
          }).join("");
          const body = `
            <div class="cp-wrap">
              <div class="cp-instruction">
                <span class="cp-word">${q.word}</span>
                <small>用 <b>${q.zh}</b> 的颜色画一画吧！</small>
              </div>
              <canvas class="cp-canvas" width="480" height="320" aria-label="涂鸦画布"></canvas>
              <div class="cp-palette">${colorButtons}</div>
              <div class="cp-actions">
                <button type="button" class="cp-clear" data-action="cp-clear">🧽 清空</button>
                <button type="button" class="cp-size" data-action="cp-size">🖌️ 切换粗细</button>
              </div>
            </div>`;
          const btn = revealed
            ? quizNextButton()
            : `<button type="button" class="btn cp-done" data-action="cp-done">完成涂色 ${I.arrow(16)}</button>`;
          return { body, btn };
        },
      },
      /* 🧩 词汇拼图 Word Puzzle（Week 5 新增，纯 DOM 拖拽排序） */
      word_puzzle: {
        label: "词汇拼图",
        title: "拖动字母块，拼出单词！",
        build(task) {
          /* 打乱字母顺序（至少位移 2 个以上） */
          const letters = task.word.toUpperCase().split("");
          let shuffled;
          do { shuffled = [...letters].sort(() => Math.random() - 0.5); }
          while (shuffled.join("") === letters.join("") && letters.length > 1);
          task.puzzleLetters = shuffled.map((ch, i) => ({ ch, id: i, placed: false }));
          task.puzzleSlots = letters.map((ch, i) => ({ id: i, filled: null }));
        },
        render({ q, quiz }) {
          const revealed = quiz.revealed;
          const slotsHtml = q.puzzleSlots.map((s) => {
            const letter = s.filled ? q.puzzleLetters.find((l) => l.id === s.filled) : null;
            return `<div class="pz-slot ${letter ? "filled" : ""}" data-slot="${s.id}">${letter ? letter.ch : ""}</div>`;
          }).join("");
          const lettersHtml = q.puzzleLetters.map((l) => {
            const used = q.puzzleSlots.some((s) => s.filled === l.id);
            return `<button type="button" class="pz-letter ${used ? "used" : ""}" data-action="pz-letter" data-letter="${l.id}" ${used ? "disabled" : ""}>${l.ch}</button>`;
          }).join("");
          const allFilled = q.puzzleSlots.every((s) => s.filled !== null);
          const body = `
            <div class="pz-wrap">
              <div class="pz-hint">
                <div class="pz-art">${q.emoji || "❓"}</div>
                <small>${q.zh}</small>
              </div>
              <div class="pz-slots">${slotsHtml}</div>
              <div class="pz-letters">${lettersHtml}</div>
              ${!revealed ? `<button type="button" class="btn pz-check" data-action="pz-check" ${allFilled ? "" : "disabled"}>检查答案 ${I.arrow(16)}</button>` : ""}
              ${revealed ? `<div class="pz-answer">正确答案：<b>${q.word.toUpperCase()}</b>（${q.zh}）</div>` : ""}
            </div>`;
          return { body, btn: revealed ? quizNextButton() : "" };
        },
      },
      /* 🍎 动物喂食 Feed the Animal（Week 5 新增，emoji 拖拽 + 选卡） */
      feed_animal: {
        label: "动物喂食",
        title: "给动物喂它爱吃的食物！",
        build(task, pool) {
          /* 从 pool 里找 3 种不同的食物 emoji 作为选项 */
          const foodPool = pool.filter((w) => w.category === "food" || ["banana", "meat", "grass", "honey", "bamboo"].includes(w.word));
          const foods = foodPool.slice(0, 3).map((w) => ({ word: w.word, emoji: w.emoji || "🍎" }));
          if (foods.length < 3) {
            /* 兜底：用不重复的基础食物补足到 3 种 */
            const seen = new Set(foods.map((f) => f.word));
            const fallback = [
              { word: "meat", emoji: "🥩" },
              { word: "banana", emoji: "🍌" },
              { word: "bamboo", emoji: "🎋" },
            ];
            for (const f of fallback) {
              if (foods.length >= 3) break;
              if (seen.has(f.word)) continue;
              foods.push(f);
              seen.add(f.word);
            }
          }
          /* 打乱；正确答案优先用词条自带的 eats，其次用动物常量映射 */
          task.foods = foods.sort(() => Math.random() - 0.5);
          const match = { panda: "bamboo", lion: "meat", tiger: "meat", bear: "honey", monkey: "banana", koala: "eucalyptus", rabbit: "carrot" };
          const preferred = task.eats || match[task.word];
          task.correctFood = preferred && task.foods.some((f) => f.word === preferred)
            ? preferred
            : task.foods[0].word;
        },
        render({ q, quiz }) {
          const revealed = quiz.revealed;
          const foods = q.foods.map((f) =>
            `<button type="button" class="fd-food ${revealed && f.word === q.correctFood ? "correct" : ""} ${quiz.selected === f.word ? "selected" : ""}"
              data-action="fd-pick" data-food="${f.word}">${f.emoji || "🍎"}</button>`
          ).join("");
          const body = `
            <div class="fd-wrap">
              <div class="fd-animal">
                <div class="fd-art">${q.emoji || "🐾"}</div>
                <div class="fd-name">${q.word.toUpperCase()}</div>
                <small>${q.zh} 爱吃什么？</small>
              </div>
              <div class="fd-foods">${foods}</div>
              ${revealed && !quiz.choiceCorrect ? `<div class="fd-answer">正确答案是：${q.correctFood.toUpperCase()}</div>` : ""}
            </div>`;
          const btn = revealed ? quizNextButton() : `<button type="button" class="btn" data-action="fd-check" ${quiz.selected ? "" : "disabled"}>喂给它 ${I.arrow(16)}</button>`;
          return { body, btn };
        },
      },
      /* 🌑 影子猜猜乐 Shadow Match（Week 5 新增，等 shadow 图资源，先用 emoji 轮廓占位） */
      shadow_match: {
        label: "影子猜猜乐",
        title: "这是谁的影子？",
        build(task, pool) {
          /* 2 个干扰项，从 pool 里同 category 选 */
          const distractors = pool.filter((w) => w.word !== task.word && (!task.category || !w.category || w.category === task.category))
            .sort(() => Math.random() - 0.5).slice(0, 2);
          task.options = shuffle([task, ...distractors]);
        },
        render({ q, quiz }) {
          const revealed = quiz.revealed;
          const optsHtml = q.options.map((w) => {
            const isCorrect = w.word === q.word;
            const picked = quiz.selected === w.word;
            return `<button type="button" class="sh-card ${revealed && isCorrect ? "correct" : ""} ${picked && !revealed ? "picked" : ""} ${picked && revealed && !isCorrect ? "wrong" : ""}"
              data-action="sh-pick" data-word="${w.word}">
              <div class="sh-art" style="filter:brightness(0) opacity(.75)">${w.emoji || "❓"}</div>
              <span>${w.zh || w.word}</span>
            </button>`;
          }).join("");
          const body = `
            <div class="sh-wrap">
              <p class="sh-title">影子里藏着什么动物？</p>
              <div class="sh-options">${optsHtml}</div>
              ${revealed && !quiz.choiceCorrect ? `<div class="sh-answer">正确答案：${q.word.toUpperCase()} (${q.zh})</div>` : ""}
            </div>`;
          return { body, btn: revealed ? quizNextButton() : "" };
        },
      },
      /* 🏃 动作模仿秀 Action Time（Week 5 新增，verb 词选卡） */
      action_time: {
        label: "动作模仿秀",
        title: "学一学这个动作！",
        build(task, pool) {
          /* target 是 verb 词；如果不是 verb，降级用现有 word */
          const verbPool = pool.filter((w) => w.category === "verb");
          if (verbPool.length > 0 && task.category !== "verb") {
            /* 随机换一个 verb 作为 target */
            const replacement = verbPool[Math.floor(Math.random() * verbPool.length)];
            task.word = replacement.word;
            task.zh = replacement.zh;
            task.emoji = replacement.emoji;
            task.phon = replacement.phon;
          }
          /* 生成 3 个选项（2 个干扰 verb + 1 个正确） */
          const distractors = verbPool.filter((w) => w.word !== task.word)
            .sort(() => Math.random() - 0.5).slice(0, 2);
          task.options = shuffle([task, ...distractors]);
        },
        render({ q, quiz }) {
          const revealed = quiz.revealed;
          const optsHtml = q.options.map((w) => {
            const isCorrect = w.word === q.word;
            const picked = quiz.selected === w.word;
            return `<button type="button" class="at-card ${revealed && isCorrect ? "correct" : ""} ${picked && !revealed ? "picked" : ""} ${picked && revealed && !isCorrect ? "wrong" : ""}"
              data-action="at-pick" data-word="${w.word}">
              <div class="at-art">${w.emoji || "🏃"}</div>
              <span>${w.word.toUpperCase()}</span>
              <small>${w.zh}</small>
            </button>`;
          }).join("");
          const body = `
            <div class="at-wrap">
              <p class="at-title">哪个动作对应这个单词？<br><b>${q.word.toUpperCase()}</b> <small>${q.phon || ""}</small></p>
              <div class="at-options">${optsHtml}</div>
              ${revealed && !quiz.choiceCorrect ? `<div class="at-answer">正确答案：${q.word.toUpperCase()} (${q.zh})</div>` : ""}
            </div>`;
          return { body, btn: revealed ? quizNextButton() : "" };
        },
      },
    };
  }

  window.defineDinoTheme = function defineDinoTheme(config) {
    const levelGames = defaultLevelGames();
    Object.keys(config.levelGames || {}).forEach((level) => {
      const plan = config.levelGames[level];
      levelGames[level] = Array.isArray(plan) ? [...plan] : plan;
    });

    const games = defaultGames();
    Object.keys(config.games || {}).forEach((type) => {
      games[type] = { ...games[type], ...config.games[type] };
    });

    const theme = {
      isTheme: true,
      words: [],
      ...config,
      levelGames,
      games,
    };
    window.DINO_WORD_SETS = window.DINO_WORD_SETS || [];
    window.DINO_WORD_SETS.push(theme);
    return theme;
  };
})();
