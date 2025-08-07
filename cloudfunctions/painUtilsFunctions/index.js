// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 初始化数据库
const db = cloud.database()

// 云函数入口函数
exports.main = async (event) => {
  try {
    const wxContext = cloud.getWXContext()
    // 向 PatientsInfo 集合添加新记录
    const result = await db.collection('PatientsInfo').add({
      data: {
        paintsId: event.paintsId,                    // 患者ID
        paintName: event.paintName,                 // 患者姓名
        painLevelDescriptions: event.painLevelDescriptions, // 疼痛等级描述
      }
    })
    
    return {
      success: true,
      message: '数据添加成功',
      data: result,
      openid: wxContext.OPENID
    }
  } catch (err) {
    return {
      success: false,
      message: '数据添加失败',
      error: err.message
    }
  }
}