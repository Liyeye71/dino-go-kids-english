/* DinoGo · 高级词性组合规则：多条件嵌套、复杂从句与推理链
   写入前逐条常识校验：禁止荒谬或跨槽位不协调搭配。 */
window.DINO_WORD_RULES = window.DINO_WORD_RULES || [];
window.DINO_WORD_RULES.push({
  level: "pro",
  rules: [
    {
      id: "pro-01", name: "条件与原因嵌套",
      pattern: [
        { pos: "conj", type: "condition", words: ["if"] },
        { text: "it is" },
        { pos: "adj", type: "basic", words: ["cold", "hot", "cool", "warm", "fine"] },
        { text: "," },
        { pos: "pron", type: "subject", words: ["we"] },
        { text: "will" },
        { pos: "verb", type: "phrase", words: ["go home"] },
        { pos: "conj", type: "reason", words: ["because"] },
        { text: "we feel" },
        { pos: "adj", type: "basic", words: ["cold", "hot", "tired", "hungry"] }
      ]
    },
    {
      id: "pro-02", name: "双条件结果推理",
      pattern: [
        { pos: "pron", type: "subject", words: ["we"] },
        { text: "will" },
        { pos: "verb", type: "phrase", words: ["go home", "go to bed"] },
        { pos: "conj", type: "condition", words: ["if"] },
        { text: "it is" },
        { pos: "adj", type: "basic", words: ["cold", "hot"] },
        { pos: "conj", type: "coordinating", words: ["and"] },
        { text: "we feel" },
        { pos: "adj", type: "basic", words: ["tired"] }
      ]
    },
    {
      id: "pro-03", name: "让步与原因链",
      pattern: [
        { pos: "conj", type: "concession", words: ["although", "though"] },
        { text: "it is" },
        { pos: "adj", type: "basic", words: ["cold", "hot"] },
        { text: "," },
        { pos: "pron", type: "subject", words: ["we"] },
        { text: "will" },
        { pos: "verb", type: "phrase", words: ["go to school"] },
        { pos: "conj", type: "reason", words: ["because"] },
        { text: "we like our" },
        { pos: "noun", type: "place", words: ["school"] }
      ]
    },
    {
      id: "pro-04", name: "观点中的条件推理",
      pattern: [
        { pos: "pron", type: "subject", words: ["I"] },
        { pos: "verb", type: "action", words: ["think"] },
        { pos: "conj", type: "clause", words: ["that"] },
        { text: "we can" },
        { pos: "verb", type: "action", words: ["learn"] },
        { pos: "conj", type: "condition", words: ["if"] },
        { text: "we" },
        { pos: "verb", type: "action", words: ["work", "study"] }
      ]
    },
    {
      id: "pro-05", name: "观点与因果链",
      pattern: [
        { pos: "pron", type: "subject", words: ["I"] },
        { pos: "verb", type: "action", words: ["think"] },
        { pos: "conj", type: "clause", words: ["that"] },
        { text: "it is" },
        { pos: "adj", type: "basic", words: ["nice", "beautiful", "good"] },
        { pos: "conj", type: "reason", words: ["because"] },
        { text: "the" },
        { pos: "noun", type: "nature", words: ["rainbow", "sky", "forest", "lake"] },
        { text: "is" },
        { pos: "adj", type: "basic", words: ["beautiful", "colorful", "nice"] }
      ]
    },
    {
      id: "pro-06", name: "时间中的条件嵌套",
      pattern: [
        { pos: "conj", type: "time", words: ["when"] },
        { text: "we" },
        { pos: "verb", type: "phrase", words: ["go to school", "go home"] },
        { pos: "conj", type: "condition", words: ["if"] },
        { text: "it is" },
        { pos: "adj", type: "basic", words: ["cold", "cool"] },
        { text: ", we" },
        { pos: "verb", type: "action", words: ["wear"] },
        { text: "our" },
        { pos: "noun", type: "clothes", words: ["coat", "jacket", "raincoat", "scarf", "gloves"] }
      ]
    },
    {
      id: "pro-07", name: "顺序与并列建议",
      pattern: [
        { pos: "conj", type: "time", words: ["before"] },
        { text: "we" },
        { pos: "verb", type: "phrase", words: ["go to school", "go to bed"] },
        { text: ", we should" },
        { pos: "verb", type: "action", words: ["read", "write", "study", "think"] },
        { pos: "conj", type: "coordinating", words: ["and"] },
        { pos: "verb", type: "action", words: ["read", "write", "study", "think"] }
      ]
    },
    {
      id: "pro-08", name: "后续动作与条件选择",
      pattern: [
        { pos: "conj", type: "time", words: ["after"] },
        { text: "we" },
        { pos: "verb", type: "phrase", words: ["play sports", "do homework"] },
        { pos: "conj", type: "condition", words: ["if"] },
        { text: "we feel" },
        { pos: "adj", type: "basic", words: ["tired", "hungry"] },
        { text: ", we can" },
        { pos: "verb", type: "phrase", words: ["go home", "eat dinner", "drink water"] }
      ]
    },
    {
      id: "pro-09", name: "目的与时间条件",
      pattern: [
        { pos: "pron", type: "subject", words: ["we"] },
        { pos: "verb", type: "phrase", words: ["read books"] },
        { pos: "conj", type: "coordinating", words: ["so"] },
        { text: "we can" },
        { pos: "verb", type: "action", words: ["learn"] },
        { pos: "conj", type: "time", words: ["when"] },
        { text: "it is" },
        { pos: "adj", type: "basic", words: ["quiet", "cool", "warm"] }
      ]
    },
    {
      id: "pro-10", name: "让步评价与喜好",
      pattern: [
        { pos: "conj", type: "concession", words: ["though", "although"] },
        { text: "it is" },
        { pos: "adj", type: "basic", words: ["expensive", "cheap", "new", "old"] },
        { text: ", it is" },
        { pos: "adj", type: "basic", words: ["good", "nice", "beautiful"] },
        { pos: "conj", type: "coordinating", words: ["and"] },
        { text: "I like this" },
        { pos: "noun", type: "other", words: ["toy", "gift", "computer", "phone", "picture"] }
      ]
    },
    {
      id: "pro-11", name: "推测中的条件结果",
      pattern: [
        { pos: "pron", type: "subject", words: ["I"] },
        { pos: "verb", type: "action", words: ["guess"] },
        { pos: "conj", type: "clause", words: ["that"] },
        { pos: "conj", type: "condition", words: ["if"] },
        { text: "it is" },
        { pos: "adj", type: "basic", words: ["fine", "warm", "hot", "cool"] },
        { text: ", we will" },
        { pos: "verb", type: "phrase", words: ["have a picnic", "go hiking", "take a trip", "play sports"] }
      ]
    },
    {
      id: "pro-12", name: "观点原因追问",
      pattern: [
        { pos: "adv", type: "interrogative", words: ["why"] },
        { text: "do you" },
        { pos: "verb", type: "action", words: ["think"] },
        { pos: "conj", type: "clause", words: ["that"] },
        { text: "the" },
        { pos: "noun", type: "animal" },
        { text: "is" },
        { pos: "adj", type: "basic", words: ["smart", "funny", "cute", "lovely", "active"] },
        { text: "?" }
      ]
    },
    {
      id: "pro-13", name: "推测方法追问",
      pattern: [
        { pos: "adv", type: "interrogative", words: ["how"] },
        { text: "can we" },
        { pos: "verb", type: "action", words: ["guess"] },
        { pos: "conj", type: "clause", words: ["that"] },
        { text: "it is" },
        { pos: "adj", type: "basic", words: ["right", "good", "new", "easy"] },
        { text: "?" }
      ]
    },
    {
      id: "pro-14", name: "时间建议与感受条件",
      pattern: [
        { pos: "adv", type: "interrogative", words: ["when"] },
        { text: "should we" },
        { pos: "verb", type: "phrase", words: ["go home", "go to bed", "eat dinner", "drink water"] },
        { pos: "conj", type: "condition", words: ["if"] },
        { text: "we feel" },
        { pos: "adj", type: "basic", words: ["tired", "hungry"] },
        { text: "?" }
      ]
    },
    {
      id: "pro-15", name: "地点选择与环境条件",
      pattern: [
        { pos: "adv", type: "interrogative", words: ["where"] },
        { text: "can we" },
        { pos: "verb", type: "action", words: ["read", "study", "work", "play"] },
        { pos: "conj", type: "time", words: ["when"] },
        { text: "it is" },
        { pos: "adj", type: "basic", words: ["quiet", "hot", "cold", "fine"] },
        { text: "?" }
      ]
    },
    {
      id: "pro-16", name: "人物关系从句",
      pattern: [
        { text: "The" },
        { pos: "noun", type: "people", words: ["friend", "classmate"] },
        { pos: "pron", type: "interrogative", words: ["who"] },
        { text: "can" },
        { pos: "verb", type: "action", words: ["help", "read", "write", "study"] },
        { text: "is" },
        { pos: "adj", type: "basic", words: ["kind", "helpful", "smart", "strict"] }
      ]
    },
    {
      id: "pro-17", name: "动物关系从句",
      pattern: [
        { text: "The" },
        { pos: "noun", type: "animal", words: ["fish", "shark", "seal", "duck", "penguin"] },
        { pos: "conj", type: "clause", words: ["that"] },
        { text: "can" },
        { pos: "verb", type: "action", words: ["swim"] },
        { text: "is" },
        { pos: "adj", type: "basic", words: ["small", "big", "active", "cute", "lovely"] }
      ]
    },
    {
      id: "pro-18", name: "地点关系与方位嵌套",
      pattern: [
        { text: "The" },
        { pos: "noun", type: "place", words: ["library", "school"] },
        { pos: "adv", type: "interrogative", words: ["where"] },
        { text: "we can" },
        { pos: "verb", type: "action", words: ["read", "study"] },
        { text: "is" },
        { pos: "prep", words: ["near", "next to", "behind"] },
        { text: "my" },
        { pos: "noun", type: "place", words: ["home"] }
      ]
    },
    {
      id: "pro-19", name: "序数时间与条件结果",
      pattern: [
        { pos: "conj", type: "condition", words: ["if"] },
        { text: "the" },
        { pos: "num", type: "ordinal", words: ["first", "second", "third", "fourth", "fifth", "sixth", "seventh"] },
        { text: "day is" },
        { pos: "adj", type: "basic", words: ["busy", "hot", "cold", "fine"] },
        { text: ", we will" },
        { pos: "verb", type: "phrase", words: ["go home", "read books", "play sports", "take a trip"] }
      ]
    },
    {
      id: "pro-20", name: "语篇标记与条件推理",
      pattern: [
        { pos: "interj", type: "discourse", words: ["well"] },
        { text: ", I" },
        { pos: "verb", type: "action", words: ["think"] },
        { pos: "conj", type: "clause", words: ["that"] },
        { pos: "conj", type: "condition", words: ["if"] },
        { text: "we" },
        { pos: "verb", type: "action", words: ["work", "study"] },
        { text: ", we can" },
        { pos: "verb", type: "action", words: ["learn"] }
      ]
    }
  ]
});
