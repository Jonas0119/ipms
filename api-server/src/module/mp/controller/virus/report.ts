/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { TRUE } from '~/constant/status';

// 新版废弃，移动到home main下
const MpVirusReportAction = <Action>{
    router: {
        path: '/virus/report',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },

    response: async ctx => {
        const record = await ctx.model
            .from('ejyy_virus')
            .where('success', TRUE)
            .orderBy('id', 'desc')
            .first();

        ctx.body = {
            code: SUCCESS,
            data: record.content
        };
    }
};

export default MpVirusReportAction;
