/* ============================================================
   DinoGo · 恐龙英语 — 情景对话模板库
   用现有单词数据组合短句问答，支持三种作答形式：
   word   缺词补全（单词选项）
   sentence 整句应答（整句英文选项）
   image  图片选择（图片选项）
   ============================================================ */
(function () {
  const shuffle = (list) => {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const foodEn = (food) => (food && (food.en || food.word)) || "";

  /* 同一类题型的多组句式，避免每次都是同一句话 */
  const ASKS = {
    word: [
      "Look at the picture. What animal is this?",
      "Can you tell me what this is?",
      "What do you see in the picture?",
      "Do you know this animal? What is it?",
    ],
    wordGeneric: [
      "Look at the picture. What is this?",
      "Can you tell me what this is?",
      "What do you see in the picture?",
      "Do you know this word? What is it?",
    ],
    eat: [
      "What does the {word} eat?",
      "What food does the {word} like?",
      "Tell me, what does a {word} eat?",
      "What is the {word}'s favourite food?",
    ],
    yesno: [
      "Is this a {wrong}?",
      "Look carefully. Is this a {wrong}?",
      "Excuse me, is this a {wrong}?",
    ],
    image: [
      "Which one is the {word}?",
      "Can you find the {word}?",
      "Point to the {word}, please.",
      "Where is the {word}?",
    ],
    foodImage: [
      "Which animal eats {food}?",
      "Who likes to eat {food}?",
      "Which animal would like some {food}?",
    ],
  };

  function animalOption(w) {
    return {
      value: w.word,
      label: w.word,
      img: w.img || (w.animal ? `images/words/animal/${w.word}.webp` : ""),
    };
  }

  function build(task, pool) {
    const w = task;
    if (!w || !w.word) return null;
    const others = (pool || []).filter(
      (x) => x && x.word && x.word !== w.word && x.category === w.category
    );
    if (others.length < 2) return null;

    const two = shuffle(others).slice(0, 2);
    const food = foodEn(w.food);
    const modes = ["word"];
    if (w.animal && food && others.some((x) => foodEn(x.food) && foodEn(x.food) !== food)) {
      modes.push("eat", "foodImage");
    }
    if (w.animal && others.every((x) => x.img || x.animal)) modes.push("image");
    if (w.animal) modes.push("yesno");

    let mode = pick(modes);

    if (mode === "eat") {
      const altFoods = [...new Set(others.map((x) => foodEn(x.food)).filter((f) => f && f !== food))];
      if (altFoods.length < 2) {
        mode = "word";
      } else {
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
        };
      }
    }

    if (mode === "yesno") {
      const wrong = two[0].word;
      const third = two[1].word;
      const correct = `No, it isn't. It is a ${w.word}.`;
      return {
        mode: "sentence",
        replyMode: "sentence",
        askImg: true,
        ask: pick(ASKS.yesno).replace("{wrong}", wrong),
        options: shuffle([
          { value: correct, label: correct },
          { value: "Yes, it is.", label: "Yes, it is." },
          { value: `No, it isn't. It is a ${third}.`, label: `No, it isn't. It is a ${third}.` },
        ]),
        answerValue: correct,
        answerText: correct,
      };
    }

    if (mode === "image") {
      return {
        mode: "image",
        replyMode: "blank",
        askImg: false,
        ask: pick(ASKS.image).replace("{word}", w.word),
        reply: "It's the ___.",
        options: shuffle([w, ...two].map(animalOption)),
        answerValue: w.word,
        answerText: `It is the ${w.word}.`,
        answerWords: null,
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
    return {
      mode: "word",
      replyMode: "blank",
      askImg: true,
      ask: pick(w.animal ? ASKS.word : ASKS.wordGeneric),
      reply: "It's a ___.",
      options: words.map((value) => ({ value, label: value })),
      answerValue: w.word,
      answerText: `It's a ${w.word}.`,
    };
  }

  window.DialogTemplates = { build, ASKS };
})();
