/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
}

const PcLampLogAction = <Action>{
    router: {
        path: '/lamp/log',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ipms_iot_lamp_log')
            .leftJoin('ipms_iot_lamp_line', 'ipms_iot_lamp_line.id', 'ipms_iot_lamp_log.lamp_line_id')
            .leftJoin('ipms_iot_lamp', 'ipms_iot_lamp.id', 'ipms_iot_lamp_line.lamp_id')
            .where('ipms_iot_lamp.community_id', community_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_iot_lamp_log.id'))
            .select(
                'ipms_iot_lamp_log.id',
                'ipms_iot_lamp_log.off',
                'ipms_iot_lamp_log.created_at',
                'ipms_iot_lamp_line.name as line',
                'ipms_iot_lamp.name as lamp'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_iot_lamp_log.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        ctx.body = {
            code: SUCCESS,
            data: {
                list,
                total: res.total,
                page_amount: Math.ceil(res.total / page_size),
                page_num,
                page_size
            }
        };
    }
};

export default PcLampLogAction;
