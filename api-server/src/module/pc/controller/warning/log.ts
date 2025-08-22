/**
 * +----------------------------------------------------------------------
 * | 开源物业管理系统，敬请使用
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    page_num: number;
    page_size: number;
}

const PcWarningLogAction = <Action>{
    router: {
        path: '/warning/log',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ipms_iot_warning_log')
            .leftJoin('ipms_iot_warning', 'ipms_iot_warning.id', 'ipms_iot_warning_log.warning_id')
            .leftJoin('ipms_building_info', 'ipms_building_info.id', 'ipms_iot_warning_log.building_id')
            .where('ipms_iot_warning.community_id', community_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_iot_warning_log.id'))
            .select(
                'ipms_iot_warning_log.id',
                'ipms_iot_warning_log.category',
                'ipms_iot_warning_log.building_id',
                'ipms_iot_warning_log.created_at',
                'ipms_iot_warning.name as warning',
                'ipms_building_info.type',
                'ipms_building_info.area',
                'ipms_building_info.building',
                'ipms_building_info.unit',
                'ipms_building_info.number'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_iot_warning_log.id', 'desc');

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

export default PcWarningLogAction;
