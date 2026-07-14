/**
 * 乡音记 · 数据模块
 * 汇集方言词典、预设输入、对话历史、认知小测、健康趋势、健康提醒、邻里互助等数据。
 */

/* ============================================
   方言词典
   ============================================ */
export interface DialectDictEntry {
  /** 方言词 */
  dialect: string
  /** 普通话词 */
  mandarin: string
  /** 所属地区 */
  region: string
}

export const dialectDict: DialectDictEntry[] = [
  // 四川话
  { dialect: '啥子', mandarin: '什么', region: '四川' },
  { dialect: '巴适', mandarin: '舒服', region: '四川' },
  { dialect: '搞啥子', mandarin: '做什么', region: '四川' },
  { dialect: '幺儿', mandarin: '孩子', region: '四川' },
  { dialect: '莫要', mandarin: '不要', region: '四川' },
  { dialect: '要得', mandarin: '好的', region: '四川' },
  { dialect: '雄起', mandarin: '加油', region: '四川' },
  { dialect: '龙门阵', mandarin: '聊天', region: '四川' },
  { dialect: '安逸', mandarin: '满意', region: '四川' },
  // 广东话（粤语）
  { dialect: '食饭', mandarin: '吃饭', region: '广东' },
  { dialect: '唔该', mandarin: '谢谢', region: '广东' },
  { dialect: '睇', mandarin: '看', region: '广东' },
  { dialect: '企', mandarin: '站', region: '广东' },
  { dialect: '冇', mandarin: '没有', region: '广东' },
  { dialect: '靓仔', mandarin: '小伙子', region: '广东' },
  { dialect: '点解', mandarin: '为什么', region: '广东' },
  { dialect: '嘢', mandarin: '东西', region: '广东' },
  // 上海话
  { dialect: '阿拉', mandarin: '我们', region: '上海' },
  { dialect: '侬', mandarin: '你', region: '上海' },
  { dialect: '晓得', mandarin: '知道', region: '上海' },
  { dialect: '白相', mandarin: '玩', region: '上海' },
  { dialect: '今朝', mandarin: '今天', region: '上海' },
  { dialect: '辰光', mandarin: '时候', region: '上海' },
  { dialect: '囡囡', mandarin: '小女孩', region: '上海' },
  // 东北话
  { dialect: '咋整', mandarin: '怎么办', region: '东北' },
  { dialect: '唠嗑', mandarin: '聊天', region: '东北' },
  { dialect: '贼', mandarin: '很', region: '东北' },
  { dialect: '嘎哈', mandarin: '干什么', region: '东北' },
  { dialect: '埋汰', mandarin: '脏', region: '东北' },
  { dialect: '磕碜', mandarin: '难看', region: '东北' },
  { dialect: '唠扯', mandarin: '闲聊', region: '东北' },
  // 山东话
  { dialect: '俺', mandarin: '我', region: '山东' },
  { dialect: '妮儿', mandarin: '女孩', region: '山东' },
  { dialect: '杠', mandarin: '很', region: '山东' },
  { dialect: '潮乎', mandarin: '潮湿', region: '山东' },
  { dialect: '夜来', mandarin: '昨天', region: '山东' },
  // 河南话
  { dialect: '中', mandarin: '行', region: '河南' },
  { dialect: '得劲', mandarin: '舒服', region: '河南' },
  { dialect: '晌午', mandarin: '中午', region: '河南' },
  { dialect: '不中', mandarin: '不行', region: '河南' },
  { dialect: '搁哪', mandarin: '在哪', region: '河南' },
  // 湖南话
  { dialect: '么子', mandarin: '什么', region: '湖南' },
  { dialect: '咯', mandarin: '的', region: '湖南' },
  { dialect: '霸蛮', mandarin: '固执', region: '湖南' },
  { dialect: '韵味', mandarin: '舒服', region: '湖南' },
  { dialect: '策', mandarin: '聊天', region: '湖南' },
  // 陕西话
  { dialect: '咋向', mandarin: '怎么样', region: '陕西' },
  { dialect: '额', mandarin: '我', region: '陕西' },
  { dialect: '聊咋咧', mandarin: '很好', region: '陕西' },
  { dialect: '谝', mandarin: '聊天', region: '陕西' },
  { dialect: '殁', mandarin: '死', region: '陕西' },
  // 福建话（闽南语）
  { dialect: '呷', mandarin: '吃', region: '福建' },
  { dialect: '厝', mandarin: '家', region: '福建' },
  { dialect: '歹势', mandarin: '不好意思', region: '福建' },
  { dialect: '古早', mandarin: '旧时', region: '福建' },
  // 江苏话（吴语）
  { dialect: '弗', mandarin: '不', region: '江苏' },
  { dialect: '蛮好', mandarin: '很好', region: '江苏' },
  { dialect: '作啥', mandarin: '干什么', region: '江苏' },
  // 安徽话
  { dialect: '可照', mandarin: '行不行', region: '安徽' },
  { dialect: '真滋', mandarin: '舒服', region: '安徽' },
  { dialect: '日白', mandarin: '聊天', region: '安徽' },
]

/* ============================================
   预设方言输入（语音识别不可用时的降级样本）
   ============================================ */
export const dialectInputs: string[] = [
  '俺今天去集市买菜，路上碰到老张头唠嗑了好一阵。',
  '今朝天气贼好，阿拉一道去白相相好不好？',
  '你这娃儿搞啥子嘛，莫要到处乱跑哦。',
  '食饭未啊？唔该帮我睇下门口个包裹。',
  '妮儿，你晓得咋走不？俺找不到回家的路了。',
  '晌午得劲得很，俺想吃碗面条，中不中？',
  '么子事咯？策两句噻，韵味得很。',
  '额咋向咧？谝一谝，聊咋咧！',
  '呷饭了没？转来厝里坐坐，古早味还在。',
  '夜来杠冷，可照去添件衣裳？',
]

/* ============================================
   对话历史
   ============================================ */
export interface DialectConversation {
  id: number
  /** 说话人：老人 / 子女 */
  speaker: '老人' | '子女'
  /** 原文（方言或普通话） */
  original: string
  /** AI 译文 */
  translation: string
  /** 时间描述 */
  time: string
}

export const dialectConversations: DialectConversation[] = [
  {
    id: 1,
    speaker: '老人',
    original: '娃儿，你啥子时候回来嘛？',
    translation: '孩子，你什么时候回来？',
    time: '昨天 18:30',
  },
  {
    id: 2,
    speaker: '子女',
    original: '妈，我这周就回去看您。',
    translation: '妈，我这周就回去看您。',
    time: '昨天 18:32',
  },
  {
    id: 3,
    speaker: '老人',
    original: '中啊，那俺晌午给你做你爱吃的面条。',
    translation: '行啊，那我中午给你做你爱吃的面条。',
    time: '昨天 18:35',
  },
  {
    id: 4,
    speaker: '子女',
    original: '太好了，我馋您做的面条好久了。',
    translation: '太好了，我馋您做的面条好久了。',
    time: '昨天 18:36',
  },
]

/* ============================================
   认知小测
   ============================================ */
export interface QuizQuestion {
  /** 题号（2-5） */
  id: number
  /** 题干 */
  question: string
  /** 四个选项 */
  options: string[]
  /** 正确选项的索引 */
  answer: number
  /** 答题前可查看的提示 */
  hint: string
  /** 答题后的讲解 */
  explanation: string
}

export interface CognitiveQuiz {
  /** 第 1 题记忆阶段展示的三个词语 */
  memoryWords: string[]
  /** 第 2-5 题选择题 */
  questions: QuizQuestion[]
}

export const cognitiveQuiz: CognitiveQuiz = {
  memoryWords: ['桂花', '蓑衣', '水井'],
  questions: [
    {
      id: 2,
      question: '刚才让你记住的三个词里，哪个是可以吃的？',
      options: ['蓑衣', '桂花', '水井', '锄头'],
      answer: 1,
      hint: '想想它的味道，甜丝丝的，是秋天开的花。',
      explanation: '桂花可以食用，常被做成桂花糕、桂花糖。',
    },
    {
      id: 3,
      question: '下面哪个词刚才没有出现在记忆列表里？',
      options: ['桂花', '蓑衣', '水井', '纺车'],
      answer: 3,
      hint: '回忆一下，三个词分别和花、雨、水有关。',
      explanation: '记忆词是桂花、蓑衣、水井，纺车没有出现过。',
    },
    {
      id: 4,
      question: '蓑衣在下雨天的作用，相当于现在的什么？',
      options: ['棉袄', '雨衣', '草帽', '斗笠'],
      answer: 1,
      hint: '蓑衣是用棕毛或草编的，挡雨用的。',
      explanation: '蓑衣是古人挡雨的衣物，作用相当于现在的雨衣。',
    },
    {
      id: 5,
      question: '村东头的老槐树比水井高，水井又比石碾子高，哪个最高？',
      options: ['水井', '石碾子', '老槐树', '一样高'],
      answer: 2,
      hint: '把三个东西从高到矮排一排。',
      explanation: '老槐树 > 水井 > 石碾子，所以老槐树最高。',
    },
  ],
}

/* ============================================
   本周认知趋势（7 天）
   ============================================ */
export interface HealthTrendPoint {
  /** 星期，如“周一” */
  day: string
  /** 认知得分 70-100 */
  value: number
}

export const healthTrend: HealthTrendPoint[] = [
  { day: '周一', value: 88 },
  { day: '周二', value: 85 },
  { day: '周三', value: 90 },
  { day: '周四', value: 82 },
  { day: '周五', value: 86 },
  { day: '周六', value: 92 },
  { day: '周日', value: 89 },
]

/* ============================================
   健康提醒
   ============================================ */
export type HealthAlertLevel = 'warning' | 'info' | 'success'

export interface HealthAlert {
  id: number
  level: HealthAlertLevel
  title: string
  desc: string
  time: string
}

export const healthAlerts: HealthAlert[] = [
  {
    id: 1,
    level: 'warning',
    title: '本周认知分数略有下降',
    desc: '相比上周平均分下降了 3 分，建议适当增加每日小测的频次。',
    time: '今天 09:00',
  },
  {
    id: 2,
    level: 'info',
    title: '该吃降压药啦',
    desc: '今天下午的降压药还没有记录，记得提醒老人按时服药。',
    time: '今天 14:00',
  },
  {
    id: 3,
    level: 'success',
    title: '连续 5 天完成小测',
    desc: '坚持得很好！规律的认知训练有助于延缓记忆衰退。',
    time: '昨天 20:00',
  },
]

/* ============================================
   邻里互助看护板
   ============================================ */
export interface NeighborHelp {
  id: number
  title: string
  desc: string
  /** 发帖人 */
  author: string
  time: string
  /** 是否已处理 */
  resolved: boolean
}

export const neighborHelps: NeighborHelp[] = [
  {
    id: 1,
    title: '帮李奶奶取个快递',
    desc: '李奶奶腿脚不便，快递在村口驿站，哪位邻居顺路帮忙取一下？',
    author: '李奶奶的女儿',
    time: '1 小时前',
    resolved: false,
  },
  {
    id: 2,
    title: '陪张大爷去镇上医院',
    desc: '周三上午要复查血压，需要有年轻人陪同坐车前往。',
    author: '村委会',
    time: '3 小时前',
    resolved: true,
  },
  {
    id: 3,
    title: '教王阿姨用手机视频',
    desc: '想和在外地的孙子视频通话，但不会操作微信，求帮忙。',
    author: '王阿姨',
    time: '昨天',
    resolved: false,
  },
  {
    id: 4,
    title: '帮赵大伯修一下院门',
    desc: '院门合页松了关不严，手头没有工具，希望有人搭把手。',
    author: '赵大伯',
    time: '前天',
    resolved: false,
  },
]

/* ============================================
   记忆地图照片
   ============================================ */
export interface MemoryPhoto {
  id: number
  title: string
  year: string
  x: number
  y: number
  place: string
  story: string
  hasComparison: boolean
  oldDesc: string
  newDesc: string
  image: string
}

export const memoryPhotos: MemoryPhoto[] = [
  { id: 1, title: '老厂区大门', year: '1985', x: 25, y: 30, place: '北京石景山区', story: '那是父亲上班的地方，每天早上6点出门，骑着二八大杠穿过这条街。厂门口的白杨树比我还高。', hasComparison: true, oldDesc: '红砖大门，门前种着两排白杨', newDesc: '已改建成创意产业园', image: '/assets/memory-1.jpg' },
  { id: 2, title: '老宅胡同口', year: '1978', x: 55, y: 45, place: '北京西城区', story: '小时候在胡同口跳皮筋，隔壁王大妈总喊我回家吃饭。那年冬天的雪特别大。', hasComparison: true, oldDesc: '灰砖胡同，青石板路', newDesc: '已拆迁变成宽阔马路', image: '/assets/memory-2.jpg' },
  { id: 3, title: '村口供销社', year: '1980', x: 70, y: 60, place: '北京朝阳区', story: '供销社里永远有一股煤油和糖果混合的味道。一分钱两块水果糖，过年才能买。', hasComparison: false, oldDesc: '', newDesc: '', image: '/assets/memory-3.jpg' },
  { id: 4, title: '子弟学校', year: '1983', x: 40, y: 70, place: '北京海淀区', story: '厂矿子弟学校，一个班40个人都是同事家的孩子。班主任李老师特别严厉。', hasComparison: true, oldDesc: '三层红砖教学楼', newDesc: '原址新建现代化小学', image: '/assets/memory-4.jpg' },
  { id: 5, title: '老火车站', year: '1975', x: 80, y: 25, place: '北京丰台区', story: '绿皮火车慢悠悠的，从这坐到城里要两个小时。站台上永远有人扛着大包小包。', hasComparison: false, oldDesc: '', newDesc: '', image: '/assets/memory-5.jpg' },
]

export interface MemoryTimelineItem {
  year: string
  event: string
  desc: string
  place: string
}

export const memoryTimeline: MemoryTimelineItem[] = [
  { year: '1965', event: '出生', desc: '出生在北京石景山老厂区家属院', place: '石景山' },
  { year: '1972', event: '上学', desc: '在厂矿子弟学校读一年级，班主任是李老师', place: '石景山' },
  { year: '1980', event: '初中', desc: '考入区重点中学，开始骑自行车上学', place: '海淀' },
  { year: '1985', event: '工作', desc: '接父亲的班进厂，分配到机加工车间', place: '石景山' },
  { year: '1995', event: '搬家', desc: '厂区拆迁，搬到海淀新建小区', place: '海淀' },
  { year: '2020', event: '故地重游', desc: '老厂区变成创意园，胡同也变成了大马路', place: '石景山' },
]

/* ============================================
   故人寻踪
   ============================================ */
export interface MatchResult {
  id: number
  nickname: string
  matchScore: number
  commonGround: string[]
  era: string
  place: string
  verified: boolean
  avatar: string
  detail: string
}

export const matchResults: MatchResult[] = [
  { id: 1, nickname: '老张头', matchScore: 92, commonGround: ['石景山老厂区', '1980年代', '钢花子弟学校'], era: '1980年代', place: '北京石景山', verified: false, avatar: '/assets/avatar-1.jpg', detail: '曾在首钢工作，1985年搬到海淀区，退休后喜欢钓鱼' },
  { id: 2, nickname: '王秀兰', matchScore: 85, commonGround: ['胡同口跳皮筋', '供销社买糖', '子弟学校'], era: '1970年代', place: '北京西城', verified: false, avatar: '/assets/avatar-2.jpg', detail: '当年胡同的邻居，后来搬到了朝阳区，现在做社区志愿者' },
  { id: 3, nickname: '李铁柱', matchScore: 78, commonGround: ['绿皮火车', '丰台火车站', '1975年'], era: '1970年代', place: '北京丰台', verified: false, avatar: '/assets/avatar-3.jpg', detail: '火车站附近长大的，后来去了南方做生意，近年回到北京' },
]

export interface VerifyQuestion {
  question: string
  options: string[]
  answer: number
  hint: string
}

export const verifyQuestions: VerifyQuestion[] = [
  { question: '你们当年学校旁边有什么？', options: ['一棵大槐树', '一条小河', '一座桥', '一个操场'], answer: 0, hint: '大家放学后总在树下乘凉' },
  { question: '你们班主任姓什么？', options: ['李', '王', '张', '赵'], answer: 0, hint: '和李老师同姓的老师不多' },
  { question: '你们厂区门口种的是什么树？', options: ['白杨树', '柳树', '槐树', '银杏树'], answer: 0, hint: '秋天落叶最早的那种' },
]

export interface ReunionMessage {
  sender: 'self' | 'other'
  text: string
  time: string
}

export const reunionMessages: ReunionMessage[] = [
  { sender: 'other', text: '是你吗？这么多年了…', time: '14:30' },
  { sender: 'self', text: '是我啊！老张头！你还记得当年在厂门口等我下班吗？', time: '14:31' },
  { sender: 'other', text: '当然记得！那时候天天骑自行车经过那条白杨树大街。', time: '14:32' },
]
