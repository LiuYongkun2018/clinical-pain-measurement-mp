// components/scale-questionnaire/index.js
// 通用量表测评组件 - 支持 SAS/SDS 等标准心理量表

Component({
  properties: {
    // 量表类型: 'SAS' | 'SDS'
    scaleType: {
      type: String,
      value: 'SAS'
    },
    // 量表标题
    title: {
      type: String,
      value: ''
    },
    // 量表说明
    description: {
      type: String,
      value: ''
    },
    // 题目列表
    questions: {
      type: Array,
      value: []
    },
    // 选项配置
    options: {
      type: Array,
      value: [
        { value: 1, label: '没有或很少时间' },
        { value: 2, label: '小部分时间' },
        { value: 3, label: '相当多时间' },
        { value: 4, label: '绝大部分时间' }
      ]
    },
    // 反向计分题目索引（从1开始）
    reverseItems: {
      type: Array,
      value: []
    }
  },

  data: {
    currentIndex: 0,        // 当前题目索引
    answers: {},            // 用户答案 {questionIndex: score}
    isCompleted: false,     // 是否完成
    showResult: false,      // 是否显示结果
    result: null,           // 测评结果
    progress: 0,            // 进度百分比
    animating: false,       // 动画状态
    unansweredCount: 0      // 未完成题目数
  },

  lifetimes: {
    attached() {
      this.initAnswers();
    }
  },

  observers: {
    'questions': function(questions) {
      if (questions && questions.length > 0) {
        this.initAnswers();
      }
    }
  },

  methods: {
    // 初始化答案对象
    initAnswers() {
      const answers = {};
      this.data.questions.forEach((_, index) => {
        answers[index] = null;
      });
      this.setData({ 
        answers,
        currentIndex: 0,
        isCompleted: false,
        showResult: false,
        result: null,
        progress: 0
      });
    },

    // 选择答案
    selectAnswer(e) {
      const { value } = e.currentTarget.dataset;
      const { currentIndex, answers, questions } = this.data;
      
      // 更新答案
      const newAnswers = { ...answers };
      newAnswers[currentIndex] = value;
      
      // 计算进度
      const answeredCount = Object.values(newAnswers).filter(v => v !== null).length;
      const progress = Math.round((answeredCount / questions.length) * 100);
      
      this.setData({
        answers: newAnswers,
        progress,
        animating: true
      });

      // 震动反馈
      wx.vibrateShort({ type: 'light' });

      // 延迟自动跳转下一题
      setTimeout(() => {
        this.setData({ animating: false });
        if (currentIndex < questions.length - 1) {
          this.nextQuestion();
        } else {
          // 检查是否全部完成
          this.checkCompletion();
        }
      }, 300);
    },

    // 下一题
    nextQuestion() {
      const { currentIndex, questions } = this.data;
      if (currentIndex < questions.length - 1) {
        this.setData({
          currentIndex: currentIndex + 1
        });
      }
    },

    // 上一题
    prevQuestion() {
      const { currentIndex } = this.data;
      if (currentIndex > 0) {
        this.setData({
          currentIndex: currentIndex - 1
        });
      }
    },

    // 跳转到指定题目
    goToQuestion(e) {
      const { index } = e.currentTarget.dataset;
      this.setData({
        currentIndex: index
      });
    },

    // 检查是否完成
    checkCompletion() {
      const { answers, questions } = this.data;
      const answeredCount = Object.values(answers).filter(v => v !== null).length;
      const isCompleted = answeredCount === questions.length;
      const unansweredCount = questions.length - answeredCount;
      
      this.setData({ 
        isCompleted,
        unansweredCount 
      });
      
      if (isCompleted) {
        // 自动计算结果
        this.calculateResult();
      }
    },

    // 计算结果
    calculateResult() {
      const { answers, questions, reverseItems, scaleType } = this.data;
      
      // 计算原始分
      let rawScore = 0;
      questions.forEach((_, index) => {
        const answer = answers[index];
        if (answer !== null) {
          // 检查是否为反向计分题（题目序号从1开始）
          const isReverse = reverseItems.includes(index + 1);
          if (isReverse) {
            // 反向计分: 4->1, 3->2, 2->3, 1->4
            rawScore += (5 - answer);
          } else {
            rawScore += answer;
          }
        }
      });

      // 计算标准分 = 原始分 × 1.25
      const standardScore = Math.floor(rawScore * 1.25);

      // 根据量表类型判断结果
      let level = '';
      let levelClass = '';
      let suggestion = '';

      if (scaleType === 'SAS') {
        // SAS 焦虑自评量表评分标准
        if (standardScore < 50) {
          level = '正常';
          levelClass = 'normal';
          suggestion = '您的焦虑水平在正常范围内，请继续保持良好的心理状态。';
        } else if (standardScore < 60) {
          level = '轻度焦虑';
          levelClass = 'mild';
          suggestion = '您存在轻度焦虑症状，建议通过放松训练、规律运动等方式缓解压力。如症状持续，建议咨询专业人士。';
        } else if (standardScore < 70) {
          level = '中度焦虑';
          levelClass = 'moderate';
          suggestion = '您存在中度焦虑症状，建议及时寻求专业心理咨询或医疗帮助，配合药物或心理治疗。';
        } else {
          level = '重度焦虑';
          levelClass = 'severe';
          suggestion = '您存在重度焦虑症状，请务必及时就医，接受专业的心理治疗或药物治疗。';
        }
      } else if (scaleType === 'SDS') {
        // SDS 抑郁自评量表评分标准
        if (standardScore < 53) {
          level = '正常';
          levelClass = 'normal';
          suggestion = '您的抑郁水平在正常范围内，请继续保持良好的心理状态。';
        } else if (standardScore < 63) {
          level = '轻度抑郁';
          levelClass = 'mild';
          suggestion = '您存在轻度抑郁症状，建议增加社交活动、保持规律作息、适当运动。如症状持续，建议咨询专业人士。';
        } else if (standardScore < 73) {
          level = '中度抑郁';
          levelClass = 'moderate';
          suggestion = '您存在中度抑郁症状，建议及时寻求专业心理咨询或医疗帮助，配合药物或心理治疗。';
        } else {
          level = '重度抑郁';
          levelClass = 'severe';
          suggestion = '您存在重度抑郁症状，请务必及时就医，接受专业的心理治疗或药物治疗。';
        }
      }

      const result = {
        scaleType,
        rawScore,
        standardScore,
        level,
        levelClass,
        suggestion,
        totalQuestions: questions.length,
        completedAt: new Date().toISOString()
      };

      this.setData({
        result,
        showResult: true
      });

      // 触发完成事件
      this.triggerEvent('complete', result);
    },

    // 重新测评
    restart() {
      this.initAnswers();
    },

    // 查看详情
    viewDetails() {
      this.triggerEvent('viewDetails', this.data.result);
    },

    // 保存结果
    saveResult() {
      this.triggerEvent('save', {
        result: this.data.result,
        answers: this.data.answers
      });
    }
  }
});
