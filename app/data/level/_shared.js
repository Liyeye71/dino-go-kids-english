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

  function defaultGames() {
    return {
      pic: {
        label: "看图选词",
        title: "看图，选出正确的单词",
        build(task, pool) {
          buildOptions(task, pool, 4);
        },
        render({ q, quiz, choiceButton, options }) {
          const revealed = quiz.revealed;
          return {
            body: `<div class="quiz-art">
                <div class="blob"></div>
                <div class="art-tag">WHAT IS IT?</div>
                <span class="art-spark s1">${spark(15, "#E8C377")}</span>
                <span class="art-spark s2">${spark(11, "#E8C377")}</span>
                <span class="art-spark s3">${spark(8, "#E8C377")}</span>
                ${q.art()}
                ${revealed ? `<button class="listen" data-action="speak-word" data-word="${q.word}">${I.speaker(14)} ${q.word}</button>` : `<div class="listen" style="pointer-events:none">${I.speaker(14)} 答完听发音</div>`}
              </div>
              <div class="options">${options(q.options)}</div>`,
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
            body: `<div class="match-grid"><div class="match-col">${wordCol}</div><div class="match-col">${artCol}</div></div>`,
            btn: `<button class="btn" disabled>连对 3 组即可过关 ${I.arrow(18)}</button>`,
          };
        },
        onPickWord(word) {
          if (!quiz || quiz.revealed) return;
          speak(word);
          quiz.pickWord = word;
          sfx("tap");
          render();
        },
        onPickArt(word) {
          if (!quiz || quiz.revealed || !quiz.pickWord) return;
          const q = quiz.order[quiz.index];
          if (word === quiz.pickWord) {
            quiz.matched.push(word);
            quiz.pickWord = null;
            sfx("correct");
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
              setTimer(() => nextQuestion(), 1500);
              return;
            }
          } else {
            quiz.matchWrong++;
            quiz.pickWord = null;
            quiz.hearts = Math.max(0, quiz.hearts - 1);
            quiz.combo = 0;
            sfx("wrong");
            if (quiz.hearts <= 0) {
              quiz.revealed = true;
              quiz.choiceCorrect = false;
              render();
              setTimer(() => nextQuestion(), 1600);
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
          render();
          setTimer(() => nextQuestion(), 1400);
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
              <div class="options one-col">${options(q.options)}</div>`,
            btn: choiceButton("选一个单词"),
          };
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
