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

const PcLampLineListAction = <Action>{
    router: {
        path: '/lamp/line_list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZHZM],
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
            .from('ipms_iot_lamp_line')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_iot_lamp_line.created_by')
            .leftJoin('ipms_iot_lamp', 'ipms_iot_lamp.id', 'ipms_iot_lamp_line.lamp_id')
            .where('ipms_iot_lamp.community_id', community_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_iot_lamp_line.id'))
            .select(
                'ipms_iot_lamp_line.id',
                'ipms_iot_lamp_line.name',
                'ipms_iot_lamp_line.port',
                'ipms_iot_lamp_line.off',
                'ipms_iot_lamp_line.lamp_id',
                'ipms_iot_lamp_line.created_by',
                'ipms_iot_lamp_line.created_at',
                'ipms_property_company_user.real_name',
                'ipms_iot_lamp.name as lamp'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_iot_lamp_line.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        let i = 0;
        for (const line of list) {
            const work_mode = await ctx.model
                .from('ipms_iot_lamp_work_mode')
                .where('lamp_line_id', line.id)
                .select('name', 'start_time', 'end_time');

            list[i].work_mode = work_mode;
            i++;
        }

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

export default PcLampLineListAction;
