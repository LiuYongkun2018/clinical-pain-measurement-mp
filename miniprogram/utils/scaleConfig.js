// 量表数据配置文件
// SAS (焦虑自评量表) 和 SDS (抑郁自评量表)

// SAS 焦虑自评量表配置
const SAS_CONFIG = {
  type: 'SAS',
  title: '焦虑自评量表',
  subtitle: 'Self-Rating Anxiety Scale',
  description: '该量表由Zung于1971年编制，用于评估焦虑症状严重程度。请根据您过去一周的实际感受作答。',
  // 反向计分题目（题目编号从1开始）
  reverseItems: [5, 9, 13, 17, 19],
  // 选项配置
  options: [
    { value: 1, label: '没有或很少时间' },
    { value: 2, label: '小部分时间' },
    { value: 3, label: '相当多时间' },
    { value: 4, label: '绝大部分时间' }
  ],
  // 题目列表
  questions: [
    { id: 1, text: '我觉得比平常容易紧张和着急', dimension: '焦虑' },
    { id: 2, text: '我无缘无故地感到害怕', dimension: '害怕' },
    { id: 3, text: '我容易心里烦乱或觉得惊恐', dimension: '惊恐' },
    { id: 4, text: '我觉得我可能将要发疯', dimension: '发疯感' },
    { id: 5, text: '我觉得一切都很好，也不会发生什么不幸', dimension: '不幸预感' },
    { id: 6, text: '我手脚发抖打颤', dimension: '手足颤抖' },
    { id: 7, text: '我因为头痛、颈痛和背痛而苦恼', dimension: '躯体疼痛' },
    { id: 8, text: '我感觉容易衰弱和疲乏', dimension: '乏力' },
    { id: 9, text: '我觉得心平气和，并且容易安静坐着', dimension: '静坐不能' },
    { id: 10, text: '我觉得心跳得很快', dimension: '心悸' },
    { id: 11, text: '我因为一阵阵头晕而苦恼', dimension: '头昏' },
    { id: 12, text: '我有晕倒发作，或觉得要晕倒似的', dimension: '晕厥感' },
    { id: 13, text: '我呼气吸气都感到很容易', dimension: '呼吸困难' },
    { id: 14, text: '我手脚麻木和刺痛', dimension: '手足刺痛' },
    { id: 15, text: '我因为胃痛和消化不良而苦恼', dimension: '消化不良' },
    { id: 16, text: '我常常要小便', dimension: '尿意频数' },
    { id: 17, text: '我的手常常是干燥温暖的', dimension: '多汗' },
    { id: 18, text: '我脸红发热', dimension: '面部潮红' },
    { id: 19, text: '我容易入睡并且一夜睡得很好', dimension: '睡眠障碍' },
    { id: 20, text: '我做恶梦', dimension: '恶梦' }
  ],
  // 结果解释
  interpretation: {
    normal: { min: 0, max: 49, label: '正常', description: '您的焦虑水平在正常范围内' },
    mild: { min: 50, max: 59, label: '轻度焦虑', description: '存在轻度焦虑症状' },
    moderate: { min: 60, max: 69, label: '中度焦虑', description: '存在中度焦虑症状' },
    severe: { min: 70, max: 100, label: '重度焦虑', description: '存在重度焦虑症状' }
  }
};

// SDS 抑郁自评量表配置
const SDS_CONFIG = {
  type: 'SDS',
  title: '抑郁自评量表',
  subtitle: 'Self-Rating Depression Scale',
  description: '该量表由Zung于1965年编制，用于评估抑郁症状严重程度。请根据您过去一周的实际感受作答。',
  // 反向计分题目（题目编号从1开始）
  reverseItems: [2, 5, 6, 11, 12, 14, 16, 17, 18, 20],
  // 选项配置
  options: [
    { value: 1, label: '没有或很少时间' },
    { value: 2, label: '小部分时间' },
    { value: 3, label: '相当多时间' },
    { value: 4, label: '绝大部分时间' }
  ],
  // 题目列表
  questions: [
    { id: 1, text: '我觉得闷闷不乐，情绪低沉', dimension: '抑郁心境' },
    { id: 2, text: '我觉得一天之中早晨最好', dimension: '晨重晚轻' },
    { id: 3, text: '我一阵阵哭出来或觉得想哭', dimension: '哭泣' },
    { id: 4, text: '我晚上睡眠不好', dimension: '睡眠障碍' },
    { id: 5, text: '我吃得跟平常一样多', dimension: '食欲减退' },
    { id: 6, text: '我与异性密切接触时和以往一样感到愉快', dimension: '性兴趣减退' },
    { id: 7, text: '我发觉我的体重在下降', dimension: '体重减轻' },
    { id: 8, text: '我有便秘的苦恼', dimension: '便秘' },
    { id: 9, text: '我心跳比平时快', dimension: '心悸' },
    { id: 10, text: '我无缘无故地感到疲乏', dimension: '易疲劳' },
    { id: 11, text: '我的头脑跟平常一样清楚', dimension: '思考困难' },
    { id: 12, text: '我觉得经常做的事情并没有困难', dimension: '能力减退' },
    { id: 13, text: '我觉得不安而平静不下来', dimension: '不安' },
    { id: 14, text: '我对将来抱有希望', dimension: '绝望' },
    { id: 15, text: '我比平常容易生气激动', dimension: '易激惹' },
    { id: 16, text: '我觉得作出决定是容易的', dimension: '决断困难' },
    { id: 17, text: '我觉得自己是个有用的人，有人需要我', dimension: '无用感' },
    { id: 18, text: '我的生活过得很有意思', dimension: '生活空虚感' },
    { id: 19, text: '我认为如果我死了别人会生活得好些', dimension: '无价值感' },
    { id: 20, text: '平常感兴趣的事我仍然照样感兴趣', dimension: '兴趣丧失' }
  ],
  // 结果解释
  interpretation: {
    normal: { min: 0, max: 52, label: '正常', description: '您的抑郁水平在正常范围内' },
    mild: { min: 53, max: 62, label: '轻度抑郁', description: '存在轻度抑郁症状' },
    moderate: { min: 63, max: 72, label: '中度抑郁', description: '存在中度抑郁症状' },
    severe: { min: 73, max: 100, label: '重度抑郁', description: '存在重度抑郁症状' }
  }
};

module.exports = {
  SAS_CONFIG,
  SDS_CONFIG
};
