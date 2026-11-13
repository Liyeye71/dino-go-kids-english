/* DinoGo · 进阶词性组合规则：并列、多从句及生活学习场景
   写入前逐条常识校验：禁止荒谬或跨槽位不协调搭配。 */
window.DINO_WORD_RULES = window.DINO_WORD_RULES || [];
window.DINO_WORD_RULES.push({
  level: "advance",
  rules: [
    {
      id: "advance-01", name: "并列食物宾语",
      pattern: [
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "action", words: ["like"] },
        { pos: "noun", type: "food", words: ["bread", "rice", "milk", "juice", "water", "tea", "coffee", "soup", "salad", "meat", "chicken", "beef", "pork"] },
        { pos: "conj", type: "coordinating", words: ["and", "or"] },
        { pos: "noun", type: "food", words: ["bread", "rice", "milk", "juice", "water", "tea", "coffee", "soup", "salad", "meat", "chicken", "beef", "pork"] }
      ]
    },
    {
      id: "advance-02", name: "并列动作",
      pattern: [
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "action", words: ["play", "read", "write", "sing", "dance", "work", "study"] },
        { pos: "conj", type: "coordinating", words: ["and", "or"] },
        { pos: "verb", type: "action", words: ["play", "read", "write", "sing", "dance", "work", "study"] }
      ]
    },
    {
      id: "advance-03", name: "并列动词短语",
      pattern: [
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "phrase", words: ["read books", "do homework", "watch TV", "play sports", "go shopping", "go hiking", "have a picnic", "play chess", "listen to music", "clean the room", "drink water", "take a trip", "go home"] },
        { pos: "conj", type: "coordinating", words: ["and"] },
        { pos: "verb", type: "phrase", words: ["read books", "do homework", "watch TV", "play sports", "go shopping", "go hiking", "have a picnic", "play chess", "listen to music", "clean the room", "drink water", "take a trip", "go home"] }
      ]
    },
    {
      id: "advance-04", name: "能力选择",
      pattern: [
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { text: "can" },
        { pos: "verb", type: "action", words: ["run", "jump", "swim", "read", "write", "sing", "dance", "cook"] },
        { pos: "conj", type: "coordinating", words: ["or"] },
        { pos: "verb", type: "action", words: ["run", "jump", "swim", "read", "write", "sing", "dance", "cook"] }
      ]
    },
    {
      id: "advance-05", name: "感受与原因",
      pattern: [
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "action", words: ["feel"] },
        { pos: "adj", type: "basic", words: ["happy", "sad", "tired", "hungry", "excited"] },
        { pos: "conj", type: "reason", words: ["because"] },
        { pos: "pron", type: "subject", words: ["it"] },
        { text: "is" },
        { pos: "adj", type: "basic", words: ["nice", "good", "hot", "cold", "warm", "cool"] }
      ]
    },
    {
      id: "advance-06", name: "喜欢地点及原因",
      pattern: [
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "action", words: ["like"] },
        { text: "the" },
        { pos: "noun", type: "place", words: ["school", "library", "playground", "gym", "art room", "music room"] },
        { pos: "conj", type: "reason", words: ["because"] },
        { text: "it is" },
        { pos: "adj", type: "basic", words: ["quiet", "nice", "good", "clean", "beautiful", "colorful"] }
      ]
    },
    {
      id: "advance-07", name: "天气条件与动作",
      pattern: [
        { pos: "conj", type: "condition", words: ["if"] },
        { text: "it is" },
        { pos: "adj", type: "basic", words: ["hot", "cold", "warm", "cool", "fine"] },
        { text: "," },
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { text: "can" },
        { pos: "verb", type: "action", words: ["play", "walk", "swim", "run", "read", "study"] }
      ]
    },
    {
      id: "advance-08", name: "附带条件的动作",
      pattern: [
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { text: "can" },
        { pos: "verb", type: "action", words: ["play", "walk", "swim", "run", "read", "study"] },
        { pos: "conj", type: "condition", words: ["if"] },
        { text: "you like" }
      ]
    },
    {
      id: "advance-09", name: "时间与感受从句",
      pattern: [
        { pos: "conj", type: "time", words: ["when"] },
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "phrase", words: ["do homework", "read books", "play sports", "do housework"] },
        { text: "," },
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "action", words: ["feel"] },
        { pos: "adj", type: "basic", words: ["happy", "tired", "excited"] }
      ]
    },
    {
      id: "advance-10", name: "环境时间从句",
      pattern: [
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "phrase", words: ["read books", "do homework"] },
        { pos: "conj", type: "time", words: ["when"] },
        { text: "it is" },
        { pos: "adj", type: "basic", words: ["quiet", "warm", "cool", "fine"] }
      ]
    },
    {
      id: "advance-11", name: "之前动作顺序",
      pattern: [
        { pos: "conj", type: "time", words: ["before"] },
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "phrase", words: ["go to school", "go to bed", "eat breakfast", "eat dinner"] },
        { text: "," },
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "phrase", words: ["do homework", "read a book", "wash the dishes", "clean the room"] }
      ]
    },
    {
      id: "advance-12", name: "之后动作顺序",
      pattern: [
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "phrase", words: ["play sports", "watch TV", "go home", "read books"] },
        { pos: "conj", type: "time", words: ["after"] },
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "phrase", words: ["do homework", "eat dinner", "go to school", "clean the room"] }
      ]
    },
    {
      id: "advance-13", name: "第二人称宾语从句",
      pattern: [
        { pos: "pron", type: "subject", words: ["I"] },
        { pos: "verb", type: "action", words: ["think"] },
        { pos: "conj", type: "clause", words: ["that"] },
        { text: "you are" },
        { pos: "adj", type: "basic", words: ["right", "kind", "smart", "helpful", "good"] }
      ]
    },
    {
      id: "advance-14", name: "第三人称宾语从句",
      pattern: [
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "action", words: ["think"] },
        { pos: "conj", type: "clause", words: ["that"] },
        { pos: "pron", type: "subject", words: ["he", "she", "it"] },
        { text: "is" },
        { pos: "adj", type: "basic", words: ["right", "kind", "smart", "helpful", "good"] }
      ]
    },
    {
      id: "advance-15", name: "推测宾语从句",
      pattern: [
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "action", words: ["guess"] },
        { pos: "conj", type: "clause", words: ["that"] },
        { text: "it is" },
        { pos: "adj", type: "basic", words: ["right", "good", "new", "easy", "beautiful"] }
      ]
    },
    {
      id: "advance-16", name: "地点动作疑问",
      pattern: [
        { pos: "adv", type: "interrogative", words: ["where"] },
        { text: "do" },
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "action", words: ["go", "live", "work", "study"] },
        { text: "?" }
      ]
    },
    {
      id: "advance-17", name: "时间活动疑问",
      pattern: [
        { pos: "adv", type: "interrogative", words: ["when"] },
        { text: "do" },
        { pos: "pron", type: "subject", words: ["I", "you", "we", "they"] },
        { pos: "verb", type: "phrase", words: ["get up", "go to school", "eat breakfast", "eat dinner", "go to bed"] },
        { text: "?" }
      ]
    },
    {
      id: "advance-18", name: "喜好原因疑问",
      pattern: [
        { pos: "adv", type: "interrogative", words: ["why"] },
        { text: "do" },
        { pos: "pron", type: "subject", words: ["you", "we", "they"] },
        { pos: "verb", type: "action", words: ["like"] },
        { text: "this" },
        { pos: "noun", type: "animal" },
        { text: "?" }
      ]
    },
    {
      id: "advance-19", name: "动物比较",
      pattern: [
        { text: "The" },
        { pos: "noun", type: "animal" },
        { text: "is" },
        { pos: "adj", type: "comparative" },
        { text: "than the" },
        { pos: "noun", type: "animal" }
      ]
    },
    {
      id: "advance-20", name: "多地位置关系",
      pattern: [
        { text: "The" },
        { pos: "noun", type: "place", words: ["library", "hospital", "cinema", "bookstore"] },
        { text: "is" },
        { pos: "prep", words: ["between"] },
        { text: "the" },
        { pos: "noun", type: "place", words: ["school", "post office", "supermarket"] },
        { pos: "conj", type: "coordinating", words: ["and"] },
        { text: "the" },
        { pos: "noun", type: "place", words: ["bank", "gym"] }
      ]
    }
  ]
});
