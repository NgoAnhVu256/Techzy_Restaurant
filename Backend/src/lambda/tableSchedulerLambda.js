/**
 * AWS Lambda Handler cho Table Scheduler
 * Thay thế cho node-cron khi deploy lên AWS
 */

const { updateTablesBeforeMealTime, releaseTablesAfterMealTime } = require('../jobs/tableScheduler');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

exports.handler = async (event, context) => {
  // Đảm bảo context lambda không đợi event loop rỗng
  context.callbackWaitsForEmptyEventLoop = false;

  logger.info('🚀 Bắt đầu chạy Lambda Table Scheduler', {
    requestId: context.awsRequestId,
    time: new Date().toISOString()
  });

  try {
    // 1. Kết nối DB (nếu chưa có)
    try {
      await sequelize.authenticate();
      logger.info('✅ Kết nối Database thành công');
    } catch (dbError) {
      logger.error('❌ Lỗi kết nối Database', dbError);
      throw dbError;
    }

    // 2. Chạy logic
    // Chạy song song cả 2 task
    await Promise.all([
      updateTablesBeforeMealTime(),
      releaseTablesAfterMealTime()
    ]);

    logger.info('✅ Hoàn tất Lambda Table Scheduler');
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Table Scheduler executed successfully',
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    logger.error('❌ Lambda execution failed', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error.message
      }),
    };
  }
};
