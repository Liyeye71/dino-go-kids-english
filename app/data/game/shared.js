/* ============================================================
   DinoGo · 恐龙英语 — 主题注册与默认玩法
   每个主题可独立覆盖关卡题序和题型实现
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 关卡 / 场景上下文（供出题、结算、错题库共用） ---------------- */
  /* 判断当前是否为动物园场景（启用动态出题引擎） */
  function isZooScene() {
    return state.theme === "animal" && state.scene === "zoo";
  }

  /* 当前动物园场景对象 */
  function zooScene() {
    return (currentTheme().scenes || []).find((s) => s.id === (state.scene || "zoo")) || null;
  }

  /* 每馆第 5 关为馆内 BOSS，最后一关为总 BOSS */
  function isAnimalBossLevel(level) {
    return isZooScene() && Number(level) % LEVELS_PER_VENUE === 0;
  }
  function isAnimalFinalBoss(level) {
    const scene = zooScene();
    return isZooScene() && !!scene && Number(level) === scene.levelCount;
  }

  window.isZooScene = isZooScene;
  window.zooScene = zooScene;
  window.isAnimalBossLevel = isAnimalBossLevel;
  window.isAnimalFinalBoss = isAnimalFinalBoss;

  /* 阶段门槛：每 5 关为一阶段，阶段内第 5 关需前 4 关累计 ≥8 星 */
  const STAGE_SIZE = 5;
  const STAGE_GATE_STARS = 8;
  function stageStarsBefore(level) {
    const L = Number(level) || 1;
    const start = Math.floor((L - 1) / STAGE_SIZE) * STAGE_SIZE + 1;
    const stars = themeProgress().stars || {};
    let sum = 0;
    for (let i = start; i < L; i++) sum += Number(stars[i]) || 0;
    return sum;
  }
  function canEnterLevel(level) {
    const L = Number(level) || 1;
    if (!isZooScene()) return true;
    if (L % STAGE_SIZE !== 0) return true;
    return stageStarsBefore(L) >= STAGE_GATE_STARS;
  }
  window.STAGE_SIZE = STAGE_SIZE;
  window.STAGE_GATE_STARS = STAGE_GATE_STARS;
  window.stageStarsBefore = stageStarsBefore;
  window.canEnterLevel = canEnterLevel;


  function defaultLevelGames() {
    return {
      1: ["pic", "listen", "pic", "listen", "pic"],
      2: ["pic", "listen", "feed_animal", "pic", "listen"],
      3: ["pic", "listen", "match", "feed_animal", "listen"],
      4: ["listen", "pic", "match", "word_puzzle", "pic"],
      5: ["pic", "match", "word_puzzle", "listen", "pic"],
      6: ["listen", "feed_animal", "match", "pic", "listen"],
      7: ["pic", "match", "word_puzzle", "dialog", "listen"],
      8: ["listen", "dialog", "match", "feed_animal", "pic"],
      9: ["dialog", "match", "listen", "dialog", "word_puzzle"],
      10: ["dialog", "listen", "word_puzzle", "match", "feed_animal"],
    };
  }

  function buildOptions(task, pool, count) {
    /* 干扰项优先取同类词（名词配名词、动词配动词），避免选项跨类干扰 */
    const sameCat = pool.filter((x) => x.word !== task.word && x.category && x.category === task.category);
    const source = sameCat.length >= count - 1 ? sameCat : pool.filter((x) => x.word !== task.word);
    task.options = shuffle([
      task.word,
      ...shuffle(source).slice(0, count - 1).map((x) => x.word),
    ]);
  }

  /* 单词主图：优先 images/words/animal/{word}.webp，其次 images/words/{word}.png，缺图时回退 emoji */
  window.wordArtFallback = function (img) {
    if (!img.dataset.fallback) {
      img.dataset.fallback = "png";
      img.src = img.src.replace("/animal/", "/").replace(/\.webp$/, ".png");
      return;
    }
    img.style.display = "none";
    img.nextElementSibling.style.display = "grid";
  };
  function wordHeroArt(w) {
    const emoji = w.emoji || wordGlyph(w.word);
    return `<img class="pic-img" src="images/words/animal/${w.word}.webp" alt="" loading="eager" decoding="async"
      onerror="wordArtFallback(this)">
      <span class="pic-emoji" style="display:none">${emoji}</span>`;
  }

  function defaultGames() {
    return {
      pic: {
        label: "看图选词",
        title: "看图，选出正确的单词",
        pageClass: "pic-page",
        build(task, pool) {
          buildOptions(task, pool, 3);
        },
        render({ q, choiceButton, options }) {
          return {
            body: `<div class="ref-pic-wrap">
                <div class="ref-picture-frame">
                  <span class="ref-picture-tape" aria-hidden="true"></span>
                  <div class="ref-picture-art">${wordHeroArt(q)}</div>
                  ${listenPill()}
                </div>
                <div class="options ref-pic-options">${options(q.options)}</div>
              </div>`,
            btn: choiceButton("选一个答案"),
          };
        },
      },
      listen: {
        label: "听音选图",
        title: "听单词，选出正确的图片",
        autoSpeak: true,
        build(task, pool) {
          buildOptions(task, pool, 3);
        },
        render({ q, quiz, artOf }) {
          const revealed = quiz.revealed;
          const selected = quiz.selected;
          const cards = q.options.map((opt) => {
            const isCorrect = revealed && opt === q.word;
            const isWrong = revealed && opt === selected && opt !== q.word;
            const isSel = !revealed && selected === opt;
            const cls = ["ref-listen-card"]
              .concat(isCorrect ? ["ok"] : [])
              .concat(isWrong ? ["wrong"] : [])
              .concat(isSel ? ["sel"] : [])
              .join(" ");
            return `<button class="${cls}" data-action="select" data-word="${opt}" aria-label="选择 ${opt}">
              <span class="ref-listen-card-art">${artOf(opt)()}</span>
              ${revealed ? `<span class="ref-listen-card-word${isCorrect ? " correct" : ""}${isWrong ? " wrong" : ""}">${opt}</span>` : ""}
              ${isCorrect ? `<i class="ref-listen-mark">✓</i>` : ""}
              ${isWrong ? `<i class="ref-listen-mark bad">✕</i>` : ""}
            </button>`;
          }).join("");
          return {
            body: `<div class="ref-listen-wrap">
                <button class="ref-listen-speaker" data-action="speak-word" data-word="${q.word}" aria-label="再听一遍">
                  ${QuizUiArt.speaker()}<span>点我，再听一遍</span>
                </button>
                <div class="ref-listen-grid">${cards}</div>
              </div>`,
            btn: quiz.revealed ? quizNextButton() : "",
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
          const solved = new Set(quiz.matched || []);
          const selected = quiz.pickWord;
          const leftCol = q.arts.map((p) => {
            const isDone = solved.has(p.word);
            const isSel = selected === p.word && !isDone;
            return `<div class="ref-match-row${isDone ? " done" : ""}${isSel ? " sel" : ""}" data-match-row data-word="${p.word}" data-match-side="art">
              <div class="ref-match-art-card">${p.art()}</div>
              <button class="ref-match-dot" data-match-dot data-match-side="art" data-word="${p.word}" aria-label="选择 ${p.word}">${isDone ? "<i class='ok-check'>✓</i>" : ""}</button>
            </div>`;
          }).join("");
          const rightCol = q.words.map((w) => {
            const isDone = solved.has(w);
            const isSel = selected === w && !isDone;
            return `<div class="ref-match-row${isDone ? " done" : ""}${isSel ? " sel" : ""}" data-match-row data-word="${w}" data-match-side="word">
              <button class="ref-match-dot" data-match-dot data-match-side="word" data-word="${w}" aria-label="选择 ${w}">${isDone ? "<i class='ok-check'>✓</i>" : ""}</button>
              <div class="ref-match-word-card">${w}</div>
            </div>`;
          }).join("");
          return {
            body: `<div class="ref-match-area" data-match-area>
                <svg class="ref-match-svg" aria-hidden="true"></svg>
                <div class="ref-match-col ref-match-col-left">${leftCol}</div>
                <div class="ref-match-col ref-match-col-right">${rightCol}</div>
              </div>
              <div class="listen-row">${listenPill()}</div>`,
            btn: quiz.revealed ? quizNextButton() : `<button class="btn" disabled>连对 3 组即可过关 ${I.arrow(18)}</button>`,
          };
        },
        onPickWord(word) {
          if (!quiz || quiz.revealed) return;
          quiz.pickWord = word;
          quiz.pickWordSide = "word";
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
            quiz.pickWordSide = null;
            sfx("correct");
            /* 🦁 动物园：配对成功 → 尝试清除错题库 */
            if (window.isZooScene && isZooScene() && _makeWid(word)) WrongBank.recordCorrect(_makeWid(word));
            if (quiz.matched.length >= q.pairs.length) {
              quiz.revealed = true;
              quiz.choiceCorrect = quiz.matchWrong === 0;
              if (quiz.choiceCorrect) {
                quiz.correct++;
                q.pairs.forEach((p) => quiz.words.push(p.word));
              }
              render();
              return;
            }
          } else {
            quiz.matchWrong++;
            const wrongPair = quiz.pickWord; /* 被选错的那个单词 */
            quiz.pickWord = null;
            quiz.pickWordSide = null;
            quiz.hearts = Math.max(0, quiz.hearts - 1);
            sfx("wrong");
            /* 🦁 动物园：配对失败 → 自动收录错题库 */
            if (window.isZooScene && isZooScene() && _makeWid(wrongPair)) WrongBank.recordWrong(_makeWid(wrongPair));
            if (quiz.hearts <= 0) {
              quiz.revealed = true;
              quiz.choiceCorrect = false;
              render();
              return;
            }
            toast("答错了，继续努力");
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
            body: `<div class="ref-dialog-card">
                <div class="ref-dialog-row"><div class="ref-dialog-person">${QuizUiArt.child("boy")}</div>
                  <div class="ref-dialog-bubble"><span class="ref-dialog-name">A</span><p>${q.dlgQ}</p><span class="ref-dialog-pic">${q.art()}</span></div></div>
                <div class="ref-dialog-row reply"><div class="ref-dialog-bubble"><span class="ref-dialog-name">B</span><p>${q.dlgA.replace("{word}", `<b class="blank">${revealed ? q.word : "＿＿"}</b>`)}</p></div>
                  <div class="ref-dialog-person">${QuizUiArt.child("girl")}</div></div>
              </div>
              <div class="listen-row ref-dialog-listen">${listenPill()}</div>
              <div class="options one-col ref-dialog-options">${options(q.options)}</div>`,
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
        render({ q, quiz, artOf }) {
          const revealed = quiz.revealed;
          const slotsHtml = q.puzzleSlots.map((s) => {
            const letter = s.filled !== null ? q.puzzleLetters.find((l) => l.id === s.filled) : null;
            return `<div class="pz-slot ${letter ? "filled" : ""}" data-slot="${s.id}">${letter ? letter.ch : ""}</div>`;
          }).join("");
          const lettersHtml = q.puzzleLetters.map((l) => {
            const used = q.puzzleSlots.some((s) => s.filled === l.id);
            return `<button type="button" class="pz-letter ${used ? "used" : ""}" data-action="pz-letter" data-drag="puzzle" data-letter="${l.id}" ${used ? "disabled" : ""}>${l.ch}</button>`;
          }).join("");
          const allFilled = q.puzzleSlots.every((s) => s.filled !== null);
          const body = `
            <div class="pz-wrap ref-puzzle-wrap">
              <div class="pz-hint ref-puzzle-hint">
                <div class="pz-art">${artOf(q.word)()}</div>
                <small>${q.zh}</small>
              </div>
              <div class="pz-slots" style="--slot-count:${q.puzzleSlots.length}">${slotsHtml}</div>
              <div class="pz-letters">${lettersHtml}</div>
              ${!revealed ? `<button type="button" class="btn pz-check" data-action="pz-check" ${allFilled ? "" : "disabled"}>检查答案 ${I.arrow(16)}</button>` : ""}
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
          const foods = foodPool.slice(0, 3).map((w) => ({ word: w.word, emoji: w.emoji || "🍎", zh: w.zh || "" }));
          if (foods.length < 3) {
            /* 兜底：用不重复的基础食物补足到 3 种 */
            const seen = new Set(foods.map((f) => f.word));
            const fallback = [
              { word: "meat", emoji: "🥩", zh: "肉" },
              { word: "banana", emoji: "🍌", zh: "香蕉" },
              { word: "bamboo", emoji: "🎋", zh: "竹子" },
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
          /* 答错提示用：正确食物的中文翻译 */
          task.correctZh = (task.foods.find((f) => f.word === task.correctFood) || {}).zh || "";
        },
        render({ q, quiz, artOf }) {
          const revealed = quiz.revealed;
          const foods = q.foods.map((f) =>
            `<button type="button" class="fd-food ${revealed && f.word === q.correctFood ? "correct" : ""} ${quiz.selected === f.word ? "selected" : ""}"
              data-action="fd-pick" data-drag="food" data-food="${f.word}"><span class="ref-food-art">${artOf(f.word)()}</span><small>${f.word}</small></button>`
          ).join("");
          const body = `
            <div class="fd-wrap ref-feed-wrap">
              <div class="fd-animal ref-feed-animal" data-feed-drop>
                <div class="fd-art">${artOf(q.word)()}</div>
                <div class="fd-name">${q.word.toUpperCase()}</div>
                <small>${q.zh} 爱吃什么？拖到嘴边或点选食物</small>
              </div>
              <div class="fd-foods">${foods}</div>
            </div>`;
          const btn = revealed ? quizNextButton() : `<button type="button" class="btn" data-action="fd-check" ${quiz.selected ? "" : "disabled"}>喂给它 ${I.arrow(16)}</button>`;
          return { body, btn };
        },
      },
      /* 🏃 动作猜猜 Action（进阶题：中央动态动物 + 纯文字选项） */
      action: {
        label: "动作猜猜",
        title: "看动作，选出正确的单词",
        build(task, pool) {
          buildOptions(task, pool, 3);
        },
        render({ q, quiz, options }) {
          const motion = q.motion || "run";
          const actionArt = q.assetKey && q.assetKey.indexOf("action-") === 0
            ? `<img class="ref-action-img" src="images/words/${q.assetKey}.png" alt=""
                 onload="this.parentElement.classList.add('has-art')" onerror="this.remove()">`
            : "";
          return {
            body: `<div class="ref-action-wrap">
                <div class="ref-action-stage" data-asset-key="${q.assetKey || q.word}" aria-hidden="true">
                  <span class="ref-action-sun"></span>
                  <span class="ref-action-cloud c1"></span>
                  <span class="ref-action-cloud c2"></span>
                  <span class="ref-action-ground"></span>
                  <span class="ref-action-animal act-${motion}"><span class="ref-action-emoji">${q.actor || q.emoji || "🐾"}</span>${actionArt}</span>
                  <span class="ref-action-spark s1">✦</span>
                  <span class="ref-action-spark s2">✦</span>
                </div>
                <p class="ref-action-tip">动物在干什么？</p>
                <div class="options ref-action-options">${options(q.options)}</div>
              </div>`,
            btn: quiz.revealed ? quizNextButton() : "",
          };
        },
      },
      /* 🔍 局部特写 Body Zoom（进阶题：放大镜高亮身体部位） */
      body_zoom: {
        label: "局部特写",
        title: "放大看看，这是哪个部位？",
        build(task, pool) {
          buildOptions(task, pool, 3);
        },
        render({ q, quiz, options }) {
          const f = q.focus || { x: "0%", y: "0%", scale: 2 };
          return {
            body: `<div class="ref-zoom-wrap">
                <div class="ref-zoom-lens" data-asset-key="${q.assetKey || q.word}" aria-hidden="true">
                  <span class="ref-zoom-art" style="--fx:${f.x};--fy:${f.y};--fs:${f.scale}">${q.owner || q.emoji || "🐾"}</span>
                  <span class="ref-zoom-spot"></span>
                </div>
                <span class="ref-zoom-handle" aria-hidden="true"></span>
                <p class="ref-zoom-tip">这是谁身上的哪个部位？</p>
                <div class="options ref-zoom-options">${options(q.options)}</div>
              </div>`,
            btn: quiz.revealed ? quizNextButton() : "",
          };
        },
      },
      /* ⚖️ 对比观察 Compare（进阶题：同框大小 / 高矮 / 快慢对照） */
      compare: {
        label: "对比观察",
        title: "对比看看，选出正确的单词",
        build(task, pool) {
          const adjPool = pool.filter((w) => w.category === "adj");
          const pair = task.compare && task.compare.pair;
          const extras = shuffle(adjPool.filter((w) => w.word !== task.word && w.word !== pair)).slice(0, 3 - (pair ? 2 : 1));
          task.options = shuffle([task.word, ...(pair ? [pair] : []), ...extras.map((w) => w.word)]);
        },
        render({ q, quiz, options }) {
          const c = q.compare || { a: { emoji: q.emoji || "🐾", scale: 1 }, b: { emoji: "🐾", scale: 1 }, target: "a" };
          const a = c.a || {};
          const b = c.b || {};
          const item = (side, data) => `<div class="ref-cmp-item${c.target === side ? " target" : ""}" style="--s:${data.scale || 1}">
              <span>${data.emoji || "🐾"}</span>
              ${data.badge ? `<i class="ref-cmp-badge" aria-hidden="true">${data.badge}</i>` : ""}
              ${c.target === side ? '<i class="ref-cmp-ring" aria-hidden="true"></i>' : ""}
            </div>`;
          return {
            body: `<div class="ref-cmp-wrap">
                <div class="ref-cmp-stage mode-${c.mode || "size"}" data-asset-key="${q.assetKey || q.word}" data-target="${c.target || "a"}" aria-hidden="true">
                  ${item("a", a)}
                  ${item("b", b)}
                  <span class="ref-cmp-floor"></span>
                </div>
                <p class="ref-cmp-tip">圈出来的动物，用哪个词形容？</p>
                <div class="options ref-cmp-options">${options(q.options)}</div>
              </div>`,
            btn: quiz.revealed ? quizNextButton() : "",
          };
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
            </div>`;
          return { body, btn: revealed ? quizNextButton() : "" };
        },
      },
    };
  }

  /* 占位主题：统一「敬请期待」页，主题文件只需传差异文案与配色 */
  window.definePlaceholderTheme = function definePlaceholderTheme(opts) {
    const o = opts || {};
    return window.defineDinoTheme({
      id: o.id,
      name: o.name,
      chip: o.chip,
      unit: o.unit,
      emoji: o.emoji,
      dialog: o.dialog || { q: "What's this?", a: "It's a {word}." },
      playable: false,
      words: [],
      scenes: [],
      map: {
        title: "敬请期待",
        intro: o.mapIntro || `「${o.name}」主题正在筹备中…`,
        sceneSelector: false,
        render() {
          return `<div style="text-align:center;padding:2rem 1rem;color:${o.color}">
        <div style="font-size:3rem;margin-bottom:0.75rem">${o.emoji}</div>
        <h3 style="margin:0 0 0.25rem;color:${o.accent}">${o.name} · 主题筹备中</h3>
        <p style="font-size:0.8125rem;margin:0;color:${o.tip || o.color}">${o.plan}</p>
      </div>`;
        },
      },
    });
  };

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
