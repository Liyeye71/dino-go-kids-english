/* ============================================================
   DinoGo · 恐龙英语 — 情景对话模板库
   用现有单词数据组合短句问答，支持三种作答形式：
   word   缺词补全（单词选项）
   sentence 整句应答（整句英文选项）
   image  图片选择（图片选项）
   ============================================================ */
(function () {
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const foodEn = (food) => (food && (food.en || food.word)) || "";

  /* 主题作用域：对话句式与词汇只能来自当前闯关主题 / 场景。
     zoo   = 神奇动物园（含动物园、饲养员、游客等场景语）
     animal = 动物主题兜底
     default = 其他主题（学校、旅行等）使用通用句式 */
  const ZOO_ASKS = {
    word: [
      "Welcome to the zoo! Look at the picture. What animal is this?",
      "The zookeeper points at the picture. What animal is this?",
      "You are visiting the zoo. What do you see in this picture?",
      "Look at the zoo sign. Can you tell me this animal's name?",
      "At the zoo, we can see many animals. What is this one?",
      "This animal lives in the zoo. Do you know what it is?",
    ],
    wordGeneric: [
      "Welcome to the zoo! Look at the picture. What is this?",
      "The zookeeper shows you a picture. What is this?",
      "At the zoo, what do you see in the picture?",
      "Do you know this zoo word? What is it?",
    ],
    eat: [
      "At the zoo, what does the {word} eat?",
      "The zookeeper asks: what food does the {word} like?",
      "Look at the {word} in its enclosure. What does it eat?",
      "What do visitors feed the {word} at the zoo?",
      "What is the {word}'s favourite food at the zoo?",
      "The {word} is hungry. What should the zookeeper give it?",
    ],
    eatYesNo: [
      "Does the {word} like {food} at the zoo?",
      "The zookeeper feeds the {word} some {food}. Is that right?",
      "Is {food} good food for the {word} at the zoo?",
      "A visitor asks: does the {word} like {food}?",
    ],
    yesno: [
      "A visitor asks: is this {aWrong}?",
      "Look at the zoo sign. Is this {aWrong}?",
      "The little boy at the zoo says: is this {aWrong}? What do you think?",
      "This animal is in the zoo. Is it {aWrong}?",
    ],
    image: [
      "The zoo map shows many animals. Which one is the {word}?",
      "Can you find the {word} in the zoo?",
      "Point to the {word} on the zoo map, please.",
      "Where is the {word} in the zoo picture?",
      "The zookeeper is looking for the {word}. Which one is it?",
    ],
    foodImage: [
      "Which zoo animal eats {food}?",
      "At the zoo, who likes to eat {food}?",
      "Which animal would like some {food} at the zoo?",
      "The zookeeper has some {food}. Which animal wants it?",
    ],
  };

  const DEFAULT_ASKS = {
    word: [
      "Look at the picture. What animal is this?",
      "Can you tell me what this is?",
      "What do you see in the picture?",
      "Do you know this animal? What is it?",
      "Look carefully. What is in the picture?",
    ],
    wordGeneric: [
      "Look at the picture. What is this?",
      "Can you tell me what this is?",
      "What do you see in the picture?",
      "Do you know this word? What is it?",
      "Look carefully. What is this?",
    ],
    eat: [
      "What does the {word} eat?",
      "What food does the {word} like?",
      "Tell me, what does a {word} eat?",
      "What is the {word}'s favourite food?",
      "The {word} is hungry. What does it eat?",
    ],
    eatYesNo: [
      "Does the {word} eat {food}?",
      "Is {food} good food for the {word}?",
      "Does the {word} like {food}?",
    ],
    yesno: [
      "Is this {aWrong}?",
      "Look carefully. Is this {aWrong}?",
      "Excuse me, is this {aWrong}?",
      "Look at the picture. Is it {aWrong}?",
    ],
    image: [
      "Which one is the {word}?",
      "Can you find the {word}?",
      "Point to the {word}, please.",
      "Where is the {word}?",
      "Which picture shows the {word}?",
    ],
    foodImage: [
      "Which animal eats {food}?",
      "Who likes to eat {food}?",
      "Which animal would like some {food}?",
    ],
  };

  /* 校园/文具专属情景对话句式 */
  const SCHOOL_ASKS = {
    wordGeneric: [
      "Welcome to the classroom! Look on the desk. What is this?",
      "Time for class! What is in your schoolbag?",
      "Let's draw and learn! What school thing is this?",
      "The teacher holds up a picture. What is this?",
      "Look at the classroom table. Do you know what this is?",
    ],
    yesno: [
      "In the classroom, is this {aWrong}?",
      "Look in your schoolbag. Is this {aWrong}?",
      "Your classmate asks: is this {aWrong}?",
      "Check the desk! Is it {aWrong}?",
    ],
    yesnoPlural: [
      "In the classroom, are these {wrong}?",
      "Look on the desk. Are these {wrong}?",
      "Your classmate asks: are these {wrong}?",
    ],
    image: [
      "Time for class! Can you find the {word}?",
      "Look on the desk. Which one is the {word}?",
      "Pack your bag! Point to the {word}, please.",
      "Where is the {word} in the classroom?",
      "The teacher needs the {word}. Which one is it?",
    ],
  };

  /* 旅行/交通专属情景对话句式 */
  const TRAVEL_ASKS = {
    wordGeneric: [
      "Let's go on a trip! Look at the picture. What is this?",
      "Beep beep! Look on the road. What is this?",
      "We are going to travel! What vehicle do you see?",
      "Look out the window! Do you know what this is?",
      "Ready to go! What is in this travel picture?",
    ],
    yesno: [
      "Look on the road! Is this {aWrong}?",
      "We are at the station. Is this {aWrong}?",
      "Look out the window! Is it {aWrong}?",
      "Your friend asks: is this {aWrong}?",
    ],
    image: [
      "Let's travel! Which one is the {word}?",
      "Look at the busy street. Can you find the {word}?",
      "Point to the {word} for our trip, please.",
      "Where is the {word}?",
      "Which picture shows the {word}?",
    ],
  };

  const SCOPES = {
    zoo: ZOO_ASKS,
    animal: ZOO_ASKS,
    campus: SCHOOL_ASKS,
    school: SCHOOL_ASKS,
    journey: TRAVEL_ASKS,
    travel: TRAVEL_ASKS,
    default: DEFAULT_ASKS,
  };
  /* 按「场景 → 主题 → 通用」顺序解析作用域，主题不存在时自动使用通用句式 */
  function asksFor(scope) {
    const s = scope || {};
    return SCOPES[s.sceneId] || SCOPES[s.themeId] || SCOPES.default;
  }

  /* 英文冠词与复数词适配（如 an eraser / an airplane / scissors 不加 a） */
  const PLURAL_WORDS = new Set(["scissors", "glasses", "sunglasses", "shoes", "socks", "pants", "shorts", "jeans", "gloves"]);
  function isPluralWord(word) {
    return PLURAL_WORDS.has(String(word || "").trim().toLowerCase());
  }
  function articleOf(word) {
    const clean = String(word || "").trim().toLowerCase();
    if (!clean || isPluralWord(clean)) return "";
    if (/^(uni|use|eur|one\b)/i.test(clean)) return "a";
    return /^[aeiou]/i.test(clean) ? "an" : "a";
  }
  function withArticle(word) {
    const art = articleOf(word);
    return art ? `${art} ${word}` : String(word || "");
  }

  function animalOption(w) {
    return {
      value: w.word,
      label: w.word,
      img: w.img || (w.animal ? `images/words/animal/${w.word}.webp` : ""),
    };
  }

  function build(task, pool, scope) {
    const w = task;
    if (!w || !w.word) return null;
    const ASKS = asksFor(scope);
    const others = (pool || []).filter(
      (x) => x && x.word && x.word !== w.word && x.category === w.category
    );
    if (others.length < 2) return null;

    const two = shuffle(others).slice(0, 2);
    const food = foodEn(w.food);
    /* 结果卡展示正确答案时使用的中文翻译素材 */
    const foodZh = (w.food && w.food.zh) || food;
    const itemZh = w.zh || w.word;
    /* 备选食物全部来自当前场景的动物数据，保证不超出主题词库 */
    const altFoods = [...new Set(others.map((x) => foodEn(x.food)).filter((f) => f && f !== food))];
    const modes = ["word", "yesno"];
    if (others.every((x) => x.img || x.animal)) modes.push("image");
    if (w.animal && food && altFoods.length >= 2) modes.push("eat", "foodImage");
    if (w.animal && food && altFoods.length >= 3) modes.push("eatYesNo");

    let mode = pick(modes);

    if (mode === "eat") {
      const [f1, f2] = shuffle(altFoods).slice(0, 2);
      const correct = `It eats ${food}.`;
      return {
        mode: "sentence",
        replyMode: "sentence",
        askImg: true,
        ask: pick(ASKS.eat).replace("{word}", w.word),
        options: shuffle([
          { value: correct, label: correct },
          { value: `It eats ${f1}.`, label: `It eats ${f1}.` },
          { value: `It eats ${f2}.`, label: `It eats ${f2}.` },
        ]),
        answerValue: correct,
        answerText: correct,
        answerZh: `它吃${foodZh}。`,
        foodImg: (w.food && w.food.img) || "",
      };
    }

    if (mode === "eatYesNo") {
      const askedFood = Math.random() < 0.5 ? food : pick(altFoods);
      const isRight = askedFood === food;
      const correct = isRight ? "Yes, it does." : `No, it doesn't. It eats ${food}.`;
      const wrongFoods = shuffle(altFoods.filter((f) => f !== askedFood)).slice(0, 2);
      const noAnswer = `No, it doesn't. It eats ${wrongFoods[0]}.`;
      const options = isRight
        ? [correct, noAnswer, `No, it doesn't. It eats ${wrongFoods[1]}.`]
        : [correct, "Yes, it does.", noAnswer];
      return {
        mode: "sentence",
        replyMode: "sentence",
        askImg: true,
        ask: pick(ASKS.eatYesNo)
          .replace("{word}", w.word)
          .replace("{food}", askedFood),
        options: shuffle(options.map((v) => ({ value: v, label: v }))),
        answerValue: correct,
        answerText: correct,
        answerZh: isRight ? "是的，它吃。" : `不，它不吃。它吃${foodZh}。`,
        foodImg: (w.food && w.food.img) || "",
      };
    }

    if (mode === "yesno") {
      const wrong = two[0].word;
      const third = two[1].word;
      const askPlural = isPluralWord(wrong);
      const ansPlural = isPluralWord(w.word);
      const askList = askPlural
        ? (ASKS.yesnoPlural || ["Are these {wrong}?", "Look carefully. Are these {wrong}?"])
        : (ASKS.yesno || DEFAULT_ASKS.yesno);
      const ask = pick(askList)
        .replace("{aWrong}", withArticle(wrong))
        .replace("{wrong}", wrong);
      const yesOpt = askPlural ? "Yes, they are." : "Yes, it is.";
      const noPrefix = askPlural ? "No, they aren't." : "No, it isn't.";
      const stmt = (word) => (isPluralWord(word) ? `They are ${word}.` : `It is ${withArticle(word)}.`);
      const correct = `${noPrefix} ${stmt(w.word)}`;
      return {
        mode: "sentence",
        replyMode: "sentence",
        askImg: true,
        ask,
        options: shuffle([
          { value: correct, label: correct },
          { value: yesOpt, label: yesOpt },
          { value: `${noPrefix} ${stmt(third)}`, label: `${noPrefix} ${stmt(third)}` },
        ]),
        answerValue: correct,
        answerText: correct,
        answerZh: ansPlural ? `不，它们不是。它们是${itemZh}。` : `不，它不是。它是${itemZh}。`,
      };
    }

    if (mode === "image") {
      return {
        mode: "image",
        replyMode: "blank",
        askImg: false,
        ask: pick(ASKS.image || DEFAULT_ASKS.image).replace("{word}", w.word),
        reply: isPluralWord(w.word) ? "They are the ___." : "It's the ___.",
        options: shuffle([w, ...two].map(animalOption)),
        answerValue: w.word,
        answerText: isPluralWord(w.word) ? `They are the ${w.word}.` : `It is the ${w.word}.`,
      };
    }

    if (mode === "foodImage") {
      const poolFood = others.filter((x) => foodEn(x.food) && foodEn(x.food) !== food);
      if (poolFood.length < 2) mode = "word";
      else {
        return {
          mode: "image",
          replyMode: "blank",
          askImg: false,
          ask: pick(ASKS.foodImage).replace("{food}", food),
          reply: "It's the ___.",
          options: shuffle([w, ...shuffle(poolFood).slice(0, 2)].map(animalOption)),
          answerValue: w.word,
          answerText: `The ${w.word} eats ${food}.`,
        };
      }
    }

    const words = shuffle([w, ...two].map((x) => x.word));
    const plural = isPluralWord(w.word);
    const art = articleOf(w.word);
    return {
      mode: "word",
      replyMode: "blank",
      askImg: true,
      ask: pick(w.animal ? (ASKS.word || DEFAULT_ASKS.word) : (ASKS.wordGeneric || DEFAULT_ASKS.wordGeneric)),
      reply: plural ? "They are ___." : `It's ${art} ___.`,
      options: words.map((value) => ({ value, label: value })),
      answerValue: w.word,
      answerText: plural ? `They are ${w.word}.` : `It's ${art} ${w.word}.`,
    };
  }

  /* 情景对话出场角色：
     - 动物园场景：动物×动物、饲养员×小朋友、小朋友×小朋友
     - 其他主题场景（school / travel 等）：小朋友（Ben / Mia）对话，避免串出饲养员 */
  const CAST_NAMES = { boy: "Ben", girl: "Mia", keeper: "Zookeeper" };
  const cap = (word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : "");
  function buildCast(task, pool, dlg) {
    if (!task || !dlg) return null;
    const isZoo = typeof window.isZooScene === "function" && window.isZooScene();
    if (!isZoo) {
      const boyFirst = Math.random() < 0.5;
      return {
        kind: "kids",
        ask: { type: "child", gender: boyFirst ? "boy" : "girl", name: CAST_NAMES[boyFirst ? "boy" : "girl"] },
        reply: { type: "child", gender: boyFirst ? "girl" : "boy", name: CAST_NAMES[boyFirst ? "girl" : "boy"] },
      };
    }
    const avatarSet = typeof QuizUiArt !== "undefined" && Array.isArray(QuizUiArt.zooAnimalWords)
      ? new Set(QuizUiArt.zooAnimalWords) : null;
    const others = avatarSet
      ? (pool || []).filter((x) => x && x.animal && x.word && x.word !== task.word && avatarSet.has(x.word))
      : [];
    const kinds = ["kids", "keeper"];
    /* 图片选项题的画面在选项里，不使用动物角色，避免角色与题目混淆 */
    if (others.length >= 2 && dlg.mode !== "image") kinds.push("animal");
    const kind = pick(kinds);
    if (kind === "animal") {
      const [friendA, friendB] = shuffle(others).slice(0, 2);
      return {
        kind,
        ask: { type: "animal", word: friendA.word, name: cap(friendA.word) },
        reply: { type: "animal", word: friendB.word, name: cap(friendB.word) },
      };
    }
    if (kind === "keeper") {
      return {
        kind,
        ask: { type: "keeper", name: CAST_NAMES.keeper },
        reply: { type: "child", gender: "girl", name: CAST_NAMES.girl },
      };
    }
    const boyFirst = Math.random() < 0.5;
    return {
      kind: "kids",
      ask: { type: "child", gender: boyFirst ? "boy" : "girl", name: CAST_NAMES[boyFirst ? "boy" : "girl"] },
      reply: { type: "child", gender: boyFirst ? "girl" : "boy", name: CAST_NAMES[boyFirst ? "girl" : "boy"] },
    };
  }

  window.DialogTemplates = { build, buildCast, ASKS: DEFAULT_ASKS, SCOPES };
})();
