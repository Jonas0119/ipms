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

const PcElevatorListAction = <Action>{
    router: {
        path: '/elevator/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZNTK],
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
            .from('ipms_iot_elevator')
            .leftJoin('ipms_property_company_user', 'ipms_property_company_user.id', 'ipms_iot_elevator.created_by')
            .where('ipms_iot_elevator.community_id', community_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ipms_iot_elevator.id'))
            .select(
                'ipms_iot_elevator.id',
                'ipms_iot_elevator.community_id',
                'ipms_iot_elevator.sign',
                'ipms_iot_elevator.secret',
                'ipms_iot_elevator.name',
                'ipms_iot_elevator.building',
                'ipms_iot_elevator.category',
                'ipms_iot_elevator.online',
                'ipms_iot_elevator.verify_property_fee',
                'ipms_iot_elevator.lng',
                'ipms_iot_elevator.lat',
                'ipms_iot_elevator.created_by',
                'ipms_iot_elevator.created_at',
                'ipms_property_company_user.real_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ipms_iot_elevator.id', 'desc');

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

export default PcElevatorListAction;
