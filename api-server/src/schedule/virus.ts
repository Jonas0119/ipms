/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import kjhlog from '~/utils/kjhlog';

import schedule from 'node-schedule';
import moment from 'moment';
import Knex from 'knex';
import axios from 'axios';
import config from '~/config';
import { VIRUS_JOB } from '~/constant/schedule';
import { TRUE, FALSE } from '~/constant/status';

async function getVirusData() {
    const model = Knex({
        client: 'mysql',
        connection: config.mysqlConfig
    });

    kjhlog.info('开始更新新冠病毒数据');

    const created_at = moment()
        .startOf('hour')
        .valueOf();
    const jobDone = await model
        .from('ejyy_schedule')
        .where('created_at', created_at)
        .where('job', VIRUS_JOB)
        .first();

    if (jobDone) {
        return kjhlog.info('已有进程更新，任务忽略');
    }

    await model.from('ejyy_schedule').insert({
        job: VIRUS_JOB,
        created_at
    });

    const netRes = await axios.request({
        url: 'https://c.m.163.com/ug/api/wuhan/app/data/list-total',
        method: 'GET'
    });

    if (netRes.status !== 200 || netRes.data.code !== 10000) {
        kjhlog.error('更新新冠病毒数据失败');

        await model.from('ejyy_virus').insert({
            success: FALSE,
            created_at
        });
    } else {
        kjhlog.success('更新新冠病毒数据成功');

        await model.from('ejyy_virus').insert({
            success: TRUE,
            content: JSON.stringify({
                ...netRes.data.data.chinaTotal,
                lastUpdateTime: netRes.data.data.lastUpdateTime
            }),
            created_at
        });
    }
}

export default () => {
    schedule.scheduleJob('0 15 */4 * * *', () => {
        getVirusData();
    });
};
