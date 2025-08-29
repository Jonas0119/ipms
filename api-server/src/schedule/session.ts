/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

// 导入日志工具
import kjhlog from '~/utils/kjhlog';

// 导入定时任务调度器
import schedule from 'node-schedule';
// 导入时间处理库
import moment from 'moment';
// 导入数据库查询构建器
import Knex from 'knex';
// 导入配置文件
import config from '~/config';
// 导入定时任务常量
import { SESSION_JOB } from '~/constant/schedule';

/**
 * Session清理定时任务
 * 每小时的30分钟执行一次，清理过期的session记录
 */
export default () => {
    // 设置定时任务：每小时的30分钟执行（秒 分 时 日 月 星期）
    schedule.scheduleJob('0 30 * * * *', async () => {
        // 创建数据库连接实例
        const model = Knex({
            client: 'mysql',
            connection: config.mysqlConfig
        });

        kjhlog.info('开始清理session store');

        // 获取当前小时的开始时间戳，用于防止重复执行
        const created_at = moment()
            .startOf('hour')
            .valueOf();
            
        // 检查当前小时是否已经有清理任务执行过
        const jobDone = await model
            .from('ipms_schedule')
            .where('created_at', created_at)
            .where('job', SESSION_JOB)
            .first();

        // 如果已经有任务执行过，则跳过本次清理
        if (jobDone) {
            return kjhlog.info('已有进程清理，任务忽略');
        }

        // 记录本次清理任务的执行标记，防止重复执行
        await model.from('ipms_schedule').insert({
            job: SESSION_JOB,
            created_at
        });

        // 删除已过期的session记录（expire字段小于当前时间戳）
        await model
            .from('ipms_session_store')
            .where('expire', '<', Date.now())
            .delete();

        kjhlog.success('清理session store 完成');
    });
};
