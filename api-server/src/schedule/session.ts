/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import kjhlog from '~/utils/kjhlog';

import schedule from 'node-schedule';
import moment from 'moment';
import Knex from 'knex';
import config from '~/config';
import { SESSION_JOB } from '~/constant/schedule';

export default () => {
    schedule.scheduleJob('0 30 * * * *', async () => {
        const model = Knex({
            client: 'mysql',
            connection: config.mysqlConfig
        });

        kjhlog.info('开始清理session store');

        const created_at = moment()
            .startOf('hour')
            .valueOf();
        const jobDone = await model
            .from('ejyy_schedule')
            .where('created_at', created_at)
            .where('job', SESSION_JOB)
            .first();

        if (jobDone) {
            return kjhlog.info('已有进程清理，任务忽略');
        }

        await model.from('ejyy_schedule').insert({
            job: SESSION_JOB,
            created_at
        });

        await model
            .from('ejyy_session_store')
            .where('expire', '<', Date.now())
            .delete();

        kjhlog.success('清理session store 完成');
    });
};
