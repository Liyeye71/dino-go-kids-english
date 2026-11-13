/* DinoGo · 基础词性组合规则：短句、日常口语与简单逻辑
   写入前逐条常识校验：禁止荒谬或跨槽位不协调搭配。 */
window.DINO_WORD_RULES = window.DINO_WORD_RULES || [];
window.DINO_WORD_RULES.push({
  level: "basic",
  rules: [
    {
      id: "basic-01", name: "第一人称感受",
      pattern: [
        { pos: "pron", type: "subject", words: ["I"] },
        { text: "am" },
        { pos: "adj", type: "basic", words: ["happy", "sad", "tired", "hungry", "busy", "fine", "proud"] }
      ]
    },
    {
      id: "basic-02", name: "复数主语感受",
      pattern: [
        { pos: "pron", type: "subject", words: ["you", "we", "they"] },
        { text: "are" },
        { pos: "adj", type: "basic", words: ["happy", "sad", "tired", "hungry", "busy", "excited"] }
      ]
    },
    {
      id: "basic-03", name: "第三人称感受",
      pattern: [
        { pos: "pron", type: "subject", words: ["he", "she", "it"] },
        { text: "is" },
        { pos: "adj", type: "basic", words: ["happy", "sad", "tired", "hungry", "busy", "excited"] }
      ]
    },
    {
      id: "basic-04", name: "第三人称能力",
      pattern: [
        { pos: "pron", type: "subject", words: ["he", "she"] },
        { text: "can" },
        { pos: "verb", type: "action", words: ["run", "jump", "swim", "read", "write", "sing", "dance", "cook"] }
      ]
    },
    {
      id: "basic-05", name: "复数主语动作",
      pattern: [
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "action", words: ["play", "jump", "walk", "swim", "run", "sing", "dance", "read", "work", "study"] }
      ]
    },
    {
      id: "basic-06", name: "喜欢水果",
      pattern: [
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "action", words: ["like"] },
        { text: "this" },
        { pos: "noun", type: "food" }
      ]
    },
    {
      id: "basic-07", name: "第三人称喜欢食物",
      pattern: [
        { pos: "pron", type: "subject", words: ["he", "she"] },
        { text: "likes this" },
        { pos: "noun", type: "food" }
      ]
    },
    {
      id: "basic-08", name: "开关物品祈使句",
      pattern: [
        { pos: "verb", type: "action", words: ["open", "close"] },
        { text: "the" },
        { pos: "noun", type: "other", words: ["window", "door"] }
      ]
    },
    {
      id: "basic-09", name: "清洗打扫祈使句",
      pattern: [
        { pos: "verb", type: "action", words: ["wash", "clean"] },
        { text: "the" },
        { pos: "noun", words: ["face", "hand", "room", "table", "floor"] }
      ]
    },
    {
      id: "basic-10", name: "简单动作祈使句",
      pattern: [
        { pos: "verb", type: "action", words: ["stop", "wait", "look", "run", "jump"] }
      ]
    },
    {
      id: "basic-11", name: "这是什么",
      pattern: [
        { pos: "pron", type: "interrogative", words: ["what"] },
        { text: "is this?" }
      ]
    },
    {
      id: "basic-12", name: "物品位置疑问",
      pattern: [
        { pos: "adv", type: "interrogative", words: ["where"] },
        { text: "is my" },
        { pos: "noun", type: "school" },
        { text: "?" }
      ]
    },
    {
      id: "basic-13", name: "年龄疑问",
      pattern: [
        { pos: "adv", type: "interrogative", words: ["how old"] },
        { text: "are you?" }
      ]
    },
    {
      id: "basic-14", name: "状态问候",
      pattern: [
        { pos: "adv", type: "interrogative", words: ["how"] },
        { text: "are you?" }
      ]
    },
    {
      id: "basic-15", name: "单数数量表达",
      pattern: [
        { pos: "num", type: "cardinal", words: ["one"] },
        { pos: "noun", type: "animal" }
      ]
    },
    {
      id: "basic-16", name: "同形复数数量表达",
      pattern: [
        { pos: "num", type: "cardinal", words: ["two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"] },
        { pos: "noun", type: "animal", words: ["fish", "sheep"] }
      ]
    },
    {
      id: "basic-17", name: "地点介词短语",
      pattern: [
        { pos: "prep", words: ["in", "near", "behind", "in front of", "next to"] },
        { text: "the" },
        { pos: "noun", type: "place", words: ["school", "library", "hospital", "cinema", "bookstore", "supermarket", "bank", "gym"] }
      ]
    },
    {
      id: "basic-18", name: "宾格介词短语",
      pattern: [
        { pos: "prep", words: ["with", "for"] },
        { pos: "pron", type: "object" }
      ]
    },
    {
      id: "basic-19", name: "感叹与评价",
      pattern: [
        { pos: "interj", words: ["wow", "oh", "hooray"] },
        { text: "! It is" },
        { pos: "adj", type: "basic", words: ["beautiful", "colorful", "pretty", "good", "nice"] }
      ]
    },
    {
      id: "basic-20", name: "并列形容词",
      pattern: [
        { pos: "adj", type: "basic", words: ["kind", "nice", "smart", "funny", "cute", "lovely", "helpful"] },
        { pos: "conj", type: "coordinating", words: ["and"] },
        { pos: "adj", type: "basic", words: ["kind", "nice", "smart", "funny", "cute", "lovely", "helpful"] }
      ]
    }
  ]
});
