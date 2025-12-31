// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const { code, userInfo } = event;
  const wxContext = cloud.getWXContext();

  try {
    // 检查用户是否已存在
    const userRecord = await db.collection('users').where({
      openid: wxContext.OPENID
    }).get();

    if (userRecord.data.length === 0) {
      // 新用户：写入数据库
      await db.collection('users').add({
        data: {
          openid: wxContext.OPENID,
          ...userInfo,
          createdAt: db.serverDate()
        }
      });
    } else {
      // 老用户：更新信息（可选）
      await db.collection('users').doc(userRecord.data[0]._id).update({
        data: {
          ...userInfo,
          updatedAt: db.serverDate()
        }
      });
    }

    return {
      openid: wxContext.OPENID,
      userInfo
    };
  } catch (err) {
    console.error('数据库操作失败', err);
    throw err;
  }
};