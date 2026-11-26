/* ============================================================
   WrongBank · 智能错题库
   - 独立 localStorage 持久化（key: dinogo.wrongbank）
   - 答错自动收录 + 错误次数累加
   - 连续答对 2 次自动"毕业"移出错题库
   - 查询接口：pickFromWrong(候选词) → 65% 概率优先返回错题
   - 数据隔离：wordId 格式 "{scene}_{word}"，跨场景互不污染
   ============================================================ */
(function () {
  "use strict";

  const STORAGE_KEY = "dinogo.wrongbank";

  /* 运行时内存结构：{ [wordId]: { errorCount: n, consecutiveCorrect: n } } */
  let bank = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  /* 写入节流：连续答题时合并成一次 localStorage 写入，避免同步阻塞主线程 */
  let persistTimer = null;
  function flush() {
    if (persistTimer) { clearTimeout(persistTimer); persistTimer = null; }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bank)); } catch (e) {}
  }
  function persist() {
    if (persistTimer) return;
    persistTimer = setTimeout(flush, 300);
  }
  window.addEventListener("pagehide", flush);

  /* 对外 API */
  window.WrongBank = {
    /* 为某个场景的单词生成唯一 ID：zoo + lion → "zoo_lion" */
    makeId(sceneId, word) {
      return `${sceneId || ""}_${word || ""}`;
    },

    /* 统一入口：按题型 task 记录一次答题结果（仅动物园场景生效）
       所有题型一视同仁：答错必收录，答对累计连续正确次数 */
    applyResult(task, ok) {
      if (!task || !task.wrongWordId) return false;
      if (typeof isZooScene === "function" && !isZooScene()) return false;
      if (ok) return this.recordCorrect(task.wrongWordId);
      this.recordWrong(task.wrongWordId);
      return false;
    },

    /* 答错时调用：自动收录 + 错误次数累加 + 打断连续正确 */
    recordWrong(wordId) {
      if (!wordId) return;
      if (!bank[wordId]) {
        bank[wordId] = { errorCount: 1, consecutiveCorrect: 0 };
      } else {
        bank[wordId].errorCount += 1;
        bank[wordId].consecutiveCorrect = 0;
      }
      persist();
    },

    /* 答对时调用：连续答对 2 次自动毕业 → 返回 true 触发"康复欢呼"特效 */
    recordCorrect(wordId) {
      if (!wordId) return false;
      const rec = bank[wordId];
      if (!rec) return false;
      rec.consecutiveCorrect += 1;
      if (rec.consecutiveCorrect >= 2) {
        delete bank[wordId];
        persist();
        return true;
      }
      persist();
      return false;
    },

    /* 判断某个词是否在错题库中 */
    isWrongWord(wordId) {
      return Boolean(bank[wordId]);
    },

    /* 从候选词列表里加权挑一个：65% 概率优先从错题里抽（单次分桶） */
    pickWithBias(candidates, wordIdGetter) {
      if (!candidates || candidates.length === 0) return null;
      const getter = wordIdGetter || ((w) => w);
      const wrong = [];
      const normal = [];
      for (let i = 0; i < candidates.length; i++) {
        const w = candidates[i];
        (bank[getter(w)] ? wrong : normal).push(w);
      }
      const BIAS = 0.65;
      if (wrong.length > 0 && Math.random() < BIAS) {
        return wrong[Math.floor(Math.random() * wrong.length)];
      }
      if (normal.length > 0) {
        return normal[Math.floor(Math.random() * normal.length)];
      }
      return candidates[Math.floor(Math.random() * candidates.length)];
    },

    /* 列出某场景的所有错题 wordId */
    listInScene(sceneId) {
      const prefix = `${sceneId || ""}_`;
      return Object.keys(bank).filter((k) => k.startsWith(prefix));
    },

    /* 清空（重玩全部关卡前可调用） */
    clear() { bank = {}; persist(); },
  };
})();
