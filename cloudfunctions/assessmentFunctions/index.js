// 云函数入口文件 - 评估数据管理
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action, data } = event

  try {
    switch (action) {
      // 保存疼痛评估(NRS)
      case 'savePainAssessment':
        return await savePainAssessment(openid, data)
      
      // 保存心理量表评估(SAS/SDS)
      case 'saveScaleAssessment':
        return await saveScaleAssessment(openid, data)
      
      // 获取用户评估历史
      case 'getAssessmentHistory':
        return await getAssessmentHistory(openid, data)
      
      // 获取最近一次评估
      case 'getLatestAssessment':
        return await getLatestAssessment(openid, data)
      
      // 获取评估统计
      case 'getAssessmentStats':
        return await getAssessmentStats(openid, data)
      
      default:
        return {
          success: false,
          message: '未知操作类型'
        }
    }
  } catch (err) {
    console.error('云函数执行错误:', err)
    return {
      success: false,
      message: '操作失败',
      error: err.message
    }
  }
}

// 保存疼痛评估(NRS)
async function savePainAssessment(openid, data) {
  const record = {
    _openid: openid,
    type: 'pain_nrs',
    painLevel: data.painLevel,
    painDescription: data.painDescription,
    area: data.area,
    duration: data.duration,
    factor: data.factor,
    qualities: data.qualities || [],
    emotions: data.emotions || {},
    timestamp: db.serverDate(),
    createTime: new Date().toISOString(),
    date: new Date().toDateString()
  }

  const result = await db.collection('assessments').add({
    data: record
  })

  return {
    success: true,
    message: '疼痛评估保存成功',
    data: {
      _id: result._id,
      ...record
    }
  }
}

// 保存心理量表评估(SAS/SDS)
async function saveScaleAssessment(openid, data) {
  const record = {
    _openid: openid,
    type: data.scaleType.toLowerCase(), // 'sas' 或 'sds'
    scaleType: data.scaleType,
    rawScore: data.rawScore,
    standardScore: data.standardScore,
    level: data.level,
    levelClass: data.levelClass,
    answers: data.answers || {},
    totalQuestions: data.totalQuestions,
    timestamp: db.serverDate(),
    createTime: new Date().toISOString(),
    completedAt: data.completedAt
  }

  const result = await db.collection('assessments').add({
    data: record
  })

  // 更新用户统计数据
  await updateUserStats(openid, data.scaleType)

  return {
    success: true,
    message: `${data.scaleType === 'SAS' ? '焦虑' : '抑郁'}自评保存成功`,
    data: {
      _id: result._id,
      ...record
    }
  }
}

// 更新用户统计数据
async function updateUserStats(openid, scaleType) {
  const statsCollection = db.collection('userStats')
  
  try {
    // 查找现有统计记录
    const existingStats = await statsCollection.where({
      _openid: openid
    }).get()

    if (existingStats.data.length > 0) {
      // 更新现有记录
      await statsCollection.where({
        _openid: openid
      }).update({
        data: {
          [`${scaleType.toLowerCase()}Count`]: _.inc(1),
          lastAssessmentTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })
    } else {
      // 创建新记录
      await statsCollection.add({
        data: {
          _openid: openid,
          sasCount: scaleType === 'SAS' ? 1 : 0,
          sdsCount: scaleType === 'SDS' ? 1 : 0,
          painCount: 0,
          lastAssessmentTime: db.serverDate(),
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })
    }
  } catch (err) {
    console.error('更新用户统计失败:', err)
  }
}

// 获取用户评估历史
async function getAssessmentHistory(openid, data) {
  const { type, limit = 20, skip = 0 } = data || {}
  
  let query = db.collection('assessments').where({
    _openid: openid
  })

  // 按类型筛选
  if (type) {
    query = query.where({
      type: type
    })
  }

  const result = await query
    .orderBy('timestamp', 'desc')
    .skip(skip)
    .limit(limit)
    .get()

  return {
    success: true,
    data: result.data,
    total: result.data.length
  }
}

// 获取最近一次评估
async function getLatestAssessment(openid, data) {
  const { type } = data || {}
  
  let query = db.collection('assessments').where({
    _openid: openid
  })

  if (type) {
    query = query.where({
      type: type
    })
  }

  const result = await query
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get()

  return {
    success: true,
    data: result.data[0] || null
  }
}

// 获取评估统计
async function getAssessmentStats(openid, data) {
  const { days = 30 } = data || {}
  
  // 计算起始日期
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // 获取各类型评估数量
  const assessments = await db.collection('assessments').where({
    _openid: openid,
    timestamp: _.gte(startDate)
  }).get()

  // 统计各类型数量
  const stats = {
    total: assessments.data.length,
    pain_nrs: 0,
    sas: 0,
    sds: 0,
    recentScores: {
      pain: [],
      sas: [],
      sds: []
    }
  }

  assessments.data.forEach(item => {
    if (item.type === 'pain_nrs') {
      stats.pain_nrs++
      stats.recentScores.pain.push({
        score: item.painLevel,
        date: item.createTime
      })
    } else if (item.type === 'sas') {
      stats.sas++
      stats.recentScores.sas.push({
        score: item.standardScore,
        level: item.level,
        date: item.createTime
      })
    } else if (item.type === 'sds') {
      stats.sds++
      stats.recentScores.sds.push({
        score: item.standardScore,
        level: item.level,
        date: item.createTime
      })
    }
  })

  return {
    success: true,
    data: stats
  }
}
